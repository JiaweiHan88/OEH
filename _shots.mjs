import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '_shots');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const url = 'file://' + path.join(__dirname, 'presentation.html');

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0' });
await page.evaluate(async () => {
  await document.fonts.ready;
  Reveal.configure({ transition: 'none', backgroundTransition: 'none' });
});
await new Promise((r) => setTimeout(r, 500));

const total = await page.evaluate(() => Reveal.getTotalSlides());
const revealInfo = await page.evaluate(() => {
  const rectOf = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const slidesEl = document.querySelector('.reveal .slides');
  const revealEl = document.querySelector('.reveal');
  const viewportEl = document.querySelector('.reveal-viewport');
  return {
    scale: Reveal.getScale ? Reveal.getScale() : '?',
    viewport: rectOf(viewportEl),
    reveal: rectOf(revealEl),
    slides: rectOf(slidesEl),
    slidesTransform: getComputedStyle(slidesEl).transform,
    slidesLeft: getComputedStyle(slidesEl).left,
    slidesWidth: getComputedStyle(slidesEl).width,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  };
});
console.log('reveal info:', JSON.stringify(revealInfo, null, 2));
console.log('total slides:', total);

const report = [];

for (let i = 0; i < total; i++) {
  await page.evaluate((n) => Reveal.slide(n), i);
  await new Promise((r) => setTimeout(r, 200));

  const info = await page.evaluate(() => {
    const current = Reveal.getCurrentSlide();
    const rect = current.getBoundingClientRect();
    const id = current.id || '(no id)';
    const scrollH = current.scrollHeight;
    const clientH = current.clientHeight;
    const overflow = Math.max(0, scrollH - 720);
    const h2 = current.querySelector('h2, h1');
    const h2Rect = h2 ? h2.getBoundingClientRect() : null;
    const cs = getComputedStyle(current);
    return {
      id, scrollH, clientH,
      rectLeft: Math.round(rect.left), rectRight: Math.round(rect.right),
      rectTop: Math.round(rect.top), rectBottom: Math.round(rect.bottom),
      overflow,
      h2Left: h2Rect ? Math.round(h2Rect.left) : null,
      h2Right: h2Rect ? Math.round(h2Rect.right) : null,
      csLeft: cs.left, csTop: cs.top, csTransform: cs.transform, csWidth: cs.width,
      classes: current.className,
    };
  });

  const fn = path.join(outDir, `${String(i).padStart(2, '0')}_${info.id}.png`);
  await page.screenshot({ path: fn, clip: { x: 0, y: 0, width: 1280, height: 720 } });
  const flag = info.overflow > 0 ? `  OVERFLOW:+${info.overflow}px` : '';
  console.log(`[${String(i).padStart(2)}] ${info.id.padEnd(16)} scrollH=${info.scrollH.toString().padStart(4)} top=${info.rectTop} → ${info.rectBottom}${flag}`);
  report.push({ idx: i, ...info });
}

fs.writeFileSync(path.join(outDir, '_report.json'), JSON.stringify(report, null, 2));
console.log(`\nwrote ${report.length} shots → ${outDir}`);
await browser.close();
