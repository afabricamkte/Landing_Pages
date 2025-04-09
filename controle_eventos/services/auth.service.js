/**
 * Sistema de Gestão de Eventos - Serviço de Autenticação
 * Gerencia login, logout e cadastro de usuários
 */

import state from '../core/state.js';
import storage from '../core/storage.js';
import router from '../core/router.js';
import { showMessage } from '../ui/ui-controller.js';
import { generateId } from '../utils/helpers.js';

export class AuthService {
  constructor() {
    this.minPasswordLength = 6;
    this.sessionDuration = 24 * 60 * 60 * 1000; // 24 horas
    
    // Verifica se existe um usuário na sessão
    this.checkSession();
  }
  
  /**
   * Registra um novo usuário
   */
  async register(name, email, password, confirmPassword) {
    // Validações
    if (!name || !email || !password || !confirmPassword) {
      throw new Error('Todos os campos são obrigatórios');
    }
    
    if (password !== confirmPassword) {
      throw new Error('As senhas não conferem');
    }
    
    if (password.length < this.minPasswordLength) {
      throw new Error(`A senha deve ter pelo menos ${this.minPasswordLength} caracteres`);
    }
    
    // Verifica se é o primeiro acesso (criação do admin)
    const isFirstAccess = !localStorage.getItem('adminEmail');
    
    // Adapta o formato do usuário para o Google Apps Script
    const userData = {
      nome: name,
      email,
      senha: password,
      isAdmin: isFirstAccess // Primeiro usuário sempre é admin
    };
    
    try {
      // Tenta usar o armazenamento remoto se estiver configurado
      if (storage.isRemoteConfigured()) {
        const token = isFirstAccess ? 'first_admin' : state.getState('currentUser')?.id;
        const response = await storage.manageUsers('adicionarUsuario', userData, token);
        
        if (!response.success) {
          throw new Error(response.error || 'Erro ao cadastrar usuário');
        }
        
        // Se for primeiro acesso, salva referência local
        if (isFirstAccess) {
          localStorage.setItem('adminEmail', email);
          localStorage.setItem('adminName', name);
          
          // Faz login após o cadastro
          return this.login(email, password);
        }
        
        return { success: true, message: 'Usuário cadastrado com sucesso' };
      } else {
        // Fallback para o localStorage
        if (isFirstAccess) {
          // Salva o admin no localStorage
          localStorage.setItem('adminEmail', email);
          localStorage.setItem('adminName', name);
          localStorage.setItem('adminPassword', password);
          
          // Cria um objeto de usuário admin
          const adminUser = {
            id: generateId(),
            name,
            email,
            isAdmin: true,
            createdAt: new Date().toISOString()
          };
          
          // Salva na sessão
          this.setUserSession(adminUser);
          
          return { success: true, user: adminUser };
        } else {
          // Verificar se o usuário logado é admin
          const currentUser = state.getState('currentUser');
          if (!currentUser || !currentUser.isAdmin) {
            throw new Error('Apenas administradores podem adicionar usuários');
          }
          
          // Obter lista de usuários existente
          const users = JSON.parse(localStorage.getItem('eventApp_users') || '[]');
          
          // Verificar se o email já existe
          if (users.some(u => u.email === email)) {
            throw new Error('Este email já está cadastrado');
          }
          
          // Criar o novo usuário
          const newUser = {
            id: generateId(),
            name,
            email, 
            password,
            isAdmin: false,
            createdAt: new Date().toISOString()
          };
          
          // Adicionar à lista
          users.push(newUser);
          localStorage.setItem('eventApp_users', JSON.stringify(users));
          
          return { success: true, message: 'Usuário cadastrado com sucesso' };
        }
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  }
  
  /**
   * Realiza o login do usuário
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }
    
    try {
      // Verifica se o sistema está configurado para usar armazenamento remoto
      if (storage.isRemoteConfigured()) {
        // Usa o método de autenticação remoto
        const response = await storage.authenticateUser(email, password);
        
        if (!response.success) {
          throw new Error(response.error || 'Credenciais inválidas');
        }
        
        // Adapta o formato do usuário
        const user = {
          id: response.usuario.id,
          name: response.usuario.nome,
          email: response.usuario.email,
          isAdmin: response.usuario.isAdmin
        };
        
        // Salva o usuário na sessão
        this.setUserSession(user);
        
        return { success: true, user };
      } else {
        // Fallback para o localStorage
        // Verifica se é o admin
        const adminEmail = localStorage.getItem('adminEmail');
        const adminPassword = localStorage.getItem('adminPassword');
        const adminName = localStorage.getItem('adminName');
        
        if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
          const adminUser = {
            id: 'admin-local',
            name: adminName || 'Administrador',
            email: adminEmail,
            isAdmin: true
          };
          
          // Salva o usuário na sessão
          this.setUserSession(adminUser);
          
          return { success: true, user: adminUser };
        }
        
        // Verifica na lista de usuários locais
        const users = JSON.parse(localStorage.getItem('eventApp_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          const userWithoutPassword = {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
          };
          
          // Salva o usuário na sessão
          this.setUserSession(userWithoutPassword);
          
          return { success: true, user: userWithoutPassword };
        }
        
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }
  
  /**
   * Realiza o logout do usuário
   */
  logout() {
    // Remove o usuário da sessão
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionExpiration');
    
    // Atualiza o estado
    state.setState('currentUser', null);
    
    // Redireciona para a tela de login
    router.navigate('login');
    
    return { success: true };
  }
  
  /**
   * Verifica se há um usuário na sessão
   */
  checkSession() {
    const userJson = localStorage.getItem('currentUser');
    const expiration = localStorage.getItem('sessionExpiration');
    
    if (userJson && expiration) {
      // Verifica se a sessão não expirou
      if (parseInt(expiration) > Date.now()) {
        try {
          const user = JSON.parse(userJson);
          state.setState('currentUser', user);
          return user;
        } catch (error) {
          console.error('Erro ao carregar usuário da sessão:', error);
          this.logout();
        }
      } else {
        // Sessão expirada
        console.log('Sessão expirada, realizando logout');
        this.logout();
      }
    }
    
    return null;
  }
  
  /**
   * Salva o usuário na sessão
   */
  setUserSession(user) {
    if (!user) return;
    
    // Salva no localStorage para persistência
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Define a data de expiração da sessão
    const expiration = Date.now() + this.sessionDuration;
    localStorage.setItem('sessionExpiration', expiration.toString());
    
    // Atualiza o estado
    state.setState('currentUser', user);
  }
  
  /**
   * Verifica se o usuário atual é administrador
   */
  isUserAdmin() {
    const currentUser = state.getState('currentUser');
    return !!(currentUser && currentUser.isAdmin);
  }
  
  /**
   * Lista todos os usuários (apenas admin)
   */
  async listUsers() {
    if (!this.isUserAdmin()) {
      throw new Error('Apenas administradores podem listar usuários');
    }
    
    try {
      if (storage.isRemoteConfigured()) {
        const currentUser = state.getState('currentUser');
        const response = await storage.manageUsers('listarUsuarios', null, currentUser.id);
        
        if (!response.success) {
          throw new Error(response.error || 'Erro ao listar usuários');
        }
        
        // Adapta o formato dos usuários
        return response.usuarios.map(u => ({
          id: u.id,
          name: u.nome,
          email: u.email,
          isAdmin: u.isAdmin,
          createdAt: u.dataCriacao
        }));
      } else {
        // Fallback para o localStorage
        const users = JSON.parse(localStorage.getItem('eventApp_users') || '[]');
        
        // Remove senhas antes de retornar
        return users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt
        }));
      }
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  }
  
  /**
   * Remove um usuário (apenas admin)
   */
  async removeUser(userId) {
    if (!this.isUserAdmin()) {
      throw new Error('Apenas administradores podem remover usuários');
    }
    
    // Não permite remover o próprio admin
    const currentUser = state.getState('currentUser');
    if (currentUser && currentUser.id === userId) {
      throw new Error('Não é possível remover o próprio usuário');
    }
    
    try {
      if (storage.isRemoteConfigured()) {
        const response = await storage.manageUsers('excluirUsuario', userId, currentUser.id);
        
        if (!response.success) {
          throw new Error(response.error || 'Erro ao excluir usuário');
        }
        
        return { success: true, message: 'Usuário removido com sucesso' };
      } else {
        // Fallback para o localStorage
        let users = JSON.parse(localStorage.getItem('eventApp_users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          throw new Error('Usuário não encontrado');
        }
        
        // Verifica se está tentando excluir um admin
        if (users[userIndex].isAdmin) {
          throw new Error('Não é possível excluir um administrador');
        }
        
        // Remove o usuário
        users.splice(userIndex, 1);
        localStorage.setItem('eventApp_users', JSON.stringify(users));
        
        return { success: true, message: 'Usuário removido com sucesso' };
      }
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      throw error;
    }
  }
}

export default new AuthService(); // Exporta uma instância única do serviço