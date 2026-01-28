// ===== FIREBASE INTEGRATION FOR PUBLIC SITE =====

// Coleções do Firebase
const NEWS_COLLECTION = "newsCards";
const PARTNERS_COLLECTION = "partners";
const GAMING_COLLECTION = "gamingCards";
const QUIZ_COLLECTION = "quizWinners";

// Variáveis para armazenar dados
let newsData = [];
let partnersData = [];
let gamingData = [];
let quizData = [];

// ===== FUNÇÕES PARA CARREGAR DADOS =====

// Carregar notícias (limite opcional)
async function loadNews(limitCount = null) {
  try {
    const newsCollection = window.firebaseModules.collection(window.firebaseDB, NEWS_COLLECTION);
    let q = window.firebaseModules.query(newsCollection, window.firebaseModules.orderBy('createdAt', 'desc'));
    
    if (limitCount) {
      q = window.firebaseModules.query(newsCollection, window.firebaseModules.orderBy('createdAt', 'desc'), window.firebaseModules.limit(limitCount));
    }
    
    const querySnapshot = await window.firebaseModules.getDocs(q);
    newsData = [];
    querySnapshot.forEach((doc) => {
      newsData.push({ id: doc.id, ...doc.data() });
    });
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

// ===== FUNÇÕES DE RENDERIZAÇÃO =====

// Renderizar notícias na home (3 últimas)
async function renderHomeNews() {
  const newsContainer = document.getElementById('homeNewsGrid');
  if (!newsContainer) return;
  
  const news = await loadNews(3);
  
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
        <h3 class="text-lg font-bold text-white mb-2 transition-colors line-clamp-2" style="color: ${color}">${item.title || 'Sem título'}</h3>
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
  
  const news = await loadNews();
  
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
          <h3 class="text-lg font-bold text-white mb-2 transition-colors line-clamp-2" style="color: ${color}">${item.title || 'Sem título'}</h3>
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
  
  const partners = await loadPartners();
  
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
  
  const gamingCards = await loadGaming();
  
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
  
  const winners = await loadQuiz(3);
  
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
  // Em modo multi-página, cada "tela" vira um arquivo .html
  closeMenu();

  const map = {
    home: 'index.html',
    'novidades-home': 'index.html'
  };

  const target = map[pageId] || (pageId + '.html');
  window.location.href = target;
}

function goHome() {
  closeMenu();
  window.location.href = 'index.html';
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

// FILTRO DE NOTÍCIAS + ROTAS (querystring)
// Suporta URLs do tipo: novidades.html?cat=anime&q=naruto
let currentCategory = 'todos';

function isNovidadesPage() {
  return !!document.getElementById('novidades');
}

function getNewsRouteParams() {
  const params = new URLSearchParams(window.location.search);
  const cat = (params.get('cat') || 'todos').toLowerCase();
  const q = (params.get('q') || '').toLowerCase();
  return { cat, q };
}

function setNewsRouteParams({ cat = null, q = null }, { replace = true } = {}) {
  // Se estiver em outra página e pedirem filtro/pesquisa, redireciona para novidades.html
  const isOnNov = /(^|\/)(novidades\.html)($|\?|#)/i.test(window.location.href);
  if (!isOnNov) {
    const params = new URLSearchParams();
    if (cat && cat !== 'todos') params.set('cat', cat);
    if (q && q.trim()) params.set('q', q.trim());
    const qs = params.toString();
    window.location.href = 'novidades.html' + (qs ? ('?' + qs) : '');
    return;
  }

  const params = new URLSearchParams(window.location.search);

  if (cat !== null) {
    if (!cat || cat === 'todos') params.delete('cat');
    else params.set('cat', cat);
  }

  if (q !== null) {
    const qq = (q || '').trim();
    if (!qq) params.delete('q');
    else params.set('q', qq);
  }

  const qs = params.toString();
  const newUrl = window.location.pathname + (qs ? ('?' + qs) : '') + window.location.hash;

  if (replace) window.history.replaceState({}, '', newUrl);
  else window.history.pushState({}, '', newUrl);
}

function applyCategoryActiveState(category) {
  if (!isNovidadesPage()) return;

  document.querySelectorAll('#novidades .category-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const btn = document.querySelector(`#novidades .category-btn[data-category="${category}"]`);
  if (btn) btn.classList.add('active');
}

function filterNews() {
  const inputEl = document.getElementById('searchInput');
  const searchTerm = (inputEl?.value || '').toLowerCase();

  // Atualiza a rota (q) sem recarregar a página
  if (isNovidadesPage()) {
    setNewsRouteParams({ q: searchTerm }, { replace: true });
  }

  document.querySelectorAll('.news-card').forEach(card => {
    const title = (card.getAttribute('data-title') || '').toLowerCase();
    const cat = (card.getAttribute('data-category') || '').toLowerCase();
    const matchSearch = title.includes(searchTerm);
    const matchCat = currentCategory === 'todos' || cat === currentCategory;
    card.classList.toggle('hidden', !(matchSearch && matchCat));
  });
}

function filterByCategory(category) {
  currentCategory = (category || 'todos').toLowerCase();

  // Atualiza a rota (cat) sem recarregar a página
  if (isNovidadesPage()) {
    setNewsRouteParams({ cat: currentCategory }, { replace: false });
  } else {
    // Se por algum motivo chamarem fora da página de novidades
    setNewsRouteParams({ cat: currentCategory }, { replace: true });
    return;
  }

  applyCategoryActiveState(currentCategory);
  filterNews();
}

function initNewsRouting() {
  if (!isNovidadesPage()) return;

  // Aplica filtros vindos da URL (cat / q)
  const { cat, q } = getNewsRouteParams();

  currentCategory = cat || 'todos';
  applyCategoryActiveState(currentCategory);

  const inputEl = document.getElementById('searchInput');
  if (inputEl && q) inputEl.value = q;

  // Quando os cards já estiverem renderizados, filtra
  // (o loadNews/renderNews chamará filterNews em seguida; se não, chamamos aqui também)
  setTimeout(() => {
    try { filterNews(); } catch(e) {}
  }, 0);

  // Suporte ao voltar/avançar do navegador
  window.addEventListener('popstate', () => {
    const { cat: c2, q: q2 } = getNewsRouteParams();
    currentCategory = (c2 || 'todos').toLowerCase();
    applyCategoryActiveState(currentCategory);
    const inputEl2 = document.getElementById('searchInput');
    if (inputEl2) inputEl2.value = q2 || '';
    filterNews();
  });
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

async function initSite() {
  try {
    // Carregar dados iniciais (mantém seu Firebase)
    await Promise.all([
      loadNews(50),
      loadQuiz(50),
      loadGaming(),
      loadPartners()
    ]);

    // Renderizações condicionais: só roda se existir o container na página atual
    if (document.getElementById('homeNewsGrid')) {
      await renderHomeNews();
    }
    if (document.getElementById('quizWinnersHome')) {
      await renderQuizWinnersHome();
    }
    if (document.getElementById('newsGrid')) {
      await renderAllNews();
      initNewsRouting();
    }
    if (document.getElementById('gamingCards')) {
      await renderGamingCards();
    }
    if (document.getElementById('partnersGrid')) {
      await renderPartners();
    }
    if (document.getElementById('winnersGrid')) {
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