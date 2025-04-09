/**
 * Sistema de Gestão de Eventos - Controlador de UI
 * Gerencia a interação com elementos de interface
 */

import state from '../core/state.js';
import router from '../core/router.js';

// Cache de elementos DOM frequentemente usados
const elements = {};

/**
 * Inicializa o controlador de UI
 */
export function initUI() {
  // Armazena referências para elementos DOM importantes
  cacheElements();
  
  // Adiciona listeners para interações básicas
  setupEventListeners();
  
  console.log('✅ UI inicializada');
}

/**
 * Armazena referências para elementos DOM frequentemente usados
 */
function cacheElements() {
  // Seções principais
  elements.spinner = document.getElementById('spinner');
  elements.loginSection = document.getElementById('login-section');
  elements.cadastroSection = document.getElementById('cadastro-section');
  elements.appSection = document.getElementById('app-section');
  
  // Formulários
  elements.loginForm = document.getElementById('login-form');
  elements.cadastroForm = document.getElementById('cadastro-form');
  elements.novoEventoForm = document.getElementById('form-novo-evento');
  elements.eventosContainer = document.getElementById('lista-eventos');
}

/**
 * Configura os event listeners para elementos da UI
 */
function setupEventListeners() {
  // Links de navegação no header
  document.getElementById('nav-eventos')?.addEventListener('click', () => router.navigate('events'));
  document.getElementById('nav-fornecedores')?.addEventListener('click', () => router.navigate('providers'));
  document.getElementById('nav-financeiro')?.addEventListener('click', () => router.navigate('budgets'));
  document.getElementById('nav-configuracoes')?.addEventListener('click', () => router.navigate('settings'));
  
  // Navegação entre login e cadastro
  document.getElementById('link-cadastro')?.addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('register');
  });
  
  document.getElementById('link-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('login');
  });
  
  // Botões de navegação interna
  document.getElementById('btn-novo-evento')?.addEventListener('click', () => router.navigate('new-event'));
  document.getElementById('btn-primeiro-evento')?.addEventListener('click', () => router.navigate('new-event'));
  document.getElementById('btn-voltar-eventos')?.addEventListener('click', () => router.navigate('events'));
  document.getElementById('btn-voltar-detalhes')?.addEventListener('click', () => router.navigate('events'));
}

/**
 * Mostra o spinner de carregamento
 */
export function showSpinner() {
  if (elements.spinner) {
    elements.spinner.style.display = 'flex';
  }
}

/**
 * Esconde o spinner de carregamento
 */
export function hideSpinner() {
  if (elements.spinner) {
    elements.spinner.style.display = 'none';
  }
}

/**
 * Exibe uma mensagem para o usuário
 * @param {HTMLElement} container - Elemento onde a mensagem será exibida
 * @param {string} message - Texto da mensagem
 * @param {string} type - Tipo da mensagem (success, danger, warning, info)
 */
export function showMessage(container, message, type = 'danger') {
  if (!container) return;
  
  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    </div>
  `;
  
  // Scroll até a mensagem
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Mostra modal com mensagem
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de alerta (success, danger, warning, info)
 */
export function showModal(message, type = 'danger') {
  const modalTitle = {
    'success': 'Sucesso',
    'danger': 'Erro',
    'warning': 'Atenção',
    'info': 'Informação'
  };
  
  document.getElementById('mensagem-alerta').innerHTML = message;
  document.getElementById('modal-alerta-label').textContent = modalTitle[type] || 'Aviso';
  
  // Adiciona classe de cor ao modal
  const modalAlerta = document.getElementById('modal-alerta');
  modalAlerta.classList.remove('modal-success', 'modal-danger', 'modal-warning', 'modal-info');
  modalAlerta.classList.add(`modal-${type}`);
  
  const modal = new bootstrap.Modal(document.getElementById('modal-alerta'));
  modal.show();
}

/**
 * Mostra modal de confirmação para ações destrutivas
 * @param {string} message - Mensagem de confirmação
 * @param {Function} confirmCallback - Função a ser executada quando confirmar
 */
export function showConfirmModal(message, confirmCallback) {
  document.getElementById('mensagem-confirmacao').textContent = message;
  
  const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
  
  // Remove qualquer listener anterior para evitar duplicação
  const novoBtn = btnConfirmar.cloneNode(true);
  btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
  
  // Adiciona o listener para o botão de confirmação
  novoBtn.addEventListener('click', async function() {
    try {
      showSpinner();
      await confirmCallback();
      
      // Fecha o modal
      const modalConfirmacao = bootstrap.Modal.getInstance(document.getElementById('modal-confirmacao'));
      modalConfirmacao.hide();
      
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      showModal('Erro ao executar ação: ' + error.message, 'danger');
    } finally {
      hideSpinner();
    }
  });
  
  // Mostra o modal de confirmação
  const modalConfirmacao = new bootstrap.Modal(document.getElementById('modal-confirmacao'));
  modalConfirmacao.show();
}

/**
 * Verifica se um formulário é válido
 * @param {HTMLFormElement} form - Formulário a ser validado
 * @returns {boolean} - Verdadeiro se o formulário for válido
 */
export function validateForm(form) {
  const campos = form.querySelectorAll('[required]');
  let valido = true;
  
  campos.forEach(campo => {
    if (!campo.value.trim()) {
      campo.classList.add('is-invalid');
      valido = false;
    } else {
      campo.classList.remove('is-invalid');
    }
  });
  
  return valido;
}

export default {
  initUI,
  showSpinner,
  hideSpinner,
  showMessage,
  showModal,
  showConfirmModal,
  validateForm
};  // Exporta as funções para uso em outros módulos