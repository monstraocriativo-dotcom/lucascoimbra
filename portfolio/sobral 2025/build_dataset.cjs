const fs = require('fs');
const path = require('path');

const targetDir = __dirname;
const dataFile = path.join(targetDir, 'portfolio_data.js');

let existingProjects = [];
const existingMap = new Map();

if (fs.existsSync(dataFile)) {
  try {
    const content = fs.readFileSync(dataFile, 'utf8');
    const match = content.match(/const PORTFOLIO_PROJECTS = (\[[\s\S]*\]);/);
    if (match) {
      existingProjects = eval(match[1]);
      existingProjects.forEach(p => existingMap.set(p.folder, p));
    }
  } catch (err) {
    console.error('Erro ao ler portfolio_data.js existente:', err);
  }
}

function getDimensions(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(4096);
    fs.readSync(fd, buf, 0, 4096, 0);
    fs.closeSync(fd);

    // PNG
    if (buf[0] === 0x89 && buf[1] === 0x4E && buf[2] === 0x47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    // JPEG
    if (buf[0] === 0xFF && buf[1] === 0xD8) {
      let offset = 2;
      while (offset < buf.length - 8) {
        if (buf[offset] !== 0xFF) break;
        const marker = buf[offset + 1];
        if (marker === 0xC0 || marker === 0xC2) {
          return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
        }
        const len = buf.readUInt16BE(offset + 2);
        offset += 2 + len;
      }
    }
    // WEBP
    if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      if (buf.toString('ascii', 12, 16) === 'VP8 ') {
        return { width: buf.readUInt16LE(26) & 0x3FFF, height: buf.readUInt16LE(28) & 0x3FFF };
      }
      if (buf.toString('ascii', 12, 16) === 'VP8L') {
        const b = buf.readUInt32LE(21);
        return { width: 1 + (b & 0x3FFF), height: 1 + ((b >> 14) & 0x3FFF) };
      }
      if (buf.toString('ascii', 12, 16) === 'VP8X') {
        return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      }
    }
  } catch(e) {}
  return null;
}

const mediaExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.mp4', '.mov', '.webm', '.gif']);

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// Configurações personalizadas para títulos e categorias das novas pastas
const customFolderConfigs = {
  'batalha de efeitos novon': {
    title: 'Batalha de Efeitos (Novo)',
    category: 'Engajamento & Interativo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'bem vindo 2026': {
    title: 'Bem-vindo 2026',
    category: 'Campanha Comemorativa',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'carrossel amigo oculto nn': {
    title: 'Carrossel Amigo Oculto',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel ns neew': {
    title: 'Carrossel Coleção NS',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel prenteie com significado': {
    title: 'Carrossel Presenteie com Significado',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'dia do professor': {
    title: 'Story Dia do Professor',
    category: 'Campanha Comemorativa',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'feed ano novo 2025': {
    title: 'Feed Ano Novo 2025',
    category: 'Campanha Comemorativa',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'feed NS neww': {
    title: 'Feed Coleção NS',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'feed outubro rosa': {
    title: 'Feed Outubro Rosa',
    category: 'Campanha Comemorativa',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'historia honey': {
    title: 'História Efeito Honey',
    category: 'Identidade & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'ja e dezembro story': {
    title: 'Story Já é Dezembro',
    category: 'Campanha Comemorativa',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'LIVE ATELIE': {
    title: 'Live Peças do Ateliê',
    category: 'Ações Especiais & Live',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'mulher que usa sobral story': {
    title: 'Story Mulher Que Usa Sobral',
    category: 'Comunidade & Depoimentos',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'para cada pessoa story': {
    title: 'Story Para Cada Pessoa Especial',
    category: 'Campanha Comemorativa',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'post natal 2025': {
    title: 'Post de Natal 2025',
    category: 'Campanha Comemorativa',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'post ns nw': {
    title: 'Post Coleção NS',
    category: 'Post de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'story 1 neeww': {
    title: 'Story Lançamento Coleção',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story 150 nn': {
    title: 'Story Natal 150',
    category: 'Campanha Comemorativa',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story 2 newww': {
    title: 'Story Destaques da Semana',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story 3 motivos': {
    title: 'Story 3 Motivos Para Amar Sobral',
    category: 'Engajamento & Interativo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story acessorio': {
    title: 'Story Mais Que Um Acessório',
    category: 'Identidade & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story ano novo 2026': {
    title: 'Story Ano Novo 2026',
    category: 'Campanha Comemorativa',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story bolsas': {
    title: 'Story Bolsas Sobral',
    category: 'Stories & Acessórios',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story celular outlet': {
    title: 'Story Outlet no Celular',
    category: 'Vendas & Varejo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story estilos': {
    title: 'Story Encontre Seu Estilo',
    category: 'Engajamento & Interativo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story eteria': {
    title: 'Story Efeito Eteria',
    category: 'Identidade & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story fabrica nw': {
    title: 'Story Bastidores da Fábrica',
    category: 'Identidade & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story fotos clientes n': {
    title: 'Story Fotos de Clientes',
    category: 'Comunidade & Depoimentos',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story frases ns': {
    title: 'Story Frases de Inspiração NS',
    category: 'Comunidade & Depoimentos',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story joia preferida': {
    title: 'Story Qual é Sua Joia Preferida?',
    category: 'Engajamento & Interativo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story looks': {
    title: 'Story Enquete de Looks',
    category: 'Engajamento & Interativo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story looks virada': {
    title: 'Story Looks Para a Virada',
    category: 'Campanha Comemorativa',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story natal 2025': {
    title: 'Story Natal 2025',
    category: 'Campanha Comemorativa',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story natal 250 n': {
    title: 'Story Presentes de Natal 250',
    category: 'Campanha Comemorativa',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story ns sua vez': {
    title: 'Story Coleção NS: Sua Vez',
    category: 'Comunidade & Depoimentos',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story nuage': {
    title: 'Story Efeito Nuage',
    category: 'Identidade & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story outubro rosa': {
    title: 'Story Outubro Rosa',
    category: 'Campanha Comemorativa',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story verão': {
    title: 'Story Verão Sobral',
    category: 'Campanha Comemorativa',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story video': {
    title: 'Story Vídeo Institucional',
    category: 'Stories & Vídeo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'tbt 2025': {
    title: 'TBT Melhores Momentos 2025',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'uma semana para o natal': {
    title: 'Story Uma Semana Para o Natal',
    category: 'Campanha Comemorativa',
    aspectRatio: '9/16',
    rawRatio: 0.563
  }
};

const diskDirs = fs.readdirSync(targetDir).filter(f => {
  const full = path.join(targetDir, f);
  return fs.statSync(full).isDirectory();
});

const allProjects = [];

for (const folder of diskDirs) {
  const folderPath = path.join(targetDir, folder);
  const files = fs.readdirSync(folderPath).filter(f => {
    const fullPath = path.join(folderPath, f);
    return fs.statSync(fullPath).isFile() && mediaExts.has(path.extname(f).toLowerCase());
  });

  if (files.length === 0) continue;

  files.sort(naturalCompare);

  const items = files.map(fileName => {
    const isVideo = ['.mp4', '.mov', '.webm'].includes(path.extname(fileName).toLowerCase());
    const encodedFolder = encodeURIComponent(folder);
    const encodedFile = encodeURIComponent(fileName);
    return {
      src: `${encodedFolder}/${encodedFile}`,
      name: fileName,
      isVideo: isVideo
    };
  });

  let proj = existingMap.get(folder);
  if (proj) {
    // Atualiza itens (se arquivos novos foram adicionados a pastas existentes)
    proj.items = items;
    proj.itemCount = items.length;
    allProjects.push(proj);
  } else {
    // Nova pasta
    const cfg = customFolderConfigs[folder] || {};
    let category = cfg.category;
    if (!category) {
      const lower = folder.toLowerCase();
      if (lower.startsWith('carrossel')) category = 'Carrossel de Feed';
      else if (lower.includes('live')) category = 'Ações Especiais & Live';
      else if (lower.includes('feed') || lower.includes('post')) category = items.length > 1 ? 'Carrossel de Feed' : 'Post de Feed';
      else if (lower.includes('story') || lower.includes('stories')) category = 'Stories & Coleções';
      else category = 'Identidade & Conceito';
    }

    let aspectRatio = cfg.aspectRatio;
    let rawRatio = cfg.rawRatio;
    if (!aspectRatio) {
      const firstImg = files.find(f => !['.mp4', '.mov', '.webm'].includes(path.extname(f).toLowerCase()));
      if (firstImg) {
        const dims = getDimensions(path.join(folderPath, firstImg));
        if (dims && dims.width && dims.height) {
          const ratio = dims.width / dims.height;
          if (ratio < 0.7) {
            aspectRatio = '9/16';
            rawRatio = 0.563;
          } else {
            aspectRatio = '4/5';
            rawRatio = 0.8;
          }
        }
      }
      if (!aspectRatio) {
        aspectRatio = category.includes('Stories') ? '9/16' : '4/5';
        rawRatio = category.includes('Stories') ? 0.563 : 0.8;
      }
    }

    const title = cfg.title || folder
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, c => c.toUpperCase());

    const id = folder.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    allProjects.push({
      id: id,
      folder: folder,
      title: title,
      category: category,
      aspectRatio: aspectRatio,
      rawRatio: rawRatio,
      itemCount: items.length,
      items: items
    });
  }
}

// Ordenação alfabética consistente por nome de pasta
allProjects.sort((a, b) => naturalCompare(a.folder, b.folder));

const totalItems = allProjects.reduce((acc, p) => acc + p.items.length, 0);
console.log(`Processados com sucesso ${allProjects.length} projetos com ${totalItems} mídias no total.`);

const outputCode = `const PORTFOLIO_PROJECTS = ${JSON.stringify(allProjects, null, 2)};\n`;
fs.writeFileSync(dataFile, outputCode, 'utf8');
console.log('Salvo portfolio_data.js com sucesso!');
