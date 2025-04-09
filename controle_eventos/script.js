/**
 * Script principal para o Sistema de Gestão de Orçamentos para Eventos
 */
document.addEventListener('DOMContentLoaded', function() {
    /**
     * Variáveis globais
     */
    let eventoAtual = null;
    let servicosEventoAtual = [];
    let orcamentosEventoAtual = [];
    let pagamentosEventoAtual = [];
    let anexosEventoAtual = [];
    let fornecedores = [];
    let editandoServico = false;
    let usuarioLogado = null;
    // Variáveis globais adicionais
    let isAdmin = false; // Flag para controlar se o usuário é admin
    
    // Elementos do DOM frequentemente utilizados
    const spinner = document.getElementById('spinner');
    const avisoConfiguracao = document.getElementById('aviso-configuracao');
    
    /**
     * Funções de utilidade
     */
    
    /**
     * Formata um valor para moeda brasileira
     * @param {number} valor - Valor a ser formatado
     * @returns {string} - Valor formatado
     */
    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    
    /**
     * Formata uma data para o formato brasileiro
     * @param {string} data - Data no formato ISO (YYYY-MM-DD)
     * @returns {string} - Data formatada (DD/MM/YYYY)
     */
    function formatarData(data) {
        if (!data) return '';
        const partes = data.split('-');
        if (partes.length !== 3) return data;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    
    /**
     * Gera um ID único
     * @returns {string} - ID gerado
     */
    function gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    /**
     * Mostra o spinner de carregamento
     */
    function mostrarSpinner() {
        spinner.style.display = 'flex';
    }
    
    /**
     * Esconde o spinner de carregamento
     */
    function esconderSpinner() {
        spinner.style.display = 'none';
    }
    
    /**
     * Mostra uma mensagem de alerta
     * @param {string} mensagem - Mensagem a ser exibida
     * @param {string} tipo - Tipo de alerta (success, danger, warning, info)
     */
    function mostrarAlerta(mensagem, tipo = 'danger') {
        const tituloAlerta = {
            'success': 'Sucesso',
            'danger': 'Erro',
            'warning': 'Atenção',
            'info': 'Informação'
        };
        
        document.getElementById('mensagem-alerta').innerHTML = mensagem;
        document.getElementById('modal-alerta-label').textContent = tituloAlerta[tipo] || 'Aviso';
        
        // Adiciona classe de cor ao modal
        const modalAlerta = document.getElementById('modal-alerta');
        modalAlerta.classList.remove('modal-success', 'modal-danger', 'modal-warning', 'modal-info');
        modalAlerta.classList.add(`modal-${tipo}`);
        
        const modal = new bootstrap.Modal(document.getElementById('modal-alerta'));
        modal.show();
    }
    
    /**
     * Navegação entre seções
     */
    
    /**
     * Esconde todas as seções
     */
    function esconderTodasSecoes() {
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active-section');
        });
    }
    
    /**
     * Mostra uma seção específica
     * @param {string} id - ID da seção a ser mostrada
     */
    function mostrarSecao(id) {
        esconderTodasSecoes();
        document.getElementById(id).classList.add('active-section');
    }
    
    /**
     * Inicialização e verificação do sistema
     */
    
    /**
     * Verifica se o sistema está configurado
     * @returns {boolean} - Verdadeiro se o sistema estiver configurado
     */
    function verificarConfiguracao() {
        const avisoConfiguracao = document.getElementById('aviso-configuracao');
        
        if (!api.isConfigured) {
            avisoConfiguracao.style.display = 'block';
            avisoConfiguracao.innerHTML = `
                <strong>Atenção!</strong> Configure o ID da planilha e a URL do Apps Script antes de começar.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
            `;
            return false;
        }
        
        avisoConfiguracao.style.display = 'none';
        return true;
    }
    
    /**
     * Inicializa o sistema
     */
    function inicializarSistema() {
        // Verifica se é o primeiro acesso
        if (api.firstAccess) {
            // Mostra a mensagem de primeiro acesso
            document.querySelector('.primeiro-acesso').style.display = 'block';
            mostrarSecao('cadastro-section');
            return;
        }
    
        // Verifica se o usuário está logado (através do localStorage)
        const usuarioSalvo = localStorage.getItem('usuarioLogado');
        if (usuarioSalvo) {
            try {
                usuarioLogado = JSON.parse(usuarioSalvo);
                document.getElementById('usuario-logado').textContent = `Olá, ${usuarioLogado.nome}`;
                
                // Define a flag de admin
                isAdmin = usuarioLogado.isAdmin || false;
                
                // Se for admin, mostra o item de menu de usuários
                if (isAdmin) {
                    document.getElementById('nav-usuarios').style.display = 'block';
                } else {
                    document.getElementById('nav-usuarios').style.display = 'none';
                }
                
                mostrarSecao('app-section');
                
                // Verifica se o sistema está configurado
                if (verificarConfiguracao()) {
                    carregarEventos();
                } else {
                    // Se não estiver configurado e for admin, redireciona para a seção de configurações
                    if (isAdmin) {
                        document.getElementById('nav-configuracoes').click();
                    } else {
                        mostrarAlerta('O sistema não está configurado. Por favor, contate o administrador.', 'warning');
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar usuário do localStorage:', error);
                mostrarSecao('login-section');
            }
        } else {
            mostrarSecao('login-section');
        }
    }
    
    function validarFormulario(form) {
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

    /**
     * Funções de Autenticação
     */
    
    /**
     * Realiza o login do usuário
     * @param {Event} event - Evento de submit do formulário
     */
    async function fazerLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;
        const mensagem = document.getElementById('login-mensagem');
        
        try {
            mostrarSpinner();
            const response = await api.login(email, senha);
            
            if (response.success) {
                usuarioLogado = response.usuario;
                isAdmin = usuarioLogado.isAdmin || false;
                
                // Salva o usuário no localStorage
                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
                
                // Atualiza o nome do usuário na interface
                document.getElementById('usuario-logado').textContent = `Olá, ${usuarioLogado.nome}`;
                
                // Se for admin, mostra o item de menu de usuários
                if (isAdmin) {
                    document.getElementById('nav-usuarios').style.display = 'block';
                } else {
                    document.getElementById('nav-usuarios').style.display = 'none';
                }
                
                // Redireciona para a tela principal
                mostrarSecao('app-section');
                
                // Se não estiver configurado e for admin, redireciona para configurações
                if (!api.isConfigured && isAdmin) {
                    document.getElementById('nav-configuracoes').click();
                } else if (api.isConfigured) {
                    carregarEventos();
                }
            } else {
                mensagem.innerHTML = `<div class="alert alert-danger">${response.error || 'Erro ao fazer login'}</div>`;
            }
        } catch (error) {
            mensagem.innerHTML = `<div class="alert alert-danger">${error.message || 'Erro ao fazer login'}</div>`;
        } finally {
            esconderSpinner();
        }
    }
    
    /**
     * Realiza o cadastro de um novo usuário
     * @param {Event} event - Evento de submit do formulário
     */
    async function cadastrarUsuario(event) {
        event.preventDefault();
        
        const nome = document.getElementById('cadastro-nome').value;
        const email = document.getElementById('cadastro-email').value;
        const senha = document.getElementById('cadastro-senha').value;
        const confirmaSenha = document.getElementById('cadastro-confirma-senha').value;
        const mensagem = document.getElementById('cadastro-mensagem');
        
        // Valida as senhas
        if (senha !== confirmaSenha) {
            mensagem.innerHTML = '<div class="alert alert-danger">As senhas não conferem</div>';
            return;
        }
        
        try {
            mostrarSpinner();
            const response = await api.cadastrarPrimeiroUsuario({ nome, email, senha });
            
            if (response.success) {
                mensagem.innerHTML = '<div class="alert alert-success">Administrador cadastrado com sucesso! Você já pode fazer login.</div>';
                
                // Limpa o formulário após o cadastro
                document.getElementById('cadastro-form').reset();
                
                // Redireciona para a tela de login após 2 segundos
                setTimeout(() => {
                    document.getElementById('link-login').click();
                    
                    // Esconde a mensagem de primeiro acesso
                    document.querySelector('.primeiro-acesso').style.display = 'none';
                }, 2000);
            } else {
                mensagem.innerHTML = `<div class="alert alert-danger">${response.error || 'Erro ao cadastrar usuário'}</div>`;
            }
        } catch (error) {
            mensagem.innerHTML = `<div class="alert alert-danger">${error.message || 'Erro ao cadastrar usuário'}</div>`;
        } finally {
            esconderSpinner();
        }
    }
    
    /**
     * Realiza o logout do usuário
     */
    function fazerLogout() {
        // Remove o usuário do localStorage
        localStorage.removeItem('usuarioLogado');
        usuarioLogado = null;
        
        // Redireciona para a tela de login
        mostrarSecao('login-section');
    }
    
    /**
     * Eventos
     */
    
    /**
     * Carrega a lista de eventos do usuário
     */
    async function carregarEventos() {
        if (!verificarConfiguracao()) return;
        
        try {
            mostrarSpinner();
            const response = await api.getEventos();
            
            const listaEventos = document.getElementById('lista-eventos');
            const semEventos = document.getElementById('sem-eventos');
            
            // Limpa a lista atual
            while (listaEventos.firstChild && listaEventos.firstChild !== semEventos) {
                listaEventos.removeChild(listaEventos.firstChild);
            }
            
            if (response.eventos && response.eventos.length > 0) {
                semEventos.style.display = 'none';
                
                // Adiciona cada evento à lista
                response.eventos.forEach(evento => {
                    const dataEvento = new Date(evento.data);
                    const hoje = new Date();
                    const diasRestantes = Math.ceil((dataEvento - hoje) / (1000 * 60 * 60 * 24));
                    
                    let statusClass = 'status-pendente';
                    let statusText = 'Pendente';
                    
                    if (dataEvento < hoje) {
                        statusClass = 'status-concluido';
                        statusText = 'Concluído';
                    } else if (diasRestantes <= 30) {
                        statusClass = 'status-ativo';
                        statusText = 'Próximo';
                    }
                    
                    // Calcular progresso do orçamento
                    const orcamentoAtual = evento.orcamentoAtual || 0;
                    const orcamentoMeta = evento.orcamentoMeta || 1; // Evita divisão por zero
                    const porcentagemOrcamento = Math.min(100, (orcamentoAtual / orcamentoMeta) * 100);
                    
                    const eventoHtml = `
                        <div class="col-md-4 col-lg-3 mb-4">
                            <div class="card card-evento evento-box" data-id="${evento.id}">
                                <div class="evento-status ${statusClass}"></div>
                                <div class="card-header">
                                    <h5 class="card-title mb-0">${evento.nome}</h5>
                                </div>
                                <div class="card-body">
                                    <p class="card-text"><i class="bi bi-calendar-event"></i> ${formatarData(evento.data)}</p>
                                    <p class="card-text"><i class="bi bi-people"></i> ${evento.convidados} convidados</p>
                                    <p class="card-text"><i class="bi bi-geo-alt"></i> ${evento.local}</p>
                                    
                                    <div class="mt-3">
                                        <div class="d-flex justify-content-between">
                                            <small>Orçamento</small>
                                            <small>${formatarMoeda(orcamentoAtual || 0)} / ${formatarMoeda(orcamentoMeta || 0)}</small>
                                        </div>
                                        <div class="progress mt-1">
                                            <div class="progress-bar" role="progressbar" style="width: ${porcentagemOrcamento}%;" aria-valuenow="${porcentagemOrcamento}" aria-valuemin="0" aria-valuemax="100"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-footer bg-transparent">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="badge ${statusClass === 'status-ativo' ? 'bg-success' : statusClass === 'status-pendente' ? 'bg-warning text-dark' : 'bg-primary'}">${statusText}</span>
                                        <button class="btn btn-sm btn-primary btn-ver-evento">Ver Detalhes</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    listaEventos.insertAdjacentHTML('beforeend', eventoHtml);
                });
                
                // Adiciona evento de clique aos botões "Ver Detalhes"
                document.querySelectorAll('.btn-ver-evento').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const eventoId = this.closest('.card-evento').dataset.id;
                        carregarDetalhesEvento(eventoId);
                    });
                });
            } else {
                semEventos.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            mostrarAlerta('Erro ao carregar eventos: ' + error.message);
        } finally {
            esconderSpinner();
        }
    }
    
    /**
     * Cria um novo evento
     * @param {Event} event - Evento de submit do formulário
     */
    async function criarEvento(event) {
        event.preventDefault();
        
        // Coleta os dados do formulário
        const nomeEvento = document.getElementById('nome-evento').value;
        const tipoEvento = document.getElementById('tipo-evento').value;
        const dataEvento = document.getElementById('data-evento').value;
        const numConvidados = document.getElementById('numero-convidados').value;
        const localEvento = document.getElementById('local-evento').value;
        const orcamentoMeta = document.getElementById('orcamento-meta').value;
        const descricaoEvento = document.getElementById('descricao-evento').value;
        
        // Coleta os serviços
        const servicos = [];
        document.querySelectorAll('.servico-item').forEach(item => {
            const nome = item.querySelector('.servico-nome').value;
            const descricao = item.querySelector('.servico-descricao').value;
            
            if (nome) {
                servicos.push({
                    id: gerarId(),
                    nome,
                    descricao,
                    status: 'Pendente'
                });
            }
        });
        
        // Monta o objeto do evento
        const evento = {
            nome: nomeEvento,
            tipo: tipoEvento,
            data: dataEvento,
            convidados: parseInt(numConvidados),
            local: localEvento,
            orcamentoMeta: parseFloat(orcamentoMeta),
            descricao: descricaoEvento,
            servicos
        };
        
        try {
            mostrarSpinner();
            const response = await api.criarEvento(evento);
            
            if (response.success) {
                mostrarAlerta('Evento criado com sucesso!', 'success');
                
                // Limpa o formulário
                document.getElementById('form-novo-evento').reset();
                
                // Recarrega a lista de eventos
                await carregarEventos();
                
                // Volta para a lista de eventos
                mostrarSecao('eventos-section');
            } else {
                mostrarAlerta('Erro ao criar evento: ' + (response.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            mostrarAlerta('Erro ao criar evento: ' + error.message);
        } finally {
            esconderSpinner();
        }
    }
    
    /**
     * Carrega os detalhes de um evento
     * @param {string} eventoId - ID do evento
     */
    async function carregarDetalhesEvento(eventoId) {
        try {
            mostrarSpinner();
            const response = await api.getEvento(eventoId);
            
            if (response.success) {
                eventoAtual = response.evento;
                
                // Preenche os dados do evento no formulário de edição
                document.getElementById('titulo-evento').textContent = eventoAtual.nome;
                document.getElementById('edit-nome-evento').value = eventoAtual.nome;
                document.getElementById('edit-tipo-evento').value = eventoAtual.tipo;
                document.getElementById('edit-data-evento').value = eventoAtual.data;
                document.getElementById('edit-numero-convidados').value = eventoAtual.convidados;
                document.getElementById('edit-local-evento').value = eventoAtual.local;
                document.getElementById('edit-orcamento-meta').value = eventoAtual.orcamentoMeta;
                document.getElementById('edit-descricao-evento').value = eventoAtual.descricao;
                
                // Carrega os serviços do evento
                await carregarServicosEvento(eventoId);
                
                // Carrega os orçamentos do evento
                await carregarOrcamentosEvento(eventoId);
                
                // Carrega os pagamentos do evento
                await carregarPagamentosEvento(eventoId);
                
                // Carrega os anexos do evento
                await carregarAnexosEvento(eventoId);
                
                // Atualiza os valores na aba financeira
                document.getElementById('valor-meta-orcamento').textContent = formatarMoeda(eventoAtual.orcamentoMeta || 0);
                
                const totalPrevisto = orcamentosEventoAtual
                    .filter(o => o.status === 'Aprovado')
                    .reduce((total, o) => total + (parseFloat(o.valor) || 0), 0);
                
                const totalPago = pagamentosEventoAtual
                    .filter(p => p.status === 'Pago')
                    .reduce((total, p) => total + (parseFloat(p.valor) || 0), 0);
                
                document.getElementById('valor-total-previsto').textContent = formatarMoeda(totalPrevisto);
                document.getElementById('valor-total-pago').textContent = formatarMoeda(totalPago);
                
                // Redireciona para a página de detalhes do evento
                mostrarSecao('detalhes-evento-section');
            } else {
                mostrarAlerta('Erro ao carregar detalhes do evento: ' + (response.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do evento:', error);
            mostrarAlerta('Erro ao carregar detalhes do evento: ' + error.message);
        } finally {
            esconderSpinner();
        }
    }
    
    /**
     * Atualiza os dados de um evento
     * @param {Event} event - Evento de submit do formulário
     */
    async function atualizarEvento(event) {
        event.preventDefault();
        
        if (!eventoAtual) {
            mostrarAlerta('Nenhum evento selecionado para edição');
            return;
        }
        
        // Coleta os dados do formulário
        const nomeEvento = document.getElementById('edit-nome-evento').value;
        const tipoEvento = document.getElementById('edit-tipo-evento').value;
        const dataEvento = document.getElementById('edit-data-evento').value;
        const numConvidados = document.getElementById('edit-numero-convidados').value;
        const localEvento = document.getElementById('edit-local-evento').value;
        const orcamentoMeta = document.getElementById('edit-orcamento-meta').value;
        const descricaoEvento = document.getElementById('edit-descricao-evento').value;
        
        // Monta o objeto do evento
        const evento = {
            nome: nomeEvento,
            tipo: tipoEvento,
            data: dataEvento,
            convidados: parseInt(numConvidados),
            local: localEvento,
            orcamentoMeta: parseFloat(orcamentoMeta),
            descricao: descricaoEvento
        };
        
        try {
            mostrarSpinner();
            const response = await api.atualizarEvento(eventoAtual.id, evento);
            
            if (response.success) {
                mostrarAlerta('Evento atualizado com sucesso!', 'success');
                
                // Atualiza os dados do evento atual
                eventoAtual = { ...eventoAtual, ...evento };
                
                // Atualiza o título da página
                document.getElementById('titulo-evento').textContent = eventoAtual.nome;
                
                // Atualiza os valores na aba financeira
                document.getElementById('valor-meta-orcamento').textContent = formatarMoeda(eventoAtual.orcamentoMeta || 0);
            } else {
                mostrarAlerta('Erro ao atualizar evento: ' + (response.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            mostrarAlerta('Erro ao atualizar evento: ' + error.message);
        } finally {
            esconderSpinner();
        }
    }
    
    /**
     * Exclui um evento
     */
    async function excluirEvento() {
        if (!eventoAtual) {
            mostrarAlerta('Nenhum evento selecionado para exclusão');
            return;
        }
        
        // Confirma a exclusão
        const modal = document.getElementById('modal-confirmacao');
        document.getElementById('mensagem-confirmacao').textContent = `Tem certeza que deseja excluir o evento "${eventoAtual.nome}"? Esta ação não pode ser desfeita.`;
        
        const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
        
        // Remove qualquer listener anterior para evitar duplicação
        const novoBtn = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
        
        // Adiciona o listener para o botão de confirmação
        novoBtn.addEventListener('click', async function() {
            try {
                mostrarSpinner();
                const response = await api.excluirEvento(eventoAtual.id);
                
                if (response.success) {
                    // Fecha o modal
                    const modalConfirmacao = bootstrap.Modal.getInstance(modal);
                    modalConfirmacao.hide();
                    
                    mostrarAlerta('Evento excluído com sucesso!', 'success');
                    
                    // Recarrega a lista de eventos
                    await carregarEventos();
                    
                    // Volta para a lista de eventos
                    mostrarSecao('eventos-section');
                } else {
                    mostrarAlerta('Erro ao excluir evento: ' + (response.error || 'Erro desconhecido'));
                }
            } catch (error) {
                console.error('Erro ao excluir evento:', error);
                mostrarAlerta('Erro ao excluir evento: ' + error.message);
            } finally {
                esconderSpinner();
            }
        });
        
        // Mostra o modal de confirmação
        const modalConfirmacao = new bootstrap.Modal(modal);
        modalConfirmacao.show();
    }
    
    /**
     * Serviços
     */
    
    /**
     * Carrega os serviços de um evento
     * @param {string} eventoId - ID do evento
     */
    async function carregarServicosEvento(eventoId) {
        try {
            const response = await api.getServicos(eventoId);
            
            if (response.success) {
                servicosEventoAtual = response.servicos || [];
                
                // Preenche a lista de serviços na aba de serviços
                const servicosContainer = document.getElementById('servicos-edit-container');
                servicosContainer.innerHTML = '';
                
                if (servicosEventoAtual.length > 0) {
                    servicosEventoAtual.forEach((servico, index) => {
                        const servicoHtml = `
                            <div class="servico-item mb-3 p-3 border rounded" data-id="${servico.id}">
                                <div class="row align-items-center">
                                    <div class="col-md-4 mb-2 mb-md-0">
                                        <label class="form-label">Nome do serviço</label>
                                        <input type="text" class="form-control servico-nome-edit" value="${servico.nome}" required>
                                    </div>
                                    <div class="col-md-4 mb-2 mb-md-0">
                                        <label class="form-label">Descrição</label>
                                        <input type="text" class="form-control servico-descricao-edit" value="${servico.descricao || ''}">
                                    </div>
                                    <div class="col-md-3 mb-2 mb-md-0">
                                        <label class="form-label">Status</label>
                                        <select class="form-select servico-status-edit">
                                            <option value="Pendente" ${servico.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                                            <option value="Em andamento" ${servico.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>
                                            <option value="Concluído" ${servico.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                                            <option value="Cancelado" ${servico.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
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
                        
                        servicosContainer.insertAdjacentHTML('beforeend', servicoHtml);
                    });
                    
                    // Adiciona eventos para os botões de remover serviço
                    document.querySelectorAll('.btn-remover-servico-edit').forEach(btn => {
                        btn.addEventListener('click', function() {
                            this.closest('.servico-item').remove();
                        });
                    });
                } else {
                    servicosContainer.innerHTML = `
                        <div class="alert alert-info">
                            Nenhum serviço cadastrado para este evento. Adicione serviços usando o botão acima.
                        </div>
                    `;
                }
            } else {
                console.error('Erro ao carregar serviços do evento:', response.error);
            }
        } catch (error) {
            console.error('Erro ao carregar serviços do evento:', error);
        }
    }
    
    /**
     * Adiciona um novo serviço à lista
     * @param {string} container - ID do container onde o serviço será adicionado
     */
    function adicionarServico(container = 'servicos-container') {
        const servicosContainer = document.getElementById(container);
        
        const servicoHtml = `
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
        
        servicosContainer.insertAdjacentHTML('beforeend', servicoHtml);
        
        // Adiciona evento para o botão de remover serviço
        const btnRemover = servicosContainer.lastElementChild.querySelector('.btn-remover-servico');
        btnRemover.addEventListener('click', function() {
            this.closest('.servico-item').remove();
        });
    }
    
    /**
     * Adiciona um novo serviço à lista de edição
     */
    function adicionarServicoEdit() {
        const servicosContainer = document.getElementById('servicos-edit-container');
        
        const servicoHtml = `
            <div class="servico-item mb-3 p-3 border rounded" data-id="${gerarId()}">
                <div class="row align-items-center">
                    <div class="col-md-4 mb-2 mb-md-0">
                        <label class="form-label">Nome do serviço</label>
                        <input type="text" class="form-control servico-nome-edit" required>
                    </div>
                    <div class="col-md-4 mb-2 mb-md-0">
                        <label class="form-label">Descrição</label>
                        <input type="text" class="form-control servico-descricao-edit">
                    </div>
                    <div class="col-md-3 mb-2 mb-md-0">
                        <label class="form-label">Status</label>
                        <select class="form-select servico-status-edit">
                            <option value="Pendente">Pendente</option>
                            <option value="Em andamento">Em andamento</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Cancelado">Cancelado</option>
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
        
        servicosContainer.insertAdjacentHTML('beforeend', servicoHtml);
        
        // Adiciona evento para o botão de remover serviço
        const btnRemover = servicosContainer.lastElementChild.querySelector('.btn-remover-servico-edit');
        btnRemover.addEventListener('click', function() {
            this.closest('.servico-item').remove();
        });
    }
    
    /**
     * Salva os serviços de um evento
     */
    async function salvarServicos() {
        if (!eventoAtual) {
            mostrarAlerta('Nenhum evento selecionado');
            return;
        }
        
        // Coleta os serviços da interface
        const servicos = [];
        document.querySelectorAll('#servicos-edit-container .servico-item').forEach(item => {
            const id = item.dataset.id;
            const nome = item.querySelector('.servico-nome-edit').value;
            const descricao = item.querySelector('.servico-descricao-edit').value;
            const status = item.querySelector('.servico-status-edit').value;
            
            if (nome) {
                servicos.push({
                    id,
                    nome,
                    descricao,
                    status
                });
            }
        });
        
        try {
            mostrarSpinner();
            const response = await api.atualizarServicos(eventoAtual.id, servicos);
            
            if (response.success) {
                mostrarAlerta('Serviços atualizados com sucesso!', 'success');
                
                // Atualiza os serviços do evento atual
                servicosEventoAtual = servicos;
            } else {
                mostrarAlerta('Erro ao atualizar serviços: ' + (response.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao atualizar serviços:', error);
            mostrarAlerta('Erro ao atualizar serviços: ' + error.message);
        } finally {
            esconderSpinner();
        }
    }
    
    /**
     * Orçamentos
     */
    
    /**
     * Carrega os orçamentos de um evento
     * @param {string} eventoId - ID do evento
     */
    async function carregarOrcamentosEvento(eventoId) {
        try {
            const response = await api.getOrcamentos(eventoId);
            
            if (response.success) {
                orcamentosEventoAtual = response.orcamentos || [];
                
                // Preenche a tabela de orçamentos
                const listaOrcamentos = document.getElementById('lista-orcamentos');
                listaOrcamentos.innerHTML = '';
                
                if (orcamentosEventoAtual.length > 0) {
                    orcamentosEventoAtual.forEach(orcamento => {
                        let statusClass = 'secondary';
                        if (orcamento.status === 'Aprovado') statusClass = 'success';
                        if (orcamento.status === 'Rejeitado') statusClass = 'danger';
                        
                        const orcamentoHtml = `
                            <tr data-id="${orcamento.id}">
                                <td>${orcamento.servico}</td>
                                <td>${orcamento.fornecedor}</td>
                                <td>${formatarMoeda(orcamento.valor || 0)}</td>
                                <td>${formatarData(orcamento.data)}</td>
                                <td><span class="badge bg-${statusClass}">${orcamento.status}</span></td>
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
                        
                        listaOrcamentos.insertAdjacentHTML('beforeend', orcamentoHtml);
                    });
                    
                    // Adiciona eventos para os botões de editar e excluir
                    document.querySelectorAll('.btn-editar-orcamento').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const orcamentoId = this.closest('tr').dataset.id;
                            const orcamento = orcamentosEventoAtual.find(o => o.id === orcamentoId);
                            if (orcamento) {
                                abrirModalOrcamento(orcamento);
                            }
                        });
                    });
                    
                    document.querySelectorAll('.btn-excluir-orcamento').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const orcamentoId = this.closest('tr').dataset.id;
                            const orcamento = orcamentosEventoAtual.find(o => o.id === orcamentoId);
                            if (orcamento) {
                                confirmarExclusaoOrcamento(orcamento);
                            }
                        });
                    });
                } else {
                    listaOrcamentos.innerHTML = `
                        <tr>
                            <td colspan="6" class="text-center">Nenhum orçamento cadastrado para este evento.</td>
                        </tr>
                    `;
                }
            } else {
                console.error('Erro ao carregar orçamentos do evento:', response.error);
            }
        } catch (error) {
            console.error('Erro ao carregar orçamentos do evento:', error);
        }
    }
    
    /**
     * Abre o modal para criar/editar um orçamento
     * @param {Object} orcamento - Orçamento a ser editado (opcional)
     */
    function abrirModalOrcamento(orcamento = null) {
        const modalTitle = document.getElementById('modal-orcamento-label');
        const formOrcamento = document.getElementById('form-orcamento');
        
        modalTitle.textContent = orcamento ? 'Editar Orçamento' : 'Novo Orçamento';
        formOrcamento.reset();
        
        // Preenche o formulário se for edição
        if (orcamento) {
            document.getElementById('orcamento-id').value = orcamento.id;
            
            // Os outros campos serão preenchidos após carregar os serviços e fornecedores
        } else {
            document.getElementById('orcamento-id').value = '';
        }
        
        // Preenche o select de serviços
        const selectServico = document.getElementById('orcamento-servico');
        selectServico.innerHTML = '<option value="">Selecione um serviço...</option>';
        
        servicosEventoAtual.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.nome;
            option.textContent = servico.nome;
            selectServico.appendChild(option);
        });
        
        // Preenche o select de fornecedores
        carregarFornecedoresSelect('orcamento-fornecedor', async () => {
            // Após carregar os fornecedores, preenche os outros campos se for edição
            if (orcamento) {
                document.getElementById('orcamento-servico').value = orcamento.servico;
                document.getElementById('orcamento-fornecedor').value = orcamento.fornecedor;
                document.getElementById('orcamento-valor').value = orcamento.valor;
                document.getElementById('orcamento-data').value = orcamento.data;
                document.getElementById('orcamento-status').value = orcamento.status;
                document.getElementById('orcamento-detalhes').value = orcamento.detalhes || '';
            } else {
                // Define a data atual para novos orçamentos
                document.getElementById('orcamento-data').value = new Date().toISOString().split('T')[0];
            }
            
            // Mostra o modal
            const modal = new bootstrap.Modal(document.getElementById('modal-orcamento'));
            modal.show();
        });
    }
    
    /**
     * Salva um orçamento (novo ou editado)
     */
    async function salvarOrcamento() {
        const orcamentoId = document.getElementById('orcamento-id').value;
        
        // Coleta os dados do formulário
        const servico = document.getElementById('orcamento-servico').value;
        const fornecedor = document.getElementById('orcamento-fornecedor').value;
        const valor = document.getElementById('orcamento-valor').value;
        const data = document.getElementById('orcamento-data').value;
        const status = document.getElementById('orcamento-status').value;
        const detalhes = document.getElementById('orcamento-detalhes').value;
        
        // Validação básica
        if (!servico || !fornecedor || !valor || !data || !status) {
            mostrarAlerta('Preencha todos os campos obrigatórios');
            return;
        }
        
        // Monta o objeto do orçamento
        const orcamento = {
            servico,
            fornecedor,
            valor: parseFloat(valor),
            data,
            status,
            detalhes
        };
        
        try {
            mostrarSpinner();
            let response;
            
            if (orcamentoId) {
                // Edição
                response = await api.atualizarOrcamento(eventoAtual.id, orcamentoId, orcamento);
            } else {
                // Novo
                response = await api.criarOrcamento(eventoAtual.id, orcamento);
            }
            
            if (response.success) {
                // Fecha o modal
                const modalOrcamento = bootstrap.Modal.getInstance(document.getElementById('modal-orcamento'));
                modalOrcamento.hide();
                
                mostrarAlerta('Orçamento salvo com sucesso!', 'success');
                
                // Recarrega os orçamentos
                await carregarOrcamentosEvento(eventoAtual.id);
                
                // Recarrega os pagamentos para atualizar os valores
                await carregarPagamentosEvento(eventoAtual.id);
                
                // Atualiza os valores na aba financeira
                const totalPrevisto = orcamentosEventoAtual
                    .filter(o => o.status === 'Aprovado')
                    .reduce((total, o) => total + (parseFloat(o.valor) || 0), 0);
                
                const totalPago = pagamentosEventoAtual
                    .filter(p => p.status === 'Pago')
                    .reduce((total, p) => total + (parseFloat(p.valor) || 0), 0);
                
                document.getElementById('valor-total-previsto').textContent = formatarMoeda(totalPrevisto);
                document.getElementById('valor-total-pago').textContent = formatarMoeda(totalPago);
            } else {
                mostrarAlerta('Erro ao salvar orçamento: ' + (response.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao salvar orçamento:', error);
            mostrarAlerta('Erro ao salvar orçamento: ' + error.message);
        } finally {
            esconderSpinner();
        }
    }
    
    /**
     * Confirma a exclusão de um orçamento
     * @param {Object} orcamento - Orçamento a ser excluído
     */
    function confirmarExclusaoOrcamento(orcamento) {
        // Confirma a exclusão
        const modal = document.getElementById('modal-confirmacao');
        document.getElementById('mensagem-confirmacao').textContent = `Tem certeza que deseja excluir o orçamento do serviço "${orcamento.servico}" com o fornecedor "${orcamento.fornecedor}"?`;
        
        const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
        
        // Remove qualquer listener anterior para evitar duplicação
        const novoBtn = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
        
        // Adiciona o listener para o botão de confirmação
        novoBtn.addEventListener('click', async function() {
            try {
                mostrarSpinner();
                const response = await api.excluirOrcamento(eventoAtual.id, orcamento.id);
                
                if (response.success) {
                    // Fecha o modal
                    const modalConfirmacao = bootstrap.Modal.getInstance(modal);
                    modalConfirmacao.hide();
                    
                    mostrarAlerta('Orçamento excluído com sucesso!', 'success');
                    
                    // Recarrega os orçamentos
                    await carregarOrcamentosEvento(eventoAtual.id);
                    
                    // Atualiza os valores na aba financeira
                    const totalPrevisto = orcamentosEventoAtual
                        .filter(o => o.status === 'Aprovado')
                        .reduce((total, o) => total + (parseFloat(o.valor) || 0), 0);
                    
                    document.getElementById('valor-total-previsto').textContent = formatarMoeda(totalPrevisto);
                } else {
                    mostrarAlerta('Erro ao excluir orçamento: ' + (response.error || 'Erro desconhecido'));
                }
            } catch (error) {
                console.error('Erro ao excluir orçamento:', error);
                mostrarAlerta('Erro ao excluir orçamento: ' + error.message);
            } finally {
                esconderSpinner();
            }
        });
        
        // Mostra o modal de confirmação
        const modalConfirmacao = new bootstrap.Modal(modal);
        modalConfirmacao.show();
    }
    
    /**
     * Fornecedores
     */
    
    /**
     * Carrega a lista de fornecedores
     */
    async function carregarFornecedores() {
        if (!verificarConfiguracao()) return;
        
        try {
            mostrarSpinner();
            const response = await api.getFornecedores();
            
            fornecedores = response.fornecedores || [];
            
            const listaFornecedores = document.getElementById('lista-fornecedores');
            listaFornecedores.innerHTML = '';
            
            if (fornecedores.length > 0) {
                fornecedores.forEach(fornecedor => {
                    // Gera HTML para exibir a avaliação (estrelas)
                    let htmlEstrelas = '';
                    for (let i = 1; i <= 5; i++) {
                        if (i <= fornecedor.avaliacao) {
                            htmlEstrelas += '<i class="bi bi-star-fill text-warning"></i>';
                        } else {
                            htmlEstrelas += '<i class="bi bi-star text-secondary"></i>';
                        }
                    }
                    
                    const fornecedorHtml = `
                        <tr data-id="${fornecedor.id}">
                            <td>${fornecedor.nome}</td>
                            <td>${fornecedor.categoria}</td>
                            <td>${fornecedor.contato || '-'}</td>
                            <td>${fornecedor.email || '-'}</td>
                            <td>${fornecedor.telefone || '-'}</td>
                            <td>${htmlEstrelas}</td>
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
                    
                    listaFornecedores.insertAdjacentHTML('beforeend', fornecedorHtml);
                });
                
                // Adiciona eventos para os botões de editar e excluir
                document.querySelectorAll('.btn-editar-fornecedor').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const fornecedorId = this.closest('tr').dataset.id;
                        const fornecedor = fornecedores.find(f => f.id === fornecedorId);
                        if (fornecedor) {
                            abrirModalFornecedor(fornecedor);
                        }
                    });
                });
                
                document.querySelectorAll('.btn-excluir-fornecedor').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const fornecedorId = this.closest('tr').dataset.id;
                        const fornecedor = fornecedores.find(f => f.id === fornecedorId);
                        if (fornecedor) {
                            confirmarExclusaoFornecedor(fornecedor);
                        }
                    });
                });
                
                // Inicializa o DataTable
                if ($.fn.DataTable.isDataTable('#tabela-fornecedores')) {
                    $('#tabela-fornecedores').DataTable().destroy();
                }
                
                $('#tabela-fornecedores').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json'
                    },
                    responsive: true
                });
            } else {
                listaFornecedores.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">Nenhum fornecedor cadastrado.</td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error);
            mostrarAlerta('Erro ao carregar fornecedores: ' + error.message);
        } finally {
            esconderSpinner();
        }
    }
    
    /**
     * Carrega a lista de fornecedores em um select
     * @param {string} selectId - ID do elemento select
     * @param {function} callback - Função a ser chamada após carregar os fornecedores
     */
    async function carregarFornecedoresSelect(selectId, callback = null) {
        try {
            if (fornecedores.length === 0) {
                const response = await api.getFornecedores();
                fornecedores = response.fornecedores || [];
            }
            
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Selecione um fornecedor...</option>';
            
            fornecedores.forEach(fornecedor => {
                const option = document.createElement('option');
                option.value = fornecedor.nome;
                option.textContent = fornecedor.nome;
                select.appendChild(option);
            });
            
            if (callback) callback();
        } catch (error) {
            console.error('Erro ao carregar fornecedores para select:', error);
        }
    }
    
    /**
     * Abre o modal para criar/editar um fornecedor
     * @param {Object} fornecedor - Fornecedor a ser editado (opcional)
     */
    function abrirModalFornecedor(fornecedor = null) {
        const modalTitle = document.getElementById('modal-fornecedor-label');
        const formFornecedor = document.getElementById('form-fornecedor');
        
        modalTitle.textContent = fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor';
        formFornecedor.reset();
        
        // Reseta a avaliação (estrelas)
        document.querySelectorAll('#fornecedor-avaliacao i').forEach(estrela => {
            estrela.classList.remove('active');
            estrela.classList.remove('bi-star-fill');
            estrela.classList.add('bi-star');
        });
        
        // Preenche o formulário se for edição
        if (fornecedor) {
            document.getElementById('fornecedor-id').value = fornecedor.id;
            document.getElementById('fornecedor-nome').value = fornecedor.nome;
            document.getElementById('fornecedor-categoria').value = fornecedor.categoria;
            document.getElementById('fornecedor-contato').value = fornecedor.contato || '';
            document.getElementById('fornecedor-email').value = fornecedor.email || '';
            document.getElementById('fornecedor-telefone').value = fornecedor.telefone || '';
            document.getElementById('fornecedor-observacoes').value = fornecedor.observacoes || '';
            document.getElementById('fornecedor-rating-value').value = fornecedor.avaliacao || 0;
            
            // Atualiza a visualização das estrelas
            if (fornecedor.avaliacao) {
                for (let i = 1; i <= fornecedor.avaliacao; i++) {
                    const estrela = document.querySelector(`#fornecedor-avaliacao i[data-rating="${i}"]`);
                    if (estrela) {
                        estrela.classList.add('active');
                        estrela.classList.remove('bi-star');
                        estrela.classList.add('bi-star-fill');
                    }
                }
            }
        } else {
            document.getElementById('fornecedor-id').value = '';
            document.getElementById('fornecedor-rating-value').value = 0;
        }
        
        // Mostra o modal
        const modal = new bootstrap.Modal(document.getElementById('modal-fornecedor'));
        modal.show();
    }
    
    /**
     * Salva um fornecedor (novo ou editado)
     */
    async function salvarFornecedor() {
        const fornecedorId = document.getElementById('fornecedor-id').value;
        
        // Coleta os dados do formulário
        const nome = document.getElementById('fornecedor-nome').value;
        const categoria = document.getElementById('fornecedor-categoria').value;
        const contato = document.getElementById('fornecedor-contato').value;
        const email = document.getElementById('fornecedor-email').value;
        const telefone = document.getElementById('fornecedor-telefone').value;
        const avaliacao = document.getElementById('fornecedor-rating-value').value;
        const observacoes = document.getElementById('fornecedor-observacoes').value;
        
        // Validação básica
        if (!nome || !categoria) {
            mostrarAlerta('Preencha todos os campos obrigatórios');
            return;
        }
        
        // Monta o objeto do fornecedor
        const fornecedor = {
            nome,
            categoria,
            contato,
            email,
            telefone,
            avaliacao: parseInt(avaliacao) || 0,
            observacoes
        };
        
        try {
            mostrarSpinner();
            let response;
            
            if (fornecedorId) {
                // Edição
                response = await api.atualizarFornecedor(fornecedorId, fornecedor);
            } else {
                // Novo
                response = await api.criarFornecedor(fornecedor);
            }
            
            if (response.success) {
                // Fecha o modal
                const modalFornecedor = bootstrap.Modal.getInstance(document.getElementById('modal-fornecedor'));
                modalFornecedor.hide();
                
                mostrarAlerta('Fornecedor salvo com sucesso!', 'success');
                
                // Recarrega os fornecedores
                await carregarFornecedores();
            } else {
                mostrarAlerta('Erro ao salvar fornecedor: ' + (response.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao salvar fornecedor:', error);
            mostrarAlerta('Erro ao salvar fornecedor: ' + error.message);
        } finally {
            esconderSpinner();
        }
    }
    
    /**
     * Confirma a exclusão de um fornecedor
     * @param {Object} fornecedor - Fornecedor a ser excluído
     */
    function confirmarExclusaoFornecedor(fornecedor) {
        // Confirma a exclusão
        const modal = document.getElementById('modal-confirmacao');
        document.getElementById('mensagem-confirmacao').textContent = `Tem certeza que deseja excluir o fornecedor "${fornecedor.nome}"?`;
        
        const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
        
        // Remove qualquer listener anterior para evitar duplicação
        const novoBtn = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
        
        // Adiciona o listener para o botão de confirmação
        novoBtn.addEventListener('click', async function() {
            try {
                mostrarSpinner();
                const response = await api.excluirFornecedor(fornecedor.id);
                
                if (response.success) {
                    // Fecha o modal
                    const modalConfirmacao = bootstrap.Modal.getInstance(modal);
                    modalConfirmacao.hide();
                    
                    mostrarAlerta('Fornecedor excluído com sucesso!', 'success');
                    
                    // Recarrega os fornecedores
                    await carregarFornecedores();
                } else {
                    mostrarAlerta('Erro ao excluir fornecedor: ' + (response.error || 'Erro desconhecido'));
                }
            } catch (error) {
                console.error('Erro ao excluir fornecedor:', error);
                mostrarAlerta('Erro ao excluir fornecedor: ' + error.message);
            } finally {
                esconderSpinner();
            }
        });
        
        // Mostra o modal de confirmação
        const modalConfirmacao = new bootstrap.Modal(modal);
        modalConfirmacao.show();
    }
    
    /**
     * Pagamentos
     */
    
    /**
     * Carrega os pagamentos de um evento
     * @param {string} eventoId - ID do evento
     */
    async function carregarPagamentosEvento(eventoId) {
        try {
            const response = await api.getPagamentos(eventoId);
            
            if (response.success) {
                pagamentosEventoAtual = response.pagamentos || [];
                
                // Preenche a tabela de pagamentos
                const listaPagamentos = document.getElementById('lista-pagamentos');
                listaPagamentos.innerHTML = '';
                
                if (pagamentosEventoAtual.length > 0) {
                    pagamentosEventoAtual.forEach(pagamento => {
                        let statusClass = 'secondary';
                        if (pagamento.status === 'Pago') statusClass = 'success';
                        if (pagamento.status === 'Atrasado') statusClass = 'danger';
                        
                        const pagamentoHtml = `
                            <tr data-id="${pagamento.id}">
                                <td>${pagamento.descricao}</td>
                                <td>${pagamento.fornecedor}</td>
                                <td>${formatarMoeda(pagamento.valor || 0)}</td>
                                <td>${formatarData(pagamento.vencimento)}</td>
                                <td><span class="badge bg-${statusClass}">${pagamento.status}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary btn-editar-pagamento">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger btn-excluir-pagamento">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                        
                        listaPagamentos.insertAdjacentHTML('beforeend', pagamentoHtml);
                    });
                    
                    // Adiciona eventos para os botões de editar e excluir
                    document.querySelectorAll('.btn-editar-pagamento').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const pagamentoId = this.closest('tr').dataset.id;
                            const pagamento = pagamentosEventoAtual.find(p => p.id === pagamentoId);
                            if (pagamento) {
                                abrirModalPagamento(pagamento);
                            }
                        });
                    });
                    
                    document.querySelectorAll('.btn-excluir-pagamento').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const pagamentoId = this.closest('tr').dataset.id;
                            const pagamento = pagamentosEventoAtual.find(p => p.id === pagamentoId);
                            if (pagamento) {
                                confirmarExclusaoPagamento(pagamento);
                            }
                        });
                    });
                } else {
                    listaPagamentos.innerHTML = `
                        <tr>
                            <td colspan="6" class="text-center">Nenhum pagamento cadastrado para este evento.</td>
                        </tr>
                    `;
                }
            } else {
                console.error('Erro ao carregar pagamentos do evento:', response.error);
            }
        } catch (error) {
            console.error('Erro ao carregar pagamentos do evento:', error);
        }
    }
    
    /**
     * Abre o modal para criar/editar um pagamento
     * @param {Object} pagamento - Pagamento a ser editado (opcional)
     */
    function abrirModalPagamento(pagamento = null) {
        const modalTitle = document.getElementById('modal-pagamento-label');
        const formPagamento = document.getElementById('form-pagamento');
        
        modalTitle.textContent = pagamento ? 'Editar Pagamento' : 'Novo Pagamento';
        formPagamento.reset();
        
        // Preenche o formulário se for edição
        if (pagamento) {
            document.getElementById('pagamento-id').value = pagamento.id;
            document.getElementById('pagamento-descricao').value = pagamento.descricao;
            document.getElementById('pagamento-valor').value = pagamento.valor;
            document.getElementById('pagamento-vencimento').value = pagamento.vencimento;
            document.getElementById('pagamento-status').value = pagamento.status;
            document.getElementById('pagamento-data-pagamento').value = pagamento.dataPagamento || '';
            document.getElementById('pagamento-observacoes').value = pagamento.observacoes || '';
            
            // Os outros campos serão preenchidos após carregar os fornecedores
        } else {
            document.getElementById('pagamento-id').value = '';
            
            // Define a data de vencimento como 30 dias a partir de hoje para novos pagamentos
            const dataVencimento = new Date();
            dataVencimento.setDate(dataVencimento.getDate() + 30);
            document.getElementById('pagamento-vencimento').value = dataVencimento.toISOString().split('T')[0];
        }
        
        // Preenche o select de fornecedores
        carregarFornecedoresSelect('pagamento-fornecedor', async () => {
            // Após carregar os fornecedores, preenche os outros campos se for edição
            if (pagamento) {
                document.getElementById('pagamento-fornecedor').value = pagamento.fornecedor;
            }
            
            // Mostra o modal
            const modal = new bootstrap.Modal(document.getElementById('modal-pagamento'));
            modal.show();
        });
    }
    
    /**
     * Salva um pagamento (novo ou editado)
     */
    async function salvarPagamento() {
        const pagamentoId = document.getElementById('pagamento-id').value;
        
        // Coleta os dados do formulário
        const descricao = document.getElementById('pagamento-descricao').value;
        const fornecedor = document.getElementById('pagamento-fornecedor').value;
        const valor = document.getElementById('pagamento-valor').value;
        const vencimento = document.getElementById('pagamento-vencimento').value;
        const status = document.getElementById('pagamento-status').value;
        const dataPagamento = document.getElementById('pagamento-data-pagamento').value;
        const observacoes = document.getElementById('pagamento-observacoes').value;
        
        // Validação básica
        if (!descricao || !fornecedor || !valor || !vencimento || !status) {
            mostrarAlerta('Preencha todos os campos obrigatórios');
            return;
        }
        
        // Monta o objeto do pagamento
        const pagamento = {
            descricao,
            fornecedor,
            valor: parseFloat(valor),
            vencimento,
            status,
            dataPagamento,
            observacoes
        };
        
        try {
            mostrarSpinner();
            let response;
            
            if (pagamentoId) {
                // Edição
                response = await api.atualizarPagamento(eventoAtual.id, pagamentoId, pagamento);
            } else {
                // Novo
                response = await api.criarPagamento(eventoAtual.id, pagamento);
            }
            
            if (response.success) {
                // Fecha o modal
                const modalPagamento = bootstrap.Modal.getInstance(document.getElementById('modal-pagamento'));
                modalPagamento.hide();
                
                mostrarAlerta('Pagamento salvo com sucesso!', 'success');
                
                // Recarrega os pagamentos
                await carregarPagamentosEvento(eventoAtual.id);
                
                // Atualiza os valores na aba financeira
                const totalPago = pagamentosEventoAtual
                    .filter(p => p.status === 'Pago')
                    .reduce((total, p) => total + (parseFloat(p.valor) || 0), 0);
                
                document.getElementById('valor-total-pago').textContent = formatarMoeda(totalPago);
            } else {
                mostrarAlerta('Erro ao salvar pagamento: ' + (response.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao salvar pagamento:', error);
            mostrarAlerta('Erro ao salvar pagamento: ' + error.message);
        } finally {
            esconderSpinner();
        }
    }
    
    /**
     * Confirma a exclusão de um pagamento
     * @param {Object} pagamento - Pagamento a ser excluído
     */
    function confirmarExclusaoPagamento(pagamento) {
        // Confirma a exclusão
        const modal = document.getElementById('modal-confirmacao');
        document.getElementById('mensagem-confirmacao').textContent = `Tem certeza que deseja excluir o pagamento "${pagamento.descricao}"?`;
        
        const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
        
        // Remove qualquer listener anterior para evitar duplicação
        const novoBtn = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
        
        // Adiciona o listener para o botão de confirmação
        novoBtn.addEventListener('click', async function() {
            try {
                mostrarSpinner();
                const response = await api.excluirPagamento(eventoAtual.id, pagamento.id);
                
                if (response.success) {
                    // Fecha o modal
                    const modalConfirmacao = bootstrap.Modal.getInstance(modal);
                    modalConfirmacao.hide();
                    
                    mostrarAlerta('Pagamento excluído com sucesso!', 'success');
                    
                    // Recarrega os pagamentos
                    await carregarPagamentosEvento(eventoAtual.id);
                    
                    // Atualiza os valores na aba financeira
                    const totalPago = pagamentosEventoAtual
                        .filter(p => p.status === 'Pago')
                        .reduce((total, p) => total + (parseFloat(p.valor) || 0), 0);
                    
                    document.getElementById('valor-total-pago').textContent = formatarMoeda(totalPago);
                } else {
                    mostrarAlerta('Erro ao excluir pagamento: ' + (response.error || 'Erro desconhecido'));
                }
            } catch (error) {
                console.error('Erro ao excluir pagamento:', error);
                mostrarAlerta('Erro ao excluir pagamento: ' + error.message);
            } finally {
                esconderSpinner();
            }
        });
        
        // Mostra o modal de confirmação
        const modalConfirmacao = new bootstrap.Modal(modal);
        modalConfirmacao.show();
    }
    
    /**
     * Anexos
     */
    
    /**
     * Carrega os anexos de um evento
     * @param {string} eventoId - ID do evento
     */
    async function carregarAnexosEvento(eventoId) {
        try {
            const response = await api.getAnexos(eventoId);
            
            if (response.success) {
                anexosEventoAtual = response.anexos || [];
                
                // Preenche a lista de anexos
                const listaAnexos = document.getElementById('lista-anexos');
                const semAnexos = document.getElementById('sem-anexos');
                
                // Limpa a lista atual
                while (listaAnexos.firstChild && listaAnexos.firstChild !== semAnexos) {
                    listaAnexos.removeChild(listaAnexos.firstChild);
                }
                
                if (anexosEventoAtual.length > 0) {
                    semAnexos.style.display = 'none';
                    
                    // Adiciona cada anexo à lista
                    anexosEventoAtual.forEach(anexo => {
                        let icone = 'bi-file-earmark';
                        if (anexo.tipo === 'Orçamento') icone = 'bi-file-earmark-text';
                        if (anexo.tipo === 'Contrato') icone = 'bi-file-earmark-ruled';
                        if (anexo.tipo === 'Nota Fiscal') icone = 'bi-file-earmark-spreadsheet';
                        
                        const anexoHtml = `
                            <div class="col-md-4 col-lg-3 mb-4">
                                <div class="card h-100" data-id="${anexo.id}">
                                    <div class="card-body text-center">
                                        <i class="bi ${icone}" style="font-size: 3rem; color: var(--primary-color);"></i>
                                        <h5 class="card-title mt-3">${anexo.titulo}</h5>
                                        <p class="card-text">
                                            <span class="badge bg-secondary">${anexo.tipo}</span>
                                        </p>
                                        <p class="card-text small">${anexo.descricao || ''}</p>
                                    </div>
                                    <div class="card-footer">
                                        <div class="d-flex justify-content-between">
                                            <a href="${anexo.url}" target="_blank" class="btn btn-sm btn-primary">
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
                        
                        listaAnexos.insertAdjacentHTML('beforeend', anexoHtml);
                    });
                    
                    // Adiciona eventos para os botões de excluir
                    document.querySelectorAll('.btn-excluir-anexo').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const anexoId = this.closest('.card').dataset.id;
                            const anexo = anexosEventoAtual.find(a => a.id === anexoId);
                            if (anexo) {
                                confirmarExclusaoAnexo(anexo);
                            }
                        });
                    });
                } else {
                    semAnexos.style.display = 'block';
                }
            } else {
                console.error('Erro ao carregar anexos do evento:', response.error);
            }
        } catch (error) {
            console.error('Erro ao carregar anexos do evento:', error);
        }
    }
    
    /**
     * Abre o modal para criar um novo anexo
     */
    function abrirModalAnexo() {
        const formAnexo = document.getElementById('form-anexo');
        formAnexo.reset();
        
        document.getElementById('anexo-id').value = '';
        
        // Mostra o modal
        const modal = new bootstrap.Modal(document.getElementById('modal-anexo'));
        modal.show();
    }
    
    /**
     * Salva um anexo
     */
    async function salvarAnexo() {
        // Coleta os dados do formulário
        const titulo = document.getElementById('anexo-titulo').value;
        const tipo = document.getElementById('anexo-tipo').value;
        const url = document.getElementById('anexo-url').value;
        const descricao = document.getElementById('anexo-descricao').value;
        
        // Validação básica
        if (!titulo || !tipo || !url) {
            mostrarAlerta('Preencha todos os campos obrigatórios');
            return;
        }
        
        // Monta o objeto do anexo
        const anexo = {
            titulo,
            tipo,
            url,
            descricao
        };
        
        try {
            mostrarSpinner();
            const response = await api.criarAnexo(eventoAtual.id, anexo);
            
            if (response.success) {
                // Fecha o modal
                const modalAnexo = bootstrap.Modal.getInstance(document.getElementById('modal-anexo'));
                modalAnexo.hide();
                
                mostrarAlerta('Anexo salvo com sucesso!', 'success');
                
                // Recarrega os anexos
                await carregarAnexosEvento(eventoAtual.id);
            } else {
                mostrarAlerta('Erro ao salvar anexo: ' + (response.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao salvar anexo:', error);
            mostrarAlerta('Erro ao salvar anexo: ' + error.message);
        } finally {
            esconderSpinner();
        }
    }
    
    /**
     * Confirma a exclusão de um anexo
     * @param {Object} anexo - Anexo a ser excluído
     */
    function confirmarExclusaoAnexo(anexo) {
        // Confirma a exclusão
        const modal = document.getElementById('modal-confirmacao');
        document.getElementById('mensagem-confirmacao').textContent = `Tem certeza que deseja excluir o anexo "${anexo.titulo}"?`;
        
        const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
        
        // Remove qualquer listener anterior para evitar duplicação
        const novoBtn = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
        
        // Adiciona o listener para o botão de confirmação
        novoBtn.addEventListener('click', async function() {
            try {
                mostrarSpinner();
                const response = await api.excluirAnexo(eventoAtual.id, anexo.id);
                
                if (response.success) {
                    // Fecha o modal
                    const modalConfirmacao = bootstrap.Modal.getInstance(modal);
                    modalConfirmacao.hide();
                    
                    mostrarAlerta('Anexo excluído com sucesso!', 'success');
                    
                    // Recarrega os anexos
                    await carregarAnexosEvento(eventoAtual.id);
                } else {
                    mostrarAlerta('Erro ao excluir anexo: ' + (response.error || 'Erro desconhecido'));
                }
            } catch (error) {
                console.error('Erro ao excluir anexo:', error);
                mostrarAlerta('Erro ao excluir anexo: ' + error.message);
            } finally {
                esconderSpinner();
            }
        });
        
        // Mostra o modal de confirmação
        const modalConfirmacao = new bootstrap.Modal(modal);
        modalConfirmacao.show();
    }
    
    /**
     * Financeiro
     */
    
    /**
     * Carrega o resumo financeiro
     */
    async function carregarResumoFinanceiro() {
        if (!verificarConfiguracao()) return;
        
        try {
            mostrarSpinner();
            const response = await api.getResumoFinanceiro();
            
            if (response.success) {
                const resumo = response.resumo;
                
                // Atualiza os valores nos cards
                document.getElementById('total-eventos').textContent = resumo.totalEventos || 0;
                document.getElementById('orcamento-total').textContent = formatarMoeda(resumo.orcamentoTotal || 0);
                document.getElementById('total-pago').textContent = formatarMoeda(resumo.totalPago || 0);
                
                // Preenche a tabela de pagamentos pendentes
                const listaPagamentosPendentes = document.getElementById('lista-pagamentos-pendentes');
                listaPagamentosPendentes.innerHTML = '';
                
                if (resumo.pagamentosPendentes && resumo.pagamentosPendentes.length > 0) {
                    resumo.pagamentosPendentes.forEach(pagamento => {
                        const pagamentoHtml = `
                            <tr>
                                <td>${pagamento.evento}</td>
                                <td>${pagamento.descricao}</td>
                                <td>${pagamento.fornecedor}</td>
                                <td>${formatarMoeda(pagamento.valor || 0)}</td>
                                <td>${formatarData(pagamento.vencimento)}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-success btn-marcar-pago" data-evento-id="${pagamento.eventoId}" data-pagamento-id="${pagamento.id}">
                                        <i class="bi bi-check-circle"></i> Marcar como Pago
                                    </button>
                                </td>
                            </tr>
                        `;
                        
                        listaPagamentosPendentes.insertAdjacentHTML('beforeend', pagamentoHtml);
                    });
                    
                    // Adiciona eventos para os botões de marcar como pago
                    document.querySelectorAll('.btn-marcar-pago').forEach(btn => {
                        btn.addEventListener('click', async function() {
                            const eventoId = this.dataset.eventoId;
                            const pagamentoId = this.dataset.pagamentoId;
                            
                            try {
                                mostrarSpinner();
                                const response = await api.atualizarPagamento(eventoId, pagamentoId, {
                                    status: 'Pago',
                                    dataPagamento: new Date().toISOString().split('T')[0]
                                });
                                
                                if (response.success) {
                                    mostrarAlerta('Pagamento marcado como pago com sucesso!', 'success');
                                    
                                    // Recarrega o resumo financeiro
                                    await carregarResumoFinanceiro();
                                } else {
                                    mostrarAlerta('Erro ao marcar pagamento como pago: ' + (response.error || 'Erro desconhecido'));
                                }
                            } catch (error) {
                                console.error('Erro ao marcar pagamento como pago:', error);
                                mostrarAlerta('Erro ao marcar pagamento como pago: ' + error.message);
                            } finally {
                                esconderSpinner();
                            }
                        });
                    });
                } else {
                    listaPagamentosPendentes.innerHTML = `
                        <tr>
                            <td colspan="6" class="text-center">Nenhum pagamento pendente.</td>
                        </tr>
                    `;
                }
                
                // Preenche a tabela de orçamento por evento
                const listaOrcamentoEventos = document.getElementById('lista-orcamento-eventos');
                listaOrcamentoEventos.innerHTML = '';
                
                if (resumo.orcamentoEventos && resumo.orcamentoEventos.length > 0) {
                    resumo.orcamentoEventos.forEach(evento => {
                        let statusClass = 'secondary';
                        if (evento.status === 'Dentro do orçamento') statusClass = 'success';
                        if (evento.status === 'Acima do orçamento') statusClass = 'danger';
                        
                        const eventoHtml = `
                            <tr>
                                <td>${evento.nome}</td>
                                <td>${formatarData(evento.data)}</td>
                                <td>${formatarMoeda(evento.orcamentoMeta || 0)}</td>
                                <td>${formatarMoeda(evento.totalOrcado || 0)}</td>
                                <td>${formatarMoeda(evento.totalPago || 0)}</td>
                                <td><span class="badge bg-${statusClass}">${evento.status}</span></td>
                            </tr>
                        `;
                        
                        listaOrcamentoEventos.insertAdjacentHTML('beforeend', eventoHtml);
                    });
                } else {
                    listaOrcamentoEventos.innerHTML = `
                        <tr>
                            <td colspan="6" class="text-center">Nenhum evento com orçamento cadastrado.</td>
                        </tr>
                    `;
                }
            } else {
                console.error('Erro ao carregar resumo financeiro:', response.error);
                mostrarAlerta('Erro ao carregar resumo financeiro: ' + (response.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao carregar resumo financeiro:', error);
            mostrarAlerta('Erro ao carregar resumo financeiro: ' + error.message);
        } finally {
            esconderSpinner();
        }
    }

/**
 * Configurações
 */

/**
 * Salva as configurações do sistema
 * @param {Event} event - Evento de submit do formulário
 */
async function salvarConfiguracoes(event) {
    event.preventDefault();
    
    const planilhaId = document.getElementById('planilha-id').value.trim();
    const scriptUrl = document.getElementById('script-url').value.trim();
    
    // Validação melhorada
    if (!planilhaId) {
        mostrarAlerta('Preencha o ID da planilha Google Sheets');
        return;
    }
    
    if (!scriptUrl) {
        mostrarAlerta('Preencha a URL do Google Apps Script');
        return;
    }
    
    try {
        mostrarSpinner();
        const configurado = api.saveConfig(scriptUrl, planilhaId);
        
        if (configurado) {
            mostrarAlerta('Configurações salvas com sucesso! O sistema está pronto para uso.', 'success');
            verificarConfiguracao();
            
            // Atualiza o aviso de configuração
            if (verificarConfiguracao()) {
                // Se configurado com sucesso, podemos carregar os eventos
                carregarEventos();
            }
        } else {
            mostrarAlerta('Erro ao salvar configurações. Verifique os dados inseridos.');
        }
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        mostrarAlerta('Erro ao salvar configurações: ' + error.message);
    } finally {
        esconderSpinner();
    }
}

/**
 * Testa a conexão com o Google Apps Script
 */
async function testarConexao() {
    const planilhaId = document.getElementById('planilha-id').value.trim();
    const scriptUrl = document.getElementById('script-url').value.trim();
    
    // Validação melhorada
    if (!planilhaId) {
        mostrarAlerta('Preencha o ID da planilha Google Sheets antes de testar');
        return;
    }
    
    if (!scriptUrl) {
        mostrarAlerta('Preencha a URL do Google Apps Script antes de testar');
        return;
    }
    
    try {
        mostrarSpinner();
        
        // Salva temporariamente as configurações para o teste
        const tempConfig = api.saveConfig(scriptUrl, planilhaId);
        
        if (!tempConfig) {
            mostrarAlerta('Erro ao salvar configurações temporárias');
            esconderSpinner();
            return;
        }
        
        const resultado = await api.testConnection();
        
        if (resultado) {
            mostrarAlerta('Conexão estabelecida com sucesso! O sistema está pronto para uso.', 'success');
        } else {
            mostrarAlerta('Falha ao estabelecer conexão. Verifique:<br>1. O ID da planilha está correto<br>2. A URL do script está correta<br>3. O script está publicado como aplicativo web<br>4. As permissões do script estão configuradas corretamente', 'warning');
        }
    } catch (error) {
        console.error('Erro ao testar conexão:', error);
        mostrarAlerta('Erro ao testar conexão: ' + error.message + '<br>Verifique se o script foi publicado como aplicativo web com as permissões corretas.', 'danger');
    } finally {
        esconderSpinner();
    }
}

/**
 * Eventos de navegação
 */

// Eventos de link da navbar
document.getElementById('nav-eventos').addEventListener('click', function() {
    mostrarSecao('eventos-section');
    carregarEventos();
});

document.getElementById('nav-fornecedores').addEventListener('click', function() {
    mostrarSecao('fornecedores-section');
    carregarFornecedores();
});

document.getElementById('nav-financeiro').addEventListener('click', function() {
    mostrarSecao('financeiro-section');
    carregarResumoFinanceiro();
});

document.getElementById('nav-configuracoes').addEventListener('click', function() {
    mostrarSecao('configuracoes-section');
    
    // Preenche o formulário com as configurações atuais
    document.getElementById('planilha-id').value = api.spreadsheetId;
    document.getElementById('script-url').value = api.scriptUrl;
});

// Botões de navegação
document.getElementById('btn-novo-evento').addEventListener('click', function() {
    mostrarSecao('novo-evento-section');
});

document.getElementById('btn-primeiro-evento').addEventListener('click', function() {
    mostrarSecao('novo-evento-section');
});

document.getElementById('btn-voltar-eventos').addEventListener('click', function() {
    mostrarSecao('eventos-section');
});

document.getElementById('btn-cancelar-evento').addEventListener('click', function() {
    document.getElementById('form-novo-evento').reset();
    mostrarSecao('eventos-section');
});

document.getElementById('btn-voltar-detalhes').addEventListener('click', function() {
    mostrarSecao('eventos-section');
});

// Navegação de autenticação
document.getElementById('link-cadastro').addEventListener('click', function(e) {
    e.preventDefault();
    mostrarSecao('cadastro-section');
});

document.getElementById('link-login').addEventListener('click', function(e) {
    e.preventDefault();
    mostrarSecao('login-section');
});

document.getElementById('btn-logout').addEventListener('click', fazerLogout);

// Botão de excluir evento
document.getElementById('btn-excluir-evento').addEventListener('click', excluirEvento);

// Botões para adicionar serviço
document.getElementById('btn-adicionar-servico').addEventListener('click', function() {
    adicionarServico('servicos-container');
});

document.getElementById('btn-adicionar-servico-edit').addEventListener('click', adicionarServicoEdit);

// Botão para salvar serviços
document.getElementById('btn-salvar-servicos').addEventListener('click', salvarServicos);

// Botões de modais
document.getElementById('btn-novo-fornecedor').addEventListener('click', function() {
    abrirModalFornecedor();
});

document.getElementById('btn-adicionar-orcamento').addEventListener('click', function() {
    abrirModalOrcamento();
});

document.getElementById('btn-adicionar-pagamento').addEventListener('click', function() {
    abrirModalPagamento();
});

document.getElementById('btn-adicionar-anexo').addEventListener('click', abrirModalAnexo);

// Botões de salvar
document.getElementById('btn-salvar-fornecedor').addEventListener('click', salvarFornecedor);
document.getElementById('btn-salvar-orcamento').addEventListener('click', salvarOrcamento);
document.getElementById('btn-salvar-pagamento').addEventListener('click', salvarPagamento);
document.getElementById('btn-salvar-anexo').addEventListener('click', salvarAnexo);

// Form submits
document.getElementById('login-form').addEventListener('submit', fazerLogin);
document.getElementById('cadastro-form').addEventListener('submit', cadastrarUsuario);
document.getElementById('form-novo-evento').addEventListener('submit', criarEvento);
document.getElementById('form-edicao-evento').addEventListener('submit', atualizarEvento);
document.getElementById('form-configuracoes').addEventListener('submit', salvarConfiguracoes);

// Botão de testar conexão
document.getElementById('btn-teste-conexao').addEventListener('click', testarConexao);

// Eventos para avaliação de fornecedores (estrelas)
document.querySelectorAll('#fornecedor-avaliacao i').forEach(estrela => {
    estrela.addEventListener('mouseenter', function() {
        const rating = parseInt(this.dataset.rating);
        
        // Destaca todas as estrelas até a atual
        document.querySelectorAll('#fornecedor-avaliacao i').forEach(e => {
            const eRating = parseInt(e.dataset.rating);
            
            if (eRating <= rating) {
                e.classList.remove('bi-star');
                e.classList.add('bi-star-fill');
            } else {
                e.classList.remove('bi-star-fill');
                e.classList.add('bi-star');
            }
        });
    });
    
    estrela.addEventListener('mouseleave', function() {
        const selectedRating = parseInt(document.getElementById('fornecedor-rating-value').value) || 0;
        
        // Restaura as estrelas com base na avaliação selecionada
        document.querySelectorAll('#fornecedor-avaliacao i').forEach(e => {
            const eRating = parseInt(e.dataset.rating);
            
            if (eRating <= selectedRating) {
                e.classList.remove('bi-star');
                e.classList.add('bi-star-fill');
                e.classList.add('active');
            } else {
                e.classList.remove('bi-star-fill');
                e.classList.add('bi-star');
                e.classList.remove('active');
            }
        });
    });
    
    estrela.addEventListener('click', function() {
        const rating = parseInt(this.dataset.rating);
        document.getElementById('fornecedor-rating-value').value = rating;
        
        // Atualiza as classes para mostrar a avaliação selecionada
        document.querySelectorAll('#fornecedor-avaliacao i').forEach(e => {
            const eRating = parseInt(e.dataset.rating);
            
            if (eRating <= rating) {
                e.classList.add('active');
            } else {
                e.classList.remove('active');
            }
        });
    });
});
/**
 * Carrega a lista de usuários (somente admin)
 */
async function carregarUsuarios() {
    if (!isAdmin) {
        mostrarAlerta('Acesso negado. Apenas administradores podem gerenciar usuários.');
        return;
    }
    
    try {
        mostrarSpinner();
        const response = await api.listarUsuarios(usuarioLogado.id);
        
        if (response.success) {
            const listaUsuarios = document.getElementById('lista-usuarios');
            listaUsuarios.innerHTML = '';
            
            if (response.usuarios.length > 0) {
                response.usuarios.forEach(usuario => {
                    const usuarioHtml = `
                        <tr data-id="${usuario.id}">
                            <td>${usuario.nome}</td>
                            <td>${usuario.email}</td>
                            <td>${usuario.isAdmin ? 'Sim' : 'Não'}</td>
                            <td>${formatarData(usuario.dataCriacao)}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger btn-excluir-usuario" ${usuario.isAdmin ? 'disabled' : ''}>
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    
                    listaUsuarios.insertAdjacentHTML('beforeend', usuarioHtml);
                });
                
                // Adiciona eventos para os botões de excluir
                document.querySelectorAll('.btn-excluir-usuario').forEach(btn => {
                    if (!btn.disabled) {
                        btn.addEventListener('click', function() {
                            const usuarioId = this.closest('tr').dataset.id;
                            const usuario = response.usuarios.find(u => u.id === usuarioId);
                            if (usuario) {
                                confirmarExclusaoUsuario(usuario);
                            }
                        });
                    }
                });
                
                // Inicializa o DataTable se existir
                if ($.fn.DataTable && $.fn.DataTable.isDataTable('#tabela-usuarios')) {
                    $('#tabela-usuarios').DataTable().destroy();
                }
                
                if ($.fn.DataTable) {
                    $('#tabela-usuarios').DataTable({
                        language: {
                            url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json'
                        },
                        responsive: true
                    });
                }
            } else {
                listaUsuarios.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">Nenhum usuário cadastrado além do administrador.</td>
                    </tr>
                `;
            }
        } else {
            mostrarAlerta('Erro ao carregar usuários: ' + (response.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        mostrarAlerta('Erro ao carregar usuários: ' + error.message);
    } finally {
        esconderSpinner();
    }
}

/**
 * Abre o modal para criar um novo usuário
 */
function abrirModalNovoUsuario() {
    const modalTitle = document.getElementById('modal-usuario-label');
    const formUsuario = document.getElementById('form-usuario');
    
    modalTitle.textContent = 'Novo Usuário';
    formUsuario.reset();
    document.getElementById('usuario-id').value = '';
    
    // Mostra o modal
    const modal = new bootstrap.Modal(document.getElementById('modal-usuario'));
    modal.show();
}

/**
 * Adiciona um novo usuário (apenas admin)
 */
async function adicionarNovoUsuario(event) {
    event.preventDefault();
    
    if (!isAdmin) {
        mostrarAlerta('Acesso negado. Apenas administradores podem adicionar usuários.');
        return;
    }
    
    const nome = document.getElementById('novo-usuario-nome').value;
    const email = document.getElementById('novo-usuario-email').value;
    const senha = document.getElementById('novo-usuario-senha').value;
    
    if (!nome || !email || !senha) {
        mostrarAlerta('Preencha todos os campos obrigatórios');
        return;
    }
    
    if (senha.length < 6) {
        mostrarAlerta('A senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    try {
        mostrarSpinner();
        const response = await api.adicionarUsuario({ nome, email, senha }, usuarioLogado.id);
        
        if (response.success) {
            // Fecha o modal
            const modalUsuario = bootstrap.Modal.getInstance(document.getElementById('modal-usuario'));
            modalUsuario.hide();
            
            mostrarAlerta('Usuário adicionado com sucesso!', 'success');
            
            // Recarrega a lista de usuários
            await carregarUsuarios();
        } else {
            mostrarAlerta('Erro ao adicionar usuário: ' + (response.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro ao adicionar usuário:', error);
        mostrarAlerta('Erro ao adicionar usuário: ' + error.message);
    } finally {
        esconderSpinner();
    }
}

/**
 * Confirma a exclusão de um usuário
 */
function confirmarExclusaoUsuario(usuario) {
    // Confirma a exclusão
    const modal = document.getElementById('modal-confirmacao');
    document.getElementById('mensagem-confirmacao').textContent = `Tem certeza que deseja excluir o usuário "${usuario.nome}"?`;
    
    const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
    
    // Remove qualquer listener anterior para evitar duplicação
    const novoBtn = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
    
    // Adiciona o listener para o botão de confirmação
    novoBtn.addEventListener('click', async function() {
        try {
            mostrarSpinner();
            const response = await api.excluirUsuario(usuario.id, usuarioLogado.id);
            
            if (response.success) {
                // Fecha o modal
                const modalConfirmacao = bootstrap.Modal.getInstance(modal);
                modalConfirmacao.hide();
                
                mostrarAlerta('Usuário excluído com sucesso!', 'success');
                
                // Recarrega os usuários
                await carregarUsuarios();
            } else {
                mostrarAlerta('Erro ao excluir usuário: ' + (response.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            mostrarAlerta('Erro ao excluir usuário: ' + error.message);
        } finally {
            esconderSpinner();
        }
    });
    
    // Mostra o modal de confirmação
    const modalConfirmacao = new bootstrap.Modal(modal);
    modalConfirmacao.show();
}

// Adicionar os event listeners para gerenciamento de usuários
document.getElementById('btn-novo-usuario').addEventListener('click', function() {
    abrirModalNovoUsuario();
});

document.getElementById('btn-salvar-usuario').addEventListener('click', function() {
    document.getElementById('form-usuario').dispatchEvent(new Event('submit'));
});

document.getElementById('form-usuario').addEventListener('submit', adicionarNovoUsuario);

// Adiciona evento para o link de usuários no menu
document.querySelector('#nav-usuarios').addEventListener('click', function() {
    mostrarSecao('usuarios-section');
    carregarUsuarios();
});

// Inicializa o sistema
inicializarSistema();
});