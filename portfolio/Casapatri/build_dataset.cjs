const fs = require('fs');
const path = require('path');

const targetDir = __dirname;
const dataFile = path.join(targetDir, 'portfolio_data.js');

function getDimensions(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    // PNG
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
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
  } catch (e) {}
  return null;
}

const mediaExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.mp4', '.mov', '.webm', '.gif']);

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// Configurações personalizadas para títulos e categorias de todas as pastas de Casapatri
const customFolderConfigs = {
  '6 vantagens stories': {
    title: '6 Vantagens de Comprar na Planta',
    category: 'Stories & Destaques'
  },
  'adm obra 1': {
    title: 'Administração de Obra na Prática',
    category: 'Carrossel de Feed'
  },
  'ana martins post 1': {
    title: 'Residencial Ana Martins',
    category: 'Post de Feed'
  },
  'ape na planta 1': {
    title: 'Por Que Investir em Apê na Planta',
    category: 'Carrossel de Feed'
  },
  'bene 1': {
    title: 'Residencial Scarano — Benefícios Exclusivos',
    category: 'Carrossel de Feed'
  },
  'carrossel Alfredo Volpi': {
    title: 'Carrossel Residencial Alfredo Volpi',
    category: 'Carrossel de Feed'
  },
  'carrossel burle': {
    title: 'Carrossel Conceito Burle Marx',
    category: 'Carrossel de Feed'
  },
  'carrossel eu quero': {
    title: 'Carrossel Plantas & Lançamentos',
    category: 'Carrossel de Feed'
  },
  'carrossel LAJE': {
    title: 'Carrossel Conceito Laje Linear',
    category: 'Carrossel de Feed'
  },
  'cobertura di': {
    title: 'Cobertura Di Cavalcanti',
    category: 'Carrossel de Feed'
  },
  'costa criati 1': {
    title: 'Institucional Costa Patrício',
    category: 'Carrossel de Feed'
  },
  'destak 1': {
    title: 'Destaques & Oportunidades do Mês',
    category: 'Carrossel de Feed'
  },
  'dia das mães': {
    title: 'Homenagem Dia das Mães',
    category: 'Campanhas Comemorativas'
  },
  'dia dos namorados 1': {
    title: 'Especial Dia dos Namorados',
    category: 'Campanhas Comemorativas'
  },
  'dia dos pais 1': {
    title: 'Especial Dia dos Pais',
    category: 'Campanhas Comemorativas'
  },
  'dica story': {
    title: 'Stories — Dicas Di Cavalcanti',
    category: 'Stories & Destaques'
  },
  'dik carrossel 2': {
    title: 'Carrossel Cobertura Di Cavalcanti',
    category: 'Carrossel de Feed'
  },
  'distancia recreio feed': {
    title: 'Distâncias & Mobilidade no Recreio',
    category: 'Carrossel de Feed'
  },
  'imovel e seu': {
    title: 'O Imóvel É Todo Seu',
    category: 'Carrossel de Feed'
  },
  'na alugue s tory': {
    title: 'Stories — Saia do Aluguel',
    category: 'Stories & Destaques'
  },
  'nao pague 2x': {
    title: 'Não Pague Duas Vezes',
    category: 'Post de Feed'
  },
  'nov azul 1': {
    title: 'Campanha Novembro Azul',
    category: 'Campanhas Comemorativas'
  },
  'obra por adm 2': {
    title: 'Obra por Administração a Preço de Custo',
    category: 'Post de Feed'
  },
  'pe na areia story': {
    title: 'Stories — Pé na Areia no Recreio',
    category: 'Stories & Destaques'
  },
  'perto praia': {
    title: 'Residencial Scarano — Perto da Praia',
    category: 'Carrossel de Feed'
  },
  'post alfredo volpi 2': {
    title: 'Post Residencial Alfredo Volpi',
    category: 'Post de Feed'
  },
  'post burle poucas unidades': {
    title: 'Burle Marx — Últimas Unidades',
    category: 'Post de Feed'
  },
  'post cafés': {
    title: 'Guia de Cafés & Gastronomia Local',
    category: 'Carrossel de Feed'
  },
  'post curiosidades': {
    title: 'Curiosidades & Estilo de Vida no Bairro',
    category: 'Carrossel de Feed'
  },
  'post dica': {
    title: 'Dicas de Escolha — Di Cavalcanti',
    category: 'Post de Feed'
  },
  'post dik 1': {
    title: 'Fachada & Arquitetura Di Cavalcanti',
    category: 'Post de Feed'
  },
  'post distancia recreio': {
    title: 'Guia de Conveniências no Recreio',
    category: 'Carrossel de Feed'
  },
  'post inicio inverno 1': {
    title: 'Especial Início do Inverno',
    category: 'Campanhas Comemorativas'
  },
  'posts gerais 1': {
    title: 'Aprendizado & Vida Perto de Casa',
    category: 'Carrossel de Feed'
  },
  'preco de custo': {
    title: 'Tudo Sobre Imóveis a Preço de Custo',
    category: 'Carrossel de Feed'
  },
  'recesso 1': {
    title: 'Comunicado de Recesso',
    category: 'Post de Feed'
  },
  'restaurantes 1': {
    title: 'Guia Gastronômico de Restaurantes',
    category: 'Carrossel de Feed'
  },
  'rosa oct': {
    title: 'Campanha Outubro Rosa',
    category: 'Campanhas Comemorativas'
  },
  'sem sair do aluguel': {
    title: 'Como Comprar sem Sair do Aluguel',
    category: 'Carrossel de Feed'
  },
  'ska 1': {
    title: 'Apresentação Residencial Scarano',
    category: 'Carrossel de Feed'
  },
  'STORY ACHE O APÊ': {
    title: 'Stories — Encontre Seu Apê Ideal',
    category: 'Stories & Destaques'
  },
  'story adapt': {
    title: 'Stories — Adaptação de Espaços',
    category: 'Stories & Destaques'
  },
  'STORY ADAPTAÇÃO': {
    title: 'Stories — Plantas Adaptáveis',
    category: 'Stories & Destaques'
  },
  'story adaptação new': {
    title: 'Stories — Casa dos Sonhos',
    category: 'Stories & Destaques'
  },
  'story alfredo volpi': {
    title: 'Stories — Residencial Alfredo Volpi',
    category: 'Stories & Destaques'
  },
  'story burle marlx new': {
    title: 'Stories — Residencial Burle Marx',
    category: 'Stories & Destaques'
  },
  'story dicavalcanti': {
    title: 'Stories — Lançamento Di Cavalcanti',
    category: 'Stories & Destaques'
  },
  'story interativo burle marx': {
    title: 'Stories Interativo — Burle Marx',
    category: 'Stories & Destaques'
  },
  'story motivos 22': {
    title: 'Stories — Motivos Para Investir',
    category: 'Stories & Destaques'
  },
  'story plantas 1': {
    title: 'Stories — Plantas Humanizadas',
    category: 'Stories & Destaques'
  },
  'story água marinha': {
    title: 'Stories — Residencial Água Marinha',
    category: 'Stories & Destaques'
  },
  'vila do conde': {
    title: 'Lançamento Residencial Vila do Conde',
    category: 'Carrossel de Feed'
  },
  '26 post': {
    title: 'Post Especial — Feliz Ano Novo',
    category: 'Campanhas Comemorativas'
  },
  'adm again': {
    title: 'Obra por Administração — Edição Fim de Ano',
    category: 'Carrossel de Feed'
  },
  'adm de leei': {
    title: 'Obra por Administração — Modelo & Vantagens',
    category: 'Carrossel de Feed'
  },
  'adm de lei': {
    title: 'Obra por Administração — Custo Real & Transparência',
    category: 'Carrossel de Feed'
  },
  'adm dnv': {
    title: 'Obra por Administração — Como Funciona',
    category: 'Carrossel de Feed'
  },
  'alugeul vs comprar': {
    title: 'Alugar vs. Comprar — O Que Vale a Pena?',
    category: 'Carrossel de Feed'
  },
  'carrossel scarano': {
    title: 'Carrossel Residencial Scarano',
    category: 'Carrossel de Feed'
  },
  'curioo': {
    title: 'Curiosidades & Vida no Recreio',
    category: 'Carrossel de Feed'
  },
  'dia corretoor': {
    title: 'Homenagem Dia do Corretor de Imóveis',
    category: 'Campanhas Comemorativas'
  },
  'dik car': {
    title: 'Residencial Di Cavalcanti — Plantas & Conforto',
    category: 'Carrossel de Feed'
  },
  'eu desejo 2025': {
    title: 'Para 2025 Eu Desejo — Fim de Ano',
    category: 'Campanhas Comemorativas'
  },
  'finalzin': {
    title: 'Carrossel Especial de Ano Novo',
    category: 'Campanhas Comemorativas'
  },
  'invistaa': {
    title: 'Invista no Bairro Que Mais Cresce no Rio',
    category: 'Carrossel de Feed'
  },
  'karna recesso': {
    title: 'Stories — Recesso de Carnaval',
    category: 'Stories & Destaques'
  },
  'katiaca 1': {
    title: 'Residencial Kátia Rodrigues — Lançamento',
    category: 'Carrossel de Feed'
  },
  'kobertura carroo': {
    title: 'Coberturas Exclusivas — Alto Padrão',
    category: 'Carrossel de Feed'
  },
  'kosta carrossel': {
    title: 'Construtora Costa Patrício — Credibilidade',
    category: 'Carrossel de Feed'
  },
  'kurioo': {
    title: 'Curiosidades de Verão no Recreio',
    category: 'Carrossel de Feed'
  },
  'maes top': {
    title: 'Stories — Homenagem Dia das Mães',
    category: 'Stories & Destaques'
  },
  'merce top': {
    title: 'Stories — Você Merece Qualidade de Vida',
    category: 'Stories & Destaques'
  },
  'metrozao': {
    title: 'Stories — Expansão do Metrô no Recreio',
    category: 'Stories & Destaques'
  },
  'nat st': {
    title: 'Stories — Especial de Natal',
    category: 'Stories & Destaques'
  },
  'natalzinn': {
    title: 'Carrossel Especial de Natal',
    category: 'Campanhas Comemorativas'
  },
  'obra admm': {
    title: 'Obra por Administração — Segurança & Economia',
    category: 'Carrossel de Feed'
  },
  'oq faze rec': {
    title: 'Guia Local — O Que Explorar no Recreio',
    category: 'Carrossel de Feed'
  },
  'perto praya': {
    title: 'Qualidade de Vida — Morar Perto da Praia',
    category: 'Post de Feed'
  },
  'porto vila': {
    title: 'Residencial Vila do Porto — Sofisticação',
    category: 'Carrossel de Feed'
  },
  'rexexo': {
    title: 'Stories — Comunicado de Recesso',
    category: 'Stories & Destaques'
  },
  'ska stories 2n': {
    title: 'Stories — Residencial Scarano',
    category: 'Stories & Destaques'
  },
  'sonhooo': {
    title: 'Transforme Seu Sonho em Realidade',
    category: 'Post de Feed'
  },
  'tem de tudo': {
    title: 'O Recreio Tem de Tudo — Praticidade & Lazer',
    category: 'Carrossel de Feed'
  },
  'ultimas dik': {
    title: 'Residencial Di Cavalcanti — Últimas Unidades',
    category: 'Carrossel de Feed'
  },
  'verde vila 1': {
    title: 'Residencial Vila Verde — Lançamento',
    category: 'Carrossel de Feed'
  },
  'yeear': {
    title: 'Stories — Feliz Ano Novo',
    category: 'Stories & Destaques'
  },
  'aninhaaa': {
    title: 'Residencial Ana Martins — Plantas',
    category: 'Carrossel de Feed'
  },
  'estatic': {
    title: 'Residencial Ana Martins — Post',
    category: 'Post de Feed'
  },
  'investop': {
    title: 'Empreendimentos & Investimentos no Recreio',
    category: 'Carrossel de Feed'
  },
  'katinhaa': {
    title: 'Residencial Kátia Rodrigues — Carrossel Completo',
    category: 'Carrossel de Feed'
  },
  '1 vila': {
    title: 'Residencial Vila Verde — Lançamento Vol. 1',
    category: 'Carrossel de Feed'
  },
  '2 vilaa': {
    title: 'Residencial Vila Verde — Lançamento Vol. 2',
    category: 'Carrossel de Feed'
  },
  '5 motivv': {
    title: '5 Motivos Para Investir e Morar no Recreio',
    category: 'Carrossel de Feed'
  },
  'alab': {
    title: 'Residencial Alabama — Exclusividade no Recreio',
    category: 'Carrossel de Feed'
  },
  'konvitt': {
    title: 'Stories — Convite Especial de Lançamento',
    category: 'Stories & Destaques'
  },
  'metrotopolis': {
    title: 'Mobilidade no Recreio — Expansão do Metrô',
    category: 'Carrossel de Feed'
  },
  'moom': {
    title: 'Stories — Especial Dia das Mães 2026',
    category: 'Campanhas Comemorativas'
  },
  'orbbe recantusss cri': {
    title: 'Criativos de Performance — Orbe Prime & Recanto',
    category: 'Carrossel de Feed'
  },
  'orbbee': {
    title: 'Residencial Orbe Prime — Conceito & Lançamento',
    category: 'Carrossel de Feed'
  },
  'paskk': {
    title: 'Stories — Especial Feliz Páscoa',
    category: 'Campanhas Comemorativas'
  },
  '30zin': {
    title: 'Obra por Administração — Economia de Até 30%',
    category: 'Post de Feed'
  },
  'adm loki': {
    title: 'Obra por Administração — Guia Completo & Transparência',
    category: 'Carrossel de Feed'
  },
  'ana loka': {
    title: 'Residencial Ana Martins — Carrossel Completo',
    category: 'Carrossel de Feed'
  },
  'churraaas': {
    title: 'Churrasco & Brisa do Mar — Estilo de Vida no Recreio',
    category: 'Carrossel de Feed'
  },
  'katia lokaa': {
    title: 'Residencial Kátia Rodrigues — Conceito & Lançamento',
    category: 'Carrossel de Feed'
  },
  'orbinho': {
    title: 'Residencial Orbe Prime — Criativos de Campanha',
    category: 'Carrossel de Feed'
  },
  'veranin': {
    title: 'Residencial Verano — Últimas Unidades',
    category: 'Post de Feed'
  },
  'verddn': {
    title: 'Residencial Vila Verde — Criativo de Feed',
    category: 'Post de Feed'
  }
};

const entries = fs.readdirSync(targetDir, { withFileTypes: true });
const subdirs = entries.filter(e => e.isDirectory()).map(e => e.name);

const allProjects = [];

for (const folder of subdirs) {
  const folderPath = path.join(targetDir, folder);
  const files = fs.readdirSync(folderPath).filter(f => {
    if (f.startsWith('.')) return false;
    const ext = path.extname(f).toLowerCase();
    return mediaExts.has(ext);
  });

  if (files.length === 0) continue;

  files.sort(naturalCompare);

  const items = files.map(fileName => {
    const filePath = path.join(folderPath, fileName);
    const ext = path.extname(fileName).toLowerCase();
    const isVideo = ['.mp4', '.mov', '.webm'].includes(ext);

    return {
      src: `${folder}/${fileName}`,
      name: fileName,
      isVideo: isVideo
    };
  });

  const cfg = customFolderConfigs[folder] || {};
  let category = cfg.category;
  if (!category) {
    const lower = folder.toLowerCase();
    if (lower.includes('story') || lower.includes('stories')) category = 'Stories & Destaques';
    else if (lower.includes('carrossel')) category = 'Carrossel de Feed';
    else if (items.length > 1) category = 'Carrossel de Feed';
    else category = 'Post de Feed';
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

  let title = cfg.title;
  if (!title) {
    let clean = folder
      .replace(/[-_]/g, ' ')
      .replace(/\b(neww2|newwt|neww|newt|new|novvv|nov|nnn|nwww2|n22|nn|n2|n3|1n|2n|22|33)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    title = clean
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

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

// Ordenação alfabética consistente por pasta
allProjects.sort((a, b) => naturalCompare(a.folder, b.folder));

const totalItems = allProjects.reduce((acc, p) => acc + p.items.length, 0);
console.log(`Processados com sucesso ${allProjects.length} projetos com ${totalItems} mídias no total.`);

const outputCode = `const PORTFOLIO_PROJECTS = ${JSON.stringify(allProjects, null, 2)};\n`;
fs.writeFileSync(dataFile, outputCode, 'utf8');
console.log('Salvo portfolio_data.js com sucesso!');
