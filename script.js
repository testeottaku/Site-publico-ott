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

// ===== SPA ROUTER CONFIGURATION =====

const routes = {
    '/': {
        id: 'home',
        title: 'Home',
        init: renderHomeNews
    },
    '/novidades': {
        id: 'novidades',
        title: 'Novidades',
        init: () => {
            filterByCategory('todos');
            renderAllNews();
        }
    },
    '/novidades/:category': {
        id: 'novidades',
        title: 'Novidades',
        init: (params) => {
            if (params && params.category) {
                filterByCategory(params.category);
            } else {
                filterByCategory('todos');
            }
            renderAllNews();
        }
    },
    '/gaming': {
        id: 'gaming',
        title: 'Gaming',
        init: renderGamingCards
    },
    '/parceiros': {
        id: 'parceiros',
        title: 'Parceiros',
        init: renderPartners
    },
    '/quiz': {
        id: 'quiz',
        title: 'Quiz',
        init: renderQuizWinnersHome
    },
    '/ganhadores': {
        id: 'ganhadores',
        title: 'Ganhadores',
        init: () => filterWinners('todos')
    },
    '/ganhadores/:category': {
        id: 'ganhadores',
        title: 'Ganhadores',
        init: (params) => {
            if (params && params.category) {
                filterWinners(params.category);
            } else {
                filterWinners('todos');
            }
        }
    }
};

// ===== ROUTER FUNCTIONS =====

function parseRoute(url) {
    const path = url.split('?')[0]; // Remove query parameters
    const parts = path.split('/').filter(part => part !== '');
    
    for (const route in routes) {
        const routeParts = route.split('/').filter(part => part !== '');
        
        if (routeParts.length === parts.length) {
            const params = {};
            let match = true;
            
            for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(':')) {
                    const paramName = routeParts[i].substring(1);
                    params[paramName] = decodeURIComponent(parts[i]);
                } else if (routeParts[i] !== parts[i]) {
                    match = false;
                    break;
                }
            }
            
            if (match) {
                return { route, params };
            }
        }
    }
    
    // Default to home if no match
    return { route: '/', params: {} };
}

function navigateTo(path, updateHistory = true) {
    // Parse the route
    const { route, params } = parseRoute(path);
    const routeConfig = routes[route];
    
    if (!routeConfig) {
        console.warn(`Route not found: ${path}`);
        return navigateTo('/');
    }
    
    // Update browser history if needed
    if (updateHistory && window.location.pathname !== path) {
        window.history.pushState({ path, params }, routeConfig.title, path);
    }
    
    // Update page title
    document.title = `${routeConfig.title} - Ottaku Brasil`;
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the target page
    const targetPage = document.getElementById(routeConfig.id);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);
        
        // Initialize the page
        if (typeof routeConfig.init === 'function') {
            routeConfig.init(params);
        }
    }
    
    // Close mobile menu if open
    closeMenu();
    
    // Update active link in navigation
    updateActiveNavLink(path);
}

function updateActiveNavLink(path) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link, .menu-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current path
    const currentPath = path.split('/')[1] || 'home';
    const activeLinks = document.querySelectorAll(`[data-page="${currentPath}"]`);
    activeLinks.forEach(link => {
        link.classList.add('active');
    });
}

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

// ===== FUNÇÕES ORIGINAIS DO SITE (ATUALIZADAS) =====

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

function goHome() {
    navigateTo('/');
}

// FILTRO DE NOTÍCIAS
let currentCategory = 'todos';

function filterNews() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    document.querySelectorAll('.news-card').forEach(card => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const cat = card.getAttribute('data-category');
        const matchSearch = title.includes(searchTerm);
        const matchCat = currentCategory === 'todos' || cat === currentCategory;
        card.classList.toggle('hidden', !(matchSearch && matchCat));
    });
}

function filterByCategory(category) {
    currentCategory = category;
    
    document.querySelectorAll('#novidades .category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const btn = document.querySelector(`#novidades .category-btn[data-category="${category}"]`);
    if (btn) btn.classList.add('active');
    
    filterNews();
    
    // Update URL if not already correct
    if (category === 'todos') {
        if (window.location.pathname !== '/novidades') {
            navigateTo('/novidades', false);
        }
    } else {
        if (window.location.pathname !== `/novidades/${category}`) {
            navigateTo(`/novidades/${category}`, false);
        }
    }
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
    
    // Update URL if not already correct
    if (category === 'todos') {
        if (window.location.pathname !== '/ganhadores') {
            navigateTo('/ganhadores', false);
        }
    } else {
        if (window.location.pathname !== `/ganhadores/${category}`) {
            navigateTo(`/ganhadores/${category}`, false);
        }
    }
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

// ===== SPA EVENT LISTENERS =====

function setupSPAEvents() {
    // Intercept all internal link clicks
    document.addEventListener('click', function(e) {
        // Find the closest anchor element
        const anchor = e.target.closest('a');
        
        if (anchor && anchor.href) {
            const href = anchor.getAttribute('href');
            
            // Check if it's an internal link (starts with / and not external)
            if (href.startsWith('/') && !href.startsWith('//') && 
                !href.startsWith('http') && !href.startsWith('mailto:') && 
                !href.startsWith('tel:') && !href.startsWith('#')) {
                
                e.preventDefault();
                navigateTo(href);
            }
        }
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.path) {
            navigateTo(e.state.path, false);
        } else {
            navigateTo(window.location.pathname, false);
        }
    });
    
    // Handle search form submissions
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value.trim()) {
                // Store search in sessionStorage and navigate to news page
                sessionStorage.setItem('newsSearch', searchInput.value.trim());
                navigateTo('/novidades');
                
                // Trigger search after a short delay to allow page to load
                setTimeout(() => {
                    filterNews();
                }, 100);
            }
        });
    }
    
    // Handle category button clicks
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.closest('#novidades')) {
            btn.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                filterByCategory(category);
            });
        }
    });
    
    // Handle escape key for menu
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
    
    // Setup mobile menu links
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('/')) {
                e.preventDefault();
                navigateTo(href);
                closeMenu();
            }
        });
    });
}

// ===== SEO META TAGS MANAGEMENT =====

function updateMetaTags(routeConfig, params = {}) {
    // Update canonical URL
    let canonicalUrl = `https://ottakubrasil.online${window.location.pathname}`;
    if (window.location.search) {
        canonicalUrl += window.location.search;
    }
    
    // Create or update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;
    
    // Update Open Graph and Twitter meta tags
    const metaTags = {
        'og:url': canonicalUrl,
        'twitter:url': canonicalUrl,
        'og:title': `${routeConfig.title} - Ottaku Brasil`,
        'twitter:title': `${routeConfig.title} - Ottaku Brasil`,
    };
    
    for (const [property, content] of Object.entries(metaTags)) {
        let meta = document.querySelector(`meta[property="${property}"]`) || 
                  document.querySelector(`meta[name="${property}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            if (property.startsWith('og:')) {
                meta.setAttribute('property', property);
            } else {
                meta.setAttribute('name', property);
            }
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    }
}

// ===== INICIALIZAÇÃO =====

async function initSite() {
    try {
        // Setup SPA routing
        setupSPAEvents();
        
        // Load initial data
        await Promise.all([
            loadNews(3),
            loadQuiz(3)
        ]);
        
        // Initial render based on current URL
        const initialPath = window.location.pathname || '/';
        navigateTo(initialPath, false);
        
        // Initialize winners category buttons
        initWinnersCategoryButtons();
        
        // Check for stored search
        const storedSearch = sessionStorage.getItem('newsSearch');
        if (storedSearch && window.location.pathname.includes('/novidades')) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = storedSearch;
                setTimeout(() => {
                    filterNews();
                }, 300);
            }
            sessionStorage.removeItem('newsSearch');
        }
        
        console.log("SPA inicializado com rotas funcionais!");
    } catch (error) {
        console.error("Erro ao inicializar site:", error);
    }
}

// Iniciar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSite);
} else {
    initSite();
}

// Export functions for global access if needed
window.navigateTo = navigateTo;
window.goHome = goHome;
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.filterByCategory = filterByCategory;
window.filterWinners = filterWinners;
window.scrollToDoadores = scrollToDoadores;