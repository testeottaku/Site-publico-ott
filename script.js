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

// ===== SISTEMA DE ROTAS SIMPLES =====

// Mapeamento de rotas
const routes = {
    '': { id: 'home', title: 'Home | Ottaku Brasil' },
    '/': { id: 'home', title: 'Home | Ottaku Brasil' },
    '/home': { id: 'home', title: 'Home | Ottaku Brasil' },
    '/novidades': { id: 'novidades', title: 'Novidades | Ottaku Brasil' },
    '/gaming': { id: 'gaming', title: 'Gaming | Ottaku Brasil' },
    '/parceiros': { id: 'parceiros', title: 'Parceiros | Ottaku Brasil' },
    '/quiz': { id: 'quiz', title: 'Quiz | Ottaku Brasil' },
    '/ganhadores': { id: 'ganhadores', title: 'Ganhadores | Ottaku Brasil' },
    '/apoie': { id: 'home', title: 'Apoie | Ottaku Brasil', section: 'doadores' }
};

// Função para navegar
function navigateTo(path) {
    console.log('Navegando para:', path);
    
    // Parsear a rota
    let route = path;
    let category = null;
    
    // Verificar se tem categoria
    if (path.startsWith('/novidades/')) {
        const parts = path.split('/');
        route = '/novidades';
        if (parts.length > 2) {
            category = parts[2];
        }
    } else if (path.startsWith('/ganhadores/')) {
        const parts = path.split('/');
        route = '/ganhadores';
        if (parts.length > 2) {
            category = parts[2];
        }
    }
    
    // Verificar se a rota existe
    const routeInfo = routes[route];
    if (!routeInfo) {
        console.warn('Rota não encontrada:', route);
        navigateTo('/');
        return;
    }
    
    // Atualizar URL
    if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
    }
    
    // Mostrar página
    showPage(routeInfo.id, category);
    
    // Atualizar título
    document.title = routeInfo.title;
    
    // Se for a página apoie, rolar para a seção
    if (route === '/apoie' && routeInfo.section) {
        setTimeout(() => {
            const section = document.getElementById(routeInfo.section);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }, 300);
    }
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

function showPage(pageId, category = null) {
    console.log('Mostrando página:', pageId, 'Categoria:', category);
    
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Mostrar a página solicitada
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);
        
        // Fechar menu se aberto
        closeMenu();
        
        // Executar ações específicas da página
        switch(pageId) {
            case 'novidades':
                renderAllNews().then(() => {
                    if (category && category !== 'null' && category !== 'undefined') {
                        filterByCategory(category, false);
                    } else {
                        filterByCategory('todos', false);
                    }
                });
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
                if (category && category !== 'null' && category !== 'undefined') {
                    filterWinners(category, false);
                } else {
                    filterWinners('todos', false);
                }
                initWinnersCategoryButtons();
                break;
            case 'home':
                renderHomeNews();
                renderQuizWinnersHome();
                break;
        }
    } else {
        console.error('Página não encontrada:', pageId);
        showPage('home');
    }
}

function goHome() {
    navigateTo('/');
}

// FILTRO DE NOTÍCIAS
let currentCategory = 'todos';

function filterNews() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const newsCards = document.querySelectorAll('.news-card');
    
    newsCards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const cat = card.getAttribute('data-category') || '';
        const matchSearch = title.includes(searchTerm);
        const matchCat = currentCategory === 'todos' || cat === currentCategory;
        
        // Mostrar ou esconder baseado nos filtros
        if (matchSearch && matchCat) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterByCategory(category, updateURL = true) {
    console.log('Filtrando por categoria:', category);
    
    // Validar categoria
    if (!category || category === 'null' || category === 'undefined') {
        category = 'todos';
    }
    
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
    
    // Atualizar URL se solicitado
    if (updateURL) {
        const url = category === 'todos' ? '/novidades' : `/novidades/${category}`;
        if (window.location.pathname !== url) {
            window.history.pushState({}, '', url);
        }
    }
}

// FILTRO DE GANHADORES
let currentWinnerCategory = 'todos';

function filterWinners(category, updateURL = true) {
    console.log('Filtrando ganhadores por categoria:', category);
    
    // Validar categoria
    if (!category || category === 'null' || category === 'undefined') {
        category = 'todos';
    }
    
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
    
    // Atualizar URL se solicitado
    if (updateURL) {
        const url = category === 'todos' ? '/ganhadores' : `/ganhadores/${category}`;
        if (window.location.pathname !== url) {
            window.history.pushState({}, '', url);
        }
    }
}

function initWinnersCategoryButtons() {
    document.querySelectorAll('#ganhadores .category-btn').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            if (category) {
                filterWinners(category);
            }
        });
    });
}

function scrollToDoadores() {
    navigateTo('/apoie');
}

// ===== CONFIGURAÇÃO DE EVENTOS =====

function setupEventListeners() {
    console.log('Configurando eventos...');
    
    // 1. Botão hamburger (menu)
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
        console.log('Botão hamburger encontrado e configurado');
    } else {
        console.warn('Botão hamburger não encontrado');
    }
    
    // 2. Overlay do menu
    const overlay = document.getElementById('menuOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }
    
    // 3. Links de navegação (exceto links externos)
    document.addEventListener('click', function(e) {
        let target = e.target;
        
        // Encontrar o link mais próximo
        while (target && target.tagName !== 'A') {
            target = target.parentElement;
        }
        
        if (target && target.tagName === 'A') {
            const href = target.getAttribute('href');
            
            // Verificar se é um link interno
            if (href && href.startsWith('/') && !href.startsWith('//') && !href.includes('http')) {
                e.preventDefault();
                navigateTo(href);
            }
            // Verificar se é um link âncora (#) na home
            else if (href && href.startsWith('#') && window.location.pathname === '/') {
                const sectionId = href.substring(1);
                const section = document.getElementById(sectionId);
                if (section) {
                    e.preventDefault();
                    section.scrollIntoView({ behavior: 'smooth' });
                    closeMenu();
                }
            }
            // Verificar se é um link de categoria com hash antigo
            else if (href && href.includes('#')) {
                const hash = href.split('#')[1];
                if (hash === 'novidades' || hash === 'gaming' || hash === 'parceiros' || hash === 'quiz' || hash === 'ganhadores') {
                    e.preventDefault();
                    navigateTo('/' + hash);
                }
            }
        }
    });
    
    // 4. Botões de categoria de novidades
    document.querySelectorAll('#novidades .category-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            if (category) {
                filterByCategory(category);
            }
        });
    });
    
    // 5. Botões com onclick antigo (para compatibilidade)
    document.querySelectorAll('[onclick*="showPage"]').forEach(element => {
        const onclick = element.getAttribute('onclick');
        const match = onclick.match(/showPage\('(.+?)'\)/);
        
        if (match) {
            const pageId = match[1];
            element.removeAttribute('onclick');
            
            element.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Mapear pageId para URL
                let path = '/';
                if (pageId === 'novidades') path = '/novidades';
                else if (pageId === 'gaming') path = '/gaming';
                else if (pageId === 'parceiros') path = '/parceiros';
                else if (pageId === 'quiz') path = '/quiz';
                else if (pageId === 'ganhadores') path = '/ganhadores';
                else if (pageId === 'home') path = '/';
                
                navigateTo(path);
            });
        }
    });
    
    // 6. Escape para fechar menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
    
    // 7. Botões específicos da home
    const verNovidadesBtn = document.querySelector('a[href="#novidades"]');
    if (verNovidadesBtn) {
        verNovidadesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo('/novidades');
        });
    }
    
    const participarQuizBtn = document.querySelector('a[href="#quiz"]');
    if (participarQuizBtn) {
        participarQuizBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo('/quiz');
        });
    }
    
    // 8. Histórico do navegador (voltar/avançar)
    window.addEventListener('popstate', function() {
        const path = window.location.pathname;
        navigateTo(path);
    });
    
    console.log('Eventos configurados com sucesso');
}

// ===== INICIALIZAÇÃO =====

async function initSite() {
    try {
        console.log('Inicializando site...');
        
        // Configurar eventos
        setupEventListeners();
        
        // Carregar dados iniciais
        await Promise.all([
            loadNews(3),
            loadQuiz(3)
        ]);
        
        // Processar URL atual
        const path = window.location.pathname;
        
        // Verificar se é uma URL com categoria
        if (path.startsWith('/novidades/')) {
            const parts = path.split('/');
            const category = parts[2];
            showPage('novidades', category);
        } else if (path.startsWith('/ganhadores/')) {
            const parts = path.split('/');
            const category = parts[2];
            showPage('ganhadores', category);
        } else {
            // Navegar para a rota base
            navigateTo(path);
        }
        
        console.log('Site inicializado com sucesso!');
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

// ===== FUNÇÕES GLOBAIS (para compatibilidade) =====

window.showPage = function(pageId) {
    let path = '/';
    if (pageId === 'novidades') path = '/novidades';
    else if (pageId === 'gaming') path = '/gaming';
    else if (pageId === 'parceiros') path = '/parceiros';
    else if (pageId === 'quiz') path = '/quiz';
    else if (pageId === 'ganhadores') path = '/ganhadores';
    else if (pageId === 'home') path = '/';
    
    navigateTo(path);
};

window.goHome = goHome;
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.filterByCategory = filterByCategory;
window.filterWinners = filterWinners;
window.scrollToDoadores = scrollToDoadores;