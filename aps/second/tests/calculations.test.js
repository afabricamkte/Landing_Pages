/**
 * Testes para o Módulo de Cálculos
 * Valida todas as fórmulas matemáticas do sistema
 */

import testFramework from './test-framework.js';
import calculator from '../src/utils/calculations.js';

// Registra os testes
testFramework.register(() => {
    
    describe('Módulo de Cálculos', () => {
        
        describe('Arredondamento', () => {
            it('deve arredondar números corretamente', () => {
                expect(calculator.round(1.2345, 2)).toBe(1.23);
                expect(calculator.round(1.2356, 2)).toBe(1.24);
                expect(calculator.round(1.5)).toBe(1.5);
            });
            
            it('deve arredondar preços para 2 casas decimais', () => {
                expect(calculator.roundPrice(15.999)).toBe(16);
                expect(calculator.roundPrice(15.994)).toBe(15.99);
                expect(calculator.roundPrice(15.996)).toBe(16);
            });
        });
        
        describe('Cálculo de Custo de Ingredientes', () => {
            it('deve calcular custo total dos ingredientes', () => {
                const ingredientes = [
                    { quantidade: 2, preco: 5.50 },
                    { quantidade: 1.5, preco: 3.20 },
                    { quantidade: 0.5, preco: 8.00 }
                ];
                
                const custoTotal = calculator.calcularCustoIngredientes(ingredientes);
                expect(custoTotal).toBe(19.8); // 11 + 4.8 + 4 = 19.8
            });
            
            it('deve retornar 0 para array vazio', () => {
                expect(calculator.calcularCustoIngredientes([])).toBe(0);
            });
            
            it('deve tratar valores inválidos', () => {
                const ingredientes = [
                    { quantidade: 'abc', preco: 5.50 },
                    { quantidade: 2, preco: null },
                    { quantidade: 1, preco: 3.20 }
                ];
                
                const custoTotal = calculator.calcularCustoIngredientes(ingredientes);
                expect(custoTotal).toBe(3.2); // Apenas o último ingrediente válido
            });
        });
        
        describe('Cálculo de Margem de Lucro', () => {
            it('deve calcular margem corretamente', () => {
                const margem = calculator.calcularMargem(20, 15);
                expect(margem).toBe(25); // (20-15)/20 * 100 = 25%
            });
            
            it('deve retornar 0 para preço zero', () => {
                expect(calculator.calcularMargem(0, 10)).toBe(0);
            });
            
            it('deve calcular margem negativa', () => {
                const margem = calculator.calcularMargem(10, 15);
                expect(margem).toBe(-50); // (10-15)/10 * 100 = -50%
            });
        });
        
        describe('Cálculo de Preço de Venda', () => {
            it('deve calcular preço baseado na margem', () => {
                const preco = calculator.calcularPrecoVenda(15, 25);
                expect(preco).toBeCloseTo(20, 2); // 15 / (1 - 0.25) = 20
            });
            
            it('deve retornar 0 para margem >= 100%', () => {
                expect(calculator.calcularPrecoVenda(15, 100)).toBe(0);
                expect(calculator.calcularPrecoVenda(15, 150)).toBe(0);
            });
        });
        
        describe('Cálculo de Ticket Médio', () => {
            it('deve calcular ticket médio corretamente', () => {
                const ticket = calculator.calcularTicketMedio(1000, 50);
                expect(ticket).toBe(20);
            });
            
            it('deve retornar 0 para quantidade zero', () => {
                expect(calculator.calcularTicketMedio(1000, 0)).toBe(0);
            });
        });
        
        describe('Cálculo de Valor de Estoque', () => {
            it('deve calcular valor total do estoque', () => {
                const estoque = {
                    'ing1': { quantidade: 10 },
                    'ing2': { quantidade: 5 },
                    'ing3': { quantidade: 2 }
                };
                
                const ingredientes = [
                    { id: 'ing1', preco: 5.00 },
                    { id: 'ing2', preco: 8.00 },
                    { id: 'ing3', preco: 12.00 }
                ];
                
                const valorTotal = calculator.calcularValorEstoque(estoque, ingredientes);
                expect(valorTotal).toBe(114); // 50 + 40 + 24 = 114
            });
            
            it('deve ignorar ingredientes sem estoque', () => {
                const estoque = {
                    'ing1': { quantidade: 10 }
                };
                
                const ingredientes = [
                    { id: 'ing1', preco: 5.00 },
                    { id: 'ing2', preco: 8.00 }
                ];
                
                const valorTotal = calculator.calcularValorEstoque(estoque, ingredientes);
                expect(valorTotal).toBe(50);
            });
        });
        
        describe('Cálculo de Preço Médio Ponderado', () => {
            it('deve calcular preço médio ponderado', () => {
                const historico = [
                    { preco: 10, quantidade: 5 },
                    { preco: 12, quantidade: 3 },
                    { preco: 8, quantidade: 2 }
                ];
                
                const precoMedio = calculator.calcularPrecoMedioPonderado(historico);
                // (10*5 + 12*3 + 8*2) / (5+3+2) = (50+36+16) / 10 = 10.2
                expect(precoMedio).toBe(10.2);
            });
            
            it('deve retornar 0 para histórico vazio', () => {
                expect(calculator.calcularPrecoMedioPonderado([])).toBe(0);
            });
        });
        
        describe('Cálculo de Status do Estoque', () => {
            it('deve retornar status correto do estoque', () => {
                expect(calculator.calcularStatusEstoque(0, 10)).toBe('zerado');
                expect(calculator.calcularStatusEstoque(3, 10)).toBe('critico'); // 3 <= 5 (50% de 10)
                expect(calculator.calcularStatusEstoque(8, 10)).toBe('baixo'); // 8 <= 10
                expect(calculator.calcularStatusEstoque(15, 10)).toBe('ok'); // 15 > 10
            });
        });
        
        describe('Cálculo de Percentual de Meta', () => {
            it('deve calcular percentual da meta', () => {
                expect(calculator.calcularPercentualMeta(750, 1000)).toBe(75);
                expect(calculator.calcularPercentualMeta(1200, 1000)).toBe(120);
            });
            
            it('deve retornar 0 para meta zero', () => {
                expect(calculator.calcularPercentualMeta(500, 0)).toBe(0);
            });
        });
        
        describe('Cálculo de Desconto', () => {
            it('deve calcular desconto aplicado', () => {
                const desconto = calculator.calcularDesconto(100, 80);
                expect(desconto).toBe(20); // 20% de desconto
            });
            
            it('deve aplicar desconto corretamente', () => {
                const valorComDesconto = calculator.aplicarDesconto(100, 20);
                expect(valorComDesconto).toBe(80);
            });
        });
        
        describe('Cálculo de Comissão de Apps', () => {
            it('deve calcular comissão e valor líquido', () => {
                const resultado = calculator.calcularComissaoApp(100, 15);
                expect(resultado.comissao).toBe(15);
                expect(resultado.valorLiquido).toBe(85);
            });
            
            it('deve calcular preço com comissão', () => {
                const precoComComissao = calculator.calcularPrecoComComissao(85, 15);
                expect(precoComComissao).toBe(100); // 85 / (1 - 0.15) = 100
            });
        });
        
        describe('Análise de Rentabilidade por Canal', () => {
            it('deve analisar rentabilidade por canal', () => {
                const vendas = [
                    { canal: 'balcao', valorTotal: 100, custoTotal: 60 },
                    { canal: 'balcao', valorTotal: 150, custoTotal: 90 },
                    { canal: 'ifood', valorTotal: 80, custoTotal: 50 }
                ];
                
                const analise = calculator.calcularRentabilidadePorCanal(vendas);
                
                expect(analise.balcao.vendas).toBe(2);
                expect(analise.balcao.faturamento).toBe(250);
                expect(analise.balcao.custos).toBe(150);
                expect(analise.balcao.lucro).toBe(100);
                expect(analise.balcao.margem).toBe(40); // (250-150)/250 * 100
                
                expect(analise.ifood.vendas).toBe(1);
                expect(analise.ifood.faturamento).toBe(80);
            });
        });
        
        describe('Simulação de Cenário', () => {
            it('deve simular cenário de precificação', () => {
                const receita = {
                    precoVenda: 25,
                    ingredientes: [
                        { quantidade: 1, preco: 5 },
                        { quantidade: 2, preco: 3 }
                    ]
                };
                
                const custosOperacionais = {};
                const novoPreco = 30;
                
                const simulacao = calculator.calcularSimulacaoCenario(receita, novoPreco, custosOperacionais);
                
                expect(simulacao.precoAtual).toBe(25);
                expect(simulacao.precoNovo).toBe(30);
                expect(simulacao.custoTotal).toBe(11.5); // 5 + 6 + 0.5 (embalagem)
                expect(simulacao.variacaoPreco).toBe(20); // (30-25)/25 * 100
            });
        });
        
        describe('Estatísticas de Vendas', () => {
            it('deve calcular estatísticas de período', () => {
                const vendas = [
                    { data: '2024-01-01', valorTotal: 100, custoTotal: 60 },
                    { data: '2024-01-02', valorTotal: 150, custoTotal: 90 },
                    { data: '2024-01-03', valorTotal: 200, custoTotal: 120 }
                ];
                
                const stats = calculator.calcularEstatisticasVendas(
                    vendas, 
                    '2024-01-01', 
                    '2024-01-03'
                );
                
                expect(stats.totalVendas).toBe(3);
                expect(stats.faturamentoTotal).toBe(450);
                expect(stats.custoTotal).toBe(270);
                expect(stats.lucroTotal).toBe(180);
                expect(stats.ticketMedio).toBe(150);
                expect(stats.diasPeriodo).toBe(3);
                expect(stats.mediaDiariaVendas).toBe(1);
                expect(stats.mediaDiariaFaturamento).toBe(150);
            });
        });
    });
});

export default testFramework;

