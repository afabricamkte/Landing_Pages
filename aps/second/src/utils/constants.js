/**
 * Constantes do Sistema Pizzaria Pro
 * Centraliza todas as constantes utilizadas no sistema
 */

// Versão do sistema
export const APP_VERSION = '2.0.0';
export const APP_NAME = 'Pizzaria Pro';

// Chaves do LocalStorage
export const STORAGE_KEYS = {
    INGREDIENTES: 'pizzaria_ingredientes',
    RECEITAS: 'pizzaria_receitas',
    ESTOQUE: 'pizzaria_estoque',
    HISTORICO_PRECOS: 'pizzaria_historico_precos',
    ENTRADAS_ESTOQUE: 'pizzaria_entradas_estoque',
    VENDAS: 'pizzaria_vendas',
    PRODUTOS_EXTRAS: 'pizzaria_produtos_extras',
    CUSTOS_OPERACIONAIS: 'pizzaria_custos_operacionais',
    PRECOS_DIRETO: 'pizzaria_precos_direto',
    PRECOS_IFOOD: 'pizzaria_precos_ifood',
    RESULTADOS_DIARIOS: 'pizzaria_resultados_diarios',
    CONFIGURACOES: 'pizzaria_configuracoes',
    HISTORICO: 'pizzaria_historico',
    BACKUP_TIMESTAMP: 'pizzaria_backup_timestamp'
};

// Categorias de ingredientes
export const CATEGORIAS_INGREDIENTES = {
    MASSAS: 'massas',
    MOLHOS: 'molhos',
    QUEIJOS: 'queijos',
    CARNES: 'carnes',
    VEGETAIS: 'vegetais',
    TEMPEROS: 'temperos',
    EMBALAGENS: 'embalagens',
    OUTROS: 'outros'
};

// Labels das categorias
export const LABELS_CATEGORIAS = {
    [CATEGORIAS_INGREDIENTES.MASSAS]: '🍞 Massas',
    [CATEGORIAS_INGREDIENTES.MOLHOS]: '🍅 Molhos',
    [CATEGORIAS_INGREDIENTES.QUEIJOS]: '🧀 Queijos',
    [CATEGORIAS_INGREDIENTES.CARNES]: '🥩 Carnes',
    [CATEGORIAS_INGREDIENTES.VEGETAIS]: '🥬 Vegetais',
    [CATEGORIAS_INGREDIENTES.TEMPEROS]: '🌿 Temperos',
    [CATEGORIAS_INGREDIENTES.EMBALAGENS]: '📦 Embalagens',
    [CATEGORIAS_INGREDIENTES.OUTROS]: '📋 Outros'
};

// Unidades de medida
export const UNIDADES_MEDIDA = {
    KG: 'kg',
    G: 'g',
    L: 'l',
    ML: 'ml',
    UN: 'un',
    PCT: 'pct'
};

// Labels das unidades
export const LABELS_UNIDADES = {
    [UNIDADES_MEDIDA.KG]: 'Quilograma (kg)',
    [UNIDADES_MEDIDA.G]: 'Grama (g)',
    [UNIDADES_MEDIDA.L]: 'Litro (l)',
    [UNIDADES_MEDIDA.ML]: 'Mililitro (ml)',
    [UNIDADES_MEDIDA.UN]: 'Unidade (un)',
    [UNIDADES_MEDIDA.PCT]: 'Pacote (pct)'
};

// Tamanhos de pizza
export const TAMANHOS_PIZZA = {
    PEQUENA: 'pequena',
    MEDIA: 'media',
    GRANDE: 'grande',
    FAMILIA: 'familia',
    GIGANTE: 'gigante'
};

// Labels dos tamanhos
export const LABELS_TAMANHOS = {
    [TAMANHOS_PIZZA.PEQUENA]: '🍕 Pequena (25cm)',
    [TAMANHOS_PIZZA.MEDIA]: '🍕 Média (30cm)',
    [TAMANHOS_PIZZA.GRANDE]: '🍕 Grande (35cm)',
    [TAMANHOS_PIZZA.FAMILIA]: '🍕 Família (40cm)',
    [TAMANHOS_PIZZA.GIGANTE]: '🍕 Gigante (45cm)'
};

// Canais de venda
export const CANAIS_VENDA = {
    BALCAO: 'balcao',
    DELIVERY: 'delivery',
    IFOOD: 'ifood',
    UBER_EATS: 'uber_eats',
    RAPPI: 'rappi',
    WHATSAPP: 'whatsapp',
    TELEFONE: 'telefone',
    MISTO: 'misto'
};

// Labels dos canais
export const LABELS_CANAIS = {
    [CANAIS_VENDA.BALCAO]: '🏪 Balcão',
    [CANAIS_VENDA.DELIVERY]: '🚗 Delivery Próprio',
    [CANAIS_VENDA.IFOOD]: '🍔 iFood',
    [CANAIS_VENDA.UBER_EATS]: '🚚 Uber Eats',
    [CANAIS_VENDA.RAPPI]: '📱 Rappi',
    [CANAIS_VENDA.WHATSAPP]: '💬 WhatsApp',
    [CANAIS_VENDA.TELEFONE]: '📞 Telefone',
    [CANAIS_VENDA.MISTO]: '🔄 Misto'
};

// Formas de pagamento
export const FORMAS_PAGAMENTO = {
    PIX: 'pix',
    DINHEIRO: 'dinheiro',
    DEBITO: 'debito',
    CREDITO: 'credito',
    MISTO: 'misto'
};

// Labels das formas de pagamento
export const LABELS_PAGAMENTO = {
    [FORMAS_PAGAMENTO.PIX]: '💳 PIX',
    [FORMAS_PAGAMENTO.DINHEIRO]: '💵 Dinheiro',
    [FORMAS_PAGAMENTO.DEBITO]: '💳 Cartão Débito',
    [FORMAS_PAGAMENTO.CREDITO]: '💳 Cartão Crédito',
    [FORMAS_PAGAMENTO.MISTO]: '🔄 Misto'
};

// Status de estoque
export const STATUS_ESTOQUE = {
    OK: 'ok',
    BAIXO: 'baixo',
    CRITICO: 'critico',
    ZERADO: 'zerado'
};

// Labels dos status
export const LABELS_STATUS_ESTOQUE = {
    [STATUS_ESTOQUE.OK]: '✅ OK',
    [STATUS_ESTOQUE.BAIXO]: '⚠️ Baixo',
    [STATUS_ESTOQUE.CRITICO]: '🔴 Crítico',
    [STATUS_ESTOQUE.ZERADO]: '❌ Zerado'
};

// Tipos de movimentação de estoque
export const TIPOS_MOVIMENTACAO = {
    ENTRADA: 'entrada',
    SAIDA: 'saida',
    AJUSTE: 'ajuste',
    VENDA: 'venda'
};

// Custos operacionais padrão
export const CUSTOS_OPERACIONAIS_PADRAO = {
    aluguel: { nome: 'Aluguel', valor: 0, categoria: 'fixo' },
    energia: { nome: 'Energia Elétrica', valor: 0, categoria: 'variavel' },
    agua: { nome: 'Água', valor: 0, categoria: 'variavel' },
    gas: { nome: 'Gás', valor: 0, categoria: 'variavel' },
    internet: { nome: 'Internet/Telefone', valor: 0, categoria: 'fixo' },
    funcionarios: { nome: 'Funcionários', valor: 0, categoria: 'fixo' },
    impostos: { nome: 'Impostos', valor: 0, categoria: 'variavel' },
    marketing: { nome: 'Marketing', valor: 0, categoria: 'variavel' },
    manutencao: { nome: 'Manutenção', valor: 0, categoria: 'variavel' },
    limpeza: { nome: 'Limpeza', valor: 0, categoria: 'variavel' },
    seguranca: { nome: 'Segurança', valor: 0, categoria: 'fixo' },
    contabilidade: { nome: 'Contabilidade', valor: 0, categoria: 'fixo' },
    delivery: { nome: 'Delivery (combustível)', valor: 0, categoria: 'variavel' },
    embalagens: { nome: 'Embalagens extras', valor: 0, categoria: 'variavel' },
    outros: { nome: 'Outros custos', valor: 0, categoria: 'variavel' }
};

// Configurações padrão
export const CONFIGURACOES_PADRAO = {
    metaMensal: 0,
    metaDiaria: 0,
    margemMinima: 30,
    margemIdeal: 50,
    estoqueMinimoDias: 7,
    alertasAtivos: true,
    backupAutomatico: true,
    moedaSimbol: 'R$',
    casasDecimais: 2,
    formatoData: 'DD/MM/YYYY',
    fusoHorario: 'America/Sao_Paulo'
};

// Limites do sistema
export const LIMITES = {
    MAX_INGREDIENTES: 1000,
    MAX_RECEITAS: 500,
    MAX_VENDAS_DIA: 1000,
    MAX_HISTORICO_DIAS: 365,
    MIN_PRECO: 0.01,
    MAX_PRECO: 9999.99,
    MIN_QUANTIDADE: 0.001,
    MAX_QUANTIDADE: 99999.999
};

// Mensagens de erro padrão
export const MENSAGENS_ERRO = {
    CAMPO_OBRIGATORIO: 'Este campo é obrigatório',
    VALOR_INVALIDO: 'Valor inválido',
    PRECO_MINIMO: `Preço deve ser maior que R$ ${LIMITES.MIN_PRECO}`,
    PRECO_MAXIMO: `Preço deve ser menor que R$ ${LIMITES.MAX_PRECO}`,
    QUANTIDADE_MINIMA: `Quantidade deve ser maior que ${LIMITES.MIN_QUANTIDADE}`,
    QUANTIDADE_MAXIMA: `Quantidade deve ser menor que ${LIMITES.MAX_QUANTIDADE}`,
    ESTOQUE_INSUFICIENTE: 'Estoque insuficiente',
    INGREDIENTE_NAO_ENCONTRADO: 'Ingrediente não encontrado',
    RECEITA_NAO_ENCONTRADA: 'Receita não encontrada',
    ERRO_SALVAR: 'Erro ao salvar dados',
    ERRO_CARREGAR: 'Erro ao carregar dados',
    ERRO_EXPORTAR: 'Erro ao exportar dados',
    ERRO_IMPORTAR: 'Erro ao importar dados'
};

// Mensagens de sucesso padrão
export const MENSAGENS_SUCESSO = {
    SALVO_COM_SUCESSO: 'Salvo com sucesso!',
    ATUALIZADO_COM_SUCESSO: 'Atualizado com sucesso!',
    REMOVIDO_COM_SUCESSO: 'Removido com sucesso!',
    IMPORTADO_COM_SUCESSO: 'Importado com sucesso!',
    EXPORTADO_COM_SUCESSO: 'Exportado com sucesso!',
    BACKUP_CRIADO: 'Backup criado com sucesso!',
    DADOS_RESTAURADOS: 'Dados restaurados com sucesso!'
};

// Cores do tema
export const CORES_TEMA = {
    PRIMARY: '#ff6b6b',
    PRIMARY_DARK: '#e55555',
    SECONDARY: '#4ecdc4',
    SUCCESS: '#28a745',
    WARNING: '#ffc107',
    DANGER: '#dc3545',
    INFO: '#17a2b8',
    DARK: '#2c3e50',
    LIGHT: '#f8f9fa'
};

// Eventos customizados do sistema
export const EVENTOS = {
    INGREDIENTE_ADICIONADO: 'ingrediente:adicionado',
    INGREDIENTE_ATUALIZADO: 'ingrediente:atualizado',
    INGREDIENTE_REMOVIDO: 'ingrediente:removido',
    RECEITA_ADICIONADA: 'receita:adicionada',
    RECEITA_ATUALIZADA: 'receita:atualizada',
    RECEITA_REMOVIDA: 'receita:removida',
    VENDA_REGISTRADA: 'venda:registrada',
    ESTOQUE_ATUALIZADO: 'estoque:atualizado',
    ESTOQUE_BAIXO: 'estoque:baixo',
    DADOS_SALVOS: 'dados:salvos',
    DADOS_CARREGADOS: 'dados:carregados',
    ERRO_OCORRIDO: 'erro:ocorrido'
};

// Regex para validações
export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    TELEFONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    NUMERO: /^\d+(\.\d+)?$/,
    PRECO: /^\d+(\.\d{1,2})?$/
};

// Configurações de gráficos
export const CHART_CONFIG = {
    COLORS: [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
        '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9'
    ],
    ANIMATION_DURATION: 1000,
    RESPONSIVE: true,
    MAINTAIN_ASPECT_RATIO: false
};

// Configurações de exportação
export const EXPORT_CONFIG = {
    EXCEL_FILENAME: 'pizzaria-pro-dados',
    PDF_FILENAME: 'relatorio-pizzaria-pro',
    DATE_FORMAT: 'YYYY-MM-DD',
    DECIMAL_PLACES: 2
};

// Timeouts e intervalos
export const TIMEOUTS = {
    TOAST_DURATION: 5000,
    LOADING_MIN_TIME: 500,
    DEBOUNCE_SEARCH: 300,
    AUTO_SAVE: 30000,
    BACKUP_INTERVAL: 300000 // 5 minutos
};

// URLs e endpoints (para futuras integrações)
export const ENDPOINTS = {
    BASE_URL: '',
    API_VERSION: 'v1',
    BACKUP: '/backup',
    SYNC: '/sync',
    REPORTS: '/reports'
};

// Configurações de PWA (para futura implementação)
export const PWA_CONFIG = {
    NAME: APP_NAME,
    SHORT_NAME: 'PizzariaPro',
    DESCRIPTION: 'Sistema completo de gestão para pizzarias',
    THEME_COLOR: CORES_TEMA.PRIMARY,
    BACKGROUND_COLOR: '#ffffff',
    DISPLAY: 'standalone',
    ORIENTATION: 'portrait-primary'
};

// Configurações de notificações
export const NOTIFICATION_CONFIG = {
    ESTOQUE_BAIXO: {
        title: 'Estoque Baixo',
        icon: '⚠️',
        urgency: 'normal'
    },
    ESTOQUE_CRITICO: {
        title: 'Estoque Crítico',
        icon: '🔴',
        urgency: 'high'
    },
    META_ATINGIDA: {
        title: 'Meta Atingida',
        icon: '🎉',
        urgency: 'low'
    }
};

// Configurações de acessibilidade
export const A11Y_CONFIG = {
    FOCUS_VISIBLE: true,
    HIGH_CONTRAST: false,
    REDUCED_MOTION: false,
    SCREEN_READER: false
};

export default {
    APP_VERSION,
    APP_NAME,
    STORAGE_KEYS,
    CATEGORIAS_INGREDIENTES,
    LABELS_CATEGORIAS,
    UNIDADES_MEDIDA,
    LABELS_UNIDADES,
    TAMANHOS_PIZZA,
    LABELS_TAMANHOS,
    CANAIS_VENDA,
    LABELS_CANAIS,
    FORMAS_PAGAMENTO,
    LABELS_PAGAMENTO,
    STATUS_ESTOQUE,
    LABELS_STATUS_ESTOQUE,
    TIPOS_MOVIMENTACAO,
    CUSTOS_OPERACIONAIS_PADRAO,
    CONFIGURACOES_PADRAO,
    LIMITES,
    MENSAGENS_ERRO,
    MENSAGENS_SUCESSO,
    CORES_TEMA,
    EVENTOS,
    REGEX,
    CHART_CONFIG,
    EXPORT_CONFIG,
    TIMEOUTS,
    ENDPOINTS,
    PWA_CONFIG,
    NOTIFICATION_CONFIG,
    A11Y_CONFIG
};

