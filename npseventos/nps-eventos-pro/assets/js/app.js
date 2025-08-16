// NPS Eventos Pro - Aplicação Principal
// Sistema avançado de pesquisas de satisfação para eventos

/**
 * Estado global da aplicação
 */
let state = {
    surveys: {},
    slugs: {},
    ui: {
        lang: 'pt',
        adminPassword: null
    }
};

/**
 * Traduções da interface
 */
const translations = {
    pt: {
        welcome: 'Bem-vindo ao NPS Eventos Pro',
        subtitle: 'Sistema avançado de pesquisas de satisfação para eventos',
        totalSurveys: 'Total de Pesquisas',
        totalResponses: 'Total de Respostas',
        averageNPS: 'NPS Médio',
        activeSurveys: 'Pesquisas Ativas',
        accessAdmin: 'Acessar Área Administrativa',
        admin: 'Admin',
        surveys: 'Pesquisas',
        newSurvey: 'Nova Pesquisa',
        logout: 'Sair',
        title: 'Título',
        eventDate: 'Data do Evento',
        status: 'Status',
        responses: 'Respostas',
        actions: 'Ações',
        edit: 'Editar',
        view: 'Ver',
        duplicate: 'Duplicar',
        delete: 'Excluir',
        draft: 'Rascunho',
        active: 'Ativa',
        closed: 'Encerrada',
        save: 'Salvar',
        cancel: 'Cancelar',
        preview: 'Visualizar',
        previous: 'Anterior',
        next: 'Próximo',
        finish: 'Finalizar',
        notRecommend: 'Não recomendaria',
        definitelyRecommend: 'Recomendaria com certeza',
        invalidPassword: 'Senha inválida',
        thankYou: 'Obrigado!',
        responseRecorded: 'Sua resposta foi registrada com sucesso.',
        invalidLink: 'Link inválido ou pesquisa inativa',
        backToHome: '← Voltar ao Início'
    },
    en: {
        welcome: 'Welcome to NPS Eventos Pro',
        subtitle: 'Advanced event satisfaction survey system',
        totalSurveys: 'Total Surveys',
        totalResponses: 'Total Responses',
        averageNPS: 'Average NPS',
        activeSurveys: 'Active Surveys',
        accessAdmin: 'Access Administrative Area',
        admin: 'Admin',
        surveys: 'Surveys',
        newSurvey: 'New Survey',
        logout: 'Logout',
        title: 'Title',
        eventDate: 'Event Date',
        status: 'Status',
        responses: 'Responses',
        actions: 'Actions',
        edit: 'Edit',
        view: 'View',
        duplicate: 'Duplicate',
        delete: 'Delete',
        draft: 'Draft',
        active: 'Active',
        closed: 'Closed',
        save: 'Save',
        cancel: 'Cancel',
        preview: 'Preview',
        previous: 'Previous',
        next: 'Next',
        finish: 'Finish',
        notRecommend: 'Would not recommend',
        definitelyRecommend: 'Would definitely recommend',
        invalidPassword: 'Invalid password',
        thankYou: 'Thank you!',
        responseRecorded: 'Your response has been successfully recorded.',
        invalidLink: 'Invalid link or inactive survey',
        backToHome: '← Back to Home'
    },
    es: {
        welcome: 'Bienvenido a NPS Eventos Pro',
        subtitle: 'Sistema avanzado de encuestas de satisfacción para eventos',
        totalSurveys: 'Total de Encuestas',
        totalResponses: 'Total de Respuestas',
        averageNPS: 'NPS Promedio',
        activeSurveys: 'Encuestas Activas',
        accessAdmin: 'Acceder al Área Administrativa',
        admin: 'Admin',
        surveys: 'Encuestas',
        newSurvey: 'Nueva Encuesta',
        logout: 'Cerrar Sesión',
        title: 'Título',
        eventDate: 'Fecha del Evento',
        status: 'Estado',
        responses: 'Respuestas',
        actions: 'Acciones',
        edit: 'Editar',
        view: 'Ver',
        duplicate: 'Duplicar',
        delete: 'Eliminar',
        draft: 'Borrador',
        active: 'Activa',
        closed: 'Cerrada',
        save: 'Guardar',
        cancel: 'Cancelar',
        preview: 'Vista Previa',
        previous: 'Anterior',
        next: 'Siguiente',
        finish: 'Finalizar',
        notRecommend: 'No recomendaría',
        definitelyRecommend: 'Definitivamente recomendaría',
        invalidPassword: 'Contraseña inválida',
        thankYou: '¡Gracias!',
        responseRecorded: 'Su respuesta ha sido registrada exitosamente.',
        invalidLink: 'Enlace inválido o encuesta inactiva',
        backToHome: '← Volver al Inicio'
    }
};

/**
 * Função de tradução
 */
function t(key) {
    return translations[state.ui.lang][key] || key;
}

/**
 * Gera um ID único
 */
function uid(prefix = 'id') {
    return prefix + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Salva o estado no localStorage
 */
function saveState() {
    try {
        localStorage.setItem('npsEventosState', JSON.stringify(state));
    } catch (error) {
        console.error('Erro ao salvar estado:', error);
    }
}

/**
 * Carrega o estado do localStorage
 */
function loadState() {
    try {
        const saved = localStorage.getItem('npsEventosState');
        if (saved) {
            const parsedState = JSON.parse(saved);
            state = { ...state, ...parsedState };
        }
    } catch (error) {
        console.error('Erro ao carregar estado:', error);
    }
    
    // Inicializa com dados de exemplo se não houver dados
    if (Object.keys(state.surveys).length === 0) {
        initializeDefaultData();
    }
}

/**
 * Inicializa dados padrão
 */
function initializeDefaultData() {
    const surveyId = 'srv_fbrthkf8s6dc';
    const slug = 'ellit-3a';
    
    const defaultSurvey = {
        id: surveyId,
        slug: slug,
        title: {
            pt: 'Pesquisa de Satisfação do Evento',
            en: 'Event Satisfaction Survey',
            es: 'Encuesta de Satisfacción del Evento'
        },
        eventDate: '2025-08-16',
        status: 'draft',
        brandColor: '#6366f1',
        requireToken: false,
        webhook: '',
        questions: [
            {
                id: 'q1',
                type: 'nps',
                required: true,
                label: {
                    pt: 'Em uma escala de 0 a 10, o quanto você recomendaria este evento a um amigo ou colega do mesmo nicho de mercado?',
                    en: 'On a scale of 0 to 10, how likely would you recommend this event to a friend or colleague in the same market niche?',
                    es: 'En una escala de 0 a 10, ¿qué tan probable es que recomiendes este evento a un amigo o colega del mismo nicho de mercado?'
                },
                help: {
                    pt: '0 = não recomendaria; 10 = recomendaria com certeza',
                    en: '0 = would not recommend; 10 = would definitely recommend',
                    es: '0 = no recomendaría; 10 = definitivamente recomendaría'
                }
            },
            {
                id: 'q2',
                type: 'likert',
                required: true,
                label: {
                    pt: 'Como você avalia a qualidade geral do evento?',
                    en: 'How do you rate the overall quality of the event?',
                    es: '¿Cómo califica la calidad general del evento?'
                },
                help: {
                    pt: '1 = Muito ruim; 5 = Excelente',
                    en: '1 = Very poor; 5 = Excellent',
                    es: '1 = Muy malo; 5 = Excelente'
                }
            }
        ],
        responses: [],
        tokens: {},
        answeredDevices: {}
    };
    
    state.surveys[surveyId] = defaultSurvey;
    state.slugs[slug] = surveyId;
    saveState();
}

/**
 * Roteador da aplicação
 */
function router() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString);
    const app = document.getElementById('app');
    
    // Rotas da aplicação
    if (path === '/' || path === '') {
        renderHome(app);
    } else if (path === '/admin') {
        if (params.has('edit')) {
            renderEditSurvey(app, params.get('edit'));
        } else if (state.ui.adminPassword) {
            renderAdmin(app);
        } else {
            renderAdminLogin(app);
        }
    } else if (path.startsWith('/s/')) {
        const slug = path.split('/')[2];
        renderQuiz(app, slug, params);
    } else {
        render404(app);
    }
}

/**
 * Renderiza a página inicial
 */
function renderHome(app) {
    const totalSurveys = Object.keys(state.surveys).length;
    const totalResponses = getTotalResponses();
    const averageNPS = getAverageNPS();
    const activeSurveys = getActiveSurveys();
    
    app.innerHTML = `
        <div class="hero">
            <div class="container">
                <h1>${t('welcome')}</h1>
                <p>${t('subtitle')}</p>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${totalSurveys}</div>
                        <div class="stat-label">${t('totalSurveys')}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${totalResponses}</div>
                        <div class="stat-label">${t('totalResponses')}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${averageNPS}</div>
                        <div class="stat-label">${t('averageNPS')}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${activeSurveys}</div>
                        <div class="stat-label">${t('activeSurveys')}</div>
                    </div>
                </div>
                
                <a href="#/admin" class="btn btn-primary">${t('accessAdmin')}</a>
            </div>
        </div>
    `;
}

/**
 * Renderiza o login administrativo
 */
function renderAdminLogin(app) {
    app.innerHTML = `
        <div class="container">
            <div class="card" style="max-width: 400px; margin: 4rem auto;">
                <div class="card-header">
                    <h2 class="card-title">Acesso Administrativo</h2>
                </div>
                <div class="form-group">
                    <label class="form-label">Senha</label>
                    <input type="password" id="adminPassword" class="form-input" placeholder="Digite a senha">
                </div>
                <button onclick="adminLogin()" class="btn btn-primary" style="width: 100%;">Entrar</button>
            </div>
        </div>
    `;
}

/**
 * Renderiza a área administrativa
 */
function renderAdmin(app) {
    const surveys = Object.values(state.surveys);
    
    app.innerHTML = `
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>${t('surveys')}</h1>
                <div>
                    <button onclick="createNewSurvey()" class="btn btn-primary">${t('newSurvey')}</button>
                    <button onclick="logout()" class="btn btn-secondary" style="margin-left: 1rem;">${t('logout')}</button>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>${t('title')}</th>
                            <th>${t('eventDate')}</th>
                            <th>${t('status')}</th>
                            <th>${t('responses')}</th>
                            <th>${t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${surveys.map(survey => `
                            <tr>
                                <td>
                                    <strong>${survey.title[state.ui.lang]}</strong><br>
                                    <small class="muted">Slug: ${survey.slug}</small>
                                </td>
                                <td>${Utils.formatDate(survey.eventDate)}</td>
                                <td>
                                    <span class="badge badge-${survey.status === 'active' ? 'success' : survey.status === 'draft' ? 'warning' : 'danger'}">
                                        ${t(survey.status)}
                                    </span>
                                </td>
                                <td>${survey.responses.length}</td>
                                <td>
                                    <button onclick="editSurvey('${survey.id}')" class="btn-edit">${t('edit')}</button>
                                    <button onclick="viewSurvey('${survey.slug}')" class="btn-view">${t('view')}</button>
                                    <button onclick="duplicateSurvey('${survey.id}')" class="btn-duplicate">${t('duplicate')}</button>
                                    <button onclick="deleteSurvey('${survey.id}')" class="btn-delete">${t('delete')}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Renderiza o editor de pesquisa
 */
function renderEditSurvey(app, surveyId) {
    const survey = state.surveys[surveyId];
    if (!survey) {
        render404(app);
        return;
    }
    
    app.innerHTML = `
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>Editar Pesquisa</h1>
                <button onclick="window.location.hash='/admin'" class="btn btn-secondary">← Voltar</button>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Configurações Básicas</h3>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group">
                        <label class="form-label">Título (PT)</label>
                        <input type="text" id="titlePt" class="form-input" value="${survey.title.pt}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Título (EN)</label>
                        <input type="text" id="titleEn" class="form-input" value="${survey.title.en}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Título (ES)</label>
                        <input type="text" id="titleEs" class="form-input" value="${survey.title.es}">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div class="form-group">
                        <label class="form-label">Slug (URL amigável)</label>
                        <input type="text" id="slug" class="form-input" value="${survey.slug}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Data do evento</label>
                        <input type="date" id="eventDate" class="form-input" value="${survey.eventDate}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cor da marca</label>
                        <input type="color" id="brandColor" class="form-input" value="${survey.brandColor}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <div style="display: flex; gap: 1rem;">
                        <div class="form-radio">
                            <input type="radio" name="status" value="draft" ${survey.status === 'draft' ? 'checked' : ''}>
                            <label>Rascunho</label>
                        </div>
                        <div class="form-radio">
                            <input type="radio" name="status" value="active" ${survey.status === 'active' ? 'checked' : ''}>
                            <label>Ativa</label>
                        </div>
                        <div class="form-radio">
                            <input type="radio" name="status" value="closed" ${survey.status === 'closed' ? 'checked' : ''}>
                            <label>Encerrada</label>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <div class="form-checkbox">
                        <input type="checkbox" id="requireToken" ${survey.requireToken ? 'checked' : ''}>
                        <label>Exigir token (1 resposta por link)</label>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Perguntas Personalizadas</h3>
                </div>
                
                <div id="questionsContainer">
                    ${survey.questions.map((question, index) => renderQuestionEditor(question, index)).join('')}
                </div>
                
                <button onclick="addQuestion('${surveyId}')" class="btn btn-secondary">+ Adicionar Pergunta</button>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Configurações Avançadas</h3>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Webhook URL</label>
                    <input type="url" id="webhook" class="form-input" value="${survey.webhook}" placeholder="https://script.google.com/macros/s/.../exec">
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button onclick="window.location.hash='/admin'" class="btn btn-secondary">${t('cancel')}</button>
                <button onclick="saveSurvey('${surveyId}')" class="btn btn-primary">${t('save')}</button>
                <a href="#/s/${survey.slug}" target="_blank" class="btn btn-primary">${t('preview')}</a>
            </div>
        </div>
    `;
}

/**
 * Renderiza o editor de pergunta
 */
function renderQuestionEditor(question, index) {
    return `
        <div class="card" style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4>Pergunta ${index + 1}</h4>
                <div>
                    <button onclick="moveQuestion(${index}, -1)" class="btn btn-secondary" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button onclick="moveQuestion(${index}, 1)" class="btn btn-secondary">↓</button>
                    <button onclick="removeQuestion(${index})" class="btn btn-delete">×</button>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label class="form-label">Tipo</label>
                    <select class="form-select" onchange="updateQuestionType('${question.id}', this.value)">
                        <option value="nps" ${question.type === 'nps' ? 'selected' : ''}>NPS (0-10)</option>
                        <option value="likert" ${question.type === 'likert' ? 'selected' : ''}>Likert (1-5)</option>
                        <option value="text" ${question.type === 'text' ? 'selected' : ''}>Texto Curto</option>
                        <option value="textarea" ${question.type === 'textarea' ? 'selected' : ''}>Texto Longo</option>
                        <option value="radio" ${question.type === 'radio' ? 'selected' : ''}>Múltipla Escolha</option>
                    </select>
                </div>
                <div class="form-group">
                    <div class="form-checkbox">
                        <input type="checkbox" ${question.required ? 'checked' : ''} onchange="updateQuestionRequired('${question.id}', this.checked)">
                        <label>Obrigatória</label>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Pergunta (PT)</label>
                    <input type="text" class="form-input" value="${question.label.pt}" onchange="updateQuestionLabel('${question.id}', 'pt', this.value)">
                </div>
                <div class="form-group">
                    <label class="form-label">Pergunta (EN)</label>
                    <input type="text" class="form-input" value="${question.label.en}" onchange="updateQuestionLabel('${question.id}', 'en', this.value)">
                </div>
                <div class="form-group">
                    <label class="form-label">Pergunta (ES)</label>
                    <input type="text" class="form-input" value="${question.label.es}" onchange="updateQuestionLabel('${question.id}', 'es', this.value)">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Texto de Ajuda (PT)</label>
                <input type="text" class="form-input" value="${question.help?.pt || ''}" onchange="updateQuestionHelp('${question.id}', 'pt', this.value)">
            </div>
        </div>
    `;
}

/**
 * Renderiza o quiz
 */
function renderQuiz(app, slug, params) {
    const surveyId = state.slugs[slug];
    const survey = state.surveys[surveyId];
    
    if (!survey || survey.status !== 'active') {
        app.innerHTML = `
            <div class="container">
                <div class="quiz-container">
                    <div class="question-card text-center">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                        <h2>Ops!</h2>
                        <p class="muted">${t('invalidLink')}</p>
                        <a href="#/" class="btn btn-primary" style="margin-top: 1rem;">${t('backToHome')}</a>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    // Initialize quiz state
    if (!window.quizState) {
        window.quizState = {
            currentQuestion: 0,
            answers: {},
            surveyId: surveyId
        };
    }
    
    const currentQ = survey.questions[window.quizState.currentQuestion];
    const progress = ((window.quizState.currentQuestion + 1) / survey.questions.length) * 100;
    
    app.innerHTML = `
        <div class="container">
            <div class="quiz-container">
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                
                <div class="question-card">
                    <div class="question-title">${currentQ.label[state.ui.lang]}</div>
                    ${currentQ.help ? `<div class="question-help">${currentQ.help[state.ui.lang]}</div>` : ''}
                    
                    <div id="questionInput">
                        ${renderQuestionInput(currentQ)}
                    </div>
                    
                    <div class="quiz-navigation">
                        <button class="btn btn-secondary" onclick="previousQuestion()" ${window.quizState.currentQuestion === 0 ? 'disabled' : ''}>
                            ${t('previous')}
                        </button>
                        <div class="muted">
                            ${window.quizState.currentQuestion + 1} de ${survey.questions.length}
                        </div>
                        <button class="btn btn-primary" onclick="nextQuestion()">
                            ${window.quizState.currentQuestion === survey.questions.length - 1 ? t('finish') : t('next')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza o input da pergunta baseado no tipo
 */
function renderQuestionInput(question) {
    switch (question.type) {
        case 'nps':
            return `
                <div class="nps-scale">
                    ${Array.from({length: 11}, (_, i) => `
                        <button class="nps-button" onclick="selectNPS(${i})" data-score="${i}">
                            ${i}
                        </button>
                    `).join('')}
                </div>
                <div class="nps-labels">
                    <span>${t('notRecommend')}</span>
                    <span>${t('definitelyRecommend')}</span>
                </div>
            `;
            
        case 'likert':
            return `
                <div class="likert-scale">
                    ${Array.from({length: 5}, (_, i) => `
                        <button class="likert-button" onclick="selectLikert(${i + 1})" data-score="${i + 1}">
                            ${i + 1}
                        </button>
                    `).join('')}
                </div>
            `;
            
        case 'text':
            return `<input type="text" id="textInput" class="form-input" placeholder="Digite sua resposta...">`;
            
        case 'textarea':
            return `<textarea id="textareaInput" class="form-textarea" placeholder="Digite sua resposta..."></textarea>`;
            
        case 'radio':
            return `
                <div class="radio-options">
                    ${(question.options || ['Opção 1', 'Opção 2']).map((option, i) => `
                        <div class="radio-option" onclick="selectRadio('${option}')">
                            <input type="radio" name="radioOption" value="${option}">
                            <span>${option}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            
        default:
            return '<p>Tipo de pergunta não suportado</p>';
    }
}

/**
 * Renderiza página 404
 */
function render404(app) {
    app.innerHTML = `
        <div class="container">
            <div class="quiz-container">
                <div class="question-card text-center">
                    <h2>Página não encontrada</h2>
                    <p class="muted">A página que você está procurando não existe.</p>
                    <a href="#/" class="btn btn-primary" style="margin-top: 1rem;">${t('backToHome')}</a>
                </div>
            </div>
        </div>
    `;
}

// Funções utilitárias para estatísticas
function getTotalResponses() {
    return Object.values(state.surveys).reduce((total, survey) => total + survey.responses.length, 0);
}

function getAverageNPS() {
    const allNPS = [];
    Object.values(state.surveys).forEach(survey => {
        survey.responses.forEach(response => {
            if (response.answers.q1 !== undefined) {
                allNPS.push(parseInt(response.answers.q1));
            }
        });
    });
    
    if (allNPS.length === 0) return '--';
    
    const avg = allNPS.reduce((sum, score) => sum + score, 0) / allNPS.length;
    return Math.round(avg * 10) / 10;
}

function getActiveSurveys() {
    return Object.values(state.surveys).filter(survey => survey.status === 'active').length;
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    loadState();
    
    // Event listeners para mudança de idioma
    document.addEventListener('click', function(e) {
        if (e.target.matches('.language-btn')) {
            const lang = e.target.textContent.toLowerCase();
            if (lang === 'pt' || lang === 'en' || lang === 'es') {
                state.ui.lang = lang;
                saveState();
                
                // Atualiza botões ativos
                document.querySelectorAll('.language-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                
                router();
            }
        }
    });
    
    // Event listener para mudanças de hash
    window.addEventListener('hashchange', router);
    
    // Rota inicial
    router();
});

// Exporta funções globais necessárias
window.adminLogin = adminLogin;
window.logout = logout;
window.createNewSurvey = createNewSurvey;
window.editSurvey = editSurvey;
window.viewSurvey = viewSurvey;
window.duplicateSurvey = duplicateSurvey;
window.deleteSurvey = deleteSurvey;
window.saveSurvey = saveSurvey;

