const fs = require('fs');
const path = require('path');

const vendorDir = path.join(__dirname, '..', 'public', 'vendor');

const assets = {
  'bootstrap/dist/css/bootstrap.min.css': 'css/bootstrap.min.css',
  'bootstrap/dist/js/bootstrap.bundle.min.js': 'js/bootstrap.bundle.min.js',
  'jquery/dist/jquery.min.js': 'js/jquery.min.js'
};

console.log('Copying vendor assets...');

for (const [src, dest] of Object.entries(assets)) {
  const sourcePath = path.join(__dirname, '..', 'node_modules', src);
  const destPath = path.join(vendorDir, dest);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(sourcePath, destPath);
  console.log(`  - Copied ${src} to ${path.relative(path.join(__dirname, '..'), destPath)}`);
}

console.log("Vendor assets copied successfully.");