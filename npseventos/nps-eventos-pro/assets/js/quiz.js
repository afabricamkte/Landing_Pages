// NPS Eventos Pro - Sistema de Quiz

/**
 * Estado do quiz atual
 */
let quizState = {
    currentQuestion: 0,
    answers: {},
    surveyId: null,
    startTime: null,
    deviceId: null
};

/**
 * Inicializa o quiz
 */
function initializeQuiz(surveyId) {
    quizState = {
        currentQuestion: 0,
        answers: {},
        surveyId: surveyId,
        startTime: new Date().toISOString(),
        deviceId: generateDeviceId()
    };
    
    // Salva estado do quiz no sessionStorage
    sessionStorage.setItem('quizState', JSON.stringify(quizState));
}

/**
 * Gera um ID único para o dispositivo
 */
function generateDeviceId() {
    let deviceId = localStorage.getItem('npsDeviceId');
    if (!deviceId) {
        deviceId = Utils.generateId('device_');
        localStorage.setItem('npsDeviceId', deviceId);
    }
    return deviceId;
}

/**
 * Seleciona uma resposta NPS (0-10)
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
    sessionStorage.setItem('quizState', JSON.stringify(quizState));
    
    // Habilita botão próximo
    const nextBtn = document.querySelector('.quiz-navigation .btn-primary');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

/**
 * Seleciona uma resposta Likert (1-5)
 */
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
    sessionStorage.setItem('quizState', JSON.stringify(quizState));
    
    // Habilita botão próximo
    const nextBtn = document.querySelector('.quiz-navigation .btn-primary');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

/**
 * Seleciona uma opção de múltipla escolha
 */
function selectRadio(value) {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    // Atualiza visual
    document.querySelectorAll('.radio-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`input[value="${value}"]`).closest('.radio-option');
    if (selectedOption) {
        selectedOption.classList.add('selected');
        selectedOption.querySelector('input').checked = true;
    }
    
    // Salva resposta
    quizState.answers[currentQuestion.id] = value;
    sessionStorage.setItem('quizState', JSON.stringify(quizState));
    
    // Habilita botão próximo
    const nextBtn = document.querySelector('.quiz-navigation .btn-primary');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

/**
 * Obtém a pergunta atual
 */
function getCurrentQuestion() {
    const survey = state.surveys[quizState.surveyId];
    if (!survey) return null;
    
    return survey.questions[quizState.currentQuestion];
}

/**
 * Obtém a pesquisa atual
 */
function getCurrentSurvey() {
    return state.surveys[quizState.surveyId];
}

/**
 * Vai para a próxima pergunta
 */
function nextQuestion() {
    const survey = getCurrentSurvey();
    const currentQuestion = getCurrentQuestion();
    
    if (!survey || !currentQuestion) return;
    
    // Valida resposta obrigatória
    if (currentQuestion.required && !quizState.answers[currentQuestion.id]) {
        Utils.showToast('Esta pergunta é obrigatória!', 'warning');
        return;
    }
    
    // Captura resposta de texto se necessário
    if (currentQuestion.type === 'text') {
        const textInput = document.getElementById('textInput');
        if (textInput) {
            const value = textInput.value.trim();
            if (currentQuestion.required && !value) {
                Utils.showToast('Esta pergunta é obrigatória!', 'warning');
                textInput.focus();
                return;
            }
            quizState.answers[currentQuestion.id] = value;
        }
    } else if (currentQuestion.type === 'textarea') {
        const textareaInput = document.getElementById('textareaInput');
        if (textareaInput) {
            const value = textareaInput.value.trim();
            if (currentQuestion.required && !value) {
                Utils.showToast('Esta pergunta é obrigatória!', 'warning');
                textareaInput.focus();
                return;
            }
            quizState.answers[currentQuestion.id] = value;
        }
    }
    
    // Verifica se é a última pergunta
    if (quizState.currentQuestion >= survey.questions.length - 1) {
        finishQuiz();
        return;
    }
    
    // Vai para próxima pergunta
    quizState.currentQuestion++;
    sessionStorage.setItem('quizState', JSON.stringify(quizState));
    
    // Re-renderiza o quiz
    router();
}

/**
 * Volta para a pergunta anterior
 */
function previousQuestion() {
    if (quizState.currentQuestion <= 0) return;
    
    quizState.currentQuestion--;
    sessionStorage.setItem('quizState', JSON.stringify(quizState));
    
    // Re-renderiza o quiz
    router();
}

/**
 * Finaliza o quiz
 */
function finishQuiz() {
    const survey = getCurrentSurvey();
    if (!survey) return;
    
    // Verifica se o dispositivo já respondeu (se configurado)
    if (survey.answeredDevices && survey.answeredDevices[quizState.deviceId]) {
        showThankYouPage('Você já respondeu esta pesquisa anteriormente.');
        return;
    }
    
    // Cria resposta
    const response = {
        id: Utils.generateId('response_'),
        timestamp: new Date().toISOString(),
        startTime: quizState.startTime,
        endTime: new Date().toISOString(),
        device: quizState.deviceId,
        answers: { ...quizState.answers },
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    // Adiciona resposta à pesquisa
    survey.responses.push(response);
    
    // Marca dispositivo como respondido
    if (!survey.answeredDevices) {
        survey.answeredDevices = {};
    }
    survey.answeredDevices[quizState.deviceId] = {
        timestamp: response.timestamp,
        responseId: response.id
    };
    
    // Salva estado
    saveState();
    
    // Envia webhook se configurado
    if (survey.webhook) {
        sendWebhook(survey.webhook, response, survey);
    }
    
    // Limpa estado do quiz
    sessionStorage.removeItem('quizState');
    quizState = {
        currentQuestion: 0,
        answers: {},
        surveyId: null,
        startTime: null,
        deviceId: null
    };
    
    // Mostra página de agradecimento
    showThankYouPage();
}

/**
 * Mostra página de agradecimento
 */
function showThankYouPage(customMessage = null) {
    const app = document.getElementById('app');
    const survey = getCurrentSurvey();
    
    app.innerHTML = `
        <div class="container">
            <div class="quiz-container">
                <div class="question-card text-center">
                    <div style="font-size: 4rem; margin-bottom: 1rem; color: #22c55e;">✓</div>
                    <h2>${t('thankYou')}</h2>
                    <p class="muted">
                        ${customMessage || t('responseRecorded')}
                    </p>
                    ${survey ? `
                        <div style="margin-top: 2rem; padding: 1rem; background: rgba(99, 102, 241, 0.1); border-radius: 8px;">
                            <h3 style="color: #6366f1; margin-bottom: 0.5rem;">${survey.title[state.ui.lang]}</h3>
                            <p style="color: #6b7280; font-size: 0.875rem;">
                                ${Utils.formatDate(survey.eventDate)}
                            </p>
                        </div>
                    ` : ''}
                    <a href="#/" class="btn btn-primary" style="margin-top: 2rem;">
                        ${t('backToHome')}
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Envia webhook com os dados da resposta
 */
async function sendWebhook(webhookUrl, response, survey) {
    try {
        const payload = {
            survey: {
                id: survey.id,
                title: survey.title,
                slug: survey.slug,
                eventDate: survey.eventDate
            },
            response: response,
            timestamp: new Date().toISOString()
        };
        
        await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('Webhook enviado com sucesso');
    } catch (error) {
        console.error('Erro ao enviar webhook:', error);
    }
}

/**
 * Valida token se necessário
 */
function validateToken(surveyId, token) {
    const survey = state.surveys[surveyId];
    if (!survey) return false;
    
    // Se não requer token, permite acesso
    if (!survey.requireToken) return true;
    
    // Se requer token mas não foi fornecido
    if (!token) return false;
    
    // Verifica se token existe e não foi usado
    const tokenData = survey.tokens[token];
    if (!tokenData || tokenData.used) return false;
    
    return true;
}

/**
 * Marca token como usado
 */
function useToken(surveyId, token) {
    const survey = state.surveys[surveyId];
    if (!survey || !token) return;
    
    if (survey.tokens[token]) {
        survey.tokens[token].used = true;
        survey.tokens[token].usedAt = new Date().toISOString();
        saveState();
    }
}

/**
 * Recupera estado do quiz do sessionStorage
 */
function restoreQuizState() {
    try {
        const saved = sessionStorage.getItem('quizState');
        if (saved) {
            const parsedState = JSON.parse(saved);
            quizState = { ...quizState, ...parsedState };
            return true;
        }
    } catch (error) {
        console.error('Erro ao recuperar estado do quiz:', error);
    }
    return false;
}

/**
 * Limpa estado do quiz
 */
function clearQuizState() {
    sessionStorage.removeItem('quizState');
    quizState = {
        currentQuestion: 0,
        answers: {},
        surveyId: null,
        startTime: null,
        deviceId: null
    };
}

/**
 * Calcula tempo gasto no quiz
 */
function getQuizDuration() {
    if (!quizState.startTime) return 0;
    
    const start = new Date(quizState.startTime);
    const end = new Date();
    return Math.round((end - start) / 1000); // em segundos
}

/**
 * Obtém progresso do quiz
 */
function getQuizProgress() {
    const survey = getCurrentSurvey();
    if (!survey) return 0;
    
    return Math.round(((quizState.currentQuestion + 1) / survey.questions.length) * 100);
}

/**
 * Verifica se pode pular pergunta
 */
function canSkipQuestion() {
    const currentQuestion = getCurrentQuestion();
    return currentQuestion && !currentQuestion.required;
}

/**
 * Pula pergunta atual (se permitido)
 */
function skipQuestion() {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || currentQuestion.required) return;
    
    // Remove resposta se existir
    delete quizState.answers[currentQuestion.id];
    sessionStorage.setItem('quizState', JSON.stringify(quizState));
    
    // Vai para próxima pergunta
    nextQuestion();
}

/**
 * Obtém estatísticas do quiz atual
 */
function getQuizStats() {
    const survey = getCurrentSurvey();
    if (!survey) return null;
    
    const totalQuestions = survey.questions.length;
    const answeredQuestions = Object.keys(quizState.answers).length;
    const progress = getQuizProgress();
    const duration = getQuizDuration();
    
    return {
        totalQuestions,
        answeredQuestions,
        currentQuestion: quizState.currentQuestion + 1,
        progress,
        duration,
        isComplete: quizState.currentQuestion >= totalQuestions - 1
    };
}

/**
 * Adiciona eventos de teclado para navegação
 */
function addKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Só funciona se estiver no quiz
        if (!window.location.hash.includes('/s/')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                previousQuestion();
                break;
            case 'ArrowRight':
            case 'Enter':
                e.preventDefault();
                nextQuestion();
                break;
            case 'Escape':
                e.preventDefault();
                if (confirm('Deseja sair do quiz? Suas respostas serão perdidas.')) {
                    clearQuizState();
                    window.location.hash = '/';
                }
                break;
        }
    });
}

/**
 * Adiciona suporte a gestos touch para mobile
 */
function addTouchNavigation() {
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        if (!window.location.hash.includes('/s/')) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Só processa se o movimento horizontal for maior que o vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left - próxima pergunta
                nextQuestion();
            } else {
                // Swipe right - pergunta anterior
                previousQuestion();
            }
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    addKeyboardNavigation();
    addTouchNavigation();
});

// Exporta funções para uso global
if (typeof window !== 'undefined') {
    window.quizState = quizState;
    window.initializeQuiz = initializeQuiz;
    window.selectNPS = selectNPS;
    window.selectLikert = selectLikert;
    window.selectRadio = selectRadio;
    window.nextQuestion = nextQuestion;
    window.previousQuestion = previousQuestion;
    window.finishQuiz = finishQuiz;
    window.skipQuestion = skipQuestion;
    window.clearQuizState = clearQuizState;
    window.restoreQuizState = restoreQuizState;
    window.getQuizStats = getQuizStats;
}

