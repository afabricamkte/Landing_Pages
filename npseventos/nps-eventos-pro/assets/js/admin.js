// NPS Eventos Pro - Funções Administrativas

/**
 * Funções para gerenciamento administrativo
 */

/**
 * Faz login administrativo
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

/**
 * Faz logout administrativo
 */
function logout() {
    state.ui.adminPassword = null;
    saveState();
    window.location.hash = '/admin';
    Utils.showToast('Logout realizado com sucesso!', 'info');
}

/**
 * Cria uma nova pesquisa
 */
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
            }
        ],
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

/**
 * Edita uma pesquisa
 */
function editSurvey(surveyId) {
    window.location.hash = `/admin?edit=${surveyId}`;
}

/**
 * Visualiza uma pesquisa
 */
function viewSurvey(slug) {
    window.open(`#/s/${slug}`, '_blank');
}

/**
 * Duplica uma pesquisa
 */
function duplicateSurvey(surveyId) {
    const original = state.surveys[surveyId];
    if (!original) {
        Utils.showToast('Pesquisa não encontrada!', 'error');
        return;
    }
    
    const newId = Utils.generateId('srv_');
    const newSlug = Utils.generateId('survey_');
    
    const duplicate = JSON.parse(JSON.stringify(original));
    duplicate.id = newId;
    duplicate.slug = newSlug;
    duplicate.title.pt += ' (Cópia)';
    duplicate.title.en += ' (Copy)';
    duplicate.title.es += ' (Copia)';
    duplicate.responses = [];
    duplicate.tokens = {};
    duplicate.answeredDevices = {};
    duplicate.status = 'draft';
    
    state.surveys[newId] = duplicate;
    state.slugs[newSlug] = newId;
    saveState();
    
    Utils.showToast('Pesquisa duplicada com sucesso!', 'success');
    router();
}

/**
 * Exclui uma pesquisa
 */
function deleteSurvey(surveyId) {
    const survey = state.surveys[surveyId];
    if (!survey) {
        Utils.showToast('Pesquisa não encontrada!', 'error');
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir a pesquisa "${survey.title[state.ui.lang]}"?\n\nEsta ação não pode ser desfeita.`)) {
        delete state.surveys[surveyId];
        delete state.slugs[survey.slug];
        saveState();
        
        Utils.showToast('Pesquisa excluída com sucesso!', 'success');
        router();
    }
}

/**
 * Salva uma pesquisa
 */
function saveSurvey(surveyId) {
    const survey = state.surveys[surveyId];
    if (!survey) {
        Utils.showToast('Pesquisa não encontrada!', 'error');
        return;
    }
    
    try {
        // Valida campos obrigatórios
        const titlePt = document.getElementById('titlePt').value.trim();
        const titleEn = document.getElementById('titleEn').value.trim();
        const titleEs = document.getElementById('titleEs').value.trim();
        const slug = document.getElementById('slug').value.trim();
        const eventDate = document.getElementById('eventDate').value;
        
        if (!titlePt || !titleEn || !titleEs) {
            Utils.showToast('Todos os títulos são obrigatórios!', 'error');
            return;
        }
        
        if (!slug) {
            Utils.showToast('Slug é obrigatório!', 'error');
            return;
        }
        
        if (!eventDate) {
            Utils.showToast('Data do evento é obrigatória!', 'error');
            return;
        }
        
        // Valida slug único
        const existingSlug = Object.keys(state.slugs).find(s => s === slug && state.slugs[s] !== surveyId);
        if (existingSlug) {
            Utils.showToast('Este slug já está sendo usado por outra pesquisa!', 'error');
            return;
        }
        
        // Atualiza informações básicas
        survey.title.pt = titlePt;
        survey.title.en = titleEn;
        survey.title.es = titleEs;
        survey.eventDate = eventDate;
        survey.brandColor = document.getElementById('brandColor').value;
        survey.status = document.querySelector('input[name="status"]:checked').value;
        survey.requireToken = document.getElementById('requireToken').checked;
        survey.webhook = document.getElementById('webhook').value.trim();
        
        // Atualiza mapeamento de slug
        Object.keys(state.slugs).forEach(s => {
            if (state.slugs[s] === surveyId) {
                delete state.slugs[s];
            }
        });
        survey.slug = slug;
        state.slugs[slug] = surveyId;
        
        saveState();
        Utils.showToast('Pesquisa salva com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao salvar pesquisa:', error);
        Utils.showToast('Erro ao salvar pesquisa!', 'error');
    }
}

/**
 * Adiciona uma nova pergunta
 */
function addQuestion(surveyId) {
    const survey = state.surveys[surveyId];
    if (!survey) {
        Utils.showToast('Pesquisa não encontrada!', 'error');
        return;
    }
    
    const questionId = Utils.generateId('q_');
    
    const newQuestion = {
        id: questionId,
        type: 'text',
        required: false,
        label: {
            pt: 'Nova pergunta',
            en: 'New question',
            es: 'Nueva pregunta'
        },
        help: {
            pt: '',
            en: '',
            es: ''
        }
    };
    
    survey.questions.push(newQuestion);
    saveState();
    
    Utils.showToast('Pergunta adicionada com sucesso!', 'success');
    router();
}

/**
 * Remove uma pergunta
 */
function removeQuestion(index) {
    const surveyId = new URLSearchParams(window.location.hash.split('?')[1]).get('edit');
    const survey = state.surveys[surveyId];
    
    if (!survey) {
        Utils.showToast('Pesquisa não encontrada!', 'error');
        return;
    }
    
    if (survey.questions.length <= 1) {
        Utils.showToast('Uma pesquisa deve ter pelo menos uma pergunta!', 'error');
        return;
    }
    
    if (confirm('Tem certeza que deseja remover esta pergunta?')) {
        survey.questions.splice(index, 1);
        saveState();
        
        Utils.showToast('Pergunta removida com sucesso!', 'success');
        router();
    }
}

/**
 * Move uma pergunta para cima ou para baixo
 */
function moveQuestion(index, direction) {
    const surveyId = new URLSearchParams(window.location.hash.split('?')[1]).get('edit');
    const survey = state.surveys[surveyId];
    
    if (!survey) {
        Utils.showToast('Pesquisa não encontrada!', 'error');
        return;
    }
    
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < survey.questions.length) {
        const temp = survey.questions[index];
        survey.questions[index] = survey.questions[newIndex];
        survey.questions[newIndex] = temp;
        saveState();
        router();
    }
}

/**
 * Atualiza o tipo de uma pergunta
 */
function updateQuestionType(questionId, type) {
    const surveyId = new URLSearchParams(window.location.hash.split('?')[1]).get('edit');
    const survey = state.surveys[surveyId];
    const question = survey.questions.find(q => q.id === questionId);
    
    if (question) {
        question.type = type;
        
        // Limpa opções se não for múltipla escolha
        if (type !== 'radio') {
            delete question.options;
        } else if (!question.options) {
            question.options = ['Opção 1', 'Opção 2'];
        }
        
        saveState();
    }
}

/**
 * Atualiza se uma pergunta é obrigatória
 */
function updateQuestionRequired(questionId, required) {
    const surveyId = new URLSearchParams(window.location.hash.split('?')[1]).get('edit');
    const survey = state.surveys[surveyId];
    const question = survey.questions.find(q => q.id === questionId);
    
    if (question) {
        question.required = required;
        saveState();
    }
}

/**
 * Atualiza o texto de uma pergunta
 */
function updateQuestionLabel(questionId, lang, value) {
    const surveyId = new URLSearchParams(window.location.hash.split('?')[1]).get('edit');
    const survey = state.surveys[surveyId];
    const question = survey.questions.find(q => q.id === questionId);
    
    if (question) {
        question.label[lang] = value;
        saveState();
    }
}

/**
 * Atualiza o texto de ajuda de uma pergunta
 */
function updateQuestionHelp(questionId, lang, value) {
    const surveyId = new URLSearchParams(window.location.hash.split('?')[1]).get('edit');
    const survey = state.surveys[surveyId];
    const question = survey.questions.find(q => q.id === questionId);
    
    if (question) {
        if (!question.help) {
            question.help = { pt: '', en: '', es: '' };
        }
        question.help[lang] = value;
        saveState();
    }
}

/**
 * Gera tokens únicos para uma pesquisa
 */
function generateTokens(surveyId, quantity = 100) {
    const survey = state.surveys[surveyId];
    if (!survey) {
        Utils.showToast('Pesquisa não encontrada!', 'error');
        return;
    }
    
    const tokens = [];
    for (let i = 0; i < quantity; i++) {
        const token = Utils.generateId('token_');
        tokens.push(token);
        survey.tokens[token] = {
            used: false,
            createdAt: new Date().toISOString(),
            usedAt: null
        };
    }
    
    saveState();
    Utils.showToast(`${quantity} tokens gerados com sucesso!`, 'success');
    
    return tokens;
}

/**
 * Exporta dados da pesquisa
 */
function exportSurveyData(surveyId, format = 'csv') {
    const survey = state.surveys[surveyId];
    if (!survey) {
        Utils.showToast('Pesquisa não encontrada!', 'error');
        return;
    }
    
    if (survey.responses.length === 0) {
        Utils.showToast('Não há respostas para exportar!', 'warning');
        return;
    }
    
    const data = survey.responses.map(response => {
        const row = {
            id: response.id,
            timestamp: Utils.formatDateTime(response.timestamp),
            device: response.device || 'N/A',
            token: response.token || 'N/A'
        };
        
        // Adiciona respostas das perguntas
        survey.questions.forEach((question, index) => {
            const questionKey = `pergunta_${index + 1}`;
            const answerKey = question.id;
            row[questionKey] = response.answers[answerKey] || '';
        });
        
        return row;
    });
    
    const filename = `${Utils.sanitizeSlug(survey.title.pt)}_${Utils.formatDate(new Date()).replace(/\//g, '-')}`;
    
    if (format === 'csv') {
        Utils.exportToCSV(data, `${filename}.csv`);
    } else {
        Utils.exportToJSON(data, `${filename}.json`);
    }
    
    Utils.showToast(`Dados exportados com sucesso!`, 'success');
}

/**
 * Limpa todas as respostas de uma pesquisa
 */
function clearSurveyResponses(surveyId) {
    const survey = state.surveys[surveyId];
    if (!survey) {
        Utils.showToast('Pesquisa não encontrada!', 'error');
        return;
    }
    
    if (survey.responses.length === 0) {
        Utils.showToast('Não há respostas para limpar!', 'info');
        return;
    }
    
    if (confirm(`Tem certeza que deseja limpar todas as ${survey.responses.length} respostas desta pesquisa?\n\nEsta ação não pode ser desfeita.`)) {
        survey.responses = [];
        survey.answeredDevices = {};
        
        // Limpa tokens usados
        Object.keys(survey.tokens).forEach(token => {
            survey.tokens[token].used = false;
            survey.tokens[token].usedAt = null;
        });
        
        saveState();
        Utils.showToast('Respostas limpas com sucesso!', 'success');
        router();
    }
}

/**
 * Copia link público da pesquisa
 */
function copyPublicLink(slug) {
    const url = `${window.location.origin}${window.location.pathname}#/s/${slug}`;
    
    Utils.copyToClipboard(url).then(success => {
        if (success) {
            Utils.showToast('Link copiado para a área de transferência!', 'success');
        } else {
            Utils.showToast('Erro ao copiar link!', 'error');
        }
    });
}

/**
 * Gera QR Code para a pesquisa
 */
function generateSurveyQR(slug) {
    const url = `${window.location.origin}${window.location.pathname}#/s/${slug}`;
    const qrUrl = Utils.generateQRCode(url, 300);
    
    // Abre QR Code em nova janela
    window.open(qrUrl, '_blank');
}

/**
 * Valida configurações da pesquisa
 */
function validateSurveyConfig(survey) {
    const errors = [];
    
    // Valida títulos
    if (!survey.title.pt.trim()) errors.push('Título em português é obrigatório');
    if (!survey.title.en.trim()) errors.push('Título em inglês é obrigatório');
    if (!survey.title.es.trim()) errors.push('Título em espanhol é obrigatório');
    
    // Valida slug
    if (!survey.slug.trim()) errors.push('Slug é obrigatório');
    if (!/^[a-z0-9-_]+$/.test(survey.slug)) errors.push('Slug deve conter apenas letras minúsculas, números, hífens e underscores');
    
    // Valida data
    if (!survey.eventDate) errors.push('Data do evento é obrigatória');
    
    // Valida perguntas
    if (!survey.questions || survey.questions.length === 0) {
        errors.push('Pelo menos uma pergunta é obrigatória');
    } else {
        survey.questions.forEach((question, index) => {
            if (!question.label.pt.trim()) errors.push(`Pergunta ${index + 1}: Texto em português é obrigatório`);
            if (!question.label.en.trim()) errors.push(`Pergunta ${index + 1}: Texto em inglês é obrigatório`);
            if (!question.label.es.trim()) errors.push(`Pergunta ${index + 1}: Texto em espanhol é obrigatório`);
        });
    }
    
    // Valida webhook se fornecido
    if (survey.webhook && !Utils.isValidUrl(survey.webhook)) {
        errors.push('URL do webhook é inválida');
    }
    
    return errors;
}

/**
 * Pré-visualiza a pesquisa
 */
function previewSurvey(surveyId) {
    const survey = state.surveys[surveyId];
    if (!survey) {
        Utils.showToast('Pesquisa não encontrada!', 'error');
        return;
    }
    
    const errors = validateSurveyConfig(survey);
    if (errors.length > 0) {
        Utils.showToast(`Corrija os seguintes erros:\n${errors.join('\n')}`, 'error');
        return;
    }
    
    // Abre preview em nova janela
    window.open(`#/s/${survey.slug}?preview=true`, '_blank');
}

// Exporta funções para uso global
if (typeof window !== 'undefined') {
    window.adminLogin = adminLogin;
    window.logout = logout;
    window.createNewSurvey = createNewSurvey;
    window.editSurvey = editSurvey;
    window.viewSurvey = viewSurvey;
    window.duplicateSurvey = duplicateSurvey;
    window.deleteSurvey = deleteSurvey;
    window.saveSurvey = saveSurvey;
    window.addQuestion = addQuestion;
    window.removeQuestion = removeQuestion;
    window.moveQuestion = moveQuestion;
    window.updateQuestionType = updateQuestionType;
    window.updateQuestionRequired = updateQuestionRequired;
    window.updateQuestionLabel = updateQuestionLabel;
    window.updateQuestionHelp = updateQuestionHelp;
    window.generateTokens = generateTokens;
    window.exportSurveyData = exportSurveyData;
    window.clearSurveyResponses = clearSurveyResponses;
    window.copyPublicLink = copyPublicLink;
    window.generateSurveyQR = generateSurveyQR;
    window.previewSurvey = previewSurvey;
}

