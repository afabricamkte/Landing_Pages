/**
 * Módulo de Autenticação - Sistema de Gestão de Orçamentos para Eventos
 * 
 * Este módulo gerencia todas as operações relacionadas à autenticação:
 * - Login/Logout
 * - Cadastro de usuários
 * - Verificação de permissões
 * - Gerenciamento de sessões
 */

// Namespace do módulo de autenticação
const Auth = (function() {
    
    // Cache de elementos DOM frequentemente usados
    const elements = {};
    
    // Configurações
    const config = {
        minPasswordLength: 6,
        sessionDuration: 24 * 60 * 60 * 1000 // 24 horas em milissegundos
    };
    
    // Estado da autenticação
    let currentUser = null;
    
    /**
     * Inicializa o módulo de autenticação
     */
    function init() {
        console.log('🔐 Inicializando módulo de autenticação...');
        
        // Localiza elementos importantes no DOM
        cacheElements();
        
        // Adiciona event listeners para os formulários e links
        setupEventListeners();
        
        // Verifica se existe um usuário logado
        checkLoggedInUser();
        
        // Verifica se é o primeiro acesso ao sistema
        checkFirstAccess();
        
        console.log('✅ Módulo de autenticação inicializado');
    }
    
    /**
     * Armazena referências para elementos DOM frequentemente usados
     */
    function cacheElements() {
        // Seções
        elements.loginSection = document.getElementById('login-section');
        elements.cadastroSection = document.getElementById('cadastro-section');
        elements.appSection = document.getElementById('app-section');
        
        // Formulários
        elements.loginForm = document.getElementById('login-form');
        elements.cadastroForm = document.getElementById('cadastro-form');
        
        // Campos de formulário - Login
        elements.loginEmail = document.getElementById('login-email');
        elements.loginSenha = document.getElementById('login-senha');
        elements.loginMensagem = document.getElementById('login-mensagem');
        
        // Campos de formulário - Cadastro
        elements.cadastroNome = document.getElementById('cadastro-nome');
        elements.cadastroEmail = document.getElementById('cadastro-email');
        elements.cadastroSenha = document.getElementById('cadastro-senha');
        elements.cadastroConfirmaSenha = document.getElementById('cadastro-confirma-senha');
        elements.cadastroMensagem = document.getElementById('cadastro-mensagem');
        
        // Links de navegação
        elements.linkCadastro = document.getElementById('link-cadastro');
        elements.linkLogin = document.getElementById('link-login');
        elements.btnLogout = document.getElementById('btn-logout');
        
        // Elementos de UI
        elements.usuarioLogado = document.getElementById('usuario-logado');
        elements.navUsuarios = document.getElementById('nav-usuarios');
        elements.primeiroAcesso = document.querySelector('.primeiro-acesso');
        elements.spinner = document.getElementById('spinner');
    }
    
    /**
     * Configura os event listeners para formulários e botões
     */
    function setupEventListeners() {
        // Navegação entre login e cadastro
        if (elements.linkCadastro) {
            elements.linkCadastro.addEventListener('click', function(e) {
                e.preventDefault();
                UI.mostrarSecao('cadastro-section');
            });
        }
        
        if (elements.linkLogin) {
            elements.linkLogin.addEventListener('click', function(e) {
                e.preventDefault();
                UI.mostrarSecao('login-section');
            });
        }
        
        // Submit dos formulários
        if (elements.loginForm) {
            elements.loginForm.addEventListener('submit', handleLogin);
        }
        
        if (elements.cadastroForm) {
            elements.cadastroForm.addEventListener('submit', handleRegister);
        }
        
        // Logout
        if (elements.btnLogout) {
            elements.btnLogout.addEventListener('click', handleLogout);
        }
    }
    
    /**
     * Manipulador para o formulário de login
     * @param {Event} event - Evento de submit do formulário
     */
    function handleLogin(event) {
        event.preventDefault();
        
        const email = elements.loginEmail.value.trim();
        const senha = elements.loginSenha.value;
        
        // Validação básica
        if (!email || !senha) {
            showMessage(elements.loginMensagem, 'Preencha todos os campos', 'danger');
            return;
        }
        
        UI.mostrarSpinner();
        
        // Timeout para simular processamento e mostrar o spinner
        setTimeout(async function() {
            try {
                // Se a API está configurada, tenta fazer login pelo servidor
                if (window.api && window.api.isConfigured) {
                    const response = await window.api.login(email, senha);
                    
                    if (response.success) {
                        loginSuccess(response.usuario);
                    } else {
                        showMessage(elements.loginMensagem, response.error || 'Credenciais inválidas', 'danger');
                    }
                } else {
                    // Verifica no localStorage (modo offline)
                    const adminEmail = localStorage.getItem('adminEmail');
                    const adminSenha = localStorage.getItem('adminSenha');
                    const adminNome = localStorage.getItem('adminNome');
                    
                    if (adminEmail && adminSenha && email === adminEmail && senha === adminSenha) {
                        const admin = {
                            id: 'admin-local',
                            nome: adminNome || 'Administrador',
                            email: adminEmail,
                            isAdmin: true
                        };
                        
                        loginSuccess(admin);
                    } else {
                        // Verifica na lista de usuários locais
                        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                        const usuario = usuarios.find(u => u.email === email);
                        
                        if (usuario && usuario.senha === senha) {
                            loginSuccess(usuario);
                        } else {
                            showMessage(elements.loginMensagem, 'Credenciais inválidas', 'danger');
                        }
                    }
                }
            } catch (error) {
                console.error('Erro ao fazer login:', error);
                showMessage(elements.loginMensagem, 'Erro ao fazer login: ' + error.message, 'danger');
            } finally {
                UI.esconderSpinner();
            }
        }, 600);
    }
    
    /**
     * Manipulador para o formulário de cadastro
     * @param {Event} event - Evento de submit do formulário
     */
    function handleRegister(event) {
        event.preventDefault();
        
        const nome = elements.cadastroNome.value.trim();
        const email = elements.cadastroEmail.value.trim();
        const senha = elements.cadastroSenha.value;
        const confirmaSenha = elements.cadastroConfirmaSenha.value;
        
        // Validação
        if (!nome || !email || !senha || !confirmaSenha) {
            showMessage(elements.cadastroMensagem, 'Todos os campos são obrigatórios', 'danger');
            return;
        }
        
        if (senha !== confirmaSenha) {
            showMessage(elements.cadastroMensagem, 'As senhas não conferem', 'danger');
            return;
        }
        
        if (senha.length < config.minPasswordLength) {
            showMessage(elements.cadastroMensagem, `A senha deve ter pelo menos ${config.minPasswordLength} caracteres`, 'danger');
            return;
        }
        
        UI.mostrarSpinner();
        
        setTimeout(async function() {
            try {
                // Verifica se é o primeiro acesso (criação do admin)
                const isFirstAccess = !localStorage.getItem('adminEmail');
                
                if (isFirstAccess) {
                    // Registra o primeiro usuário como admin
                    registerFirstAdmin(nome, email, senha);
                } else if (window.api && window.api.isConfigured) {
                    // Se a API está configurada e não é o primeiro acesso,
                    // apenas admins podem adicionar usuários
                    const adminUser = getCurrentUser();
                    
                    if (!adminUser || !adminUser.isAdmin) {
                        showMessage(elements.cadastroMensagem, 'Apenas administradores podem adicionar usuários', 'danger');
                        UI.esconderSpinner();
                        return;
                    }
                    
                    // Adiciona o usuário via API
                    const response = await window.api.adicionarUsuario(
                        { nome, email, senha }, 
                        adminUser.id
                    );
                    
                    if (response.success) {
                        showMessage(elements.cadastroMensagem, 'Usuário cadastrado com sucesso!', 'success');
                        elements.cadastroForm.reset();
                        
                        // Se estiver na tela de gerenciamento de usuários, recarrega a lista
                        if (typeof carregarUsuarios === 'function') {
                            setTimeout(carregarUsuarios, 1000);
                        }
                    } else {
                        showMessage(elements.cadastroMensagem, response.error || 'Erro ao cadastrar usuário', 'danger');
                    }
                } else {
                    // Modo offline - apenas admins podem adicionar usuários
                    const adminUser = getCurrentUser();
                    
                    if (!adminUser || !adminUser.isAdmin) {
                        showMessage(elements.cadastroMensagem, 'Apenas administradores podem adicionar usuários', 'danger');
                        UI.esconderSpinner();
                        return;
                    }
                    
                    // Adiciona o usuário localmente
                    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                    
                    // Verifica se o email já existe
                    if (usuarios.some(u => u.email === email)) {
                        showMessage(elements.cadastroMensagem, 'Este email já está cadastrado', 'danger');
                        UI.esconderSpinner();
                        return;
                    }
                    
                    const novoUsuario = {
                        id: generateUUID(),
                        nome,
                        email,
                        senha,
                        isAdmin: false,
                        dataCriacao: new Date().toISOString()
                    };
                    
                    usuarios.push(novoUsuario);
                    localStorage.setItem('usuarios', JSON.stringify(usuarios));
                    
                    showMessage(elements.cadastroMensagem, 'Usuário cadastrado com sucesso!', 'success');
                    elements.cadastroForm.reset();
                    
                    // Se estiver na tela de gerenciamento de usuários, recarrega a lista
                    if (typeof carregarUsuarios === 'function') {
                        setTimeout(carregarUsuarios, 1000);
                    }
                }
            } catch (error) {
                console.error('Erro ao cadastrar usuário:', error);
                showMessage(elements.cadastroMensagem, 'Erro ao cadastrar usuário: ' + error.message, 'danger');
            } finally {
                UI.esconderSpinner();
            }
        }, 600);
    }
    
    /**
     * Registra o primeiro usuário como administrador
     * @param {string} nome - Nome do administrador
     * @param {string} email - Email do administrador
     * @param {string} senha - Senha do administrador
     */
    function registerFirstAdmin(nome, email, senha) {
        try {
            // Salva as credenciais do admin no localStorage
            localStorage.setItem('adminNome', nome);
            localStorage.setItem('adminEmail', email);
            localStorage.setItem('adminSenha', senha);
            
            // Cria o objeto do usuário admin
            const adminUser = {
                id: 'admin-' + Date.now().toString(),
                nome,
                email,
                isAdmin: true,
                dataCriacao: new Date().toISOString()
            };
            
            // Salva o usuário admin
            localStorage.setItem('adminUser', JSON.stringify(adminUser));
            
            // Atualiza as configurações da API
            if (window.api) {
                window.api.hasAdmin = true;
                window.api.firstAccess = false;
            }
            
            showMessage(elements.cadastroMensagem, 'Administrador cadastrado com sucesso! Você já pode fazer login.', 'success');
            
            // Limpa o formulário
            elements.cadastroForm.reset();
            
            // Esconde a mensagem de primeiro acesso
            if (elements.primeiroAcesso) {
                elements.primeiroAcesso.style.display = 'none';
            }
            
            // Redireciona para a tela de login após 2 segundos
            setTimeout(function() {
                UI.mostrarSecao('login-section');
            }, 2000);
            
        } catch (error) {
            console.error('Erro ao registrar admin:', error);
            showMessage(elements.cadastroMensagem, 'Erro ao registrar administrador: ' + error.message, 'danger');
        }
    }
    
    /**
     * Processa o sucesso do login
     * @param {Object} usuario - Dados do usuário logado
     */
    function loginSuccess(usuario) {
        // Salva o usuário na sessão atual
        currentUser = usuario;
        
        // Salva no localStorage para persistência
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        
        // Configura a data de expiração da sessão
        const expiration = Date.now() + config.sessionDuration;
        localStorage.setItem('sessionExpiration', expiration.toString());
        
        // Atualiza a interface
        updateUIAfterLogin(usuario);
        
        // Redireciona para a tela principal
        UI.mostrarSecao('app-section');
        
        // Se não estiver configurado e for admin, redireciona para configurações
        if (window.api && !window.api.isConfigured && usuario.isAdmin) {
            const navConfig = document.getElementById('nav-configuracoes');
            if (navConfig) navConfig.click();
        } else if (window.api && window.api.isConfigured) {
            // Carrega a lista de eventos
            if (typeof carregarEventos === 'function') {
                carregarEventos();
            }
        }
    }
    
    /**
     * Manipulador para o botão de logout
     */
    function handleLogout() {
        // Remove os dados de sessão
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('sessionExpiration');
        
        // Limpa o usuário atual
        currentUser = null;
        
        // Redireciona para a tela de login
        UI.mostrarSecao('login-section');
        
        // Limpa os formulários
        if (elements.loginForm) elements.loginForm.reset();
        if (elements.cadastroForm) elements.cadastroForm.reset();
        
        console.log('✅ Logout realizado com sucesso');
    }
    
    /**
     * Verifica se existe um usuário logado na sessão atual
     */
    function checkLoggedInUser() {
        const usuarioSalvo = localStorage.getItem('usuarioLogado');
        const expiration = localStorage.getItem('sessionExpiration');
        
        if (usuarioSalvo && expiration) {
            // Verifica se a sessão não expirou
            if (parseInt(expiration) > Date.now()) {
                try {
                    const usuario = JSON.parse(usuarioSalvo);
                    currentUser = usuario;
                    
                    // Atualiza a interface
                    updateUIAfterLogin(usuario);
                    
                    console.log('🔐 Usuário já logado:', usuario.nome);
                    return true;
                } catch (error) {
                    console.error('Erro ao carregar usuário do localStorage:', error);
                    localStorage.removeItem('usuarioLogado');
                    localStorage.removeItem('sessionExpiration');
                }
            } else {
                // Sessão expirada
                console.log('⏰ Sessão expirada, forçando logout');
                localStorage.removeItem('usuarioLogado');
                localStorage.removeItem('sessionExpiration');
            }
        }
        
        return false;
    }
    
    /**
     * Atualiza a interface após o login
     * @param {Object} usuario - Dados do usuário logado
     */
    function updateUIAfterLogin(usuario) {
        // Atualiza o nome do usuário na interface
        if (elements.usuarioLogado) {
            elements.usuarioLogado.textContent = `Olá, ${usuario.nome}`;
        }
        
        // Se for admin, mostra o item de menu de usuários
        if (elements.navUsuarios) {
            elements.navUsuarios.style.display = usuario.isAdmin ? 'block' : 'none';
        }
    }
    
    /**
     * Verifica se é o primeiro acesso ao sistema
     */
    function checkFirstAccess() {
        const isFirstAccess = !localStorage.getItem('adminEmail');
        
        if (isFirstAccess) {
            console.log('🆕 Primeiro acesso detectado');
            
            // Mostra a mensagem de primeiro acesso
            if (elements.primeiroAcesso) {
                elements.primeiroAcesso.style.display = 'block';
            }
            
            // Atualiza a configuração da API
            if (window.api) {
                window.api.firstAccess = true;
            }
            
            // Vai para a tela de cadastro
            UI.mostrarSecao('cadastro-section');
        } else {
            // Esconde a mensagem de primeiro acesso
            if (elements.primeiroAcesso) {
                elements.primeiroAcesso.style.display = 'none';
            }
            
            // Atualiza a configuração da API
            if (window.api) {
                window.api.firstAccess = false;
            }
            
            // Se já existe um usuário logado, mostra a tela principal
            if (currentUser) {
                UI.mostrarSecao('app-section');
            } else {
                // Senão, mostra a tela de login
                UI.mostrarSecao('login-section');
            }
        }
    }
    
    /**
     * Obtém o usuário logado atualmente
     * @returns {Object|null} - Dados do usuário logado ou null
     */
    function getCurrentUser() {
        return currentUser;
    }
    
    /**
     * Verifica se o usuário atual é administrador
     * @returns {boolean} - true se o usuário é admin, false caso contrário
     */
    function isUserAdmin() {
        return !!(currentUser && currentUser.isAdmin);
    }
    
    // Utilitários
    
    /**
     * Exibe uma mensagem para o usuário
     * @param {HTMLElement} container - Elemento onde a mensagem será exibida
     * @param {string} message - Texto da mensagem
     * @param {string} type - Tipo da mensagem (success, danger, warning, info)
     */
    function showMessage(container, message, type = 'danger') {
        if (!container) return;
        
        container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        
        // Scroll até a mensagem
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    /**
     * Gera um UUID para identificação única
     * @returns {string} - UUID gerado
     */
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Submódulo de interface do usuário
    const UI = {
        /**
         * Mostra uma seção específica e esconde as demais
         * @param {string} id - ID da seção a ser mostrada
         */
        mostrarSecao: function(id) {
            console.log('Mostrando seção:', id);
            
            // Esconde todas as seções
            document.querySelectorAll('.page-section').forEach(section => {
                section.classList.remove('active-section');
                section.style.display = 'none';
            });
            
            // Mostra a seção solicitada
            const secao = document.getElementById(id);
            if (secao) {
                secao.classList.add('active-section');
                secao.style.display = 'block';
            } else {
                console.error('Seção não encontrada:', id);
            }
        },
        
        /**
         * Mostra o spinner de carregamento
         */
        mostrarSpinner: function() {
            if (elements.spinner) {
                elements.spinner.style.display = 'flex';
            }
        },
        
        /**
         * Esconde o spinner de carregamento
         */
        esconderSpinner: function() {
            if (elements.spinner) {
                elements.spinner.style.display = 'none';
            }
        }
    };
    
    // API pública do módulo
    return {
        init,
        getCurrentUser,
        isUserAdmin,
        logout: handleLogout,
        showMessage,
        UI
    };
})();

// Inicializa o módulo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
});