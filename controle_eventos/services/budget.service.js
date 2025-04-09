/**
 * Sistema de Gestão de Eventos - Serviço de Orçamentos
 * Gerencia operações relacionadas a orçamentos
 */

import state from '../core/state.js';
import storage from '../core/storage.js';
import { generateId } from '../utils/helpers.js';

export class BudgetService {
  constructor() {
    // Inicializa a estrutura de orçamentos no estado se necessário
    if (!state.getState('budgets')) {
      state.setState('budgets', {});
    }
  }
  
  /**
   * Carrega os orçamentos de um evento
   */
  async loadEventBudgets(eventId) {
    try {
      // Busca todos os orçamentos
      const allBudgets = await storage.load('budgets') || {};
      
      // Atualiza o estado
      state.setState('budgets', allBudgets);
      
      // Retorna apenas os orçamentos do evento especificado
      return allBudgets[eventId] || [];
    } catch (error) {
      console.error(`Erro ao carregar orçamentos do evento ${eventId}:`, error);
      return [];
    }
  }
  
  /**
   * Cria um novo orçamento
   */
  async createBudget(eventId, budgetData) {
    try {
      // Valida os dados
      this.validateBudgetData(budgetData);
      
      // Cria o objeto do orçamento
      const newBudget = {
        id: generateId(),
        ...budgetData,
        createdAt: new Date().toISOString(),
        status: budgetData.status || 'pending'
      };
      
      // Carrega os orçamentos atuais
      const allBudgets = state.getState('budgets') || {};
      const eventBudgets = allBudgets[eventId] || [];
      
      // Adiciona o novo orçamento
      eventBudgets.push(newBudget);
      allBudgets[eventId] = eventBudgets;
      
      // Atualiza o estado e salva
      state.setState('budgets', allBudgets);
      await storage.save('budgets', allBudgets);
      
      return { success: true, budget: newBudget };
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza um orçamento existente
   */
  async updateBudget(eventId, budgetId, budgetData) {
    try {
      // Valida os dados
      this.validateBudgetData(budgetData);
      
      // Carrega os orçamentos atuais
      const allBudgets = state.getState('budgets') || {};
      const eventBudgets = allBudgets[eventId] || [];
      
      // Encontra o orçamento
      const budgetIndex = eventBudgets.findIndex(b => b.id === budgetId);
      
      if (budgetIndex === -1) {
        throw new Error('Orçamento não encontrado');
      }
      
      // Atualiza o orçamento
      const updatedBudget = {
        ...eventBudgets[budgetIndex],
        ...budgetData,
        updatedAt: new Date().toISOString()
      };
      
      eventBudgets[budgetIndex] = updatedBudget;
      allBudgets[eventId] = eventBudgets;
      
      // Atualiza o estado e salva
      state.setState('budgets', allBudgets);
      await storage.save('budgets', allBudgets);
      
      return { success: true, budget: updatedBudget };
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw error;
    }
  }
  
  /**
   * Remove um orçamento
   */
  async deleteBudget(eventId, budgetId) {
    try {
      // Carrega os orçamentos atuais
      const allBudgets = state.getState('budgets') || {};
      const eventBudgets = allBudgets[eventId] || [];
      
      // Encontra o orçamento
      const budgetIndex = eventBudgets.findIndex(b => b.id === budgetId);
      
      if (budgetIndex === -1) {
        throw new Error('Orçamento não encontrado');
      }
      
      // Remove o orçamento
      eventBudgets.splice(budgetIndex, 1);
      allBudgets[eventId] = eventBudgets;
      
      // Atualiza o estado e salva
      state.setState('budgets', allBudgets);
      await storage.save('budgets', allBudgets);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      throw error;
    }
  }
  
  /**
   * Obtém um orçamento pelo ID
   */
  getBudget(eventId, budgetId) {
    const allBudgets = state.getState('budgets') || {};
    const eventBudgets = allBudgets[eventId] || [];
    
    return eventBudgets.find(b => b.id === budgetId);
  }
  
  /**
   * Valida os dados do orçamento
   */
  validateBudgetData(budgetData) {
    const requiredFields = ['service', 'provider', 'value', 'date'];
    
    for (const field of requiredFields) {
      if (!budgetData[field]) {
        throw new Error(`O campo ${field} é obrigatório`);
      }
    }
    
    // Validações específicas
    if (isNaN(parseFloat(budgetData.value)) || parseFloat(budgetData.value) <= 0) {
      throw new Error('O valor deve ser um número válido maior que zero');
    }
    
    return true;
  }
  
  /**
   * Obtém estatísticas de orçamento para um evento
   */
  getEventBudgetStats(eventId) {
    const allBudgets = state.getState('budgets') || {};
    const eventBudgets = allBudgets[eventId] || [];
    
    // Calcula valores totais
    const stats = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      count: eventBudgets.length
    };
    
    // Calcula por status
    eventBudgets.forEach(budget => {
      const value = parseFloat(budget.value) || 0;
      
      if (budget.status === 'approved') {
        stats.approved += value;
      } else if (budget.status === 'pending') {
        stats.pending += value;
      } else if (budget.status === 'rejected') {
        stats.rejected += value;
      }
      
      stats.total += value;
    });
    
    return stats;
  }
  
  /**
   * Obtém todos os orçamentos pendentes
   */
  getPendingBudgets() {
    const allBudgets = state.getState('budgets') || {};
    const events = state.getState('events') || [];
    const pendingBudgets = [];
    
    // Mapeia os eventos por ID para facilitar a referência
    const eventsMap = {};
    events.forEach(event => {
      eventsMap[event.id] = event;
    });
    
    // Encontra todos os orçamentos pendentes
    Object.keys(allBudgets).forEach(eventId => {
      const eventBudgets = allBudgets[eventId] || [];
      
      eventBudgets.forEach(budget => {
        if (budget.status === 'pending') {
          pendingBudgets.push({
            ...budget,
            eventId,
            eventName: eventsMap[eventId]?.name || 'Evento Desconhecido'
          });
        }
      });
    });
    
    return pendingBudgets;
  }
}

export default new BudgetService(); // Exporta uma instância única do serviço de orçamentos