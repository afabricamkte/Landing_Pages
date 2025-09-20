// Componentes do Sistema APS
class Components {
    
    // Toast de notificação
    static showToast(message, type = 'success', duration = 3000) {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');
        
        // Remove classes anteriores
        toast.classList.remove('success', 'error', 'warning', 'show');
        
        // Define ícone baseado no tipo
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        icon.className = `toast-icon ${icons[type] || icons.success}`;
        messageEl.textContent = message;
        toast.classList.add(type, 'show');
        
        // Remove automaticamente
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // Modal genérico
    static showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Foca no primeiro input
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    static hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Confirmação de ação
    static async confirm(message, title = 'Confirmação') {
        return new Promise((resolve) => {
            const modal = this.createConfirmModal(message, title, resolve);
            document.body.appendChild(modal);
            modal.classList.add('show');
        });
    }

    static createConfirmModal(message, title, callback) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div style="padding: 24px;">
                    <p>${message}</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove(); document.body.style.overflow = '';">Cancelar</button>
                    <button type="button" class="btn-primary confirm-btn">Confirmar</button>
                </div>
            </div>
        `;

        modal.querySelector('.confirm-btn').onclick = () => {
            modal.remove();
            document.body.style.overflow = '';
            callback(true);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
                callback(false);
            }
        };

        return modal;
    }

    // Loading overlay
    static showLoading(message = 'Carregando...') {
        let loading = document.getElementById('loading-overlay');
        
        if (!loading) {
            loading = document.createElement('div');
            loading.id = 'loading-overlay';
            loading.className = 'loading-screen';
            loading.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h3 id="loading-message">${message}</h3>
                </div>
            `;
            document.body.appendChild(loading);
        } else {
            document.getElementById('loading-message').textContent = message;
            loading.classList.remove('hidden');
        }
    }

    static hideLoading() {
        const loading = document.getElementById('loading-overlay');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    // Tabela de dados
    static createDataTable(containerId, data, columns, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const table = document.createElement('table');
        table.className = 'data-table';

        // Cabeçalho
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column.title;
            if (column.sortable) {
                th.style.cursor = 'pointer';
                th.onclick = () => this.sortTable(table, column.key);
            }
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Corpo
        const tbody = document.createElement('tbody');
        this.populateTableBody(tbody, data, columns, options);
        table.appendChild(tbody);

        container.innerHTML = '';
        container.appendChild(table);

        return table;
    }

    static populateTableBody(tbody, data, columns, options) {
        tbody.innerHTML = '';
        
        data.forEach((item, index) => {
            const row = document.createElement('tr');
            
            columns.forEach(column => {
                const td = document.createElement('td');
                
                if (column.render) {
                    td.innerHTML = column.render(item[column.key], item, index);
                } else if (column.format) {
                    td.textContent = this.formatValue(item[column.key], column.format);
                } else {
                    td.textContent = item[column.key] || '';
                }
                
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
    }

    static formatValue(value, format) {
        switch (format) {
            case 'currency':
                return Utils.formatMoeda(value);
            case 'percentage':
                return Utils.formatPercentual(value);
            case 'number':
                return Utils.formatNumero(value);
            case 'date':
                return Utils.formatData(value);
            default:
                return value;
        }
    }

    // Ordenação de tabela
    static sortTable(table, key) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        const isAscending = table.dataset.sortDirection !== 'asc';
        table.dataset.sortDirection = isAscending ? 'asc' : 'desc';
        
        rows.sort((a, b) => {
            const aValue = a.cells[0].textContent; // Simplificado
            const bValue = b.cells[0].textContent;
            
            if (isAscending) {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
        
        rows.forEach(row => tbody.appendChild(row));
    }

    // Formulário dinâmico
    static createForm(containerId, fields, data = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const form = document.createElement('form');
        form.className = 'dynamic-form';

        fields.forEach(field => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const label = document.createElement('label');
            label.textContent = field.label;
            if (field.required) {
                label.innerHTML += ' <span style="color: red;">*</span>';
            }
            formGroup.appendChild(label);

            const input = this.createFormInput(field, data[field.name]);
            formGroup.appendChild(input);

            form.appendChild(formGroup);
        });

        container.innerHTML = '';
        container.appendChild(form);

        return form;
    }

    static createFormInput(field, value = '') {
        let input;

        switch (field.type) {
            case 'select':
                input = document.createElement('select');
                input.innerHTML = '<option value="">Selecione</option>';
                field.options.forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option.value;
                    optionEl.textContent = option.label;
                    if (option.value === value) {
                        optionEl.selected = true;
                    }
                    input.appendChild(optionEl);
                });
                break;
            
            case 'textarea':
                input = document.createElement('textarea');
                input.value = value;
                input.rows = field.rows || 3;
                break;
            
            default:
                input = document.createElement('input');
                input.type = field.type || 'text';
                input.value = value;
                
                if (field.min !== undefined) input.min = field.min;
                if (field.max !== undefined) input.max = field.max;
                if (field.step !== undefined) input.step = field.step;
                if (field.placeholder) input.placeholder = field.placeholder;
        }

        input.name = field.name;
        input.id = field.name;
        
        if (field.required) {
            input.required = true;
        }

        return input;
    }

    // Cards de pizza
    static createPizzaCard(pizza) {
        const card = document.createElement('div');
        card.className = 'pizza-card';
        card.innerHTML = `
            <div class="pizza-header">
                <div class="pizza-name">${pizza.nome}</div>
                <div class="pizza-category">${pizza.categoria}</div>
            </div>
            <div class="pizza-content">
                <div class="pizza-ingredients">
                    <h4>Ingredientes:</h4>
                    <div class="ingredients-list">${this.formatIngredients(pizza.recheios)}</div>
                </div>
                <div class="pizza-pricing">
                    ${CONFIG.TAMANHOS.map(tamanho => `
                        <div class="size-price">
                            <div class="size">${tamanho}</div>
                            <div class="price">${Utils.formatMoeda(pizza.precos[tamanho] || 0)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="pizza-actions">
                <button class="btn-action btn-edit" onclick="editPizza('${pizza.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deletePizza('${pizza.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return card;
    }

    static formatIngredients(recheios) {
        if (!recheios || recheios.length === 0) {
            return 'Nenhum recheio cadastrado';
        }
        
        return recheios.map(recheio => recheio.nome).join(', ');
    }

    // Cards de custo
    static createCostCard(title, value, subtitle = '') {
        const card = document.createElement('div');
        card.className = 'cost-card';
        card.innerHTML = `
            <h3>${title}</h3>
            <div class="cost-value">${Utils.formatMoeda(value)}</div>
            ${subtitle ? `<div class="cost-subtitle">${subtitle}</div>` : ''}
        `;
        
        return card;
    }

    // Filtros de tabela
    static createTableFilters(containerId, filters) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const filtersBar = document.createElement('div');
        filtersBar.className = 'filters-bar';

        filters.forEach(filter => {
            const filterGroup = document.createElement('div');
            filterGroup.className = 'filter-group';

            const label = document.createElement('label');
            label.textContent = filter.label;
            filterGroup.appendChild(label);

            let input;
            if (filter.type === 'select') {
                input = document.createElement('select');
                input.innerHTML = '<option value="">Todos</option>';
                filter.options.forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option.value;
                    optionEl.textContent = option.label;
                    input.appendChild(optionEl);
                });
            } else {
                input = document.createElement('input');
                input.type = filter.type || 'text';
                input.placeholder = filter.placeholder || '';
            }

            input.id = filter.id;
            input.addEventListener('change', filter.onChange);
            input.addEventListener('input', Utils.debounce(filter.onChange, 300));

            filterGroup.appendChild(input);
            filtersBar.appendChild(filterGroup);
        });

        container.innerHTML = '';
        container.appendChild(filtersBar);
    }

    // Gráficos (usando Chart.js)
    static createChart(canvasId, type, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Destrói gráfico existente
        if (canvas.chart) {
            canvas.chart.destroy();
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };

        const config = {
            type: type,
            data: data,
            options: { ...defaultOptions, ...options }
        };

        canvas.chart = new Chart(canvas, config);
        return canvas.chart;
    }

    // Breadcrumb
    static updateBreadcrumb(items) {
        let breadcrumb = document.querySelector('.breadcrumb');
        
        if (!breadcrumb) {
            breadcrumb = document.createElement('nav');
            breadcrumb.className = 'breadcrumb';
            
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.insertBefore(breadcrumb, mainContent.firstChild);
            }
        }

        breadcrumb.innerHTML = items.map((item, index) => {
            if (index === items.length - 1) {
                return `<span class="breadcrumb-current">${item.label}</span>`;
            } else {
                return `<a href="#" class="breadcrumb-link" onclick="navigateTo('${item.section}')">${item.label}</a>`;
            }
        }).join(' <i class="fas fa-chevron-right"></i> ');
    }

    // Paginação
    static createPagination(containerId, totalItems, itemsPerPage, currentPage, onPageChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const pagination = document.createElement('div');
        pagination.className = 'pagination';

        // Botão anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => onPageChange(currentPage - 1);
        pagination.appendChild(prevBtn);

        // Números das páginas
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            const firstBtn = document.createElement('button');
            firstBtn.className = 'pagination-btn';
            firstBtn.textContent = '1';
            firstBtn.onclick = () => onPageChange(1);
            pagination.appendChild(firstBtn);

            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => onPageChange(i);
            pagination.appendChild(pageBtn);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }

            const lastBtn = document.createElement('button');
            lastBtn.className = 'pagination-btn';
            lastBtn.textContent = totalPages;
            lastBtn.onclick = () => onPageChange(totalPages);
            pagination.appendChild(lastBtn);
        }

        // Botão próximo
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => onPageChange(currentPage + 1);
        pagination.appendChild(nextBtn);

        container.innerHTML = '';
        container.appendChild(pagination);
    }

    // Validação visual de formulário
    static validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            const isFieldValid = this.validateField(input);
            if (!isFieldValid) {
                isValid = false;
            }
        });

        return isValid;
    }

    static validateField(input) {
        const value = input.value.trim();
        let isValid = true;
        let message = '';

        // Remove classes anteriores
        input.classList.remove('error', 'success');
        
        // Remove mensagem de erro anterior
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Validação de campo obrigatório
        if (input.required && !value) {
            isValid = false;
            message = 'Campo obrigatório';
        }

        // Validação de tipo
        if (value && input.type === 'email' && !Utils.validarEmail(value)) {
            isValid = false;
            message = 'Email inválido';
        }

        if (value && input.type === 'number') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                isValid = false;
                message = 'Número inválido';
            } else if (input.min && num < parseFloat(input.min)) {
                isValid = false;
                message = `Valor mínimo: ${input.min}`;
            } else if (input.max && num > parseFloat(input.max)) {
                isValid = false;
                message = `Valor máximo: ${input.max}`;
            }
        }

        // Aplica estilo visual
        if (isValid) {
            input.classList.add('success');
        } else {
            input.classList.add('error');
            
            // Adiciona mensagem de erro
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            input.parentNode.appendChild(errorDiv);
        }

        return isValid;
    }

    // Busca em tempo real
    static setupSearch(inputId, dataArray, searchFields, onResults) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const search = Utils.debounce((query) => {
            if (!query.trim()) {
                onResults(dataArray);
                return;
            }

            const results = dataArray.filter(item => {
                return searchFields.some(field => {
                    const value = item[field];
                    return value && value.toString().toLowerCase().includes(query.toLowerCase());
                });
            });

            onResults(results);
        }, 300);

        input.addEventListener('input', (e) => {
            search(e.target.value);
        });
    }
}

// Exportar componentes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Components;
}
