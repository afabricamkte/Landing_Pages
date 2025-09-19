// Serviço para conectar com Google Sheets usando uma única planilha com múltiplas abas
import axios from 'axios'

// Configuração para planilha unificada
let config = {
  spreadsheetId: '', // ID da planilha principal
  baseUrl: '', // URL base da planilha
  abas: {
    vendas: 'Vendas',
    insumos: 'Insumos', 
    cardapio: 'Cardapio',
    metricas: 'Metricas'
  }
}

// Carregar configuração do localStorage
export const loadConfig = () => {
  const savedConfig = localStorage.getItem('pizzaria-sheets-config')
  if (savedConfig) {
    const parsed = JSON.parse(savedConfig)
    config = { ...config, ...parsed }
    return true
  }
  return false
}

// Salvar configuração no localStorage
export const saveConfig = (newConfig) => {
  config = { ...config, ...newConfig }
  localStorage.setItem('pizzaria-sheets-config', JSON.stringify(config))
}

// Extrair ID da planilha da URL
export const extractSpreadsheetId = (url) => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : null
}

// Construir URL para aba específica
const buildSheetUrl = (spreadsheetId, sheetName) => {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
}

// Buscar dados de uma aba específica
const fetchSheetData = async (sheetName) => {
  try {
    if (!config.spreadsheetId) {
      throw new Error('ID da planilha não configurado')
    }

    const url = buildSheetUrl(config.spreadsheetId, sheetName)
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'text/csv',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.data) {
      throw new Error(`Dados vazios para aba ${sheetName}`)
    }

    return parseCSV(response.data)
  } catch (error) {
    console.error(`Erro ao buscar dados da aba ${sheetName}:`, error)
    throw error
  }
}

// Parser CSV simples
const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())
    if (values.length === headers.length) {
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      data.push(row)
    }
  }

  return data
}

// Buscar todos os dados das 4 abas
export const fetchAllData = async () => {
  try {
    loadConfig()

    if (!config.spreadsheetId) {
      console.log('Configuração não encontrada, usando dados mock')
      return { vendas: [], insumos: [], cardapio: [], metricas: [] }
    }

    console.log('Buscando dados das abas da planilha:', config.spreadsheetId)

    const [vendas, insumos, cardapio, metricas] = await Promise.all([
      fetchSheetData(config.abas.vendas).catch(() => []),
      fetchSheetData(config.abas.insumos).catch(() => []),
      fetchSheetData(config.abas.cardapio).catch(() => []),
      fetchSheetData(config.abas.metricas).catch(() => [])
    ])

    console.log('Dados carregados:', {
      vendas: vendas.length,
      insumos: insumos.length,
      cardapio: cardapio.length,
      metricas: metricas.length
    })

    return { vendas, insumos, cardapio, metricas }
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    return { vendas: [], insumos: [], cardapio: [], metricas: [] }
  }
}

// Processar dados de vendas para gráficos
export const processVendasData = (vendas) => {
  if (!vendas || vendas.length === 0) return []

  const vendasPorDia = {}
  
  vendas.forEach(venda => {
    const data = venda.Data
    const valor = parseFloat(venda.Valor_Total) || 0
    
    if (data && valor > 0) {
      if (!vendasPorDia[data]) {
        vendasPorDia[data] = { data, pedidos: 0, faturamento: 0 }
      }
      vendasPorDia[data].pedidos += 1
      vendasPorDia[data].faturamento += valor
    }
  })

  return Object.values(vendasPorDia).sort((a, b) => new Date(a.data) - new Date(b.data))
}

// Processar dados de canais para gráfico pizza
export const processCanaisData = (vendas) => {
  if (!vendas || vendas.length === 0) return []

  const canais = {}
  
  vendas.forEach(venda => {
    const canal = venda.Canal || 'Outros'
    canais[canal] = (canais[canal] || 0) + 1
  })

  return Object.entries(canais).map(([canal, quantidade]) => ({
    canal,
    quantidade,
    porcentagem: Math.round((quantidade / vendas.length) * 100)
  }))
}

// Processar produtos mais vendidos
export const processProdutosData = (vendas) => {
  if (!vendas || vendas.length === 0) return []

  const produtos = {}
  
  vendas.forEach(venda => {
    const produto = venda.Produto
    const quantidade = parseInt(venda.Quantidade) || 1
    
    if (produto) {
      produtos[produto] = (produtos[produto] || 0) + quantidade
    }
  })

  return Object.entries(produtos)
    .map(([produto, vendas]) => ({ produto, vendas }))
    .sort((a, b) => b.vendas - a.vendas)
    .slice(0, 5)
}

// Processar dados de estoque
export const processEstoqueData = (insumos) => {
  if (!insumos || insumos.length === 0) return []

  return insumos.map(item => {
    const atual = parseInt(item.Quantidade_Atual) || 0
    const minimo = parseInt(item.Quantidade_Minima) || 0
    
    let status = 'ok'
    if (atual <= minimo) {
      status = 'critico'
    } else if (atual <= minimo * 1.5) {
      status = 'atencao'
    }

    return {
      item: item.Item,
      atual,
      minimo,
      status,
      custo: parseFloat(item.Custo_Unitario) || 0,
      fornecedor: item.Fornecedor || '',
      validade: item.Validade || ''
    }
  })
}

// Calcular métricas principais
export const calculateMetrics = (vendas, metricas = []) => {
  // Se temos dados de métricas calculadas, usar eles
  if (metricas && metricas.length > 0) {
    const ultimaMetrica = metricas[metricas.length - 1]
    return {
      pedidosHoje: parseInt(ultimaMetrica.Pedidos_Total) || 0,
      faturamentoHoje: parseFloat(ultimaMetrica.Faturamento_Total) || 0,
      ticketMedio: parseFloat(ultimaMetrica.Ticket_Medio) || 0,
      crescimentoPedidos: parseFloat(ultimaMetrica.Crescimento_Pedidos) || 0,
      crescimentoFaturamento: parseFloat(ultimaMetrica.Crescimento_Faturamento) || 0,
      margemMedia: parseFloat(ultimaMetrica.Margem_Media) || 0,
      eficienciaOperacional: parseFloat(ultimaMetrica.Eficiencia_Operacional) || 0,
      tempoMedioPreparo: parseFloat(ultimaMetrica.Tempo_Medio_Preparo) || 0,
      taxaConversao: parseFloat(ultimaMetrica.Taxa_Conversao) || 0,
      roiMarketing: parseFloat(ultimaMetrica.ROI_Marketing) || 0
    }
  }

  // Calcular a partir dos dados de vendas
  if (!vendas || vendas.length === 0) {
    return {
      pedidosHoje: 0,
      faturamentoHoje: 0,
      ticketMedio: 0,
      crescimentoPedidos: 0,
      crescimentoFaturamento: 0
    }
  }

  const hoje = new Date().toISOString().split('T')[0]
  const vendasHoje = vendas.filter(v => v.Data === hoje)
  
  const pedidosHoje = vendasHoje.length
  const faturamentoHoje = vendasHoje.reduce((sum, v) => sum + (parseFloat(v.Valor_Total) || 0), 0)
  const ticketMedio = pedidosHoje > 0 ? faturamentoHoje / pedidosHoje : 0

  return {
    pedidosHoje,
    faturamentoHoje,
    ticketMedio,
    crescimentoPedidos: Math.random() * 100 - 50, // Mock para demonstração
    crescimentoFaturamento: Math.random() * 100 - 50 // Mock para demonstração
  }
}

// Validar configuração da planilha
export const validateConfig = (spreadsheetId) => {
  if (!spreadsheetId) {
    throw new Error('ID da planilha é obrigatório')
  }

  if (spreadsheetId.length < 20) {
    throw new Error('ID da planilha parece inválido')
  }

  return true
}

// Testar conexão com a planilha
export const testConnection = async (spreadsheetId) => {
  try {
    validateConfig(spreadsheetId)
    
    const testUrl = buildSheetUrl(spreadsheetId, 'Vendas')
    const response = await axios.get(testUrl, { timeout: 5000 })
    
    if (response.data && response.data.includes(',')) {
      return { success: true, message: 'Conexão estabelecida com sucesso!' }
    } else {
      return { success: false, message: 'Planilha encontrada mas sem dados válidos' }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Erro na conexão: ${error.message}` 
    }
  }
}
