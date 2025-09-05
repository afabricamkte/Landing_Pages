/**
 * Módulo de Cálculos Matemáticos
 * Centraliza todas as fórmulas e cálculos do sistema
 */

class CalculationManager {
    constructor() {
        this.precision = 1000; // Para arredondamento com 3 casas decimais
    }

    /**
     * Arredonda número para 3 casas decimais
     */
    round(number, decimals = 3) {
        const factor = Math.pow(10, decimals);
        return Math.round(number * factor) / factor;
    }

    /**
     * Arredonda preço para 2 casas decimais
     */
    roundPrice(price) {
        return this.round(price, 2);
    }

    /**
     * Calcula custo total de ingredientes
     */
    calcularCustoIngredientes(ingredientes) {
        if (!Array.isArray(ingredientes)) return 0;
        
        return this.round(
            ingredientes.reduce((total, ingrediente) => {
                const quantidade = parseFloat(ingrediente.quantidade) || 0;
                const preco = parseFloat(ingrediente.preco) || 0;
                return total + (quantidade * preco);
            }, 0)
        );
    }

    /**
     * Calcula custo total de uma receita
     */
    calcularCustoReceita(receita, custosOperacionais = {}) {
        const custoIngredientes = this.calcularCustoIngredientes(receita.ingredientes || []);
        const custoEmbalagem = parseFloat(receita.custoEmbalagem) || 0.50;
        const custoOperacional = this.calcularCustoOperacionalPorPizza(custosOperacionais);
        
        return this.roundPrice(custoIngredientes + custoEmbalagem + custoOperacional);
    }

    /**
     * Calcula custo operacional por pizza
     */
    calcularCustoOperacionalPorPizza(custosOperacionais, pizzasPorMes = 1000) {
        if (!custosOperacionais || typeof custosOperacionais !== 'object') {
            return 0;
        }

        const custoMensal = Object.values(custosOperacionais).reduce((total, custo) => {
            return total + (parseFloat(custo.valor) || 0);
        }, 0);

        return this.round(custoMensal / pizzasPorMes);
    }

    /**
     * Calcula margem de lucro
     */
    calcularMargem(precoVenda, custoTotal) {
        const preco = parseFloat(precoVenda) || 0;
        const custo = parseFloat(custoTotal) || 0;
        
        if (preco <= 0) return 0;
        
        const margem = ((preco - custo) / preco) * 100;
        return this.round(margem, 1);
    }

    /**
     * Calcula lucro bruto
     */
    calcularLucro(precoVenda, custoTotal) {
        const preco = parseFloat(precoVenda) || 0;
        const custo = parseFloat(custoTotal) || 0;
        
        return this.roundPrice(preco - custo);
    }

    /**
     * Calcula preço de venda baseado na margem desejada
     */
    calcularPrecoVenda(custoTotal, margemDesejada) {
        const custo = parseFloat(custoTotal) || 0;
        const margem = parseFloat(margemDesejada) || 0;
        
        if (margem >= 100) return 0; // Margem não pode ser 100% ou mais
        
        const precoVenda = custo / (1 - (margem / 100));
        return this.roundPrice(precoVenda);
    }

    /**
     * Calcula ticket médio
     */
    calcularTicketMedio(valorTotal, quantidadePedidos) {
        const valor = parseFloat(valorTotal) || 0;
        const quantidade = parseInt(quantidadePedidos) || 0;
        
        if (quantidade === 0) return 0;
        
        return this.roundPrice(valor / quantidade);
    }

    /**
     * Calcula valor total de estoque
     */
    calcularValorEstoque(estoque, ingredientes) {
        if (!estoque || !Array.isArray(ingredientes)) return 0;
        
        return this.roundPrice(
            ingredientes.reduce((total, ingrediente) => {
                const estoqueItem = estoque[ingrediente.id];
                if (!estoqueItem) return total;
                
                const quantidade = parseFloat(estoqueItem.quantidade) || 0;
                const preco = parseFloat(ingrediente.preco) || 0;
                
                return total + (quantidade * preco);
            }, 0)
        );
    }

    /**
     * Calcula preço médio ponderado
     */
    calcularPrecoMedioPonderado(historicoPrecos) {
        if (!Array.isArray(historicoPrecos) || historicoPrecos.length === 0) {
            return 0;
        }

        let somaValores = 0;
        let somaQuantidades = 0;

        historicoPrecos.forEach(entrada => {
            const preco = parseFloat(entrada.preco) || 0;
            const quantidade = parseFloat(entrada.quantidade) || 0;
            
            somaValores += preco * quantidade;
            somaQuantidades += quantidade;
        });

        if (somaQuantidades === 0) return 0;
        
        return this.roundPrice(somaValores / somaQuantidades);
    }

    /**
     * Calcula tendência de preço
     */
    calcularTendenciaPreco(historicoPrecos) {
        if (!Array.isArray(historicoPrecos) || historicoPrecos.length < 2) {
            return 'stable';
        }

        const precos = historicoPrecos
            .sort((a, b) => new Date(a.data) - new Date(b.data))
            .map(h => parseFloat(h.preco));

        const precoAnterior = precos[precos.length - 2];
        const precoAtual = precos[precos.length - 1];
        
        const variacao = ((precoAtual - precoAnterior) / precoAnterior) * 100;
        
        if (variacao > 5) return 'up';
        if (variacao < -5) return 'down';
        return 'stable';
    }

    /**
     * Calcula status do estoque
     */
    calcularStatusEstoque(quantidade, estoqueMinimo) {
        const qtd = parseFloat(quantidade) || 0;
        const minimo = parseFloat(estoqueMinimo) || 0;
        
        if (qtd === 0) return 'zerado';
        if (qtd <= minimo * 0.5) return 'critico';
        if (qtd <= minimo) return 'baixo';
        return 'ok';
    }

    /**
     * Calcula projeção de vendas
     */
    calcularProjecaoVendas(vendasHistoricas, diasProjecao = 30) {
        if (!Array.isArray(vendasHistoricas) || vendasHistoricas.length === 0) {
            return { vendas: 0, faturamento: 0 };
        }

        const totalVendas = vendasHistoricas.length;
        const totalFaturamento = vendasHistoricas.reduce((total, venda) => {
            return total + (parseFloat(venda.valorTotal) || 0);
        }, 0);

        // Calcula média diária baseada no histórico
        const diasHistorico = this.calcularDiasUnicos(vendasHistoricas);
        const mediaDiariaVendas = totalVendas / diasHistorico;
        const mediaDiariaFaturamento = totalFaturamento / diasHistorico;

        return {
            vendas: Math.round(mediaDiariaVendas * diasProjecao),
            faturamento: this.roundPrice(mediaDiariaFaturamento * diasProjecao)
        };
    }

    /**
     * Calcula dias únicos no histórico de vendas
     */
    calcularDiasUnicos(vendas) {
        const datas = new Set();
        vendas.forEach(venda => {
            const data = new Date(venda.data).toDateString();
            datas.add(data);
        });
        return datas.size || 1;
    }

    /**
     * Calcula percentual de meta atingida
     */
    calcularPercentualMeta(valorAtual, meta) {
        const atual = parseFloat(valorAtual) || 0;
        const metaValue = parseFloat(meta) || 0;
        
        if (metaValue === 0) return 0;
        
        return this.round((atual / metaValue) * 100, 1);
    }

    /**
     * Calcula desconto aplicado
     */
    calcularDesconto(valorOriginal, valorComDesconto) {
        const original = parseFloat(valorOriginal) || 0;
        const comDesconto = parseFloat(valorComDesconto) || 0;
        
        if (original === 0) return 0;
        
        const desconto = ((original - comDesconto) / original) * 100;
        return this.round(Math.max(0, desconto), 1);
    }

    /**
     * Aplica desconto a um valor
     */
    aplicarDesconto(valor, percentualDesconto) {
        const valorOriginal = parseFloat(valor) || 0;
        const desconto = parseFloat(percentualDesconto) || 0;
        
        const valorDesconto = valorOriginal * (desconto / 100);
        return this.roundPrice(valorOriginal - valorDesconto);
    }

    /**
     * Calcula comissão de delivery apps
     */
    calcularComissaoApp(valor, percentualComissao) {
        const valorVenda = parseFloat(valor) || 0;
        const comissao = parseFloat(percentualComissao) || 0;
        
        const valorComissao = valorVenda * (comissao / 100);
        return {
            comissao: this.roundPrice(valorComissao),
            valorLiquido: this.roundPrice(valorVenda - valorComissao)
        };
    }

    /**
     * Calcula preço para delivery apps considerando comissão
     */
    calcularPrecoComComissao(precoBase, percentualComissao) {
        const preco = parseFloat(precoBase) || 0;
        const comissao = parseFloat(percentualComissao) || 0;
        
        // Preço que compensa a comissão
        const precoComComissao = preco / (1 - (comissao / 100));
        return this.roundPrice(precoComComissao);
    }

    /**
     * Calcula análise de rentabilidade por canal
     */
    calcularRentabilidadePorCanal(vendas) {
        if (!Array.isArray(vendas)) return {};
        
        const analise = {};
        
        vendas.forEach(venda => {
            const canal = venda.canal || 'outros';
            
            if (!analise[canal]) {
                analise[canal] = {
                    vendas: 0,
                    faturamento: 0,
                    custos: 0,
                    lucro: 0,
                    margem: 0
                };
            }
            
            const valorTotal = parseFloat(venda.valorTotal) || 0;
            const custoTotal = parseFloat(venda.custoTotal) || 0;
            
            analise[canal].vendas += 1;
            analise[canal].faturamento += valorTotal;
            analise[canal].custos += custoTotal;
            analise[canal].lucro += (valorTotal - custoTotal);
        });
        
        // Calcula margens
        Object.keys(analise).forEach(canal => {
            const dados = analise[canal];
            dados.margem = this.calcularMargem(dados.faturamento, dados.custos);
            dados.ticketMedio = this.calcularTicketMedio(dados.faturamento, dados.vendas);
            
            // Arredonda valores
            dados.faturamento = this.roundPrice(dados.faturamento);
            dados.custos = this.roundPrice(dados.custos);
            dados.lucro = this.roundPrice(dados.lucro);
            dados.ticketMedio = this.roundPrice(dados.ticketMedio);
        });
        
        return analise;
    }

    /**
     * Calcula análise de ingredientes mais utilizados
     */
    calcularIngredientesMaisUtilizados(receitas, vendas) {
        if (!Array.isArray(receitas) || !Array.isArray(vendas)) return [];
        
        const utilizacao = {};
        
        vendas.forEach(venda => {
            if (!venda.itens) return;
            
            venda.itens.forEach(item => {
                const receita = receitas.find(r => r.id === item.receitaId);
                if (!receita || !receita.ingredientes) return;
                
                receita.ingredientes.forEach(ingrediente => {
                    const id = ingrediente.ingredienteId;
                    const quantidade = parseFloat(ingrediente.quantidade) || 0;
                    const qtdItem = parseInt(item.quantidade) || 1;
                    
                    if (!utilizacao[id]) {
                        utilizacao[id] = {
                            ingredienteId: id,
                            nome: ingrediente.nome,
                            quantidadeTotal: 0,
                            vezesUtilizado: 0,
                            custoTotal: 0
                        };
                    }
                    
                    utilizacao[id].quantidadeTotal += quantidade * qtdItem;
                    utilizacao[id].vezesUtilizado += qtdItem;
                    utilizacao[id].custoTotal += (quantidade * qtdItem * (parseFloat(ingrediente.preco) || 0));
                });
            });
        });
        
        return Object.values(utilizacao)
            .sort((a, b) => b.quantidadeTotal - a.quantidadeTotal)
            .map(item => ({
                ...item,
                quantidadeTotal: this.round(item.quantidadeTotal),
                custoTotal: this.roundPrice(item.custoTotal)
            }));
    }

    /**
     * Calcula simulação de cenário
     */
    calcularSimulacaoCenario(receita, novoPreco, custosOperacionais) {
        const custoAtual = this.calcularCustoReceita(receita, custosOperacionais);
        const precoAtual = parseFloat(receita.precoVenda) || 0;
        const precoNovo = parseFloat(novoPreco) || 0;
        
        const margemAtual = this.calcularMargem(precoAtual, custoAtual);
        const margemNova = this.calcularMargem(precoNovo, custoAtual);
        
        const lucroAtual = this.calcularLucro(precoAtual, custoAtual);
        const lucroNovo = this.calcularLucro(precoNovo, custoAtual);
        
        const variacaoPreco = this.round(((precoNovo - precoAtual) / precoAtual) * 100, 1);
        const variacaoMargem = this.round(margemNova - margemAtual, 1);
        const variacaoLucro = this.roundPrice(lucroNovo - lucroAtual);
        
        return {
            custoTotal: custoAtual,
            precoAtual,
            precoNovo,
            margemAtual,
            margemNova,
            lucroAtual,
            lucroNovo,
            variacaoPreco,
            variacaoMargem,
            variacaoLucro,
            recomendacao: this.gerarRecomendacao(margemNova, variacaoPreco)
        };
    }

    /**
     * Gera recomendação baseada na análise
     */
    gerarRecomendacao(margem, variacaoPreco) {
        if (margem < 30) {
            return 'Margem baixa - considere aumentar o preço ou reduzir custos';
        }
        if (margem > 70) {
            return 'Margem muito alta - pode impactar competitividade';
        }
        if (Math.abs(variacaoPreco) > 20) {
            return 'Variação significativa - analise impacto na demanda';
        }
        return 'Preço dentro da faixa recomendada';
    }

    /**
     * Calcula estatísticas de vendas por período
     */
    calcularEstatisticasVendas(vendas, dataInicio, dataFim) {
        if (!Array.isArray(vendas)) return null;
        
        const vendasPeriodo = vendas.filter(venda => {
            const dataVenda = new Date(venda.data);
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            
            return dataVenda >= inicio && dataVenda <= fim;
        });
        
        const totalVendas = vendasPeriodo.length;
        const faturamentoTotal = vendasPeriodo.reduce((total, venda) => {
            return total + (parseFloat(venda.valorTotal) || 0);
        }, 0);
        
        const custoTotal = vendasPeriodo.reduce((total, venda) => {
            return total + (parseFloat(venda.custoTotal) || 0);
        }, 0);
        
        const lucroTotal = faturamentoTotal - custoTotal;
        const margemMedia = this.calcularMargem(faturamentoTotal, custoTotal);
        const ticketMedio = this.calcularTicketMedio(faturamentoTotal, totalVendas);
        
        const diasPeriodo = Math.ceil((new Date(dataFim) - new Date(dataInicio)) / (1000 * 60 * 60 * 24)) + 1;
        const mediaDiariaVendas = this.round(totalVendas / diasPeriodo, 1);
        const mediaDiariaFaturamento = this.roundPrice(faturamentoTotal / diasPeriodo);
        
        return {
            totalVendas,
            faturamentoTotal: this.roundPrice(faturamentoTotal),
            custoTotal: this.roundPrice(custoTotal),
            lucroTotal: this.roundPrice(lucroTotal),
            margemMedia: this.round(margemMedia, 1),
            ticketMedio: this.roundPrice(ticketMedio),
            diasPeriodo,
            mediaDiariaVendas,
            mediaDiariaFaturamento
        };
    }
}

// Instância singleton
const calculator = new CalculationManager();

export default calculator;

