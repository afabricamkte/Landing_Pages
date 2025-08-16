// NPS Eventos Pro - Aplicação Principal Integrada
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
 * Variáveis globais para funcionalidades avançadas
 */
let currentSurvey = null;
let currentQuizState = {
    currentQuestion: 0,
    answers: {},
    surveyId: null,
    startTime: null,
    deviceId: null,
    token: null
};

// Chaves para localStorage
const STORAGE_KEY = 'npsEventosProState';
const DRAFT_KEY = (surveyId, scope) => `nps_draft_${surveyId}_${scope}`;

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
        backToHome: '← Voltar ao Início',
        // Novas traduções para funcionalidades avançadas
        tokens: 'Tokens',
        generateTokens: 'Gerar Tokens',
        tokenRequired: 'Token Obrigatório',
        conditionalRules: 'Regras Condicionais',
        addRule: 'Adicionar Regra',
        when: 'Quando',
        then: 'Então',
        equals: 'Igual a',
        notEquals: 'Diferente de',
        contains: 'Contém',
        greater: 'Maior que',
        less: 'Menor que',
        show: 'Mostrar',
        hide: 'Esconder',
        makeReq: 'Tornar obrigatório',
        autoSave: 'Salvamento automático ativo',
        draftLoaded: 'Rascunho carregado',
        webhook: 'Webhook URL',
        integrations: 'Integrações',
        exportData: 'Exportar Dados',
        csvExport: 'Exportar CSV',
        jsonExport: 'Exportar JSON'
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
        backToHome: '← Back to Home',
        // Novas traduções para funcionalidades avançadas
        tokens: 'Tokens',
        generateTokens: 'Generate Tokens',
        tokenRequired: 'Token Required',
        conditionalRules: 'Conditional Rules',
        addRule: 'Add Rule',
        when: 'When',
        then: 'Then',
        equals: 'Equals',
        notEquals: 'Not equals',
        contains: 'Contains',
        greater: 'Greater than',
        less: 'Less than',
        show: 'Show',
        hide: 'Hide',
        makeReq: 'Make required',
        autoSave: 'Auto-save active',
        draftLoaded: 'Draft loaded',
        webhook: 'Webhook URL',
        integrations: 'Integrations',
        exportData: 'Export Data',
        csvExport: 'Export CSV',
        jsonExport: 'Export JSON'
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
        backToHome: '← Volver al Inicio',
        // Novas traduções para funcionalidades avançadas
        tokens: 'Tokens',
        generateTokens: 'Generar Tokens',
        tokenRequired: 'Token Requerido',
        conditionalRules: 'Reglas Condicionales',
        addRule: 'Agregar Regla',
        when: 'Cuando',
        then: 'Entonces',
        equals: 'Igual a',
        notEquals: 'Diferente de',
        contains: 'Contiene',
        greater: 'Mayor que',
        less: 'Menor que',
        show: 'Mostrar',
        hide: 'Ocultar',
        makeReq: 'Hacer obligatorio',
        autoSave: 'Guardado automático activo',
        draftLoaded: 'Borrador cargado',
        webhook: 'URL del Webhook',
        integrations: 'Integraciones',
        exportData: 'Exportar Datos',
        csvExport: 'Exportar CSV',
        jsonExport: 'Exportar JSON'
    }
};

/**
 * Função de tradução
 */
function t(key) {
    return translations[state.ui.lang]?.[key] || key;
}

/**
 * Utilitários
 */
const Utils = {
    generateId: (prefix = 'id_') => prefix + Math.random().toString(36).substr(2, 9),
    
    generateDeviceId: () => {
        let deviceId = localStorage.getItem('npsDeviceId');
        if (!deviceId) {
            deviceId = Utils.generateId('device_');
            localStorage.setItem('npsDeviceId', deviceId);
        }
        return deviceId;
    },
    
    generateToken: () => Math.random().toString(36).substr(2, 12).toUpperCase(),
    
    showToast: (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1'
        };
        
        toast.style.backgroundColor = colors[type] || colors.info;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    formatDate: (date) => {
        return new Date(date).toLocaleDateString(state.ui.lang === 'pt' ? 'pt-BR' : state.ui.lang);
    },
    
    calculateNPS: (responses) => {
        if (!responses || responses.length === 0) return 0;
        
        const npsScores = responses
            .map(r => r.answers?.q1)
            .filter(score => score !== undefined && score !== null);
        
        if (npsScores.length === 0) return 0;
        
        const promoters = npsScores.filter(score => score >= 9).length;
        const detractors = npsScores.filter(score => score <= 6).length;
        
        return Math.round(((promoters - detractors) / npsScores.length) * 100);
    }
};

/**
 * Gerenciamento de estado
 */
function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Erro ao salvar estado:', e);
    }
}

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            state = { ...state, ...parsed };
        }
    } catch (e) {
        console.error('Erro ao carregar estado:', e);
    }
}

/**
 * Inicialização de dados padrão
 */
function initializeDefaultData() {
    if (Object.keys(state.surveys).length === 0) {
        const surveyId = Utils.generateId('srv_');
        const slug = Utils.generateId('survey_');
        
        const survey = {
            id: surveyId,
            slug: slug,
            title: {
                pt: 'Pesquisa de Satisfação do Evento',
                en: 'Event Satisfaction Survey',
                es: 'Encuesta de Satisfacción del Evento'
            },
            eventDate: new Date().toISOString().split('T')[0],
            status: 'active',
            brandColor: '#6366f1',
            requireToken: false,
            webhook: '',
            questions: [
                {
                    id: 'q1',
                    type: 'nps',
                    required: true,
                    visible: true,
                    label: {
                        pt: 'Em uma escala de 0 a 10, o quanto você recomendaria este evento a um amigo ou colega?',
                        en: 'On a scale of 0 to 10, how likely would you recommend this event to a friend or colleague?',
                        es: 'En una escala de 0 a 10, ¿qué tan probable es que recomiendes este evento a un amigo o colega?'
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
                    visible: true,
                    label: {
                        pt: 'Como você avalia a qualidade geral do evento?',
                        en: 'How do you rate the overall quality of the event?',
                        es: '¿Cómo califica la calidad general del evento?'
                    }
                },
                {
                    id: 'q3',
                    type: 'text',
                    required: false,
                    visible: true,
                    label: {
                        pt: 'O que você mais gostou no evento?',
                        en: 'What did you like most about the event?',
                        es: '¿Qué fue lo que más te gustó del evento?'
                    }
                },
                {
                    id: 'q4',
                    type: 'textarea',
                    required: false,
                    visible: true,
                    label: {
                        pt: 'Sugestões para melhorar o evento:',
                        en: 'Suggestions to improve the event:',
                        es: 'Sugerencias para mejorar el evento:'
                    }
                }
            ],
            rules: [], // Regras condicionais
            responses: [],
            tokens: {},
            answeredDevices: {},
            footer: {
                text: '© NPS Eventos Pro - Todos os direitos reservados.',
                showPolicy: false,
                policyURL: '/politica-de-privacidade'
            }
        };
        
        state.surveys[surveyId] = survey;
        state.slugs[slug] = surveyId;
        saveState();
    }
}

/**
 * Sistema de roteamento
 */
function handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, params] = hash.split('?');
    const urlParams = new URLSearchParams(params || '');
    
    if (path === '/' || path === '') {
        showHomePage();
    } else if (path === '/admin') {
        if (state.ui.adminPassword) {
            showAdminPage(urlParams);
        } else {
            showLoginPage();
        }
    } else if (path.startsWith('/s/')) {
        const slug = path.split('/')[2];
        const token = urlParams.get('token');
        showSurveyPage(slug, token);
    } else if (path.startsWith('/thank-you/')) {
        const surveyId = path.split('/')[2];
        showThankYouPage(surveyId);
    } else {
        show404Page();
    }
}

/**
 * Páginas da aplicação
 */
function showHomePage() {
    const stats = calculateStats();
    
    document.getElementById('app').innerHTML = `
        <div class="hero">
            <h1>${t('welcome')}</h1>
            <p>${t('subtitle')}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${stats.totalSurveys}</div>
                <div class="stat-label">${t('totalSurveys')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalResponses}</div>
                <div class="stat-label">${t('totalResponses')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.averageNPS}</div>
                <div class="stat-label">${t('averageNPS')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.activeSurveys}</div>
                <div class="stat-label">${t('activeSurveys')}</div>
            </div>
        </div>

        <div class="cta-section">
            <a href="#/admin" class="btn btn-primary">${t('accessAdmin')}</a>
        </div>
    `;
}

function showLoginPage() {
    document.getElementById('app').innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <h2>${t('admin')}</h2>
                <form onsubmit="adminLogin(); return false;">
                    <input type="password" id="adminPassword" placeholder="Senha" required>
                    <button type="submit" class="btn btn-primary">Entrar</button>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('adminPassword').focus();
}

function showAdminPage(urlParams) {
    const editId = urlParams.get('edit');
    
    if (editId) {
        showSurveyEditor(editId);
    } else {
        showSurveyList();
    }
}

function showSurveyList() {
    const surveys = Object.values(state.surveys);
    
    document.getElementById('app').innerHTML = `
        <div class="admin-header">
            <h1>${t('surveys')}</h1>
            <div class="admin-actions">
                <button onclick="createNewSurvey()" class="btn btn-primary">${t('newSurvey')}</button>
                <button onclick="logout()" class="btn btn-ghost">${t('logout')}</button>
            </div>
        </div>

        <div class="surveys-table">
            <table>
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
                            <td>${survey.title[state.ui.lang] || survey.title.pt}</td>
                            <td>${Utils.formatDate(survey.eventDate)}</td>
                            <td><span class="status ${survey.status}">${t(survey.status)}</span></td>
                            <td>${survey.responses.length}</td>
                            <td class="actions">
                                <button onclick="editSurvey('${survey.id}')" class="btn btn-small">${t('edit')}</button>
                                <button onclick="viewSurvey('${survey.slug}')" class="btn btn-small">${t('view')}</button>
                                <button onclick="duplicateSurvey('${survey.id}')" class="btn btn-small">${t('duplicate')}</button>
                                <button onclick="deleteSurvey('${survey.id}')" class="btn btn-small btn-error">${t('delete')}</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showSurveyEditor(surveyId) {
    const survey = state.surveys[surveyId];
    if (!survey) {
        Utils.showToast('Pesquisa não encontrada', 'error');
        window.location.hash = '/admin';
        return;
    }
    
    document.getElementById('app').innerHTML = `
        <div class="editor-container">
            <div class="editor-header">
                <h1>Editor de Pesquisa</h1>
                <div class="editor-actions">
                    <button onclick="saveSurvey('${surveyId}')" class="btn btn-primary">${t('save')}</button>
                    <button onclick="previewSurvey('${survey.slug}')" class="btn btn-ghost">${t('preview')}</button>
                    <a href="#/admin" class="btn btn-ghost">${t('cancel')}</a>
                </div>
            </div>
            
            <div class="editor-content">
                <div class="editor-tabs">
                    <button class="tab-btn active" onclick="showTab('basic')">Básico</button>
                    <button class="tab-btn" onclick="showTab('questions')">Perguntas</button>
                    <button class="tab-btn" onclick="showTab('rules')">Condicionais</button>
                    <button class="tab-btn" onclick="showTab('tokens')">Tokens</button>
                    <button class="tab-btn" onclick="showTab('integrations')">Integrações</button>
                </div>
                
                <div id="tab-basic" class="tab-content active">
                    ${renderBasicTab(survey)}
                </div>
                
                <div id="tab-questions" class="tab-content">
                    ${renderQuestionsTab(survey)}
                </div>
                
                <div id="tab-rules" class="tab-content">
                    ${renderRulesTab(survey)}
                </div>
                
                <div id="tab-tokens" class="tab-content">
                    ${renderTokensTab(survey)}
                </div>
                
                <div id="tab-integrations" class="tab-content">
                    ${renderIntegrationsTab(survey)}
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderização das abas do editor
 */
function renderBasicTab(survey) {
    return `
        <div class="form-section">
            <h3>Informações Básicas</h3>
            <div class="form-group">
                <label>Título (PT)</label>
                <input type="text" id="title-pt" value="${survey.title.pt || ''}" onchange="updateSurveyField('${survey.id}', 'title.pt', this.value)">
            </div>
            <div class="form-group">
                <label>Título (EN)</label>
                <input type="text" id="title-en" value="${survey.title.en || ''}" onchange="updateSurveyField('${survey.id}', 'title.en', this.value)">
            </div>
            <div class="form-group">
                <label>Título (ES)</label>
                <input type="text" id="title-es" value="${survey.title.es || ''}" onchange="updateSurveyField('${survey.id}', 'title.es', this.value)">
            </div>
            <div class="form-group">
                <label>Data do Evento</label>
                <input type="date" id="eventDate" value="${survey.eventDate}" onchange="updateSurveyField('${survey.id}', 'eventDate', this.value)">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="status" onchange="updateSurveyField('${survey.id}', 'status', this.value)">
                    <option value="draft" ${survey.status === 'draft' ? 'selected' : ''}>Rascunho</option>
                    <option value="active" ${survey.status === 'active' ? 'selected' : ''}>Ativa</option>
                    <option value="closed" ${survey.status === 'closed' ? 'selected' : ''}>Encerrada</option>
                </select>
            </div>
            <div class="form-group">
                <label>Cor da Marca</label>
                <input type="color" id="brandColor" value="${survey.brandColor}" onchange="updateSurveyField('${survey.id}', 'brandColor', this.value)">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="requireToken" ${survey.requireToken ? 'checked' : ''} onchange="updateSurveyField('${survey.id}', 'requireToken', this.checked)">
                    ${t('tokenRequired')}
                </label>
            </div>
        </div>
    `;
}

function renderQuestionsTab(survey) {
    return `
        <div class="questions-section">
            <div class="section-header">
                <h3>Perguntas</h3>
                <button onclick="addQuestion('${survey.id}')" class="btn btn-primary">Adicionar Pergunta</button>
            </div>
            <div id="questions-list">
                ${survey.questions.map((q, index) => renderQuestionEditor(survey.id, q, index)).join('')}
            </div>
        </div>
    `;
}

function renderRulesTab(survey) {
    return `
        <div class="rules-section">
            <div class="section-header">
                <h3>${t('conditionalRules')}</h3>
                <button onclick="addRule('${survey.id}')" class="btn btn-primary">${t('addRule')}</button>
            </div>
            <div id="rules-list">
                ${(survey.rules || []).map((rule, index) => renderRuleEditor(survey.id, rule, index)).join('')}
            </div>
        </div>
    `;
}

function renderTokensTab(survey) {
    const tokens = Object.keys(survey.tokens || {});
    return `
        <div class="tokens-section">
            <div class="section-header">
                <h3>${t('tokens')}</h3>
                <div class="tokens-actions">
                    <input type="number" id="tokenCount" placeholder="Quantidade" min="1" max="1000" value="10">
                    <button onclick="generateTokens('${survey.id}')" class="btn btn-primary">${t('generateTokens')}</button>
                </div>
            </div>
            <div class="tokens-stats">
                <p>Total de tokens: ${tokens.length}</p>
                <p>Tokens usados: ${tokens.filter(t => survey.tokens[t].used).length}</p>
            </div>
            <div class="tokens-list">
                ${tokens.map(token => `
                    <div class="token-item ${survey.tokens[token].used ? 'used' : ''}">
                        <code>${token}</code>
                        <span class="token-status">${survey.tokens[token].used ? 'Usado' : 'Disponível'}</span>
                        ${survey.tokens[token].used ? `<small>Usado em: ${Utils.formatDate(survey.tokens[token].usedAt)}</small>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderIntegrationsTab(survey) {
    return `
        <div class="integrations-section">
            <h3>${t('integrations')}</h3>
            <div class="form-group">
                <label>${t('webhook')}</label>
                <input type="url" id="webhook" value="${survey.webhook || ''}" onchange="updateSurveyField('${survey.id}', 'webhook', this.value)" placeholder="https://exemplo.com/webhook">
                <small>URL que receberá os dados das respostas via POST</small>
            </div>
            
            <div class="export-section">
                <h4>${t('exportData')}</h4>
                <div class="export-actions">
                    <button onclick="exportSurveyData('${survey.id}', 'csv')" class="btn btn-ghost">${t('csvExport')}</button>
                    <button onclick="exportSurveyData('${survey.id}', 'json')" class="btn btn-ghost">${t('jsonExport')}</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Funções auxiliares para renderização
 */
function renderQuestionEditor(surveyId, question, index) {
    return `
        <div class="question-editor" data-question-id="${question.id}">
            <div class="question-header">
                <span class="question-number">${index + 1}</span>
                <select onchange="updateQuestionType('${surveyId}', '${question.id}', this.value)">
                    <option value="nps" ${question.type === 'nps' ? 'selected' : ''}>NPS (0-10)</option>
                    <option value="likert" ${question.type === 'likert' ? 'selected' : ''}>Likert (1-5)</option>
                    <option value="text" ${question.type === 'text' ? 'selected' : ''}>Texto</option>
                    <option value="textarea" ${question.type === 'textarea' ? 'selected' : ''}>Texto Longo</option>
                    <option value="radio" ${question.type === 'radio' ? 'selected' : ''}>Múltipla Escolha</option>
                    <option value="select" ${question.type === 'select' ? 'selected' : ''}>Lista Suspensa</option>
                </select>
                <div class="question-actions">
                    <label><input type="checkbox" ${question.visible ? 'checked' : ''} onchange="updateQuestionField('${surveyId}', '${question.id}', 'visible', this.checked)"> Visível</label>
                    <label><input type="checkbox" ${question.required ? 'checked' : ''} onchange="updateQuestionField('${surveyId}', '${question.id}', 'required', this.checked)"> Obrigatória</label>
                    <button onclick="moveQuestion('${surveyId}', ${index}, -1)" class="btn btn-small" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button onclick="moveQuestion('${surveyId}', ${index}, 1)" class="btn btn-small">↓</button>
                    <button onclick="deleteQuestion('${surveyId}', '${question.id}')" class="btn btn-small btn-error">×</button>
                </div>
            </div>
            
            <div class="question-content">
                <div class="form-group">
                    <label>Pergunta (PT)</label>
                    <input type="text" value="${question.label?.pt || ''}" onchange="updateQuestionLabel('${surveyId}', '${question.id}', 'pt', this.value)">
                </div>
                <div class="form-group">
                    <label>Pergunta (EN)</label>
                    <input type="text" value="${question.label?.en || ''}" onchange="updateQuestionLabel('${surveyId}', '${question.id}', 'en', this.value)">
                </div>
                <div class="form-group">
                    <label>Pergunta (ES)</label>
                    <input type="text" value="${question.label?.es || ''}" onchange="updateQuestionLabel('${surveyId}', '${question.id}', 'es', this.value)">
                </div>
                
                ${question.type === 'radio' || question.type === 'select' ? `
                    <div class="form-group">
                        <label>Opções (uma por linha)</label>
                        <textarea onchange="updateQuestionOptions('${surveyId}', '${question.id}', this.value)" placeholder="Opção 1&#10;Opção 2&#10;Opção 3">${(question.options || []).join('\n')}</textarea>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderRuleEditor(surveyId, rule, index) {
    const survey = state.surveys[surveyId];
    const questionOptions = survey.questions.map(q => `<option value="${q.id}" ${rule.when?.qid === q.id ? 'selected' : ''}>${q.label?.pt || q.id}</option>`).join('');
    
    return `
        <div class="rule-editor">
            <div class="rule-header">
                <h4>Regra ${index + 1}</h4>
                <button onclick="deleteRule('${surveyId}', ${index})" class="btn btn-small btn-error">Remover</button>
            </div>
            
            <div class="rule-content">
                <div class="rule-when">
                    <label>${t('when')}</label>
                    <div class="rule-condition">
                        <select onchange="updateRuleCondition('${surveyId}', ${index}, 'qid', this.value)">
                            <option value="">Selecione uma pergunta</option>
                            ${questionOptions}
                        </select>
                        <select onchange="updateRuleCondition('${surveyId}', ${index}, 'op', this.value)">
                            <option value="equals" ${rule.when?.op === 'equals' ? 'selected' : ''}>${t('equals')}</option>
                            <option value="notEquals" ${rule.when?.op === 'notEquals' ? 'selected' : ''}>${t('notEquals')}</option>
                            <option value="contains" ${rule.when?.op === 'contains' ? 'selected' : ''}>${t('contains')}</option>
                            <option value="greater" ${rule.when?.op === 'greater' ? 'selected' : ''}>${t('greater')}</option>
                            <option value="less" ${rule.when?.op === 'less' ? 'selected' : ''}>${t('less')}</option>
                        </select>
                        <input type="text" value="${rule.when?.value || ''}" onchange="updateRuleCondition('${surveyId}', ${index}, 'value', this.value)" placeholder="Valor">
                    </div>
                </div>
                
                <div class="rule-then">
                    <label>${t('then')}</label>
                    <div id="rule-actions-${index}">
                        ${(rule.then || []).map((action, actionIndex) => `
                            <div class="rule-action">
                                <select onchange="updateRuleAction('${surveyId}', ${index}, ${actionIndex}, 'action', this.value)">
                                    <option value="show" ${action.action === 'show' ? 'selected' : ''}>${t('show')}</option>
                                    <option value="hide" ${action.action === 'hide' ? 'selected' : ''}>${t('hide')}</option>
                                    <option value="makeReq" ${action.action === 'makeReq' ? 'selected' : ''}>${t('makeReq')}</option>
                                </select>
                                <select onchange="updateRuleAction('${surveyId}', ${index}, ${actionIndex}, 'target', this.value)">
                                    <option value="">Selecione uma pergunta</option>
                                    ${questionOptions}
                                </select>
                                <button onclick="deleteRuleAction('${surveyId}', ${index}, ${actionIndex})" class="btn btn-small btn-error">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="addRuleAction('${surveyId}', ${index})" class="btn btn-small">+ Ação</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Funções de manipulação do editor
 */
function showTab(tabName) {
    // Remove active de todas as abas
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Ativa a aba selecionada
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

function updateSurveyField(surveyId, field, value) {
    const survey = state.surveys[surveyId];
    if (!survey) return;
    
    const keys = field.split('.');
    let obj = survey;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
    saveState();
}

function updateQuestionField(surveyId, questionId, field, value) {
    const survey = state.surveys[surveyId];
    const question = survey.questions.find(q => q.id === questionId);
    if (!question) return;
    
    question[field] = value;
    saveState();
}

function updateQuestionLabel(surveyId, questionId, lang, value) {
    const survey = state.surveys[surveyId];
    const question = survey.questions.find(q => q.id === questionId);
    if (!question) return;
    
    if (!question.label) question.label = {};
    question.label[lang] = value;
    saveState();
}

function updateQuestionOptions(surveyId, questionId, value) {
    const survey = state.surveys[surveyId];
    const question = survey.questions.find(q => q.id === questionId);
    if (!question) return;
    
    question.options = value.split('\n').filter(opt => opt.trim());
    saveState();
}

function addQuestion(surveyId) {
    const survey = state.surveys[surveyId];
    const questionId = Utils.generateId('q_');
    
    const newQuestion = {
        id: questionId,
        type: 'text',
        required: false,
        visible: true,
        label: {
            pt: 'Nova pergunta',
            en: 'New question',
            es: 'Nueva pregunta'
        }
    };
    
    survey.questions.push(newQuestion);
    saveState();
    
    // Recarrega a aba de perguntas
    document.getElementById('tab-questions').innerHTML = renderQuestionsTab(survey);
}

function deleteQuestion(surveyId, questionId) {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;
    
    const survey = state.surveys[surveyId];
    survey.questions = survey.questions.filter(q => q.id !== questionId);
    saveState();
    
    // Recarrega a aba de perguntas
    document.getElementById('tab-questions').innerHTML = renderQuestionsTab(survey);
}

function addRule(surveyId) {
    const survey = state.surveys[surveyId];
    if (!survey.rules) survey.rules = [];
    
    survey.rules.push({
        when: { qid: '', op: 'equals', value: '' },
        then: [{ action: 'show', target: '' }]
    });
    
    saveState();
    
    // Recarrega a aba de regras
    document.getElementById('tab-rules').innerHTML = renderRulesTab(survey);
}

function deleteRule(surveyId, ruleIndex) {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
    
    const survey = state.surveys[surveyId];
    survey.rules.splice(ruleIndex, 1);
    saveState();
    
    // Recarrega a aba de regras
    document.getElementById('tab-rules').innerHTML = renderRulesTab(survey);
}

function generateTokens(surveyId) {
    const count = parseInt(document.getElementById('tokenCount').value) || 10;
    const survey = state.surveys[surveyId];
    
    if (!survey.tokens) survey.tokens = {};
    
    for (let i = 0; i < count; i++) {
        const token = Utils.generateToken();
        survey.tokens[token] = {
            used: false,
            createdAt: new Date().toISOString()
        };
    }
    
    saveState();
    Utils.showToast(`${count} tokens gerados com sucesso!`, 'success');
    
    // Recarrega a aba de tokens
    document.getElementById('tab-tokens').innerHTML = renderTokensTab(survey);
}

/**
 * Funções administrativas
 */
function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'admin123') {
        state.ui.adminPassword = password;
        saveState();
        window.location.hash = '/admin';
        Utils.showToast('Login realizado com sucesso!', 'success');
    } else {
        Utils.showToast(t('invalidPassword'), 'error');
        document.getElementById('adminPassword').focus();
    }
}

function logout() {
    state.ui.adminPassword = null;
    saveState();
    window.location.hash = '/admin';
    Utils.showToast('Logout realizado com sucesso!', 'info');
}

function createNewSurvey() {
    const surveyId = Utils.generateId('srv_');
    const slug = Utils.generateId('survey_');
    
    const survey = {
        id: surveyId,
        slug: slug,
        title: {
            pt: 'Nova Pesquisa',
            en: 'New Survey',
            es: 'Nueva Encuesta'
        },
        eventDate: new Date().toISOString().split('T')[0],
        status: 'draft',
        brandColor: '#6366f1',
        requireToken: false,
        webhook: '',
        questions: [
            {
                id: 'q1',
                type: 'nps',
                required: true,
                visible: true,
                label: {
                    pt: 'Em uma escala de 0 a 10, o quanto você recomendaria este evento?',
                    en: 'On a scale of 0 to 10, how likely would you recommend this event?',
                    es: 'En una escala de 0 a 10, ¿qué tan probable es que recomiendes este evento?'
                }
            }
        ],
        rules: [],
        responses: [],
        tokens: {},
        answeredDevices: {}
    };
    
    state.surveys[surveyId] = survey;
    state.slugs[slug] = surveyId;
    saveState();
    
    Utils.showToast('Nova pesquisa criada com sucesso!', 'success');
    window.location.hash = `/admin?edit=${surveyId}`;
}

function editSurvey(surveyId) {
    window.location.hash = `/admin?edit=${surveyId}`;
}

function viewSurvey(slug) {
    window.open(`#/s/${slug}`, '_blank');
}

function duplicateSurvey(surveyId) {
    const originalSurvey = state.surveys[surveyId];
    if (!originalSurvey) return;
    
    const newSurveyId = Utils.generateId('srv_');
    const newSlug = Utils.generateId('survey_');
    
    const duplicatedSurvey = {
        ...JSON.parse(JSON.stringify(originalSurvey)),
        id: newSurveyId,
        slug: newSlug,
        title: {
            pt: originalSurvey.title.pt + ' (Cópia)',
            en: originalSurvey.title.en + ' (Copy)',
            es: originalSurvey.title.es + ' (Copia)'
        },
        responses: [],
        tokens: {},
        answeredDevices: {}
    };
    
    state.surveys[newSurveyId] = duplicatedSurvey;
    state.slugs[newSlug] = newSurveyId;
    saveState();
    
    Utils.showToast('Pesquisa duplicada com sucesso!', 'success');
    showSurveyList();
}

function deleteSurvey(surveyId) {
    if (!confirm('Tem certeza que deseja excluir esta pesquisa? Esta ação não pode ser desfeita.')) return;
    
    const survey = state.surveys[surveyId];
    if (survey) {
        delete state.slugs[survey.slug];
        delete state.surveys[surveyId];
        saveState();
        
        Utils.showToast('Pesquisa excluída com sucesso!', 'success');
        showSurveyList();
    }
}

function exportSurveyData(surveyId, format) {
    const survey = state.surveys[surveyId];
    if (!survey || !survey.responses.length) {
        Utils.showToast('Nenhuma resposta para exportar', 'warning');
        return;
    }
    
    let content, filename, mimeType;
    
    if (format === 'csv') {
        content = generateCSV(survey);
        filename = `${survey.slug}_responses.csv`;
        mimeType = 'text/csv';
    } else if (format === 'json') {
        content = JSON.stringify(survey.responses, null, 2);
        filename = `${survey.slug}_responses.json`;
        mimeType = 'application/json';
    }
    
    downloadFile(content, filename, mimeType);
    Utils.showToast(`Dados exportados em ${format.toUpperCase()}!`, 'success');
}

function generateCSV(survey) {
    const headers = ['ID', 'Data/Hora', 'Idioma', 'Dispositivo', 'Token'];
    const questionIds = survey.questions.map(q => q.id);
    headers.push(...questionIds);
    
    const rows = [headers];
    
    survey.responses.forEach(response => {
        const row = [
            response.id,
            new Date(response.timestamp).toLocaleString(),
            response.language || 'pt',
            response.deviceId || '',
            response.token || ''
        ];
        
        questionIds.forEach(qId => {
            const answer = response.answers[qId];
            row.push(Array.isArray(answer) ? answer.join('; ') : (answer || ''));
        });
        
        rows.push(row);
    });
    
    return rows.map(row => 
        row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Cálculo de estatísticas
 */
function calculateStats() {
    const surveys = Object.values(state.surveys);
    const totalSurveys = surveys.length;
    const activeSurveys = surveys.filter(s => s.status === 'active').length;
    const totalResponses = surveys.reduce((sum, s) => sum + s.responses.length, 0);
    
    let totalNPS = 0;
    let npsCount = 0;
    
    surveys.forEach(survey => {
        survey.responses.forEach(response => {
            const npsScore = response.answers?.q1;
            if (npsScore !== undefined && npsScore !== null) {
                totalNPS += npsScore;
                npsCount++;
            }
        });
    });
    
    const averageNPS = npsCount > 0 ? Math.round(totalNPS / npsCount) : 0;
    
    return {
        totalSurveys,
        activeSurveys,
        totalResponses,
        averageNPS
    };
}

/**
 * Inicialização da aplicação
 */
function initApp() {
    loadState();
    initializeDefaultData();
    
    // Event listeners
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
    
    // Language switcher
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            state.ui.lang = lang;
            saveState();
            
            // Update active button
            document.querySelectorAll('.language-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Reload current page
            handleRoute();
        });
    });
    
    // Initial route
    handleRoute();
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

