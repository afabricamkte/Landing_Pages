// NPS Eventos Pro - Utilitários JavaScript

/**
 * Utilitários gerais para a aplicação
 */
class Utils {
    /**
     * Gera um ID único
     * @param {string} prefix - Prefixo para o ID
     * @returns {string} ID único gerado
     */
    static generateId(prefix = 'id') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}_${timestamp}${random}`;
    }

    /**
     * Formata uma data para exibição
     * @param {Date|string} date - Data para formatar
     * @param {string} locale - Locale para formatação
     * @returns {string} Data formatada
     */
    static formatDate(date, locale = 'pt-BR') {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString(locale);
    }

    /**
     * Formata uma data e hora para exibição
     * @param {Date|string} date - Data para formatar
     * @param {string} locale - Locale para formatação
     * @returns {string} Data e hora formatadas
     */
    static formatDateTime(date, locale = 'pt-BR') {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString(locale);
    }

    /**
     * Debounce function para otimizar performance
     * @param {Function} func - Função para fazer debounce
     * @param {number} wait - Tempo de espera em ms
     * @returns {Function} Função com debounce
     */
    static debounce(func, wait) {
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
     * Throttle function para otimizar performance
     * @param {Function} func - Função para fazer throttle
     * @param {number} limit - Limite de tempo em ms
     * @returns {Function} Função com throttle
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Sanitiza uma string para uso como slug
     * @param {string} text - Texto para sanitizar
     * @returns {string} Slug sanitizado
     */
    static sanitizeSlug(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, '-') // Substitui espaços por hífens
            .replace(/-+/g, '-') // Remove hífens duplicados
            .trim('-'); // Remove hífens do início e fim
    }

    /**
     * Valida um email
     * @param {string} email - Email para validar
     * @returns {boolean} True se válido
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valida uma URL
     * @param {string} url - URL para validar
     * @returns {boolean} True se válida
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Copia texto para a área de transferência
     * @param {string} text - Texto para copiar
     * @returns {Promise<boolean>} Promise que resolve com sucesso/falha
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }

    /**
     * Mostra uma notificação toast
     * @param {string} message - Mensagem da notificação
     * @param {string} type - Tipo da notificação (success, error, warning, info)
     * @param {number} duration - Duração em ms
     */
    static showToast(message, type = 'info', duration = 3000) {
        // Remove toasts existentes
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;

        // Estilos inline para o toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.875rem',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        });

        // Cores por tipo
        const colors = {
            success: 'linear-gradient(135deg, #22c55e, #16a34a)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        };
        toast.style.background = colors[type] || colors.info;

        document.body.appendChild(toast);

        // Animação de entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Botão de fechar
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: 1rem;
            padding: 0;
        `;

        const closeToast = () => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        };

        closeBtn.addEventListener('click', closeToast);

        // Auto-close
        if (duration > 0) {
            setTimeout(closeToast, duration);
        }
    }

    /**
     * Calcula o score NPS baseado nas respostas
     * @param {Array} responses - Array de respostas (0-10)
     * @returns {Object} Objeto com métricas NPS
     */
    static calculateNPS(responses) {
        if (!responses || responses.length === 0) {
            return { score: 0, promoters: 0, passives: 0, detractors: 0, total: 0 };
        }

        const total = responses.length;
        const promoters = responses.filter(r => r >= 9).length;
        const passives = responses.filter(r => r >= 7 && r <= 8).length;
        const detractors = responses.filter(r => r <= 6).length;

        const promoterPercentage = (promoters / total) * 100;
        const detractorPercentage = (detractors / total) * 100;
        const score = Math.round(promoterPercentage - detractorPercentage);

        return {
            score,
            promoters,
            passives,
            detractors,
            total,
            promoterPercentage: Math.round(promoterPercentage),
            passivePercentage: Math.round((passives / total) * 100),
            detractorPercentage: Math.round(detractorPercentage)
        };
    }

    /**
     * Exporta dados para CSV
     * @param {Array} data - Array de objetos para exportar
     * @param {string} filename - Nome do arquivo
     */
    static exportToCSV(data, filename = 'export.csv') {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    // Escape aspas duplas e envolve em aspas se contém vírgula
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    /**
     * Exporta dados para JSON
     * @param {Object|Array} data - Dados para exportar
     * @param {string} filename - Nome do arquivo
     */
    static exportToJSON(data, filename = 'export.json') {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    /**
     * Gera QR Code para uma URL
     * @param {string} url - URL para gerar QR Code
     * @param {number} size - Tamanho do QR Code
     * @returns {string} URL da imagem do QR Code
     */
    static generateQRCode(url, size = 200) {
        const encodedUrl = encodeURIComponent(url);
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}`;
    }

    /**
     * Detecta o dispositivo do usuário
     * @returns {Object} Informações do dispositivo
     */
    static getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
        const isDesktop = !isMobile && !isTablet;

        return {
            isMobile,
            isTablet,
            isDesktop,
            userAgent,
            language: navigator.language,
            platform: navigator.platform
        };
    }

    /**
     * Armazena dados no localStorage com tratamento de erro
     * @param {string} key - Chave para armazenar
     * @param {*} value - Valor para armazenar
     * @returns {boolean} Sucesso da operação
     */
    static setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    }

    /**
     * Recupera dados do localStorage com tratamento de erro
     * @param {string} key - Chave para recuperar
     * @param {*} defaultValue - Valor padrão se não encontrar
     * @returns {*} Valor recuperado ou padrão
     */
    static getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Erro ao ler do localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item do localStorage
     * @param {string} key - Chave para remover
     * @returns {boolean} Sucesso da operação
     */
    static removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    }
}

// Exporta a classe para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

