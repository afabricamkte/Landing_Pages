/**
 * Sistema de Gestão de Eventos - Inicialização da Aplicação
 * Arquivo principal que coordena a inicialização de todos os módulos
 */

// Importa os módulos centrais
import state from '../core/state.js';
import router from '../core/router.js';
import storage from '../core/storage.js';

// Importa serviços
import authService from '../services/auth.service.js';
import eventService from '../services/event.service.js';
import budgetService from '../services/budget.service.js';
import providerService from '../services/provider.service.js';

// Importa os módulos de UI
import uiController from '../ui/ui-controller.js';
import components from '../ui/components.js';

// Importa utilitários
import helpers from './utils/helpers.js';
import formatters from '../utils/formatters.js';

/**
 * Inicialização da aplicação
 */
async function initApp() {
  console.log('🚀 Inicializando aplicação...');
  
  try {
    // Inicializa a interface
    uiController.initUI();
    
    // Exibe o spinner durante a inicialização
    uiController.showSpinner();
    
    // Carrega configurações
    loadAppSettings();
    
    // Verifica se há usuário logado
    const currentUser = authService.checkSession();
    
    // Verifica se há sincronizações pendentes
    if (storage.hasPendingSyncs() && storage.isRemoteConfigured()) {
      console.log('📡 Sincronizando dados pendentes...');
      await storage.syncPending();
    }
    
    // Decide qual página mostrar inicialmente
    if (currentUser) {
      console.log('✅ Usuário autenticado:', currentUser.name);
      
      // Carrega dados iniciais
      await eventService.loadEvents();
      await providerService.loadProviders();
      
      // Navega para a página de eventos
      router.navigate('events');
    } else {
      console.log('ℹ️ Nenhum usuário autenticado');
      
      // Verifica se é o primeiro acesso (admin)
      const isFirstAccess = !localStorage.getItem('adminEmail');
      
      if (isFirstAccess) {
        console.log('🆕 Primeiro acesso detectado');
        router.navigate('register');
      } else {
        router.navigate('login');
      }
    }
    
    // Configura manipuladores de eventos globais
    setupGlobalEventHandlers();
    
    console.log('✅ Aplicação inicializada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar a aplicação:', error);
    
    // Mostra mensagem de erro na tela principal
    const errorContainer = document.createElement('div');
    errorContainer.className = 'container mt-5';
    errorContainer.innerHTML = `
      <div class="alert alert-danger">
        <h4>Erro ao inicializar o aplicativo</h4>
        <p>${error.message}</p>
        <button class="btn btn-primary mt-2" onclick="location.reload()">Tentar novamente</button>
      </div>
    `;
    
    document.body.appendChild(errorContainer);
  } finally {
    // Esconde o spinner após a inicialização
    uiController.hideSpinner();
  }
}

/**
 * Carrega as configurações da aplicação
 */
function loadAppSettings() {
  try {
    const settingsJson = localStorage.getItem('eventApp_appSettings');
    if (settingsJson) {
      const settings = JSON.parse(settingsJson);
      state.setState('appSettings', settings);
      console.log('⚙️ Configurações carregadas:', settings);
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
}

/**
 * Configura manipuladores de eventos globais
 */
function setupGlobalEventHandlers() {
  // Manipulador de erros global
  window.addEventListener('error', function(event) {
    console.error('Erro global capturado:', event.error);
    uiController.showModal('Ocorreu um erro inesperado: ' + (event.error?.message || 'Erro desconhecido'), 'danger');
    return false;
  });
  
  // Manipulador para o botão de logout
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    authService.logout();
  });
  
  // Manipulador para o formulário de login
  document.getElementById('login-form')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-senha').value;
    
    if (!email || !password) {
      uiController.showMessage(document.getElementById('login-mensagem'), 'Preencha todos os campos', 'warning');
      return;
    }
    
    try {
      uiController.showSpinner();
      await authService.login(email, password);
      
      // Carrega dados iniciais
      await eventService.loadEvents();
      await providerService.loadProviders();
      
      router.navigate('events');
    } catch (error) {
      uiController.showMessage(document.getElementById('login-mensagem'), error.message, 'danger');
    } finally {
      uiController.hideSpinner();
    }
  });
  
  // Manipulador para o formulário de cadastro
  document.getElementById('cadastro-form')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const name = document.getElementById('cadastro-nome').value;
    const email = document.getElementById('cadastro-email').value;
    const password = document.getElementById('cadastro-senha').value;
    const confirmPassword = document.getElementById('cadastro-confirma-senha').value;
    
    try {
      uiController.showSpinner();
      const result = await authService.register(name, email, password, confirmPassword);
      
      if (result.success && result.user) {
        // Se retornou usuário, já está logado
        // Carrega dados iniciais
        await eventService.loadEvents();
        await providerService.loadProviders();
        
        router.navigate('events');
      } else {
        uiController.showMessage(document.getElementById('cadastro-mensagem'), 'Usuário cadastrado com sucesso!', 'success');
        setTimeout(() => router.navigate('login'), 2000);
      }
    } catch (error) {
      uiController.showMessage(document.getElementById('cadastro-mensagem'), error.message, 'danger');
    } finally {
      uiController.hideSpinner();
    }
  });
  
  // Formulário de configurações
  document.getElementById('form-configuracoes')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const scriptUrl = document.getElementById('script-url').value.trim();
    const spreadsheetId = document.getElementById('planilha-id').value.trim();
    
    if (!scriptUrl || !spreadsheetId) {
      uiController.showModal('Preencha todos os campos obrigatórios', 'warning');
      return;
    }
    
    try {
      uiController.showSpinner();
      
      // Salva as configurações
      storage.saveAppSettings(scriptUrl, spreadsheetId);
      
      uiController.showModal('Configurações salvas com sucesso!', 'success');
    } catch (error) {
      uiController.showModal('Erro ao salvar configurações: ' + error.message, 'danger');
    } finally {
      uiController.hideSpinner();
    }
  });
  
  // Botão de testar conexão
  document.getElementById('btn-teste-conexao')?.addEventListener('click', async function() {
    const scriptUrl = document.getElementById('script-url').value.trim();
    const spreadsheetId = document.getElementById('planilha-id').value.trim();
    
    if (!scriptUrl || !spreadsheetId) {
      uiController.showModal('Preencha todos os campos antes de testar a conexão', 'warning');
      return;
    }
    
    try {
      uiController.showSpinner();
      
      // Salva temporariamente as configurações
      storage.saveAppSettings(scriptUrl, spreadsheetId);
      
      // Testa a conexão
      const success = await storage.testConnection();
      
      if (success) {
         uiController.showModal('Conexão estabelecida com sucesso!', 'success');
          } else {
            uiController.showModal('Falha ao estabelecer conexão. Verifique as configurações.', 'warning');
          }
        } catch (error) {
          uiController.showModal('Erro ao testar conexão: ' + error.message, 'danger');
        } finally {
          uiController.hideSpinner();
        }
      });
      
      // Formulário de criação de eventos
      document.getElementById('form-novo-evento')?.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        if (!uiController.validateForm(this)) {
          uiController.showModal('Preencha todos os campos obrigatórios', 'warning');
          return;
        }
        
        try {
          uiController.showSpinner();
          
          // Coleta dados do formulário
          const eventData = {
            name: document.getElementById('nome-evento').value,
            type: document.getElementById('tipo-evento').value,
            date: document.getElementById('data-evento').value,
            guests: parseInt(document.getElementById('numero-convidados').value),
            location: document.getElementById('local-evento').value,
            budgetGoal: parseFloat(document.getElementById('orcamento-meta').value),
            description: document.getElementById('descricao-evento').value || ''
          };
          
          // Coleta serviços
          const services = [];
          document.querySelectorAll('.servico-item').forEach(item => {
            const name = item.querySelector('.servico-nome')?.value;
            const description = item.querySelector('.servico-descricao')?.value;
            
            if (name) {
              services.push({
                id: helpers.generateId(),
                name,
                description: description || '',
                status: 'Pendente'
              });
            }
          });
          
          eventData.services = services;
          
          // Cria o evento
          const result = await eventService.createEvent(eventData);
          
          if (result.success) {
            uiController.showModal('Evento criado com sucesso!', 'success');
            this.reset();
            router.navigate('events');
          }
        } catch (error) {
          uiController.showModal('Erro ao criar evento: ' + error.message, 'danger');
        } finally {
          uiController.hideSpinner();
        }
      });
      
      // Formulário de edição de evento
      document.getElementById('form-edicao-evento')?.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        if (!uiController.validateForm(this)) {
          uiController.showModal('Preencha todos os campos obrigatórios', 'warning');
          return;
        }
        
        try {
          uiController.showSpinner();
          
          const eventId = state.getState('currentEventId');
          if (!eventId) {
            throw new Error('Evento não selecionado');
          }
          
          // Coleta dados do formulário
          const eventData = {
            name: document.getElementById('edit-nome-evento').value,
            type: document.getElementById('edit-tipo-evento').value,
            date: document.getElementById('edit-data-evento').value,
            guests: parseInt(document.getElementById('edit-numero-convidados').value),
            location: document.getElementById('edit-local-evento').value,
            budgetGoal: parseFloat(document.getElementById('edit-orcamento-meta').value),
            description: document.getElementById('edit-descricao-evento').value || ''
          };
          
          // Atualiza o evento
          const result = await eventService.updateEvent(eventId, eventData);
          
          if (result.success) {
            uiController.showModal('Evento atualizado com sucesso!', 'success');
            
            // Atualiza o título da página
            document.getElementById('titulo-evento').textContent = eventData.name;
          }
        } catch (error) {
          uiController.showModal('Erro ao atualizar evento: ' + error.message, 'danger');
        } finally {
          uiController.hideSpinner();
        }
      });
      
      // Botões de navegação para detalhes do evento
      document.addEventListener('click', function(event) {
        if (event.target.closest('.btn-ver-evento')) {
          const eventCard = event.target.closest('.card-evento');
          if (eventCard) {
            const eventId = eventCard.dataset.id;
            if (eventId) {
              state.setState('currentEventId', eventId);
              eventService.loadEventDetails(eventId);
              router.navigate('event-details');
            }
          }
        }
      });
      
      // Botão para salvar serviços
      document.getElementById('btn-salvar-servicos')?.addEventListener('click', async function() {
        try {
          uiController.showSpinner();
          
          const eventId = state.getState('currentEventId');
          if (!eventId) {
            throw new Error('Evento não selecionado');
          }
          
          // Coleta os serviços da interface
          const services = [];
          document.querySelectorAll('#servicos-edit-container .servico-item').forEach(item => {
            const id = item.dataset.id;
            const name = item.querySelector('.servico-nome-edit').value;
            const description = item.querySelector('.servico-descricao-edit').value;
            const status = item.querySelector('.servico-status-edit').value;
            
            if (name) {
              services.push({
                id,
                name,
                description,
                status
              });
            }
          });
          
          // Atualiza os serviços
          const result = await eventService.updateEventServices(eventId, services);
          
          if (result.success) {
            uiController.showModal('Serviços atualizados com sucesso!', 'success');
          }
        } catch (error) {
          uiController.showModal('Erro ao atualizar serviços: ' + error.message, 'danger');
        } finally {
          uiController.hideSpinner();
        }
      });
      
      // Botão de adicionar serviço na edição
      document.getElementById('btn-adicionar-servico-edit')?.addEventListener('click', function() {
        const container = document.getElementById('servicos-edit-container');
        const serviceHtml = components.createServiceItem();
        container.insertAdjacentHTML('beforeend', serviceHtml);
        
        // Adiciona evento para o botão de remover
        const removeButton = container.lastElementChild.querySelector('.btn-remover-servico-edit');
        if (removeButton) {
          removeButton.addEventListener('click', function() {
            this.closest('.servico-item').remove();
          });
        }
      });
      
      // Botão de adicionar serviço no novo evento
      document.getElementById('btn-adicionar-servico')?.addEventListener('click', function() {
        const container = document.getElementById('servicos-container');
        const serviceHtml = components.createServiceItem();
        container.insertAdjacentHTML('beforeend', serviceHtml);
        
        // Adiciona evento para o botão de remover
        const removeButton = container.lastElementChild.querySelector('.btn-remover-servico');
        if (removeButton) {
          removeButton.addEventListener('click', function() {
            this.closest('.servico-item').remove();
          });
        }
      });
      
      // Formulário de configurações do usuário
      document.getElementById('nav-usuarios')?.addEventListener('click', async function() {
        if (!authService.isUserAdmin()) {
          uiController.showModal('Apenas administradores podem acessar esta área', 'warning');
          return;
        }
        
        try {
          uiController.showSpinner();
          await loadUsers();
          router.navigate('usuarios-section');
        } catch (error) {
          uiController.showModal('Erro ao carregar usuários: ' + error.message, 'danger');
        } finally {
          uiController.hideSpinner();
        }
      });
      
      // Botão de novo usuário
      document.getElementById('btn-novo-usuario')?.addEventListener('click', function() {
        if (!authService.isUserAdmin()) {
          uiController.showModal('Apenas administradores podem adicionar usuários', 'warning');
          return;
        }
        
        document.getElementById('form-usuario').reset();
        document.getElementById('usuario-id').value = '';
        
        const modal = new bootstrap.Modal(document.getElementById('modal-usuario'));
        modal.show();
      });
      
      // Formulário de criação de usuário
      document.getElementById('form-usuario')?.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        if (!authService.isUserAdmin()) {
          uiController.showModal('Apenas administradores podem adicionar usuários', 'warning');
          return;
        }
        
        const name = document.getElementById('novo-usuario-nome').value;
        const email = document.getElementById('novo-usuario-email').value;
        const password = document.getElementById('novo-usuario-senha').value;
        
        if (!name || !email || !password) {
          uiController.showMessage(document.getElementById('form-usuario').parentNode, 'Preencha todos os campos', 'warning');
          return;
        }
        
        try {
          uiController.showSpinner();
          const result = await authService.register(name, email, password, password);
          
          if (result.success) {
            // Fecha o modal
            const modalUsuario = bootstrap.Modal.getInstance(document.getElementById('modal-usuario'));
            modalUsuario.hide();
            
            uiController.showModal('Usuário adicionado com sucesso!', 'success');
            
            // Recarrega a lista de usuários
            await loadUsers();
          }
        } catch (error) {
          uiController.showMessage(document.getElementById('form-usuario').parentNode, error.message, 'danger');
        } finally {
          uiController.hideSpinner();
        }
      });
    }
    
    /**
     * Carrega a lista de usuários
     */
    async function loadUsers() {
      try {
        if (!authService.isUserAdmin()) {
          uiController.showMessage(document.getElementById('usuarios-mensagem') || document, 
                                 'Acesso negado. Apenas administradores podem gerenciar usuários.', 
                                 'danger');
          return;
        }
        
        uiController.showSpinner();
        const users = await authService.listUsers();
        
        const listaUsuarios = document.getElementById('lista-usuarios');
        if (!listaUsuarios) return;
        
        listaUsuarios.innerHTML = '';
        
        if (users && users.length > 0) {
          users.forEach(user => {
            const userHtml = `
              <tr data-id="${user.id}">
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.isAdmin ? 'Sim' : 'Não'}</td>
                <td>${formatters.formatDate(user.createdAt)}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger btn-excluir-usuario" ${user.isAdmin ? 'disabled' : ''}>
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            `;
            
            listaUsuarios.insertAdjacentHTML('beforeend', userHtml);
          });
          
          // Adiciona evento para exclusão de usuário
          document.querySelectorAll('.btn-excluir-usuario:not([disabled])').forEach(btn => {
            btn.addEventListener('click', async function() {
              const userId = this.closest('tr').dataset.id;
              const userName = this.closest('tr').cells[0].textContent;
              
              uiController.showConfirmModal(`Tem certeza que deseja excluir o usuário "${userName}"?`, async () => {
                try {
                  await authService.removeUser(userId);
                  uiController.showModal('Usuário excluído com sucesso!', 'success');
                  await loadUsers();
                } catch (error) {
                  uiController.showModal('Erro ao excluir usuário: ' + error.message, 'danger');
                }
              });
            });
          });
        } else {
          listaUsuarios.innerHTML = `
            <tr>
              <td colspan="5" class="text-center">Nenhum usuário cadastrado além do administrador.</td>
            </tr>
          `;
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        uiController.showMessage(document.getElementById('usuarios-mensagem') || document,
                               'Erro ao carregar usuários: ' + error.message,
                               'danger');
      } finally {
        uiController.hideSpinner();
      }
    }
    
    // Inicia a aplicação quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', initApp);
    
    // Exporta os módulos para acesso global (depuração)
    window.app = {
      state,
      router,
      storage,
      authService,
      eventService,
      budgetService,
      providerService,
      uiController,
      components,
      helpers,
      formatters
    };