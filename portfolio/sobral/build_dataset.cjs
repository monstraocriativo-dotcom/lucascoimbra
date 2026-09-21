const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('portfolio_data.js', 'utf8');
const oldProjects = eval(content.match(/const PORTFOLIO_PROJECTS = (\[[\s\S]*\]);/)[1]);

const existingMap = new Map();
oldProjects.forEach(p => {
  existingMap.set(p.folder, p);
});

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

// Custom definitions for the new folders
const newFolderConfigs = {
  'aniversario frei caneca': {
    id: 'aniversario-frei-caneca-2026',
    title: 'Aniversário Loja Frei Caneca',
    category: 'Identidade & Campanha',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'arte presente sobral wpp': {
    id: 'arte-presente-sobral-wpp',
    title: 'Arte Presente WhatsApp',
    category: 'Identidade & Campanha',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'arte whatapp': {
    id: 'arte-whatsapp-sobral',
    title: 'Arte WhatsApp Sobral',
    category: 'Identidade & Campanha',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'arte wpp inverno': {
    id: 'arte-wpp-inverno',
    title: 'Arte Inverno WhatsApp',
    category: 'Identidade & Campanha',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'artes wpp neeww': {
    id: 'artes-wpp-neeww',
    title: 'Coleção Artes WhatsApp',
    category: 'Identidade & Campanha',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'BANNERS MINNAS': {
    id: 'banners-minnas',
    title: 'Banners Coleção Minas',
    category: 'Identidade & Campanha',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel ainda nao comprou': {
    id: 'carrossel-ainda-nao-comprou',
    title: 'Carrossel Ainda Não Comprou?',
    category: 'Carrossel',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'evento rony story': {
    id: 'evento-rony-story',
    title: 'Story Evento Rony',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'feed caveira': {
    id: 'feed-caveira',
    title: 'Post Feed Caveiras',
    category: 'Criativos',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'post comentarios sobraletes': {
    id: 'post-comentarios-sobraletes',
    title: 'Carrossel Comentários Sobraletes',
    category: 'Carrossel',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'stories conjuntos': {
    id: 'stories-conjuntos',
    title: 'Stories Conjuntos',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories tendencias': {
    id: 'stories-tendencias',
    title: 'Stories Tendências',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story aniversario sao paulo': {
    id: 'story-aniversario-sao-paulo',
    title: 'Story Aniversário São Paulo',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story cafe': {
    id: 'story-cafe-contagem-wpp',
    title: 'Story Loja Café Contagem & WhatsApp',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story canal de transmissao whatsapp': {
    id: 'story-canal-de-transmissao-whatsapp',
    title: 'Story Canal de Transmissão',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story caveira': {
    id: 'story-caveira',
    title: 'Story Caveiras',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story colar newww': {
    id: 'story-colar-newww',
    title: 'Story Novos Colares',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story costela de adao newww': {
    id: 'story-costela-de-adao-newww',
    title: 'Story Costela de Adão Nova',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story design autoral': {
    id: 'story-design-autoral',
    title: 'Story Design Autoral',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story dia da fotografia': {
    id: 'story-dia-da-fotografia',
    title: 'Story Dia da Fotografia',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story frases modelos': {
    id: 'story-frases-modelos',
    title: 'Story Frases Modelos',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story minas': {
    id: 'story-minas',
    title: 'Story Coleção Minas',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story pollock': {
    id: 'story-pollock',
    title: 'Story Coleção Pollock',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story pulseira': {
    id: 'story-pulseira',
    title: 'Story Pulseiras',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story sobraletes': {
    id: 'story-sobraletes',
    title: 'Story Sobraletes',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story sua vez': {
    id: 'story-sua-vez',
    title: 'Story É a Sua Vez',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story vendas corporativas noovoo': {
    id: 'story-vendas-corporativas-noovoo',
    title: 'Story Vendas Corporativas Destaques',
    category: 'Stories',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'vendas corporativas feed': {
    id: 'vendas-corporativas-feed',
    title: 'Carrossel Vendas Corporativas Feed',
    category: 'Carrossel',
    aspectRatio: '4/5',
    rawRatio: 0.8
  }
};

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// Get all directories on disk
const diskDirs = fs.readdirSync('.').filter(f => fs.statSync(f).isDirectory());

const allProjects = [];

for (const folder of diskDirs) {
  const files = fs.readdirSync(folder).filter(f => {
    const fullPath = path.join(folder, f);
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
    // Update items in existing project to include any newly added files
    proj.items = items;
    proj.itemCount = items.length;
    allProjects.push(proj);
  } else {
    // New project
    const cfg = newFolderConfigs[folder] || {};
    let category = cfg.category;
    if (!category) {
      const lower = folder.toLowerCase();
      if (lower.startsWith('carrossel')) category = 'Carrossel';
      else if (lower.includes('story') || lower.includes('stories')) category = 'Stories';
      else if (lower.includes('post') || lower.includes('feed') || lower.includes('criativo')) category = 'Criativos';
      else category = 'Identidade & Campanha';
    }

    let aspectRatio = cfg.aspectRatio;
    let rawRatio = cfg.rawRatio;
    if (!aspectRatio) {
      // Check first image
      const firstImg = files.find(f => !['.mp4', '.mov', '.webm'].includes(path.extname(f).toLowerCase()));
      if (firstImg) {
        const dims = getDimensions(path.join(folder, firstImg));
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
        aspectRatio = category === 'Stories' ? '9/16' : '4/5';
        rawRatio = category === 'Stories' ? 0.563 : 0.8;
      }
    }

    const title = cfg.title || folder.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const id = cfg.id || folder.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

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

// Sort projects alphabetically by folder name for consistent order
allProjects.sort((a, b) => naturalCompare(a.folder, b.folder));

const totalItems = allProjects.reduce((acc, p) => acc + p.items.length, 0);
console.log(`Successfully processed ${allProjects.length} projects with ${totalItems} total media files.`);

const outputCode = `const PORTFOLIO_PROJECTS = ${JSON.stringify(allProjects, null, 2)};\n`;
fs.writeFileSync('portfolio_data.js', outputCode, 'utf8');
console.log('Saved portfolio_data.js successfully!');
