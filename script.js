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

// ===== SISTEMA DE ROTAS SIMPLES E FUNCIONAL =====

// Mapeamento de rotas
const routes = {
    '': { page: 'home', title: 'Home | Ottaku Brasil' },
    'home': { page: 'home', title: 'Home | Ottaku Brasil' },
    'novidades': { page: 'novidades', title: 'Novidades | Ottaku Brasil' },
    'gaming': { page: 'gaming', title: 'Gaming | Ottaku Brasil' },
    'parceiros': { page: 'parceiros', title: 'Parceiros | Ottaku Brasil' },
    'quiz': { page: 'quiz', title: 'Quiz | Ottaku Brasil' },
    'ganhadores': { page: 'ganhadores', title: 'Ganhadores | Ottaku Brasil' },
    'apoie': { page: 'apoie', title: 'Apoie | Ottaku Brasil' }
};

// Estado atual
let currentRoute = '';

// Navegação principal
function navigateTo(route, category = null) {
    console.log('Navegando para:', route, 'categoria:', category);
    
    // Limpar a rota
    route = route.toLowerCase().replace('/', '');
    if (!route) route = 'home';
    
    // Atualizar estado
    currentRoute = route;
    
    // Verificar se a rota existe
    if (!routes[route]) {
        console.warn('Rota não encontrada:', route);
        route = 'home';
        currentRoute = 'home';
    }
    
    // Atualizar URL no navegador
    let url = '/' + route;
    if (category) {
        url += '/' + category;
    }
    
    if (window.location.pathname !== url) {
        window.history.pushState({ route, category }, '', url);
    }
    
    // Mostrar a página
    showPage(route, category);
    
    // Atualizar título
    document.title = routes[route].title;
    
    // Atualizar links ativos
    updateActiveLinks(route);
    
    // Fechar menu se aberto
    closeMenu();
}

// Mostrar página
function showPage(pageId, category = null) {
    console.log('Mostrando página:', pageId, 'categoria:', category);
    
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Mostrar a página solicitada
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);
        
        // Executar ações específicas da página
        switch(pageId) {
            case 'home':
                renderHomeNews();
                renderQuizWinnersHome();
                break;
            case 'novidades':
                renderAllNews();
                if (category) {
                    // Atrasar um pouco para garantir que o DOM esteja pronto
                    setTimeout(() => filterByCategory(category), 100);
                } else {
                    filterByCategory('todos');
                }
                break;
            case 'gaming':
                renderGamingCards();
                break;
            case 'parceiros':
                renderPartners();
                break;
            case 'quiz':
                renderQuizWinnersHome();
                break;
            case 'ganhadores':
                if (category) {
                    // Atrasar um pouco para garantir que o DOM esteja pronto
                    setTimeout(() => filterWinners(category), 100);
                } else {
                    filterWinners('todos');
                }
                initWinnersCategoryButtons();
                break;
            case 'apoie':
                // Rolar para seção de doadores na home
                setTimeout(() => {
                    const doadoresSection = document.getElementById('doadores');
                    if (doadoresSection) {
                        doadoresSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    // Mostrar home também
                    document.getElementById('home').classList.add('active');
                }, 100);
                break;
        }
    } else {
        console.error('Página não encontrada:', pageId);
        navigateTo('home');
    }
}

// Atualizar links ativos
function updateActiveLinks(route) {
    // Remover active de todos os links
    document.querySelectorAll('.nav-link, .menu-link, .category-btn').forEach(link => {
        link.classList.remove('active');
    });
    
    // Adicionar active aos links da rota atual
    document.querySelectorAll(`[data-page="${route}"], [href*="${route}"]`).forEach(link => {
        if (link.href.includes(route) || link.getAttribute('data-page') === route) {
            link.classList.add('active');
        }
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
    
    newsContainer.innerHTML = '';
    
    news.forEach((item) => {
        const isInstagram = item.targetType === 'instagram';
        const isWhatsApp = item.targetType === 'whatsapp';
        const isSite = item.targetType === 'site';
        
        const color = item.color || (isInstagram ? '#fbbf24' : '#22c55e');
        
        let destinoIcon = 'fab fa-whatsapp';
        let destinoText = 'Ler no WhatsApp';
        
        if (isInstagram) {
            destinoIcon = 'fab fa-instagram';
            destinoText = 'Ver no Instagram';
        } else if (isSite) {
            destinoIcon = 'fas fa-external-link-alt';
            destinoText = 'Ler matéria completa';
        }
        
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
    
    newsGrid.innerHTML = '';
    
    news.forEach((item) => {
        const isInstagram = item.targetType === 'instagram';
        const isWhatsApp = item.targetType === 'whatsapp';
        const isSite = item.targetType === 'site';
        
        const color = item.color || (isInstagram ? '#fbbf24' : '#22c55e');
        
        let destinoIcon = 'fab fa-whatsapp';
        let destinoText = 'Ler no WhatsApp';
        
        if (isInstagram) {
            destinoIcon = 'fab fa-instagram';
            destinoText = 'Ver no Instagram';
        } else if (isSite) {
            destinoIcon = 'fas fa-external-link-alt';
            destinoText = 'Ler matéria completa';
        }
        
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
    
    partnersGrid.innerHTML = '';
    
    partners.forEach((partner) => {
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
    
    gamingContainer.innerHTML = '';
    
    gamingCards.forEach((card) => {
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

// ===== FUNÇÕES DO MENU =====

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

// ===== FILTROS E CATEGORIAS =====

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
    console.log('Filtrando por categoria:', category);
    currentCategory = category;
    
    // Atualizar botões ativos
    document.querySelectorAll('#novidades .category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
    
    // Aplicar filtro
    filterNews();
    
    // Atualizar URL se não for a mesma
    const expectedPath = category === 'todos' ? '/novidades' : `/novidades/${category}`;
    if (window.location.pathname !== expectedPath) {
        window.history.replaceState({}, '', expectedPath);
    }
}

let currentWinnerCategory = 'todos';

function filterWinners(category) {
    console.log('Filtrando ganhadores por categoria:', category);
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
    
    // Atualizar URL se não for a mesma
    const expectedPath = category === 'todos' ? '/ganhadores' : `/ganhadores/${category}`;
    if (window.location.pathname !== expectedPath) {
        window.history.replaceState({}, '', expectedPath);
    }
}

function initWinnersCategoryButtons() {
    document.querySelectorAll('#ganhadores .category-btn').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterWinners(category);
        });
    });
}

// ===== CONFIGURAÇÃO DE EVENTOS =====

function setupAllEventListeners() {
    console.log('Configurando todos os eventos...');
    
    // 1. Links de navegação principais
    document.querySelectorAll('a.nav-link, a.menu-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href.startsWith('/')) {
                const route = href.replace('/', '').toLowerCase();
                navigateTo(route);
            }
        });
    });
    
    // 2. Botões de categoria de novidades
    document.querySelectorAll('#novidades .category-btn').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            navigateTo('novidades', category);
        });
    });
    
    // 3. Botões de categoria de ganhadores
    document.querySelectorAll('#ganhadores .category-btn').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            navigateTo('ganhadores', category);
        });
    });
    
    // 4. Logo/home
    document.querySelectorAll('.logo, a[href="/"], a[href="/home"]').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.href && this.href.includes(window.location.origin)) {
                e.preventDefault();
                navigateTo('home');
            }
        });
    });
    
    // 5. Botão de menu hamburger
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }
    
    // 6. Overlay do menu
    const overlay = document.getElementById('menuOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }
    
    // 7. Botão de pesquisa
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            filterNews();
        });
    }
    
    // 8. Escape para fechar menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeMenu();
    });
    
    // 9. Botões com onclick antigo (para compatibilidade)
    document.querySelectorAll('button[onclick*="showPage"]').forEach(button => {
        const onclick = button.getAttribute('onclick');
        const match = onclick.match(/showPage\('(.+?)'\)/);
        if (match) {
            const pageId = match[1];
            button.removeAttribute('onclick');
            button.addEventListener('click', function(e) {
                e.preventDefault();
                navigateTo(pageId);
            });
        }
    });
}

// ===== MANIPULAÇÃO DO HISTÓRICO =====

function setupHistory() {
    // Lidar com botões voltar/avançar
    window.addEventListener('popstate', function(e) {
        const path = window.location.pathname;
        console.log('Popstate detectado, path:', path);
        
        // Parsear a URL
        const parts = path.split('/').filter(p => p);
        let route = 'home';
        let category = null;
        
        if (parts.length > 0) {
            route = parts[0].toLowerCase();
            if (parts.length > 1) {
                category = parts[1];
            }
        }
        
        navigateTo(route, category);
    });
}

// ===== INICIALIZAÇÃO =====

async function initSite() {
    try {
        console.log('Inicializando site SPA...');
        
        // 1. Configurar eventos
        setupAllEventListeners();
        setupHistory();
        
        // 2. Carregar dados iniciais
        await Promise.all([
            loadNews(3),
            loadQuiz(3)
        ]);
        
        // 3. Processar URL atual
        const path = window.location.pathname;
        console.log('URL atual:', path);
        
        if (path === '/' || path === '/home') {
            navigateTo('home');
        } else {
            const parts = path.split('/').filter(p => p);
            let route = 'home';
            let category = null;
            
            if (parts.length > 0) {
                route = parts[0].toLowerCase();
                if (parts.length > 1) {
                    category = parts[1];
                }
            }
            
            // Verificar se a rota existe
            if (routes[route]) {
                navigateTo(route, category);
            } else {
                // Se não existir, redirecionar para home
                navigateTo('home');
            }
        }
        
        // 4. Inicializar botões de ganhadores
        initWinnersCategoryButtons();
        
        console.log('Site SPA inicializado com sucesso!');
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

// ===== FUNÇÕES GLOBAIS =====

// Tornar funções disponíveis globalmente
window.navigateTo = navigateTo;
window.showPage = (pageId) => navigateTo(pageId);
window.goHome = () => navigateTo('home');
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.filterByCategory = filterByCategory;
window.filterWinners = filterWinners;
window.scrollToDoadores = () => {
    navigateTo('apoie');
};