const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Get file size in bytes
function getFileSize(filePath) {
   const stats = fs.statSync(filePath);
   return stats.size;
}

// Convert bytes to KB
function bytesToKB(bytes) {
   return (bytes / 1024).toFixed(2);
}

// Create zip file
function createZip() {
   const output = fs.createWriteStream('js13k-submission.zip');
   const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
   });

   output.on('close', () => {
      const size = archive.pointer();
      console.log(`✅ Zip created successfully!`);
      console.log(`📦 Total size: ${bytesToKB(size)} KB`);

      // Check if under 13KB limit
      if (size <= 13 * 1024) {
         console.log(`🎉 Under 13KB limit! (${(13 * 1024 - size).toFixed(0)} bytes remaining)`);
      } else {
         console.log(`⚠️  Over 13KB limit! (${(size - 13 * 1024).toFixed(0)} bytes over)`);
      }
   });

   archive.on('error', (err) => {
      throw err;
   });

   archive.pipe(output);

   // Add files to zip
   archive.file('dist/index.html', { name: 'index.html' });
   archive.file('dist/game.js', { name: 'game.js' });

   // Add other assets in dist folder (excluding already added files)
   const distFiles = fs.readdirSync('dist');
   distFiles.forEach((file) => {
      if (!['index.html', 'game.js'].includes(file)) {
         archive.file(path.join('dist', file), { name: file });
      }
   });

   archive.finalize();
}

// Check if dist folder exists
if (!fs.existsSync('dist')) {
   console.log('❌ dist folder not found. Run "npm run build" first.');
   process.exit(1);
}

// Check if required files exist
const requiredFiles = ['dist/index.html', 'dist/game.js'];
for (const file of requiredFiles) {
   if (!fs.existsSync(file)) {
      console.log(`❌ ${file} not found. Run "npm run build" first.`);
      process.exit(1);
   }
}

console.log('📦 Creating JS13K submission zip...');
createZip();
