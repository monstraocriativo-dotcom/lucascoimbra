const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

const TARGET_FOLDERS = [
  path.join(__dirname, '..', 'portfolio', 'sobral'),
  path.join(__dirname, '..', 'portfolio', 'sobral 2024'),
  path.join(__dirname, '..', 'portfolio', 'sobral 2025'),
  path.join(__dirname, '..', 'portfolio', 'Casapatri')
];

async function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const dirent of list) {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (dirent.name === 'node_modules' || dirent.name === '.git' || dirent.name === 'dist') continue;
      results = results.concat(await getFiles(fullPath));
    } else if (dirent.isFile()) {
      if (/\.(png|PNG)$/.test(dirent.name)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function convertFile(pngPath) {
  const webpPath = pngPath.replace(/\.(png|PNG)$/, '.webp');
  try {
    const origStat = fs.statSync(pngPath);
    await sharp(pngPath)
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(webpPath);
    
    const newStat = fs.statSync(webpPath);
    fs.unlinkSync(pngPath);
    return { origSize: origStat.size, newSize: newStat.size };
  } catch (err) {
    console.error(`Erro ao converter ${pngPath}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('--- INICIANDO OTIMIZACAO DE MIDIAS (PNG -> WEBP) ---');
  let totalOrigBytes = 0;
  let totalNewBytes = 0;
  let convertedCount = 0;

  for (const folder of TARGET_FOLDERS) {
    console.log(`\nEscaneando pasta: ${path.basename(folder)}...`);
    const pngFiles = await getFiles(folder);
    console.log(`Encontrados ${pngFiles.length} arquivos PNG.`);

    // Concorrencia de 8 imagens por vez
    const CONCURRENCY = 8;
    for (let i = 0; i < pngFiles.length; i += CONCURRENCY) {
      const chunk = pngFiles.slice(i, i + CONCURRENCY);
      const results = await Promise.all(chunk.map(convertFile));
      for (const res of results) {
        if (res) {
          totalOrigBytes += res.origSize;
          totalNewBytes += res.newSize;
          convertedCount++;
        }
      }
      process.stdout.write(`\rProcessados: ${Math.min(i + CONCURRENCY, pngFiles.length)} / ${pngFiles.length}`);
    }
    console.log(`\nConcluida conversao em ${path.basename(folder)}.`);

    // Executar build_dataset.cjs
    const buildDatasetScript = path.join(folder, 'build_dataset.cjs');
    if (fs.existsSync(buildDatasetScript)) {
      console.log(`Atualizando dataset em ${path.basename(folder)} via build_dataset.cjs...`);
      try {
        execSync(`node "${buildDatasetScript}"`, { cwd: folder, stdio: 'inherit' });
        console.log(`Dataset atualizado com sucesso!`);
      } catch (err) {
        console.error(`Erro ao executar build_dataset.cjs em ${folder}:`, err.message);
      }
    }
  }

  // Atualizar portfolio/index.html referencias de covers
  const portfolioIndexPath = path.join(__dirname, '..', 'portfolio', 'index.html');
  if (fs.existsSync(portfolioIndexPath)) {
    let html = fs.readFileSync(portfolioIndexPath, 'utf8');
    html = html.replace(/sobral---carrossel-ainda-nao-comprou_01\.png/g, 'sobral---carrossel-ainda-nao-comprou_01.webp');
    html = html.replace(/sobral---post-desconto-pix\.png/g, 'sobral---post-desconto-pix.webp');
    html = html.replace(/ESSE%20POST%20%C3%89%20UMA\.png/g, 'ESSE%20POST%20%C3%89%20UMA.webp');
    html = html.replace(/carrossel%20estatico%2030%20por%20cento\.png/g, 'carrossel%20estatico%2030%20por%20cento.webp');
    fs.writeFileSync(portfolioIndexPath, html, 'utf8');
    console.log('\nAtualizado portfolio/index.html para apontar para capas .webp!');
  }

  // Limpeza de videos duplicados/nao utilizados na raiz
  const rootUnusedVideos = [
    path.join(__dirname, '..', 'hero-video.mp4'),
    path.join(__dirname, '..', 'hero-video-opt.mp4'),
    path.join(__dirname, '..', 'hero-video-720p.mp4'),
    path.join(__dirname, '..', 'hero-video.webm')
  ];

  for (const v of rootUnusedVideos) {
    if (fs.existsSync(v)) {
      try {
        const s = fs.statSync(v).size;
        fs.unlinkSync(v);
        console.log(`Removido video nao utilizado: ${path.basename(v)} (${(s / 1024 / 1024).toFixed(2)} MB)`);
      } catch (e) {}
    }
  }

  const origMB = (totalOrigBytes / 1024 / 1024).toFixed(2);
  const newMB = (totalNewBytes / 1024 / 1024).toFixed(2);
  const reduction = ((1 - totalNewBytes / totalOrigBytes) * 100).toFixed(1);

  console.log('\n========================================');
  console.log(`Total de imagens convertidas: ${convertedCount}`);
  console.log(`Tamanho original: ${origMB} MB`);
  console.log(`Novo tamanho: ${newMB} MB`);
  console.log(`Reducao: ${reduction}% !`);
  console.log('========================================\n');
}

main().catch(console.error);
