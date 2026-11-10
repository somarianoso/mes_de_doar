// Gera os PNGs (1080 × 1350) e as mensagens de todos os posts a partir do mesmo
// renderizador usado no site. Uso: npm install && npm run exportar
import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { ROOT, startServer } from './servidor.mjs';

const OUT = join(ROOT, 'posts');
const server = await startServer(0);
const { port } = server.address();
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('Erro na página:', e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html`);
  await page.waitForFunction(() => window.MesDoar && window.MesDoar.posts.length > 0);

  await mkdir(OUT, { recursive: true });
  for (const name of await readdir(OUT)) if (name.endsWith('.png')) await unlink(join(OUT, name));

  const posts = await page.evaluate(() => window.MesDoar.posts.map((p, i) => ({ i, data: p.data, tema: p.tema, nome: window.MesDoar.fileName(p), whatsapp: p.whatsapp, legenda: p.legenda })));
  const md = ['# Mensagens do Mês do Doar · PoliSat', '', 'Gerado por `npm run exportar`. Edite os textos em `assets/js/posts.js`.', ''];
  for (const post of posts) {
    const dataUrl = await page.evaluate((i) => window.MesDoar.png(i), post.i);
    await writeFile(join(OUT, post.nome), Buffer.from(dataUrl.split(',')[1], 'base64'));
    console.log('✓', post.nome);
    const [y, m, d] = post.data.split('-');
    md.push(`## ${d}/${m}/${y} · ${post.tema}`, '', `![${post.tema}](${post.nome})`, '', '**WhatsApp**', '', '```', post.whatsapp, '```', '', '**Instagram**', '', '```', post.legenda, '```', '');
  }
  await writeFile(join(OUT, 'MENSAGENS.md'), md.join('\n'));
  console.log(`\n${posts.length} artes e posts/MENSAGENS.md gerados.`);
} finally {
  await browser.close();
  server.close();
}
