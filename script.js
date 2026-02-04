// ===== FIREBASE INTEGRATION FOR PUBLIC SITE =====

// Coleções do Firebase
const NEWS_COLLECTION = "newsCards";
const PARTNERS_COLLECTION = "partners";
const GAMING_COLLECTION = "gamingCards";
const QUIZ_COLLECTION = "quizWinners";
const GENERAL_WINNERS_COLLECTION = "generalWinners";
const SETTINGS_COLLECTION = "siteSettings";

// Variáveis para armazenar dados
let newsData = [];
let partnersData = [];
let gamingData = [];
let quizData = [];


// ===== SETTINGS (LINKS GERAIS + LIVEPIX) =====
async function loadGlobalSettings() {
  try {
    const linksRef = window.firebaseModules.doc(window.firebaseDB, SETTINGS_COLLECTION, "links");
    const livepixRef = window.firebaseModules.doc(window.firebaseDB, SETTINGS_COLLECTION, "livepix");

    const [linksSnap, livepixSnap] = await Promise.all([
      window.firebaseModules.getDoc(linksRef),
      window.firebaseModules.getDoc(livepixRef)
    ]);

    if (linksSnap.exists()) applyLinksSettings(linksSnap.data());
    if (livepixSnap.exists()) applyLivepixSettings(livepixSnap.data());
  } catch (e) {
    console.warn("Não foi possível carregar configurações globais:", e);
  }
}

function applyLinksSettings(data) {
  const instagramUrl = data.instagramUrl || "";
  const whatsappChannelUrl = data.whatsappChannelUrl || "";
  const whatsappGroupUrl = data.whatsappGroupUrl || "";
  const instagramHandle = data.instagramHandle || "";

  if (instagramUrl) {
    document.querySelectorAll('[data-setting="instagramUrl"]').forEach(a => a.setAttribute('href', instagramUrl));
  }
  if (whatsappChannelUrl) {
    document.querySelectorAll('[data-setting="whatsappChannelUrl"]').forEach(a => a.setAttribute('href', whatsappChannelUrl));
  }
  if (whatsappGroupUrl) {
    document.querySelectorAll('[data-setting="whatsappGroupUrl"]').forEach(a => a.setAttribute('href', whatsappGroupUrl));
  }
  if (instagramHandle) {
    // atualiza textos que exibem o @ no menu/rodapé
    document.querySelectorAll('[data-setting="instagramHandle"]').forEach(el => el.textContent = instagramHandle);
  }
}

function applyLivepixSettings(data) {
  const donateUrl = data.donateUrl || "";
  const rankEmbedUrl = data.rankEmbedUrl || "";

  if (donateUrl) {
    document.querySelectorAll('[data-setting="livepixDonateUrl"]').forEach(a => a.setAttribute('href', donateUrl));
  }
  if (rankEmbedUrl) {
    document.querySelectorAll('[data-setting="livepixRankEmbedUrl"]').forEach(iframe => iframe.setAttribute('src', rankEmbedUrl));
  }
}


// ===== UTIL: NORMALIZAR TIMESTAMP PARA ORDENAR NOTÍCIAS =====
function getNewsSortValue(item) {
  // Prioridade: createdAt (Firestore Timestamp/Date/number/string) -> date (YYYY-MM-DD ou DD/MM/YYYY)
  const v = item?.createdAt ?? null;

  // Firestore Timestamp (v.seconds / v.nanoseconds) ou toMillis()
  if (v && typeof v === "object") {
    if (typeof v.toMillis === "function") {
      const ms = v.toMillis();
      if (Number.isFinite(ms)) return ms;
    }
    if (typeof v.seconds === "number") {
      return v.seconds * 1000;
    }
    if (v instanceof Date) {
      const ms = v.getTime();
      if (Number.isFinite(ms)) return ms;
    }
  }

  // number (epoch ms)
  if (typeof v === "number" && Number.isFinite(v)) return v;

  // string (ISO ou outros formatos)
  if (typeof v === "string" && v.trim()) {
    const s = v.trim();
    const msISO = Date.parse(s);
    if (Number.isFinite(msISO)) return msISO;

    // DD/MM/YYYY
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [_, dd, mm, yyyy] = m;
      const ms = Date.parse(`${yyyy}-${mm}-${dd}T00:00:00`);
      if (Number.isFinite(ms)) return ms;
    }
  }

  // fallback: item.date (normalmente YYYY-MM-DD)
  const d = item?.date;
  if (typeof d === "string" && d.trim()) {
    const s = d.trim();
    const ms = Date.parse(s.includes("T") ? s : (s.includes("/") ? s.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1") : `${s}T00:00:00`));
    if (Number.isFinite(ms)) return ms;
  }

  return 0;
}

// ===== FUNÇÕES PARA CARREGAR DADOS =====

// Carregar notícias (limite opcional)
async function loadNews(limitCount = null) {
  try {
    const newsCollection = window.firebaseModules.collection(window.firebaseDB, NEWS_COLLECTION);

    // Mantém o orderBy no Firestore (para reduzir custo/latência quando possível),
    // mas também garante a ordem correta no front-end (caso createdAt esteja como string, ausente, etc.)
    const q = window.firebaseModules.query(
      newsCollection,
      window.firebaseModules.orderBy('createdAt', 'desc')
    );

    const querySnapshot = await window.firebaseModules.getDocs(q);

    newsData = [];
    querySnapshot.forEach((doc) => {
      newsData.push({ id: doc.id, ...doc.data() });
    });

    // Ordenação definitiva (mais recente primeiro)
    newsData.sort((a, b) => getNewsSortValue(b) - getNewsSortValue(a));

    // Aplicar limite depois da ordenação (evita "top 3" errado quando o Firestore não ordena como esperado)
    if (limitCount) return newsData.slice(0, limitCount);

    return newsData;
  } catch (error) {
    console.error("Erro ao carregar notícias:", error);
    return [];
  }
}

// Carregar parceiros
async function loadPartners() {
  try {
    const partnersCollection = window.firebaseModules.collection(window.firebaseDB, PARTNERS_COLLECTION);
    const querySnapshot = await window.firebaseModules.getDocs(partnersCollection);
    partnersData = [];
    querySnapshot.forEach((doc) => {
      partnersData.push({ id: doc.id, ...doc.data() });
    });
    return partnersData;
  } catch (error) {
    console.error("Erro ao carregar parceiros:", error);
    return [];
  }
}

// Carregar cards gaming
async function loadGaming() {
  try {
    const gamingCollection = window.firebaseModules.collection(window.firebaseDB, GAMING_COLLECTION);
    const querySnapshot = await window.firebaseModules.getDocs(gamingCollection);
    gamingData = [];
    querySnapshot.forEach((doc) => {
      gamingData.push({ id: doc.id, ...doc.data() });
    });
    return gamingData;
  } catch (error) {
    console.error("Erro ao carregar gaming:", error);
    return [];
  }
}

// Carregar ganhadores do quiz
async function loadQuiz(limitCount = null) {
  try {
    const quizCollection = window.firebaseModules.collection(window.firebaseDB, QUIZ_COLLECTION);
    let q = window.firebaseModules.query(quizCollection, window.firebaseModules.orderBy('createdAt', 'desc'));
    
    if (limitCount) {
      q = window.firebaseModules.query(quizCollection, window.firebaseModules.orderBy('createdAt', 'desc'), window.firebaseModules.limit(limitCount));
    }
    
    const querySnapshot = await window.firebaseModules.getDocs(q);
    quizData = [];
    querySnapshot.forEach((doc) => {
      quizData.push({ id: doc.id, ...doc.data() });
    });
    return quizData;
  } catch (error) {
    console.error("Erro ao carregar quiz:", error);
    return [];
  }
}


// ===== SHIMMER / SKELETON LOADING =====
function createShimmerSkeleton(type, count = 6){
  const items = [];
  for(let i=0;i<count;i++){
    if(type === 'news'){
      items.push(`
        <div class="group block bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
          <div class="relative overflow-hidden">
            <div class="shimmer h-48 w-full"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
            <div class="absolute top-3 left-3 shimmer h-6 w-24 rounded-full"></div>
          </div>
          <div class="p-5 space-y-3">
            <div class="shimmer h-5 w-11/12 rounded-md"></div>
            <div class="shimmer h-4 w-9/12 rounded-md"></div>
            <div class="flex items-center justify-between pt-2">
              <div class="shimmer h-4 w-24 rounded-md"></div>
              <div class="shimmer h-8 w-28 rounded-full"></div>
            </div>
          </div>
        </div>
      `);
    } else if(type === 'partners'){
      items.push(`
        <div class="partner-card">
          <div class="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-5">
            <div class="flex items-center gap-4">
              <div class="shimmer h-14 w-14 rounded-2xl"></div>
              <div class="flex-1 space-y-2">
                <div class="shimmer h-4 w-8/12 rounded-md"></div>
                <div class="shimmer h-3 w-10/12 rounded-md"></div>
              </div>
            </div>
            <div class="mt-4 shimmer h-9 w-full rounded-xl"></div>
          </div>
        </div>
      `);
    } else if(type === 'gaming'){
      items.push(`
        <div class="bg-gray-800/50 backdrop-blur-sm border border-green-500/15 rounded-2xl overflow-hidden">
          <div class="shimmer h-56 w-full"></div>
          <div class="p-6 space-y-3">
            <div class="shimmer h-6 w-7/12 rounded-md"></div>
            <div class="shimmer h-4 w-10/12 rounded-md"></div>
            <div class="shimmer h-4 w-8/12 rounded-md"></div>
            <div class="pt-2 shimmer h-10 w-40 rounded-xl"></div>
          </div>
        </div>
      `);
    } else if(type === 'quizWinners'){
      items.push(`
        <div class="winner-card">
          <div class="shimmer h-12 w-12 rounded-full"></div>
          <div class="winner-info">
            <div class="shimmer h-4 w-44 rounded-md mb-2"></div>
            <div class="shimmer h-4 w-24 rounded-md"></div>
          </div>
        </div>
      `);
    } else if(type === 'generalWinners'){
      items.push(`
        <div class="winner-card-item">
          <div class="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-4">
            <div class="flex items-center gap-4">
              <div class="shimmer h-16 w-16 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="shimmer h-4 w-7/12 rounded-md"></div>
                <div class="shimmer h-4 w-5/12 rounded-md"></div>
                <div class="shimmer h-3 w-8/12 rounded-md"></div>
              </div>
              <div class="shimmer h-9 w-24 rounded-full"></div>
            </div>
          </div>
        </div>
      `);
    }
  }
  return items.join('');
}

function applyShimmerToContainer(el, type, count){
  if(!el) return;
  el.setAttribute('aria-busy','true');
  el.innerHTML = createShimmerSkeleton(type, count);
}
function clearShimmerFromContainer(el){
  if(!el) return;
  el.removeAttribute('aria-busy');
}

// ===== FUNÇÕES DE RENDERIZAÇÃO =====

// Renderizar notícias na home (3 últimas)
async function renderHomeNews() {
  const newsContainer = document.getElementById('homeNewsGrid');
  if (!newsContainer) return;
  
  
  applyShimmerToContainer(newsContainer, 'news', 3);
  const news = (newsData && newsData.length) ? newsData.slice(0,3) : await loadNews(3);
  clearShimmerFromContainer(newsContainer);
// Limpar conteúdo
  newsContainer.innerHTML = '';
  
  news.forEach((item) => {
    const isInstagram = item.targetType === 'instagram';
    const isWhatsApp = item.targetType === 'whatsapp';
    const isSite = item.targetType === 'site';
    
    // Cor do item ou padrão
    const color = item.color || (isInstagram ? '#fbbf24' : '#22c55e');
    
    // Ícone e texto do destino
    let destinoIcon = 'fab fa-whatsapp';
    let destinoText = 'Ler no WhatsApp';
    let destinoClass = 'green';
    
    if (isInstagram) {
      destinoIcon = 'fab fa-instagram';
      destinoText = 'Ver no Instagram';
      destinoClass = 'yellow';
    } else if (isSite) {
      destinoIcon = 'fas fa-external-link-alt';
      destinoText = 'Ler matéria completa';
      destinoClass = 'blue';
    }
    
    // Formatar data
    let dataFormatada = '';
    if (item.date) {
      try {
        const date = new Date(item.date + 'T00:00:00');
        const opts = { day: "2-digit", month: "short", year: "numeric" };
        dataFormatada = date.toLocaleDateString("pt-BR", opts).replace(",", "");
      } catch {
        dataFormatada = item.date;
      }
    }
    
    const card = document.createElement('a');
    card.href = item.targetUrl || '#';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.className = `group block bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:-translate-y-1`;
    
    // Aplicar cor personalizada
    card.style.borderColor = `${color}50`;
    card.style.boxShadow = `0 10px 15px -3px ${color}10`;
    
    card.innerHTML = `
      <div class="relative overflow-hidden">
        <img src="${item.imageUrl || 'https://via.placeholder.com/400x200'}" alt="${item.title || 'Notícia'}"
             class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110">
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        <span class="absolute top-3 left-3 text-gray-950 text-xs font-bold px-3 py-1 rounded-full" style="background-color: ${color}">${item.category || 'Notícia'}</span>
      </div>
      <div class="p-5">
        <div class="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <i class="far fa-calendar"></i>
          <span>${dataFormatada || 'Data não informada'}</span>
        </div>
        <h3 class="news-title text-lg font-bold text-white mb-2 transition-colors line-clamp-2">${item.title || 'Sem título'}</h3>
        <p class="text-gray-400 text-sm mb-4 line-clamp-2">${item.excerpt || 'Sem descrição'}</p>
        <div class="flex items-center gap-2 font-semibold text-sm" style="color: ${color}">
          <i class="${destinoIcon}"></i>
          <span>${destinoText}</span>
          <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </div>
      </div>
    `;
    
    newsContainer.appendChild(card);
  });
}

// Renderizar todas as notícias na página de novidades
async function renderAllNews() {
  const newsGrid = document.getElementById('newsGrid');
  if (!newsGrid) return;
  
  
  applyShimmerToContainer(newsGrid, 'news', 8);
  const news = (newsData && newsData.length) ? newsData : await loadNews();
  clearShimmerFromContainer(newsGrid);
// Limpar conteúdo
  newsGrid.innerHTML = '';
  
  news.forEach((item) => {
    const isInstagram = item.targetType === 'instagram';
    const isWhatsApp = item.targetType === 'whatsapp';
    const isSite = item.targetType === 'site';
    
    // Cor do item ou padrão
    const color = item.color || (isInstagram ? '#fbbf24' : '#22c55e');
    
    // Ícone e texto do destino
    let destinoIcon = 'fab fa-whatsapp';
    let destinoText = 'Ler no WhatsApp';
    
    if (isInstagram) {
      destinoIcon = 'fab fa-instagram';
      destinoText = 'Ver no Instagram';
    } else if (isSite) {
      destinoIcon = 'fas fa-external-link-alt';
      destinoText = 'Ler matéria completa';
    }
    
    // Formatar data
    let dataFormatada = '';
    if (item.date) {
      try {
        const date = new Date(item.date + 'T00:00:00');
        const opts = { day: "2-digit", month: "short", year: "numeric" };
        dataFormatada = date.toLocaleDateString("pt-BR", opts).replace(",", "");
      } catch {
        dataFormatada = item.date;
      }
    }
    
    const card = document.createElement('div');
    card.className = 'news-card';
    card.setAttribute('data-category', item.category ? item.category.toLowerCase() : '');
    card.setAttribute('data-title', (item.title || '').toLowerCase());
    
    card.innerHTML = `
      <a href="${item.targetUrl || '#'}" target="_blank" rel="noopener noreferrer"
         class="group block bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:-translate-y-1" style="border-color: ${color}50; box-shadow: 0 10px 15px -3px ${color}10">
        <div class="relative overflow-hidden">
          <img src="${item.imageUrl || 'https://via.placeholder.com/400x200'}" alt="${item.title || 'Notícia'}"
               class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110">
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
          <span class="absolute top-3 left-3 text-gray-950 text-xs font-bold px-3 py-1 rounded-full" style="background-color: ${color}">${item.category || 'Notícia'}</span>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 text-gray-500 text-sm mb-3">
            <i class="far fa-calendar"></i>
            <span>${dataFormatada || 'Data não informada'}</span>
          </div>
          <h3 class="news-title text-lg font-bold text-white mb-2 transition-colors line-clamp-2">${item.title || 'Sem título'}</h3>
          <p class="text-gray-400 text-sm mb-4 line-clamp-2">${item.excerpt || 'Sem descrição'}</p>
          <div class="flex items-center gap-2 font-semibold text-sm" style="color: ${color}">
            <i class="${destinoIcon}"></i>
            <span>${destinoText}</span>
            <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </div>
        </div>
      </a>
    `;
    
    newsGrid.appendChild(card);
  });
}

// Renderizar parceiros
async function renderPartners() {
  const partnersGrid = document.getElementById('partnersGrid');
  if (!partnersGrid) return;
  
  
  applyShimmerToContainer(partnersGrid, 'partners', 6);
  const partners = (partnersData && partnersData.length) ? partnersData : await loadPartners();
  clearShimmerFromContainer(partnersGrid);
// Limpar conteúdo
  partnersGrid.innerHTML = '';
  
  partners.forEach((partner) => {
    // Cor do parceiro ou padrão
    const color = partner.color || '#fbbf24';
    
    const card = document.createElement('div');
    card.className = 'partner-card';
    
    card.innerHTML = `
      <div class="group bg-gray-800/30 rounded-2xl border border-gray-700/50 transition-all duration-300 p-5 hover:-translate-y-1" style="border-color: ${color}50; box-shadow: 0 10px 15px -3px ${color}10">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style="background: ${color}">
            <i class="${partner.iconSelect || 'fas fa-handshake'} text-white text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white mb-1">${partner.name || 'Parceiro'}</h3>
            <p class="text-sm font-medium" style="color: ${color}">${partner.subname || ''}</p>
            <div class="flex items-center gap-1 mt-1">
              <span class="text-xs px-2 py-0.5 rounded-full" style="background-color: ${color}20; color: ${color}">${partner.category || 'Parceiro'}</span>
            </div>
          </div>
        </div>
        
        <p class="text-gray-400 text-sm mb-4 line-clamp-2">
          ${partner.description || 'Sem descrição'}
        </p>
        
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-500">
            <i class="fas fa-users mr-1"></i>
            ${partner.subDesc || ''}
          </div>
          <a href="${partner.destLink || '#'}" target="_blank" rel="noopener noreferrer"
             class="transition-colors" style="color: ${color}">
            <i class="${partner.destSymbol || 'fab fa-instagram'} text-lg"></i>
          </a>
        </div>
      </div>
    `;
    
    partnersGrid.appendChild(card);
  });
}

// Renderizar cards gaming
async function renderGamingCards() {
  const gamingContainer = document.getElementById('gamingCards');
  if (!gamingContainer) return;
  
  
  applyShimmerToContainer(gamingContainer, 'gaming', 2);
  const gamingCards = (gamingData && gamingData.length) ? gamingData : await loadGaming();
  clearShimmerFromContainer(gamingContainer);
// Limpar conteúdo
  gamingContainer.innerHTML = '';
  
  gamingCards.forEach((card) => {
    // Cores do gradiente
    const gradientColor1 = card.gradientColor1 || '#8b5cf6';
    const gradientColor2 = card.gradientColor2 || '#3b82f6';
    const buttonColor = card.buttonColor || '#8b5cf6';
    const event1Color = card.event1Color || '#ef4444';
    const event2Color = card.event2Color || '#10b981';
    
    const gamingCard = document.createElement('div');
    gamingCard.className = 'bg-gray-800/50 backdrop-blur-sm border border-red-500/20 rounded-3xl p-6 md:p-8';
    
    gamingCard.innerHTML = `
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style="background: linear-gradient(135deg, ${gradientColor1}, ${gradientColor2})">
          <i class="${card.iconSelect || 'fas fa-gamepad'} text-white text-2xl"></i>
        </div>
        <div>
          <h3 class="text-2xl font-bold text-white">${card.title || 'Jogo'}</h3>
          <p class="text-gray-400">${card.subtitle || ''}</p>
        </div>
      </div>
      
      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 class="text-white font-semibold mb-3 flex items-center gap-2">
            <i class="fas fa-crown text-yellow-400"></i>
            ${card.title2 || 'Nossa Guilda'}
          </h4>
          <p class="text-gray-300">${card.description || 'Sem descrição'}</p>
        </div>
        
        <div class="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
          <h4 class="text-white font-semibold mb-3">${card.minicardTitle || 'Principais Eventos'}</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white font-medium">${card.event1Title || 'Evento 1'}</p>
                <p class="text-gray-400 text-sm">${card.event1Sub || ''}</p>
              </div>
              <span class="text-white px-3 py-1 rounded-full text-sm font-bold" style="background-color: ${event1Color}">${card.event1Value || ''}</span>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white font-medium">${card.event2Title || 'Evento 2'}</p>
                <p class="text-gray-400 text-sm">${card.event2Sub || ''}</p>
              </div>
              <span class="text-gray-950 px-3 py-1 rounded-full text-sm font-bold" style="background-color: ${event2Color}">${card.event2Value || ''}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="text-center">
        <a href="${card.buttonLink || '#'}" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-xl" style="background-color: ${buttonColor}">
          <i class="${card.buttonIcon || 'fab fa-whatsapp'}"></i>
          ${card.buttonText || 'Participar'}
        </a>
        <p class="text-gray-400 text-sm mt-2">${card.bottomText || ''}</p>
      </div>
    `;
    
    gamingContainer.appendChild(gamingCard);
  });
}

// Renderizar ganhadores do quiz na página de quiz
async function renderQuizWinnersHome() {
  const quizWinnersHome = document.getElementById('quizWinnersHome');
  if (!quizWinnersHome) return;
  
  
  applyShimmerToContainer(quizWinnersHome, 'quizWinners', 3);
  const winners = (quizData && quizData.length) ? quizData.slice(0,3) : await loadQuiz(3);
  clearShimmerFromContainer(quizWinnersHome);
// Limpar conteúdo
  quizWinnersHome.innerHTML = '';
  
  winners.forEach((winner) => {
    const winnerCard = document.createElement('div');
    winnerCard.className = 'winner-card';
    
    winnerCard.innerHTML = `
      <img src="${winner.photoUrl || 'https://via.placeholder.com/60'}" alt="${winner.name || 'Ganhador'}">
      <div class="winner-info">
        <span class="winner-name">${winner.name || '@usuário'}</span>
        <span class="winner-prize">${winner.prize || 'R$0'}</span>
      </div>
      <a href="${winner.link || '#'}" target="_blank" class="winner-btn">Ver</a>
    `;
    
    quizWinnersHome.appendChild(winnerCard);
  });
}

// ===== FUNÇÕES ORIGINAIS DO SITE (MANTIDAS) =====

function toggleMenu() {
  const menu = document.getElementById('slideMenu');
  const overlay = document.getElementById('menuOverlay');
  const hamburger = document.querySelector('.hamburger');
  
  menu.classList.toggle('open');
  overlay.classList.toggle('active');
  
  if (hamburger) {
    hamburger.classList.toggle('active');
  }
}

function closeMenu() {
  const menu = document.getElementById('slideMenu');
  const overlay = document.getElementById('menuOverlay');
  const hamburger = document.querySelector('.hamburger');
  
  menu.classList.remove('open');
  overlay.classList.remove('active');
  
  if (hamburger) {
    hamburger.classList.remove('active');
  }
}

function showPage(pageId) {
  // Rotas "limpas" (sem .html) usando pastas com index.html
  closeMenu();

  const map = {
    home: '/',
    'novidades-home': '/',
    novidades: '/novidades',
    quiz: '/quiz',
    parceiros: '/parceiros',
    gaming: '/gaming',
    ganhadores: '/ganhadores',
    doacao: '/doacao'
  };

  const target = map[pageId] || ('/' + String(pageId).replace(/^\/+/, ''));
  window.location.href = target;
}

function goHome() {
  closeMenu();
  window.location.href = '/';
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

// FILTRO DE NOTÍCIAS (com rotas via URL)
let currentCategory = 'todos';

function isNewsPage() {
  return !!document.getElementById('newsGrid');
}

function getNewsRoute() {
  const params = new URLSearchParams(window.location.search);
  const cat = (params.get('cat') || 'todos').toLowerCase();
  const q = (params.get('q') || '');
  return { cat, q };
}

function setNewsRoute({ cat = null, q = null } = {}, { replace = false } = {}) {
  if (!isNewsPage()) return;

  const params = new URLSearchParams(window.location.search);

  if (cat !== null) {
    const v = (cat || '').toLowerCase();
    if (!v || v === 'todos') params.delete('cat');
    else params.set('cat', v);
  }

  if (q !== null) {
    const v = (q || '').trim();
    if (!v) params.delete('q');
    else params.set('q', v);
  }

  const query = params.toString();
  const newUrl = window.location.pathname + (query ? `?${query}` : '');
  const state = { newsRoute: true };

  if (replace) history.replaceState(state, '', newUrl);
  else history.pushState(state, '', newUrl);
}

function updateNewsCategoryUI(category) {
  if (!isNewsPage()) return;

  document.querySelectorAll('#novidades .category-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const btn = document.querySelector(`#novidades .category-btn[data-category="${category}"]`);
  if (btn) btn.classList.add('active');
}

function filterNews({ replaceRoute = true } = {}) {
  const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();

  // Atualiza a URL (sem poluir o histórico enquanto digita)
  setNewsRoute({ cat: currentCategory, q: searchTerm }, { replace: replaceRoute });

  document.querySelectorAll('.news-card').forEach(card => {
    const title = (card.getAttribute('data-title') || '').toLowerCase();
    const cat = (card.getAttribute('data-category') || '').toLowerCase();
    const matchSearch = title.includes(searchTerm);
    const matchCat = currentCategory === 'todos' || cat === currentCategory;
    card.classList.toggle('hidden', !(matchSearch && matchCat));
  });
}

function filterByCategory(category, { pushRoute = true } = {}) {
  currentCategory = (category || 'todos').toLowerCase();

  updateNewsCategoryUI(currentCategory);

  // Ao trocar de categoria, faz sentido entrar no histórico (voltar/avançar)
  setNewsRoute({ cat: currentCategory }, { replace: !pushRoute });

  filterNews({ replaceRoute: true });
}

function applyNewsRouteFromURL() {
  if (!isNewsPage()) return;

  const { cat, q } = getNewsRoute();

  // Categoria
  currentCategory = (cat || 'todos').toLowerCase();
  updateNewsCategoryUI(currentCategory);

  // Busca
  const input = document.getElementById('searchInput');
  if (input) input.value = q || '';

  filterNews({ replaceRoute: true });
}

function initNewsRouting() {
  if (!isNewsPage()) return;

  // Garante data-category nos botões antigos (caso o HTML tenha ficado sem)
  document.querySelectorAll('#novidades .category-btn').forEach(btn => {
    if (!btn.hasAttribute('data-category')) {
      const text = (btn.textContent || '').trim().toLowerCase();
      // Mapeia textos mais comuns
      const map = { 'todos': 'todos', 'anime': 'anime', 'mangá': 'manga', 'manga': 'manga', 'jogos': 'jogos', 'filme': 'filme', 'notícias': 'noticias', 'noticias': 'noticias', 'teoria': 'teoria', 'unboxing': 'unboxing', 'recebidos': 'recebidos' };
      btn.setAttribute('data-category', map[text] || text);
    }
  });

  // Aplica o estado inicial da URL
  applyNewsRouteFromURL();

  // Se o usuário usar voltar/avançar, re-aplica filtros
  window.addEventListener('popstate', () => {
    applyNewsRouteFromURL();
  });
}



// ===== GANHADORES GERAIS (PÁGINA /ganhadores) =====
async function loadGeneralWinners() {
  const gridEl = document.getElementById('winnersGrid');
  applyShimmerToContainer(gridEl, 'generalWinners', 3);

  try {
    const colRef = window.firebaseModules.collection(window.firebaseDB, GENERAL_WINNERS_COLLECTION);
    const snap = await window.firebaseModules.getDocs(colRef);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    // garantir as 3 categorias em ordem
    const order = { quiz: 1, gaming: 2, instagram: 3 };
    list.sort((a,b)=> (order[(a.category||a.id||"").toLowerCase()]||99) - (order[(b.category||b.id||"").toLowerCase()]||99));
    renderGeneralWinners(list);
    clearShimmerFromContainer(gridEl);
  } catch (e) {
    console.error("Erro ao carregar ganhadores gerais:", e);
    clearShimmerFromContainer(gridEl);
  }
}

function escapeHtml(str){
  return String(str||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function categoryTitle(cat){
  const map = { quiz: "Quiz", gaming: "Gaming", instagram: "Instagram" };
  return map[cat] || cat;
}

function renderGeneralWinners(list){
  const grid = document.getElementById('winnersGrid');
  if(!grid) return;

  if(!list.length){
    grid.innerHTML = `
      <div class="text-center text-gray-400 p-6 border border-green-500/20 rounded-xl bg-gray-800/30">
        Nenhum ganhador cadastrado ainda.
      </div>`;
    return;
  }

  grid.innerHTML = list.map(item => {
    const cat = (item.category || item.id || "").toLowerCase();
    const name = escapeHtml(item.name || "Sem nome");
    const handle = escapeHtml(item.instagramHandle || item.handle || "");
    const prize = escapeHtml(item.prize || "");
    const img = escapeHtml(item.imageUrl || "");
    const profileUrl = escapeHtml(item.profileUrl || "");

    const linkOpen = profileUrl ? `href="${profileUrl}" target="_blank" rel="noopener"` : `href="#" onclick="return false;"`;
    return `
      <div class="winner-card-item" data-category="${cat}">
        <div class="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 transition-all duration-300 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10">
          <div class="flex items-center gap-4">
            <div class="relative">
              ${img ? `<img src="${img}" alt="${name}" class="w-12 h-12 rounded-xl object-cover border-2 border-green-500/30">` : `<div class="w-12 h-12 rounded-xl bg-gray-700/60 border-2 border-green-500/20"></div>`}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-3">
                <h3 class="font-bold text-white truncate">${name}</h3>
                <span class="text-xs px-2 py-1 rounded-lg bg-green-500/20 text-green-300 border border-green-500/20">${categoryTitle(cat)}</span>
              </div>
              <p class="text-sm text-gray-300 truncate">${handle}</p>
              ${prize ? `<p class="text-sm text-green-400 font-semibold mt-1">${prize}</p>` : ``}
            </div>
            <a ${linkOpen}
               class="px-3 py-2 rounded-lg bg-green-500 text-gray-950 font-semibold text-sm hover:bg-green-400 transition-colors">
              Ver
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}


// FILTRO DE GANHADORES
let currentWinnerCategory = 'todos';

function filterWinners(category) {
  currentWinnerCategory = category;
  
  document.querySelectorAll('#ganhadores .category-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active');
    }
  });
  
  document.querySelectorAll('.winner-card-item').forEach(item => {
    const itemCat = item.getAttribute('data-category');
    const show = (category === 'todos') || (itemCat === category);
    item.classList.toggle('hidden', !show);
  });
}

function initWinnersCategoryButtons() {
  document.querySelectorAll('#ganhadores .category-btn').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      filterWinners(category);
    });
  });
}

// Função para rolar até a seção de doadores
function scrollToDoadores() {
  const doadoresSection = document.getElementById('doadores');
  if (doadoresSection) {
    doadoresSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// ===== INICIALIZAÇÃO =====



function initBrandHomeLink() {
  document.querySelectorAll('[data-home-brand]').forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goHome();
      }
    });
  });
}

async function initSite() {
  try {
    initBrandHomeLink();
    // 1) Shimmer IMEDIATO (antes de qualquer await) — evita “flash” de vazio
    const homeNewsGrid = document.getElementById('homeNewsGrid');
    if (homeNewsGrid) applyShimmerToContainer(homeNewsGrid, 'news', 3);

    const quizWinnersHome = document.getElementById('quizWinnersHome');
    if (quizWinnersHome) applyShimmerToContainer(quizWinnersHome, 'quizWinners', 3);

    const newsGrid = document.getElementById('newsGrid');
    if (newsGrid) applyShimmerToContainer(newsGrid, 'news', 8);

    const gamingCardsEl = document.getElementById('gamingCards');
    if (gamingCardsEl) applyShimmerToContainer(gamingCardsEl, 'gaming', 2);

    const partnersGridEl = document.getElementById('partnersGrid');
    if (partnersGridEl) applyShimmerToContainer(partnersGridEl, 'partners', 6);

    const winnersGridEl = document.getElementById('winnersGrid');
    if (winnersGridEl) applyShimmerToContainer(winnersGridEl, 'generalWinners', 3);

    // 2) Dispara settings em paralelo (não bloqueia o shimmer)
    const settingsPromise = loadGlobalSettings();

    // 3) Carrega APENAS o que a página atual precisa (mais rápido)
    const loaders = [];
    if (homeNewsGrid || newsGrid) loaders.push(loadNews(50));
    if (quizWinnersHome) loaders.push(loadQuiz(50));
    if (gamingCardsEl) loaders.push(loadGaming());
    if (partnersGridEl) loaders.push(loadPartners());

    await Promise.all([settingsPromise, ...loaders]);

    // 4) Renderizações condicionais: só roda se existir o container na página atual
    if (homeNewsGrid) {
      await renderHomeNews();
    }
    if (quizWinnersHome) {
      await renderQuizWinnersHome();
    }
    if (newsGrid) {
      await renderAllNews();
      initNewsRouting();
    }
    if (gamingCardsEl) {
      await renderGamingCards();
    }
    if (partnersGridEl) {
      await renderPartners();
    }
    if (document.getElementById('winnersGrid')) {
      await loadGeneralWinners();
      initWinnersCategoryButtons();
      filterWinners('todos');
    }

    console.log('Site público inicializado (multi-páginas)!');
  } catch (error) {
    console.error('Erro ao inicializar site:', error);
  }
}

// Iniciar quando o DOM estiver carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite);
} else {
  initSite();
}