// NPS Eventos Pro - Sistema de Relatórios

/**
 * Gera relatório completo de uma pesquisa
 */
function generateSurveyReport(surveyId) {
    const survey = state.surveys[surveyId];
    if (!survey) {
        Utils.showToast('Pesquisa não encontrada!', 'error');
        return null;
    }
    
    const responses = survey.responses;
    if (responses.length === 0) {
        Utils.showToast('Não há respostas para gerar relatório!', 'warning');
        return null;
    }
    
    const report = {
        survey: {
            id: survey.id,
            title: survey.title,
            slug: survey.slug,
            eventDate: survey.eventDate,
            status: survey.status,
            createdAt: survey.createdAt || new Date().toISOString()
        },
        summary: {
            totalResponses: responses.length,
            responseRate: calculateResponseRate(survey),
            averageCompletionTime: calculateAverageCompletionTime(responses),
            deviceBreakdown: getDeviceBreakdown(responses),
            languageBreakdown: getLanguageBreakdown(responses),
            timeBreakdown: getTimeBreakdown(responses)
        },
        npsAnalysis: calculateNPSAnalysis(survey),
        questionAnalysis: analyzeQuestions(survey),
        trends: calculateTrends(survey),
        recommendations: generateRecommendations(survey),
        generatedAt: new Date().toISOString()
    };
    
    return report;
}

/**
 * Calcula análise NPS completa
 */
function calculateNPSAnalysis(survey) {
    const npsQuestions = survey.questions.filter(q => q.type === 'nps');
    const analysis = {};
    
    npsQuestions.forEach(question => {
        const scores = survey.responses
            .map(r => r.answers[question.id])
            .filter(score => score !== undefined && score !== null)
            .map(score => parseInt(score));
        
        if (scores.length === 0) {
            analysis[question.id] = {
                score: 0,
                total: 0,
                promoters: 0,
                passives: 0,
                detractors: 0,
                distribution: Array(11).fill(0)
            };
            return;
        }
        
        const npsData = Utils.calculateNPS(scores);
        
        // Distribuição de scores
        const distribution = Array(11).fill(0);
        scores.forEach(score => {
            distribution[score]++;
        });
        
        analysis[question.id] = {
            ...npsData,
            distribution,
            averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
            medianScore: calculateMedian(scores),
            modeScore: calculateMode(scores)
        };
    });
    
    return analysis;
}

/**
 * Analisa todas as perguntas da pesquisa
 */
function analyzeQuestions(survey) {
    const analysis = {};
    
    survey.questions.forEach(question => {
        const responses = survey.responses
            .map(r => r.answers[question.id])
            .filter(answer => answer !== undefined && answer !== null);
        
        analysis[question.id] = {
            type: question.type,
            label: question.label,
            totalResponses: responses.length,
            responseRate: (responses.length / survey.responses.length) * 100,
            analysis: analyzeQuestionByType(question, responses)
        };
    });
    
    return analysis;
}

/**
 * Analisa pergunta por tipo
 */
function analyzeQuestionByType(question, responses) {
    switch (question.type) {
        case 'nps':
            return analyzeNPSQuestion(responses);
        case 'likert':
            return analyzeLikertQuestion(responses);
        case 'text':
        case 'textarea':
            return analyzeTextQuestion(responses);
        case 'radio':
            return analyzeRadioQuestion(responses);
        default:
            return { type: 'unknown' };
    }
}

/**
 * Analisa pergunta NPS
 */
function analyzeNPSQuestion(responses) {
    const scores = responses.map(r => parseInt(r)).filter(s => !isNaN(s));
    const npsData = Utils.calculateNPS(scores);
    
    return {
        type: 'nps',
        ...npsData,
        averageScore: scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0,
        distribution: calculateDistribution(scores, 0, 10)
    };
}

/**
 * Analisa pergunta Likert
 */
function analyzeLikertQuestion(responses) {
    const scores = responses.map(r => parseInt(r)).filter(s => !isNaN(s));
    
    return {
        type: 'likert',
        averageScore: scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0,
        distribution: calculateDistribution(scores, 1, 5),
        satisfaction: calculateSatisfactionLevel(scores)
    };
}

/**
 * Analisa pergunta de texto
 */
function analyzeTextQuestion(responses) {
    const texts = responses.filter(r => typeof r === 'string' && r.trim().length > 0);
    
    return {
        type: 'text',
        totalResponses: texts.length,
        averageLength: texts.length > 0 ? texts.reduce((sum, t) => sum + t.length, 0) / texts.length : 0,
        wordCount: texts.reduce((sum, t) => sum + t.split(/\s+/).length, 0),
        sentimentAnalysis: performBasicSentimentAnalysis(texts),
        commonWords: extractCommonWords(texts),
        responses: texts.slice(0, 10) // Primeiras 10 respostas para exemplo
    };
}

/**
 * Analisa pergunta de múltipla escolha
 */
function analyzeRadioQuestion(responses) {
    const options = {};
    
    responses.forEach(response => {
        if (typeof response === 'string') {
            options[response] = (options[response] || 0) + 1;
        }
    });
    
    const total = responses.length;
    const distribution = Object.entries(options).map(([option, count]) => ({
        option,
        count,
        percentage: (count / total) * 100
    })).sort((a, b) => b.count - a.count);
    
    return {
        type: 'radio',
        distribution,
        mostPopular: distribution[0]?.option || null,
        leastPopular: distribution[distribution.length - 1]?.option || null
    };
}

/**
 * Calcula taxa de resposta
 */
function calculateResponseRate(survey) {
    // Se há tokens, usa como base
    if (survey.tokens && Object.keys(survey.tokens).length > 0) {
        const totalTokens = Object.keys(survey.tokens).length;
        const usedTokens = Object.values(survey.tokens).filter(t => t.used).length;
        return (usedTokens / totalTokens) * 100;
    }
    
    // Caso contrário, retorna 100% (não há como calcular sem base)
    return 100;
}

/**
 * Calcula tempo médio de conclusão
 */
function calculateAverageCompletionTime(responses) {
    const completionTimes = responses
        .filter(r => r.startTime && r.endTime)
        .map(r => {
            const start = new Date(r.startTime);
            const end = new Date(r.endTime);
            return (end - start) / 1000; // em segundos
        });
    
    if (completionTimes.length === 0) return 0;
    
    return completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length;
}

/**
 * Obtém breakdown por dispositivo
 */
function getDeviceBreakdown(responses) {
    const devices = {};
    
    responses.forEach(response => {
        const deviceType = detectDeviceType(response.userAgent || '');
        devices[deviceType] = (devices[deviceType] || 0) + 1;
    });
    
    return devices;
}

/**
 * Detecta tipo de dispositivo pelo user agent
 */
function detectDeviceType(userAgent) {
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        if (/iPad/i.test(userAgent)) return 'Tablet';
        return 'Mobile';
    }
    return 'Desktop';
}

/**
 * Obtém breakdown por idioma
 */
function getLanguageBreakdown(responses) {
    const languages = {};
    
    responses.forEach(response => {
        const lang = response.language || 'unknown';
        languages[lang] = (languages[lang] || 0) + 1;
    });
    
    return languages;
}

/**
 * Obtém breakdown por período de tempo
 */
function getTimeBreakdown(responses) {
    const periods = {
        morning: 0,   // 6-12
        afternoon: 0, // 12-18
        evening: 0,   // 18-24
        night: 0      // 0-6
    };
    
    responses.forEach(response => {
        const hour = new Date(response.timestamp).getHours();
        
        if (hour >= 6 && hour < 12) periods.morning++;
        else if (hour >= 12 && hour < 18) periods.afternoon++;
        else if (hour >= 18 && hour < 24) periods.evening++;
        else periods.night++;
    });
    
    return periods;
}

/**
 * Calcula tendências ao longo do tempo
 */
function calculateTrends(survey) {
    const responses = survey.responses.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (responses.length < 2) {
        return { trend: 'insufficient_data' };
    }
    
    // Agrupa respostas por dia
    const dailyData = {};
    responses.forEach(response => {
        const date = response.timestamp.split('T')[0];
        if (!dailyData[date]) {
            dailyData[date] = [];
        }
        dailyData[date].push(response);
    });
    
    // Calcula NPS diário
    const dailyNPS = {};
    Object.entries(dailyData).forEach(([date, dayResponses]) => {
        const npsQuestion = survey.questions.find(q => q.type === 'nps');
        if (npsQuestion) {
            const scores = dayResponses
                .map(r => r.answers[npsQuestion.id])
                .filter(s => s !== undefined && s !== null)
                .map(s => parseInt(s));
            
            if (scores.length > 0) {
                dailyNPS[date] = Utils.calculateNPS(scores).score;
            }
        }
    });
    
    return {
        dailyResponses: Object.entries(dailyData).map(([date, responses]) => ({
            date,
            count: responses.length
        })),
        dailyNPS: Object.entries(dailyNPS).map(([date, score]) => ({
            date,
            score
        })),
        trend: calculateTrendDirection(Object.values(dailyNPS))
    };
}

/**
 * Calcula direção da tendência
 */
function calculateTrendDirection(values) {
    if (values.length < 2) return 'stable';
    
    const first = values[0];
    const last = values[values.length - 1];
    const diff = last - first;
    
    if (Math.abs(diff) < 5) return 'stable';
    return diff > 0 ? 'improving' : 'declining';
}

/**
 * Gera recomendações baseadas nos dados
 */
function generateRecommendations(survey) {
    const recommendations = [];
    const npsAnalysis = calculateNPSAnalysis(survey);
    
    // Recomendações baseadas no NPS
    Object.values(npsAnalysis).forEach(analysis => {
        if (analysis.score < 0) {
            recommendations.push({
                type: 'critical',
                title: 'NPS Crítico',
                description: 'Seu NPS está negativo. Foque em identificar e resolver os principais problemas mencionados pelos detratores.',
                priority: 'high'
            });
        } else if (analysis.score < 30) {
            recommendations.push({
                type: 'improvement',
                title: 'NPS Baixo',
                description: 'Há espaço significativo para melhoria. Analise o feedback dos passivos para convertê-los em promotores.',
                priority: 'medium'
            });
        } else if (analysis.score > 70) {
            recommendations.push({
                type: 'success',
                title: 'Excelente NPS',
                description: 'Parabéns! Seu NPS está excelente. Continue mantendo a qualidade e use os promotores como embaixadores.',
                priority: 'low'
            });
        }
    });
    
    // Recomendações baseadas na taxa de resposta
    const responseRate = calculateResponseRate(survey);
    if (responseRate < 30) {
        recommendations.push({
            type: 'engagement',
            title: 'Taxa de Resposta Baixa',
            description: 'Considere simplificar o questionário, oferecer incentivos ou melhorar a comunicação sobre a importância da pesquisa.',
            priority: 'medium'
        });
    }
    
    // Recomendações baseadas no tempo de conclusão
    const avgTime = calculateAverageCompletionTime(survey.responses);
    if (avgTime > 300) { // 5 minutos
        recommendations.push({
            type: 'usability',
            title: 'Tempo de Conclusão Alto',
            description: 'O questionário pode estar muito longo. Considere reduzir o número de perguntas ou simplificar as existentes.',
            priority: 'medium'
        });
    }
    
    return recommendations;
}

/**
 * Exporta relatório para PDF
 */
function exportReportToPDF(surveyId) {
    const report = generateSurveyReport(surveyId);
    if (!report) return;
    
    // Aqui você implementaria a geração de PDF
    // Por enquanto, vamos exportar como JSON
    Utils.exportToJSON(report, `relatorio_${report.survey.slug}_${Utils.formatDate(new Date()).replace(/\//g, '-')}.json`);
    Utils.showToast('Relatório exportado com sucesso!', 'success');
}

/**
 * Gera dashboard de métricas em tempo real
 */
function generateDashboard() {
    const surveys = Object.values(state.surveys);
    const totalResponses = surveys.reduce((sum, s) => sum + s.responses.length, 0);
    
    const dashboard = {
        overview: {
            totalSurveys: surveys.length,
            activeSurveys: surveys.filter(s => s.status === 'active').length,
            totalResponses: totalResponses,
            averageNPS: calculateGlobalAverageNPS()
        },
        recentActivity: getRecentActivity(),
        topPerformingSurveys: getTopPerformingSurveys(),
        trends: getGlobalTrends(),
        alerts: getSystemAlerts()
    };
    
    return dashboard;
}

/**
 * Calcula NPS médio global
 */
function calculateGlobalAverageNPS() {
    const allNPSScores = [];
    
    Object.values(state.surveys).forEach(survey => {
        const npsQuestion = survey.questions.find(q => q.type === 'nps');
        if (npsQuestion) {
            survey.responses.forEach(response => {
                const score = response.answers[npsQuestion.id];
                if (score !== undefined && score !== null) {
                    allNPSScores.push(parseInt(score));
                }
            });
        }
    });
    
    if (allNPSScores.length === 0) return 0;
    
    return Utils.calculateNPS(allNPSScores).score;
}

/**
 * Obtém atividade recente
 */
function getRecentActivity() {
    const activities = [];
    
    Object.values(state.surveys).forEach(survey => {
        survey.responses.forEach(response => {
            activities.push({
                type: 'response',
                surveyTitle: survey.title.pt,
                timestamp: response.timestamp,
                details: `Nova resposta recebida`
            });
        });
    });
    
    return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
}

/**
 * Obtém pesquisas com melhor performance
 */
function getTopPerformingSurveys() {
    return Object.values(state.surveys)
        .filter(s => s.responses.length > 0)
        .map(survey => {
            const npsQuestion = survey.questions.find(q => q.type === 'nps');
            let npsScore = 0;
            
            if (npsQuestion) {
                const scores = survey.responses
                    .map(r => r.answers[npsQuestion.id])
                    .filter(s => s !== undefined && s !== null)
                    .map(s => parseInt(s));
                
                if (scores.length > 0) {
                    npsScore = Utils.calculateNPS(scores).score;
                }
            }
            
            return {
                id: survey.id,
                title: survey.title.pt,
                responses: survey.responses.length,
                npsScore: npsScore,
                responseRate: calculateResponseRate(survey)
            };
        })
        .sort((a, b) => b.npsScore - a.npsScore)
        .slice(0, 5);
}

/**
 * Obtém tendências globais
 */
function getGlobalTrends() {
    // Implementação simplificada
    return {
        responseGrowth: 'stable',
        npsImprovement: 'improving',
        engagementTrend: 'stable'
    };
}

/**
 * Obtém alertas do sistema
 */
function getSystemAlerts() {
    const alerts = [];
    
    Object.values(state.surveys).forEach(survey => {
        if (survey.status === 'active' && survey.responses.length === 0) {
            alerts.push({
                type: 'warning',
                message: `Pesquisa "${survey.title.pt}" está ativa mas não recebeu respostas ainda.`,
                surveyId: survey.id
            });
        }
        
        const npsAnalysis = calculateNPSAnalysis(survey);
        Object.values(npsAnalysis).forEach(analysis => {
            if (analysis.score < 0 && analysis.total > 5) {
                alerts.push({
                    type: 'critical',
                    message: `Pesquisa "${survey.title.pt}" tem NPS crítico (${analysis.score}).`,
                    surveyId: survey.id
                });
            }
        });
    });
    
    return alerts;
}

// Funções utilitárias
function calculateMedian(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function calculateMode(numbers) {
    const frequency = {};
    numbers.forEach(num => frequency[num] = (frequency[num] || 0) + 1);
    
    let maxFreq = 0;
    let mode = null;
    
    Object.entries(frequency).forEach(([num, freq]) => {
        if (freq > maxFreq) {
            maxFreq = freq;
            mode = parseInt(num);
        }
    });
    
    return mode;
}

function calculateDistribution(values, min, max) {
    const distribution = {};
    for (let i = min; i <= max; i++) {
        distribution[i] = 0;
    }
    
    values.forEach(value => {
        if (value >= min && value <= max) {
            distribution[value]++;
        }
    });
    
    return distribution;
}

function calculateSatisfactionLevel(scores) {
    if (scores.length === 0) return 'unknown';
    
    const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    
    if (average >= 4.5) return 'very_satisfied';
    if (average >= 3.5) return 'satisfied';
    if (average >= 2.5) return 'neutral';
    if (average >= 1.5) return 'dissatisfied';
    return 'very_dissatisfied';
}

function performBasicSentimentAnalysis(texts) {
    // Análise de sentimento muito básica baseada em palavras-chave
    const positiveWords = ['bom', 'ótimo', 'excelente', 'maravilhoso', 'perfeito', 'adorei', 'recomendo'];
    const negativeWords = ['ruim', 'péssimo', 'horrível', 'terrível', 'odiei', 'não recomendo', 'decepcionante'];
    
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    
    texts.forEach(text => {
        const lowerText = text.toLowerCase();
        const hasPositive = positiveWords.some(word => lowerText.includes(word));
        const hasNegative = negativeWords.some(word => lowerText.includes(word));
        
        if (hasPositive && !hasNegative) positive++;
        else if (hasNegative && !hasPositive) negative++;
        else neutral++;
    });
    
    return { positive, negative, neutral };
}

function extractCommonWords(texts) {
    const words = {};
    const stopWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'ou', 'mas', 'que', 'para', 'com', 'em', 'no', 'na', 'nos', 'nas'];
    
    texts.forEach(text => {
        const textWords = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));
        
        textWords.forEach(word => {
            words[word] = (words[word] || 0) + 1;
        });
    });
    
    return Object.entries(words)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));
}

// Exporta funções para uso global
if (typeof window !== 'undefined') {
    window.generateSurveyReport = generateSurveyReport;
    window.exportReportToPDF = exportReportToPDF;
    window.generateDashboard = generateDashboard;
    window.calculateNPSAnalysis = calculateNPSAnalysis;
}

