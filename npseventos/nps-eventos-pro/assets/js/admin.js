// NPS Eventos Pro - Funções Administrativas Complementares

/**
 * Funções auxiliares para o editor de pesquisas
 */

function updateQuestionType(surveyId, questionId, newType) {
    const survey = state.surveys[surveyId];
    const question = survey.questions.find(q => q.id === questionId);
    if (!question) return;
    
    question.type = newType;
    
    // Remove opções se não for tipo que precisa
    if (!['radio', 'select', 'multiselect'].includes(newType)) {
        delete question.options;
    }
    
    saveState();
    
    // Recarrega a aba de perguntas
    document.getElementById('tab-questions').innerHTML = renderQuestionsTab(survey);
}

function moveQuestion(surveyId, currentIndex, direction) {
    const survey = state.surveys[surveyId];
    const newIndex = currentIndex + direction;
    
    if (newIndex < 0 || newIndex >= survey.questions.length) return;
    
    // Troca as posições
    const temp = survey.questions[currentIndex];
    survey.questions[currentIndex] = survey.questions[newIndex];
    survey.questions[newIndex] = temp;
    
    saveState();
    
    // Recarrega a aba de perguntas
    document.getElementById('tab-questions').innerHTML = renderQuestionsTab(survey);
}

function updateRuleCondition(surveyId, ruleIndex, field, value) {
    const survey = state.surveys[surveyId];
    if (!survey.rules || !survey.rules[ruleIndex]) return;
    
    const rule = survey.rules[ruleIndex];
    if (!rule.when) rule.when = {};
    
    rule.when[field] = value;
    saveState();
}

function updateRuleAction(surveyId, ruleIndex, actionIndex, field, value) {
    const survey = state.surveys[surveyId];
    if (!survey.rules || !survey.rules[ruleIndex]) return;
    
    const rule = survey.rules[ruleIndex];
    if (!rule.then || !rule.then[actionIndex]) return;
    
    rule.then[actionIndex][field] = value;
    saveState();
}

function addRuleAction(surveyId, ruleIndex) {
    const survey = state.surveys[surveyId];
    if (!survey.rules || !survey.rules[ruleIndex]) return;
    
    const rule = survey.rules[ruleIndex];
    if (!rule.then) rule.then = [];
    
    rule.then.push({ action: 'show', target: '' });
    saveState();
    
    // Recarrega a aba de regras
    document.getElementById('tab-rules').innerHTML = renderRulesTab(survey);
}

function deleteRuleAction(surveyId, ruleIndex, actionIndex) {
    const survey = state.surveys[surveyId];
    if (!survey.rules || !survey.rules[ruleIndex]) return;
    
    const rule = survey.rules[ruleIndex];
    if (!rule.then || !rule.then[actionIndex]) return;
    
    rule.then.splice(actionIndex, 1);
    saveState();
    
    // Recarrega a aba de regras
    document.getElementById('tab-rules').innerHTML = renderRulesTab(survey);
}

function saveSurvey(surveyId) {
    // A pesquisa já é salva automaticamente em cada mudança
    Utils.showToast('Pesquisa salva com sucesso!', 'success');
}

function previewSurvey(slug) {
    window.open(`#/s/${slug}`, '_blank');
}

/**
 * Funções auxiliares para renderização
 */
function optsQuestions(survey, selectedId = '') {
    return survey.questions.map(q => {
        const label = q.label?.pt || q.id;
        const selected = q.id === selectedId ? 'selected' : '';
        return `<option value="${q.id}" ${selected}>${label}</option>`;
    }).join('');
}

/**
 * Validação de formulários
 */
function validateSurvey(survey) {
    const errors = [];
    
    // Valida título
    if (!survey.title?.pt?.trim()) {
        errors.push('Título em português é obrigatório');
    }
    
    // Valida perguntas
    if (!survey.questions || survey.questions.length === 0) {
        errors.push('Pelo menos uma pergunta é obrigatória');
    }
    
    // Valida perguntas individuais
    survey.questions.forEach((q, index) => {
        if (!q.label?.pt?.trim()) {
            errors.push(`Pergunta ${index + 1}: Texto em português é obrigatório`);
        }
        
        if (['radio', 'select'].includes(q.type) && (!q.options || q.options.length === 0)) {
            errors.push(`Pergunta ${index + 1}: Opções são obrigatórias para este tipo de pergunta`);
        }
    });
    
    // Valida regras condicionais
    if (survey.rules) {
        survey.rules.forEach((rule, index) => {
            if (!rule.when?.qid) {
                errors.push(`Regra ${index + 1}: Pergunta de condição é obrigatória`);
            }
            
            if (!rule.then || rule.then.length === 0) {
                errors.push(`Regra ${index + 1}: Pelo menos uma ação é obrigatória`);
            }
        });
    }
    
    return errors;
}

/**
 * Importação e exportação de pesquisas
 */
function exportSurvey(surveyId) {
    const survey = state.surveys[surveyId];
    if (!survey) return;
    
    const exportData = {
        version: '2.0',
        survey: { ...survey },
        exportedAt: new Date().toISOString()
    };
    
    // Remove dados sensíveis
    delete exportData.survey.responses;
    delete exportData.survey.tokens;
    delete exportData.survey.answeredDevices;
    
    const content = JSON.stringify(exportData, null, 2);
    const filename = `${survey.slug}_export.json`;
    
    downloadFile(content, filename, 'application/json');
    Utils.showToast('Pesquisa exportada com sucesso!', 'success');
}

function importSurvey() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (!importData.survey) {
                    throw new Error('Formato de arquivo inválido');
                }
                
                const survey = importData.survey;
                
                // Gera novos IDs
                const newSurveyId = Utils.generateId('srv_');
                const newSlug = Utils.generateId('survey_');
                
                survey.id = newSurveyId;
                survey.slug = newSlug;
                survey.title.pt += ' (Importada)';
                survey.responses = [];
                survey.tokens = {};
                survey.answeredDevices = {};
                
                // Gera novos IDs para perguntas
                survey.questions.forEach(q => {
                    q.id = Utils.generateId('q_');
                });
                
                state.surveys[newSurveyId] = survey;
                state.slugs[newSlug] = newSurveyId;
                saveState();
                
                Utils.showToast('Pesquisa importada com sucesso!', 'success');
                showSurveyList();
                
            } catch (error) {
                Utils.showToast('Erro ao importar pesquisa: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

/**
 * Clonagem de pesquisas
 */
function cloneSurvey(surveyId) {
    const originalSurvey = state.surveys[surveyId];
    if (!originalSurvey) return;
    
    const newSurveyId = Utils.generateId('srv_');
    const newSlug = Utils.generateId('survey_');
    
    const clonedSurvey = JSON.parse(JSON.stringify(originalSurvey));
    
    clonedSurvey.id = newSurveyId;
    clonedSurvey.slug = newSlug;
    clonedSurvey.title.pt += ' (Clone)';
    clonedSurvey.title.en += ' (Clone)';
    clonedSurvey.title.es += ' (Clon)';
    clonedSurvey.status = 'draft';
    clonedSurvey.responses = [];
    clonedSurvey.tokens = {};
    clonedSurvey.answeredDevices = {};
    
    // Gera novos IDs para perguntas
    clonedSurvey.questions.forEach(q => {
        q.id = Utils.generateId('q_');
    });
    
    state.surveys[newSurveyId] = clonedSurvey;
    state.slugs[newSlug] = newSurveyId;
    saveState();
    
    Utils.showToast('Pesquisa clonada com sucesso!', 'success');
    window.location.hash = `/admin?edit=${newSurveyId}`;
}

/**
 * Estatísticas da pesquisa
 */
function getSurveyStats(surveyId) {
    const survey = state.surveys[surveyId];
    if (!survey) return null;
    
    const responses = survey.responses || [];
    const totalResponses = responses.length;
    
    if (totalResponses === 0) {
        return {
            totalResponses: 0,
            npsScore: null,
            completionRate: 0,
            averageDuration: 0
        };
    }
    
    // Calcula NPS
    const npsScores = responses
        .map(r => r.answers?.q1)
        .filter(score => score !== undefined && score !== null);
    
    let npsScore = null;
    if (npsScores.length > 0) {
        const promoters = npsScores.filter(score => score >= 9).length;
        const detractors = npsScores.filter(score => score <= 6).length;
        npsScore = Math.round(((promoters - detractors) / npsScores.length) * 100);
    }
    
    // Calcula duração média
    const durations = responses
        .map(r => r.duration)
        .filter(d => d && d > 0);
    
    const averageDuration = durations.length > 0 
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 1000)
        : 0;
    
    // Taxa de conclusão (assumindo que respostas completas têm todas as perguntas obrigatórias respondidas)
    const requiredQuestions = survey.questions.filter(q => q.required).length;
    const completeResponses = responses.filter(r => {
        const answeredRequired = survey.questions
            .filter(q => q.required)
            .filter(q => r.answers[q.id] !== undefined && r.answers[q.id] !== null && r.answers[q.id] !== '')
            .length;
        return answeredRequired === requiredQuestions;
    }).length;
    
    const completionRate = totalResponses > 0 ? Math.round((completeResponses / totalResponses) * 100) : 0;
    
    return {
        totalResponses,
        npsScore,
        completionRate,
        averageDuration
    };
}

/**
 * Backup e restauração
 */
function backupAllData() {
    const backupData = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        data: { ...state }
    };
    
    const content = JSON.stringify(backupData, null, 2);
    const filename = `nps_eventos_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    downloadFile(content, filename, 'application/json');
    Utils.showToast('Backup criado com sucesso!', 'success');
}

function restoreFromBackup() {
    if (!confirm('Isso irá substituir todos os dados atuais. Tem certeza?')) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);
                
                if (!backupData.data) {
                    throw new Error('Formato de backup inválido');
                }
                
                state = backupData.data;
                saveState();
                
                Utils.showToast('Backup restaurado com sucesso!', 'success');
                window.location.reload();
                
            } catch (error) {
                Utils.showToast('Erro ao restaurar backup: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

