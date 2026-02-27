/**
 * Script to convert SVG icons to PNG format
 * Requires: sharp package
 * Run: node scripts/convert-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Error: sharp package is required.');
  console.log('📦 Please install it by running: npm install --save-dev sharp');
  process.exit(1);
}

const iconConfigs = [
  {
    svg: 'assets/images/icon-note.svg',
    png: 'assets/images/icon.png',
    size: 1024
  },
  {
    svg: 'assets/images/adaptive-icon-note.svg',
    png: 'assets/images/adaptive-icon.png',
    size: 1024
  },
  {
    svg: 'assets/images/notification-icon-note.svg',
    png: 'assets/images/notification-icon.png',
    size: 96
  },
  {
    svg: 'assets/images/favicon-note.svg',
    png: 'assets/images/favicon.png',
    size: 32
  },
  {
    svg: 'assets/images/splash-icon-note.svg',
    png: 'assets/images/splash-icon.png',
    size: 400
  }
];

async function convertIcons() {
  console.log('🎨 Converting SVG icons to PNG...\n');

  for (const config of iconConfigs) {
    const svgPath = path.join(__dirname, '..', config.svg);
    const pngPath = path.join(__dirname, '..', config.png);

    if (!fs.existsSync(svgPath)) {
      console.log(`⚠️  Skipping ${config.svg} - file not found`);
      continue;
    }

    try {
      await sharp(svgPath)
        .resize(config.size, config.size)
        .png()
        .toFile(pngPath);
      
      console.log(`✅ Converted: ${config.svg} → ${config.png} (${config.size}x${config.size})`);
    } catch (error) {
      console.error(`❌ Error converting ${config.svg}:`, error.message);
    }
  }

  console.log('\n✨ Icon conversion complete!');
}

convertIcons().catch(console.error);

