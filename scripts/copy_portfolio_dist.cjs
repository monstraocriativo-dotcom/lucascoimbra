const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      if (childItemName === '.git' || childItemName === 'node_modules' || childItemName === 'dist' || childItemName.endsWith('.bak') || childItemName.endsWith('.psd') || childItemName.endsWith('.aep') || childItemName.endsWith('.mov')) return;
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    // Se o arquivo destino ja existe e tem o mesmo tamanho, nao precisa re-copiar
    if (fs.existsSync(dest)) {
      const destStat = fs.statSync(dest);
      if (destStat.size === stats.size) return;
    }
    const destParent = path.dirname(dest);
    if (!fs.existsSync(destParent)) {
      fs.mkdirSync(destParent, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

console.log('--- COPIANDO ATIVOS DO PORTFOLIO PARA DIST ---');

// 1. Copiar subpastas de portfolio
const portfolioDir = path.join(rootDir, 'portfolio');
const distPortfolioDir = path.join(distDir, 'portfolio');
if (fs.existsSync(portfolioDir)) {
  fs.readdirSync(portfolioDir).forEach((sub) => {
    const subPath = path.join(portfolioDir, sub);
    if (fs.statSync(subPath).isDirectory()) {
      copyRecursiveSync(subPath, path.join(distPortfolioDir, sub));
    }
  });
  console.log('Pastas do portfolio copiadas para dist/portfolio!');
}

// 2. Copiar assets/vendor se existir
const vendorDir = path.join(rootDir, 'assets', 'vendor');
const distVendorDir = path.join(distDir, 'assets', 'vendor');
if (fs.existsSync(vendorDir)) {
  copyRecursiveSync(vendorDir, distVendorDir);
  console.log('assets/vendor copiado para dist/assets/vendor!');
}

// 3. Copiar videos/posters essenciais da raiz se referenciados
const rootMedia = ['1 upscale.mp4', 'hero-poster.webp'];
rootMedia.forEach((m) => {
  const p = path.join(rootDir, m);
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(distDir, m));
  }
});

console.log('Ativos copiados com sucesso para dist!');
