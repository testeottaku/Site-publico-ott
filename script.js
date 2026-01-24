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

// ===== SISTEMA DE ROTAS SUPER SIMPLES =====

// Função para navegar sem recarregar
function handleNavigation(e, path) {
    // Prevenir comportamento padrão apenas se for um link interno
    if (e && path.startsWith('/') && !path.startsWith('//') && !path.includes('http')) {
        e.preventDefault();
        
        // Atualizar URL
        window.history.pushState({}, '', path);
        
        // Disparar evento para atualizar a página
        window.dispatchEvent(new Event('popstate'));
    }
}

// Função para carregar página baseada na URL
function loadPageFromURL() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    console.log('Carregando página para:', path, hash);
    
    // Se tiver hash (antigo sistema), converter para rota
    if (hash && hash.startsWith('#') && hash.length > 1) {
        const pageId = hash.substring(1);
        showPage(pageId);
        return;
    }
    
    // Mapear caminhos para IDs de página
    const routeMap = {
        '/': 'home',
        '/home': 'home',
        '/novidades': 'novidades',
        '/gaming': 'gaming', 
        '/parceiros': 'parceiros',
        '/quiz': 'quiz',
        '/ganhadores': 'ganhadores'
    };
    
    // Verificar se é uma rota de categoria
    if (path.startsWith('/novidades/')) {
        const parts = path.split('/');
        const category = parts[2];
        showPage('novidades');
        // Atrasar um pouco para garantir que a página carregou
        setTimeout(() => {
            if (category) filterByCategory(category, false);
        }, 100);
    } else if (path.startsWith('/ganhadores/')) {
        const parts = path.split('/');
        const category = parts[2];
        showPage('ganhadores');
        setTimeout(() => {
            if (category) filterWinners(category, false);
        }, 100);
    } else if (routeMap[path]) {
        showPage(routeMap[path]);
    } else {
        // Rota não encontrada, mostrar home
        showPage('home');
    }
}

// ===== FUNÇÕES ORIGINAIS DO SITE =====

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
    console.log('Mostrando página:', pageId);
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);
        
        // Fechar menu se aberto
        closeMenu();
        
        // Executar ações específicas da página
        switch(pageId) {
            case 'novidades':
                filterByCategory('todos');
                renderAllNews();
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
                filterWinners('todos');
                break;
            case 'home':
                renderHomeNews();
                renderQuizWinnersHome();
                break;
        }
    }
}

function goHome() {
    window.history.pushState({}, '', '/');
    showPage('home');
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

function filterByCategory(category, updateURL = true) {
    console.log('Filtrando categoria:', category);
    currentCategory = category;
    
    document.querySelectorAll('#novidades .category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const btn = document.querySelector(`#novidades .category-btn[data-category="${category}"]`);
    if (btn) btn.classList.add('active');
    
    filterNews();
    
    // Atualizar URL
    if (updateURL) {
        const url = category === 'todos' ? '/novidades' : `/novidades/${category}`;
        window.history.pushState({}, '', url);
    }
}

// FILTRO DE GANHADORES
let currentWinnerCategory = 'todos';

function filterWinners(category, updateURL = true) {
    console.log('Filtrando ganhadores:', category);
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
    
    // Atualizar URL
    if (updateURL) {
        const url = category === 'todos' ? '/ganhadores' : `/ganhadores/${category}`;
        window.history.pushState({}, '', url);
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

function scrollToDoadores() {
    const doadoresSection = document.getElementById('doadores');
    if (doadoresSection) {
        doadoresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== CONFIGURAÇÃO INICIAL SIMPLES =====

function setupSimpleSPA() {
    console.log('Configurando SPA simples...');
    
    // 1. Interceptar cliques em links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        
        if (link && link.href) {
            const url = new URL(link.href);
            const currentUrl = new URL(window.location.href);
            
            // Se for do mesmo domínio e não for um link externo
            if (url.origin === currentUrl.origin && 
                !link.target && 
                !link.hasAttribute('download') &&
                !link.href.includes('mailto:') &&
                !link.href.includes('tel:')) {
                
                // Links que devem abrir na mesma página
                if (link.href.includes('#') || 
                    link.href.includes('/novidades') ||
                    link.href.includes('/gaming') ||
                    link.href.includes('/parceiros') ||
                    link.href.includes('/quiz') ||
                    link.href.includes('/ganhadores') ||
                    link.href === currentUrl.origin + '/' ||
                    link.href === currentUrl.origin + '/home') {
                    
                    e.preventDefault();
                    window.history.pushState({}, '', url.pathname + url.search + url.hash);
                    loadPageFromURL();
                }
            }
        }
    });
    
    // 2. Configurar botões de categoria
    document.querySelectorAll('#novidades .category-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterByCategory(category);
        });
    });
    
    // 3. Configurar botões de menu
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }
    
    // 4. Configurar overlay do menu
    const overlay = document.getElementById('menuOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }
    
    // 5. Configurar botões com onclick antigo
    document.querySelectorAll('button[onclick*="showPage"]').forEach(button => {
        button.addEventListener('click', function() {
            const onclick = this.getAttribute('onclick');
            const match = onclick.match(/showPage\('(.+?)'\)/);
            if (match) {
                const pageId = match[1];
                // Mapear para URL
                let path = '/';
                if (pageId === 'novidades') path = '/novidades';
                else if (pageId === 'gaming') path = '/gaming';
                else if (pageId === 'parceiros') path = '/parceiros';
                else if (pageId === 'quiz') path = '/quiz';
                else if (pageId === 'ganhadores') path = '/ganhadores';
                else if (pageId === 'home') path = '/';
                
                window.history.pushState({}, '', path);
                loadPageFromURL();
            }
        });
    });
    
    // 6. Configurar histórico do navegador
    window.addEventListener('popstate', loadPageFromURL);
    
    // 7. Configurar escape para menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeMenu();
    });
    
    // 8. Configurar botões de ganhadores
    initWinnersCategoryButtons();
}

// ===== INICIALIZAÇÃO =====

async function initSite() {
    try {
        console.log('Iniciando site...');
        
        // Configurar SPA
        setupSimpleSPA();
        
        // Carregar dados iniciais
        await Promise.all([
            loadNews(3),
            loadQuiz(3)
        ]);
        
        // Carregar página inicial baseada na URL
        loadPageFromURL();
        
        console.log('Site iniciado com sucesso!');
    } catch (error) {
        console.error('Erro ao iniciar site:', error);
    }
}

// Iniciar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSite);
} else {
    initSite();
}

// ===== EXPORTAR FUNÇÕES PARA HTML =====

// Manter compatibilidade com onclick no HTML
window.showPage = showPage;
window.goHome = goHome;
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.filterByCategory = filterByCategory;
window.filterWinners = filterWinners;
window.scrollToDoadores = scrollToDoadores;