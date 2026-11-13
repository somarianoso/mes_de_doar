// Grava o stories animado "Batemos a meta!" em MP4 (1080 × 1920, 30 fps) e um PNG do quadro final.
// Uso: npm install && npm run exportar:story
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import ffmpegPath from 'ffmpeg-static';
import { ROOT, startServer } from './servidor.mjs';

const FPS = 30;
const NOME = '2026-11-13-batemos-a-meta-stories';
const MP4 = join(ROOT, 'posts', `${NOME}.mp4`);
const PNG = join(ROOT, 'posts', `${NOME}.png`);

const server = await startServer(0);
const { port } = server.address();
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('Erro na página:', e.message));
  await page.goto(`http://127.0.0.1:${port}/stories/batemos-a-meta.html?export`);
  await page.waitForFunction(() => window.Story);
  await page.evaluate(() => window.Story.ready);
  const D = await page.evaluate(() => window.Story.D);
  const total = Math.round(D * FPS);

  const ff = spawn(ffmpegPath, [
    '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', MP4,
  ], { stdio: ['pipe', 'ignore', 'inherit'] });
  const done = new Promise((ok, fail) => ff.on('close', (c) => (c === 0 ? ok() : fail(new Error(`ffmpeg saiu com ${c}`)))));

  for (let i = 0; i < total; i++) {
    const data = await page.evaluate((t) => { window.Story.frame(t); return window.Story.canvas.toDataURL('image/jpeg', 0.95); }, i / FPS);
    if (!ff.stdin.write(Buffer.from(data.split(',')[1], 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % FPS === 0) process.stdout.write(`\r${i}/${total} quadros`);
  }
  ff.stdin.end();
  await done;
  console.log(`\r✓ ${MP4}`);

  const still = await page.evaluate((t) => { window.Story.frame(t); return window.Story.canvas.toDataURL('image/png'); }, 5.2);
  await writeFile(PNG, Buffer.from(still.split(',')[1], 'base64'));
  console.log(`✓ ${PNG}`);
} finally {
  await browser.close();
  server.close();
}
