/**
 * Sistema de Gestão de Eventos - Serviço de Eventos
 * Gerencia operações relacionadas a eventos
 */

import state from '../core/state.js';
import storage from '../core/storage.js';
import { generateId } from '../utils/helpers.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export class EventService {
  constructor() {
    // Carrega os eventos ao inicializar
    this.loadEvents();
  }
  
  /**
   * Carrega todos os eventos
   */
  async loadEvents() {
    try {
      const events = await storage.load('events') || [];
      state.setState('events', events);
      return events;
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      return [];
    }
  }
  
  /**
   * Cria um novo evento
   */
  async createEvent(eventData) {
    try {
      // Valida os dados
      this.validateEventData(eventData);
      
      // Cria o objeto do evento
      const newEvent = {
        id: generateId(),
        ...eventData,
        createdAt: new Date().toISOString(),
        createdBy: state.getState('currentUser')?.id,
        status: 'pending'
      };
      
      // Adiciona o evento à lista
      const events = state.getState('events') || [];
      events.push(newEvent);
      
      // Atualiza o estado e salva
      state.setState('events', events);
      await storage.save('events', events);
      
      return { success: true, event: newEvent };
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza um evento existente
   */
  async updateEvent(eventId, eventData) {
    try {
      // Valida os dados
      this.validateEventData(eventData);
      
      // Encontra o evento
      const events = state.getState('events') || [];
      const eventIndex = events.findIndex(e => e.id === eventId);
      
      if (eventIndex === -1) {
        throw new Error('Evento não encontrado');
      }
      
      // Atualiza o evento
      const updatedEvent = {
        ...events[eventIndex],
        ...eventData,
        updatedAt: new Date().toISOString()
      };
      
      events[eventIndex] = updatedEvent;
      
      // Atualiza o estado e salva
      state.setState('events', events);
      await storage.save('events', events);
      
      return { success: true, event: updatedEvent };
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  }
  
  /**
   * Remove um evento
   */
  async deleteEvent(eventId) {
    try {
      // Encontra o evento
      const events = state.getState('events') || [];
      const eventIndex = events.findIndex(e => e.id === eventId);
      
      if (eventIndex === -1) {
        throw new Error('Evento não encontrado');
      }
      
      // Remove o evento
      events.splice(eventIndex, 1);
      
      // Atualiza o estado e salva
      state.setState('events', events);
      await storage.save('events', events);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      throw error;
    }
  }
  
  /**
   * Obtém um evento pelo ID
   */
  getEvent(eventId) {
    const events = state.getState('events') || [];
    return events.find(e => e.id === eventId);
  }
  
  /**
   * Valida os dados do evento
   */
  validateEventData(eventData) {
    const requiredFields = ['name', 'type', 'date', 'guests', 'location', 'budgetGoal'];
    
    for (const field of requiredFields) {
      if (!eventData[field]) {
        throw new Error(`O campo ${field} é obrigatório`);
      }
    }
    
    // Validações específicas
    if (isNaN(eventData.guests) || eventData.guests < 1) {
      throw new Error('O número de convidados deve ser um número válido maior que zero');
    }
    
    if (isNaN(eventData.budgetGoal) || eventData.budgetGoal < 0) {
      throw new Error('A meta de orçamento deve ser um número válido não negativo');
    }
    
    return true;
  }
  
  /**
   * Atualiza os serviços de um evento
   */
  async updateEventServices(eventId, services) {
    try {
      // Encontra o evento
      const events = state.getState('events') || [];
      const eventIndex = events.findIndex(e => e.id === eventId);
      
      if (eventIndex === -1) {
        throw new Error('Evento não encontrado');
      }
      
      // Verifica se todos os serviços têm IDs, adicionando se necessário
      const updatedServices = services.map(service => {
        if (!service.id) {
          return { ...service, id: generateId() };
        }
        return service;
      });
      
      // Atualiza os serviços do evento
      events[eventIndex].services = updatedServices;
      events[eventIndex].updatedAt = new Date().toISOString();
      
      // Atualiza o estado e salva
      state.setState('events', events);
      await storage.save('events', events);
      
      return { success: true, services: updatedServices };
    } catch (error) {
      console.error('Erro ao atualizar serviços do evento:', error);
      throw error;
    }
  }
  
  /**
   * Obtém um resumo do estado dos eventos
   */
  getSummary() {
    const events = state.getState('events') || [];
    const today = new Date();
    
    // Conta eventos por status
    const statusCounts = {
      total: events.length,
      upcoming: 0,
      past: 0,
      pending: 0
    };
    
    // Calcular estatísticas orçamentárias
    const budgetStats = {
      totalBudget: 0,
      totalExpenses: 0,
      totalPaid: 0
    };
    
    events.forEach(event => {
      const eventDate = new Date(event.date);
      
      // Calcula o status
      if (eventDate < today) {
        statusCounts.past++;
      } else if (eventDate > today) {
        statusCounts.upcoming++;
      }
      
      if (event.status === 'pending') {
        statusCounts.pending++;
      }
      
      // Acumula valores orçamentários
      budgetStats.totalBudget += parseFloat(event.budgetGoal) || 0;
      
      // Calcula despesas e pagamentos se houver orçamentos no evento
      if (event.budgets && Array.isArray(event.budgets)) {
        event.budgets.forEach(budget => {
          if (budget.status === 'approved') {
            budgetStats.totalExpenses += parseFloat(budget.value) || 0;
          }
        });
      }
      
      // Calcula pagamentos realizados
      if (event.payments && Array.isArray(event.payments)) {
        event.payments.forEach(payment => {
          if (payment.status === 'paid') {
            budgetStats.totalPaid += parseFloat(payment.value) || 0;
          }
        });
      }
    });
    
    return {
      statusCounts,
      budgetStats
    };
  }
}

export default new EventService(); // Exporta uma instância do serviço de eventos