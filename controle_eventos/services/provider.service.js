/**
 * Sistema de Gestão de Eventos - Serviço de Fornecedores
 * Gerencia operações relacionadas a fornecedores
 */

import state from '../core/state.js';
import storage from '../core/storage.js';
import { generateId } from '../utils/helpers.js';

export class ProviderService {
  constructor() {
    // Carrega os fornecedores ao inicializar
    this.loadProviders();
  }
  
  /**
   * Carrega todos os fornecedores
   */
  async loadProviders() {
    try {
      const providers = await storage.load('providers') || [];
      state.setState('providers', providers);
      return providers;
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      return [];
    }
  }
  
  /**
   * Cria um novo fornecedor
   */
  async createProvider(providerData) {
    try {
      // Valida os dados
      this.validateProviderData(providerData);
      
      // Cria o objeto do fornecedor
      const newProvider = {
        id: generateId(),
        ...providerData,
        createdAt: new Date().toISOString(),
        rating: providerData.rating || 0
      };
      
      // Adiciona o fornecedor à lista
      const providers = state.getState('providers') || [];
      providers.push(newProvider);
      
      // Atualiza o estado e salva
      state.setState('providers', providers);
      await storage.save('providers', providers);
      
      return { success: true, provider: newProvider };
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza um fornecedor existente
   */
  async updateProvider(providerId, providerData) {
    try {
      // Valida os dados
      this.validateProviderData(providerData);
      
      // Encontra o fornecedor
      const providers = state.getState('providers') || [];
      const providerIndex = providers.findIndex(p => p.id === providerId);
      
      if (providerIndex === -1) {
        throw new Error('Fornecedor não encontrado');
      }
      
      // Atualiza o fornecedor
      const updatedProvider = {
        ...providers[providerIndex],
        ...providerData,
        updatedAt: new Date().toISOString()
      };
      
      providers[providerIndex] = updatedProvider;
      
      // Atualiza o estado e salva
      state.setState('providers', providers);
      await storage.save('providers', providers);
      
      return { success: true, provider: updatedProvider };
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      throw error;
    }
  }
  
  /**
   * Remove um fornecedor
   */
  async deleteProvider(providerId) {
    try {
      // Encontra o fornecedor
      const providers = state.getState('providers') || [];
      const providerIndex = providers.findIndex(p => p.id === providerId);
      
      if (providerIndex === -1) {
        throw new Error('Fornecedor não encontrado');
      }
      
      // Remove o fornecedor
      providers.splice(providerIndex, 1);
      
      // Atualiza o estado e salva
      state.setState('providers', providers);
      await storage.save('providers', providers);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      throw error;
    }
  }
  
  /**
   * Obtém um fornecedor pelo ID
   */
  getProvider(providerId) {
    const providers = state.getState('providers') || [];
    return providers.find(p => p.id === providerId);
  }
  
  /**
   * Valida os dados do fornecedor
   */
  validateProviderData(providerData) {
    const requiredFields = ['name', 'category'];
    
    for (const field of requiredFields) {
      if (!providerData[field]) {
        throw new Error(`O campo ${field} é obrigatório`);
      }
    }
    
    return true;
  }
  
  /**
   * Obtém fornecedores por categoria
   */
  getProvidersByCategory(category) {
    const providers = state.getState('providers') || [];
    return providers.filter(p => p.category === category);
  }
  
  /**
   * Obtém fornecedores mais bem avaliados
   */
  getTopRatedProviders(limit = 5) {
    const providers = state.getState('providers') || [];
    
    // Ordena por avaliação (rating) em ordem decrescente
    return [...providers]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }
}

export default new ProviderService(); // Exporta uma instância única do serviço