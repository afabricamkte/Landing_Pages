// Utilitários do Sistema APS
class Utils {
    
    // Formatação de valores
    static formatMoeda(valor) {
        if (valor === null || valor === undefined || isNaN(valor)) {
            return 'R$ 0,00';
        }
        return new Intl.NumberFormat('pt-BR', CONFIG.FORMATO.MOEDA).format(valor);
    }

    static formatPercentual(valor) {
        if (valor === null || valor === undefined || isNaN(valor)) {
            return '0%';
        }
        return new Intl.NumberFormat('pt-BR', CONFIG.FORMATO.PERCENTUAL).format(valor / 100);
    }

    static formatNumero(valor, decimais = 3) {
        if (valor === null || valor === undefined || isNaN(valor)) {
            return '0';
        }
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimais
        }).format(valor);
    }

    // Conversão de valores
    static parseNumero(valor) {
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
            // Remove formatação brasileira
            const cleaned = valor.replace(/[^\d,-]/g, '').replace(',', '.');
            return parseFloat(cleaned) || 0;
        }
        return 0;
    }

    static parseMoeda(valor) {
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
            // Remove R$, espaços e converte vírgula para ponto
            const cleaned = valor.replace(/[R$\s]/g, '').replace(',', '.');
            return parseFloat(cleaned) || 0;
        }
        return 0;
    }

    // Validações
    static validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    static validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        if (cpf.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validação do primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;
        
        // Validação do segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }

    static validarCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]/g, '');
        if (cnpj.length !== 14) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{13}$/.test(cnpj)) return false;
        
        // Validação dos dígitos verificadores
        const calcularDigito = (cnpj, posicoes) => {
            let soma = 0;
            let pos = posicoes - 7;
            for (let i = posicoes; i >= 1; i--) {
                soma += cnpj.charAt(posicoes - i) * pos--;
                if (pos < 2) pos = 9;
            }
            return soma % 11 < 2 ? 0 : 11 - (soma % 11);
        };
        
        const digito1 = calcularDigito(cnpj, 12);
        const digito2 = calcularDigito(cnpj, 13);
        
        return digito1 === parseInt(cnpj.charAt(12)) && digito2 === parseInt(cnpj.charAt(13));
    }

    // Cálculos específicos do sistema
    static calcularCustoUnitario(preco, quantidade, rendimento, unidade) {
        const fatorConversao = CONFIG.CALCULO.FATOR_CONVERSAO[unidade] || 1;
        const quantidadeConvertida = quantidade * fatorConversao;
        const rendimentoDecimal = rendimento / 100;
        
        return preco / (quantidadeConvertida * rendimentoDecimal);
    }

    static calcularPrecoVenda(custo, margem, impostos = 0, taxas = 0) {
        const margemDecimal = margem / 100;
        const impostosDecimal = impostos / 100;
        const taxasDecimal = taxas / 100;
        
        const divisor = 1 - (impostosDecimal + taxasDecimal + margemDecimal);
        
        if (divisor <= 0) {
            throw new Error('Margem + impostos + taxas não pode ser >= 100%');
        }
        
        return custo / divisor;
    }

    static calcularMargem(precoVenda, custo, impostos = 0, taxas = 0) {
        const impostosValor = precoVenda * (impostos / 100);
        const taxasValor = precoVenda * (taxas / 100);
        const lucro = precoVenda - custo - impostosValor - taxasValor;
        
        return (lucro / precoVenda) * 100;
    }

    // Manipulação de arrays e objetos
    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    }

    static sortBy(array, key, direction = 'asc') {
        return array.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    static filterBy(array, filters) {
        return array.filter(item => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key];
                const itemValue = item[key];
                
                if (filterValue === '' || filterValue === null || filterValue === undefined) {
                    return true;
                }
                
                if (typeof filterValue === 'string') {
                    return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                }
                
                return itemValue === filterValue;
            });
        });
    }

    // Manipulação de datas
    static formatData(data, formato = 'dd/MM/yyyy') {
        if (!data) return '';
        
        const date = new Date(data);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        switch (formato) {
            case 'dd/MM/yyyy':
                return `${day}/${month}/${year}`;
            case 'yyyy-MM-dd':
                return `${year}-${month}-${day}`;
            case 'MM/yyyy':
                return `${month}/${year}`;
            default:
                return date.toLocaleDateString('pt-BR');
        }
    }

    static parseData(dataString) {
        if (!dataString) return null;
        
        // Tenta diferentes formatos
        const formatos = [
            /^(\d{2})\/(\d{2})\/(\d{4})$/, // dd/MM/yyyy
            /^(\d{4})-(\d{2})-(\d{2})$/,   // yyyy-MM-dd
            /^(\d{2})-(\d{2})-(\d{4})$/    // dd-MM-yyyy
        ];
        
        for (const formato of formatos) {
            const match = dataString.match(formato);
            if (match) {
                if (formato === formatos[1]) { // yyyy-MM-dd
                    return new Date(match[1], match[2] - 1, match[3]);
                } else { // dd/MM/yyyy ou dd-MM-yyyy
                    return new Date(match[3], match[2] - 1, match[1]);
                }
            }
        }
        
        return new Date(dataString);
    }

    // Geração de IDs
    static gerarId(prefixo = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefixo}${timestamp}${random}`.toUpperCase();
    }

    static gerarIdIngrediente() {
        return this.gerarId('ING');
    }

    static gerarIdPizza() {
        return this.gerarId('PIZ');
    }

    static gerarIdReceita() {
        return this.gerarId('REC');
    }

    // Debounce para otimizar performance
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

    // Throttle para limitar execuções
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Validação de formulários
    static validarFormulario(dados, regras) {
        const erros = {};
        
        Object.keys(regras).forEach(campo => {
            const valor = dados[campo];
            const regra = regras[campo];
            
            // Campo obrigatório
            if (regra.required && (!valor || valor.toString().trim() === '')) {
                erros[campo] = 'Campo obrigatório';
                return;
            }
            
            // Valor mínimo
            if (regra.min !== undefined && valor < regra.min) {
                erros[campo] = `Valor mínimo: ${regra.min}`;
                return;
            }
            
            // Valor máximo
            if (regra.max !== undefined && valor > regra.max) {
                erros[campo] = `Valor máximo: ${regra.max}`;
                return;
            }
            
            // Comprimento mínimo
            if (regra.minLength && valor.toString().length < regra.minLength) {
                erros[campo] = `Mínimo ${regra.minLength} caracteres`;
                return;
            }
            
            // Comprimento máximo
            if (regra.maxLength && valor.toString().length > regra.maxLength) {
                erros[campo] = `Máximo ${regra.maxLength} caracteres`;
                return;
            }
            
            // Validação customizada
            if (regra.custom && !regra.custom(valor)) {
                erros[campo] = regra.message || 'Valor inválido';
                return;
            }
        });
        
        return {
            valido: Object.keys(erros).length === 0,
            erros: erros
        };
    }

    // Exportação de dados
    static exportarCSV(dados, nomeArquivo = 'dados.csv') {
        if (!dados || dados.length === 0) {
            throw new Error('Nenhum dado para exportar');
        }
        
        const headers = Object.keys(dados[0]);
        const csvContent = [
            headers.join(','),
            ...dados.map(row => 
                headers.map(header => {
                    const value = row[header];
                    // Escapa aspas e adiciona aspas se necessário
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
            link.setAttribute('download', nomeArquivo);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Cópia para clipboard
    static async copiarParaClipboard(texto) {
        try {
            await navigator.clipboard.writeText(texto);
            return true;
        } catch (err) {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = texto;
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

    // Detecção de dispositivo
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    static isTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
    }

    // Armazenamento local
    static salvarLocal(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
            return true;
        } catch (err) {
            console.error('Erro ao salvar no localStorage:', err);
            return false;
        }
    }

    static carregarLocal(chave, valorPadrao = null) {
        try {
            const item = localStorage.getItem(chave);
            return item ? JSON.parse(item) : valorPadrao;
        } catch (err) {
            console.error('Erro ao carregar do localStorage:', err);
            return valorPadrao;
        }
    }

    static removerLocal(chave) {
        try {
            localStorage.removeItem(chave);
            return true;
        } catch (err) {
            console.error('Erro ao remover do localStorage:', err);
            return false;
        }
    }

    // Log de debug
    static log(message, data = null) {
        if (CONFIG.DEBUG) {
            console.log(`[APS] ${message}`, data);
        }
    }

    static error(message, error = null) {
        console.error(`[APS ERROR] ${message}`, error);
    }

    static warn(message, data = null) {
        console.warn(`[APS WARNING] ${message}`, data);
    }
}

// Exportar utilitários
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
