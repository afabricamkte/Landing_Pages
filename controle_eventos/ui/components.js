/**
 * Sistema de Gestão de Eventos - Componentes Reutilizáveis
 * Implementa componentes UI reutilizáveis para a aplicação
 */

import { formatCurrency, formatDate } from '../utils/formatters.js';

export const Components = {
  /**
   * Cria um card de evento
   */
  createEventCard(event) {
    // Determina o status visual do evento
    const today = new Date();
    const eventDate = new Date(event.date);
    const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    
    let statusClass = 'status-pending';
    let statusText = 'Pendente';
    
    if (eventDate < today) {
      statusClass = 'status-concluded';
      statusText = 'Concluído';
    } else if (daysUntil <= 30) {
      statusClass = 'status-active';
      statusText = 'Próximo';
    }
    
    // Calcula progresso do orçamento
    const currentBudget = event.currentBudget || 0;
    const budgetGoal = event.budgetGoal || 1; // Evita divisão por zero
    const budgetPercentage = Math.min(100, (currentBudget / budgetGoal) * 100);
    
    // Cria o HTML do card
    const cardHTML = `
      <div class="col-md-4 col-lg-3 mb-4">
        <div class="card card-evento evento-box" data-id="${event.id}">
          <div class="evento-status ${statusClass}"></div>
          <div class="card-header">
            <h5 class="card-title mb-0">${event.name}</h5>
          </div>
          <div class="card-body">
            <p class="card-text"><i class="bi bi-calendar-event"></i> ${formatDate(event.date)}</p>
            <p class="card-text"><i class="bi bi-people"></i> ${event.guests} convidados</p>
            <p class="card-text"><i class="bi bi-geo-alt"></i> ${event.location}</p>
            
            <div class="mt-3">
              <div class="d-flex justify-content-between">
                <small>Orçamento</small>
                <small>${formatCurrency(currentBudget)} / ${formatCurrency(budgetGoal)}</small>
              </div>
              <div class="progress mt-1">
                <div class="progress-bar" role="progressbar" style="width: ${budgetPercentage}%;" 
                  aria-valuenow="${budgetPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
          </div>
          <div class="card-footer bg-transparent">
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge ${statusClass === 'status-active' ? 'bg-success' : 
                statusClass === 'status-pending' ? 'bg-warning text-dark' : 'bg-primary'}">${statusText}</span>
              <button class="btn btn-sm btn-primary btn-ver-evento">Ver Detalhes</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    return cardHTML;
  },
  
  /**
   * Cria uma linha de tabela para orçamento
   */
  createBudgetRow(budget) {
    let statusClass = 'secondary';
    if (budget.status === 'approved') statusClass = 'success';
    if (budget.status === 'rejected') statusClass = 'danger';
    
    return `
      <tr data-id="${budget.id}">
        <td>${budget.service}</td>
        <td>${budget.provider}</td>
        <td>${formatCurrency(budget.value)}</td>
        <td>${formatDate(budget.date)}</td>
        <td><span class="badge bg-${statusClass}">${budget.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary btn-editar-orcamento">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-excluir-orcamento">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  },
  
  /**
   * Cria uma linha de tabela para fornecedor
   */
  createProviderRow(provider) {
    // Gera HTML para exibir a avaliação (estrelas)
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= provider.rating) {
        starsHTML += '<i class="bi bi-star-fill text-warning"></i>';
      } else {
        starsHTML += '<i class="bi bi-star text-secondary"></i>';
      }
    }
    
    return `
      <tr data-id="${provider.id}">
        <td>${provider.name}</td>
        <td>${provider.category}</td>
        <td>${provider.contact || '-'}</td>
        <td>${provider.email || '-'}</td>
        <td>${provider.phone || '-'}</td>
        <td>${starsHTML}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary btn-editar-fornecedor">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-excluir-fornecedor">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  },
  
  /**
   * Cria um card de anexo
   */
  createAttachmentCard(attachment) {
    let icon = 'bi-file-earmark';
    if (attachment.type === 'Orçamento') icon = 'bi-file-earmark-text';
    if (attachment.type === 'Contrato') icon = 'bi-file-earmark-ruled';
    if (attachment.type === 'Nota Fiscal') icon = 'bi-file-earmark-spreadsheet';
    
    return `
      <div class="col-md-4 col-lg-3 mb-4">
        <div class="card h-100" data-id="${attachment.id}">
          <div class="card-body text-center">
            <i class="bi ${icon}" style="font-size: 3rem; color: var(--primary-color);"></i>
            <h5 class="card-title mt-3">${attachment.title}</h5>
            <p class="card-text">
              <span class="badge bg-secondary">${attachment.type}</span>
            </p>
            <p class="card-text small">${attachment.description || ''}</p>
          </div>
          <div class="card-footer">
            <div class="d-flex justify-content-between">
              <a href="${attachment.url}" target="_blank" class="btn btn-sm btn-primary">
                <i class="bi bi-eye"></i> Visualizar
              </a>
              <button type="button" class="btn btn-sm btn-outline-danger btn-excluir-anexo">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  /**
   * Cria um item de serviço
   */
  createServiceItem(service = null) {
    if (service) {
      return `
        <div class="servico-item mb-3 p-3 border rounded" data-id="${service.id}">
          <div class="row align-items-center">
            <div class="col-md-4 mb-2 mb-md-0">
              <label class="form-label">Nome do serviço</label>
              <input type="text" class="form-control servico-nome-edit" value="${service.name}" required>
            </div>
            <div class="col-md-4 mb-2 mb-md-0">
              <label class="form-label">Descrição</label>
              <input type="text" class="form-control servico-descricao-edit" value="${service.description || ''}">
            </div>
            <div class="col-md-3 mb-2 mb-md-0">
              <label class="form-label">Status</label>
              <select class="form-select servico-status-edit">
                <option value="Pendente" ${service.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                <option value="Em andamento" ${service.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>
                <option value="Concluído" ${service.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                <option value="Cancelado" ${service.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
              </select>
            </div>
            <div class="col-md-1">
              <label class="form-label d-md-block d-none">&nbsp;</label>
              <button type="button" class="btn btn-outline-danger btn-sm btn-remover-servico-edit">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="servico-item mb-3 p-3 border rounded">
          <div class="row align-items-center">
            <div class="col-md-5 mb-2 mb-md-0">
              <input type="text" class="form-control servico-nome" placeholder="Nome do serviço" required>
            </div>
            <div class="col-md-5 mb-2 mb-md-0">
              <input type="text" class="form-control servico-descricao" placeholder="Descrição">
            </div>
            <div class="col-md-2">
              <button type="button" class="btn btn-outline-danger btn-sm btn-remover-servico">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }
};

export default Components; // Exporta os componentes para uso em outras partes da aplicação