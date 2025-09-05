/**
 * Módulo Ingredientes
 * Gestão de ingredientes e matérias-primas
 */

import storage from '../utils/storage.js';
import { STORAGE_KEYS, CATEGORIAS_INGREDIENTES, LABELS_CATEGORIAS, UNIDADES_MEDIDA, LABELS_UNIDADES } from '../utils/constants.js';
import { formatCurrency, generateId, debounce } from '../utils/helpers.js';
import validator from '../utils/validation.js';
import toast from '../components/toast.js';
import modal from '../components/modal.js';

export default class IngredientesModule {
    constructor(app) {
        this.app = app;
        this.ingredientes = [];
        this.filteredIngredientes = [];
        this.searchTerm = '';
        this.categoryFilter = '';
        this.sortBy = 'nome';
        this.sortDirection = 'asc';
        
        // Bind methods
        this.handleSearch = debounce(this.handleSearch.bind(this), 300);
    }

    /**
     * Ativa o módulo
     */
    async activate() {
        await this.loadData();
        this.applyFilters();
    }

    /**
     * Desativa o módulo
     */
    async deactivate() {
        // Cleanup se necessário
    }

    /**
     * Carrega dados dos ingredientes
     */
    async loadData() {
        this.ingredientes = storage.load(STORAGE_KEYS.INGREDIENTES, []);
    }

    /**
     * Salva dados dos ingredientes
     */
    async saveData() {
        storage.save(STORAGE_KEYS.INGREDIENTES, this.ingredientes);
    }

    /**
     * Renderiza o módulo
     */
    async render() {
        return `
            <div class="ingredientes-module">
                <!-- Cabeçalho com filtros -->
                <div class="module-header">
                    <div class="filters-container">
                        <div class="search-container">
                            <input 
                                type="text" 
                                id="search-ingredientes" 
                                class="search-input" 
                                placeholder="Buscar ingredientes..."
                                value="${this.searchTerm}"
                            >
                            <span class="search-icon">🔍</span>
                        </div>
                        
                        <select id="category-filter" class="form-control">
                            <option value="">Todas as categorias</option>
                            ${Object.entries(LABELS_CATEGORIAS).map(([value, label]) => `
                                <option value="${value}" ${this.categoryFilter === value ? 'selected' : ''}>
                                    ${label}
                                </option>
                            `).join('')}
                        </select>
                        
                        <select id="sort-by" class="form-control">
                            <option value="nome" ${this.sortBy === 'nome' ? 'selected' : ''}>Nome</option>
                            <option value="categoria" ${this.sortBy === 'categoria' ? 'selected' : ''}>Categoria</option>
                            <option value="preco" ${this.sortBy === 'preco' ? 'selected' : ''}>Preço</option>
                        </select>
                        
                        <button class="btn btn-primary" onclick="ingredientesModule.showAddModal()">
                            ➕ Novo Ingrediente
                        </button>
                    </div>
                </div>

                <!-- Lista de ingredientes -->
                <div class="section">
                    <div class="section-content">
                        ${this.renderIngredientesList()}
                    </div>
                </div>

                <!-- Estatísticas -->
                <div class="stats-container">
                    ${this.renderStats()}
                </div>
            </div>
        `;
    }

    /**
     * Renderiza lista de ingredientes
     */
    renderIngredientesList() {
        if (this.filteredIngredientes.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🥬</div>
                    <h3>Nenhum ingrediente encontrado</h3>
                    <p>Comece adicionando seus primeiros ingredientes ao sistema.</p>
                    <button class="btn btn-primary" onclick="ingredientesModule.showAddModal()">
                        Adicionar Primeiro Ingrediente
                    </button>
                </div>
            `;
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th onclick="ingredientesModule.sortTable('nome')">
                                Nome ${this.getSortIcon('nome')}
                            </th>
                            <th onclick="ingredientesModule.sortTable('categoria')">
                                Categoria ${this.getSortIcon('categoria')}
                            </th>
                            <th>Unidade</th>
                            <th onclick="ingredientesModule.sortTable('preco')">
                                Preço ${this.getSortIcon('preco')}
                            </th>
                            <th>Fornecedor</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.filteredIngredientes.map(ingrediente => `
                            <tr>
                                <td>
                                    <strong>${ingrediente.nome}</strong>
                                    ${ingrediente.descricao ? `<br><small class="text-muted">${ingrediente.descricao}</small>` : ''}
                                </td>
                                <td>
                                    <span class="badge badge-category">
                                        ${LABELS_CATEGORIAS[ingrediente.categoria] || ingrediente.categoria}
                                    </span>
                                </td>
                                <td>${LABELS_UNIDADES[ingrediente.unidade] || ingrediente.unidade}</td>
                                <td class="text-right font-weight-bold">
                                    ${formatCurrency(ingrediente.preco)}
                                </td>
                                <td>${ingrediente.fornecedor || '-'}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button 
                                            class="btn btn-sm btn-secondary" 
                                            onclick="ingredientesModule.showEditModal('${ingrediente.id}')"
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            class="btn btn-sm btn-danger" 
                                            onclick="ingredientesModule.confirmDelete('${ingrediente.id}')"
                                            title="Excluir"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Renderiza estatísticas
     */
    renderStats() {
        const stats = this.calculateStats();
        
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Total de Ingredientes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.categorias}</div>
                    <div class="stat-label">Categorias</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatCurrency(stats.valorMedio)}</div>
                    <div class="stat-label">Preço Médio</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatCurrency(stats.valorTotal)}</div>
                    <div class="stat-label">Valor Total</div>
                </div>
            </div>
        `;
    }

    /**
     * Calcula estatísticas
     */
    calculateStats() {
        const total = this.ingredientes.length;
        const categorias = new Set(this.ingredientes.map(i => i.categoria)).size;
        const precos = this.ingredientes.map(i => parseFloat(i.preco) || 0);
        const valorMedio = precos.length > 0 ? precos.reduce((a, b) => a + b, 0) / precos.length : 0;
        const valorTotal = precos.reduce((a, b) => a + b, 0);

        return { total, categorias, valorMedio, valorTotal };
    }

    /**
     * Aplica filtros e ordenação
     */
    applyFilters() {
        let filtered = [...this.ingredientes];

        // Filtro de busca
        if (this.searchTerm) {
            const search = this.searchTerm.toLowerCase();
            filtered = filtered.filter(ingrediente => 
                ingrediente.nome.toLowerCase().includes(search) ||
                (ingrediente.descricao && ingrediente.descricao.toLowerCase().includes(search)) ||
                (ingrediente.fornecedor && ingrediente.fornecedor.toLowerCase().includes(search))
            );
        }

        // Filtro de categoria
        if (this.categoryFilter) {
            filtered = filtered.filter(ingrediente => ingrediente.categoria === this.categoryFilter);
        }

        // Ordenação
        filtered.sort((a, b) => {
            let aVal = a[this.sortBy];
            let bVal = b[this.sortBy];

            if (this.sortBy === 'preco') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }

            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.filteredIngredientes = filtered;
        this.updateTable();
    }

    /**
     * Atualiza tabela na tela
     */
    updateTable() {
        const container = document.querySelector('.ingredientes-module .section-content');
        if (container) {
            container.innerHTML = this.renderIngredientesList();
        }

        const statsContainer = document.querySelector('.stats-container');
        if (statsContainer) {
            statsContainer.innerHTML = this.renderStats();
        }
    }

    /**
     * Obtém ícone de ordenação
     */
    getSortIcon(column) {
        if (this.sortBy !== column) return '↕️';
        return this.sortDirection === 'asc' ? '↑' : '↓';
    }

    /**
     * Ordena tabela por coluna
     */
    sortTable(column) {
        if (this.sortBy === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = column;
            this.sortDirection = 'asc';
        }
        this.applyFilters();
    }

    /**
     * Manipula busca
     */
    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.applyFilters();
    }

    /**
     * Manipula filtro de categoria
     */
    handleCategoryFilter(event) {
        this.categoryFilter = event.target.value;
        this.applyFilters();
    }

    /**
     * Manipula ordenação
     */
    handleSortChange(event) {
        this.sortBy = event.target.value;
        this.applyFilters();
    }

    /**
     * Mostra modal de adicionar ingrediente
     */
    showAddModal() {
        const fields = [
            {
                name: 'nome',
                label: 'Nome do Ingrediente',
                type: 'text',
                required: true,
                placeholder: 'Ex: Mussarela'
            },
            {
                name: 'categoria',
                label: 'Categoria',
                type: 'select',
                required: true,
                options: Object.entries(LABELS_CATEGORIAS).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            {
                name: 'unidade',
                label: 'Unidade de Medida',
                type: 'select',
                required: true,
                options: Object.entries(LABELS_UNIDADES).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            {
                name: 'preco',
                label: 'Preço por Unidade',
                type: 'number',
                required: true,
                placeholder: '0.00'
            },
            {
                name: 'fornecedor',
                label: 'Fornecedor',
                type: 'text',
                placeholder: 'Nome do fornecedor'
            },
            {
                name: 'descricao',
                label: 'Descrição',
                type: 'textarea',
                placeholder: 'Descrição opcional do ingrediente'
            }
        ];

        modal.form(
            'Novo Ingrediente',
            fields,
            (data) => this.addIngrediente(data),
            null,
            { size: 'medium' }
        );
    }

    /**
     * Mostra modal de editar ingrediente
     */
    showEditModal(id) {
        const ingrediente = this.ingredientes.find(i => i.id === id);
        if (!ingrediente) {
            toast.error('Ingrediente não encontrado');
            return;
        }

        const fields = [
            {
                name: 'nome',
                label: 'Nome do Ingrediente',
                type: 'text',
                required: true,
                value: ingrediente.nome
            },
            {
                name: 'categoria',
                label: 'Categoria',
                type: 'select',
                required: true,
                value: ingrediente.categoria,
                options: Object.entries(LABELS_CATEGORIAS).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            {
                name: 'unidade',
                label: 'Unidade de Medida',
                type: 'select',
                required: true,
                value: ingrediente.unidade,
                options: Object.entries(LABELS_UNIDADES).map(([value, label]) => ({
                    value,
                    label
                }))
            },
            {
                name: 'preco',
                label: 'Preço por Unidade',
                type: 'number',
                required: true,
                value: ingrediente.preco
            },
            {
                name: 'fornecedor',
                label: 'Fornecedor',
                type: 'text',
                value: ingrediente.fornecedor || ''
            },
            {
                name: 'descricao',
                label: 'Descrição',
                type: 'textarea',
                value: ingrediente.descricao || ''
            }
        ];

        modal.form(
            'Editar Ingrediente',
            fields,
            (data) => this.updateIngrediente(id, data),
            null,
            { size: 'medium' }
        );
    }

    /**
     * Adiciona novo ingrediente
     */
    async addIngrediente(data) {
        // Valida dados
        const ingrediente = {
            nome: data.nome,
            categoria: data.categoria,
            unidade: data.unidade,
            preco: data.preco,
            fornecedor: data.fornecedor,
            descricao: data.descricao
        };

        if (!validator.validateIngrediente(ingrediente)) {
            toast.error(validator.getFormattedErrors());
            return;
        }

        // Verifica se já existe
        const exists = this.ingredientes.some(i => 
            i.nome.toLowerCase() === ingrediente.nome.toLowerCase() &&
            i.categoria === ingrediente.categoria
        );

        if (exists) {
            toast.error('Já existe um ingrediente com este nome nesta categoria');
            return;
        }

        // Adiciona ingrediente
        ingrediente.id = generateId();
        ingrediente.criadoEm = new Date().toISOString();
        
        this.ingredientes.push(ingrediente);
        await this.saveData();
        
        this.applyFilters();
        toast.success('Ingrediente adicionado com sucesso!');
    }

    /**
     * Atualiza ingrediente existente
     */
    async updateIngrediente(id, data) {
        const index = this.ingredientes.findIndex(i => i.id === id);
        if (index === -1) {
            toast.error('Ingrediente não encontrado');
            return;
        }

        // Valida dados
        const ingrediente = {
            ...this.ingredientes[index],
            nome: data.nome,
            categoria: data.categoria,
            unidade: data.unidade,
            preco: data.preco,
            fornecedor: data.fornecedor,
            descricao: data.descricao,
            atualizadoEm: new Date().toISOString()
        };

        if (!validator.validateIngrediente(ingrediente)) {
            toast.error(validator.getFormattedErrors());
            return;
        }

        // Verifica duplicatas (exceto o próprio)
        const exists = this.ingredientes.some(i => 
            i.id !== id &&
            i.nome.toLowerCase() === ingrediente.nome.toLowerCase() &&
            i.categoria === ingrediente.categoria
        );

        if (exists) {
            toast.error('Já existe um ingrediente com este nome nesta categoria');
            return;
        }

        // Atualiza ingrediente
        this.ingredientes[index] = ingrediente;
        await this.saveData();
        
        this.applyFilters();
        toast.success('Ingrediente atualizado com sucesso!');
    }

    /**
     * Confirma exclusão de ingrediente
     */
    confirmDelete(id) {
        const ingrediente = this.ingredientes.find(i => i.id === id);
        if (!ingrediente) {
            toast.error('Ingrediente não encontrado');
            return;
        }

        modal.confirm(
            `Tem certeza que deseja excluir o ingrediente "${ingrediente.nome}"?`,
            () => this.deleteIngrediente(id),
            null,
            { title: 'Confirmar Exclusão' }
        );
    }

    /**
     * Exclui ingrediente
     */
    async deleteIngrediente(id) {
        const index = this.ingredientes.findIndex(i => i.id === id);
        if (index === -1) {
            toast.error('Ingrediente não encontrado');
            return;
        }

        this.ingredientes.splice(index, 1);
        await this.saveData();
        
        this.applyFilters();
        toast.success('Ingrediente excluído com sucesso!');
    }

    /**
     * Configura event listeners após renderização
     */
    setupEventListeners() {
        // Busca
        const searchInput = document.getElementById('search-ingredientes');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch);
        }

        // Filtro de categoria
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.handleCategoryFilter(e));
        }

        // Ordenação
        const sortSelect = document.getElementById('sort-by');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.handleSortChange(e));
        }
    }
}

// Instância global para uso nos event handlers
window.ingredientesModule = null;

// Estilos CSS específicos do módulo
const ingredientesStyles = `
    .ingredientes-module {
        padding: 0;
    }

    .module-header {
        background: var(--white);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-xl);
        margin-bottom: var(--spacing-xl);
        box-shadow: var(--shadow-sm);
    }

    .filters-container {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr auto;
        gap: var(--spacing-md);
        align-items: center;
    }

    .search-container {
        position: relative;
    }

    .search-input {
        width: 100%;
        padding-right: 40px;
    }

    .search-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--gray-medium);
    }

    .stats-container {
        margin-top: var(--spacing-xl);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-lg);
    }

    .stat-card {
        background: var(--white);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-xl);
        text-align: center;
        box-shadow: var(--shadow-sm);
        border-left: 4px solid var(--primary-color);
    }

    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--gray-dark);
        margin-bottom: var(--spacing-xs);
    }

    .stat-label {
        color: var(--gray-medium);
        font-size: var(--font-size-sm);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .badge-category {
        background: var(--primary-color);
        color: var(--white);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--border-radius-sm);
        font-size: var(--font-size-xs);
        font-weight: 500;
    }

    .action-buttons {
        display: flex;
        gap: var(--spacing-xs);
    }

    .empty-state {
        text-align: center;
        padding: var(--spacing-3xl);
        color: var(--gray-medium);
    }

    .empty-icon {
        font-size: 4rem;
        margin-bottom: var(--spacing-lg);
    }

    .empty-state h3 {
        margin-bottom: var(--spacing-md);
        color: var(--gray-dark);
    }

    .empty-state p {
        margin-bottom: var(--spacing-xl);
    }

    .table th {
        cursor: pointer;
        user-select: none;
    }

    .table th:hover {
        background: var(--gray-lighter);
    }

    @media (max-width: 768px) {
        .filters-container {
            grid-template-columns: 1fr;
            gap: var(--spacing-sm);
        }

        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .action-buttons {
            flex-direction: column;
        }
    }
`;

// Injeta estilos se não existirem
if (!document.getElementById('ingredientes-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'ingredientes-styles';
    styleSheet.textContent = ingredientesStyles;
    document.head.appendChild(styleSheet);
}

