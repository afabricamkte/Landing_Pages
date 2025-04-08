// api.js - Funções para integração com Google Sheets

const API = {
    // URL base da API (será preenchida nas configurações)
    baseUrl: '',
    
    // Inicializar a API com as configurações
    init: function(appScriptUrl) {
      this.baseUrl = appScriptUrl;
      
      // Verificar se temos a URL salva localmente
      if (!appScriptUrl && localStorage.getItem('appScriptUrl')) {
        this.baseUrl = localStorage.getItem('appScriptUrl');
      }
    },
    
    // Testar a conexão com o Google Sheets
    testConnection: async function() {
      return this.callApi('testarConexao');
    },
    
    // Obter todos os eventos
    getEventos: async function() {
      return this.callApi('getEventos');
    },
    
    // Obter fornecedores
    getFornecedores: async function() {
      return this.callApi('getFornecedores');
    },
    
    // Obter orçamentos de um evento
    getOrcamentos: async function(eventoId) {
      return this.callApi('getOrcamentos', { eventoId });
    },
    
    // Obter pagamentos
    getPagamentos: async function(eventoId) {
      return this.callApi('getPagamentos', { eventoId });
    },
    
    // Adicionar novo evento
    addEvento: async function(dados) {
      return this.callApi('addEvento', { dados: JSON.stringify(dados) });
    },
    
    // Adicionar novo fornecedor
    addFornecedor: async function(dados) {
      return this.callApi('addFornecedor', { dados: JSON.stringify(dados) });
    },
    
    // Adicionar novo orçamento
    addOrcamento: async function(dados) {
      return this.callApi('addOrcamento', { dados: JSON.stringify(dados) });
    },
    
    // Adicionar novo pagamento
    addPagamento: async function(dados) {
      return this.callApi('addPagamento', { dados: JSON.stringify(dados) });
    },
    
    // Atualizar evento existente
    updateEvento: async function(id, dados) {
      return this.callApi('updateEvento', { id, dados: JSON.stringify(dados) });
    },
    
    // Excluir evento
    deleteEvento: async function(id) {
      return this.callApi('deleteEvento', { id });
    },
    
    // Função genérica para chamar a API
    callApi: async function(action, params = {}) {
      try {
        // Verificar se temos a URL da API
        if (!this.baseUrl) {
          throw new Error('URL da API não configurada');
        }
        
        // Construir a URL com os parâmetros
        let url = `${this.baseUrl}?action=${action}`;
        for (const [key, value] of Object.entries(params)) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
        
        // Exibir o loader
        $('.loading').show();
        
        // Fazer a requisição
        const response = await fetch(url);
        const data = await response.json();
        
        // Esconder o loader
        $('.loading').hide();
        
        // Verificar se a requisição foi bem-sucedida
        if (!data.success) {
          throw new Error(data.message || 'Erro desconhecido');
        }
        
        return data.data;
      } catch (error) {
        // Esconder o loader
        $('.loading').hide();
        
        // Exibir mensagem de erro
        console.error('Erro na API:', error);
        alert(`Erro ao comunicar com a API: ${error.message}`);
        throw error;
      }
    }
  };