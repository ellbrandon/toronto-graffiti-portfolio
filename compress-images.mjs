import sharp from 'sharp';
import { readdir, stat, writeFile, readFile } from 'fs/promises';
import { join } from 'path';

const MAX_WIDTH = 1600;
const QUALITY   = 82;

const FOLDERS = [
    'src/assets/pics',
    'src/assets/places',
];

async function compressImage(filePath) {
    const before = (await stat(filePath)).size;

    // Read entire file into memory first (avoids file-lock issues)
    const inputBuf = await readFile(filePath);
    const meta = await sharp(inputBuf).metadata();

    let pipeline = sharp(inputBuf);
    if (meta.width > MAX_WIDTH) pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    pipeline = pipeline.webp({ quality: QUALITY });

    const outBuf = await pipeline.toBuffer();

    // Only overwrite if we actually made it smaller
    if (outBuf.length < inputBuf.length) {
        await writeFile(filePath, outBuf);
        const pct = Math.round((1 - outBuf.length / before) * 100);
        const kb  = n => (n / 1024).toFixed(0).padStart(6);
        console.log(`  ▼ ${String(pct + '%').padEnd(4)}  ${kb(before)} → ${kb(outBuf.length)} KB   ${filePath}`);
    } else {
        const kb = n => (n / 1024).toFixed(0).padStart(6);
        console.log(`  ─ skip  ${kb(before)} KB (already optimal)   ${filePath}`);
    }
}

async function processFolder(folder) {
    let files;
    try {
        files = await readdir(folder);
    } catch {
        console.log(`  Skipping ${folder} (not found)`);
        return;
    }
    const webps = files.filter(f => f.toLowerCase().endsWith('.webp'));
    console.log(`\n${folder}  (${webps.length} files)`);
    for (const file of webps) {
        await compressImage(join(folder, file));
    }
}

for (const folder of FOLDERS) {
    await processFolder(folder);
}
console.log('\nDone. Run `npm run build` to bundle the compressed images.');
