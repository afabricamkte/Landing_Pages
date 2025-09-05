/**
 * Módulo de Validação de Dados
 * Centraliza todas as validações do sistema
 */

import { LIMITES, MENSAGENS_ERRO, REGEX } from './constants.js';

class ValidationManager {
    constructor() {
        this.errors = [];
    }

    /**
     * Limpa erros anteriores
     */
    clearErrors() {
        this.errors = [];
    }

    /**
     * Adiciona erro à lista
     */
    addError(field, message) {
        this.errors.push({ field, message });
    }

    /**
     * Verifica se há erros
     */
    hasErrors() {
        return this.errors.length > 0;
    }

    /**
     * Obtém todos os erros
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Obtém erros formatados para exibição
     */
    getFormattedErrors() {
        return this.errors.map(error => `${error.field}: ${error.message}`).join('\n');
    }

    /**
     * Valida se campo é obrigatório
     */
    required(value, fieldName) {
        if (value === null || value === undefined || value === '') {
            this.addError(fieldName, MENSAGENS_ERRO.CAMPO_OBRIGATORIO);
            return false;
        }
        return true;
    }

    /**
     * Valida string não vazia
     */
    notEmpty(value, fieldName) {
        if (typeof value !== 'string' || value.trim() === '') {
            this.addError(fieldName, MENSAGENS_ERRO.CAMPO_OBRIGATORIO);
            return false;
        }
        return true;
    }

    /**
     * Valida número
     */
    isNumber(value, fieldName) {
        const num = parseFloat(value);
        if (isNaN(num)) {
            this.addError(fieldName, MENSAGENS_ERRO.VALOR_INVALIDO);
            return false;
        }
        return true;
    }

    /**
     * Valida número positivo
     */
    isPositive(value, fieldName) {
        if (!this.isNumber(value, fieldName)) return false;
        
        const num = parseFloat(value);
        if (num <= 0) {
            this.addError(fieldName, 'Deve ser um valor positivo');
            return false;
        }
        return true;
    }

    /**
     * Valida preço
     */
    isValidPrice(value, fieldName) {
        if (!this.isNumber(value, fieldName)) return false;
        
        const price = parseFloat(value);
        if (price < LIMITES.MIN_PRECO) {
            this.addError(fieldName, MENSAGENS_ERRO.PRECO_MINIMO);
            return false;
        }
        if (price > LIMITES.MAX_PRECO) {
            this.addError(fieldName, MENSAGENS_ERRO.PRECO_MAXIMO);
            return false;
        }
        return true;
    }

    /**
     * Valida quantidade
     */
    isValidQuantity(value, fieldName) {
        if (!this.isNumber(value, fieldName)) return false;
        
        const quantity = parseFloat(value);
        if (quantity < LIMITES.MIN_QUANTIDADE) {
            this.addError(fieldName, MENSAGENS_ERRO.QUANTIDADE_MINIMA);
            return false;
        }
        if (quantity > LIMITES.MAX_QUANTIDADE) {
            this.addError(fieldName, MENSAGENS_ERRO.QUANTIDADE_MAXIMA);
            return false;
        }
        return true;
    }

    /**
     * Valida email
     */
    isValidEmail(value, fieldName) {
        if (!REGEX.EMAIL.test(value)) {
            this.addError(fieldName, 'Email inválido');
            return false;
        }
        return true;
    }

    /**
     * Valida telefone
     */
    isValidPhone(value, fieldName) {
        if (!REGEX.TELEFONE.test(value)) {
            this.addError(fieldName, 'Telefone inválido');
            return false;
        }
        return true;
    }

    /**
     * Valida CPF
     */
    isValidCPF(value, fieldName) {
        if (!REGEX.CPF.test(value)) {
            this.addError(fieldName, 'CPF inválido');
            return false;
        }
        
        // Validação do dígito verificador
        const cpf = value.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            this.addError(fieldName, 'CPF inválido');
            return false;
        }
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let digit = 11 - (sum % 11);
        if (digit === 10 || digit === 11) digit = 0;
        if (digit !== parseInt(cpf.charAt(9))) {
            this.addError(fieldName, 'CPF inválido');
            return false;
        }
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        digit = 11 - (sum % 11);
        if (digit === 10 || digit === 11) digit = 0;
        if (digit !== parseInt(cpf.charAt(10))) {
            this.addError(fieldName, 'CPF inválido');
            return false;
        }
        
        return true;
    }

    /**
     * Valida CNPJ
     */
    isValidCNPJ(value, fieldName) {
        if (!REGEX.CNPJ.test(value)) {
            this.addError(fieldName, 'CNPJ inválido');
            return false;
        }
        
        const cnpj = value.replace(/\D/g, '');
        if (cnpj.length !== 14) {
            this.addError(fieldName, 'CNPJ inválido');
            return false;
        }
        
        // Validação do dígito verificador
        let sum = 0;
        let weight = 2;
        for (let i = 11; i >= 0; i--) {
            sum += parseInt(cnpj.charAt(i)) * weight;
            weight = weight === 9 ? 2 : weight + 1;
        }
        let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (digit !== parseInt(cnpj.charAt(12))) {
            this.addError(fieldName, 'CNPJ inválido');
            return false;
        }
        
        sum = 0;
        weight = 2;
        for (let i = 12; i >= 0; i--) {
            sum += parseInt(cnpj.charAt(i)) * weight;
            weight = weight === 9 ? 2 : weight + 1;
        }
        digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (digit !== parseInt(cnpj.charAt(13))) {
            this.addError(fieldName, 'CNPJ inválido');
            return false;
        }
        
        return true;
    }

    /**
     * Valida data
     */
    isValidDate(value, fieldName) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            this.addError(fieldName, 'Data inválida');
            return false;
        }
        return true;
    }

    /**
     * Valida se data não é futura
     */
    isNotFutureDate(value, fieldName) {
        if (!this.isValidDate(value, fieldName)) return false;
        
        const date = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (date > today) {
            this.addError(fieldName, 'Data não pode ser futura');
            return false;
        }
        return true;
    }

    /**
     * Valida tamanho mínimo de string
     */
    minLength(value, minLength, fieldName) {
        if (typeof value !== 'string' || value.length < minLength) {
            this.addError(fieldName, `Deve ter pelo menos ${minLength} caracteres`);
            return false;
        }
        return true;
    }

    /**
     * Valida tamanho máximo de string
     */
    maxLength(value, maxLength, fieldName) {
        if (typeof value === 'string' && value.length > maxLength) {
            this.addError(fieldName, `Deve ter no máximo ${maxLength} caracteres`);
            return false;
        }
        return true;
    }

    /**
     * Valida se valor está em lista de opções
     */
    isInOptions(value, options, fieldName) {
        if (!options.includes(value)) {
            this.addError(fieldName, 'Opção inválida');
            return false;
        }
        return true;
    }

    /**
     * Valida ingrediente
     */
    validateIngrediente(ingrediente) {
        this.clearErrors();
        
        this.required(ingrediente.nome, 'Nome');
        this.notEmpty(ingrediente.nome, 'Nome');
        this.maxLength(ingrediente.nome, 100, 'Nome');
        
        this.required(ingrediente.categoria, 'Categoria');
        this.required(ingrediente.unidade, 'Unidade');
        
        this.required(ingrediente.preco, 'Preço');
        this.isValidPrice(ingrediente.preco, 'Preço');
        
        if (ingrediente.quantidadePadrao !== undefined) {
            this.isValidQuantity(ingrediente.quantidadePadrao, 'Quantidade Padrão');
        }
        
        if (ingrediente.fornecedor) {
            this.maxLength(ingrediente.fornecedor, 100, 'Fornecedor');
        }
        
        return !this.hasErrors();
    }

    /**
     * Valida receita
     */
    validateReceita(receita) {
        this.clearErrors();
        
        this.required(receita.nome, 'Nome');
        this.notEmpty(receita.nome, 'Nome');
        this.maxLength(receita.nome, 100, 'Nome');
        
        this.required(receita.tamanho, 'Tamanho');
        
        if (!receita.ingredientes || !Array.isArray(receita.ingredientes)) {
            this.addError('Ingredientes', 'Deve ter pelo menos um ingrediente');
        } else if (receita.ingredientes.length === 0) {
            this.addError('Ingredientes', 'Deve ter pelo menos um ingrediente');
        }
        
        if (receita.precoVenda !== undefined) {
            this.isValidPrice(receita.precoVenda, 'Preço de Venda');
        }
        
        return !this.hasErrors();
    }

    /**
     * Valida venda
     */
    validateVenda(venda) {
        this.clearErrors();
        
        this.required(venda.data, 'Data');
        this.isValidDate(venda.data, 'Data');
        this.isNotFutureDate(venda.data, 'Data');
        
        this.required(venda.canal, 'Canal de Venda');
        this.required(venda.formaPagamento, 'Forma de Pagamento');
        
        if (!venda.itens || !Array.isArray(venda.itens)) {
            this.addError('Itens', 'Deve ter pelo menos um item');
        } else if (venda.itens.length === 0) {
            this.addError('Itens', 'Deve ter pelo menos um item');
        }
        
        if (venda.desconto !== undefined) {
            this.isNumber(venda.desconto, 'Desconto');
            if (parseFloat(venda.desconto) < 0) {
                this.addError('Desconto', 'Desconto não pode ser negativo');
            }
        }
        
        return !this.hasErrors();
    }

    /**
     * Valida entrada de estoque
     */
    validateEntradaEstoque(entrada) {
        this.clearErrors();
        
        this.required(entrada.ingredienteId, 'Ingrediente');
        this.required(entrada.quantidade, 'Quantidade');
        this.isValidQuantity(entrada.quantidade, 'Quantidade');
        
        this.required(entrada.preco, 'Preço');
        this.isValidPrice(entrada.preco, 'Preço');
        
        this.required(entrada.data, 'Data');
        this.isValidDate(entrada.data, 'Data');
        this.isNotFutureDate(entrada.data, 'Data');
        
        if (entrada.fornecedor) {
            this.maxLength(entrada.fornecedor, 100, 'Fornecedor');
        }
        
        return !this.hasErrors();
    }

    /**
     * Valida resultado diário
     */
    validateResultadoDiario(resultado) {
        this.clearErrors();
        
        this.required(resultado.data, 'Data');
        this.isValidDate(resultado.data, 'Data');
        this.isNotFutureDate(resultado.data, 'Data');
        
        this.required(resultado.pedidos, 'Quantidade de Pedidos');
        this.isNumber(resultado.pedidos, 'Quantidade de Pedidos');
        if (parseInt(resultado.pedidos) < 0) {
            this.addError('Quantidade de Pedidos', 'Não pode ser negativo');
        }
        
        this.required(resultado.valor, 'Valor Total');
        this.isValidPrice(resultado.valor, 'Valor Total');
        
        this.required(resultado.canal, 'Canal Principal');
        
        if (resultado.meta !== undefined && resultado.meta !== '') {
            this.isValidPrice(resultado.meta, 'Meta do Dia');
        }
        
        return !this.hasErrors();
    }

    /**
     * Valida custos operacionais
     */
    validateCustosOperacionais(custos) {
        this.clearErrors();
        
        Object.entries(custos).forEach(([key, custo]) => {
            if (custo.valor !== undefined) {
                this.isNumber(custo.valor, custo.nome);
                if (parseFloat(custo.valor) < 0) {
                    this.addError(custo.nome, 'Valor não pode ser negativo');
                }
            }
        });
        
        return !this.hasErrors();
    }

    /**
     * Valida arquivo de importação
     */
    validateImportFile(file) {
        this.clearErrors();
        
        if (!file) {
            this.addError('Arquivo', 'Selecione um arquivo');
            return false;
        }
        
        const allowedTypes = [
            'application/json',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            this.addError('Arquivo', 'Tipo de arquivo não suportado');
            return false;
        }
        
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.addError('Arquivo', 'Arquivo muito grande (máximo 10MB)');
            return false;
        }
        
        return !this.hasErrors();
    }

    /**
     * Sanitiza string removendo caracteres perigosos
     */
    sanitizeString(str) {
        if (typeof str !== 'string') return str;
        
        return str
            .replace(/[<>]/g, '') // Remove < e >
            .replace(/javascript:/gi, '') // Remove javascript:
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }

    /**
     * Sanitiza número garantindo que seja válido
     */
    sanitizeNumber(num, defaultValue = 0) {
        const parsed = parseFloat(num);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    /**
     * Sanitiza preço garantindo formato correto
     */
    sanitizePrice(price) {
        const num = this.sanitizeNumber(price, 0);
        return Math.max(0, Math.round(num * 100) / 100);
    }

    /**
     * Sanitiza quantidade garantindo formato correto
     */
    sanitizeQuantity(quantity) {
        const num = this.sanitizeNumber(quantity, 0);
        return Math.max(0, Math.round(num * 1000) / 1000);
    }

    /**
     * Valida e sanitiza objeto completo
     */
    validateAndSanitize(obj, validationRules) {
        const sanitized = {};
        this.clearErrors();
        
        Object.entries(validationRules).forEach(([field, rules]) => {
            let value = obj[field];
            
            // Aplica sanitização
            if (rules.sanitize) {
                value = rules.sanitize(value);
            }
            
            // Aplica validações
            if (rules.required && !this.required(value, field)) {
                return;
            }
            
            if (rules.type === 'string' && value) {
                value = this.sanitizeString(value);
                if (rules.maxLength) {
                    this.maxLength(value, rules.maxLength, field);
                }
            }
            
            if (rules.type === 'number' && value !== undefined) {
                if (!this.isNumber(value, field)) return;
                value = this.sanitizeNumber(value);
            }
            
            if (rules.type === 'price' && value !== undefined) {
                if (!this.isValidPrice(value, field)) return;
                value = this.sanitizePrice(value);
            }
            
            if (rules.type === 'quantity' && value !== undefined) {
                if (!this.isValidQuantity(value, field)) return;
                value = this.sanitizeQuantity(value);
            }
            
            if (rules.options && value) {
                this.isInOptions(value, rules.options, field);
            }
            
            sanitized[field] = value;
        });
        
        return {
            isValid: !this.hasErrors(),
            errors: this.getErrors(),
            data: sanitized
        };
    }
}

// Instância singleton
const validator = new ValidationManager();

export default validator;

