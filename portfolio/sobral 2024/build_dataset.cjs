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
  } catch(e) {}
  return null;
}

const mediaExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.mp4', '.mov', '.webm', '.gif']);

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// Configurações personalizadas para títulos e categorias de todas as pastas de Sobral 2024
const customFolderConfigs = {
  'ainda da tempo 22': {
    title: 'Carrossel — Ainda Dá Tempo',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'ajuste post verão': {
    title: 'Carrossel Coleção de Verão',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'ajuste tela extra cronogramas av': {
    title: 'Destaques & Cronogramas',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'ajustes posts final de ano': {
    title: 'Campanha Especial de Fim de Ano',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'aniversario BH': {
    title: 'Aniversário Sobral Belo Horizonte',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'ANIVERSARIO BOTAFOGO': {
    title: 'Aniversário Loja Botafogo',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'aniversario campinas nn': {
    title: 'Aniversário Loja Campinas',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'ANIVERSARIO LOJA CITTA': {
    title: 'Aniversário Loja Città América',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'aniversario paris': {
    title: 'Aniversário Sobral Paris',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'ANIVERSARIO SAO JOSE': {
    title: 'Aniversário Loja São José',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'batalha de efeitos nwww2': {
    title: 'Batalha de Efeitos',
    category: 'Engajamento & Interativo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'batalha de objetos poeticos': {
    title: 'Batalha de Objetos Poéticos',
    category: 'Engajamento & Interativo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'batalha efeitos newwtt': {
    title: 'Batalha de Efeitos Especiais',
    category: 'Engajamento & Interativo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'carrossel arvore': {
    title: 'Carrossel Árvore da Vida',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'CARROSSEL ATELIE nn 22': {
    title: 'Carrossel Bastidores do Ateliê',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel dia das maes 1': {
    title: 'Carrossel Dia das Mães — Poesia',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel dia das maes 1 new': {
    title: 'Carrossel Dia das Mães — Coleção Exclusiva',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel dia das mães nw 2': {
    title: 'Carrossel Dia das Mães — Inspirações',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel dia dos namorados nww': {
    title: 'Carrossel Dia dos Namorados',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel dia dos pais 1nn': {
    title: 'Carrossel Dia dos Pais',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel motivos 2': {
    title: 'Carrossel Motivos Para Usar Sobral',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel natal 1': {
    title: 'Carrossel Coleção de Natal',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel NS new 33': {
    title: 'Carrossel Nossa Senhora Aparecida',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'CARROSSEL OUTLET neww': {
    title: 'Carrossel Especial Outlet',
    category: 'Vendas & Promoções',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel outlet novvv': {
    title: 'Carrossel Oportunidades Outlet',
    category: 'Vendas & Promoções',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel preços outlet': {
    title: 'Carrossel Preços Imperdíveis Outlet',
    category: 'Vendas & Promoções',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel presentes': {
    title: 'Carrossel Guia de Presentes',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'carrossel rock in rio': {
    title: 'Carrossel Rock in Rio',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'CARROSSEL SELOS': {
    title: 'Carrossel Selos & Garantia de Arte',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'criativo novembro': {
    title: 'Criativos de Novembro',
    category: 'Vendas & Promoções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'criativos comentários': {
    title: 'Criativos de Prova Social & Comentários',
    category: 'Vendas & Promoções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'criativos feito': {
    title: 'Criativos de Performance & Conversão',
    category: 'Vendas & Promoções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'curitiba': {
    title: 'Aniversário de Curitiba',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'dia da fotografia': {
    title: 'Dia Mundial da Fotografia',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'dia das avos': {
    title: 'Homenagem Dia dos Avós',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'dia do amigo': {
    title: 'Especial Dia do Amigo',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'Dia do consumidor': {
    title: 'Campanha Dia do Consumidor',
    category: 'Vendas & Promoções',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'dia do sorriso': {
    title: 'Campanha Dia do Sorriso',
    category: 'Campanhas Comemorativas',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'dia dos namorados feed newwt': {
    title: 'Feed Dia dos Namorados',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'dia dos namorados newt': {
    title: 'Especial Dia dos Namorados',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'dia dos pais 1n': {
    title: 'Campanha Dia dos Pais',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'eco ambar': {
    title: 'Coleção Eco Âmbar',
    category: 'Coleções & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'efeito minas': {
    title: 'Coleção Efeito Minas',
    category: 'Coleções & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'enquete sobraletes': {
    title: 'Enquete Interativa Sobraletes',
    category: 'Engajamento & Interativo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'feed dia dos namorados': {
    title: 'Feed Namorados Sobral',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'indireta': {
    title: 'Post Indireta Bem-Humorada',
    category: 'Post de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'ipanema': {
    title: 'Especial Loja Ipanema',
    category: 'Lojas & Bastidores',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'loja vila olimpia': {
    title: 'Especial Loja Vila Olímpia',
    category: 'Lojas & Bastidores',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'looks ano novo n2': {
    title: 'Carrossel Looks de Ano Novo',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'moema aniversario': {
    title: 'Aniversário Loja Moema',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'niver campinas': {
    title: 'Aniversário Loja Campinas',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'NIVER PARATY': {
    title: 'Aniversário Loja Paraty',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'niver pinhais': {
    title: 'Aniversário São José dos Pinhais',
    category: 'Campanhas Comemorativas',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'nossa senhora': {
    title: 'Coleção Sacra Nossa Senhora',
    category: 'Coleções & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'ns new': {
    title: 'Destaque Coleção Sacra',
    category: 'Coleções & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'OUTUBRO ROSA': {
    title: 'Campanha Outubro Rosa',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'pascoa': {
    title: 'Campanha de Páscoa Sobral',
    category: 'Campanhas Comemorativas',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'post 150': {
    title: 'Comemoração 150k Seguidores',
    category: 'Campanhas Comemorativas',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'post amigo oculto 2': {
    title: 'Dicas de Presente — Amigo Oculto',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'post bem vindo ano novo': {
    title: 'Boas-Vindas Ano Novo',
    category: 'Post de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'POST CATEGORIAS': {
    title: 'Guia de Categorias de Joias',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'post colar 2n': {
    title: 'Destaque Colar Exclusivo',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'post colares neww': {
    title: 'Coleção Especial de Colares',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'post dicas inverno': {
    title: 'Dicas de Estilo para o Inverno',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'POST ELAS USAM': {
    title: 'Sobraletes — Elas Usam Sobral',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'Post feed Cristo': {
    title: 'Carrossel Coleção Cristo Redentor',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'post NS FATIMA': {
    title: 'Coleção Nossa Senhora de Fátima',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'posts combos': {
    title: 'Combos Promocionais & Ofertas',
    category: 'Carrossel de Feed',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'sequencia stories': {
    title: 'Sequência de Stories Sobral',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'SOBRAL - STORIES AINDA DA TEMPO nw': {
    title: 'Stories — Ainda Dá Tempo',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'sobral - stories dia dos pais presente': {
    title: 'Stories Dia dos Pais — Guia de Presentes',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories aniversario': {
    title: 'Stories Comemoração de Aniversário',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories artesanal nww': {
    title: 'Stories Processo Feito à Mão',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories batalha nww': {
    title: 'Stories Batalha de Joias',
    category: 'Engajamento & Interativo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories chaveiro nwww2': {
    title: 'Stories Chaveiros Exclusivos',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'STORIES CURITIBA nnn': {
    title: 'Stories Especial Curitiba',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories fábrica 2n': {
    title: 'Stories Bastidores da Fábrica',
    category: 'Lojas & Bastidores',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories ilhabela': {
    title: 'Stories Sobral Ilhabela',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories mapa lojas': {
    title: 'Stories Guia de Onde Encontrar',
    category: 'Lojas & Bastidores',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories ns nn': {
    title: 'Stories Coleção Nossa Senhora',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories nvv': {
    title: 'Stories Novidades & Lançamentos',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories ocasioes': {
    title: 'Stories Sobral em Todas as Ocasiões',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories outlet nov': {
    title: 'Stories Destaques do Outlet',
    category: 'Vendas & Promoções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'stories rock in rio': {
    title: 'Stories Festival Rock in Rio',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story aniversario': {
    title: 'Story Aniversário Sobral',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story caillou': {
    title: 'Story Coleção Caillou',
    category: 'Coleções & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'STORY CANDY': {
    title: 'Story Coleção Candy Colors',
    category: 'Coleções & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story casal - dia dos namorados': {
    title: 'Story Casal — Dia dos Namorados',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story colar n3': {
    title: 'Story Colares em Destaque',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story comentarios': {
    title: 'Story Comentários das Sobraletes',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story cores': {
    title: 'Story As Cores de Sobral',
    category: 'Coleções & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'STORY DIA DA FAMILIA': {
    title: 'Story Homenagem Dia da Família',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'Story dia das mães new 22': {
    title: 'Story Dia das Mães — Homenagem',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story dia do meio ambiente': {
    title: 'Story Conscientização Meio Ambiente',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story dia dos namorados': {
    title: 'Story Dia dos Namorados',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story dia dos namorados nov': {
    title: 'Story Presentes de Dia dos Namorados',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story enquete': {
    title: 'Story Enquete Interativa',
    category: 'Engajamento & Interativo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story enquete dia dos namorados': {
    title: 'Story Enquete Dia dos Namorados',
    category: 'Engajamento & Interativo',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story fabrica neww2': {
    title: 'Story Tour pela Fábrica',
    category: 'Lojas & Bastidores',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'STORY FOTOS': {
    title: 'Story Ensaio Fotográfico',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story inicio verao 3': {
    title: 'Story Chegada do Verão',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story ipanema': {
    title: 'Story Sobral Ipanema',
    category: 'Lojas & Bastidores',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'STORY LIVE ATELIE 22': {
    title: 'Story Transmissão ao Vivo Ateliê',
    category: 'Lojas & Bastidores',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story mapa': {
    title: 'Story Localizador de Lojas',
    category: 'Lojas & Bastidores',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'STORY NS n22': {
    title: 'Story Coleção Sacra',
    category: 'Coleções & Conceito',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story produtos': {
    title: 'Story Linha de Acessórios',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story professor': {
    title: 'Story Homenagem Dia dos Professores',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story sao jose': {
    title: 'Story Aniversário São José',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'story sueli': {
    title: 'Story Homenagem Sueli',
    category: 'Campanhas Comemorativas',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'uma semana': {
    title: 'Stories Contagem Regressiva — Uma Semana',
    category: 'Stories & Coleções',
    aspectRatio: '9/16',
    rawRatio: 0.563
  },
  'vale presente feed': {
    title: 'Post Vale-Presente Sobral',
    category: 'Vendas & Promoções',
    aspectRatio: '4/5',
    rawRatio: 0.8
  },
  'vale presente stories': {
    title: 'Stories Vale-Presente Sobral',
    category: 'Vendas & Promoções',
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

  const cfg = customFolderConfigs[folder] || {};
  let category = cfg.category;
  if (!category) {
    const lower = folder.toLowerCase();
    if (lower.startsWith('carrossel')) category = 'Carrossel de Feed';
    else if (lower.includes('batalha') || lower.includes('enquete')) category = 'Engajamento & Interativo';
    else if (lower.includes('outlet') || lower.includes('vale presente') || lower.includes('promo')) category = 'Vendas & Promoções';
    else if (lower.includes('story') || lower.includes('stories')) category = 'Stories & Coleções';
    else if (lower.includes('feed') || lower.includes('post')) category = items.length > 1 ? 'Carrossel de Feed' : 'Post de Feed';
    else category = 'Campanhas Comemorativas';
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

// Ordenação alfabética consistente por título ou pasta
allProjects.sort((a, b) => naturalCompare(a.folder, b.folder));

const totalItems = allProjects.reduce((acc, p) => acc + p.items.length, 0);
console.log(`Processados com sucesso ${allProjects.length} projetos com ${totalItems} mídias no total.`);

const outputCode = `const PORTFOLIO_PROJECTS = ${JSON.stringify(allProjects, null, 2)};\n`;
fs.writeFileSync(dataFile, outputCode, 'utf8');
console.log('Salvo portfolio_data.js com sucesso!');
