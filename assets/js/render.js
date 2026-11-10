/*
 * Renderizador das artes do Mês do Doar · PoliSat.
 *
 * Cada post é descrito por dados ({ template, fundo, cubesats, campos }) e desenhado
 * aqui num canvas 1080 × 1350 (feed do Instagram). O mesmo código gera a prévia,
 * as miniaturas, o editor e os PNGs exportados — não há arte "pintada à mão".
 *
 * Toda arte recebe, sempre: logo PoliSat (topo), logo Amigos da Poli, link de doação
 * e QR code (rodapé). Isso não é configurável pelos campos do editor de propósito.
 */
(function (global) {
  'use strict';

  const W = 1080;
  const H = 1350;
  const DONATION_URL = 'https://doa.re/RzAT';
  const DONATION_LABEL = 'doa.re/RzAT';
  const FONT = 'Poppins, "Segoe UI", Arial, sans-serif';

  // Paleta PoliSat: preto espacial, azul da logo, roxo/lilás e os contornos ciano/magenta.
  const C = {
    black: '#040409',
    frame: '#0b0710',
    white: '#ffffff',
    paper: '#f4f5f7',
    ink: '#101018',
    inkSoft: '#575b70',
    blue: '#13408f',
    blueMid: '#1d4fb3',
    blueBright: '#2f6bff',
    cyan: '#2fd8ff',
    magenta: '#d84bff',
    purple: '#a95fd0',
    purpleDeep: '#7d3db0',
    lilac: '#e2b0ff',
  };

  // Prefixo opcional dos arquivos (vazio = relativo à página).
  const ASSET_BASE = global.MES_DOAR_BASE ? String(global.MES_DOAR_BASE).replace(/\/?$/, '/') : '';
  const LOGOS = {
    polisat: ASSET_BASE + 'assets/logos/polisat-branco.svg',
    adp: ASSET_BASE + 'assets/logos/adp.svg',
  };

  // ---------------------------------------------------------------- templates

  const foto = (src) => ({ src, zoom: 1, x: 0, y: 0 });

  const TEMPLATES = {
    destaque: {
      nome: 'Destaque',
      descricao: 'Título grande contornado, subtítulo e texto curto.',
      campos: [
        { id: 'titulo', rotulo: 'Título contornado', tipo: 'textarea', linhas: 2, dica: 'Enter quebra a linha. Fica em maiúsculas.' },
        { id: 'subtitulo', rotulo: 'Subtítulo', tipo: 'text' },
        { id: 'texto', rotulo: 'Texto', tipo: 'textarea', linhas: 3 },
        { id: 'selo', rotulo: 'Selo (opcional)', tipo: 'text' },
      ],
      padrao: { titulo: 'MÊS DO\nDOAR', subtitulo: 'Sua doação faz a *diferença*', texto: 'Ajude o PoliSat a levar a engenharia espacial da Poli *mais longe*.', selo: '' },
    },
    numero: {
      nome: 'Número em destaque',
      descricao: 'Uma data, contagem ou número gigante em roxo.',
      campos: [
        { id: 'antes', rotulo: 'Frase acima', tipo: 'text' },
        { id: 'numero', rotulo: 'Número / data', tipo: 'text' },
        { id: 'depois', rotulo: 'Frase abaixo', tipo: 'text' },
        { id: 'texto', rotulo: 'Texto', tipo: 'textarea', linhas: 3 },
      ],
      padrao: { antes: 'Faltam', numero: '8 DIAS', depois: 'para o *Dia de Doar*', texto: 'Doe hoje e ajude o PoliSat a *decolar*.' },
    },
    lista: {
      nome: 'Lista (estilo cronograma)',
      descricao: 'Caixas brancas com etiqueta roxa, como o cronograma do PS.',
      campos: [
        { id: 'titulo', rotulo: 'Título contornado', tipo: 'textarea', linhas: 2 },
        { id: 'itens', rotulo: 'Itens', tipo: 'textarea', linhas: 5, dica: 'Um item por linha, no formato: texto | etiqueta (até 5).' },
        { id: 'rodape', rotulo: 'Frase final', tipo: 'text' },
      ],
      padrao: { titulo: 'COMO DOAR', itens: 'Acesse doa.re/RzAT | 1\nEscolha o valor | 2\nConclua a doação | 3', rodape: 'É *rapidinho*!' },
    },
    janela: {
      nome: 'Janela',
      descricao: 'Cartão branco com barra azul ■●▲, como o post de aprovados.',
      campos: [
        { id: 'titulo', rotulo: 'Título contornado', tipo: 'textarea', linhas: 2 },
        { id: 'texto', rotulo: 'Texto da janela', tipo: 'textarea', linhas: 4 },
        { id: 'rodape', rotulo: 'Frase final (roxa)', tipo: 'text' },
      ],
      padrao: { titulo: 'POR QUE\nDOAR?', texto: 'Porque é aqui que a engenharia *sai do papel*.', rodape: 'Faça parte disso!' },
    },
    foto: {
      nome: 'Foto polaroid',
      descricao: 'Foto em moldura preta com legenda grande.',
      campos: [
        { id: 'foto', rotulo: 'Foto', tipo: 'foto' },
        { id: 'legenda', rotulo: 'Legenda grande', tipo: 'text' },
        { id: 'sublegenda', rotulo: 'Linha de apoio', tipo: 'text' },
      ],
      padrao: { foto: foto('assets/fotos/equipe-mission-patch.jpg'), legenda: 'Somos o PoliSat', sublegenda: 'Estudantes da *Poli-USP* construindo satélites' },
    },
    mosaico: {
      nome: 'Mosaico de fotos',
      descricao: 'Até 4 fotos em faixa preta, como o post da LASC.',
      campos: [
        { id: 'titulo', rotulo: 'Título contornado', tipo: 'textarea', linhas: 2 },
        { id: 'fotos', rotulo: 'Fotos', tipo: 'fotos', max: 4 },
        { id: 'legenda', rotulo: 'Legenda', tipo: 'textarea', linhas: 2 },
      ],
      padrao: {
        titulo: 'BASTIDORES',
        fotos: [foto('assets/fotos/palco-lasc.jpg'), foto('assets/fotos/stand-lasc.jpg'), foto('assets/fotos/bancada.jpg'), foto('assets/fotos/lancamento.jpg')],
        legenda: 'Experiências que *sua doação* torna possíveis.',
      },
    },
  };

  const FUNDOS = {
    galaxia: 'Galáxia (preto com via láctea)',
    nebulosa: 'Nebulosa roxa e azul',
    profundo: 'Espaço profundo',
  };

  // ---------------------------------------------------------------- utilidades

  function hash(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function rng(seed) {
    let a = hash(seed);
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const font = (weight, size) => `${weight} ${Math.round(size)}px ${FONT}`;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function roundRect(ctx, x, y, w, h, r) {
    const rr = typeof r === 'number' ? [r, r, r, r] : r; // tl, tr, br, bl
    ctx.beginPath();
    ctx.moveTo(x + rr[0], y);
    ctx.lineTo(x + w - rr[1], y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr[1]);
    ctx.lineTo(x + w, y + h - rr[2]);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr[2], y + h);
    ctx.lineTo(x + rr[3], y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr[3]);
    ctx.lineTo(x, y + rr[0]);
    ctx.quadraticCurveTo(x, y, x + rr[0], y);
    ctx.closePath();
  }

  // ---------------------------------------------------------------- imagens

  const imageCache = new Map();

  function resolveSrc(src) {
    if (!src || /^(data:|blob:|https?:|file:|\/)/.test(src)) return src;
    return ASSET_BASE + src;
  }

  function loadImage(src) {
    const url = resolveSrc(src);
    if (!url) return Promise.resolve(null);
    if (!imageCache.has(url)) {
      imageCache.set(url, new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = () => { console.warn('Imagem não carregou:', url); resolve(null); };
        img.src = url;
      }));
    }
    return imageCache.get(url);
  }

  const loaded = new Map(); // url -> HTMLImageElement | null (já resolvidas)
  async function loadInto(src) {
    const url = resolveSrc(src);
    if (!url) return;
    if (!loaded.has(url)) loaded.set(url, await loadImage(src));
  }
  const imageFor = (src) => loaded.get(resolveSrc(src)) || null;

  // Poppins é carregada via FontFace (e não só por @font-face no CSS) para garantir que
  // o canvas só desenhe depois que a fonte estiver pronta, inclusive no navegador headless
  // usado pelo script de exportação. As faces adicionadas valem também para o CSS da página.
  const FONT_FILES = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold' };
  let fontsReady = null;
  function ensureFonts() {
    if (!fontsReady) {
      const canLoad = global.document && document.fonts && typeof global.FontFace === 'function';
      fontsReady = !canLoad ? Promise.resolve() : Promise.all(Object.entries(FONT_FILES).map(async ([weight, name]) => {
        try {
          const res = await fetch(ASSET_BASE + 'assets/fonts/Poppins-' + name + '.ttf');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const face = new FontFace('Poppins', await res.arrayBuffer(), { weight, display: 'swap' });
          await face.load();
          document.fonts.add(face);
        } catch (e) {
          console.warn('Fonte Poppins ' + weight + ' indisponível; usando fonte do sistema.', e);
        }
      }));
    }
    return fontsReady;
  }

  function photoSlots(post) {
    const campos = post.campos || {};
    const slots = [];
    if (post.template === 'foto' && campos.foto) slots.push(campos.foto);
    if (post.template === 'mosaico') (campos.fotos || []).forEach((s) => s && s.src && slots.push(s));
    return slots;
  }

  /** Carrega tudo de que o post precisa. Chame antes de render(). */
  async function prepare(post) {
    await Promise.all([
      ensureFonts(),
      loadInto(LOGOS.polisat),
      loadInto(LOGOS.adp),
      ...photoSlots(post).map((s) => loadInto(s.src)),
    ]);
  }

  // ---------------------------------------------------------------- QR code

  let qrCache = null;
  function qrMatrix() {
    if (qrCache) return qrCache;
    if (typeof global.qrcode !== 'function') return null;
    const qr = global.qrcode(0, 'M');
    qr.addData(DONATION_URL);
    qr.make();
    const n = qr.getModuleCount();
    qrCache = { n, dark: (r, c) => qr.isDark(r, c) };
    return qrCache;
  }

  function drawQR(ctx, x, y, size) {
    ctx.fillStyle = C.white;
    roundRect(ctx, x, y, size, size, 14);
    ctx.fill();
    const qr = qrMatrix();
    if (!qr) return;
    const quiet = 2;
    const cell = Math.floor(size / (qr.n + quiet * 2));
    const off = Math.round((size - cell * qr.n) / 2);
    ctx.fillStyle = C.ink;
    for (let r = 0; r < qr.n; r++) {
      for (let c = 0; c < qr.n; c++) {
        if (qr.dark(r, c)) ctx.fillRect(x + off + c * cell, y + off + r * cell, cell, cell);
      }
    }
  }

  // ---------------------------------------------------------------- texto

  // Texto "rico": *trecho* fica destacado (roxo/lilás). Quebra de linha manual com \n.
  function richWords(paragraph) {
    const words = [];
    let current = null;
    let hi = false;
    for (const part of paragraph.split(/(\*|\s+)/)) {
      if (!part) continue;
      if (part === '*') { hi = !hi; continue; }
      if (/^\s+$/.test(part)) { current = null; continue; }
      if (!current) { current = []; words.push(current); }
      current.push({ t: part, hi });
    }
    return words;
  }

  function layoutRich(ctx, text, size, weight, maxWidth, lineHeight) {
    ctx.font = font(weight, size);
    const space = ctx.measureText(' ').width;
    const lines = [];
    for (const paragraph of String(text || '').split('\n')) {
      const words = richWords(paragraph);
      let line = [];
      let width = 0;
      for (const word of words) {
        const ww = word.reduce((sum, s) => sum + ctx.measureText(s.t).width, 0);
        if (line.length && width + space + ww > maxWidth) { lines.push({ segs: line, width }); line = []; width = 0; }
        if (line.length) { line.push({ t: ' ', hi: line[line.length - 1].hi && word[0].hi }); width += space; }
        line.push(...word);
        width += ww;
      }
      lines.push({ segs: line, width });
    }
    const widest = Math.max(0, ...lines.map((l) => l.width));
    return { lines, size, weight, lineHeight, widest, height: lines.length * size * lineHeight };
  }

  /** Maior tamanho de fonte (entre max e min) em que o texto cabe em maxLines e maxWidth. */
  function fitRich(ctx, text, { max, min, weight = 700, maxWidth, maxLines = 3, lineHeight = 1.22 }) {
    let layout = null;
    for (let size = max; size >= min; size -= 2) {
      layout = layoutRich(ctx, text, size, weight, maxWidth, lineHeight);
      if (layout.lines.length <= maxLines && layout.widest <= maxWidth) return layout;
    }
    return layout;
  }

  function drawRich(ctx, layout, x, y, { align = 'center', color = C.white, hi = C.lilac, glow = null, shadow = true } = {}) {
    ctx.save();
    ctx.font = font(layout.weight, layout.size);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    layout.lines.forEach((line, i) => {
      const baseline = y + i * layout.size * layout.lineHeight + layout.size * 0.93;
      let cx = align === 'center' ? x - line.width / 2 : x;
      for (const seg of line.segs) {
        const w = ctx.measureText(seg.t).width;
        if (shadow) {
          ctx.fillStyle = 'rgba(0,0,10,.55)';
          ctx.fillText(seg.t, cx + 2, baseline + 3);
        }
        ctx.fillStyle = seg.hi ? hi : color;
        if (glow && seg.hi) { ctx.shadowColor = glow; ctx.shadowBlur = layout.size * 0.35; }
        ctx.fillText(seg.t, cx, baseline);
        ctx.shadowBlur = 0;
        cx += w;
      }
    });
    ctx.restore();
  }

  const titleLines = (text) => String(text || '').toUpperCase().split('\n').map((l) => l.trim()).filter(Boolean);

  function fitLines(ctx, lines, weight, max, min, maxWidth) {
    let size = max;
    for (; size > min; size -= 2) {
      ctx.font = font(weight, size);
      if (lines.every((l) => ctx.measureText(l).width <= maxWidth)) break;
    }
    return size;
  }

  /** Título no estilo "INSCRIÇÕES ABERTAS": azul PoliSat com contorno ciano e magenta. */
  function outlinedBlock(ctx, text, { max = 160, min = 64, maxWidth = 920 } = {}) {
    const lines = titleLines(text);
    if (!lines.length) return null;
    const size = fitLines(ctx, lines, 800, max, min, maxWidth);
    const lh = size * 1.0;
    return {
      height: lines.length * lh,
      draw(y) {
        ctx.save();
        ctx.font = font(800, size);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.lineJoin = 'round';
        lines.forEach((line, i) => {
          const by = y + i * lh + size * 0.86;
          const cx = W / 2;
          ctx.save();
          ctx.shadowColor = 'rgba(216,75,255,.65)';
          ctx.shadowBlur = size * 0.28;
          ctx.lineWidth = size * 0.085;
          ctx.strokeStyle = C.magenta;
          ctx.strokeText(line, cx + size * 0.028, by + size * 0.024);
          ctx.restore();
          ctx.lineWidth = size * 0.06;
          ctx.strokeStyle = C.cyan;
          ctx.strokeText(line, cx - size * 0.014, by - size * 0.012);
          const g = ctx.createLinearGradient(0, by - size * 0.75, 0, by);
          g.addColorStop(0, '#2a5fd0');
          g.addColorStop(1, C.blue);
          ctx.fillStyle = g;
          ctx.fillText(line, cx, by);
        });
        ctx.restore();
      },
    };
  }

  function richBlock(ctx, text, opts, drawOpts) {
    if (!String(text || '').trim()) return null;
    const layout = fitRich(ctx, text, opts);
    return { height: layout.height, draw: (y) => drawRich(ctx, layout, W / 2, y, drawOpts) };
  }

  /** Número gigante no estilo "18/10": roxo, borda ciano e sombra azul-escura. */
  function bigNumberBlock(ctx, text, { max = 270, min = 110, maxWidth = 940 } = {}) {
    const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return null;
    const size = fitLines(ctx, lines, 800, max, min, maxWidth);
    const lh = size * 1.02;
    // Folga extra: glifos como "/" e "%" passam da altura das maiúsculas.
    return {
      height: lines.length * lh + size * 0.12,
      draw(y) {
        ctx.save();
        ctx.font = font(800, size);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.lineJoin = 'round';
        lines.forEach((line, i) => {
          const by = y + i * lh + size * 0.94;
          ctx.save();
          ctx.shadowColor = 'rgba(169,95,208,.55)';
          ctx.shadowBlur = size * 0.3;
          ctx.lineWidth = size * 0.05;
          ctx.strokeStyle = '#0d1a4a';
          ctx.strokeText(line, W / 2 + size * 0.03, by + size * 0.03);
          ctx.restore();
          ctx.lineWidth = size * 0.035;
          ctx.strokeStyle = C.cyan;
          ctx.strokeText(line, W / 2 - size * 0.012, by - size * 0.012);
          const g = ctx.createLinearGradient(0, by - size * 0.75, 0, by);
          g.addColorStop(0, '#bb73e6');
          g.addColorStop(1, C.purple);
          ctx.fillStyle = g;
          ctx.fillText(line, W / 2, by);
        });
        ctx.restore();
      },
    };
  }

  function dividerBlock(ctx, width = 880) {
    return {
      height: 2,
      draw(y) {
        const g = ctx.createLinearGradient(W / 2 - width / 2, 0, W / 2 + width / 2, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.15, 'rgba(255,255,255,.55)');
        g.addColorStop(0.85, 'rgba(255,255,255,.55)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(W / 2 - width / 2, y, width, 2);
      },
    };
  }

  function pillBlock(ctx, text) {
    if (!String(text || '').trim()) return null;
    const size = 34;
    ctx.font = font(800, size);
    const w = Math.min(900, ctx.measureText(text).width + 80);
    const h = 72;
    return {
      height: h,
      draw(y) {
        ctx.save();
        const x = W / 2 - w / 2;
        ctx.shadowColor = 'rgba(169,95,208,.6)';
        ctx.shadowBlur = 30;
        const g = ctx.createLinearGradient(x, 0, x + w, 0);
        g.addColorStop(0, C.purpleDeep);
        g.addColorStop(1, C.purple);
        ctx.fillStyle = g;
        roundRect(ctx, x, y, w, h, h / 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = font(800, size);
        ctx.fillStyle = C.white;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, W / 2, y + h / 2 + 2, w - 40);
        ctx.restore();
      },
    };
  }

  const gap = (height) => ({ height, gap: true, draw() {} });

  /** Remove blocos vazios e espaços sobrando; devolve os blocos e a altura total. */
  function measure(blocks) {
    const items = [];
    for (const b of blocks) {
      if (!b) continue;
      if (b.gap && (!items.length || items[items.length - 1].gap)) continue;
      items.push(b);
    }
    while (items.length && items[items.length - 1].gap) items.pop();
    return { items, total: items.reduce((s, b) => s + b.height, 0) };
  }

  /** Desenha os blocos empilhados, centralizados verticalmente entre top e bottom. */
  function drawStack({ items, total }, top, bottom) {
    let y = top + Math.max(0, (bottom - top - total) / 2);
    for (const b of items) { b.draw(y); y += b.height; }
  }

  // ---------------------------------------------------------------- fundo

  function drawBackground(ctx, post) {
    const variant = FUNDOS[post.fundo] ? post.fundo : 'galaxia';
    const rand = rng((post.data || 'post') + variant);
    ctx.fillStyle = C.black;
    ctx.fillRect(0, 0, W, H);

    const glow = (x, y, r, color, alpha) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color.replace('A', alpha));
      g.addColorStop(1, color.replace('A', 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };

    if (variant === 'galaxia') {
      // Faixa diagonal suave de poeira estelar, como nas artes do PS.
      for (let i = 0; i < 70; i++) {
        const t = rand();
        const x = 1080 * (0.95 - t * 0.7) + (rand() - 0.5) * 260;
        const y = 1350 * t + (rand() - 0.5) * 200;
        glow(x, y, 90 + rand() * 190, 'rgba(150,160,200,A)', 0.035 + rand() * 0.04);
      }
      glow(640, 900, 380, 'rgba(70,60,160,A)', 0.18);
      glow(300, 350, 330, 'rgba(19,64,143,A)', 0.2);
    } else if (variant === 'nebulosa') {
      glow(820, 260, 560, 'rgba(125,61,176,A)', 0.42);
      glow(180, 760, 560, 'rgba(19,64,143,A)', 0.5);
      glow(760, 980, 420, 'rgba(216,75,255,A)', 0.16);
      glow(420, 420, 300, 'rgba(47,107,255,A)', 0.16);
      for (let i = 0; i < 30; i++) {
        glow(rand() * W, rand() * H, 80 + rand() * 160, 'rgba(180,140,255,A)', 0.025 + rand() * 0.03);
      }
    } else {
      glow(540, 600, 700, 'rgba(19,64,143,A)', 0.22);
      glow(900, 120, 380, 'rgba(125,61,176,A)', 0.16);
    }

    // Estrelas: muitas pequenas, algumas com brilho em cruz (como as artes da LASC).
    const tints = ['255,255,255', '214,228,255', '226,200,255', '170,230,255'];
    for (let i = 0; i < 900; i++) {
      const r = rand() < 0.88 ? 0.5 + rand() * 0.9 : 1.3 + rand() * 1.1;
      ctx.fillStyle = `rgba(${tints[(rand() * tints.length) | 0]},${0.35 + rand() * 0.6})`;
      ctx.beginPath();
      ctx.arc(rand() * W, rand() * H, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 16; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const s = 6 + rand() * 12;
      glow(x, y, s * 2.2, 'rgba(120,225,255,A)', 0.55);
      ctx.fillStyle = 'rgba(235,250,255,.95)';
      ctx.fillRect(x - s, y - 0.7, s * 2, 1.4);
      ctx.fillRect(x - 0.7, y - s, 1.4, s * 2);
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** CubeSat isométrico com painéis solares, inspirado nos satélites das artes do PS. */
  function drawCubeSat(ctx, x, y, e, angle) {
    const k = 0.866;
    const P = {
      t: [0, -e], r: [k * e, -0.5 * e], c: [0, 0], l: [-k * e, -0.5 * e],
      b: [0, e], rb: [k * e, 0.5 * e], lb: [-k * e, 0.5 * e],
    };
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const quad = (p0, p1, p2, p3) => { ctx.beginPath(); ctx.moveTo(...p0); ctx.lineTo(...p1); ctx.lineTo(...p2); ctx.lineTo(...p3); ctx.closePath(); };
    // Face com grade de células: p0→p1 (eixo u), p0→p3 (eixo v).
    const face = (p0, p1, p2, p3, base, cell, cols, rows) => {
      quad(p0, p1, p2, p3);
      ctx.fillStyle = base;
      ctx.fill();
      const pad = 0.08;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const u0 = pad + (i / cols) * (1 - 2 * pad) + 0.012;
          const u1 = pad + ((i + 1) / cols) * (1 - 2 * pad) - 0.012;
          const v0 = pad + (j / rows) * (1 - 2 * pad) + 0.012;
          const v1 = pad + ((j + 1) / rows) * (1 - 2 * pad) - 0.012;
          const at = (u, v) => { const a = lerp(p0, p1, u); const b = lerp(p3, p2, u); return lerp(a, b, v); };
          quad(at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1));
          ctx.fillStyle = cell;
          ctx.fill();
        }
      }
      quad(p0, p1, p2, p3);
      ctx.strokeStyle = 'rgba(200,214,240,.85)';
      ctx.lineWidth = e * 0.035;
      ctx.stroke();
    };

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.shadowColor = 'rgba(47,107,255,.45)';
    ctx.shadowBlur = e * 0.6;
    // Antenas
    ctx.strokeStyle = 'rgba(210,220,240,.8)';
    ctx.lineWidth = e * 0.025;
    ctx.beginPath();
    ctx.moveTo(...P.r); ctx.lineTo(P.r[0] + e * 1.1, P.r[1] - e * 0.55);
    ctx.moveTo(...P.lb); ctx.lineTo(P.lb[0] - e * 1.0, P.lb[1] + e * 0.5);
    ctx.stroke();
    ctx.shadowBlur = 0;
    face(P.l, P.c, P.b, P.lb, '#141c3a', '#1d3c8a', 2, 3);
    face(P.c, P.r, P.rb, P.b, '#18234a', '#2550a8', 2, 3);
    face(P.t, P.r, P.c, P.l, '#8a9cc4', '#a9b8d8', 2, 2);
    ctx.restore();
  }

  // ---------------------------------------------------------------- moldura fixa

  function drawHeader(ctx) {
    ctx.save();
    ctx.font = font(800, 40);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#b05cff';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#e8bcff';
    ctx.fillText('MÊS DO DOAR 2026', 80, 112);
    ctx.shadowBlur = 8;
    ctx.fillText('MÊS DO DOAR 2026', 80, 112);
    ctx.restore();
    const logo = imageFor(LOGOS.polisat);
    if (logo) ctx.drawImage(logo, 790, 50, 210, 210 * (372 / 705));
  }

  function drawFooter(ctx) {
    const x = 60, y = 1090, w = 960, h = 196, split = 700;
    ctx.save();
    ctx.shadowColor = 'rgba(169,95,208,.45)';
    ctx.shadowBlur = 40;
    ctx.fillStyle = C.paper;
    roundRect(ctx, x, y, w, h, 28);
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(ctx, x, y, w, h, 28);
    ctx.clip();
    const g = ctx.createLinearGradient(split, y, x + w, y + h);
    g.addColorStop(0, C.blue);
    g.addColorStop(1, '#0c2a63');
    ctx.fillStyle = g;
    ctx.fillRect(split, y, x + w - split, h);
    ctx.fillStyle = C.purple;
    ctx.fillRect(split, y, 8, h);
    ctx.restore();

    drawQR(ctx, x + 20, y + 20, h - 40);

    const tx = x + h + 6;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = C.purple;
    ctx.font = font(800, 23);
    ctx.fillText('DOE AGORA PELO LINK', tx, y + 60);
    ctx.fillStyle = C.blue;
    ctx.font = font(800, fitLines(ctx, [DONATION_LABEL], 800, 64, 40, split - tx - 24));
    ctx.fillText(DONATION_LABEL, tx, y + 132);
    ctx.fillStyle = C.inkSoft;
    ctx.font = font(600, 21);
    ctx.fillText('ou aponte a câmera para o QR code', tx, y + 168);

    const cx = split + (x + w - split) / 2 + 4;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,.82)';
    ctx.font = font(700, 17);
    ctx.fillText('EM PARCERIA COM', cx, y + 46);
    const adp = imageFor(LOGOS.adp);
    if (adp) {
      const lw = 236, lh = lw * (905 / 2047);
      ctx.drawImage(adp, cx - lw / 2, y + 66, lw, lh);
    }
    ctx.restore();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = font(700, 22);
    ctx.fillStyle = 'rgba(255,255,255,.78)';
    ctx.fillText('@polisat.usp   ·   Mês do Doar 2026   ·   Poli-USP', W / 2, 1327);
    ctx.restore();
  }

  // ---------------------------------------------------------------- fotos

  function drawPhoto(ctx, slot, rect, radius) {
    const img = slot && imageFor(slot.src);
    ctx.save();
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, radius);
    ctx.clip();
    let maxPan = { x: 0, y: 0 };
    if (img) {
      const zoom = clamp(Number(slot.zoom) || 1, 1, 4);
      const scale = Math.max(rect.w / img.width, rect.h / img.height) * zoom;
      const dw = img.width * scale, dh = img.height * scale;
      maxPan = { x: (dw - rect.w) / 2, y: (dh - rect.h) / 2 };
      const px = clamp(Number(slot.x) || 0, -1, 1) * maxPan.x;
      const py = clamp(Number(slot.y) || 0, -1, 1) * maxPan.y;
      ctx.drawImage(img, rect.x + (rect.w - dw) / 2 + px, rect.y + (rect.h - dh) / 2 + py, dw, dh);
    } else {
      const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
      g.addColorStop(0, '#1b1f45');
      g.addColorStop(1, '#3a1d5c');
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.font = font(700, 30);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Adicione uma foto', rect.x + rect.w / 2, rect.y + rect.h / 2);
    }
    ctx.restore();
    return maxPan;
  }

  // ---------------------------------------------------------------- layouts

  const TOP = 190;
  const BOTTOM = 1062;

  // Cada layout devolve uma lista de blocos {height, draw(y)} já medidos para a escala k.
  // render() reduz k até tudo caber entre TOP e BOTTOM, então textos longos nunca
  // invadem o cabeçalho nem o rodapé.
  const LAYOUTS = {
    destaque(ctx, f, k) {
      return [
        outlinedBlock(ctx, f.titulo, { max: 175 * k, min: 56, maxWidth: 880 }),
        gap(28 * k),
        richBlock(ctx, f.subtitulo, { max: 62 * k, min: 32, weight: 700, maxWidth: 900, maxLines: 2 }),
        gap(44 * k),
        dividerBlock(ctx),
        gap(44 * k),
        richBlock(ctx, f.texto, { max: 42 * k, min: 26, weight: 600, maxWidth: 860, maxLines: 5, lineHeight: 1.3 }),
        gap(48 * k),
        pillBlock(ctx, f.selo),
      ];
    },

    numero(ctx, f, k) {
      return [
        richBlock(ctx, f.antes, { max: 66 * k, min: 36, weight: 700, maxWidth: 900, maxLines: 2 }),
        gap(22 * k),
        bigNumberBlock(ctx, f.numero, { max: 270 * k, min: 100, maxWidth: 900 }),
        gap(8 * k),
        richBlock(ctx, f.depois, { max: 66 * k, min: 36, weight: 700, maxWidth: 900, maxLines: 2 }),
        gap(44 * k),
        dividerBlock(ctx),
        gap(44 * k),
        richBlock(ctx, f.texto, { max: 42 * k, min: 26, weight: 600, maxWidth: 860, maxLines: 5, lineHeight: 1.3 }),
      ];
    },

    lista(ctx, f, k) {
      const items = String(f.itens || '').split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 5)
        .map((l) => { const [texto, rotulo = ''] = l.split('|'); return { texto: texto.trim(), rotulo: rotulo.trim() }; });
      const rowGap = (items.length > 4 ? 20 : 28) * k;
      const rowH = (items.length > 4 ? 96 : items.length > 3 ? 108 : 120) * k;
      const rows = items.length && {
        height: items.length * rowH + (items.length - 1) * rowGap,
        draw(y) {
          const x0 = 84, x1 = 996, split = 650;
          items.forEach((item, i) => {
            const ry = y + i * (rowH + rowGap);
            const last = i === items.length - 1 && items.length > 2;
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,.45)';
            ctx.shadowBlur = 18;
            ctx.shadowOffsetY = 6;
            ctx.fillStyle = last ? C.purple : C.paper;
            roundRect(ctx, x0, ry, split - x0, rowH, [18, 0, 0, 18]);
            ctx.fill();
            ctx.fillStyle = last ? C.paper : C.purple;
            roundRect(ctx, split, ry, x1 - split, rowH, [0, 18, 18, 0]);
            ctx.fill();
            ctx.restore();
            const t = fitRich(ctx, item.texto, { max: Math.min(38, rowH * 0.36), min: 20, weight: 700, maxWidth: split - x0 - 44, maxLines: 2, lineHeight: 1.12 });
            drawRich(ctx, t, (x0 + split) / 2, ry + (rowH - t.height) / 2 - t.size * 0.04, { color: last ? C.white : C.ink, hi: last ? C.lilac : C.purple, shadow: false });
            const label = item.rotulo.toUpperCase();
            const ls = fitLines(ctx, [label], 800, Math.min(48, rowH * 0.44), 20, x1 - split - 40);
            ctx.save();
            ctx.font = font(800, ls);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = last ? C.purple : C.white;
            ctx.fillText(label, (split + x1) / 2, ry + rowH / 2 + ls * 0.06);
            ctx.restore();
          });
        },
      };
      return [
        outlinedBlock(ctx, f.titulo, { max: 130 * k, min: 56, maxWidth: 880 }),
        gap(48 * k),
        rows,
        gap(44 * k),
        richBlock(ctx, f.rodape, { max: 54 * k, min: 32, weight: 700, maxWidth: 900, maxLines: 2 }),
      ];
    },

    janela(ctx, f, k) {
      const x0 = 60, x1 = 1020, bar = 76;
      const body = String(f.texto || '').trim()
        ? fitRich(ctx, f.texto, { max: 48 * k, min: 26, weight: 700, maxWidth: x1 - x0 - 140, maxLines: 7, lineHeight: 1.28 })
        : null;
      const win = {
        height: bar + (body ? body.height : 0) + 110 * k,
        draw(y) {
          const h = this.height;
          ctx.save();
          ctx.shadowColor = 'rgba(47,107,255,.35)';
          ctx.shadowBlur = 40;
          ctx.fillStyle = C.paper;
          roundRect(ctx, x0, y, x1 - x0, h, 34);
          ctx.fill();
          ctx.restore();
          ctx.save();
          roundRect(ctx, x0, y, x1 - x0, h, 34);
          ctx.clip();
          ctx.fillStyle = C.blue;
          ctx.fillRect(x0, y, x1 - x0, bar);
          ctx.fillStyle = C.ink;
          ctx.fillRect(x0, y + bar, x1 - x0, 5);
          ctx.restore();
          // ■ ● ▲
          ctx.fillStyle = C.purple;
          const cy = y + bar / 2;
          ctx.fillRect(x0 + 54, cy - 13, 26, 26);
          ctx.beginPath(); ctx.arc(x0 + 108, cy, 13, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.moveTo(x0 + 136, cy + 13); ctx.lineTo(x0 + 150, cy - 13); ctx.lineTo(x0 + 164, cy + 13); ctx.closePath(); ctx.fill();
          if (body) drawRich(ctx, body, W / 2, y + bar + 55 * k, { color: C.ink, hi: C.purple, shadow: false });
        },
      };
      const foot = String(f.rodape || '').trim()
        && fitRich(ctx, f.rodape, { max: 76 * k, min: 40, weight: 800, maxWidth: 920, maxLines: 2, lineHeight: 1.1 });
      return [
        outlinedBlock(ctx, f.titulo, { max: 140 * k, min: 56, maxWidth: 880 }),
        gap(44 * k),
        win,
        gap(44 * k),
        foot && { height: foot.height, draw: (y) => drawRich(ctx, foot, W / 2, y, { color: '#c27ff0', hi: C.lilac, glow: 'rgba(169,95,208,.8)' }) },
      ];
    },

    foto(ctx, f, k, regions) {
      const x0 = 112, x1 = 968, pad = 34;
      const legend = String(f.legenda || '').trim()
        && fitRich(ctx, f.legenda, { max: 92 * k, min: 44, weight: 800, maxWidth: x1 - x0 - 2 * pad, maxLines: 2, lineHeight: 1.08 });
      const sub = String(f.sublegenda || '').trim()
        && fitRich(ctx, f.sublegenda, { max: 36 * k, min: 24, weight: 600, maxWidth: x1 - x0 - 2 * pad, maxLines: 2 });
      const textH = (legend ? legend.height : 0) + (sub ? sub.height + 14 : 0);
      const photoH = 600 * k;
      return [{
        height: pad + photoH + pad + textH + (textH ? pad : 0),
        draw(y) {
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,.6)';
          ctx.shadowBlur = 40;
          ctx.fillStyle = C.frame;
          ctx.fillRect(x0, y, x1 - x0, this.height);
          ctx.restore();
          const rect = { x: x0 + pad, y: y + pad, w: x1 - x0 - 2 * pad, h: photoH };
          regions.push({ campo: 'foto', indice: null, rect, maxPan: drawPhoto(ctx, f.foto, rect, 4) });
          const ty = rect.y + rect.h + pad - 4;
          if (legend) drawRich(ctx, legend, W / 2, ty, { color: C.white, hi: C.lilac });
          if (sub) drawRich(ctx, sub, W / 2, ty + (legend ? legend.height + 14 : 0), { color: '#d9dcef', hi: C.lilac, shadow: false });
        },
      }];
    },

    mosaico(ctx, f, k, regions) {
      const all = f.fotos || [];
      const slots = all.filter((s) => s && s.src);
      const n = Math.min(slots.length, 4);
      const cols = n >= 4 ? 2 : Math.max(1, n);
      const rowsN = n >= 4 ? 2 : 1;
      const g = 26;
      const cellW = (W - g * (cols + 1)) / cols;
      const cellH = (rowsN === 2 ? 300 : n === 1 ? 560 : 420) * k;
      const band = n && {
        height: rowsN * cellH + g * (rowsN + 1),
        draw(y) {
          ctx.fillStyle = C.frame;
          ctx.fillRect(0, y, W, this.height);
          slots.slice(0, n).forEach((slot, i) => {
            const c = i % cols, r = Math.floor(i / cols);
            const rect = { x: g + c * (cellW + g), y: y + g + r * (cellH + g), w: cellW, h: cellH };
            regions.push({ campo: 'fotos', indice: all.indexOf(slot), rect, maxPan: drawPhoto(ctx, slot, rect, 38) });
          });
        },
      };
      return [
        outlinedBlock(ctx, f.titulo, { max: 120 * k, min: 56, maxWidth: 880 }),
        gap(40 * k),
        band,
        gap(40 * k),
        richBlock(ctx, f.legenda, { max: 46 * k, min: 28, weight: 700, maxWidth: 900, maxLines: 2 }),
      ];
    },
  };

  // Posições dos CubeSats decorativos (meio cortados nas bordas, como nas artes do PS).
  const SATS = {
    destaque: [[40, 760, 62, -0.35], [1040, 470, 52, 0.4]],
    numero: [[46, 600, 64, -0.3], [1034, 660, 54, 0.35]],
    lista: [[1032, 230, 40, 0.3]],
    janela: [[1030, 250, 46, 0.35], [36, 1010, 42, -0.4]],
    foto: [[1030, 215, 44, 0.3], [52, 1030, 46, -0.35]],
    mosaico: [[1032, 220, 42, 0.35]],
  };

  /**
   * Desenha o post no contexto (deve ter 1080 × 1350). Chame prepare(post) antes.
   * Retorna as regiões de foto (para arrastar/reenquadrar no editor).
   */
  function render(ctx, post) {
    const template = TEMPLATES[post.template] ? post.template : 'destaque';
    const campos = Object.assign({}, TEMPLATES[template].padrao, post.campos || {});
    const regions = [];
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    drawBackground(ctx, post);
    if (post.cubesats !== false) SATS[template].forEach(([x, y, e, a]) => drawCubeSat(ctx, x, y, e, a));
    let stackResult = null;
    for (const k of [1, 0.93, 0.86, 0.8, 0.74, 0.68, 0.62]) {
      stackResult = measure(LAYOUTS[template](ctx, campos, k, regions));
      if (stackResult.total <= BOTTOM - TOP) break;
    }
    drawStack(stackResult, TOP, BOTTOM);
    drawHeader(ctx);
    drawFooter(ctx);
    ctx.restore();
    return { regions };
  }

  global.MesDoarRender = {
    W, H, DONATION_URL, DONATION_LABEL, TEMPLATES, FUNDOS, LOGOS,
    prepare, render, loadImage, ensureFonts,
  };
})(typeof window !== 'undefined' ? window : globalThis);
