/**
 * Módulo Dashboard
 * Tela inicial com visão geral do negócio
 */

import storage from '../utils/storage.js';
import { STORAGE_KEYS, LABELS_CANAIS, LABELS_STATUS_ESTOQUE } from '../utils/constants.js';
import { formatCurrency, formatDate, getCurrentDate } from '../utils/helpers.js';
import calculator from '../utils/calculations.js';

export default class DashboardModule {
    constructor(app) {
        this.app = app;
        this.data = {
            vendas: [],
            receitas: [],
            ingredientes: [],
            estoque: {},
            resultados: []
        };
    }

    /**
     * Ativa o módulo
     */
    async activate() {
        await this.loadData();
        this.setupEventListeners();
    }

    /**
     * Desativa o módulo
     */
    async deactivate() {
        this.removeEventListeners();
    }

    /**
     * Carrega dados necessários
     */
    async loadData() {
        this.data.vendas = storage.load(STORAGE_KEYS.VENDAS, []);
        this.data.receitas = storage.load(STORAGE_KEYS.RECEITAS, []);
        this.data.ingredientes = storage.load(STORAGE_KEYS.INGREDIENTES, []);
        this.data.estoque = storage.load(STORAGE_KEYS.ESTOQUE, {});
        this.data.resultados = storage.load(STORAGE_KEYS.RESULTADOS_DIARIOS, []);
    }

    /**
     * Renderiza o módulo
     */
    async render() {
        const stats = this.calculateStats();
        
        return `
            <div class="dashboard">
                <!-- KPIs Principais -->
                <div class="dashboard-grid">
                    ${this.renderKPICard('Vendas Hoje', stats.vendasHoje, 'vendas', '🛒')}
                    ${this.renderKPICard('Faturamento Hoje', formatCurrency(stats.faturamentoHoje), 'faturamento', '💰')}
                    ${this.renderKPICard('Ticket Médio', formatCurrency(stats.ticketMedio), 'ticket', '🎯')}
                    ${this.renderKPICard('Margem Média', `${stats.margemMedia}%`, 'margem', '📈')}
                </div>

                <!-- Seções Principais -->
                <div class="dashboard-sections">
                    <!-- Vendas Recentes -->
                    <div class="section">
                        <div class="section-header">
                            <h3>📊 Vendas Recentes</h3>
                            <button class="btn btn-primary btn-sm" onclick="app.loadModule('vendas')">
                                Nova Venda
                            </button>
                        </div>
                        <div class="section-content">
                            ${this.renderVendasRecentes()}
                        </div>
                    </div>

                    <!-- Status do Estoque -->
                    <div class="section">
                        <div class="section-header">
                            <h3>📦 Status do Estoque</h3>
                            <button class="btn btn-secondary btn-sm" onclick="app.loadModule('estoque')">
                                Ver Estoque
                            </button>
                        </div>
                        <div class="section-content">
                            ${this.renderStatusEstoque()}
                        </div>
                    </div>

                    <!-- Receitas Populares -->
                    <div class="section">
                        <div class="section-header">
                            <h3>🍕 Receitas Populares</h3>
                            <button class="btn btn-secondary btn-sm" onclick="app.loadModule('receitas')">
                                Ver Receitas
                            </button>
                        </div>
                        <div class="section-content">
                            ${this.renderReceitasPopulares()}
                        </div>
                    </div>

                    <!-- Análise por Canal -->
                    <div class="section">
                        <div class="section-header">
                            <h3>📱 Vendas por Canal</h3>
                            <button class="btn btn-secondary btn-sm" onclick="app.loadModule('analises')">
                                Ver Análises
                            </button>
                        </div>
                        <div class="section-content">
                            ${this.renderVendasPorCanal()}
                        </div>
                    </div>
                </div>

                <!-- Ações Rápidas -->
                <div class="quick-actions">
                    <h3>⚡ Ações Rápidas</h3>
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" onclick="app.loadModule('vendas')">
                            <span class="icon">🛒</span>
                            <span class="label">Nova Venda</span>
                        </button>
                        <button class="quick-action-btn" onclick="app.loadModule('receitas')">
                            <span class="icon">🍕</span>
                            <span class="label">Nova Receita</span>
                        </button>
                        <button class="quick-action-btn" onclick="app.loadModule('ingredientes')">
                            <span class="icon">🥬</span>
                            <span class="label">Novo Ingrediente</span>
                        </button>
                        <button class="quick-action-btn" onclick="app.loadModule('estoque')">
                            <span class="icon">📦</span>
                            <span class="label">Entrada Estoque</span>
                        </button>
                        <button class="quick-action-btn" onclick="app.loadModule('resultados')">
                            <span class="icon">📊</span>
                            <span class="label">Resultado Diário</span>
                        </button>
                        <button class="quick-action-btn" onclick="app.loadModule('backup')">
                            <span class="icon">💾</span>
                            <span class="label">Backup</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Calcula estatísticas do dashboard
     */
    calculateStats() {
        const hoje = getCurrentDate();
        const vendasHoje = this.data.vendas.filter(v => v.data === hoje);
        
        const vendasCount = vendasHoje.length;
        const faturamentoHoje = vendasHoje.reduce((total, venda) => {
            return total + (parseFloat(venda.valorTotal) || 0);
        }, 0);
        
        const ticketMedio = calculator.calcularTicketMedio(faturamentoHoje, vendasCount);
        
        // Calcula margem média das receitas
        const margens = this.data.receitas.map(receita => {
            const custo = calculator.calcularCustoReceita(receita);
            const preco = parseFloat(receita.precoVenda) || 0;
            return calculator.calcularMargem(preco, custo);
        });
        
        const margemMedia = margens.length > 0 
            ? margens.reduce((a, b) => a + b, 0) / margens.length 
            : 0;

        return {
            vendasHoje: vendasCount,
            faturamentoHoje,
            ticketMedio,
            margemMedia: calculator.round(margemMedia, 1)
        };
    }

    /**
     * Renderiza card de KPI
     */
    renderKPICard(title, value, type, icon) {
        return `
            <div class="kpi-card ${type}">
                <div class="kpi-icon">${icon}</div>
                <div class="kpi-content">
                    <h3>${title}</h3>
                    <div class="value">${value}</div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza vendas recentes
     */
    renderVendasRecentes() {
        const vendasRecentes = this.data.vendas
            .sort((a, b) => new Date(b.timestamp || b.data) - new Date(a.timestamp || a.data))
            .slice(0, 5);

        if (vendasRecentes.length === 0) {
            return `
                <div class="empty-state">
                    <p>Nenhuma venda registrada ainda.</p>
                    <button class="btn btn-primary" onclick="app.loadModule('vendas')">
                        Registrar Primeira Venda
                    </button>
                </div>
            `;
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Canal</th>
                            <th>Itens</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vendasRecentes.map(venda => `
                            <tr>
                                <td>${formatDate(venda.data)}</td>
                                <td>
                                    <span class="badge badge-${venda.canal}">
                                        ${LABELS_CANAIS[venda.canal] || venda.canal}
                                    </span>
                                </td>
                                <td>${venda.itens ? venda.itens.length : 0} itens</td>
                                <td class="text-right font-weight-bold">
                                    ${formatCurrency(venda.valorTotal)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Renderiza status do estoque
     */
    renderStatusEstoque() {
        const ingredientesComEstoque = this.data.ingredientes
            .map(ingrediente => {
                const estoqueItem = this.data.estoque[ingrediente.id];
                const quantidade = estoqueItem ? parseFloat(estoqueItem.quantidade) || 0 : 0;
                const estoqueMinimo = parseFloat(ingrediente.estoqueMinimo) || 10;
                const status = calculator.calcularStatusEstoque(quantidade, estoqueMinimo);
                
                return {
                    ...ingrediente,
                    quantidade,
                    estoqueMinimo,
                    status
                };
            })
            .filter(item => item.status !== 'ok')
            .sort((a, b) => {
                const statusOrder = { 'zerado': 0, 'critico': 1, 'baixo': 2 };
                return statusOrder[a.status] - statusOrder[b.status];
            })
            .slice(0, 5);

        if (ingredientesComEstoque.length === 0) {
            return `
                <div class="alert alert-success">
                    <strong>✅ Estoque OK!</strong><br>
                    Todos os ingredientes estão com estoque adequado.
                </div>
            `;
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Ingrediente</th>
                            <th>Quantidade</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ingredientesComEstoque.map(item => `
                            <tr>
                                <td>${item.nome}</td>
                                <td>${item.quantidade} ${item.unidade}</td>
                                <td>
                                    <span class="badge badge-${item.status}">
                                        ${LABELS_STATUS_ESTOQUE[item.status]}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Renderiza receitas populares
     */
    renderReceitasPopulares() {
        // Calcula popularidade baseada nas vendas
        const popularidade = {};
        
        this.data.vendas.forEach(venda => {
            if (venda.itens) {
                venda.itens.forEach(item => {
                    const receitaId = item.receitaId;
                    const quantidade = parseInt(item.quantidade) || 1;
                    
                    if (!popularidade[receitaId]) {
                        popularidade[receitaId] = 0;
                    }
                    popularidade[receitaId] += quantidade;
                });
            }
        });

        const receitasPopulares = this.data.receitas
            .map(receita => ({
                ...receita,
                vendas: popularidade[receita.id] || 0
            }))
            .sort((a, b) => b.vendas - a.vendas)
            .slice(0, 5);

        if (receitasPopulares.length === 0) {
            return `
                <div class="empty-state">
                    <p>Nenhuma receita cadastrada ainda.</p>
                    <button class="btn btn-primary" onclick="app.loadModule('receitas')">
                        Criar Primeira Receita
                    </button>
                </div>
            `;
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Receita</th>
                            <th>Tamanho</th>
                            <th>Vendas</th>
                            <th>Preço</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${receitasPopulares.map(receita => `
                            <tr>
                                <td>${receita.nome}</td>
                                <td>
                                    <span class="badge badge-secondary">
                                        ${receita.tamanho}
                                    </span>
                                </td>
                                <td>${receita.vendas} unidades</td>
                                <td class="text-right font-weight-bold">
                                    ${formatCurrency(receita.precoVenda)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Renderiza vendas por canal
     */
    renderVendasPorCanal() {
        const analise = calculator.calcularRentabilidadePorCanal(this.data.vendas);
        const canais = Object.keys(analise);

        if (canais.length === 0) {
            return `
                <div class="empty-state">
                    <p>Nenhuma venda para análise ainda.</p>
                </div>
            `;
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Canal</th>
                            <th>Vendas</th>
                            <th>Faturamento</th>
                            <th>Margem</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${canais.map(canal => {
                            const dados = analise[canal];
                            return `
                                <tr>
                                    <td>
                                        <span class="badge badge-${canal}">
                                            ${LABELS_CANAIS[canal] || canal}
                                        </span>
                                    </td>
                                    <td>${dados.vendas}</td>
                                    <td class="text-right">
                                        ${formatCurrency(dados.faturamento)}
                                    </td>
                                    <td class="text-right">
                                        <span class="badge ${dados.margem >= 30 ? 'badge-success' : 'badge-warning'}">
                                            ${dados.margem}%
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Atualiza dados a cada 30 segundos
        this.updateInterval = setInterval(() => {
            this.loadData();
            this.refreshStats();
        }, 30000);

        // Listener para eventos de dados salvos
        storage.addEventListener('dados:salvos', () => {
            this.loadData();
            this.refreshStats();
        });
    }

    /**
     * Remove event listeners
     */
    removeEventListeners() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    /**
     * Atualiza estatísticas na tela
     */
    refreshStats() {
        const stats = this.calculateStats();
        
        // Atualiza KPIs se estiverem visíveis
        const kpiElements = {
            'vendas': stats.vendasHoje,
            'faturamento': formatCurrency(stats.faturamentoHoje),
            'ticket': formatCurrency(stats.ticketMedio),
            'margem': `${stats.margemMedia}%`
        };

        Object.entries(kpiElements).forEach(([type, value]) => {
            const element = document.querySelector(`.kpi-card.${type} .value`);
            if (element) {
                element.textContent = value;
            }
        });
    }
}

// Estilos CSS específicos do módulo
const dashboardStyles = `
    .dashboard {
        padding: 0;
    }

    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-2xl);
    }

    .kpi-card {
        background: var(--white);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-xl);
        box-shadow: var(--shadow-sm);
        border-left: 4px solid var(--primary-color);
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }

    .kpi-card.vendas {
        border-left-color: var(--primary-color);
    }

    .kpi-card.faturamento {
        border-left-color: var(--success-color);
    }

    .kpi-card.ticket {
        border-left-color: var(--info-color);
    }

    .kpi-card.margem {
        border-left-color: var(--warning-color);
    }

    .kpi-icon {
        font-size: 2.5rem;
        opacity: 0.8;
    }

    .kpi-content h3 {
        font-size: var(--font-size-sm);
        color: var(--gray-medium);
        margin-bottom: var(--spacing-xs);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .kpi-card .value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--gray-dark);
        line-height: 1;
    }

    .dashboard-sections {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: var(--spacing-xl);
        margin-bottom: var(--spacing-2xl);
    }

    .quick-actions {
        background: var(--white);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-xl);
        box-shadow: var(--shadow-sm);
    }

    .quick-actions h3 {
        margin-bottom: var(--spacing-lg);
        color: var(--gray-dark);
    }

    .quick-actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--spacing-md);
    }

    .quick-action-btn {
        background: var(--gray-lighter);
        border: 2px solid transparent;
        border-radius: var(--border-radius-md);
        padding: var(--spacing-lg);
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        color: var(--gray-dark);
    }

    .quick-action-btn:hover {
        background: var(--primary-color);
        color: var(--white);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }

    .quick-action-btn .icon {
        display: block;
        font-size: 2rem;
        margin-bottom: var(--spacing-sm);
    }

    .quick-action-btn .label {
        font-size: var(--font-size-sm);
        font-weight: 500;
    }

    .empty-state {
        text-align: center;
        padding: var(--spacing-2xl);
        color: var(--gray-medium);
    }

    .empty-state p {
        margin-bottom: var(--spacing-lg);
    }

    .badge {
        display: inline-block;
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--border-radius-sm);
        font-size: var(--font-size-xs);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .badge-balcao { background: #e3f2fd; color: #1976d2; }
    .badge-delivery { background: #f3e5f5; color: #7b1fa2; }
    .badge-ifood { background: #fff3e0; color: #f57c00; }
    .badge-uber_eats { background: #e8f5e8; color: #388e3c; }
    .badge-rappi { background: #fce4ec; color: #c2185b; }
    .badge-whatsapp { background: #e0f2f1; color: #00796b; }
    .badge-telefone { background: #f1f8e9; color: #689f38; }
    .badge-misto { background: #f5f5f5; color: #616161; }

    .badge-zerado { background: #ffebee; color: #c62828; }
    .badge-critico { background: #fff3e0; color: #ef6c00; }
    .badge-baixo { background: #fff8e1; color: #f9a825; }
    .badge-ok { background: #e8f5e8; color: #2e7d32; }

    .badge-success { background: #e8f5e8; color: #2e7d32; }
    .badge-warning { background: #fff8e1; color: #f9a825; }
    .badge-secondary { background: #f5f5f5; color: #616161; }

    @media (max-width: 768px) {
        .dashboard-grid {
            grid-template-columns: 1fr;
        }

        .dashboard-sections {
            grid-template-columns: 1fr;
        }

        .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .kpi-card {
            padding: var(--spacing-lg);
        }

        .kpi-card .value {
            font-size: 1.5rem;
        }
    }
`;

// Injeta estilos se não existirem
if (!document.getElementById('dashboard-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'dashboard-styles';
    styleSheet.textContent = dashboardStyles;
    document.head.appendChild(styleSheet);
}

