/**
 * Sistema de Gestão de Eventos - Gerenciamento de Estado
 * Implementa um padrão de gerenciamento de estado centralizado
 */

export class StateManager {
    constructor() {
      this.state = {
        currentUser: null,
        events: [],
        budgets: {},
        providers: [],
        currentView: 'login',
        isConfigured: false,
        appSettings: {
          spreadsheetId: '',
          scriptUrl: ''
        }
      };
      
      this.listeners = {
        'user': [],
        'events': [],
        'budgets': [],
        'providers': [],
        'view': [],
        'settings': []
      };
      
      // Tenta carregar o estado do localStorage
      this.loadFromStorage();
    }
    
    /**
     * Atualiza o estado e notifica os listeners
     */
    setState(key, value) {
      this.state[key] = value;
      this.notifyListeners(key);
      this.saveToStorage();
    }
    
    /**
     * Obtém o valor atual de uma propriedade do estado
     */
    getState(key) {
      return this.state[key];
    }
    
    /**
     * Adiciona um listener para mudanças em uma parte específica do estado
     */
    subscribe(key, callback) {
      if (this.listeners[key]) {
        this.listeners[key].push(callback);
        // Executa imediatamente com o estado atual
        callback(this.state[key]);
        return () => this.unsubscribe(key, callback);
      }
      return null;
    }
    
    /**
     * Remove um listener
     */
    unsubscribe(key, callback) {
      if (this.listeners[key]) {
        this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
      }
    }
    
    /**
     * Notifica todos os listeners de uma propriedade
     */
    notifyListeners(key) {
      if (this.listeners[key]) {
        this.listeners[key].forEach(callback => callback(this.state[key]));
      }
    }
    
    /**
     * Salva o estado atual no localStorage
     */
    saveToStorage() {
      try {
        localStorage.setItem('eventApp_state', JSON.stringify(this.state));
      } catch (error) {
        console.error('Erro ao salvar estado:', error);
      }
    }
    
    /**
     * Carrega o estado do localStorage
     */
    loadFromStorage() {
      try {
        const savedState = localStorage.getItem('eventApp_state');
        if (savedState) {
          this.state = JSON.parse(savedState);
          // Notifica todos os listeners
          Object.keys(this.listeners).forEach(key => this.notifyListeners(key));
        }
      } catch (error) {
        console.error('Erro ao carregar estado:', error);
      }
    }
    
    /**
     * Limpa o estado (logout)
     */
    clearState() {
      this.state = {
        currentUser: null,
        events: [],
        budgets: {},
        providers: [],
        currentView: 'login',
        isConfigured: this.state.isConfigured,
        appSettings: this.state.appSettings
      };
      
      this.saveToStorage();
      // Notifica todos os listeners
      Object.keys(this.listeners).forEach(key => this.notifyListeners(key));
    }
  }
  
  // Exporta uma instância única do gerenciador de estado
  export default new StateManager();   // Fim do código