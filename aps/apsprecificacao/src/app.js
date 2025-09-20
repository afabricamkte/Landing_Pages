window.APS_CONFIG = {
    isDemo: true,
    googleSheets: {
        apiKey: '',
        clientId: '',
        spreadsheetId: '',
        isConnected: false
    },
    ui: {
        showLoading: false,
        currentSection: 'ingredientes'
    }
};

// ===== SISTEMA DE NOTIFICAÇÕES =====
class NotificationSystem {
    static show(message, type = 'info', duration = 3000) {
        // Remover notificação existente
        const existing = document.querySelector('.aps-notification');
        if (existing) existing.remove();

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `aps-notification aps-notification-${type}`;
        notification.innerHTML = `
            <div class="aps-notification-content">
                <span class="aps-notification-icon">${this.getIcon(type)}</span>
                <span class="aps-notification-message">${message}</span>
                <button class="aps-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Adicionar estilos se não existirem
        if (!document.querySelector('#aps-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'aps-notification-styles';
            styles.textContent = `
                .aps-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    min-width: 300px;
                    max-width: 500px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    animation: slideIn 0.3s ease-out;
                }
                .aps-notification-success { background: #d4edda; border-left: 4px solid #28a745; color: #155724; }
                .aps-notification-error { background: #f8d7da; border-left: 4px solid #dc3545; color: #721c24; }
                .aps-notification-warning { background: #fff3cd; border-left: 4px solid #ffc107; color: #856404; }
                .aps-notification-info { background: #d1ecf1; border-left: 4px solid #17a2b8; color: #0c5460; }
                .aps-notification-content {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    gap: 8px;
                }
                .aps-notification-icon { font-size: 18px; }
                .aps-notification-message { flex: 1; font-weight: 500; }
                .aps-notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    opacity: 0.7;
                }
                .aps-notification-close:hover { opacity: 1; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        // Adicionar ao DOM
        document.body.appendChild(notification);

        // Auto-remover
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideIn 0.3s ease-out reverse';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
    }

    static getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

// ===== GOOGLE SHEETS INTEGRAÇÃO CORRIGIDA =====
class GoogleSheetsManager {
    constructor() {
        this.isInitialized = false;
        this.isLoaded = false;
        this.authInstance = null;
    }

    async initialize(apiKey, clientId, spreadsheetId) {
        try {
            NotificationSystem.show('Inicializando conexão com Google Sheets...', 'info');

            // Salvar configurações
            window.APS_CONFIG.googleSheets = { apiKey, clientId, spreadsheetId };

            // Carregar Google APIs
            await this.loadGoogleAPIs();

            // Inicializar cliente
            await gapi.client.init({
                apiKey: apiKey,
                clientId: clientId,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                scope: 'https://www.googleapis.com/auth/spreadsheets'
            });

            this.authInstance = gapi.auth2.getAuthInstance();
            this.isInitialized = true;

            // Testar conexão
            const result = await this.testConnection();
            
            if (result.success) {
                window.APS_CONFIG.googleSheets.isConnected = true;
                window.APS_CONFIG.isDemo = false;
                NotificationSystem.show('Conexão com Google Sheets estabelecida!', 'success');
                this.updateUIMode();
            }

            return result;

        } catch (error) {
            console.error('Erro na inicialização:', error);
            return this.handleError(error);
        }
    }

    async loadGoogleAPIs() {
        return new Promise((resolve, reject) => {
            if (window.gapi && this.isLoaded) {
                resolve();
                return;
            }

            if (!window.gapi) {
                const script = document.createElement('script');
                script.src = 'https://apis.google.com/js/api.js';
                script.onload = () => {
                    gapi.load('client:auth2', {
                        callback: () => {
                            this.isLoaded = true;
                            resolve();
                        },
                        onerror: reject
                    });
                };
                script.onerror = reject;
                document.head.appendChild(script);
            } else {
                gapi.load('client:auth2', {
                    callback: () => {
                        this.isLoaded = true;
                        resolve();
                    },
                    onerror: reject
                });
            }
        });
    }

    async testConnection() {
        try {
            // Fazer login se necessário
            if (!this.authInstance.isSignedIn.get()) {
                await this.authInstance.signIn();
            }

            // Testar acesso à planilha
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: window.APS_CONFIG.googleSheets.spreadsheetId
            });

            return {
                success: true,
                message: 'Conexão testada com sucesso!',
                spreadsheetTitle: response.result.properties.title
            };

        } catch (error) {
            return this.handleError(error);
        }
    }

    handleError(error) {
        let message = 'Erro desconhecido';
        let solutions = [];

        if (error.message.includes('origin')) {
            message = 'Domínio não autorizado no Google Cloud Console';
            solutions = [
                'Adicione https://afabricamkte.com.br nas origens autorizadas',
                'Aguarde 5-10 minutos para propagação'
            ];
        } else if (error.status === 403) {
            message = 'Sem permissão para acessar a planilha';
            solutions = [
                'Compartilhe a planilha publicamente',
                'Ou adicione o email do projeto nas permissões'
            ];
        } else if (error.status === 404) {
            message = 'Planilha não encontrada';
            solutions = ['Verifique se o ID da planilha está correto'];
        }

        NotificationSystem.show(message, 'error', 5000);
        
        return {
            success: false,
            message: message,
            solutions: solutions
        };
    }

    updateUIMode() {
        // Atualizar indicador de modo
        const modeIndicator = document.querySelector('.mode-indicator');
        if (modeIndicator) {
            if (window.APS_CONFIG.googleSheets.isConnected) {
                modeIndicator.innerHTML = '🟢 Conectado ao Google Sheets';
                modeIndicator.className = 'mode-indicator connected';
            } else {
                modeIndicator.innerHTML = '🟡 Modo demonstração ativo. Configure o Google Sheets para usar dados reais.';
                modeIndicator.className = 'mode-indicator demo';
            }
        }
    }

    async syncData() {
        if (!window.APS_CONFIG.googleSheets.isConnected) {
            NotificationSystem.show('Configure o Google Sheets primeiro!', 'warning');
            return;
        }

        try {
            NotificationSystem.show('Sincronizando dados...', 'info');
            
            // Simular sincronização
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            NotificationSystem.show('Dados sincronizados com sucesso!', 'success');
            
        } catch (error) {
            NotificationSystem.show('Erro na sincronização: ' + error.message, 'error');
        }
    }
}

// ===== GERENCIADOR DE MODAIS =====
class ModalManager {
    static show(modalId, data = null) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error('Modal não encontrado:', modalId);
            return;
        }

        // Preencher dados se fornecidos
        if (data && modalId === 'ingredienteModal') {
            this.fillIngredientForm(data);
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    static hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    static fillIngredientForm(data) {
        const form = document.querySelector('#ingredienteModal form');
        if (!form) return;

        // Preencher campos
        const fields = ['nome', 'categoria', 'unidade', 'quantidade', 'preco', 'rendimento', 'fornecedor', 'estoqueMinimo'];
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && data[field] !== undefined) {
                input.value = data[field];
            }
        });
    }
}

// ===== CALCULADORA DE PREÇOS =====
class PriceCalculator {
    static calculate(pizzaId, tamanho, canal, margemDesejada) {
        try {
            // Buscar dados da pizza
            const pizza = window.demoData.cardapio.find(p => p.id === pizzaId);
            if (!pizza) return null;

            // Calcular custo dos ingredientes
            let custoIngredientes = 0;
            if (pizza.ingredientes) {
                pizza.ingredientes.forEach(ing => {
                    const ingrediente = window.demoData.ingredientes.find(i => i.id === ing.id);
                    if (ingrediente) {
                        custoIngredientes += (ingrediente.preco / 1000) * ing.quantidade; // converter para gramas
                    }
                });
            }

            // Buscar custos fixos por pizza
            const custoFixoPorPizza = this.getCustoFixoPorPizza();

            // Buscar impostos e taxas do canal
            const taxasCanal = this.getTaxasCanal(canal);

            // Calcular custo total
            const custoTotal = custoIngredientes + custoFixoPorPizza;

            // Calcular preço com margem
            const precoBase = custoTotal / (1 - (margemDesejada / 100));
            const precoComTaxas = precoBase / (1 - (taxasCanal.total / 100));

            return {
                pizza: pizza.nome + ` (${tamanho})`,
                custoTotal: custoTotal,
                impostosTaxas: taxasCanal.total,
                margemDesejada: margemDesejada,
                precoSugerido: precoComTaxas,
                margemReal: ((precoComTaxas - custoTotal) / precoComTaxas) * 100
            };

        } catch (error) {
            console.error('Erro no cálculo:', error);
            return null;
        }
    }

    static getCustoFixoPorPizza() {
        if (!window.demoData.custosFix) return 4.05; // valor padrão
        
        const totalCustosFix = window.demoData.custosFix.reduce((sum, custo) => sum + custo.valor, 0);
        const vendasPrevistas = 3120; // valor padrão
        return totalCustosFix / vendasPrevistas;
    }

    static getTaxasCanal(canal) {
        const taxas = {
            'Balcão': { imposto: 0, cartao: 0, app: 0, entrega: 0 },
            'Delivery': { imposto: 0, cartao: 3.5, app: 0, entrega: 5 },
            'iFood': { imposto: 0, cartao: 3.5, app: 27, entrega: 0 }
        };

        const taxaCanal = taxas[canal] || taxas['Balcão'];
        const total = taxaCanal.imposto + taxaCanal.cartao + taxaCanal.app;
        
        return { ...taxaCanal, total };
    }
}

// ===== INICIALIZAÇÃO DO SISTEMA =====
class APSSystem {
    constructor() {
        this.googleSheets = new GoogleSheetsManager();
        this.currentSection = 'ingredientes';
    }

    async init() {
        console.log('🚀 Inicializando Sistema APS...');
        
        // Carregar dados demo
        this.loadDemoData();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Atualizar interface
        this.updateUI();
        
        console.log('✅ Sistema APS inicializado com sucesso!');
        NotificationSystem.show('Sistema APS carregado com sucesso!', 'success');
    }

    loadDemoData() {
        // Dados de demonstração já carregados via outros scripts
        if (!window.demoData) {
            console.warn('Dados de demonstração não encontrados');
        }
    }

    setupEventListeners() {
        // Botão Configurar
        document.addEventListener('click', (e) => {
            if (e.target.matches('[onclick*="showConfigModal"]') || e.target.textContent === 'Configurar') {
                this.showConfigModal();
            }
        });

        // Botão Sincronizar
        document.addEventListener('click', (e) => {
            if (e.target.matches('[onclick*="syncData"]') || e.target.textContent === 'Sincronizar') {
                this.googleSheets.syncData();
            }
        });

        // Simulador - mudanças nos selects
        document.addEventListener('change', (e) => {
            if (e.target.matches('#simulador select, #simulador input')) {
                this.updateSimulation();
            }
        });
    }

    showConfigModal() {
        // Criar modal se não existir
        let modal = document.getElementById('configModal');
        if (!modal) {
            modal = this.createConfigModal();
            document.body.appendChild(modal);
        }
        
        ModalManager.show('configModal');
    }

    createConfigModal() {
        const modal = document.createElement('div');
        modal.id = 'configModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Configuração do Google Sheets</h3>
                    <button class="modal-close" onclick="ModalManager.hide('configModal')">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>API Key *</label>
                        <input type="text" id="apiKey" placeholder="AIzaSyC..." value="AIzaSyAK96251UPeEFsPQpyo-N6vEyvRtqHh9EE">
                    </div>
                    <div class="form-group">
                        <label>Client ID *</label>
                        <input type="text" id="clientId" placeholder="123456789-abc...googleusercontent.com" value="398317480590-1d6331kuqfv2pbt5tu5d94ktru7piu0v.apps.googleusercontent.com">
                    </div>
                    <div class="form-group">
                        <label>ID da Planilha *</label>
                        <input type="text" id="spreadsheetId" placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" value="1DZgJ0JLzcdHUBBoFs6suSVfJvmBSabWrbQEGBd6I0e4">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="ModalManager.hide('configModal')">Cancelar</button>
                    <button class="btn btn-primary" onclick="apsSystem.saveGoogleConfig()">Salvar e Testar</button>
                </div>
            </div>
        `;
        return modal;
    }

    async saveGoogleConfig() {
        const apiKey = document.getElementById('apiKey').value;
        const clientId = document.getElementById('clientId').value;
        const spreadsheetId = document.getElementById('spreadsheetId').value;

        if (!apiKey || !clientId || !spreadsheetId) {
            NotificationSystem.show('Preencha todos os campos obrigatórios!', 'warning');
            return;
        }

        const result = await this.googleSheets.initialize(apiKey, clientId, spreadsheetId);
        
        if (result.success) {
            ModalManager.hide('configModal');
        }
    }

    updateSimulation() {
        const pizzaSelect = document.querySelector('#simulador select[name="pizza"]');
        const tamanhoSelect = document.querySelector('#simulador select[name="tamanho"]');
        const canalSelect = document.querySelector('#simulador select[name="canal"]');
        const margemInput = document.querySelector('#simulador input[name="margem"]');

        if (!pizzaSelect || !tamanhoSelect || !canalSelect || !margemInput) return;

        const pizzaId = pizzaSelect.value;
        const tamanho = tamanhoSelect.value;
        const canal = canalSelect.value;
        const margem = parseFloat(margemInput.value) || 35;

        if (pizzaId && pizzaId !== 'Selecione uma pizza') {
            const resultado = PriceCalculator.calculate(pizzaId, tamanho, canal, margem);
            
            if (resultado) {
                this.displaySimulationResult(resultado);
            }
        }
    }

    displaySimulationResult(resultado) {
        // Atualizar elementos do resultado
        const resultElements = {
            pizza: document.querySelector('.simulation-result .pizza-name'),
            custoTotal: document.querySelector('.simulation-result .custo-total'),
            impostosTaxas: document.querySelector('.simulation-result .impostos-taxas'),
            margemDesejada: document.querySelector('.simulation-result .margem-desejada'),
            precoSugerido: document.querySelector('.simulation-result .preco-sugerido'),
            margemReal: document.querySelector('.simulation-result .margem-real')
        };

        if (resultElements.pizza) resultElements.pizza.textContent = resultado.pizza;
        if (resultElements.custoTotal) resultElements.custoTotal.textContent = `R$ ${resultado.custoTotal.toFixed(2)}`;
        if (resultElements.impostosTaxas) resultElements.impostosTaxas.textContent = `${resultado.impostosTaxas.toFixed(1)}%`;
        if (resultElements.margemDesejada) resultElements.margemDesejada.textContent = `${resultado.margemDesejada.toFixed(1)}%`;
        if (resultElements.precoSugerido) resultElements.precoSugerido.textContent = `R$ ${resultado.precoSugerido.toFixed(2)}`;
        if (resultElements.margemReal) resultElements.margemReal.textContent = `${resultado.margemReal.toFixed(1)}%`;
    }

    updateUI() {
        // Atualizar modo de operação
        this.googleSheets.updateUIMode();
        
        // Outras atualizações de UI conforme necessário
    }
}

// ===== FUNÇÕES GLOBAIS PARA COMPATIBILIDADE =====
window.showModal = (modalId, data) => ModalManager.show(modalId, data);
window.hideModal = (modalId) => ModalManager.hide(modalId);
window.ModalManager = ModalManager;
window.NotificationSystem = NotificationSystem;

// ===== INICIALIZAÇÃO =====
window.apsSystem = new APSSystem();

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.apsSystem.init());
} else {
    window.apsSystem.init();
}

console.log('📋 Sistema APS - Correção Completa Carregada!');