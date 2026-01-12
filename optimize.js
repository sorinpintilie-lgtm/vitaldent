import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = './public';
const images = fs.readdirSync(publicDir).filter(file => file.endsWith('.jpg') || file.endsWith('.JPG'));

async function optimizeImage(file) {
  const inputPath = path.join(publicDir, file);
  const outputPath = path.join(publicDir, 'optimized_' + file);

  try {
    await sharp(inputPath)
      .resize(800, null, { withoutEnlargement: true }) // resize to max 800px width
      .jpeg({ quality: 80 }) // compress to 80% quality
      .toFile(outputPath);
    console.log(`Optimized ${file}`);
  } catch (err) {
    console.error(`Error optimizing ${file}:`, err);
  }
}

async function main() {
  for (const img of images) {
    await optimizeImage(img);
  }
  console.log('Done optimizing images');
}

main();