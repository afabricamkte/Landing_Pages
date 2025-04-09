/**
 * Solução para o problema de cadastro do primeiro usuário administrador
 * Este script deve ser incluído após todos os outros scripts no HTML
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Script de correção do cadastro carregado');
    
    // Referências para elementos importantes
    const loginSection = document.getElementById('login-section');
    const cadastroSection = document.getElementById('cadastro-section');
    const appSection = document.getElementById('app-section');
    const cadastroForm = document.getElementById('cadastro-form');
    const linkCadastro = document.getElementById('link-cadastro');
    const linkLogin = document.getElementById('link-login');
    const mensagemDiv = document.getElementById('cadastro-mensagem');
    
    // Remover todos os listeners anteriores para evitar duplicidade
    function removeAllListeners(element) {
        if (!element) return;
        const clone = element.cloneNode(true);
        element.parentNode.replaceChild(clone, element);
        return clone;
    }
    
    // Refazer os links de navegação
    const newLinkCadastro = removeAllListeners(linkCadastro);
    const newLinkLogin = removeAllListeners(linkLogin);
    const newCadastroForm = removeAllListeners(cadastroForm);
    
    // Mostrar/esconder spinner
    function mostrarSpinner() {
        const spinner = document.getElementById('spinner');
        if (spinner) spinner.style.display = 'flex';
    }
    
    function esconderSpinner() {
        const spinner = document.getElementById('spinner');
        if (spinner) spinner.style.display = 'none';
    }
    
    // Função para mostrar mensagens
    function mostrarMensagem(texto, tipo) {
        if (mensagemDiv) {
            mensagemDiv.innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`;
        } else {
            alert(texto);
        }
    }
    
    // Função simplificada para mostrar uma seção
    function mostrarSecao(id) {
        console.log(`Mostrando seção: ${id}`);
        
        // Esconde todas as seções primeiro
        document.querySelectorAll('.page-section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active-section');
        });
        
        // Mostra a seção solicitada
        const secao = document.getElementById(id);
        if (secao) {
            secao.style.display = 'block';
            secao.classList.add('active-section');
            console.log(`Seção ${id} está visível: ${secao.style.display}`);
        } else {
            console.error(`Seção não encontrada: ${id}`);
        }
    }
    
    // Navegar para a tela de cadastro
    if (newLinkCadastro) {
        newLinkCadastro.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Link para cadastro clicado');
            mostrarSecao('cadastro-section');
        });
    }
    
    // Navegar para a tela de login
    if (newLinkLogin) {
        newLinkLogin.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Link para login clicado');
            mostrarSecao('login-section');
        });
    }
    
    // Implementação limpa do cadastro
    if (newCadastroForm) {
        newCadastroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            console.log('Formulário de cadastro submetido');
            
            // Coletar dados
            const nome = document.getElementById('cadastro-nome')?.value || '';
            const email = document.getElementById('cadastro-email')?.value || '';
            const senha = document.getElementById('cadastro-senha')?.value || '';
            const confirmaSenha = document.getElementById('cadastro-confirma-senha')?.value || '';
            
            console.log('Dados capturados:', { nome, email });
            
            // Validação básica
            if (!nome || !email || !senha || !confirmaSenha) {
                mostrarMensagem('Todos os campos são obrigatórios', 'danger');
                return;
            }
            
            if (senha !== confirmaSenha) {
                mostrarMensagem('As senhas não conferem', 'danger');
                return;
            }
            
            if (senha.length < 6) {
                mostrarMensagem('A senha deve ter pelo menos 6 caracteres', 'danger');
                return;
            }
            
            // Mostrar spinner
            mostrarSpinner();
            
            // Simular um pequeno delay para mostrar o spinner
            setTimeout(function() {
                try {
                    // Salvar no localStorage diretamente
                    localStorage.setItem('adminNome', nome);
                    localStorage.setItem('adminEmail', email);
                    localStorage.setItem('adminSenha', senha);
                    
                    // Criar objeto de admin
                    const adminUser = {
                        id: 'admin-' + Date.now(),
                        nome: nome,
                        email: email,
                        isAdmin: true,
                        dataCriacao: new Date().toISOString()
                    };
                    
                    console.log('Salvando usuário admin:', adminUser);
                    
                    // Salvar usuário
                    localStorage.setItem('adminUser', JSON.stringify(adminUser));
                    localStorage.setItem('usuarioLogado', JSON.stringify(adminUser));
                    
                    // Mostrar mensagem de sucesso
                    mostrarMensagem('Cadastro realizado com sucesso! Redirecionando...', 'success');
                    
                    // Atualizar as variáveis da API
                    if (window.api) {
                        window.api.hasAdmin = true;
                        window.api.firstAccess = false;
                    }
                    
                    // Atualizar interface (nome do usuário)
                    const userNameElement = document.getElementById('usuario-logado');
                    if (userNameElement) {
                        userNameElement.textContent = `Olá, ${nome}`;
                    }
                    
                    // Esconder a mensagem de primeiro acesso
                    const primeiroAcessoMsg = document.querySelector('.primeiro-acesso');
                    if (primeiroAcessoMsg) {
                        primeiroAcessoMsg.style.display = 'none';
                    }
                    
                    // Habilitar menu de admin
                    const menuUsuarios = document.getElementById('nav-usuarios');
                    if (menuUsuarios) {
                        menuUsuarios.style.display = 'block';
                    }
                    
                    // Redirecionar após 2 segundos
                    setTimeout(function() {
                        mostrarSecao('app-section');
                    }, 2000);
                    
                } catch (error) {
                    console.error('Erro ao cadastrar:', error);
                    mostrarMensagem('Erro ao cadastrar: ' + error.message, 'danger');
                } finally {
                    esconderSpinner();
                }
            }, 500); // Pequeno delay para mostrar o spinner
        });
    }
    
    console.log('🔧 Script de correção do cadastro inicializado com sucesso');
});