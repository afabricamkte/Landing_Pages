// Aplicação Principal do Sistema APS
class APSApp {
    constructor() {
        this.currentSection = 'ingredientes';
        this.data = {
            ingredientes: [],
            pizzas: [],
            custosFixos: [],
            custosVariaveis: [],
            impostosTaxas: [],
            parametros: {},
            recheios: []
        };
        this.isOnline = navigator.onLine;
        this.isDemoMode = true; // Inicia em modo demo
        
        this.init();
    }

    async init() {
        try {
            Utils.log('Inicializando aplicação APS...');
            
            // Configura eventos
            this.setupEventListeners();
            
            // Verifica configuração do Google Sheets
            await this.checkConfiguration();
            
            // Carrega dados
            await this.loadData();
            
            // Inicializa interface
            this.initializeUI();
            
            // Remove loading screen
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
            }, 1000);
            
            Utils.log('Aplicação inicializada com sucesso');
            
        } catch (error) {
            Utils.error('Erro ao inicializar aplicação', error);
            this.handleInitError(error);
        }
    }

    setupEventListeners() {
        // Navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Botões de ação
        document.getElementById('addIngredienteBtn')?.addEventListener('click', () => this.showIngredienteModal());
        document.getElementById('addPizzaBtn')?.addEventListener('click', () => this.showPizzaModal());
        document.getElementById('addCustoFixoBtn')?.addEventListener('click', () => this.showCustoFixoModal());
        document.getElementById('syncBtn')?.addEventListener('click', () => this.syncData());

        // Modais
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                Components.hideModal(modal.id);
            });
        });

        // Formulários
        document.getElementById('ingredienteForm')?.addEventListener('submit', (e) => this.handleIngredienteSubmit(e));
        document.getElementById('pizzaForm')?.addEventListener('submit', (e) => this.handlePizzaSubmit(e));

        // Filtros
        document.getElementById('filtroCategoria')?.addEventListener('change', () => this.filterIngredientes());
        document.getElementById('buscaIngrediente')?.addEventListener('input', () => this.filterIngredientes());

        // Simulador
        document.getElementById('simuladorPizza')?.addEventListener('change', () => this.updateSimulator());
        document.getElementById('simuladorTamanho')?.addEventListener('change', () => this.updateSimulator());
        document.getElementById('simuladorCanal')?.addEventListener('change', () => this.updateSimulator());
        document.getElementById('simuladorMargem')?.addEventListener('input', () => this.updateSimulator());

        // Status de conexão
        window.addEventListener('online', () => {
            this.isOnline = true;
            Components.showToast('Conexão restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            Components.showToast('Sem conexão com a internet', 'warning');
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    async checkConfiguration() {
        const config = validateConfig();
        
        if (!config.valid) {
            Utils.warn('Configuração incompleta, usando modo demo', config.missing);
            this.isDemoMode = true;
            Components.showToast('Modo demonstração ativo. Configure o Google Sheets para usar dados reais.', 'info', 5000);
        } else {
            this.isDemoMode = false;
            try {
                const testResult = await sheetsAPI.testConnection();
                if (!testResult.success) {
                    throw new Error(testResult.message);
                }
                Components.showToast('Conectado ao Google Sheets', 'success');
            } catch (error) {
                Utils.error('Erro na conexão com Google Sheets', error);
                this.isDemoMode = true;
                Components.showToast('Erro na conexão. Usando modo demo.', 'warning');
            }
        }
    }

    async loadData() {
        Components.showLoading('Carregando dados...');
        
        try {
            if (this.isDemoMode) {
                await this.loadDemoData();
            } else {
                await this.loadRealData();
            }
            
            Utils.log('Dados carregados com sucesso');
        } catch (error) {
            Utils.error('Erro ao carregar dados', error);
            await this.loadDemoData(); // Fallback para dados demo
            Components.showToast('Erro ao carregar dados. Usando dados de demonstração.', 'warning');
        } finally {
            Components.hideLoading();
        }
    }

    async loadDemoData() {
        Utils.log('Carregando dados de demonstração...');
        
        // Carrega dados de exemplo do config
        this.data.ingredientes = CONFIG.DADOS_EXEMPLO.INGREDIENTES.map(item => ({
            ...item,
            custoUnitario: Utils.calcularCustoUnitario(item.preco, item.quantidade, item.rendimento, item.unidade)
        }));
        
        this.data.custosFixos = CONFIG.DADOS_EXEMPLO.CUSTOS_FIXOS;
        this.data.custosVariaveis = CONFIG.DADOS_EXEMPLO.CUSTOS_VARIAVEIS;
        this.data.impostosTaxas = CONFIG.DADOS_EXEMPLO.IMPOSTOS_TAXAS;
        this.data.parametros = CONFIG.DADOS_EXEMPLO.PARAMETROS.reduce((acc, item) => {
            acc[item.parametro] = item.valor;
            return acc;
        }, {});

        // Dados de exemplo para pizzas
        this.data.pizzas = [
            {
                id: 'PIZ001',
                nome: 'Mussarela',
                categoria: 'Tradicional',
                idMassa: 'REC001',
                idMolho: 'REC002',
                custoRecheios: 9.48,
                popularidade: 10,
                recheios: [
                    { ingredienteId: 'ING002', nome: 'Mussarela', quantidades: { P: 150, M: 180, G: 200, GG: 250 } }
                ]
            },
            {
                id: 'PIZ002',
                nome: 'Calabresa',
                categoria: 'Tradicional',
                idMassa: 'REC001',
                idMolho: 'REC002',
                custoRecheios: 12.50,
                popularidade: 9,
                recheios: [
                    { ingredienteId: 'ING002', nome: 'Mussarela', quantidades: { P: 100, M: 120, G: 130, GG: 160 } },
                    { ingredienteId: 'ING004', nome: 'Calabresa', quantidades: { P: 80, M: 100, G: 120, GG: 150 } }
                ]
            }
        ];

        // Calcula preços
        this.calculatePrices();
    }

    async loadRealData() {
        Utils.log('Carregando dados do Google Sheets...');
        
        const [ingredientes, pizzas, custosFixos, custosVariaveis, impostosTaxas, parametros] = await Promise.all([
            sheetsAPI.getIngredientes(),
            sheetsAPI.getPizzas(),
            sheetsAPI.getCustosFixos(),
            sheetsAPI.getCustosVariaveis(),
            sheetsAPI.getImpostosTaxas(),
            sheetsAPI.getParametros()
        ]);

        this.data.ingredientes = ingredientes;
        this.data.pizzas = pizzas;
        this.data.custosFixos = custosFixos;
        this.data.custosVariaveis = custosVariaveis;
        this.data.impostosTaxas = impostosTaxas;
        this.data.parametros = parametros;

        this.calculatePrices();
    }

    calculatePrices() {
        // Calcula custos fixos por pizza
        const totalCustosFixos = this.data.custosFixos.reduce((sum, custo) => sum + custo.valor, 0);
        const vendasPrevistas = this.data.parametros.Vendas_Mensais_Previstas || 3120;
        const custoFixoPorPizza = totalCustosFixos / vendasPrevistas;

        // Calcula preços para cada pizza
        this.data.pizzas.forEach(pizza => {
            pizza.precos = {};
            pizza.custos = {};
            pizza.margens = {};

            CONFIG.TAMANHOS.forEach(tamanho => {
                // Custo dos ingredientes
                const custoIngredientes = this.calculateIngredientsCost(pizza, tamanho);
                
                // Custo variável
                const custoVariavel = this.data.custosVariaveis.reduce((sum, item) => {
                    return sum + (item[tamanho] || 0);
                }, 0);

                // Custo total
                const custoTotal = custoIngredientes + custoVariavel + custoFixoPorPizza;
                pizza.custos[tamanho] = custoTotal;

                // Preço por canal
                this.data.impostosTaxas.forEach(canal => {
                    const totalTaxas = canal.imposto + canal.taxaCartao + canal.taxaApp;
                    const margem = this.data.parametros.Margem_Lucro_Desejada || 35;
                    
                    try {
                        const preco = Utils.calcularPrecoVenda(custoTotal, margem, totalTaxas);
                        
                        if (!pizza.precos[canal.canal]) {
                            pizza.precos[canal.canal] = {};
                        }
                        pizza.precos[canal.canal][tamanho] = Math.ceil(preco * 10) / 10; // Arredonda para cima
                        
                        // Calcula margem real
                        const margemReal = Utils.calcularMargem(pizza.precos[canal.canal][tamanho], custoTotal, totalTaxas);
                        if (!pizza.margens[canal.canal]) {
                            pizza.margens[canal.canal] = {};
                        }
                        pizza.margens[canal.canal][tamanho] = margemReal;
                        
                    } catch (error) {
                        Utils.warn(`Erro ao calcular preço para ${pizza.nome} ${tamanho} no canal ${canal.canal}`, error);
                        if (!pizza.precos[canal.canal]) {
                            pizza.precos[canal.canal] = {};
                        }
                        pizza.precos[canal.canal][tamanho] = 0;
                    }
                });
            });
        });
    }

    calculateIngredientsCost(pizza, tamanho) {
        if (!pizza.recheios) return 0;
        
        return pizza.recheios.reduce((total, recheio) => {
            const ingrediente = this.data.ingredientes.find(ing => ing.id === recheio.ingredienteId);
            if (!ingrediente) return total;
            
            const quantidade = recheio.quantidades[tamanho] || 0;
            return total + (quantidade * ingrediente.custoUnitario);
        }, 0);
    }

    initializeUI() {
        // Inicializa seção ativa
        this.navigateToSection(this.currentSection);
        
        // Popula seletores
        this.populateSelectors();
        
        // Inicializa dashboard
        this.updateDashboard();
    }

    populateSelectors() {
        // Selector de pizzas no simulador
        const simuladorPizza = document.getElementById('simuladorPizza');
        if (simuladorPizza) {
            simuladorPizza.innerHTML = '<option value="">Selecione uma pizza</option>';
            this.data.pizzas.forEach(pizza => {
                const option = document.createElement('option');
                option.value = pizza.id;
                option.textContent = pizza.nome;
                simuladorPizza.appendChild(option);
            });
        }

        // Outros seletores...
    }

    navigateToSection(sectionName) {
        // Remove classe ativa de todos os links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Remove classe ativa de todas as seções
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Ativa link atual
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Ativa seção atual
        const activeSection = document.getElementById(`${sectionName}-section`);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        this.currentSection = sectionName;

        // Carrega dados da seção
        this.loadSectionData(sectionName);

        // Atualiza breadcrumb
        this.updateBreadcrumb(sectionName);
    }

    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'ingredientes':
                this.loadIngredientesTable();
                break;
            case 'pizzas':
                this.loadPizzasGrid();
                break;
            case 'custos-fixos':
                this.loadCustosFixosTable();
                break;
            case 'custos-variaveis':
                this.loadCustosVariaveisTable();
                break;
            case 'impostos':
                this.loadImpostosTable();
                break;
            case 'precos':
                this.loadPrecosGrid();
                break;
            case 'simulador':
                this.updateSimulator();
                break;
            case 'dashboard':
                this.updateDashboard();
                break;
        }
    }

    loadIngredientesTable() {
        const columns = [
            { key: 'id', title: 'ID' },
            { key: 'nome', title: 'Nome' },
            { key: 'categoria', title: 'Categoria' },
            { key: 'unidade', title: 'Unidade' },
            { key: 'preco', title: 'Preço Compra', format: 'currency' },
            { key: 'custoUnitario', title: 'Custo/g', format: 'currency' },
            { key: 'fornecedor', title: 'Fornecedor' },
            { key: 'estoqueMinimo', title: 'Estoque', format: 'number' },
            { 
                key: 'actions', 
                title: 'Ações',
                render: (value, item) => `
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="app.editIngrediente('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="app.deleteIngrediente('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `
            }
        ];

        const tableContainer = document.querySelector('#ingredientesTable').parentNode;
        tableContainer.innerHTML = '<table class="data-table" id="ingredientesTable"></table>';
        
        Components.createDataTable('ingredientesTable', this.data.ingredientes, columns);
    }

    loadPizzasGrid() {
        const grid = document.getElementById('pizzaGrid');
        grid.innerHTML = '';

        this.data.pizzas.forEach(pizza => {
            const card = Components.createPizzaCard(pizza);
            grid.appendChild(card);
        });
    }

    loadCustosFixosTable() {
        const totalCustos = this.data.custosFixos.reduce((sum, custo) => sum + custo.valor, 0);
        const vendasPrevistas = this.data.parametros.Vendas_Mensais_Previstas || 3120;
        const custoPorPizza = totalCustos / vendasPrevistas;

        // Atualiza cards de resumo
        document.getElementById('totalCustosFixos').textContent = Utils.formatMoeda(totalCustos);
        document.getElementById('custoFixoPorPizza').textContent = Utils.formatMoeda(custoPorPizza);
        document.getElementById('vendasPrevistas').textContent = vendasPrevistas.toLocaleString();

        // Tabela
        const columns = [
            { key: 'categoria', title: 'Categoria' },
            { key: 'valor', title: 'Valor Mensal', format: 'currency' },
            { 
                key: 'percentual', 
                title: '% do Total',
                render: (value, item) => Utils.formatPercentual((item.valor / totalCustos) * 100)
            },
            { 
                key: 'actions', 
                title: 'Ações',
                render: (value, item, index) => `
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="app.editCustoFixo(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="app.deleteCustoFixo(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `
            }
        ];

        const tableContainer = document.querySelector('#custosFixosTable').parentNode;
        tableContainer.innerHTML = '<table class="data-table" id="custosFixosTable"></table>';
        
        Components.createDataTable('custosFixosTable', this.data.custosFixos, columns);
    }

    loadCustosVariaveisTable() {
        const columns = [
            { key: 'item', title: 'Item' },
            { key: 'tipo', title: 'Tipo' },
            { key: 'P', title: 'P', format: 'currency' },
            { key: 'M', title: 'M', format: 'currency' },
            { key: 'G', title: 'G', format: 'currency' },
            { key: 'GG', title: 'GG', format: 'currency' },
            { 
                key: 'actions', 
                title: 'Ações',
                render: (value, item, index) => `
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="app.editCustoVariavel(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="app.deleteCustoVariavel(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `
            }
        ];

        const tableContainer = document.querySelector('#custosVariaveisTable').parentNode;
        tableContainer.innerHTML = '<table class="data-table" id="custosVariaveisTable"></table>';
        
        Components.createDataTable('custosVariaveisTable', this.data.custosVariaveis, columns);
    }

    loadImpostosTable() {
        const columns = [
            { key: 'canal', title: 'Canal de Venda' },
            { key: 'imposto', title: 'Imposto (%)', format: 'percentage' },
            { key: 'taxaCartao', title: 'Taxa Cartão (%)', format: 'percentage' },
            { key: 'taxaApp', title: 'Taxa App (%)', format: 'percentage' },
            { key: 'entrega', title: 'Entrega (R$)', format: 'currency' },
            { 
                key: 'total', 
                title: 'Total (%)',
                render: (value, item) => Utils.formatPercentual(item.imposto + item.taxaCartao + item.taxaApp)
            },
            { 
                key: 'actions', 
                title: 'Ações',
                render: (value, item, index) => `
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="app.editImposto(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="app.deleteImposto(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `
            }
        ];

        const tableContainer = document.querySelector('#impostosTable').parentNode;
        tableContainer.innerHTML = '<table class="data-table" id="impostosTable"></table>';
        
        Components.createDataTable('impostosTable', this.data.impostosTaxas, columns);
    }

    loadPrecosGrid() {
        const grid = document.getElementById('pricingGrid');
        const canalSelecionado = document.getElementById('canalPrecos').value || 'Balcão';
        
        grid.innerHTML = '';

        this.data.pizzas.forEach(pizza => {
            const card = document.createElement('div');
            card.className = 'pricing-card';
            
            const precosPorCanal = pizza.precos[canalSelecionado] || {};
            
            card.innerHTML = `
                <div class="pricing-header">
                    <h3>${pizza.nome}</h3>
                    <span class="pizza-category">${pizza.categoria}</span>
                </div>
                <div class="pricing-sizes">
                    ${CONFIG.TAMANHOS.map(tamanho => `
                        <div class="pricing-size">
                            <div class="size">${tamanho}</div>
                            <div class="price">${Utils.formatMoeda(precosPorCanal[tamanho] || 0)}</div>
                            <div class="cost">${Utils.formatMoeda(pizza.custos[tamanho] || 0)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            grid.appendChild(card);
        });
    }

    updateSimulator() {
        const pizzaId = document.getElementById('simuladorPizza').value;
        const tamanho = document.getElementById('simuladorTamanho').value;
        const canal = document.getElementById('simuladorCanal').value;
        const margem = parseFloat(document.getElementById('simuladorMargem').value) || 35;

        const resultsContainer = document.getElementById('simulatorResults');
        
        if (!pizzaId) {
            resultsContainer.innerHTML = '<p>Selecione uma pizza para simular</p>';
            return;
        }

        const pizza = this.data.pizzas.find(p => p.id === pizzaId);
        if (!pizza) return;

        const custo = pizza.custos[tamanho] || 0;
        const impostoTaxa = this.data.impostosTaxas.find(it => it.canal === canal);
        const totalTaxas = impostoTaxa ? impostoTaxa.imposto + impostoTaxa.taxaCartao + impostoTaxa.taxaApp : 0;

        try {
            const precoCalculado = Utils.calcularPrecoVenda(custo, margem, totalTaxas);
            const margemReal = Utils.calcularMargem(precoCalculado, custo, totalTaxas);

            resultsContainer.innerHTML = `
                <div class="simulator-result">
                    <h3>Resultado da Simulação</h3>
                    <div class="result-grid">
                        <div class="result-item">
                            <label>Pizza:</label>
                            <span>${pizza.nome} (${tamanho})</span>
                        </div>
                        <div class="result-item">
                            <label>Custo Total:</label>
                            <span>${Utils.formatMoeda(custo)}</span>
                        </div>
                        <div class="result-item">
                            <label>Impostos/Taxas:</label>
                            <span>${Utils.formatPercentual(totalTaxas)}</span>
                        </div>
                        <div class="result-item">
                            <label>Margem Desejada:</label>
                            <span>${Utils.formatPercentual(margem)}</span>
                        </div>
                        <div class="result-item highlight">
                            <label>Preço Sugerido:</label>
                            <span>${Utils.formatMoeda(precoCalculado)}</span>
                        </div>
                        <div class="result-item">
                            <label>Margem Real:</label>
                            <span>${Utils.formatPercentual(margemReal)}</span>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="simulator-error">
                    <h3>Erro na Simulação</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    updateDashboard() {
        // Calcula métricas
        const totalPizzas = this.data.pizzas.length;
        const totalIngredientes = this.data.ingredientes.length;
        
        // Margem média
        let margemMedia = 0;
        let cmvMedio = 0;
        let ticketMedio = 0;
        
        if (this.data.pizzas.length > 0) {
            const margens = [];
            const cmvs = [];
            const precos = [];
            
            this.data.pizzas.forEach(pizza => {
                CONFIG.TAMANHOS.forEach(tamanho => {
                    const custo = pizza.custos[tamanho] || 0;
                    const preco = pizza.precos['Balcão']?.[tamanho] || 0;
                    
                    if (preco > 0) {
                        const cmv = (custo / preco) * 100;
                        const margem = ((preco - custo) / preco) * 100;
                        
                        cmvs.push(cmv);
                        margens.push(margem);
                        precos.push(preco);
                    }
                });
            });
            
            margemMedia = margens.reduce((a, b) => a + b, 0) / margens.length;
            cmvMedio = cmvs.reduce((a, b) => a + b, 0) / cmvs.length;
            ticketMedio = precos.reduce((a, b) => a + b, 0) / precos.length;
        }

        // Atualiza cards do dashboard
        const dashboardCards = document.querySelectorAll('.dashboard-card');
        if (dashboardCards.length >= 4) {
            dashboardCards[0].querySelector('.metric-value').textContent = Utils.formatPercentual(margemMedia);
            dashboardCards[1].querySelector('.metric-value').textContent = Utils.formatPercentual(cmvMedio);
            dashboardCards[2].querySelector('.metric-value').textContent = Utils.formatMoeda(ticketMedio);
            dashboardCards[3].querySelector('.metric-value').textContent = this.data.pizzas[0]?.nome || 'N/A';
        }

        // Atualiza gráficos
        this.updateCharts();
    }

    updateCharts() {
        // Gráfico de distribuição de custos
        const custosData = {
            labels: ['Ingredientes', 'Custos Fixos', 'Custos Variáveis'],
            datasets: [{
                data: [60, 25, 15], // Valores de exemplo
                backgroundColor: ['#e74c3c', '#3498db', '#f39c12']
            }]
        };

        Components.createChart('custosChart', 'doughnut', custosData);

        // Gráfico de margem por pizza
        const margemData = {
            labels: this.data.pizzas.map(p => p.nome),
            datasets: [{
                label: 'Margem (%)',
                data: this.data.pizzas.map(p => {
                    const custo = p.custos['G'] || 0;
                    const preco = p.precos['Balcão']?.['G'] || 0;
                    return preco > 0 ? ((preco - custo) / preco) * 100 : 0;
                }),
                backgroundColor: '#2ecc71'
            }]
        };

        Components.createChart('margemChart', 'bar', margemData);
    }

    updateBreadcrumb(sectionName) {
        const breadcrumbItems = [
            { label: 'Início', section: 'dashboard' }
        ];

        const sectionNames = {
            'ingredientes': 'Ingredientes',
            'receitas': 'Receitas Base',
            'pizzas': 'Cardápio',
            'custos-fixos': 'Custos Fixos',
            'custos-variaveis': 'Custos Variáveis',
            'impostos': 'Impostos & Taxas',
            'precos': 'Preços Finais',
            'simulador': 'Simulador',
            'dashboard': 'Dashboard',
            'relatorios': 'Relatórios'
        };

        if (sectionName !== 'dashboard') {
            breadcrumbItems.push({
                label: sectionNames[sectionName] || sectionName,
                section: sectionName
            });
        }

        Components.updateBreadcrumb(breadcrumbItems);
    }

    // Event Handlers
    showIngredienteModal(ingrediente = null) {
        const modal = document.getElementById('ingredienteModal');
        const form = document.getElementById('ingredienteForm');
        const title = document.getElementById('ingredienteModalTitle');

        if (ingrediente) {
            title.textContent = 'Editar Ingrediente';
            this.populateIngredienteForm(ingrediente);
        } else {
            title.textContent = 'Novo Ingrediente';
            form.reset();
        }

        Components.showModal('ingredienteModal');
    }

    populateIngredienteForm(ingrediente) {
        document.getElementById('ingredienteNome').value = ingrediente.nome;
        document.getElementById('ingredienteCategoria').value = ingrediente.categoria;
        document.getElementById('ingredienteUnidade').value = ingrediente.unidade;
        document.getElementById('ingredienteQuantidade').value = ingrediente.quantidade;
        document.getElementById('ingredientePreco').value = ingrediente.preco;
        document.getElementById('ingredienteRendimento').value = ingrediente.rendimento;
        document.getElementById('ingredienteFornecedor').value = ingrediente.fornecedor;
        document.getElementById('ingredienteEstoque').value = ingrediente.estoqueMinimo;
    }

    async handleIngredienteSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const ingrediente = {
            id: Utils.gerarIdIngrediente(),
            nome: formData.get('ingredienteNome'),
            categoria: formData.get('ingredienteCategoria'),
            unidade: formData.get('ingredienteUnidade'),
            quantidade: parseFloat(formData.get('ingredienteQuantidade')),
            preco: parseFloat(formData.get('ingredientePreco')),
            rendimento: parseFloat(formData.get('ingredienteRendimento')),
            fornecedor: formData.get('ingredienteFornecedor'),
            estoqueMinimo: parseFloat(formData.get('ingredienteEstoque')) || 0,
            isNew: true
        };

        // Calcula custo unitário
        ingrediente.custoUnitario = Utils.calcularCustoUnitario(
            ingrediente.preco,
            ingrediente.quantidade,
            ingrediente.rendimento,
            ingrediente.unidade
        );

        try {
            if (!this.isDemoMode) {
                await sheetsAPI.saveIngrediente(ingrediente);
            }
            
            this.data.ingredientes.push(ingrediente);
            this.calculatePrices(); // Recalcula preços
            this.loadIngredientesTable();
            
            Components.hideModal('ingredienteModal');
            Components.showToast('Ingrediente salvo com sucesso!');
            
        } catch (error) {
            Utils.error('Erro ao salvar ingrediente', error);
            Components.showToast('Erro ao salvar ingrediente', 'error');
        }
    }

    async editIngrediente(id) {
        const ingrediente = this.data.ingredientes.find(ing => ing.id === id);
        if (ingrediente) {
            this.showIngredienteModal(ingrediente);
        }
    }

    async deleteIngrediente(id) {
        const confirmed = await Components.confirm('Tem certeza que deseja excluir este ingrediente?');
        if (!confirmed) return;

        try {
            if (!this.isDemoMode) {
                await sheetsAPI.deleteIngrediente(id);
            }
            
            this.data.ingredientes = this.data.ingredientes.filter(ing => ing.id !== id);
            this.calculatePrices();
            this.loadIngredientesTable();
            
            Components.showToast('Ingrediente excluído com sucesso!');
            
        } catch (error) {
            Utils.error('Erro ao excluir ingrediente', error);
            Components.showToast('Erro ao excluir ingrediente', 'error');
        }
    }

    filterIngredientes() {
        const categoria = document.getElementById('filtroCategoria').value;
        const busca = document.getElementById('buscaIngrediente').value.toLowerCase();

        let ingredientesFiltrados = this.data.ingredientes;

        if (categoria) {
            ingredientesFiltrados = ingredientesFiltrados.filter(ing => ing.categoria === categoria);
        }

        if (busca) {
            ingredientesFiltrados = ingredientesFiltrados.filter(ing => 
                ing.nome.toLowerCase().includes(busca) ||
                ing.fornecedor.toLowerCase().includes(busca)
            );
        }

        // Atualiza tabela com dados filtrados
        const columns = [
            { key: 'id', title: 'ID' },
            { key: 'nome', title: 'Nome' },
            { key: 'categoria', title: 'Categoria' },
            { key: 'unidade', title: 'Unidade' },
            { key: 'preco', title: 'Preço Compra', format: 'currency' },
            { key: 'custoUnitario', title: 'Custo/g', format: 'currency' },
            { key: 'fornecedor', title: 'Fornecedor' },
            { key: 'estoqueMinimo', title: 'Estoque', format: 'number' },
            { 
                key: 'actions', 
                title: 'Ações',
                render: (value, item) => `
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="app.editIngrediente('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="app.deleteIngrediente('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `
            }
        ];

        const tableContainer = document.querySelector('#ingredientesTable').parentNode;
        tableContainer.innerHTML = '<table class="data-table" id="ingredientesTable"></table>';
        
        Components.createDataTable('ingredientesTable', ingredientesFiltrados, columns);
    }

    async syncData() {
        if (this.isDemoMode) {
            Components.showToast('Modo demo ativo. Configure o Google Sheets para sincronizar.', 'info');
            return;
        }

        Components.showLoading('Sincronizando dados...');
        
        try {
            await this.loadRealData();
            this.loadSectionData(this.currentSection);
            Components.showToast('Dados sincronizados com sucesso!');
        } catch (error) {
            Utils.error('Erro na sincronização', error);
            Components.showToast('Erro na sincronização', 'error');
        } finally {
            Components.hideLoading();
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl + S para salvar
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.syncData();
        }

        // Escape para fechar modais
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                Components.hideModal(modal.id);
            });
        }
    }

    handleInitError(error) {
        Components.hideLoading();
        
        const errorMessage = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
                <h2>Erro ao Inicializar</h2>
                <p>Ocorreu um erro ao inicializar a aplicação:</p>
                <p style="color: #e74c3c; font-weight: bold;">${error.message}</p>
                <button class="btn-primary" onclick="location.reload()">Tentar Novamente</button>
            </div>
        `;
        
        document.querySelector('.main-content').innerHTML = errorMessage;
    }
}

// Inicialização da aplicação
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new APSApp();
});

// Funções globais para compatibilidade
function navigateTo(section) {
    if (app) {
        app.navigateToSection(section);
    }
}

function editPizza(id) {
    if (app) {
        app.editPizza(id);
    }
}

function deletePizza(id) {
    if (app) {
        app.deletePizza(id);
    }
}
