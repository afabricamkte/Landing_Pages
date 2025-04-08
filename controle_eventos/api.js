/**
 * API para comunicação com o Google Apps Script
 * Sistema de Gestão de Orçamentos para Eventos
 */

class EventosAPI {
    constructor() {
        // Tentativa de recuperar as configurações salvas
        this.scriptUrl = localStorage.getItem('scriptUrl') || '';
        this.spreadsheetId = localStorage.getItem('spreadsheetId') || '';
        this.isConfigured = !!(this.scriptUrl && this.spreadsheetId);
        
        // Verifica se existe o primeiro usuário (admin)
        this.hasAdmin = !!localStorage.getItem('adminUser');
    }

    /**
     * Salva as configurações de conexão com o Google Sheets
     * @param {string} scriptUrl - URL do Google Apps Script
     * @param {string} spreadsheetId - ID da planilha do Google Sheets
     */
    saveConfig(scriptUrl, spreadsheetId) {
        this.scriptUrl = scriptUrl;
        this.spreadsheetId = spreadsheetId;
        this.isConfigured = true;

        // Salvar no localStorage
        localStorage.setItem('scriptUrl', scriptUrl);
        localStorage.setItem('spreadsheetId', spreadsheetId);

        return true;
    }
    // Método para cadastrar o primeiro usuário como admin (sem necessidade de API)
    async cadastrarPrimeiroUsuario(usuario) {
        // Verifica se já existe um admin
        if (this.hasAdmin) {
            return {
                success: false,
                error: "Já existe um administrador no sistema"
            };
        }
        
        // Cria o admin localmente
        const adminUser = {
            ...usuario,
            id: this.generateUUID(),
            isAdmin: true,
            dataCriacao: new Date().toISOString()
        };
        
        // Salva o admin no localStorage
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        
        // Adiciona também aos usuários
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        usuarios.push(adminUser);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        this.hasAdmin = true;
        
        return {
            success: true,
            message: "Administrador cadastrado com sucesso"
        };
    }

    // Método para adicionar usuários (somente admin)
    async adicionarUsuario(usuario, adminToken) {
        // Verifica se quem está adicionando é admin
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
        if (!adminUser || adminUser.id !== adminToken) {
            return {
                success: false,
                error: "Apenas o administrador pode adicionar usuários"
            };
        }
        
        // Se o sistema não está configurado, adiciona localmente
        if (!this.isConfigured) {
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            
            // Verifica se o email já existe
            if (usuarios.some(u => u.email === usuario.email)) {
                return {
                    success: false,
                    error: "Email já cadastrado"
                };
            }
            
            const novoUsuario = {
                ...usuario,
                id: this.generateUUID(),
                isAdmin: false,
                dataCriacao: new Date().toISOString()
            };
            
            usuarios.push(novoUsuario);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            
            return {
                success: true,
                message: "Usuário adicionado com sucesso"
            };
        }
        
        // Se o sistema está configurado, usa a API
        return this.request('adicionarUsuario', { usuario, adminToken });
    }

    // Método para listar usuários (somente admin)
    async listarUsuarios(adminToken) {
        // Verifica se quem está solicitando é admin
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
        if (!adminUser || adminUser.id !== adminToken) {
            return {
                success: false,
                error: "Apenas o administrador pode listar usuários"
            };
        }
        
        // Se o sistema não está configurado, lista do localStorage
        if (!this.isConfigured) {
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            // Remove senhas antes de retornar
            const usuariosSemSenha = usuarios.map(u => ({...u, senha: undefined}));
            
            return {
                success: true,
                usuarios: usuariosSemSenha
            };
        }
        
        // Se o sistema está configurado, usa a API
        return this.request('listarUsuarios', { adminToken });
    }

    // Método para excluir usuário (somente admin)
    async excluirUsuario(usuarioId, adminToken) {
        // Verifica se quem está excluindo é admin
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
        if (!adminUser || adminUser.id !== adminToken) {
            return {
                success: false,
                error: "Apenas o administrador pode excluir usuários"
            };
        }
        
        // Não permite excluir o admin
        if (usuarioId === adminUser.id) {
            return {
                success: false,
                error: "Não é possível excluir o administrador"
            };
        }
        
        // Se o sistema não está configurado, exclui do localStorage
        if (!this.isConfigured) {
            let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            const indice = usuarios.findIndex(u => u.id === usuarioId);
            
            if (indice === -1) {
                return {
                    success: false,
                    error: "Usuário não encontrado"
                };
            }
            
            // Remove o usuário
            usuarios.splice(indice, 1);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            
            return {
                success: true,
                message: "Usuário excluído com sucesso"
            };
        }
        
        // Se o sistema está configurado, usa a API
        return this.request('excluirUsuario', { usuarioId, adminToken });
    }

    // Gera um UUID para IDs locais
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    /**
     * Testa a conexão com o Google Apps Script
     * @returns {Promise<boolean>} - Promise com o resultado do teste
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.scriptUrl}?action=testConnection&spreadsheetId=${this.spreadsheetId}`);
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Erro ao testar conexão:', error);
            return false;
        }
    }

    /**
     * Método genérico para fazer requisições à API
     * @param {string} action - Ação a ser executada
     * @param {Object} params - Parâmetros adicionais
     * @returns {Promise<Object>} - Promise com o resultado da requisição
     */
    async request(action, params = {}) {
        if (!this.isConfigured) {
            throw new Error('API não configurada. Configure o ID da planilha e a URL do Apps Script primeiro.');
        }

        if (!this.scriptUrl || !this.spreadsheetId) {
            throw new Error('URL do script ou ID da planilha não configurados.');
        }

        // Adiciona o ID da planilha aos parâmetros
        params.spreadsheetId = this.spreadsheetId;
        params.action = action;

        // Converte parâmetros para QueryString para GET ou corpo para POST
        const isGet = ['getEventos', 'getEvento', 'getFornecedores', 'getFornecedor', 'testConnection'].includes(action);
        
        try {
            let response;
            if (isGet) {
                // Constrói a query string para requisições GET
                const queryString = Object.keys(params)
                    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                    .join('&');
                
                response = await fetch(`${this.scriptUrl}?${queryString}`);
            } else {
                // Para requisições POST, envia os parâmetros no corpo
                response = await fetch(this.scriptUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(params)
                });
            }

            // Analisa a resposta como JSON
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Erro na requisição à API');
            }
            
            return data;
        } catch (error) {
            console.error(`Erro na requisição (${action}):`, error);
            throw error;
        }
    }

    // ======== AUTENTICAÇÃO ========

    /**
     * Autenticação de usuário
     * @param {string} email - Email do usuário
     * @param {string} senha - Senha do usuário
     * @returns {Promise<Object>} - Promise com o resultado da autenticação
     */
    async login(email, senha) {
        return this.request('login', { email, senha });
    }

    /**
     * Cadastro de novo usuário
     * @param {Object} usuario - Dados do usuário
     * @returns {Promise<Object>} - Promise com o resultado do cadastro
     */

    // ======== EVENTOS ========

    /**
     * Obtém todos os eventos
     * @returns {Promise<Object>} - Promise com a lista de eventos
     */
    async getEventos() {
        return this.request('getEventos');
    }

    /**
     * Obtém um evento específico pelo ID
     * @param {string} eventoId - ID do evento
     * @returns {Promise<Object>} - Promise com os dados do evento
     */
    async getEvento(eventoId) {
        return this.request('getEvento', { eventoId });
    }

    /**
     * Cria um novo evento
     * @param {Object} evento - Dados do evento
     * @returns {Promise<Object>} - Promise com o resultado da criação
     */
    async criarEvento(evento) {
        return this.request('criarEvento', { evento });
    }

    /**
     * Atualiza um evento existente
     * @param {string} eventoId - ID do evento
     * @param {Object} evento - Dados atualizados do evento
     * @returns {Promise<Object>} - Promise com o resultado da atualização
     */
    async atualizarEvento(eventoId, evento) {
        return this.request('atualizarEvento', { eventoId, evento });
    }

    /**
     * Exclui um evento
     * @param {string} eventoId - ID do evento
     * @returns {Promise<Object>} - Promise com o resultado da exclusão
     */
    async excluirEvento(eventoId) {
        return this.request('excluirEvento', { eventoId });
    }

    // ======== SERVIÇOS ========

    /**
     * Obtém os serviços de um evento
     * @param {string} eventoId - ID do evento
     * @returns {Promise<Object>} - Promise com a lista de serviços
     */
    async getServicos(eventoId) {
        return this.request('getServicos', { eventoId });
    }

    /**
     * Atualiza os serviços de um evento
     * @param {string} eventoId - ID do evento
     * @param {Array} servicos - Lista de serviços
     * @returns {Promise<Object>} - Promise com o resultado da atualização
     */
    async atualizarServicos(eventoId, servicos) {
        return this.request('atualizarServicos', { eventoId, servicos });
    }

    // ======== ORÇAMENTOS ========

    /**
     * Obtém os orçamentos de um evento
     * @param {string} eventoId - ID do evento
     * @returns {Promise<Object>} - Promise com a lista de orçamentos
     */
    async getOrcamentos(eventoId) {
        return this.request('getOrcamentos', { eventoId });
    }

    /**
     * Cria um novo orçamento
     * @param {string} eventoId - ID do evento
     * @param {Object} orcamento - Dados do orçamento
     * @returns {Promise<Object>} - Promise com o resultado da criação
     */
    async criarOrcamento(eventoId, orcamento) {
        return this.request('criarOrcamento', { eventoId, orcamento });
    }

    /**
     * Atualiza um orçamento existente
     * @param {string} eventoId - ID do evento
     * @param {string} orcamentoId - ID do orçamento
     * @param {Object} orcamento - Dados atualizados do orçamento
     * @returns {Promise<Object>} - Promise com o resultado da atualização
     */
    async atualizarOrcamento(eventoId, orcamentoId, orcamento) {
        return this.request('atualizarOrcamento', { eventoId, orcamentoId, orcamento });
    }

    /**
     * Exclui um orçamento
     * @param {string} eventoId - ID do evento
     * @param {string} orcamentoId - ID do orçamento
     * @returns {Promise<Object>} - Promise com o resultado da exclusão
     */
    async excluirOrcamento(eventoId, orcamentoId) {
        return this.request('excluirOrcamento', { eventoId, orcamentoId });
    }

    // ======== FORNECEDORES ========

    /**
     * Obtém todos os fornecedores
     * @returns {Promise<Object>} - Promise com a lista de fornecedores
     */
    async getFornecedores() {
        return this.request('getFornecedores');
    }

    /**
     * Obtém um fornecedor específico pelo ID
     * @param {string} fornecedorId - ID do fornecedor
     * @returns {Promise<Object>} - Promise com os dados do fornecedor
     */
    async getFornecedor(fornecedorId) {
        return this.request('getFornecedor', { fornecedorId });
    }

    /**
     * Cria um novo fornecedor
     * @param {Object} fornecedor - Dados do fornecedor
     * @returns {Promise<Object>} - Promise com o resultado da criação
     */
    async criarFornecedor(fornecedor) {
        return this.request('criarFornecedor', { fornecedor });
    }

    /**
     * Atualiza um fornecedor existente
     * @param {string} fornecedorId - ID do fornecedor
     * @param {Object} fornecedor - Dados atualizados do fornecedor
     * @returns {Promise<Object>} - Promise com o resultado da atualização
     */
    async atualizarFornecedor(fornecedorId, fornecedor) {
        return this.request('atualizarFornecedor', { fornecedorId, fornecedor });
    }

    /**
     * Exclui um fornecedor
     * @param {string} fornecedorId - ID do fornecedor
     * @returns {Promise<Object>} - Promise com o resultado da exclusão
     */
    async excluirFornecedor(fornecedorId) {
        return this.request('excluirFornecedor', { fornecedorId });
    }

    // ======== PAGAMENTOS ========

    /**
     * Obtém os pagamentos de um evento
     * @param {string} eventoId - ID do evento
     * @returns {Promise<Object>} - Promise com a lista de pagamentos
     */
    async getPagamentos(eventoId) {
        return this.request('getPagamentos', { eventoId });
    }

    /**
     * Obtém todos os pagamentos pendentes de todos os eventos
     * @returns {Promise<Object>} - Promise com a lista de pagamentos pendentes
     */
    async getPagamentosPendentes() {
        return this.request('getPagamentosPendentes');
    }

    /**
     * Cria um novo pagamento
     * @param {string} eventoId - ID do evento
     * @param {Object} pagamento - Dados do pagamento
     * @returns {Promise<Object>} - Promise com o resultado da criação
     */
    async criarPagamento(eventoId, pagamento) {
        return this.request('criarPagamento', { eventoId, pagamento });
    }

    /**
     * Atualiza um pagamento existente
     * @param {string} eventoId - ID do evento
     * @param {string} pagamentoId - ID do pagamento
     * @param {Object} pagamento - Dados atualizados do pagamento
     * @returns {Promise<Object>} - Promise com o resultado da atualização
     */
    async atualizarPagamento(eventoId, pagamentoId, pagamento) {
        return this.request('atualizarPagamento', { eventoId, pagamentoId, pagamento });
    }

    /**
     * Exclui um pagamento
     * @param {string} eventoId - ID do evento
     * @param {string} pagamentoId - ID do pagamento
     * @returns {Promise<Object>} - Promise com o resultado da exclusão
     */
    async excluirPagamento(eventoId, pagamentoId) {
        return this.request('excluirPagamento', { eventoId, pagamentoId });
    }

    // ======== ANEXOS ========

    /**
     * Obtém os anexos de um evento
     * @param {string} eventoId - ID do evento
     * @returns {Promise<Object>} - Promise com a lista de anexos
     */
    async getAnexos(eventoId) {
        return this.request('getAnexos', { eventoId });
    }

    /**
     * Cria um novo anexo
     * @param {string} eventoId - ID do evento
     * @param {Object} anexo - Dados do anexo
     * @returns {Promise<Object>} - Promise com o resultado da criação
     */
    async criarAnexo(eventoId, anexo) {
        return this.request('criarAnexo', { eventoId, anexo });
    }

    /**
     * Atualiza um anexo existente
     * @param {string} eventoId - ID do evento
     * @param {string} anexoId - ID do anexo
     * @param {Object} anexo - Dados atualizados do anexo
     * @returns {Promise<Object>} - Promise com o resultado da atualização
     */
    async atualizarAnexo(eventoId, anexoId, anexo) {
        return this.request('atualizarAnexo', { eventoId, anexoId, anexo });
    }

    /**
     * Exclui um anexo
     * @param {string} eventoId - ID do evento
     * @param {string} anexoId - ID do anexo
     * @returns {Promise<Object>} - Promise com o resultado da exclusão
     */
    async excluirAnexo(eventoId, anexoId) {
        return this.request('excluirAnexo', { eventoId, anexoId });
    }

    // ======== RESUMO FINANCEIRO ========

    /**
     * Obtém o resumo financeiro de todos os eventos
     * @returns {Promise<Object>} - Promise com o resumo financeiro
     */
    async getResumoFinanceiro() {
        return this.request('getResumoFinanceiro');
    }
}

// Exporta uma instância da API
const api = new EventosAPI();