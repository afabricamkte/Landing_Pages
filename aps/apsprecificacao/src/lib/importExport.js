import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Configurações para exportação
const NOME_EMPRESA_PADRAO = 'Pizzaria Pro';

// Utilitários para exportação
export const exportarParaExcel = (dados, nomeEmpresa = NOME_EMPRESA_PADRAO) => {
  try {
    const workbook = XLSX.utils.book_new();
    const timestamp = format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: ptBR });
    
    // Aba 1: Ingredientes
    if (dados.ingredientes && dados.ingredientes.length > 0) {
      const ingredientesData = dados.ingredientes.map(ing => ({
        'ID': ing.id,
        'Nome': ing.nome,
        'Categoria': ing.categoria,
        'Unidade': ing.unidade,
        'Preço Atual': ing.precoAtual,
        'Fornecedor': ing.fornecedor,
        'Quantidade P': ing.quantidadePadrao.P,
        'Quantidade M': ing.quantidadePadrao.M,
        'Quantidade G': ing.quantidadePadrao.G,
        'Quantidade GG': ing.quantidadePadrao.GG,
        'Ativo': ing.ativo ? 'Sim' : 'Não',
        'Data Criação': format(new Date(ing.dataCriacao), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        'Data Atualização': format(new Date(ing.dataAtualizacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })
      }));
      
      const wsIngredientes = XLSX.utils.json_to_sheet(ingredientesData);
      XLSX.utils.book_append_sheet(workbook, wsIngredientes, 'Ingredientes');
    }
    
    // Aba 2: Histórico de Preços
    const historicoData = [];
    if (dados.ingredientes) {
      dados.ingredientes.forEach(ing => {
        if (ing.historico && ing.historico.length > 0) {
          ing.historico.forEach(hist => {
            historicoData.push({
              'Ingrediente ID': ing.id,
              'Nome Ingrediente': ing.nome,
              'Data': format(new Date(hist.data), 'dd/MM/yyyy', { locale: ptBR }),
              'Preço': hist.preco,
              'Fornecedor': hist.fornecedor || '',
              'Observações': hist.observacoes || ''
            });
          });
        }
      });
    }
    
    if (historicoData.length > 0) {
      const wsHistorico = XLSX.utils.json_to_sheet(historicoData);
      XLSX.utils.book_append_sheet(workbook, wsHistorico, 'Histórico Preços');
    }
    
    // Aba 3: Receitas
    if (dados.receitas && dados.receitas.length > 0) {
      const receitasData = [];
      dados.receitas.forEach(receita => {
        Object.keys(receita.tamanhos).forEach(tamanho => {
          const tamanhoData = receita.tamanhos[tamanho];
          receitasData.push({
            'Receita ID': receita.id,
            'Nome': receita.nome,
            'Categoria': receita.categoria,
            'Tamanho': tamanho,
            'Custo Total': tamanhoData.custoTotal,
            'Descrição': receita.descricao,
            'Ativa': receita.ativa ? 'Sim' : 'Não',
            'Data Criação': format(new Date(receita.dataCriacao), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
            'Data Atualização': format(new Date(receita.dataAtualizacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })
          });
        });
      });
      
      const wsReceitas = XLSX.utils.json_to_sheet(receitasData);
      XLSX.utils.book_append_sheet(workbook, wsReceitas, 'Receitas');
    }
    
    // Aba 4: Composição das Receitas
    const composicaoData = [];
    if (dados.receitas && dados.ingredientes) {
      dados.receitas.forEach(receita => {
        Object.keys(receita.tamanhos).forEach(tamanho => {
          const tamanhoData = receita.tamanhos[tamanho];
          if (tamanhoData.ingredientes) {
            tamanhoData.ingredientes.forEach(item => {
              const ingrediente = dados.ingredientes.find(ing => ing.id === item.ingredienteId);
              composicaoData.push({
                'Receita ID': receita.id,
                'Nome Receita': receita.nome,
                'Tamanho': tamanho,
                'Ingrediente ID': item.ingredienteId,
                'Nome Ingrediente': ingrediente ? ingrediente.nome : 'Não encontrado',
                'Quantidade': item.quantidade,
                'Unidade': ingrediente ? ingrediente.unidade : '',
                'Preço Unitário': ingrediente ? ingrediente.precoAtual : 0,
                'Custo Total Item': ingrediente ? (ingrediente.precoAtual * item.quantidade) : 0
              });
            });
          }
        });
      });
    }
    
    if (composicaoData.length > 0) {
      const wsComposicao = XLSX.utils.json_to_sheet(composicaoData);
      XLSX.utils.book_append_sheet(workbook, wsComposicao, 'Composição Receitas');
    }
    
    // Aba 5: Custos Operacionais
    if (dados.custosOperacionais) {
      const custosData = [
        // Custos Fixos Mensais
        ...Object.entries(dados.custosOperacionais.custosFixosMensais).map(([tipo, valor]) => ({
          'Tipo': 'Fixo Mensal',
          'Categoria': tipo.charAt(0).toUpperCase() + tipo.slice(1),
          'Valor': valor,
          'Observações': 'Custo fixo mensal'
        })),
        
        // Custos por Pedido - Embalagens
        ...Object.entries(dados.custosOperacionais.custosPorPedido.embalagens).map(([tipo, valor]) => {
          if (typeof valor === 'object') {
            return Object.entries(valor).map(([tamanho, val]) => ({
              'Tipo': 'Por Pedido',
              'Categoria': `Embalagem - ${tipo} ${tamanho}`,
              'Valor': val,
              'Observações': `Custo por pedido tamanho ${tamanho}`
            }));
          } else {
            return {
              'Tipo': 'Por Pedido',
              'Categoria': `Embalagem - ${tipo}`,
              'Valor': valor,
              'Observações': 'Custo por pedido'
            };
          }
        }).flat(),
        
        // Custos por Pedido - Sachês
        ...Object.entries(dados.custosOperacionais.custosPorPedido.saches).map(([tipo, valor]) => ({
          'Tipo': 'Por Pedido',
          'Categoria': `Sachê - ${tipo}`,
          'Valor': valor,
          'Observações': 'Custo por pedido'
        })),
        
        // Custos de Delivery
        ...Object.entries(dados.custosOperacionais.custosDelivery).map(([tipo, valor]) => ({
          'Tipo': 'Delivery',
          'Categoria': tipo.charAt(0).toUpperCase() + tipo.slice(1),
          'Valor': valor,
          'Observações': 'Custo por entrega'
        }))
      ];
      
      // Adicionar informações gerais
      custosData.push({
        'Tipo': 'Configuração',
        'Categoria': 'Volume Vendas Mensal',
        'Valor': dados.custosOperacionais.volumeVendasMensal,
        'Observações': 'Para cálculo de rateio dos custos fixos'
      });
      
      const wsCustos = XLSX.utils.json_to_sheet(custosData);
      XLSX.utils.book_append_sheet(workbook, wsCustos, 'Custos Operacionais');
    }
    
    // Aba 6: Precificação
    if (dados.precificacao && dados.precificacao.length > 0) {
      const precificacaoData = [];
      dados.precificacao.forEach(prec => {
        Object.entries(prec.canais).forEach(([canal, dadosCanal]) => {
          precificacaoData.push({
            'Receita ID': prec.receitaId,
            'Tamanho': prec.tamanho,
            'Canal': canal,
            'Custo Ingredientes': prec.custoIngredientes,
            'Custo Operacional': prec.custoOperacional,
            'Custo Delivery': dadosCanal.custoDelivery || 0,
            'Custo Total Canal': dadosCanal.custoTotalCanal,
            'Taxa Canal': dadosCanal.taxa,
            'Preço Sugerido': dadosCanal.precoSugerido,
            'Margem Líquida': dadosCanal.margemLiquida,
            'Data Cálculo': format(new Date(prec.dataCalculo), 'dd/MM/yyyy HH:mm', { locale: ptBR })
          });
        });
      });
      
      const wsPrecificacao = XLSX.utils.json_to_sheet(precificacaoData);
      XLSX.utils.book_append_sheet(workbook, wsPrecificacao, 'Precificação');
    }
    
    // Gerar arquivo
    const nomeArquivo = `${nomeEmpresa}_Precificacao_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);
    
    return { sucesso: true, nomeArquivo };
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    return { sucesso: false, erro: error.message };
  }
};

// Exportar para CSV
export const exportarParaCSV = (dados, nomeEmpresa = NOME_EMPRESA_PADRAO) => {
  try {
    const timestamp = format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: ptBR });
    
    // Preparar dados consolidados para CSV
    const dadosCSV = [];
    
    // Adicionar ingredientes
    if (dados.ingredientes) {
      dados.ingredientes.forEach(ing => {
        dadosCSV.push({
          'Tipo': 'Ingrediente',
          'ID': ing.id,
          'Nome': ing.nome,
          'Categoria': ing.categoria,
          'Valor': ing.precoAtual,
          'Unidade': ing.unidade,
          'Fornecedor': ing.fornecedor,
          'Data': format(new Date(ing.dataAtualizacao), 'dd/MM/yyyy', { locale: ptBR })
        });
      });
    }
    
    // Adicionar receitas
    if (dados.receitas) {
      dados.receitas.forEach(receita => {
        Object.keys(receita.tamanhos).forEach(tamanho => {
          dadosCSV.push({
            'Tipo': 'Receita',
            'ID': receita.id,
            'Nome': `${receita.nome} - ${tamanho}`,
            'Categoria': receita.categoria,
            'Valor': receita.tamanhos[tamanho].custoTotal,
            'Unidade': 'unidade',
            'Fornecedor': '',
            'Data': format(new Date(receita.dataAtualizacao), 'dd/MM/yyyy', { locale: ptBR })
          });
        });
      });
    }
    
    const csv = Papa.unparse(dadosCSV, {
      delimiter: ';',
      header: true
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${nomeEmpresa}_Precificacao_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { sucesso: true, nomeArquivo: `${nomeEmpresa}_Precificacao_${timestamp}.csv` };
  } catch (error) {
    console.error('Erro ao exportar para CSV:', error);
    return { sucesso: false, erro: error.message };
  }
};

// Exportar para JSON
export const exportarParaJSON = (dados, nomeEmpresa = NOME_EMPRESA_PADRAO) => {
  try {
    const timestamp = format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: ptBR });
    
    const dadosExportacao = {
      empresa: nomeEmpresa,
      dataExportacao: new Date().toISOString(),
      versao: '1.0',
      ...dados
    };
    
    const json = JSON.stringify(dadosExportacao, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${nomeEmpresa}_Precificacao_${timestamp}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { sucesso: true, nomeArquivo: `${nomeEmpresa}_Precificacao_${timestamp}.json` };
  } catch (error) {
    console.error('Erro ao exportar para JSON:', error);
    return { sucesso: false, erro: error.message };
  }
};

// Utilitários para importação
export const importarDeExcel = (arquivo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const dadosImportados = {
          ingredientes: [],
          receitas: [],
          custosOperacionais: null,
          precificacao: [],
          historico: []
        };
        
        // Importar ingredientes
        if (workbook.SheetNames.includes('Ingredientes')) {
          const wsIngredientes = workbook.Sheets['Ingredientes'];
          const ingredientesData = XLSX.utils.sheet_to_json(wsIngredientes);
          
          dadosImportados.ingredientes = ingredientesData.map(row => ({
            id: row.ID || crypto.randomUUID(),
            nome: row.Nome || '',
            categoria: row.Categoria || 'outros',
            unidade: row.Unidade || 'kg',
            precoAtual: parseFloat(row['Preço Atual']) || 0,
            fornecedor: row.Fornecedor || '',
            quantidadePadrao: {
              P: parseFloat(row['Quantidade P']) || 0,
              M: parseFloat(row['Quantidade M']) || 0,
              G: parseFloat(row['Quantidade G']) || 0,
              GG: parseFloat(row['Quantidade GG']) || 0
            },
            ativo: row.Ativo === 'Sim',
            historico: [],
            dataCriacao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
          }));
        }
        
        // Importar histórico de preços
        if (workbook.SheetNames.includes('Histórico Preços')) {
          const wsHistorico = workbook.Sheets['Histórico Preços'];
          const historicoData = XLSX.utils.sheet_to_json(wsHistorico);
          
          // Agrupar histórico por ingrediente
          const historicoAgrupado = {};
          historicoData.forEach(row => {
            const ingredienteId = row['Ingrediente ID'];
            if (!historicoAgrupado[ingredienteId]) {
              historicoAgrupado[ingredienteId] = [];
            }
            
            historicoAgrupado[ingredienteId].push({
              data: row.Data,
              preco: parseFloat(row.Preço) || 0,
              fornecedor: row.Fornecedor || '',
              observacoes: row.Observações || ''
            });
          });
          
          // Adicionar histórico aos ingredientes
          dadosImportados.ingredientes.forEach(ing => {
            if (historicoAgrupado[ing.id]) {
              ing.historico = historicoAgrupado[ing.id];
            }
          });
        }
        
        resolve(dadosImportados);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(arquivo);
  });
};

// Importar de CSV
export const importarDeCSV = (arquivo) => {
  return new Promise((resolve, reject) => {
    Papa.parse(arquivo, {
      header: true,
      delimiter: ';',
      complete: (results) => {
        try {
          const dadosImportados = {
            ingredientes: [],
            receitas: [],
            custosOperacionais: null,
            precificacao: [],
            historico: []
          };
          
          results.data.forEach(row => {
            if (row.Tipo === 'Ingrediente') {
              dadosImportados.ingredientes.push({
                id: row.ID || crypto.randomUUID(),
                nome: row.Nome || '',
                categoria: row.Categoria || 'outros',
                unidade: row.Unidade || 'kg',
                precoAtual: parseFloat(row.Valor) || 0,
                fornecedor: row.Fornecedor || '',
                quantidadePadrao: { P: 0, M: 0, G: 0, GG: 0 },
                ativo: true,
                historico: [],
                dataCriacao: new Date().toISOString(),
                dataAtualizacao: new Date().toISOString()
              });
            }
          });
          
          resolve(dadosImportados);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
};

// Importar de JSON
export const importarDeJSON = (arquivo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target.result);
        resolve(dados);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(arquivo);
  });
};

// Validar dados importados
export const validarDadosImportados = (dados) => {
  const erros = [];
  
  // Validar ingredientes
  if (dados.ingredientes) {
    dados.ingredientes.forEach((ing, index) => {
      if (!ing.nome) erros.push(`Ingrediente ${index + 1}: Nome é obrigatório`);
      if (!ing.unidade) erros.push(`Ingrediente ${index + 1}: Unidade é obrigatória`);
      if (ing.precoAtual < 0) erros.push(`Ingrediente ${index + 1}: Preço não pode ser negativo`);
    });
  }
  
  // Validar receitas
  if (dados.receitas) {
    dados.receitas.forEach((rec, index) => {
      if (!rec.nome) erros.push(`Receita ${index + 1}: Nome é obrigatório`);
      if (!rec.tamanhos) erros.push(`Receita ${index + 1}: Tamanhos são obrigatórios`);
    });
  }
  
  return {
    valido: erros.length === 0,
    erros
  };
};
