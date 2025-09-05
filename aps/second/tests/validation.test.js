/**
 * Testes para o Módulo de Validação
 * Valida todas as funções de validação de dados
 */

import testFramework from './test-framework.js';
import validator from '../src/utils/validation.js';

// Registra os testes
testFramework.register(() => {
    
    describe('Módulo de Validação', () => {
        
        beforeEach(() => {
            validator.clearErrors();
        });
        
        describe('Validações Básicas', () => {
            it('deve validar campos obrigatórios', () => {
                expect(validator.required('teste', 'campo')).toBe(true);
                expect(validator.required('', 'campo')).toBe(false);
                expect(validator.required(null, 'campo')).toBe(false);
                expect(validator.required(undefined, 'campo')).toBe(false);
                expect(validator.hasErrors()).toBe(true);
            });
            
            it('deve validar strings não vazias', () => {
                expect(validator.notEmpty('teste', 'campo')).toBe(true);
                expect(validator.notEmpty('   ', 'campo')).toBe(false);
                expect(validator.notEmpty('', 'campo')).toBe(false);
                expect(validator.hasErrors()).toBe(true);
            });
            
            it('deve validar números', () => {
                expect(validator.isNumber('123', 'campo')).toBe(true);
                expect(validator.isNumber('123.45', 'campo')).toBe(true);
                expect(validator.isNumber('abc', 'campo')).toBe(false);
                expect(validator.hasErrors()).toBe(true);
            });
            
            it('deve validar números positivos', () => {
                expect(validator.isPositive('10', 'campo')).toBe(true);
                expect(validator.isPositive('0.1', 'campo')).toBe(true);
                expect(validator.isPositive('0', 'campo')).toBe(false);
                expect(validator.isPositive('-5', 'campo')).toBe(false);
                expect(validator.hasErrors()).toBe(true);
            });
        });
        
        describe('Validação de Preços', () => {
            it('deve validar preços válidos', () => {
                expect(validator.isValidPrice('10.50', 'preco')).toBe(true);
                expect(validator.isValidPrice('0.01', 'preco')).toBe(true);
                expect(validator.isValidPrice('9999.99', 'preco')).toBe(true);
            });
            
            it('deve rejeitar preços inválidos', () => {
                validator.clearErrors();
                expect(validator.isValidPrice('0', 'preco')).toBe(false);
                
                validator.clearErrors();
                expect(validator.isValidPrice('10000', 'preco')).toBe(false);
                
                validator.clearErrors();
                expect(validator.isValidPrice('abc', 'preco')).toBe(false);
            });
        });
        
        describe('Validação de Quantidades', () => {
            it('deve validar quantidades válidas', () => {
                expect(validator.isValidQuantity('1', 'quantidade')).toBe(true);
                expect(validator.isValidQuantity('0.001', 'quantidade')).toBe(true);
                expect(validator.isValidQuantity('99999.999', 'quantidade')).toBe(true);
            });
            
            it('deve rejeitar quantidades inválidas', () => {
                validator.clearErrors();
                expect(validator.isValidQuantity('0', 'quantidade')).toBe(false);
                
                validator.clearErrors();
                expect(validator.isValidQuantity('100000', 'quantidade')).toBe(false);
            });
        });
        
        describe('Validação de Email', () => {
            it('deve validar emails válidos', () => {
                expect(validator.isValidEmail('test@example.com', 'email')).toBe(true);
                expect(validator.isValidEmail('user.name@domain.co.uk', 'email')).toBe(true);
            });
            
            it('deve rejeitar emails inválidos', () => {
                validator.clearErrors();
                expect(validator.isValidEmail('invalid-email', 'email')).toBe(false);
                
                validator.clearErrors();
                expect(validator.isValidEmail('test@', 'email')).toBe(false);
                
                validator.clearErrors();
                expect(validator.isValidEmail('@domain.com', 'email')).toBe(false);
            });
        });
        
        describe('Validação de CPF', () => {
            it('deve validar CPFs válidos', () => {
                expect(validator.isValidCPF('123.456.789-09', 'cpf')).toBe(true);
            });
            
            it('deve rejeitar CPFs inválidos', () => {
                validator.clearErrors();
                expect(validator.isValidCPF('123.456.789-00', 'cpf')).toBe(false);
                
                validator.clearErrors();
                expect(validator.isValidCPF('111.111.111-11', 'cpf')).toBe(false);
                
                validator.clearErrors();
                expect(validator.isValidCPF('123.456.789', 'cpf')).toBe(false);
            });
        });
        
        describe('Validação de Datas', () => {
            it('deve validar datas válidas', () => {
                expect(validator.isValidDate('2024-01-01', 'data')).toBe(true);
                expect(validator.isValidDate('2024-12-31', 'data')).toBe(true);
            });
            
            it('deve rejeitar datas inválidas', () => {
                validator.clearErrors();
                expect(validator.isValidDate('invalid-date', 'data')).toBe(false);
                
                validator.clearErrors();
                expect(validator.isValidDate('2024-13-01', 'data')).toBe(false);
            });
            
            it('deve validar datas não futuras', () => {
                const hoje = new Date().toISOString().split('T')[0];
                expect(validator.isNotFutureDate(hoje, 'data')).toBe(true);
                
                validator.clearErrors();
                const futuro = new Date();
                futuro.setDate(futuro.getDate() + 1);
                expect(validator.isNotFutureDate(futuro.toISOString().split('T')[0], 'data')).toBe(false);
            });
        });
        
        describe('Validação de Tamanho de String', () => {
            it('deve validar tamanho mínimo', () => {
                expect(validator.minLength('teste', 3, 'campo')).toBe(true);
                expect(validator.minLength('te', 3, 'campo')).toBe(false);
            });
            
            it('deve validar tamanho máximo', () => {
                expect(validator.maxLength('teste', 10, 'campo')).toBe(true);
                expect(validator.maxLength('texto muito longo para o campo', 10, 'campo')).toBe(false);
            });
        });
        
        describe('Validação de Opções', () => {
            it('deve validar se valor está nas opções', () => {
                const opcoes = ['opcao1', 'opcao2', 'opcao3'];
                expect(validator.isInOptions('opcao1', opcoes, 'campo')).toBe(true);
                expect(validator.isInOptions('opcao4', opcoes, 'campo')).toBe(false);
            });
        });
        
        describe('Validação de Ingrediente', () => {
            it('deve validar ingrediente válido', () => {
                const ingrediente = {
                    nome: 'Mussarela',
                    categoria: 'queijos',
                    unidade: 'kg',
                    preco: '25.50',
                    quantidadePadrao: '0.2'
                };
                
                expect(validator.validateIngrediente(ingrediente)).toBe(true);
                expect(validator.hasErrors()).toBe(false);
            });
            
            it('deve rejeitar ingrediente inválido', () => {
                const ingrediente = {
                    nome: '',
                    categoria: 'queijos',
                    unidade: 'kg',
                    preco: '0'
                };
                
                expect(validator.validateIngrediente(ingrediente)).toBe(false);
                expect(validator.hasErrors()).toBe(true);
            });
        });
        
        describe('Validação de Receita', () => {
            it('deve validar receita válida', () => {
                const receita = {
                    nome: 'Pizza Margherita',
                    tamanho: 'media',
                    ingredientes: [
                        { ingredienteId: '1', quantidade: '0.2' }
                    ],
                    precoVenda: '25.00'
                };
                
                expect(validator.validateReceita(receita)).toBe(true);
                expect(validator.hasErrors()).toBe(false);
            });
            
            it('deve rejeitar receita sem ingredientes', () => {
                const receita = {
                    nome: 'Pizza Margherita',
                    tamanho: 'media',
                    ingredientes: []
                };
                
                expect(validator.validateReceita(receita)).toBe(false);
                expect(validator.hasErrors()).toBe(true);
            });
        });
        
        describe('Validação de Venda', () => {
            it('deve validar venda válida', () => {
                const venda = {
                    data: '2024-01-01',
                    canal: 'balcao',
                    formaPagamento: 'dinheiro',
                    itens: [
                        { receitaId: '1', quantidade: 2 }
                    ],
                    desconto: '5.00'
                };
                
                expect(validator.validateVenda(venda)).toBe(true);
                expect(validator.hasErrors()).toBe(false);
            });
            
            it('deve rejeitar venda com data futura', () => {
                const futuro = new Date();
                futuro.setDate(futuro.getDate() + 1);
                
                const venda = {
                    data: futuro.toISOString().split('T')[0],
                    canal: 'balcao',
                    formaPagamento: 'dinheiro',
                    itens: [{ receitaId: '1', quantidade: 2 }]
                };
                
                expect(validator.validateVenda(venda)).toBe(false);
                expect(validator.hasErrors()).toBe(true);
            });
        });
        
        describe('Sanitização', () => {
            it('deve sanitizar strings', () => {
                const input = '<script>alert("xss")</script>Texto normal';
                const sanitized = validator.sanitizeString(input);
                expect(sanitized).toBe('alert("xss")Texto normal');
            });
            
            it('deve sanitizar números', () => {
                expect(validator.sanitizeNumber('123.45')).toBe(123.45);
                expect(validator.sanitizeNumber('abc', 10)).toBe(10);
                expect(validator.sanitizeNumber(null, 5)).toBe(5);
            });
            
            it('deve sanitizar preços', () => {
                expect(validator.sanitizePrice('123.456')).toBe(123.46);
                expect(validator.sanitizePrice('-10')).toBe(0);
                expect(validator.sanitizePrice('abc')).toBe(0);
            });
            
            it('deve sanitizar quantidades', () => {
                expect(validator.sanitizeQuantity('123.4567')).toBe(123.457);
                expect(validator.sanitizeQuantity('-5')).toBe(0);
            });
        });
        
        describe('Validação e Sanitização Combinada', () => {
            it('deve validar e sanitizar objeto', () => {
                const obj = {
                    nome: '  Pizza Margherita  ',
                    preco: '25.50',
                    quantidade: '2.5',
                    categoria: 'pizza'
                };
                
                const rules = {
                    nome: {
                        required: true,
                        type: 'string',
                        maxLength: 100,
                        sanitize: (value) => value.trim()
                    },
                    preco: {
                        required: true,
                        type: 'price'
                    },
                    quantidade: {
                        type: 'quantity'
                    },
                    categoria: {
                        required: true,
                        options: ['pizza', 'bebida', 'sobremesa']
                    }
                };
                
                const result = validator.validateAndSanitize(obj, rules);
                
                expect(result.isValid).toBe(true);
                expect(result.data.nome).toBe('Pizza Margherita');
                expect(result.data.preco).toBe(25.5);
                expect(result.data.quantidade).toBe(2.5);
            });
            
            it('deve retornar erros para dados inválidos', () => {
                const obj = {
                    nome: '',
                    preco: '0',
                    categoria: 'invalida'
                };
                
                const rules = {
                    nome: { required: true, type: 'string' },
                    preco: { required: true, type: 'price' },
                    categoria: { required: true, options: ['pizza', 'bebida'] }
                };
                
                const result = validator.validateAndSanitize(obj, rules);
                
                expect(result.isValid).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
            });
        });
        
        describe('Gerenciamento de Erros', () => {
            it('deve gerenciar erros corretamente', () => {
                validator.addError('campo1', 'Erro 1');
                validator.addError('campo2', 'Erro 2');
                
                expect(validator.hasErrors()).toBe(true);
                expect(validator.getErrors()).toHaveLength(2);
                
                const formatted = validator.getFormattedErrors();
                expect(formatted).toContain('campo1: Erro 1');
                expect(formatted).toContain('campo2: Erro 2');
                
                validator.clearErrors();
                expect(validator.hasErrors()).toBe(false);
                expect(validator.getErrors()).toHaveLength(0);
            });
        });
    });
});

export default testFramework;

