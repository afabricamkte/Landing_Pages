import axios from 'axios'

// Configurações para Google Sheets
const GOOGLE_SHEETS_CONFIG = {
  // URLs públicas CSV (método mais simples)
  vendas: '', // Será preenchida pelo usuário
  insumos: '', // Será preenchida pelo usuário
  cardapio: '', // Será preenchida pelo usuário
  metricas: '', // Será preenchida pelo usuário
  
  // Configuração da API (método mais avançado)
  apiKey: '', // Será preenchida pelo usuário
  spreadsheetId: '', // Será preenchida pelo usuário
  ranges: {
    vendas: 'Vendas!A:I',
    insumos: 'Insumos!A:I',
    cardapio: 'Cardapio!A:H',
    metricas: 'Metricas!A:D'
  }
}

// Função para parsear CSV
const parseCSV = (csvText) => {
  try {
    const rows = csvText.split(/\r?\n/)
    const headers = rows[0].split(',')
    const data = []
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].trim() === '') continue
      
      const rowData = rows[i].split(',')
      const rowObject = {}
      
      for (let j = 0; j < headers.length; j++) {
        rowObject[headers[j]] = rowData[j] || ''
      }
      
      data.push(rowObject)
    }
    
    return data
  } catch (error) {
    console.error('Erro ao parsear CSV:', error)
    return []
  }
}

// Função para buscar dados via CSV público
const fetchCSVData = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'Accept': 'text/csv'
      }
    })
    return parseCSV(response.data)
  } catch (error) {
    console.error('Erro ao buscar CSV:', error)
    throw error
  }
}

// Função para buscar dados via Google Sheets API
const fetchAPIData = async (range) => {
  try {
    const { apiKey, spreadsheetId } = GOOGLE_SHEETS_CONFIG
    
    if (!apiKey || !spreadsheetId) {
      throw new Error('API Key ou Spreadsheet ID não configurados')
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
    
    const response = await axios.get(url, {
      timeout: 5000
    })
    
    const rows = response.data.values
    if (!rows || rows.length === 0) return []
    
    const headers = rows[0]
    const data = []
    
    for (let i = 1; i < rows.length; i++) {
      const rowObject = {}
      for (let j = 0; j < headers.length; j++) {
        rowObject[headers[j]] = rows[i][j] || ''
      }
      data.push(rowObject)
    }
    
    return data
  } catch (error) {
    console.error('Erro ao buscar dados da API:', error)
    throw error
  }
}

// Função principal para buscar todos os dados
export const fetchAllData = async () => {
  try {
    const results = {
      vendas: [],
      insumos: [],
      cardapio: [],
      metricas: []
    }
    
    // Tentar primeiro via CSV público
    if (GOOGLE_SHEETS_CONFIG.vendas) {
      try {
        results.vendas = await fetchCSVData(GOOGLE_SHEETS_CONFIG.vendas)
      } catch (error) {
        console.warn('Falha ao buscar vendas via CSV:', error.message)
      }
    }
    
    if (GOOGLE_SHEETS_CONFIG.insumos) {
      try {
        results.insumos = await fetchCSVData(GOOGLE_SHEETS_CONFIG.insumos)
      } catch (error) {
        console.warn('Falha ao buscar insumos via CSV:', error.message)
      }
    }
    
    if (GOOGLE_SHEETS_CONFIG.cardapio) {
      try {
        results.cardapio = await fetchCSVData(GOOGLE_SHEETS_CONFIG.cardapio)
      } catch (error) {
        console.warn('Falha ao buscar cardápio via CSV:', error.message)
      }
    }
    
    if (GOOGLE_SHEETS_CONFIG.metricas) {
      try {
        results.metricas = await fetchCSVData(GOOGLE_SHEETS_CONFIG.metricas)
      } catch (error) {
        console.warn('Falha ao buscar métricas via CSV:', error.message)
      }
    }
    
    // Se CSV falhou, tentar via API
    if (results.vendas.length === 0 && GOOGLE_SHEETS_CONFIG.apiKey) {
      try {
        results.vendas = await fetchAPIData(GOOGLE_SHEETS_CONFIG.ranges.vendas)
      } catch (error) {
        console.warn('Falha ao buscar vendas via API:', error.message)
      }
    }
    
    if (results.insumos.length === 0 && GOOGLE_SHEETS_CONFIG.apiKey) {
      try {
        results.insumos = await fetchAPIData(GOOGLE_SHEETS_CONFIG.ranges.insumos)
      } catch (error) {
        console.warn('Falha ao buscar insumos via API:', error.message)
      }
    }
    
    if (results.cardapio.length === 0 && GOOGLE_SHEETS_CONFIG.apiKey) {
      try {
        results.cardapio = await fetchAPIData(GOOGLE_SHEETS_CONFIG.ranges.cardapio)
      } catch (error) {
        console.warn('Falha ao buscar cardápio via API:', error.message)
      }
    }
    
    if (results.metricas.length === 0 && GOOGLE_SHEETS_CONFIG.apiKey) {
      try {
        results.metricas = await fetchAPIData(GOOGLE_SHEETS_CONFIG.ranges.metricas)
      } catch (error) {
        console.warn('Falha ao buscar métricas via API:', error.message)
      }
    }
    
    return results
  } catch (error) {
    console.error('Erro geral ao buscar dados:', error)
    throw error
  }
}

// Função para processar dados de vendas
export const processVendasData = (vendas) => {
  if (!vendas || vendas.length === 0) return []
  
  const vendasPorDia = {}
  
  vendas.forEach(venda => {
    const data = venda.Data || venda.data
    const valor = parseFloat(venda.Valor_Total || venda.valor_total || 0)
    
    if (!vendasPorDia[data]) {
      vendasPorDia[data] = {
        data,
        pedidos: 0,
        faturamento: 0
      }
    }
    
    vendasPorDia[data].pedidos += 1
    vendasPorDia[data].faturamento += valor
  })
  
  return Object.values(vendasPorDia).sort((a, b) => new Date(a.data) - new Date(b.data))
}

// Função para processar dados de canais
export const processCanaisData = (vendas) => {
  if (!vendas || vendas.length === 0) return []
  
  const canais = {}
  const cores = {
    'iFood': '#EA1D2C',
    'WhatsApp': '#25D366',
    'Balcao': '#8B5CF6',
    'Balcão': '#8B5CF6',
    '99Food': '#FFD700',
    'Rappi': '#FF6B35'
  }
  
  vendas.forEach(venda => {
    const canal = venda.Canal || venda.canal
    
    if (!canais[canal]) {
      canais[canal] = {
        nome: canal,
        pedidos: 0,
        cor: cores[canal] || '#6B7280'
      }
    }
    
    canais[canal].pedidos += 1
  })
  
  return Object.values(canais)
}

// Função para processar produtos mais vendidos
export const processProdutosData = (vendas) => {
  if (!vendas || vendas.length === 0) return []
  
  const produtos = {}
  
  vendas.forEach(venda => {
    const produto = venda.Produto || venda.produto
    const quantidade = parseInt(venda.Quantidade || venda.quantidade || 1)
    
    if (!produtos[produto]) {
      produtos[produto] = {
        produto,
        vendas: 0
      }
    }
    
    produtos[produto].vendas += quantidade
  })
  
  return Object.values(produtos)
    .sort((a, b) => b.vendas - a.vendas)
    .slice(0, 5)
}

// Função para processar dados de estoque
export const processEstoqueData = (insumos) => {
  if (!insumos || insumos.length === 0) return []
  
  return insumos.map(insumo => ({
    item: insumo.Insumo || insumo.insumo,
    atual: parseInt(insumo.Estoque_Atual || insumo.estoque_atual || 0),
    minimo: parseInt(insumo.Estoque_Minimo || insumo.estoque_minimo || 0),
    status: (parseInt(insumo.Estoque_Atual || insumo.estoque_atual || 0) <= 
             parseInt(insumo.Estoque_Minimo || insumo.estoque_minimo || 0)) ? 'critico' : 'ok'
  }))
}

// Função para calcular métricas
export const calculateMetrics = (vendas) => {
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
  const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  const vendasHoje = vendas.filter(v => (v.Data || v.data) === hoje)
  const vendasOntem = vendas.filter(v => (v.Data || v.data) === ontem)
  
  const pedidosHoje = vendasHoje.length
  const pedidosOntem = vendasOntem.length
  
  const faturamentoHoje = vendasHoje.reduce((sum, v) => 
    sum + parseFloat(v.Valor_Total || v.valor_total || 0), 0)
  const faturamentoOntem = vendasOntem.reduce((sum, v) => 
    sum + parseFloat(v.Valor_Total || v.valor_total || 0), 0)
  
  const ticketMedio = pedidosHoje > 0 ? faturamentoHoje / pedidosHoje : 0
  
  const crescimentoPedidos = pedidosOntem > 0 ? 
    ((pedidosHoje - pedidosOntem) / pedidosOntem * 100) : 0
  const crescimentoFaturamento = faturamentoOntem > 0 ? 
    ((faturamentoHoje - faturamentoOntem) / faturamentoOntem * 100) : 0
  
  return {
    pedidosHoje,
    faturamentoHoje,
    ticketMedio,
    crescimentoPedidos: Math.round(crescimentoPedidos * 10) / 10,
    crescimentoFaturamento: Math.round(crescimentoFaturamento * 10) / 10
  }
}

// Função para configurar URLs do Google Sheets
export const configureGoogleSheets = (config) => {
  Object.assign(GOOGLE_SHEETS_CONFIG, config)
}

// Exportar configuração atual
export const getCurrentConfig = () => ({ ...GOOGLE_SHEETS_CONFIG })
