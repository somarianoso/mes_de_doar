/* Central de conteúdo do Mês do Doar: calendário, prévia, editor e mensagens. */
(() => {
  'use strict';

  const R = window.MesDoarRender;
  const D = window.MES_DO_DOAR;
  const $ = (sel, el = document) => el.querySelector(sel);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const WEEK_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const parseDate = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
  const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const ddmm = (key) => key.slice(8, 10) + '/' + key.slice(5, 7);
  const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const originals = new Map(D.posts.map((p) => [p.data, p]));
  const posts = D.posts.map(clone);
  const edited = new Set();
  let index = 0;

  // ------------------------------------------------------------ armazenamento local

  const store = (() => {
    const DB = 'mes-do-doar', STORE = 'posts';
    let dbPromise = null;
    const open = () => {
      if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
          if (!('indexedDB' in window)) { reject(new Error('IndexedDB indisponível')); return; }
          const req = indexedDB.open(DB, 1);
          req.onupgradeneeded = () => req.result.createObjectStore(STORE);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
          req.onblocked = () => reject(new Error('Armazenamento bloqueado'));
        });
      }
      return dbPromise;
    };
    const tx = async (mode, fn) => {
      const db = await open();
      return new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const result = fn(t.objectStore(STORE));
        t.oncomplete = () => resolve(result && 'result' in result ? result.result : undefined);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      });
    };
    return {
      async all() {
        const db = await open();
        return new Promise((resolve, reject) => {
          const out = {};
          const req = db.transaction(STORE).objectStore(STORE).openCursor();
          req.onsuccess = () => { const c = req.result; if (c) { out[c.key] = c.value; c.continue(); } else resolve(out); };
          req.onerror = () => reject(req.error);
        });
      },
      put: (key, value) => tx('readwrite', (s) => s.put(value, key)),
      del: (key) => tx('readwrite', (s) => s.delete(key)),
    };
  })();

  const EDITABLE = ['template', 'fundo', 'cubesats', 'campos', 'whatsapp', 'legenda'];
  const pickEditable = (p) => Object.fromEntries(EDITABLE.map((k) => [k, p[k]]));

  // ------------------------------------------------------------ toast e cópia

  let toastTimer = 0;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  async function copyText(text, okMsg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      if (!ok) { toast('Não foi possível copiar. Selecione o texto e copie manualmente.'); return; }
    }
    toast(okMsg);
  }

  // ------------------------------------------------------------ renderização

  const canvas = $('#preview');
  const ctx = canvas.getContext('2d');
  let regions = [];
  let renderToken = 0;
  let renderQueued = false;

  async function renderPreview() {
    const post = posts[index];
    const token = ++renderToken;
    await R.prepare(post);
    if (token !== renderToken) return;
    regions = R.render(ctx, post).regions;
  }

  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; renderPreview(); });
  }

  // Miniaturas: desenha num canvas de trabalho em tamanho real e reduz.
  const work = document.createElement('canvas');
  work.width = R.W;
  work.height = R.H;
  const workCtx = work.getContext('2d');
  let thumbChain = Promise.resolve();
  const cards = [];

  function renderThumb(i) {
    thumbChain = thumbChain.then(async () => {
      await R.prepare(posts[i]);
      R.render(workCtx, posts[i]);
      const t = cards[i].thumb;
      const tctx = t.getContext('2d');
      tctx.imageSmoothingQuality = 'high';
      tctx.drawImage(work, 0, 0, t.width, t.height);
      await new Promise((r) => setTimeout(r, 0));
    }).catch((e) => console.error('Falha na miniatura', e));
    return thumbChain;
  }

  const thumbTimers = new Map();
  function scheduleThumb(i) {
    clearTimeout(thumbTimers.get(i));
    thumbTimers.set(i, setTimeout(() => renderThumb(i), 500));
  }

  // ------------------------------------------------------------ calendário

  const todayKey = keyOf(new Date());

  function buildStrip() {
    const strip = $('#strip');
    posts.forEach((post, i) => {
      const d = parseDate(post.data);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'day';
      card.setAttribute('role', 'option');
      card.innerHTML = `<canvas width="216" height="270"></canvas>
        <span class="day-date">${ddmm(post.data)}<small>${WEEK_SHORT[d.getDay()]}</small></span>
        <span class="day-theme"></span>`;
      card.querySelector('.day-theme').textContent = post.tema;
      if (post.data === todayKey) card.insertAdjacentHTML('beforeend', '<span class="badge today">Hoje</span>');
      card.addEventListener('click', () => select(i));
      strip.appendChild(card);
      cards.push({ el: card, thumb: card.querySelector('canvas') });
    });
    $('#calendar-count').textContent = `${posts.length} posts · dias úteis`;
  }

  function markEdited(i) {
    const card = cards[i].el;
    let badge = card.querySelector('.badge.edited');
    if (edited.has(posts[i].data)) {
      if (!badge) card.insertAdjacentHTML('beforeend', '<span class="badge edited">Editado</span>');
    } else if (badge) badge.remove();
  }

  function updateCountdown() {
    const today = parseDate(todayKey);
    const start = parseDate(D.inicio);
    const end = parseDate(D.fim);
    const days = Math.round((end - today) / 86400000);
    const total = Math.round((end - start) / 86400000);
    const elapsed = clamp(Math.round((today - start) / 86400000), 0, total);
    let label, value, caption;
    if (today < start) { label = 'Começa em'; value = `${Math.round((start - today) / 86400000)} dias`; caption = `abertura em ${ddmm(D.inicio)}`; }
    else if (days > 1) { label = 'Faltam'; value = `${days} dias`; caption = 'para o Dia de Doar (01/12)'; }
    else if (days === 1) { label = 'É amanhã'; value = '01/12'; caption = 'Dia de Doar'; }
    else if (days === 0) { label = 'Hoje é'; value = 'Dia de Doar'; caption = 'último dia da campanha'; }
    else { label = 'Campanha'; value = 'encerrada'; caption = 'obrigado a todos que doaram!'; }
    $('#countdown-label').textContent = label;
    $('#countdown-value').textContent = value;
    $('#countdown-caption').textContent = caption;
    $('#progress-bar').style.width = `${(elapsed / total) * 100}%`;
  }

  // ------------------------------------------------------------ seleção

  function select(i, { scroll = true } = {}) {
    index = clamp(i, 0, posts.length - 1);
    const post = posts[index];
    cards.forEach((c, j) => c.el.setAttribute('aria-selected', String(j === index)));
    if (scroll) cards[index].el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    const d = parseDate(post.data);
    $('#post-theme').textContent = post.tema;
    $('#post-date').textContent = `${WEEKDAYS[d.getDay()].replace(/^./, (c) => c.toUpperCase())}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
    $('#prev').disabled = index === 0;
    $('#next').disabled = index === posts.length - 1;
    $('#whatsapp-text').value = post.whatsapp;
    $('#caption-text').value = post.legenda;
    updateWhatsappLink();
    buildEditor();
    setSaveState(edited.has(post.data) ? 'Edição salva neste navegador' : 'Sem alterações', edited.has(post.data));
    if (history.replaceState) history.replaceState(null, '', '#' + post.data);
    renderPreview();
  }

  // ------------------------------------------------------------ salvar

  let saveTimer = 0;
  function setSaveState(text, ok = false) {
    const el = $('#save-state');
    el.textContent = text;
    el.classList.toggle('ok', ok);
  }

  function changed({ render = true } = {}) {
    const i = index;
    const post = posts[i];
    if (render) { scheduleRender(); scheduleThumb(i); }
    setSaveState('Salvando…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await store.put(post.data, pickEditable(post));
        edited.add(post.data);
        markEdited(i);
        if (i === index) {
          const t = new Date();
          setSaveState(`Salvo neste navegador às ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`, true);
        }
      } catch (e) {
        console.error(e);
        setSaveState('Não foi possível salvar neste navegador — baixe a imagem para não perder.');
      }
    }, 450);
  }

  async function restore() {
    const post = posts[index];
    if (!confirm(`Restaurar o post de ${ddmm(post.data)} para a versão original? As alterações deste post serão perdidas.`)) return;
    clearTimeout(saveTimer);
    try { await store.del(post.data); } catch (e) { console.error(e); }
    posts[index] = clone(originals.get(post.data));
    edited.delete(post.data);
    markEdited(index);
    renderThumb(index);
    select(index, { scroll: false });
    toast('Post restaurado para a versão original.');
  }

  // ------------------------------------------------------------ editor

  function fillSelect(sel, entries) {
    sel.replaceChildren(...entries.map(([value, label]) => new Option(label, value)));
  }

  function buildEditor() {
    const post = posts[index];
    const tpl = R.TEMPLATES[post.template];
    $('#template').value = post.template;
    $('#background').value = post.fundo;
    $('#cubesats').checked = post.cubesats !== false;
    $('#template-desc').textContent = tpl.descricao;
    const box = $('#fields');
    box.replaceChildren();
    for (const campo of tpl.campos) {
      if (campo.tipo === 'foto') box.appendChild(photoControl(campo.rotulo, () => post.campos.foto, (s) => { post.campos.foto = s; }, false));
      else if (campo.tipo === 'fotos') {
        if (!Array.isArray(post.campos.fotos)) post.campos.fotos = [];
        for (let k = 0; k < (campo.max || 4); k++) {
          box.appendChild(photoControl(`Foto ${k + 1}`, () => post.campos.fotos[k], (s) => { post.campos.fotos[k] = s; }, true));
        }
      } else box.appendChild(textControl(post, campo));
    }
    updateStageHint();
  }

  function textControl(post, campo) {
    const label = document.createElement('label');
    label.className = 'field';
    label.innerHTML = '<span></span>';
    label.firstChild.textContent = campo.rotulo;
    const input = campo.tipo === 'textarea' ? document.createElement('textarea') : document.createElement('input');
    if (campo.tipo === 'textarea') input.rows = campo.linhas || 3;
    else input.type = 'text';
    input.value = post.campos[campo.id] ?? '';
    input.addEventListener('input', () => { post.campos[campo.id] = input.value; changed(); });
    label.appendChild(input);
    if (campo.dica) { const small = document.createElement('small'); small.textContent = campo.dica; label.appendChild(small); }
    return label;
  }

  const UPLOAD = '__upload__';

  function photoControl(title, get, set, optional) {
    const wrap = document.createElement('div');
    wrap.className = 'photo';
    wrap.innerHTML = `<div class="photo-title"><span></span><span class="photo-name"></span></div>
      <div class="photo-row"><select aria-label="Escolher foto"></select>
      <label class="btn btn-ghost small photo-upload">Enviar foto<input type="file" accept="image/*"></label></div>
      <div class="photo-zoom"><span>Zoom</span><input type="range" min="100" max="300" step="1"><span class="zoom-value"></span></div>`;
    wrap.querySelector('.photo-title span').textContent = title;
    const select = wrap.querySelector('select');
    const file = wrap.querySelector('input[type=file]');
    const zoom = wrap.querySelector('input[type=range]');
    const zoomValue = wrap.querySelector('.zoom-value');

    const sync = () => {
      const slot = get();
      const entries = (optional ? [['', '— sem foto —']] : []).concat(D.fotos.map((f) => [f.src, f.nome]));
      if (slot && slot.src && slot.src.startsWith('data:')) entries.push([UPLOAD, 'Foto enviada']);
      fillSelect(select, entries);
      select.value = slot && slot.src ? (slot.src.startsWith('data:') ? UPLOAD : slot.src) : '';
      zoom.disabled = !(slot && slot.src);
      zoom.value = Math.round(((slot && slot.zoom) || 1) * 100);
      zoomValue.textContent = zoom.value + '%';
    };
    wrap.syncZoom = sync;
    sync();

    select.addEventListener('change', () => {
      if (select.value === UPLOAD) return;
      set(select.value ? { src: select.value, zoom: 1, x: 0, y: 0 } : null);
      sync();
      changed();
    });
    zoom.addEventListener('input', () => {
      const slot = get();
      if (!slot) return;
      slot.zoom = Number(zoom.value) / 100;
      zoomValue.textContent = zoom.value + '%';
      changed();
    });
    file.addEventListener('change', async () => {
      const f = file.files[0];
      file.value = '';
      if (!f) return;
      try {
        set({ src: await downscale(f), zoom: 1, x: 0, y: 0 });
        sync();
        changed();
        toast('Foto aplicada. Arraste na prévia para reenquadrar.');
      } catch (e) {
        console.error(e);
        toast('Não foi possível abrir essa imagem.');
      }
    });
    return wrap;
  }

  /** Reduz a foto enviada (máx. 1600 px) para caber no armazenamento do navegador. */
  async function downscale(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = () => reject(new Error('imagem inválida'));
        im.src = url;
      });
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.88);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function switchTemplate(id) {
    const post = posts[index];
    const tpl = R.TEMPLATES[id];
    const next = clone(tpl.padrao);
    for (const campo of tpl.campos) {
      const old = post.campos[campo.id];
      const compatible = campo.tipo === 'foto' ? old && typeof old === 'object' && !Array.isArray(old)
        : campo.tipo === 'fotos' ? Array.isArray(old)
          : typeof old === 'string';
      if (compatible) next[campo.id] = old;
    }
    post.template = id;
    post.campos = next;
    buildEditor();
    changed();
  }

  function updateStageHint() {
    const hasPhotos = ['foto', 'mosaico'].includes(posts[index].template);
    $('#stage-hint').textContent = hasPhotos
      ? 'Arraste uma foto na prévia para reenquadrar · zoom pela roda do mouse ou em Editar arte'
      : '1080 × 1350 · formato de post do Instagram';
  }

  // ------------------------------------------------------------ arrastar fotos na prévia

  let drag = null;
  const toCanvas = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  };
  const hit = (pt) => regions.find((g) => pt.x >= g.rect.x && pt.x <= g.rect.x + g.rect.w && pt.y >= g.rect.y && pt.y <= g.rect.y + g.rect.h);
  const slotOf = (g) => (g.campo === 'foto' ? posts[index].campos.foto : posts[index].campos.fotos[g.indice]);

  canvas.addEventListener('pointerdown', (e) => {
    const g = hit(toCanvas(e));
    const slot = g && slotOf(g);
    if (!slot) return;
    drag = { g, slot, start: toCanvas(e), x: Number(slot.x) || 0, y: Number(slot.y) || 0, moved: false };
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = 'grabbing';
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    const pt = toCanvas(e);
    if (!drag) { canvas.style.cursor = hit(pt) ? 'grab' : 'default'; return; }
    const { g, slot } = drag;
    if (g.maxPan.x) slot.x = clamp(drag.x + (pt.x - drag.start.x) / g.maxPan.x, -1, 1);
    if (g.maxPan.y) slot.y = clamp(drag.y + (pt.y - drag.start.y) / g.maxPan.y, -1, 1);
    drag.moved = true;
    scheduleRender();
  });
  const endDrag = () => {
    if (drag && drag.moved) changed();
    else if (drag && !drag.g.maxPan.x && !drag.g.maxPan.y) toast('Aumente o zoom da foto para poder reenquadrar nesse sentido.');
    drag = null;
    canvas.style.cursor = 'default';
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('wheel', (e) => {
    const g = hit(toCanvas(e));
    const slot = g && slotOf(g);
    if (!slot) return;
    e.preventDefault();
    slot.zoom = clamp((Number(slot.zoom) || 1) - e.deltaY * 0.0015, 1, 3);
    document.querySelectorAll('.photo').forEach((el) => el.syncZoom && el.syncZoom());
    changed();
  }, { passive: false });

  // ------------------------------------------------------------ mensagens e download

  function updateWhatsappLink() {
    $('#open-whatsapp').href = 'https://wa.me/?text=' + encodeURIComponent(posts[index].whatsapp);
  }

  const fileName = (post) => `${post.data}-${slug(post.tema)}.png`;

  function canvasBlob() {
    return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar PNG'))), 'image/png'));
  }

  async function download() {
    try {
      await renderPreview();
      const blob = await canvasBlob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName(posts[index]);
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (e) {
      console.error(e);
      toast('Não foi possível gerar a imagem. Abra o site por um servidor (não direto do arquivo).');
    }
  }

  async function share() {
    try {
      await renderPreview();
      const post = posts[index];
      const file = new File([await canvasBlob()], fileName(post), { type: 'image/png' });
      await navigator.share({ files: [file], text: post.whatsapp });
    } catch (e) {
      if (e.name !== 'AbortError') { console.error(e); toast('Não foi possível compartilhar. Baixe a imagem e copie a mensagem.'); }
    }
  }

  // ------------------------------------------------------------ eventos

  function bind() {
    fillSelect($('#template'), Object.entries(R.TEMPLATES).map(([id, t]) => [id, t.nome]));
    fillSelect($('#background'), Object.entries(R.FUNDOS));
    $('#template').addEventListener('change', (e) => switchTemplate(e.target.value));
    $('#background').addEventListener('change', (e) => { posts[index].fundo = e.target.value; changed(); });
    $('#cubesats').addEventListener('change', (e) => { posts[index].cubesats = e.target.checked; changed(); });
    $('#restore').addEventListener('click', restore);

    $('#whatsapp-text').addEventListener('input', (e) => { posts[index].whatsapp = e.target.value; updateWhatsappLink(); changed({ render: false }); });
    $('#caption-text').addEventListener('input', (e) => { posts[index].legenda = e.target.value; changed({ render: false }); });
    $('#copy-whatsapp').addEventListener('click', () => copyText(posts[index].whatsapp, 'Mensagem copiada! Cole no WhatsApp.'));
    $('#copy-caption').addEventListener('click', () => copyText(posts[index].legenda, 'Legenda copiada!'));
    $('#copy-link').addEventListener('click', () => copyText(D.link, 'Link de doação copiado!'));

    $('#download').addEventListener('click', download);
    const probe = typeof File === 'function' && new File([''], 'x.png', { type: 'image/png' });
    if (navigator.canShare && probe && navigator.canShare({ files: [probe] })) {
      $('#share').hidden = false;
      $('#share').addEventListener('click', share);
    }

    $('#prev').addEventListener('click', () => select(index - 1));
    $('#next').addEventListener('click', () => select(index + 1));
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowLeft') select(index - 1);
      if (e.key === 'ArrowRight') select(index + 1);
    });

    document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => { t.classList.toggle('active', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
      document.querySelectorAll('.tab-body').forEach((b) => { b.hidden = b.dataset.body !== tab.dataset.tab; });
    }));
  }

  function initialIndex() {
    const fromHash = posts.findIndex((p) => '#' + p.data === location.hash);
    if (fromHash >= 0) return fromHash;
    const today = posts.findIndex((p) => p.data >= todayKey);
    return today >= 0 ? today : posts.length - 1;
  }

  async function init() {
    bind();
    buildStrip();
    updateCountdown();
    try {
      const saved = await store.all();
      posts.forEach((p, i) => {
        const s = saved[p.data];
        if (!s || !R.TEMPLATES[s.template]) return;
        Object.assign(p, s);
        edited.add(p.data);
        markEdited(i);
      });
    } catch (e) {
      console.warn('Edições salvas indisponíveis:', e);
    }
    select(initialIndex());
    await R.ensureFonts();
    renderPreview();
    for (let i = 0; i < posts.length; i++) renderThumb(i);
  }

  // Usado por scripts/exportar_posts.mjs para gerar os PNGs da pasta posts/.
  window.MesDoar = {
    posts,
    fileName,
    async png(i) {
      const c = document.createElement('canvas');
      c.width = R.W;
      c.height = R.H;
      await R.prepare(posts[i]);
      R.render(c.getContext('2d'), posts[i]);
      return c.toDataURL('image/png');
    },
  };

  init();
})();
