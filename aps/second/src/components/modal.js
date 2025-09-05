/**
 * Componente Modal para Janelas de Diálogo
 * Gerencia criação e exibição de modais dinâmicos
 */

class ModalManager {
    constructor() {
        this.container = null;
        this.modals = new Map();
        this.activeModal = null;
        this.init();
    }

    /**
     * Inicializa o gerenciador de modais
     */
    init() {
        this.container = document.getElementById('modals-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'modals-container';
            document.body.appendChild(this.container);
        }

        // Event listeners globais
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.hide(this.activeModal);
            }
        });
    }

    /**
     * Cria e mostra modal
     */
    show(config) {
        const modal = this.createModal(config);
        const id = this.generateId();
        
        this.modals.set(id, modal);
        this.container.appendChild(modal.overlay);
        
        // Anima entrada
        requestAnimationFrame(() => {
            modal.overlay.classList.add('show');
        });
        
        this.activeModal = id;
        
        // Foca no primeiro elemento focável
        this.focusFirstElement(modal.content);
        
        return id;
    }

    /**
     * Cria estrutura do modal
     */
    createModal(config) {
        const {
            title = 'Modal',
            content = '',
            size = 'medium',
            closable = true,
            backdrop = true,
            keyboard = true,
            footer = null,
            onShow = null,
            onHide = null
        } = config;

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        if (backdrop) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    const id = this.findModalId(overlay);
                    if (id) this.hide(id);
                }
            });
        }

        // Modal
        const modal = document.createElement('div');
        modal.className = `modal modal-${size}`;
        
        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const titleElement = document.createElement('h3');
        titleElement.className = 'modal-title';
        titleElement.textContent = title;
        
        header.appendChild(titleElement);
        
        if (closable) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal-close';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = () => {
                const id = this.findModalId(overlay);
                if (id) this.hide(id);
            };
            header.appendChild(closeBtn);
        }
        
        // Body
        const body = document.createElement('div');
        body.className = 'modal-body';
        
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }
        
        modal.appendChild(header);
        modal.appendChild(body);
        
        // Footer
        if (footer) {
            const footerElement = document.createElement('div');
            footerElement.className = 'modal-footer';
            
            if (Array.isArray(footer)) {
                footer.forEach(button => {
                    const btn = this.createButton(button, overlay);
                    footerElement.appendChild(btn);
                });
            } else if (typeof footer === 'string') {
                footerElement.innerHTML = footer;
            } else if (footer instanceof HTMLElement) {
                footerElement.appendChild(footer);
            }
            
            modal.appendChild(footerElement);
        }
        
        overlay.appendChild(modal);
        
        // Callbacks
        if (onShow) {
            setTimeout(() => onShow(id), 100);
        }
        
        return {
            overlay,
            modal,
            header,
            body,
            footer: modal.querySelector('.modal-footer'),
            onHide
        };
    }

    /**
     * Cria botão para footer
     */
    createButton(buttonConfig, overlay) {
        const {
            text = 'Button',
            type = 'secondary',
            handler = null,
            close = true
        } = buttonConfig;
        
        const button = document.createElement('button');
        button.className = `btn btn-${type}`;
        button.textContent = text;
        
        button.onclick = () => {
            if (handler) {
                handler();
            }
            if (close) {
                const id = this.findModalId(overlay);
                if (id) this.hide(id);
            }
        };
        
        return button;
    }

    /**
     * Esconde modal
     */
    hide(id) {
        const modalData = this.modals.get(id);
        if (!modalData) return;

        const { overlay, onHide } = modalData;
        
        overlay.classList.remove('show');
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            this.modals.delete(id);
            
            if (this.activeModal === id) {
                this.activeModal = null;
            }
            
            if (onHide) {
                onHide(id);
            }
        }, 300); // Tempo da animação CSS
    }

    /**
     * Esconde todos os modais
     */
    hideAll() {
        this.modals.forEach((modal, id) => {
            this.hide(id);
        });
    }

    /**
     * Atualiza conteúdo do modal
     */
    updateContent(id, content) {
        const modalData = this.modals.get(id);
        if (!modalData) return false;

        const body = modalData.body;
        
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.innerHTML = '';
            body.appendChild(content);
        }
        
        return true;
    }

    /**
     * Atualiza título do modal
     */
    updateTitle(id, title) {
        const modalData = this.modals.get(id);
        if (!modalData) return false;

        const titleElement = modalData.header.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
        
        return true;
    }

    /**
     * Encontra ID do modal pelo elemento
     */
    findModalId(modalElement) {
        for (const [id, modal] of this.modals) {
            if (modal.overlay === modalElement) {
                return id;
            }
        }
        return null;
    }

    /**
     * Foca no primeiro elemento focável
     */
    focusFirstElement(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    /**
     * Gera ID único
     */
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Modal de confirmação
     */
    confirm(message, onConfirm, onCancel = null, options = {}) {
        const config = {
            title: options.title || 'Confirmação',
            content: `<p>${message}</p>`,
            size: options.size || 'small',
            footer: [
                {
                    text: 'Cancelar',
                    type: 'secondary',
                    handler: onCancel
                },
                {
                    text: 'Confirmar',
                    type: 'primary',
                    handler: onConfirm
                }
            ],
            ...options
        };
        
        return this.show(config);
    }

    /**
     * Modal de alerta
     */
    alert(message, onOk = null, options = {}) {
        const config = {
            title: options.title || 'Aviso',
            content: `<p>${message}</p>`,
            size: options.size || 'small',
            footer: [
                {
                    text: 'OK',
                    type: 'primary',
                    handler: onOk
                }
            ],
            ...options
        };
        
        return this.show(config);
    }

    /**
     * Modal de prompt
     */
    prompt(message, defaultValue = '', onSubmit = null, onCancel = null, options = {}) {
        const inputId = 'modal-prompt-input-' + Date.now();
        
        const content = `
            <p>${message}</p>
            <div class="form-group">
                <input type="text" id="${inputId}" class="form-control" value="${defaultValue}" placeholder="Digite aqui...">
            </div>
        `;
        
        const config = {
            title: options.title || 'Entrada de Dados',
            content: content,
            size: options.size || 'small',
            footer: [
                {
                    text: 'Cancelar',
                    type: 'secondary',
                    handler: onCancel
                },
                {
                    text: 'OK',
                    type: 'primary',
                    handler: () => {
                        const input = document.getElementById(inputId);
                        const value = input ? input.value : '';
                        if (onSubmit) onSubmit(value);
                    }
                }
            ],
            onShow: () => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.focus();
                    input.select();
                }
            },
            ...options
        };
        
        return this.show(config);
    }

    /**
     * Modal de loading
     */
    loading(message = 'Carregando...', options = {}) {
        const content = `
            <div style="text-align: center; padding: 20px;">
                <div class="spinner" style="margin: 0 auto 20px;"></div>
                <p>${message}</p>
            </div>
        `;
        
        const config = {
            title: options.title || 'Aguarde',
            content: content,
            size: 'small',
            closable: false,
            backdrop: false,
            keyboard: false,
            ...options
        };
        
        return this.show(config);
    }

    /**
     * Modal de formulário
     */
    form(title, fields, onSubmit, onCancel = null, options = {}) {
        let content = '<form id="modal-form">';
        
        fields.forEach(field => {
            content += `
                <div class="form-group">
                    <label class="form-label">${field.label}</label>
                    ${this.createFormField(field)}
                </div>
            `;
        });
        
        content += '</form>';
        
        const config = {
            title: title,
            content: content,
            footer: [
                {
                    text: 'Cancelar',
                    type: 'secondary',
                    handler: onCancel
                },
                {
                    text: 'Salvar',
                    type: 'primary',
                    handler: () => {
                        const form = document.getElementById('modal-form');
                        const formData = new FormData(form);
                        const data = Object.fromEntries(formData.entries());
                        if (onSubmit) onSubmit(data);
                    }
                }
            ],
            ...options
        };
        
        return this.show(config);
    }

    /**
     * Cria campo de formulário
     */
    createFormField(field) {
        const {
            type = 'text',
            name,
            value = '',
            placeholder = '',
            required = false,
            options = []
        } = field;
        
        const requiredAttr = required ? 'required' : '';
        
        switch (type) {
            case 'select':
                let select = `<select name="${name}" class="form-control" ${requiredAttr}>`;
                if (!required) {
                    select += '<option value="">Selecione...</option>';
                }
                options.forEach(option => {
                    const selected = option.value === value ? 'selected' : '';
                    select += `<option value="${option.value}" ${selected}>${option.label}</option>`;
                });
                select += '</select>';
                return select;
                
            case 'textarea':
                return `<textarea name="${name}" class="form-control" placeholder="${placeholder}" ${requiredAttr}>${value}</textarea>`;
                
            case 'checkbox':
                const checked = value ? 'checked' : '';
                return `<input type="checkbox" name="${name}" value="1" ${checked} ${requiredAttr}>`;
                
            default:
                return `<input type="${type}" name="${name}" class="form-control" value="${value}" placeholder="${placeholder}" ${requiredAttr}>`;
        }
    }

    /**
     * Obtém modal ativo
     */
    getActiveModal() {
        return this.activeModal;
    }

    /**
     * Verifica se há modal aberto
     */
    hasActiveModal() {
        return this.activeModal !== null;
    }

    /**
     * Obtém estatísticas dos modais
     */
    getStats() {
        return {
            active: this.modals.size,
            activeModal: this.activeModal,
            container: this.container ? 'ready' : 'not initialized'
        };
    }

    /**
     * Limpa todos os modais e reinicia
     */
    reset() {
        this.hideAll();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.modals.clear();
        this.activeModal = null;
        this.init();
    }
}

// Instância singleton
const modal = new ModalManager();

export default modal;

