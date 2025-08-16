// NPS Eventos Pro - Sistema de Monitoramento de Erros
// Monitora e reporta erros JavaScript em tempo real

/**
 * Sistema de monitoramento de erros
 */
class ErrorMonitor {
    constructor() {
        this.errors = [];
        this.maxErrors = 50; // Máximo de erros armazenados
        this.isEnabled = true;
        this.init();
    }

    init() {
        // Monitorar erros JavaScript
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        });

        // Monitorar promises rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason ? event.reason.toString() : 'Unhandled Promise Rejection',
                stack: event.reason ? event.reason.stack : null,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        });

        // Monitorar erros de recursos (imagens, scripts, etc.)
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError({
                    type: 'resource',
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    src: event.target.src || event.target.href,
                    timestamp: new Date().toISOString(),
                    url: window.location.href
                });
            }
        }, true);

        // Monitorar erros de console
        this.interceptConsoleError();

        console.log('🔍 Error Monitor initialized');
    }

    logError(errorData) {
        if (!this.isEnabled) return;

        // Adicionar ID único
        errorData.id = this.generateId();

        // Adicionar à lista
        this.errors.unshift(errorData);

        // Limitar número de erros
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }

        // Log no console com formatação
        this.formatConsoleError(errorData);

        // Salvar no localStorage
        this.saveToStorage();

        // Notificar se necessário
        this.notifyIfCritical(errorData);
    }

    formatConsoleError(error) {
        const styles = {
            error: 'color: #ff4444; font-weight: bold;',
            warning: 'color: #ffaa00; font-weight: bold;',
            info: 'color: #4444ff;',
            success: 'color: #44ff44;'
        };

        console.group(`%c🚨 Error Monitor - ${error.type.toUpperCase()}`, styles.error);
        console.log(`%cMessage: ${error.message}`, styles.info);
        console.log(`%cTimestamp: ${error.timestamp}`, styles.info);
        
        if (error.filename) {
            console.log(`%cFile: ${error.filename}:${error.lineno}:${error.colno}`, styles.info);
        }
        
        if (error.stack) {
            console.log(`%cStack Trace:`, styles.warning);
            console.log(error.stack);
        }
        
        console.log(`%cURL: ${error.url}`, styles.info);
        console.groupEnd();
    }

    interceptConsoleError() {
        const originalError = console.error;
        console.error = (...args) => {
            // Chamar console.error original
            originalError.apply(console, args);

            // Log no monitor se não for do próprio monitor
            const message = args.join(' ');
            if (!message.includes('Error Monitor')) {
                this.logError({
                    type: 'console',
                    message: message,
                    timestamp: new Date().toISOString(),
                    url: window.location.href
                });
            }
        };
    }

    notifyIfCritical(error) {
        // Verificar se é um erro crítico
        const criticalKeywords = [
            'initApp',
            'state',
            'translations',
            'Cannot read property',
            'is not defined',
            'is not a function'
        ];

        const isCritical = criticalKeywords.some(keyword => 
            error.message.toLowerCase().includes(keyword.toLowerCase())
        );

        if (isCritical) {
            this.showCriticalErrorNotification(error);
        }
    }

    showCriticalErrorNotification(error) {
        // Criar notificação visual para erros críticos
        const notification = document.createElement('div');
        notification.className = 'error-notification critical';
        notification.innerHTML = `
            <div class="error-notification-content">
                <h4>🚨 Erro Crítico Detectado</h4>
                <p>${error.message}</p>
                <button onclick="this.parentElement.parentElement.remove()">Fechar</button>
                <button onclick="window.errorMonitor.showErrorReport()">Ver Detalhes</button>
            </div>
        `;

        // Adicionar estilos se não existirem
        if (!document.querySelector('#error-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'error-notification-styles';
            styles.textContent = `
                .error-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #ff4444;
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 10000;
                    max-width: 400px;
                    animation: slideIn 0.3s ease-out;
                }
                
                .error-notification.critical {
                    background: linear-gradient(135deg, #ff4444, #cc0000);
                    border: 2px solid #ff6666;
                }
                
                .error-notification-content h4 {
                    margin: 0 0 10px 0;
                    font-size: 16px;
                }
                
                .error-notification-content p {
                    margin: 0 0 15px 0;
                    font-size: 14px;
                    opacity: 0.9;
                }
                
                .error-notification-content button {
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 10px;
                    font-size: 12px;
                }
                
                .error-notification-content button:hover {
                    background: rgba(255,255,255,0.3);
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto-remover após 10 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    generateId() {
        return 'err_' + Math.random().toString(36).substr(2, 9);
    }

    saveToStorage() {
        try {
            localStorage.setItem('nps_error_log', JSON.stringify(this.errors.slice(0, 20)));
        } catch (e) {
            console.warn('Could not save error log to localStorage');
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('nps_error_log');
            if (stored) {
                this.errors = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Could not load error log from localStorage');
        }
    }

    getErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
        this.saveToStorage();
        console.log('🧹 Error log cleared');
    }

    showErrorReport() {
        console.group('📊 Error Monitor Report');
        console.log(`Total errors: ${this.errors.length}`);
        
        // Agrupar por tipo
        const byType = this.errors.reduce((acc, error) => {
            acc[error.type] = (acc[error.type] || 0) + 1;
            return acc;
        }, {});
        
        console.log('Errors by type:', byType);
        
        // Mostrar últimos 5 erros
        console.log('Recent errors:');
        this.errors.slice(0, 5).forEach((error, index) => {
            console.log(`${index + 1}. [${error.type}] ${error.message}`);
        });
        
        console.groupEnd();

        // Criar modal com relatório detalhado
        this.createErrorReportModal();
    }

    createErrorReportModal() {
        // Remover modal existente
        const existing = document.querySelector('#error-report-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'error-report-modal';
        modal.innerHTML = `
            <div class="error-modal-overlay">
                <div class="error-modal-content">
                    <div class="error-modal-header">
                        <h3>📊 Relatório de Erros - NPS Eventos Pro</h3>
                        <button onclick="document.querySelector('#error-report-modal').remove()">×</button>
                    </div>
                    <div class="error-modal-body">
                        <div class="error-stats">
                            <div class="error-stat">
                                <span class="error-stat-number">${this.errors.length}</span>
                                <span class="error-stat-label">Total de Erros</span>
                            </div>
                            <div class="error-stat">
                                <span class="error-stat-number">${this.errors.filter(e => e.type === 'javascript').length}</span>
                                <span class="error-stat-label">JavaScript</span>
                            </div>
                            <div class="error-stat">
                                <span class="error-stat-number">${this.errors.filter(e => e.type === 'promise').length}</span>
                                <span class="error-stat-label">Promises</span>
                            </div>
                            <div class="error-stat">
                                <span class="error-stat-number">${this.errors.filter(e => e.type === 'resource').length}</span>
                                <span class="error-stat-label">Recursos</span>
                            </div>
                        </div>
                        <div class="error-list">
                            ${this.errors.slice(0, 10).map(error => `
                                <div class="error-item">
                                    <div class="error-item-header">
                                        <span class="error-type">${error.type}</span>
                                        <span class="error-time">${new Date(error.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div class="error-message">${error.message}</div>
                                    ${error.filename ? `<div class="error-location">${error.filename}:${error.lineno}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="error-modal-footer">
                        <button onclick="window.errorMonitor.clearErrors(); document.querySelector('#error-report-modal').remove();">Limpar Erros</button>
                        <button onclick="window.errorMonitor.exportErrors()">Exportar</button>
                        <button onclick="document.querySelector('#error-report-modal').remove()">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos do modal
        if (!document.querySelector('#error-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'error-modal-styles';
            styles.textContent = `
                .error-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10001;
                }
                
                .error-modal-content {
                    background: #1a1a1a;
                    color: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 800px;
                    max-height: 80vh;
                    overflow: hidden;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                }
                
                .error-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #333;
                }
                
                .error-modal-header h3 {
                    margin: 0;
                    color: #ff6b6b;
                }
                
                .error-modal-header button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .error-modal-body {
                    padding: 20px;
                    max-height: 60vh;
                    overflow-y: auto;
                }
                
                .error-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }
                
                .error-stat {
                    text-align: center;
                    padding: 15px;
                    background: #2a2a2a;
                    border-radius: 8px;
                }
                
                .error-stat-number {
                    display: block;
                    font-size: 24px;
                    font-weight: bold;
                    color: #ff6b6b;
                }
                
                .error-stat-label {
                    font-size: 12px;
                    opacity: 0.8;
                }
                
                .error-list {
                    space-y: 10px;
                }
                
                .error-item {
                    background: #2a2a2a;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    border-left: 4px solid #ff6b6b;
                }
                
                .error-item-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .error-type {
                    background: #ff6b6b;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                
                .error-time {
                    font-size: 12px;
                    opacity: 0.6;
                }
                
                .error-message {
                    font-family: monospace;
                    font-size: 14px;
                    margin-bottom: 5px;
                }
                
                .error-location {
                    font-size: 12px;
                    opacity: 0.6;
                    font-family: monospace;
                }
                
                .error-modal-footer {
                    padding: 20px;
                    border-top: 1px solid #333;
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
                
                .error-modal-footer button {
                    background: #333;
                    border: 1px solid #555;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .error-modal-footer button:hover {
                    background: #444;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(modal);
    }

    exportErrors() {
        const data = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            errors: this.errors
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nps-error-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📁 Error report exported');
    }

    enable() {
        this.isEnabled = true;
        console.log('✅ Error Monitor enabled');
    }

    disable() {
        this.isEnabled = false;
        console.log('❌ Error Monitor disabled');
    }
}

// Inicializar monitor de erros
window.errorMonitor = new ErrorMonitor();

// Carregar erros salvos
window.errorMonitor.loadFromStorage();

// Expor funções úteis no console
window.showErrors = () => window.errorMonitor.showErrorReport();
window.clearErrors = () => window.errorMonitor.clearErrors();
window.debugErrors = () => console.log(window.errorMonitor.getErrors());

console.log('🔍 Error monitoring system loaded');

