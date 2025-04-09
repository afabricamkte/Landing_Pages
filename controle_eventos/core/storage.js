/**
 * Sistema de Gestão de Eventos - Armazenamento
 * Abstração para armazenamento de dados (local e remoto)
 */

import state from './state.js';

export class StorageService {
  constructor() {
    this.storagePrefix = 'eventApp_';
    this.useRemote = false;
    
    // Verifica se o armazenamento remoto está configurado
    const settings = state.getState('appSettings');
    this.useRemote = !!(settings && settings.scriptUrl && settings.spreadsheetId);
  }
  
  /**
   * Verifica se a conexão remota está disponível e configurada
   */
  isRemoteConfigured() {
    const settings = state.getState('appSettings');
    return !!(settings && settings.scriptUrl && settings.spreadsheetId);
  }
  
  /**
   * Testa a conexão com o Google Apps Script
   */
  async testConnection() {
    const settings = state.getState('appSettings');
    if (!this.isRemoteConfigured()) {
      throw new Error('Configurações de armazenamento remoto não definidas');
    }
    
    try {
      const params = {
        action: 'testConnection',
        spreadsheetId: settings.spreadsheetId
      };
      
      const response = await this.makeApiRequest(settings.scriptUrl, params);
      return response.success;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }
  
  /**
   * Salva as configurações da aplicação
   */
  saveAppSettings(scriptUrl, spreadsheetId) {
    const settings = {
      scriptUrl,
      spreadsheetId
    };
    
    state.setState('appSettings', settings);
    this.useRemote = true;
    
    // Salva também no localStorage para persistência
    localStorage.setItem(`${this.storagePrefix}appSettings`, JSON.stringify(settings));
    
    return true;
  }
  
  /**
   * Autentica um usuário
   */
  async authenticateUser(email, password) {
    if (!this.isRemoteConfigured()) {
      throw new Error('Configurações de armazenamento remoto não definidas');
    }
    
    const settings = state.getState('appSettings');
    const params = {
      action: 'login',
      email,
      senha: password
    };
    
    try {
      return await this.makeApiRequest(settings.scriptUrl, params);
    } catch (error) {
      console.error('Erro na autenticação:', error);
      throw error;
    }
  }
  
  /**
   * Gerencia usuários (adiciona, lista, remove)
   */
  async manageUsers(operation, userData, adminToken) {
    if (!this.isRemoteConfigured()) {
      throw new Error('Configurações de armazenamento remoto não definidas');
    }
    
    const settings = state.getState('appSettings');
    let params = {
      action: operation,
      adminToken,
      spreadsheetId: settings.spreadsheetId
    };
    
    // Adiciona parâmetros específicos dependendo da operação
    if (operation === 'adicionarUsuario') {
      params.usuario = userData;
    } else if (operation === 'excluirUsuario') {
      params.usuarioId = userData;
    }
    
    try {
      return await this.makeApiRequest(settings.scriptUrl, params);
    } catch (error) {
      console.error(`Erro na operação ${operation}:`, error);
      throw error;
    }
  }
  
  /**
   * Carrega dados do armazenamento
   */
  async load(key, id = null) {
    // Se estiver configurado para remoto, tenta carregar remotamente
    if (this.useRemote) {
      try {
        return await this.loadRemote(key, id);
      } catch (error) {
        console.error(`Erro ao carregar ${key} remotamente:`, error);
        // Se falhar, cai para o carregamento local
      }
    }
    
    // Carrega do armazenamento local
    return this.loadLocal(key, id);
  }
  
  /**
   * Salva dados no armazenamento
   */
  async save(key, data, id = null) {
    // Salva localmente primeiro
    this.saveLocal(key, data, id);
    
    // Se estiver configurado para remoto, tenta salvar remotamente
    if (this.useRemote) {
      try {
        await this.saveRemote(key, data, id);
      } catch (error) {
        console.error(`Erro ao salvar ${key} remotamente:`, error);
        this.markForSync(key);
      }
    }
    
    return true;
  }
  
  /**
   * Remove dados do armazenamento
   */
  async remove(key, id) {
    // Remove localmente
    this.removeLocal(key, id);
    
    // Se estiver configurado para remoto, tenta remover remotamente
    if (this.useRemote) {
      try {
        await this.removeRemote(key, id);
      } catch (error) {
        console.error(`Erro ao remover ${key} remotamente:`, error);
        this.markForSync(key);
      }
    }
    
    return true;
  }
  
  // Métodos de armazenamento local
  
  saveLocal(key, data, id = null) {
    try {
      if (id) {
        // Se tem ID, atualiza apenas um item em uma coleção
        const collection = this.loadLocal(key) || [];
        const index = collection.findIndex(item => item.id === id);
        
        if (index >= 0) {
          // Atualiza o item existente
          collection[index] = { ...collection[index], ...data };
        } else {
          // Adiciona novo item
          collection.push({ id, ...data });
        }
        
        localStorage.setItem(`${this.storagePrefix}${key}`, JSON.stringify(collection));
      } else {
        // Salva a coleção inteira
        localStorage.setItem(`${this.storagePrefix}${key}`, JSON.stringify(data));
      }
      return true;
    } catch (error) {
      console.error(`Erro ao salvar ${key} localmente:`, error);
      return false;
    }
  }
  
  loadLocal(key, id = null) {
    try {
      const data = localStorage.getItem(`${this.storagePrefix}${key}`);
      if (!data) return id ? null : [];
      
      const parsed = JSON.parse(data);
      
      if (id && Array.isArray(parsed)) {
        // Se tem ID, retorna apenas o item específico
        return parsed.find(item => item.id === id) || null;
      }
      
      return parsed;
    } catch (error) {
      console.error(`Erro ao carregar ${key} localmente:`, error);
      return id ? null : [];
    }
  }
  
  removeLocal(key, id = null) {
    try {
      if (id) {
        // Remove apenas um item da coleção
        const collection = this.loadLocal(key) || [];
        const updated = collection.filter(item => item.id !== id);
        localStorage.setItem(`${this.storagePrefix}${key}`, JSON.stringify(updated));
      } else {
        // Remove a coleção inteira
        localStorage.removeItem(`${this.storagePrefix}${key}`);
      }
      return true;
    } catch (error) {
      console.error(`Erro ao remover ${key} localmente:`, error);
      return false;
    }
  }
  
  // Métodos de armazenamento remoto
  
  async loadRemote(key, id = null) {
    if (!this.isRemoteConfigured()) {
      throw new Error('Configurações de armazenamento remoto não definidas');
    }
    
    const settings = state.getState('appSettings');
    let action, params;
    
    // Determina a ação e parâmetros com base na chave
    switch (key) {
      case 'events':
        action = id ? 'getEvento' : 'getEventos';
        params = id ? { eventoId: id } : {};
        break;
      case 'services':
        action = 'getServicos';
        params = { eventoId: id };
        break;
      case 'budgets':
        action = 'getOrcamentos';
        params = { eventoId: id };
        break;
      case 'providers':
        action = 'getFornecedores';
        params = id ? { fornecedorId: id } : {};
        break;
      case 'payments':
        action = 'getPagamentos';
        params = { eventoId: id };
        break;
      case 'attachments':
        action = 'getAnexos';
        params = { eventoId: id };
        break;
      case 'financialSummary':
        action = 'getResumoFinanceiro';
        params = {};
        break;
      default:
        throw new Error(`Tipo de dados não suportado: ${key}`);
    }
    
    // Adiciona o ID da planilha
    params.spreadsheetId = settings.spreadsheetId;
    params.action = action;
    
    try {
      const response = await this.makeApiRequest(settings.scriptUrl, params);
      
      if (!response.success) {
        throw new Error(response.error || `Erro ao carregar ${key}`);
      }
      
      // Mapeia as respostas para o formato esperado
      if (key === 'events') {
        return id ? response.evento : response.eventos;
      } else if (key === 'services') {
        return response.servicos;
      } else if (key === 'budgets') {
        return response.orcamentos;
      } else if (key === 'providers') {
        return id ? response.fornecedor : response.fornecedores;
      } else if (key === 'payments') {
        return response.pagamentos;
      } else if (key === 'attachments') {
        return response.anexos;
      } else if (key === 'financialSummary') {
        return response.resumo;
      }
      
      return null;
    } catch (error) {
      console.error(`Erro ao carregar ${key} remotamente:`, error);
      throw error;
    }
  }
  
  async saveRemote(key, data, id = null) {
    if (!this.isRemoteConfigured()) {
      throw new Error('Configurações de armazenamento remoto não definidas');
    }
    
    const settings = state.getState('appSettings');
    let action, params;
    
    // Determina a ação e parâmetros com base na chave e se é update ou insert
    switch (key) {
      case 'events':
        action = id ? 'atualizarEvento' : 'criarEvento';
        params = id ? { eventoId: id, evento: data } : { evento: data };
        break;
      case 'services':
        action = 'atualizarServicos';
        params = { eventoId: id, servicos: data };
        break;
      case 'budgets':
        action = id ? 'atualizarOrcamento' : 'criarOrcamento';
        params = id ? 
          { eventoId: data.eventoId, orcamentoId: id, orcamento: data } : 
          { eventoId: data.eventoId, orcamento: data };
        break;
      case 'providers':
        action = id ? 'atualizarFornecedor' : 'criarFornecedor';
        params = id ? { fornecedorId: id, fornecedor: data } : { fornecedor: data };
        break;
      case 'payments':
        action = id ? 'atualizarPagamento' : 'criarPagamento';
        params = id ? 
          { eventoId: data.eventoId, pagamentoId: id, pagamento: data } : 
          { eventoId: data.eventoId, pagamento: data };
        break;
      case 'attachments':
        action = 'criarAnexo';
        params = { eventoId: data.eventoId, anexo: data };
        break;
      default:
        throw new Error(`Tipo de dados não suportado: ${key}`);
    }
    
    // Adiciona o ID da planilha
    params.spreadsheetId = settings.spreadsheetId;
    params.action = action;
    
    try {
      const response = await this.makeApiRequest(settings.scriptUrl, params);
      
      if (!response.success) {
        throw new Error(response.error || `Erro ao salvar ${key}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao salvar ${key} remotamente:`, error);
      throw error;
    }
  }
  
  async removeRemote(key, id) {
    if (!this.isRemoteConfigured()) {
      throw new Error('Configurações de armazenamento remoto não definidas');
    }
    
    const settings = state.getState('appSettings');
    let action, params;
    
    // Determina a ação e parâmetros com base na chave
    switch (key) {
      case 'events':
        action = 'excluirEvento';
        params = { eventoId: id };
        break;
      case 'budgets':
        action = 'excluirOrcamento';
        params = { eventoId: id.eventoId, orcamentoId: id.id };
        break;
      case 'providers':
        action = 'excluirFornecedor';
        params = { fornecedorId: id };
        break;
      case 'payments':
        action = 'excluirPagamento';
        params = { eventoId: id.eventoId, pagamentoId: id.id };
        break;
      case 'attachments':
        action = 'excluirAnexo';
        params = { eventoId: id.eventoId, anexoId: id.id };
        break;
      default:
        throw new Error(`Tipo de dados não suportado: ${key}`);
    }
    
    // Adiciona o ID da planilha
    params.spreadsheetId = settings.spreadsheetId;
    params.action = action;
    
    try {
      const response = await this.makeApiRequest(settings.scriptUrl, params);
      
      if (!response.success) {
        throw new Error(response.error || `Erro ao remover ${key}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao remover ${key} remotamente:`, error);
      throw error;
    }
  }
  
  /**
   * Marca dados para sincronização posterior
   */
  markForSync(key) {
    try {
      const pendingSyncs = JSON.parse(localStorage.getItem(`${this.storagePrefix}pendingSyncs`) || '[]');
      if (!pendingSyncs.includes(key)) {
        pendingSyncs.push(key);
        localStorage.setItem(`${this.storagePrefix}pendingSyncs`, JSON.stringify(pendingSyncs));
      }
    } catch (error) {
      console.error('Erro ao marcar para sincronização:', error);
    }
  }
  
  /**
   * Verifica se há pendências de sincronização
   */
  hasPendingSyncs() {
    try {
      const pendingSyncs = JSON.parse(localStorage.getItem(`${this.storagePrefix}pendingSyncs`) || '[]');
      return pendingSyncs.length > 0;
    } catch (error) {
      console.error('Erro ao verificar sincronizações pendentes:', error);
      return false;
    }
  }
  
  /**
   * Tenta sincronizar dados pendentes
   */
  async syncPending() {
    if (!this.useRemote) return false;
    
    try {
      const pendingSyncs = JSON.parse(localStorage.getItem(`${this.storagePrefix}pendingSyncs`) || '[]');
      if (pendingSyncs.length === 0) return true;
      
      const successfulSyncs = [];
      
      for (const key of pendingSyncs) {
        try {
          const localData = this.loadLocal(key);
          if (Array.isArray(localData)) {
            for (const item of localData) {
              await this.saveRemote(key, item, item.id);
            }
          } else if (localData) {
            await this.saveRemote(key, localData);
          }
          successfulSyncs.push(key);
        } catch (error) {
          console.error(`Erro ao sincronizar ${key}:`, error);
        }
      }
      
      // Remove as sincronizações bem-sucedidas da lista de pendências
      if (successfulSyncs.length > 0) {
        const remainingSyncs = pendingSyncs.filter(key => !successfulSyncs.includes(key));
        localStorage.setItem(`${this.storagePrefix}pendingSyncs`, JSON.stringify(remainingSyncs));
      }
      
      return pendingSyncs.length === successfulSyncs.length;
    } catch (error) {
      console.error('Erro ao sincronizar pendências:', error);
      return false;
    }
  }
  
  /**
   * Método para fazer requisições à API
   */
  async makeApiRequest(url, params) {
    try {
      // Para GAS, prefira requisições GET para operações de leitura simples
      if (['login', 'getEventos', 'getEvento', 'getFornecedores', 'getFornecedor', 'testConnection'].includes(params.action)) {
        const queryString = Object.entries(params)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');
        
        const response = await fetch(`${url}?${queryString}`);
        return await response.json();
      } else {
        // Para operações de escrita, use POST
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        });
        
        return await response.json();
      }
    } catch (error) {
      console.error('Erro na requisição à API:', error);
      throw error;
    }
  }
}

export default new StorageService(); // Exporta uma instância única
// Fim do código