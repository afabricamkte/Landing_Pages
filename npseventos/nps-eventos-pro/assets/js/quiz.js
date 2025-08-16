// NPS Eventos Pro - Sistema de Quiz Avançado

/**
 * Estado do quiz atual
 */
let quizState = {
    currentQuestion: 0,
    answers: {},
    surveyId: null,
    startTime: null,
    deviceId: null,
    token: null,
    survey: null,
    visibleQuestions: [],
    dynamicRequired: {},
    hiddenByRule: {}
};

let autoSaveTimer = null;

/**
 * Inicializa o quiz
 */
function initializeQuiz(surveyId, token = null) {
    const survey = state.surveys[surveyId];
    if (!survey) {
        showQuizError(t('invalidLink'));
        return;
    }
    
    // Verifica se a pesquisa está ativa
    if (survey.status !== 'active') {
        showQuizError(t('invalidLink'));
        return;
    }
    
    // Verifica token se necessário
    if (survey.requireToken) {
        if (!token || !survey.tokens[token] || survey.tokens[token].used) {
            showQuizError('Token inválido ou já utilizado');
            return;
        }
    }
    
    // Verifica se o dispositivo já respondeu (se não usar tokens)
    const deviceId = Utils.generateDeviceId();
    if (!survey.requireToken && survey.answeredDevices && survey.answeredDevices[deviceId]) {
        showQuizError('Este dispositivo já respondeu a pesquisa');
        return;
    }
    
    quizState = {
        currentQuestion: 0,
        answers: {},
        surveyId: surveyId,
        startTime: new Date().toISOString(),
        deviceId: deviceId,
        token: token,
        survey: survey,
        visibleQuestions: survey.questions.filter(q => q.visible !== false),
        dynamicRequired: {},
        hiddenByRule: {}
    };
    
    // Carrega rascunho se existir
    loadDraft();
    
    // Salva estado do quiz no sessionStorage
    sessionStorage.setItem('quizState', JSON.stringify(quizState));
    
    // Renderiza o quiz
    renderQuiz();
    
    // Inicia auto-salvamento
    startAutoSave();
}

/**
 * Renderiza o quiz
 */
function renderQuiz() {
    const survey = quizState.survey;
    const currentQ = getCurrentQuestion();
    
    if (!currentQ) {
        finishQuiz();
        return;
    }
    
    // Aplica regras condicionais
    applyConditionalRules();
    
    // Calcula progresso
    const progress = ((quizState.currentQuestion + 1) / quizState.visibleQuestions.length) * 100;
    
    document.getElementById('app').innerHTML = `
        <div class="quiz-container">
            <div class="quiz-header">
                <div class="quiz-progress">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="quiz-info">
                    <span class="question-counter">${quizState.currentQuestion + 1} de ${quizState.visibleQuestions.length}</span>
                    <div class="quiz-actions">
                        <button class="language-btn ${state.ui.lang === 'pt' ? 'active' : ''}" onclick="changeQuizLanguage('pt')">PT</button>
                        <button class="language-btn ${state.ui.lang === 'en' ? 'active' : ''}" onclick="changeQuizLanguage('en')">EN</button>
                        <button class="language-btn ${state.ui.lang === 'es' ? 'active' : ''}" onclick="changeQuizLanguage('es')">ES</button>
                    </div>
                </div>
            </div>
            
            <div class="quiz-content">
                <div class="question-container">
                    ${renderQuestion(currentQ)}
                </div>
                
                <div class="quiz-navigation">
                    <button onclick="previousQuestion()" class="btn btn-ghost" ${quizState.currentQuestion === 0 ? 'disabled' : ''}>
                        ${t('previous')}
                    </button>
                    <div class="spacer"></div>
                    <button onclick="nextQuestion()" class="btn btn-primary" id="nextBtn" ${!isCurrentQuestionAnswered() ? 'disabled' : ''}>
                        ${quizState.currentQuestion === quizState.visibleQuestions.length - 1 ? t('finish') : t('next')}
                    </button>
                </div>
            </div>
            
            <div class="quiz-footer">
                <small class="auto-save-indicator" id="autoSaveIndicator">${t('autoSave')}</small>
            </div>
        </div>
    `;
    
    // Aplica cor da marca
    if (survey.brandColor) {
        document.documentElement.style.setProperty('--brand-primary', survey.brandColor);
    }
    
    // Foca no primeiro elemento interativo
    setTimeout(() => {
        const firstInput = document.querySelector('.question-container input, .question-container button, .question-container select, .question-container textarea');
        if (firstInput) firstInput.focus();
    }, 100);
}

/**
 * Renderiza uma pergunta
 */
function renderQuestion(question) {
    const label = question.label?.[state.ui.lang] || question.label?.pt || 'Pergunta sem título';
    const help = question.help?.[state.ui.lang] || question.help?.pt || '';
    const isRequired = isQuestionRequired(question);
    const currentAnswer = quizState.answers[question.id];
    
    let questionHTML = `
        <div class="question" data-question-id="${question.id}">
            <h2 class="question-title">
                ${label}
                ${isRequired ? '<span class="required">*</span>' : ''}
            </h2>
            ${help ? `<p class="question-help">${help}</p>` : ''}
            <div class="question-input">
    `;
    
    switch (question.type) {
        case 'nps':
            questionHTML += renderNPSQuestion(question, currentAnswer);
            break;
        case 'likert':
            questionHTML += renderLikertQuestion(question, currentAnswer);
            break;
        case 'text':
            questionHTML += renderTextQuestion(question, currentAnswer);
            break;
        case 'textarea':
            questionHTML += renderTextareaQuestion(question, currentAnswer);
            break;
        case 'radio':
            questionHTML += renderRadioQuestion(question, currentAnswer);
            break;
        case 'select':
            questionHTML += renderSelectQuestion(question, currentAnswer);
            break;
        default:
            questionHTML += '<p>Tipo de pergunta não suportado</p>';
    }
    
    questionHTML += `
            </div>
        </div>
    `;
    
    return questionHTML;
}

/**
 * Renderizadores específicos por tipo de pergunta
 */
function renderNPSQuestion(question, currentAnswer) {
    let html = '<div class="nps-scale">';
    
    for (let i = 0; i <= 10; i++) {
        const isSelected = currentAnswer === i;
        html += `
            <button class="nps-button ${isSelected ? 'selected' : ''}" 
                    data-score="${i}" 
                    onclick="selectNPS(${i})"
                    type="button">
                ${i}
            </button>
        `;
    }
    
    html += '</div>';
    html += `
        <div class="nps-labels">
            <span class="nps-label-left">${t('notRecommend')}</span>
            <span class="nps-label-right">${t('definitelyRecommend')}</span>
        </div>
    `;
    
    return html;
}

function renderLikertQuestion(question, currentAnswer) {
    let html = '<div class="likert-scale">';
    
    for (let i = 1; i <= 5; i++) {
        const isSelected = currentAnswer === i;
        html += `
            <button class="likert-button ${isSelected ? 'selected' : ''}" 
                    data-score="${i}" 
                    onclick="selectLikert(${i})"
                    type="button">
                ${i}
            </button>
        `;
    }
    
    html += '</div>';
    html += `
        <div class="likert-labels">
            <span>1 - Muito ruim</span>
            <span>5 - Excelente</span>
        </div>
    `;
    
    return html;
}

function renderTextQuestion(question, currentAnswer) {
    return `
        <input type="text" 
               class="text-input" 
               value="${currentAnswer || ''}" 
               onchange="updateTextAnswer('${question.id}', this.value)"
               oninput="updateTextAnswer('${question.id}', this.value)"
               placeholder="Digite sua resposta...">
    `;
}

function renderTextareaQuestion(question, currentAnswer) {
    return `
        <textarea class="textarea-input" 
                  onchange="updateTextAnswer('${question.id}', this.value)"
                  oninput="updateTextAnswer('${question.id}', this.value)"
                  placeholder="Digite sua resposta..."
                  rows="4">${currentAnswer || ''}</textarea>
    `;
}

function renderRadioQuestion(question, currentAnswer) {
    if (!question.options || question.options.length === 0) {
        return '<p>Nenhuma opção configurada</p>';
    }
    
    let html = '<div class="radio-options">';
    
    question.options.forEach((option, index) => {
        const optionValue = typeof option === 'string' ? option : option[state.ui.lang] || option.pt || option;
        const isSelected = currentAnswer === optionValue;
        
        html += `
            <label class="radio-option ${isSelected ? 'selected' : ''}">
                <input type="radio" 
                       name="question_${question.id}" 
                       value="${optionValue}" 
                       ${isSelected ? 'checked' : ''}
                       onchange="updateRadioAnswer('${question.id}', this.value)">
                <span class="radio-label">${optionValue}</span>
            </label>
        `;
    });
    
    html += '</div>';
    return html;
}

function renderSelectQuestion(question, currentAnswer) {
    if (!question.options || question.options.length === 0) {
        return '<p>Nenhuma opção configurada</p>';
    }
    
    let html = `<select class="select-input" onchange="updateSelectAnswer('${question.id}', this.value)">`;
    html += '<option value="">Selecione uma opção...</option>';
    
    question.options.forEach(option => {
        const optionValue = typeof option === 'string' ? option : option[state.ui.lang] || option.pt || option;
        const isSelected = currentAnswer === optionValue;
        
        html += `<option value="${optionValue}" ${isSelected ? 'selected' : ''}>${optionValue}</option>`;
    });
    
    html += '</select>';
    return html;
}

/**
 * Funções de seleção de respostas
 */
function selectNPS(score) {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    // Remove seleção anterior
    document.querySelectorAll('.nps-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Adiciona seleção atual
    const selectedBtn = document.querySelector(`[data-score="${score}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Salva resposta
    quizState.answers[currentQuestion.id] = score;
    updateNextButton();
    queueAutoSave();
}

function selectLikert(score) {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    // Remove seleção anterior
    document.querySelectorAll('.likert-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Adiciona seleção atual
    const selectedBtn = document.querySelector(`[data-score="${score}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Salva resposta
    quizState.answers[currentQuestion.id] = score;
    updateNextButton();
    queueAutoSave();
}

function updateTextAnswer(questionId, value) {
    quizState.answers[questionId] = value.trim();
    updateNextButton();
    queueAutoSave();
}

function updateRadioAnswer(questionId, value) {
    quizState.answers[questionId] = value;
    
    // Atualiza visual
    document.querySelectorAll(`input[name="question_${questionId}"]`).forEach(input => {
        const label = input.closest('.radio-option');
        if (input.checked) {
            label.classList.add('selected');
        } else {
            label.classList.remove('selected');
        }
    });
    
    updateNextButton();
    queueAutoSave();
}

function updateSelectAnswer(questionId, value) {
    quizState.answers[questionId] = value;
    updateNextButton();
    queueAutoSave();
}

/**
 * Navegação do quiz
 */
function nextQuestion() {
    if (!isCurrentQuestionAnswered()) return;
    
    if (quizState.currentQuestion < quizState.visibleQuestions.length - 1) {
        quizState.currentQuestion++;
        renderQuiz();
    } else {
        finishQuiz();
    }
}

function previousQuestion() {
    if (quizState.currentQuestion > 0) {
        quizState.currentQuestion--;
        renderQuiz();
    }
}

function finishQuiz() {
    // Salva resposta final
    saveResponse();
    
    // Marca token como usado se necessário
    if (quizState.token && quizState.survey.requireToken) {
        quizState.survey.tokens[quizState.token].used = true;
        quizState.survey.tokens[quizState.token].usedAt = new Date().toISOString();
    }
    
    // Marca dispositivo como respondido se não usar tokens
    if (!quizState.survey.requireToken) {
        if (!quizState.survey.answeredDevices) {
            quizState.survey.answeredDevices = {};
        }
        quizState.survey.answeredDevices[quizState.deviceId] = true;
    }
    
    saveState();
    
    // Remove rascunho
    clearDraft();
    
    // Redireciona para página de agradecimento
    window.location.hash = `/thank-you/${quizState.surveyId}`;
}

/**
 * Funções auxiliares
 */
function getCurrentQuestion() {
    return quizState.visibleQuestions[quizState.currentQuestion];
}

function isCurrentQuestionAnswered() {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return false;
    
    const isRequired = isQuestionRequired(currentQuestion);
    const answer = quizState.answers[currentQuestion.id];
    
    if (!isRequired) return true;
    
    return answer !== undefined && answer !== null && answer !== '';
}

function isQuestionRequired(question) {
    // Verifica se foi tornado obrigatório por regra condicional
    if (quizState.dynamicRequired[question.id]) return true;
    
    // Verifica se está escondido por regra
    if (quizState.hiddenByRule[question.id]) return false;
    
    return question.required === true;
}

function updateNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.disabled = !isCurrentQuestionAnswered();
    }
}

/**
 * Sistema de regras condicionais
 */
function applyConditionalRules() {
    // Reset das regras dinâmicas
    quizState.dynamicRequired = {};
    quizState.hiddenByRule = {};
    
    const rules = quizState.survey.rules || [];
    
    rules.forEach(rule => {
        if (!rule.when || !rule.when.qid) return;
        
        const conditionMet = evaluateCondition(rule.when);
        
        if (conditionMet && rule.then) {
            rule.then.forEach(action => {
                if (!action.target) return;
                
                switch (action.action) {
                    case 'show':
                        // Remove da lista de escondidos
                        delete quizState.hiddenByRule[action.target];
                        break;
                    case 'hide':
                        quizState.hiddenByRule[action.target] = true;
                        break;
                    case 'makeReq':
                        quizState.dynamicRequired[action.target] = true;
                        break;
                }
            });
        }
    });
    
    // Atualiza lista de perguntas visíveis
    updateVisibleQuestions();
}

function evaluateCondition(condition) {
    const answer = quizState.answers[condition.qid];
    const value = condition.value;
    
    switch (condition.op) {
        case 'equals':
            return answer == value;
        case 'notEquals':
            return answer != value;
        case 'contains':
            if (Array.isArray(answer)) {
                return answer.includes(value);
            }
            return String(answer || '').toLowerCase().includes(String(value || '').toLowerCase());
        case 'greater':
            return Number(answer) > Number(value);
        case 'less':
            return Number(answer) < Number(value);
        default:
            return false;
    }
}

function updateVisibleQuestions() {
    quizState.visibleQuestions = quizState.survey.questions.filter(q => {
        return q.visible !== false && !quizState.hiddenByRule[q.id];
    });
}

/**
 * Sistema de auto-salvamento (rascunho)
 */
function startAutoSave() {
    // Auto-salva a cada 2 segundos
    autoSaveTimer = setInterval(() => {
        saveDraft();
    }, 2000);
}

function queueAutoSave() {
    // Salva imediatamente quando há mudança
    saveDraft();
    
    // Mostra indicador visual
    const indicator = document.getElementById('autoSaveIndicator');
    if (indicator) {
        indicator.style.opacity = '1';
        setTimeout(() => {
            indicator.style.opacity = '0.6';
        }, 1000);
    }
}

function saveDraft() {
    const draftScope = quizState.survey.requireToken ? (quizState.token || 'notoken') : quizState.deviceId;
    const draftKey = DRAFT_KEY(quizState.surveyId, draftScope);
    
    const draftData = {
        timestamp: Date.now(),
        answers: quizState.answers,
        currentQuestion: quizState.currentQuestion,
        language: state.ui.lang
    };
    
    try {
        localStorage.setItem(draftKey, JSON.stringify(draftData));
    } catch (e) {
        console.warn('Erro ao salvar rascunho:', e);
    }
}

function loadDraft() {
    const draftScope = quizState.survey.requireToken ? (quizState.token || 'notoken') : quizState.deviceId;
    const draftKey = DRAFT_KEY(quizState.surveyId, draftScope);
    
    try {
        const draftData = localStorage.getItem(draftKey);
        if (draftData) {
            const draft = JSON.parse(draftData);
            
            // Carrega respostas salvas
            quizState.answers = draft.answers || {};
            
            // Carrega posição se não for muito antiga (24h)
            const age = Date.now() - draft.timestamp;
            if (age < 24 * 60 * 60 * 1000) {
                quizState.currentQuestion = draft.currentQuestion || 0;
                
                // Carrega idioma
                if (draft.language) {
                    state.ui.lang = draft.language;
                }
                
                Utils.showToast(t('draftLoaded'), 'info');
            }
        }
    } catch (e) {
        console.warn('Erro ao carregar rascunho:', e);
    }
}

function clearDraft() {
    const draftScope = quizState.survey.requireToken ? (quizState.token || 'notoken') : quizState.deviceId;
    const draftKey = DRAFT_KEY(quizState.surveyId, draftScope);
    
    try {
        localStorage.removeItem(draftKey);
    } catch (e) {
        console.warn('Erro ao limpar rascunho:', e);
    }
    
    // Para o auto-salvamento
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
}

/**
 * Salvamento da resposta final
 */
function saveResponse() {
    const response = {
        id: Utils.generateId('resp_'),
        timestamp: new Date().toISOString(),
        startTime: quizState.startTime,
        endTime: new Date().toISOString(),
        language: state.ui.lang,
        deviceId: quizState.deviceId,
        token: quizState.token,
        answers: { ...quizState.answers },
        userAgent: navigator.userAgent,
        duration: Date.now() - new Date(quizState.startTime).getTime()
    };
    
    // Adiciona resposta à pesquisa
    quizState.survey.responses.push(response);
    
    // Envia webhook se configurado
    if (quizState.survey.webhook) {
        sendWebhook(quizState.survey.webhook, response);
    }
    
    return response;
}

/**
 * Envio de webhook
 */
function sendWebhook(webhookUrl, responseData) {
    const payload = {
        survey: {
            id: quizState.survey.id,
            slug: quizState.survey.slug,
            title: quizState.survey.title
        },
        response: responseData
    };
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).catch(error => {
        console.warn('Erro ao enviar webhook:', error);
    });
}

/**
 * Mudança de idioma durante o quiz
 */
function changeQuizLanguage(lang) {
    state.ui.lang = lang;
    saveState();
    
    // Atualiza botões de idioma
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="changeQuizLanguage('${lang}')"]`).classList.add('active');
    
    // Re-renderiza a pergunta atual
    renderQuiz();
}

/**
 * Exibição de erro
 */
function showQuizError(message) {
    document.getElementById('app').innerHTML = `
        <div class="error-container">
            <div class="error-card">
                <h2>Erro</h2>
                <p>${message}</p>
                <a href="#/" class="btn btn-primary">${t('backToHome')}</a>
            </div>
        </div>
    `;
}

/**
 * Página de agradecimento
 */
function showThankYouPage(surveyId) {
    const survey = state.surveys[surveyId];
    const title = survey ? (survey.title[state.ui.lang] || survey.title.pt) : 'Pesquisa';
    
    document.getElementById('app').innerHTML = `
        <div class="thank-you-container">
            <div class="thank-you-card">
                <div class="thank-you-icon">✓</div>
                <h1>${t('thankYou')}</h1>
                <p>${t('responseRecorded')}</p>
                <p class="survey-title">${title}</p>
                <a href="#/" class="btn btn-primary">${t('backToHome')}</a>
            </div>
        </div>
    `;
}

/**
 * Inicialização do quiz via URL
 */
function showSurveyPage(slug, token = null) {
    const surveyId = state.slugs[slug];
    if (!surveyId) {
        showQuizError(t('invalidLink'));
        return;
    }
    
    initializeQuiz(surveyId, token);
}

// Suporte a navegação por teclado
document.addEventListener('keydown', (e) => {
    if (!quizState.survey) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                previousQuestion();
            }
            break;
        case 'ArrowRight':
        case 'Enter':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (isCurrentQuestionAnswered()) {
                    nextQuestion();
                }
            }
            break;
        case 'Escape':
            if (confirm('Deseja sair da pesquisa? Seu progresso será salvo.')) {
                window.location.hash = '/';
            }
            break;
    }
});

// Suporte a gestos touch para navegação
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - próxima pergunta
            if (isCurrentQuestionAnswered()) {
                nextQuestion();
            }
        } else {
            // Swipe right - pergunta anterior
            previousQuestion();
        }
    }
}

