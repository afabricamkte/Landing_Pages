// Configurações do Sistema APS
const CONFIG = {
    // Google Sheets Configuration
    GOOGLE_SHEETS: {
        API_KEY: '', // Será configurado pelo usuário
        SPREADSHEET_ID: '', // Será configurado pelo usuário
        DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
        SCOPES: 'https://www.googleapis.com/auth/spreadsheets'
    },

    // Abas da planilha
    SHEETS: {
        INGREDIENTES: 'INGREDIENTES',
        RECEITAS_BASE: 'RECEITAS_BASE',
        PIZZAS_CARDAPIO: 'PIZZAS_CARDAPIO',
        CUSTOS_FIXOS: 'CUSTOS_FIXOS',
        CUSTOS_VARIAVEIS: 'CUSTOS_VARIAVEIS',
        IMPOSTOS_TAXAS: 'IMPOSTOS_TAXAS',
        RECHEIOS: 'RECHEIOS',
        PARAMETROS: 'PARAMETROS',
        PRECOS_FINAIS: 'PRECOS_FINAIS',
        DASHBOARD: 'DASHBOARD'
    },

    // Ranges das planilhas
    RANGES: {
        INGREDIENTES: 'INGREDIENTES!A2:L',
        RECEITAS_BASE: 'RECEITAS_BASE!A2:E',
        PIZZAS_CARDAPIO: 'PIZZAS_CARDAPIO!A2:G',
        CUSTOS_FIXOS: 'CUSTOS_FIXOS!A2:C',
        CUSTOS_VARIAVEIS: 'CUSTOS_VARIAVEIS!A2:F',
        IMPOSTOS_TAXAS: 'IMPOSTOS_TAXAS!A2:E',
        RECHEIOS: 'RECHEIOS!A2:F',
        PARAMETROS: 'PARAMETROS!A2:B',
        PRECOS_FINAIS: 'PRECOS_FINAIS!A2:J'
    },

    // Categorias padrão
    CATEGORIAS: {
        INGREDIENTES: ['Queijos', 'Carnes', 'Vegetais', 'Molhos', 'Massas', 'Temperos'],
        PIZZAS: ['Tradicional', 'Especial', 'Premium', 'Doce'],
        RECEITAS: ['Massa', 'Molho']
    },

    // Unidades de medida
    UNIDADES: ['kg', 'g', 'L', 'ml', 'unidade'],

    // Tamanhos de pizza
    TAMANHOS: ['P', 'M', 'G', 'GG'],

    // Canais de venda
    CANAIS: ['Balcão', 'Delivery', 'iFood', '99Food', 'Rappi', 'Uber Eats'],

    // Configurações de formatação
    FORMATO: {
        MOEDA: {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
        },
        PERCENTUAL: {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 2
        },
        NUMERO: {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        }
    },

    // Configurações de validação
    VALIDACAO: {
        RENDIMENTO_MIN: 1,
        RENDIMENTO_MAX: 100,
        PRECO_MIN: 0.01,
        PRECO_MAX: 999999.99,
        QUANTIDADE_MIN: 0.001,
        QUANTIDADE_MAX: 999999.999
    },

    // Configurações de cálculo
    CALCULO: {
        MARGEM_PADRAO: 35, // 35%
        FATOR_CONVERSAO: {
            'kg': 1000, // kg para g
            'L': 1000,  // L para ml
            'g': 1,
            'ml': 1,
            'unidade': 1
        }
    },

    // Configurações de interface
    UI: {
        ITEMS_PER_PAGE: 50,
        TOAST_DURATION: 3000,
        LOADING_DELAY: 500,
        ANIMATION_DURATION: 300
    },

    // Dados de exemplo para demonstração
    DADOS_EXEMPLO: {
        INGREDIENTES: [
            {
                id: 'ING001',
                nome: 'Farinha Tipo 1',
                categoria: 'Massas',
                unidade: 'kg',
                quantidade: 1,
                preco: 4.00,
                rendimento: 98,
                fornecedor: 'Fornecedor A',
                estoque: 10
            },
            {
                id: 'ING002',
                nome: 'Mussarela',
                categoria: 'Queijos',
                unidade: 'kg',
                quantidade: 1,
                preco: 45.00,
                rendimento: 95,
                fornecedor: 'Fornecedor B',
                estoque: 5
            },
            {
                id: 'ING003',
                nome: 'Molho Tomate',
                categoria: 'Molhos',
                unidade: 'L',
                quantidade: 1,
                preco: 8.00,
                rendimento: 100,
                fornecedor: 'Fornecedor C',
                estoque: 3
            }
        ],
        CUSTOS_FIXOS: [
            { categoria: 'Aluguel', valor: 4000, rateio: 'Pizza' },
            { categoria: 'Salários', valor: 8000, rateio: 'Pizza' },
            { categoria: 'Energia', valor: 500, rateio: 'Pizza' },
            { categoria: 'Internet', valor: 150, rateio: 'Pizza' }
        ],
        CUSTOS_VARIAVEIS: [
            { item: 'Embalagem pizza', tipo: 'Unidade', P: 1.20, M: 1.50, G: 1.80, GG: 2.20 },
            { item: 'Gás (por pizza)', tipo: 'Energia', P: 0.80, M: 1.00, G: 1.20, GG: 1.50 },
            { item: 'Sachês (kit)', tipo: 'Unidade', P: 0.50, M: 0.50, G: 0.70, GG: 0.90 }
        ],
        IMPOSTOS_TAXAS: [
            { canal: 'Balcão', imposto: 8, taxa_cartao: 2.5, taxa_app: 0, entrega: 0 },
            { canal: 'Delivery', imposto: 8, taxa_cartao: 2.5, taxa_app: 0, entrega: 5.00 },
            { canal: 'iFood', imposto: 8, taxa_cartao: 0, taxa_app: 23, entrega: 0 },
            { canal: 'Rappi', imposto: 8, taxa_cartao: 0, taxa_app: 25, entrega: 0 }
        ],
        PARAMETROS: [
            { parametro: 'Vendas_Mensais_Previstas', valor: 3120 },
            { parametro: 'Margem_Lucro_Desejada', valor: 35 }
        ]
    },

    // Mensagens do sistema
    MENSAGENS: {
        SUCESSO: {
            SALVAR: 'Dados salvos com sucesso!',
            EXCLUIR: 'Item excluído com sucesso!',
            SINCRONIZAR: 'Dados sincronizados com sucesso!',
            EXPORTAR: 'Dados exportados com sucesso!'
        },
        ERRO: {
            CARREGAR: 'Erro ao carregar dados. Tente novamente.',
            SALVAR: 'Erro ao salvar dados. Verifique os campos.',
            EXCLUIR: 'Erro ao excluir item. Tente novamente.',
            SINCRONIZAR: 'Erro na sincronização. Verifique a conexão.',
            VALIDACAO: 'Dados inválidos. Verifique os campos.',
            GOOGLE_SHEETS: 'Erro na conexão com Google Sheets. Verifique as configurações.'
        },
        AVISO: {
            EXCLUIR: 'Tem certeza que deseja excluir este item?',
            SAIR: 'Existem alterações não salvas. Deseja continuar?',
            CONFIGURACAO: 'Configure o Google Sheets API para usar o sistema.'
        }
    },

    // Configurações de desenvolvimento
    DEBUG: false,
    VERSION: '1.0.0',
    BUILD_DATE: new Date().toISOString()
};

// Função para validar configurações
function validateConfig() {
    const required = ['GOOGLE_SHEETS.API_KEY', 'GOOGLE_SHEETS.SPREADSHEET_ID'];
    const missing = [];

    required.forEach(path => {
        const keys = path.split('.');
        let value = CONFIG;
        
        for (const key of keys) {
            value = value[key];
            if (value === undefined || value === '') {
                missing.push(path);
                break;
            }
        }
    });

    return {
        valid: missing.length === 0,
        missing: missing
    };
}

// Função para atualizar configurações
function updateConfig(updates) {
    Object.keys(updates).forEach(key => {
        if (key.includes('.')) {
            const keys = key.split('.');
            let obj = CONFIG;
            for (let i = 0; i < keys.length - 1; i++) {
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = updates[key];
        } else {
            CONFIG[key] = updates[key];
        }
    });
}

// Função para obter configuração
function getConfig(path) {
    const keys = path.split('.');
    let value = CONFIG;
    
    for (const key of keys) {
        value = value[key];
        if (value === undefined) {
            return null;
        }
    }
    
    return value;
}

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, validateConfig, updateConfig, getConfig };
}
