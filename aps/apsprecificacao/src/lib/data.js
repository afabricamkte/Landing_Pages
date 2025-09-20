// Estrutura de dados e utilitários para o sistema de precificação

// Canais de venda disponíveis
export const CANAIS_VENDA = {
  ifood: { nome: 'iFood', taxa: 0.15, cor: '#EA1D2C', temDelivery: true },
  food99: { nome: '99Food', taxa: 0.12, cor: '#FF6B35', temDelivery: true },
  rappi: { nome: 'Rappi', taxa: 0.14, cor: '#FF441F', temDelivery: true },
  ubereats: { nome: 'Uber Eats', taxa: 0.18, cor: '#000000', temDelivery: true },
  aiqfome: { nome: 'Aiqfome', taxa: 0.10, cor: '#00A859', temDelivery: true },
  james: { nome: 'James Delivery', taxa: 0.13, cor: '#1E40AF', temDelivery: true },
  deliverymuch: { nome: 'Delivery Much', taxa: 0.15, cor: '#7C3AED', temDelivery: true },
  whatsapp: { nome: 'WhatsApp/Site', taxa: 0.00, cor: '#25D366', temDelivery: true },
  balcao: { nome: 'Balcão/Retirada', taxa: 0.00, cor: '#6B7280', temDelivery: false }
};

// Tamanhos de pizza padrão
export const TAMANHOS_PIZZA = {
  P: { nome: 'Pequena', diametro: '25cm' },
  M: { nome: 'Média', diametro: '30cm' },
  G: { nome: 'Grande', diametro: '35cm' },
  GG: { nome: 'Gigante', diametro: '40cm' }
};

// Unidades de medida para ingredientes
export const UNIDADES_MEDIDA = [
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'l', label: 'Litro (l)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'un', label: 'Unidade' },
  { value: 'cx', label: 'Caixa' },
  { value: 'pct', label: 'Pacote' }
];

// Estrutura padrão para ingrediente
export const criarIngrediente = (dados = {}) => ({
  id: dados.id || crypto.randomUUID(),
  nome: dados.nome || '',
  unidade: dados.unidade || 'kg',
  precoAtual: dados.precoAtual || 0,
  fornecedor: dados.fornecedor || '',
  historico: dados.historico || [],
  quantidadePadrao: dados.quantidadePadrao || { P: 0, M: 0, G: 0, GG: 0 },
  categoria: dados.categoria || 'outros',
  ativo: dados.ativo !== undefined ? dados.ativo : true,
  dataCriacao: dados.dataCriacao || new Date().toISOString(),
  dataAtualizacao: dados.dataAtualizacao || new Date().toISOString()
});

// Estrutura padrão para receita
export const criarReceita = (dados = {}) => ({
  id: dados.id || crypto.randomUUID(),
  nome: dados.nome || '',
  categoria: dados.categoria || 'tradicional',
  descricao: dados.descricao || '',
  tamanhos: dados.tamanhos || {
    P: { ingredientes: [], custoTotal: 0 },
    M: { ingredientes: [], custoTotal: 0 },
    G: { ingredientes: [], custoTotal: 0 },
    GG: { ingredientes: [], custoTotal: 0 }
  },
  historicoCusto: dados.historicoCusto || [],
  ativa: dados.ativa !== undefined ? dados.ativa : true,
  dataCriacao: dados.dataCriacao || new Date().toISOString(),
  dataAtualizacao: dados.dataAtualizacao || new Date().toISOString()
});

// Estrutura padrão para custos operacionais
export const criarCustosOperacionais = (dados = {}) => ({
  custosFixosMensais: dados.custosFixosMensais || {
    agua: 0,
    luz: 0,
    internet: 0,
    aluguel: 0,
    salarios: 0,
    telefone: 0,
    contabilidade: 0,
    outros: 0
  },
  custosPorPedido: dados.custosPorPedido || {
    embalagens: {
      caixaPizza: { P: 0, M: 0, G: 0, GG: 0 },
      sacola: 0,
      guardanapo: 0,
      papel: 0
    },
    saches: {
      ketchup: 0,
      maionese: 0,
      mostarda: 0,
      oregano: 0,
      pimenta: 0
    }
  },
  custosDelivery: dados.custosDelivery || {
    combustivel: 0,
    manutencao: 0,
    entregador: 0,
    seguro: 0
  },
  volumeVendasMensal: dados.volumeVendasMensal || 1000,
  dataAtualizacao: dados.dataAtualizacao || new Date().toISOString()
});

// Estrutura padrão para precificação
export const criarPrecificacao = (dados = {}) => ({
  receitaId: dados.receitaId || '',
  tamanho: dados.tamanho || 'M',
  custoIngredientes: dados.custoIngredientes || 0,
  custoOperacional: dados.custoOperacional || 0,
  custoTotal: dados.custoTotal || 0,
  margemDesejada: dados.margemDesejada || 0.65,
  canais: dados.canais || {},
  dataCalculo: dados.dataCalculo || new Date().toISOString()
});

// Categorias de ingredientes
export const CATEGORIAS_INGREDIENTES = [
  { value: 'queijos', label: 'Queijos' },
  { value: 'carnes', label: 'Carnes' },
  { value: 'vegetais', label: 'Vegetais' },
  { value: 'molhos', label: 'Molhos' },
  { value: 'massas', label: 'Massas' },
  { value: 'temperos', label: 'Temperos' },
  { value: 'outros', label: 'Outros' }
];

// Categorias de receitas
export const CATEGORIAS_RECEITAS = [
  { value: 'tradicional', label: 'Tradicional' },
  { value: 'especial', label: 'Especial' },
  { value: 'premium', label: 'Premium' },
  { value: 'doce', label: 'Doce' },
  { value: 'vegana', label: 'Vegana' },
  { value: 'vegetariana', label: 'Vegetariana' }
];

// Utilitários para cálculos
export const calcularCustoIngredientes = (ingredientes, listaIngredientes) => {
  return ingredientes.reduce((total, item) => {
    const ingrediente = listaIngredientes.find(ing => ing.id === item.ingredienteId);
    if (ingrediente) {
      return total + (ingrediente.precoAtual * item.quantidade);
    }
    return total;
  }, 0);
};

export const calcularCustoOperacional = (custosOp, tamanho) => {
  const totalFixosMensal = Object.values(custosOp.custosFixosMensais).reduce((a, b) => a + b, 0);
  const rateioFixo = totalFixosMensal / custosOp.volumeVendasMensal;
  
  const custoEmbalagem = custosOp.custosPorPedido.embalagens.caixaPizza[tamanho] || 0;
  const custoSacola = custosOp.custosPorPedido.embalagens.sacola || 0;
  const custoGuardanapo = custosOp.custosPorPedido.embalagens.guardanapo || 0;
  const custoSaches = Object.values(custosOp.custosPorPedido.saches).reduce((a, b) => a + b, 0);
  
  return rateioFixo + custoEmbalagem + custoSacola + custoGuardanapo + custoSaches;
};

export const calcularCustoDelivery = (custosOp) => {
  return Object.values(custosOp.custosDelivery).reduce((a, b) => a + b, 0);
};

export const calcularPrecoSugerido = (custoTotal, margemDesejada, taxaCanal = 0) => {
  // Preço = Custo / (1 - Margem - Taxa)
  const divisor = 1 - margemDesejada - taxaCanal;
  return divisor > 0 ? custoTotal / divisor : custoTotal * 2;
};

export const calcularMargemReal = (precoVenda, custoTotal, taxaCanal = 0) => {
  const receitaLiquida = precoVenda * (1 - taxaCanal);
  return receitaLiquida > 0 ? (receitaLiquida - custoTotal) / receitaLiquida : 0;
};

// Utilitários para localStorage
export const salvarDados = (chave, dados) => {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
    localStorage.setItem(`${chave}_backup`, JSON.stringify({
      dados,
      timestamp: new Date().toISOString()
    }));
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return false;
  }
};

export const carregarDados = (chave, padrao = []) => {
  try {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : padrao;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return padrao;
  }
};

// Utilitários para formatação
export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const formatarPorcentagem = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(valor);
};

export const formatarData = (data) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
};
