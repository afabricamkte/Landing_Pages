/**
 * Aplicação Principal - Pizzaria Pro
 * Gerencia inicialização, navegação e estado global da aplicação
 */

import { APP_NAME, APP_VERSION, EVENTOS, TIMEOUTS } from './utils/constants.js';
import storage from './utils/storage.js';
import toast from './components/toast.js';
import modal from './components/modal.js';

class PizzariaProApp {
    constructor() {
        this.currentModule = null;
        this.modules = new Map();
        this.isInitialized = false;
        this.eventTarget = new EventTarget();
        
        // Bind methods
        this.handleMenuClick = this.handleMenuClick.bind(this);
        this.handleMobileMenuToggle = this.handleMobileMenuToggle.bind(this);
        this.handleSidebarOverlay = this.handleSidebarOverlay.bind(this);
    }

    /**
     * Inicializa a aplicação
     */
    async init() {
        try {
            console.log(`Inicializando ${APP_NAME} v${APP_VERSION}`);
            
            // Mostra loading
            this.showLoading();
            
            // Aguarda tempo mínimo para loading
            await this.delay(TIMEOUTS.LOADING_MIN_TIME);
            
            // Inicializa componentes
            await this.initializeComponents();
            
            // Configura event listeners
            this.setupEventListeners();
            
            // Carrega módulo inicial
            await this.loadInitialModule();
            
            // Esconde loading
            this.hideLoading();
            
            // Marca como inicializado
            this.isInitialized = true;
            
            // Dispara evento de inicialização
            this.dispatchEvent('app:initialized');
            
            console.log('Aplicação inicializada com sucesso');
            
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            this.showError('Erro ao inicializar aplicação. Recarregue a página.');
        }
    }

    /**
     * Inicializa componentes da aplicação
     */
    async initializeComponents() {
        // Verifica se elementos essenciais existem
        const requiredElements = [
            'sidebar',
            'content-body',
            'page-title',
            'page-subtitle'
        ];
        
        for (const elementId of requiredElements) {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Elemento obrigatório não encontrado: ${elementId}`);
            }
        }
        
        // Inicializa storage
        if (!storage.isAvailable) {
            console.warn('LocalStorage não disponível - dados não serão persistidos');
        }
        
        // Configura listeners de storage
        storage.addEventListener(EVENTOS.DADOS_SALVOS, (event) => {
            console.log('Dados salvos:', event.detail.key);
        });
        
        storage.addEventListener(EVENTOS.ERRO_OCORRIDO, (event) => {
            console.error('Erro no storage:', event.detail);
            toast.error('Erro ao salvar dados');
        });
    }

    /**
     * Configura event listeners globais
     */
    setupEventListeners() {
        // Menu lateral
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', this.handleMenuClick);
        });
        
        // Menu mobile
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', this.handleMobileMenuToggle);
        }
        
        // Overlay do sidebar
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', this.handleSidebarOverlay);
        }
        
        // Venda rápida
        const quickSaleBtn = document.getElementById('quick-sale-btn');
        if (quickSaleBtn) {
            quickSaleBtn.addEventListener('click', () => {
                this.loadModule('vendas');
            });
        }
        
        // Eventos de teclado globais
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S para salvar
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.dispatchEvent('app:save-requested');
            }
            
            // Ctrl/Cmd + N para novo
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.dispatchEvent('app:new-requested');
            }
        });
        
        // Eventos de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.dispatchEvent('app:focus');
            } else {
                this.dispatchEvent('app:blur');
            }
        });
        
        // Eventos de redimensionamento
        window.addEventListener('resize', this.debounce(() => {
            this.dispatchEvent('app:resize');
        }, 250));
        
        // Eventos de erro global
        window.addEventListener('error', (event) => {
            console.error('Erro global:', event.error);
            toast.error('Ocorreu um erro inesperado');
        });
        
        // Eventos de promise rejeitada
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rejeitada:', event.reason);
            toast.error('Erro de processamento');
        });
    }

    /**
     * Carrega módulo inicial
     */
    async loadInitialModule() {
        // Verifica se há módulo na URL
        const hash = window.location.hash.substring(1);
        const initialModule = hash || 'dashboard';
        
        await this.loadModule(initialModule);
    }

    /**
     * Manipula clique no menu
     */
    async handleMenuClick(event) {
        event.preventDefault();
        
        const menuItem = event.currentTarget;
        const module = menuItem.dataset.module;
        
        if (module) {
            await this.loadModule(module);
        }
    }

    /**
     * Carrega módulo
     */
    async loadModule(moduleName) {
        try {
            // Verifica se já está carregado
            if (this.currentModule === moduleName) {
                return;
            }
            
            // Mostra loading se necessário
            const loadingId = toast.loading(`Carregando ${moduleName}...`);
            
            // Desativa módulo atual
            if (this.currentModule) {
                await this.deactivateModule(this.currentModule);
            }
            
            // Carrega novo módulo
            const moduleInstance = await this.getModule(moduleName);
            
            // Ativa novo módulo
            await this.activateModule(moduleName, moduleInstance);
            
            // Atualiza interface
            this.updateUI(moduleName);
            
            // Atualiza URL
            this.updateURL(moduleName);
            
            // Remove loading
            toast.hide(loadingId);
            
            // Dispara evento
            this.dispatchEvent('module:loaded', { module: moduleName });
            
        } catch (error) {
            console.error(`Erro ao carregar módulo ${moduleName}:`, error);
            toast.error(`Erro ao carregar ${moduleName}`);
        }
    }

    /**
     * Obtém instância do módulo
     */
    async getModule(moduleName) {
        // Verifica se já está em cache
        if (this.modules.has(moduleName)) {
            return this.modules.get(moduleName);
        }
        
        // Carrega módulo dinamicamente
        try {
            const moduleFile = await import(`./modules/${moduleName}.js`);
            const ModuleClass = moduleFile.default;
            
            if (!ModuleClass) {
                throw new Error(`Módulo ${moduleName} não exporta classe padrão`);
            }
            
            const instance = new ModuleClass(this);
            this.modules.set(moduleName, instance);
            
            return instance;
            
        } catch (error) {
            console.error(`Erro ao importar módulo ${moduleName}:`, error);
            throw new Error(`Módulo ${moduleName} não encontrado`);
        }
    }

    /**
     * Ativa módulo
     */
    async activateModule(moduleName, moduleInstance) {
        try {
            // Chama método de ativação se existir
            if (typeof moduleInstance.activate === 'function') {
                await moduleInstance.activate();
            }
            
            // Renderiza módulo
            if (typeof moduleInstance.render === 'function') {
                const content = await moduleInstance.render();
                this.setContent(content);
            }
            
            this.currentModule = moduleName;
            
        } catch (error) {
            console.error(`Erro ao ativar módulo ${moduleName}:`, error);
            throw error;
        }
    }

    /**
     * Desativa módulo
     */
    async deactivateModule(moduleName) {
        const moduleInstance = this.modules.get(moduleName);
        
        if (moduleInstance && typeof moduleInstance.deactivate === 'function') {
            try {
                await moduleInstance.deactivate();
            } catch (error) {
                console.error(`Erro ao desativar módulo ${moduleName}:`, error);
            }
        }
    }

    /**
     * Atualiza interface do usuário
     */
    updateUI(moduleName) {
        // Atualiza menu ativo
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.module === moduleName) {
                item.classList.add('active');
            }
        });
        
        // Atualiza título e subtítulo
        const moduleInfo = this.getModuleInfo(moduleName);
        
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            titleElement.textContent = moduleInfo.title;
        }
        
        const subtitleElement = document.getElementById('page-subtitle');
        if (subtitleElement) {
            subtitleElement.textContent = moduleInfo.subtitle;
        }
        
        // Fecha menu mobile se aberto
        this.closeMobileMenu();
    }

    /**
     * Obtém informações do módulo
     */
    getModuleInfo(moduleName) {
        const moduleInfos = {
            dashboard: {
                title: 'Dashboard',
                subtitle: 'Visão geral do seu negócio'
            },
            ingredientes: {
                title: 'Ingredientes',
                subtitle: 'Gestão de ingredientes e matérias-primas'
            },
            receitas: {
                title: 'Receitas',
                subtitle: 'Criação e gestão de receitas de pizzas'
            },
            cardapio: {
                title: 'Cardápio',
                subtitle: 'Visualização do cardápio completo'
            },
            estoque: {
                title: 'Controle de Estoque',
                subtitle: 'Gestão de entradas e saídas de estoque'
            },
            compras: {
                title: 'Compras',
                subtitle: 'Registro de compras e fornecedores'
            },
            vendas: {
                title: 'Registrar Vendas',
                subtitle: 'Registro de vendas e controle de caixa'
            },
            resultados: {
                title: 'Resultados Diários',
                subtitle: 'Controle de faturamento e metas'
            },
            custos: {
                title: 'Custos Operacionais',
                subtitle: 'Gestão de custos fixos e variáveis'
            },
            precos: {
                title: 'Tabela de Preços',
                subtitle: 'Precificação por canal de venda'
            },
            simulador: {
                title: 'Simulador',
                subtitle: 'Simulação de cenários de precificação'
            },
            analises: {
                title: 'Análises',
                subtitle: 'Relatórios e análises de performance'
            },
            exportar: {
                title: 'Exportar Dados',
                subtitle: 'Backup e exportação de dados'
            },
            configuracoes: {
                title: 'Configurações',
                subtitle: 'Configurações do sistema'
            },
            backup: {
                title: 'Backup',
                subtitle: 'Backup e restauração de dados'
            }
        };
        
        return moduleInfos[moduleName] || {
            title: moduleName,
            subtitle: 'Módulo do sistema'
        };
    }

    /**
     * Define conteúdo da área principal
     */
    setContent(content) {
        const contentBody = document.getElementById('content-body');
        if (!contentBody) return;
        
        if (typeof content === 'string') {
            contentBody.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            contentBody.innerHTML = '';
            contentBody.appendChild(content);
        }
    }

    /**
     * Atualiza URL
     */
    updateURL(moduleName) {
        const newURL = `${window.location.pathname}#${moduleName}`;
        window.history.pushState({ module: moduleName }, '', newURL);
    }

    /**
     * Manipula toggle do menu mobile
     */
    handleMobileMenuToggle() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('active');
        }
    }

    /**
     * Manipula clique no overlay do sidebar
     */
    handleSidebarOverlay() {
        this.closeMobileMenu();
    }

    /**
     * Fecha menu mobile
     */
    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    /**
     * Mostra tela de loading
     */
    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
        
        if (app) {
            app.style.display = 'none';
        }
    }

    /**
     * Esconde tela de loading
     */
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
        
        if (app) {
            app.style.display = 'flex';
        }
    }

    /**
     * Mostra erro crítico
     */
    showError(message) {
        const loadingScreen = document.getElementById('loading-screen');
        
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div style="font-size: 4rem; margin-bottom: 20px;">❌</div>
                    <h2>Erro</h2>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        Recarregar Página
                    </button>
                </div>
            `;
        }
    }

    /**
     * Utilitário debounce
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Utilitário delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Dispara evento customizado
     */
    dispatchEvent(eventName, detail = null) {
        const event = new CustomEvent(eventName, { detail });
        this.eventTarget.dispatchEvent(event);
        
        // Também dispara no document para compatibilidade
        document.dispatchEvent(event);
    }

    /**
     * Adiciona listener de evento
     */
    addEventListener(eventName, callback) {
        this.eventTarget.addEventListener(eventName, callback);
    }

    /**
     * Remove listener de evento
     */
    removeEventListener(eventName, callback) {
        this.eventTarget.removeEventListener(eventName, callback);
    }

    /**
     * Obtém módulo atual
     */
    getCurrentModule() {
        return this.currentModule;
    }

    /**
     * Verifica se aplicação está inicializada
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Obtém estatísticas da aplicação
     */
    getStats() {
        return {
            version: APP_VERSION,
            currentModule: this.currentModule,
            modulesLoaded: this.modules.size,
            isInitialized: this.isInitialized,
            storageAvailable: storage.isAvailable
        };
    }

    /**
     * Reinicia aplicação
     */
    async restart() {
        console.log('Reiniciando aplicação...');
        
        // Desativa módulo atual
        if (this.currentModule) {
            await this.deactivateModule(this.currentModule);
        }
        
        // Limpa cache de módulos
        this.modules.clear();
        this.currentModule = null;
        this.isInitialized = false;
        
        // Reinicia componentes
        toast.reset();
        modal.reset();
        
        // Reinicializa
        await this.init();
    }
}

// Inicializa aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new PizzariaProApp();
    await window.app.init();
});

// Exporta para uso em módulos
export default PizzariaProApp;

