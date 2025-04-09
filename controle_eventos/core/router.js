/**
 * Sistema de Gestão de Eventos - Roteador
 * Gerencia a navegação entre as diferentes páginas da aplicação
 */

import state from './state.js';

export class Router {
  constructor() {
    this.routes = {
      'login': this.showLogin.bind(this),
      'register': this.showRegister.bind(this),
      'events': this.showEvents.bind(this),
      'event-details': this.showEventDetails.bind(this),
      'new-event': this.showNewEvent.bind(this),
      'providers': this.showProviders.bind(this),
      'budgets': this.showBudgets.bind(this),
      'settings': this.showSettings.bind(this)
    };
    
    // Escuta mudanças na visualização atual
    state.subscribe('view', this.handleViewChange.bind(this));
    state.subscribe('currentUser', this.handleUserChange.bind(this));
  }
  
  /**
   * Navega para uma rota específica
   */
  navigate(routeName, params = {}) {
    state.setState('routeParams', params);
    state.setState('view', routeName);
  }
  
  /**
   * Manipula mudanças na visualização atual
   */
  handleViewChange(view) {
    // Esconde todas as seções
    document.querySelectorAll('.page-section').forEach(section => {
      section.classList.remove('active-section');
      section.style.display = 'none';
    });
    
    // Executa a função da rota atual
    if (this.routes[view]) {
      this.routes[view]();
    } else {
      console.error('Rota não encontrada:', view);
      // Redireciona para login como fallback
      this.navigate('login');
    }
  }
  
  /**
   * Manipula mudanças no usuário atual (login/logout)
   */
  handleUserChange(user) {
    const currentView = state.getState('view');
    
    // Se não há usuário e não está em login/registro, redireciona para login
    if (!user && !['login', 'register'].includes(currentView)) {
      this.navigate('login');
      return;
    }
    
    // Se há um usuário e está em login/registro, redireciona para eventos
    if (user && ['login', 'register'].includes(currentView)) {
      this.navigate('events');
      return;
    }
  }
  
  // Implementação das funções de rota
  
  showLogin() {
    document.getElementById('login-section').classList.add('active-section');
    document.getElementById('login-section').style.display = 'block';
  }
  
  showRegister() {
    document.getElementById('cadastro-section').classList.add('active-section');
    document.getElementById('cadastro-section').style.display = 'block';
    
    // Verifica se é o primeiro acesso
    const primeiroAcesso = document.querySelector('.primeiro-acesso');
    if (primeiroAcesso) {
      const isFirstAccess = !localStorage.getItem('adminEmail');
      primeiroAcesso.style.display = isFirstAccess ? 'block' : 'none';
    }
  }
  
  showEvents() {
    document.getElementById('app-section').classList.add('active-section');
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('eventos-section').classList.add('active-section');
    document.getElementById('eventos-section').style.display = 'block';
  }
  
  showEventDetails() {
    document.getElementById('app-section').classList.add('active-section');
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('detalhes-evento-section').classList.add('active-section');
    document.getElementById('detalhes-evento-section').style.display = 'block';
  }
  
  showNewEvent() {
    document.getElementById('app-section').classList.add('active-section');
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('novo-evento-section').classList.add('active-section');
    document.getElementById('novo-evento-section').style.display = 'block';
  }
  
  showProviders() {
    document.getElementById('app-section').classList.add('active-section');
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('fornecedores-section').classList.add('active-section');
    document.getElementById('fornecedores-section').style.display = 'block';
  }
  
  showBudgets() {
    // Exibe a seção de detalhes de evento com a aba de orçamentos ativa
    this.showEventDetails();
    const tab = document.getElementById('orcamentos-tab');
    if (tab) {
      tab.click();
    }
  }
  
  showSettings() {
    document.getElementById('app-section').classList.add('active-section');
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('configuracoes-section').classList.add('active-section');
    document.getElementById('configuracoes-section').style.display = 'block';
  }
}

export default new Router();