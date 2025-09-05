/**
 * Componente Toast para Notificações
 * Gerencia exibição de mensagens temporárias para o usuário
 */

import { TIMEOUTS } from '../utils/constants.js';

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    /**
     * Inicializa o gerenciador de toasts
     */
    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Mostra toast de sucesso
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    /**
     * Mostra toast de erro
     */
    error(message, options = {}) {
        return this.show(message, 'danger', options);
    }

    /**
     * Mostra toast de aviso
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    /**
     * Mostra toast de informação
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    /**
     * Mostra toast genérico
     */
    show(message, type = 'info', options = {}) {
        const config = {
            duration: TIMEOUTS.TOAST_DURATION,
            closable: true,
            icon: this.getIcon(type),
            title: this.getTitle(type),
            ...options
        };

        const toast = this.createToast(message, type, config);
        const id = this.generateId();
        
        this.toasts.set(id, toast);
        this.container.appendChild(toast);

        // Anima entrada
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remove se configurado
        if (config.duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, config.duration);
        }

        return id;
    }

    /**
     * Cria elemento do toast
     */
    createToast(message, type, config) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const header = document.createElement('div');
        header.className = 'toast-header';
        
        const title = document.createElement('div');
        title.className = 'toast-title';
        title.innerHTML = `${config.icon} ${config.title}`;
        
        header.appendChild(title);
        
        if (config.closable) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'toast-close';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = () => {
                const id = this.findToastId(toast);
                if (id) this.hide(id);
            };
            header.appendChild(closeBtn);
        }
        
        const body = document.createElement('div');
        body.className = 'toast-body';
        body.textContent = message;
        
        toast.appendChild(header);
        toast.appendChild(body);
        
        return toast;
    }

    /**
     * Esconde toast
     */
    hide(id) {
        const toast = this.toasts.get(id);
        if (!toast) return;

        toast.classList.remove('show');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts.delete(id);
        }, 300); // Tempo da animação CSS
    }

    /**
     * Esconde todos os toasts
     */
    hideAll() {
        this.toasts.forEach((toast, id) => {
            this.hide(id);
        });
    }

    /**
     * Encontra ID do toast pelo elemento
     */
    findToastId(toastElement) {
        for (const [id, toast] of this.toasts) {
            if (toast === toastElement) {
                return id;
            }
        }
        return null;
    }

    /**
     * Obtém ícone para o tipo
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            danger: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Obtém título para o tipo
     */
    getTitle(type) {
        const titles = {
            success: 'Sucesso',
            danger: 'Erro',
            warning: 'Aviso',
            info: 'Informação'
        };
        return titles[type] || titles.info;
    }

    /**
     * Gera ID único
     */
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Mostra toast de loading
     */
    loading(message = 'Carregando...', options = {}) {
        const config = {
            duration: 0, // Não remove automaticamente
            closable: false,
            icon: '⏳',
            title: 'Aguarde',
            ...options
        };

        return this.show(message, 'info', config);
    }

    /**
     * Atualiza toast existente
     */
    update(id, message, type = null) {
        const toast = this.toasts.get(id);
        if (!toast) return false;

        const body = toast.querySelector('.toast-body');
        if (body) {
            body.textContent = message;
        }

        if (type) {
            // Remove classes de tipo antigas
            toast.className = toast.className.replace(/toast-\w+/g, '');
            toast.classList.add(`toast-${type}`);
            
            // Atualiza header
            const title = toast.querySelector('.toast-title');
            if (title) {
                title.innerHTML = `${this.getIcon(type)} ${this.getTitle(type)}`;
            }
        }

        return true;
    }

    /**
     * Mostra toast com progresso
     */
    progress(message, progress = 0, options = {}) {
        const config = {
            duration: 0,
            closable: false,
            icon: '📊',
            title: 'Progresso',
            ...options
        };

        const toast = this.createProgressToast(message, progress, config);
        const id = this.generateId();
        
        this.toasts.set(id, toast);
        this.container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        return id;
    }

    /**
     * Cria toast com barra de progresso
     */
    createProgressToast(message, progress, config) {
        const toast = this.createToast(message, 'info', config);
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'toast-progress';
        progressContainer.style.cssText = `
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
            margin-top: 8px;
            overflow: hidden;
        `;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'toast-progress-bar';
        progressBar.style.cssText = `
            height: 100%;
            background: #fff;
            border-radius: 2px;
            transition: width 0.3s ease;
            width: ${Math.max(0, Math.min(100, progress))}%;
        `;
        
        progressContainer.appendChild(progressBar);
        toast.appendChild(progressContainer);
        
        return toast;
    }

    /**
     * Atualiza progresso do toast
     */
    updateProgress(id, progress, message = null) {
        const toast = this.toasts.get(id);
        if (!toast) return false;

        const progressBar = toast.querySelector('.toast-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        }

        if (message) {
            const body = toast.querySelector('.toast-body');
            if (body) {
                body.textContent = message;
            }
        }

        return true;
    }

    /**
     * Mostra toast com ações
     */
    action(message, actions = [], options = {}) {
        const config = {
            duration: 0,
            closable: true,
            icon: '🔔',
            title: 'Ação Necessária',
            ...options
        };

        const toast = this.createActionToast(message, actions, config);
        const id = this.generateId();
        
        this.toasts.set(id, toast);
        this.container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        return id;
    }

    /**
     * Cria toast com botões de ação
     */
    createActionToast(message, actions, config) {
        const toast = this.createToast(message, 'info', config);
        
        if (actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'toast-actions';
            actionsContainer.style.cssText = `
                display: flex;
                gap: 8px;
                margin-top: 12px;
                justify-content: flex-end;
            `;
            
            actions.forEach(action => {
                const button = document.createElement('button');
                button.className = `btn btn-sm ${action.type || 'btn-secondary'}`;
                button.textContent = action.label;
                button.onclick = () => {
                    if (action.handler) {
                        action.handler();
                    }
                    if (action.closeOnClick !== false) {
                        const id = this.findToastId(toast);
                        if (id) this.hide(id);
                    }
                };
                
                actionsContainer.appendChild(button);
            });
            
            toast.appendChild(actionsContainer);
        }
        
        return toast;
    }

    /**
     * Mostra toast de confirmação
     */
    confirm(message, onConfirm, onCancel = null, options = {}) {
        const actions = [
            {
                label: 'Cancelar',
                type: 'btn-secondary',
                handler: onCancel
            },
            {
                label: 'Confirmar',
                type: 'btn-primary',
                handler: onConfirm
            }
        ];

        const config = {
            icon: '❓',
            title: 'Confirmação',
            ...options
        };

        return this.action(message, actions, config);
    }

    /**
     * Obtém estatísticas dos toasts
     */
    getStats() {
        return {
            active: this.toasts.size,
            container: this.container ? 'ready' : 'not initialized'
        };
    }

    /**
     * Limpa todos os toasts e reinicia
     */
    reset() {
        this.hideAll();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.toasts.clear();
        this.init();
    }
}

// Instância singleton
const toast = new ToastManager();

// Função global para compatibilidade
window.mostrarToast = (message, type = 'info') => {
    switch (type) {
        case 'success':
            return toast.success(message);
        case 'error':
        case 'danger':
            return toast.error(message);
        case 'warning':
            return toast.warning(message);
        default:
            return toast.info(message);
    }
};

export default toast;

