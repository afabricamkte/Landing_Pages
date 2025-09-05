/**
 * Executor Principal dos Testes
 * Carrega e executa todos os testes do sistema
 */

import testFramework from './test-framework.js';

// Importa todos os arquivos de teste
import './calculations.test.js';
import './validation.test.js';

class TestRunner {
    constructor() {
        this.results = null;
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Executa todos os testes
     */
    async runAll() {
        console.log('🚀 Iniciando execução completa dos testes...\n');
        
        this.startTime = Date.now();
        
        try {
            // Executa framework de testes
            this.results = await testFramework.run();
            
            this.endTime = Date.now();
            
            // Mostra resumo final
            this.showSummary();
            
            // Atualiza interface se disponível
            this.updateUI();
            
            return this.results;
            
        } catch (error) {
            console.error('❌ Erro ao executar testes:', error);
            throw error;
        }
    }

    /**
     * Mostra resumo dos resultados
     */
    showSummary() {
        const duration = this.endTime - this.startTime;
        const successRate = (this.results.passed / this.results.total * 100).toFixed(1);
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 RESUMO FINAL DOS TESTES');
        console.log('='.repeat(50));
        console.log(`⏱️  Tempo total: ${duration}ms`);
        console.log(`📈 Taxa de sucesso: ${successRate}%`);
        console.log(`✅ Testes aprovados: ${this.results.passed}`);
        console.log(`❌ Testes falharam: ${this.results.failed}`);
        console.log(`📋 Total de testes: ${this.results.total}`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 Todos os testes passaram! Sistema validado com sucesso.');
        } else {
            console.log(`\n⚠️  ${this.results.failed} teste(s) falharam. Verifique os erros acima.`);
        }
        
        console.log('='.repeat(50));
    }

    /**
     * Atualiza interface HTML se disponível
     */
    updateUI() {
        // Atualiza elementos da página de testes se existirem
        const elements = {
            'test-total': this.results.total,
            'test-passed': this.results.passed,
            'test-failed': this.results.failed,
            'test-duration': `${this.endTime - this.startTime}ms`,
            'test-success-rate': `${(this.results.passed / this.results.total * 100).toFixed(1)}%`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Atualiza status geral
        const statusElement = document.getElementById('test-status');
        if (statusElement) {
            if (this.results.failed === 0) {
                statusElement.textContent = '✅ Todos os testes passaram';
                statusElement.className = 'test-status success';
            } else {
                statusElement.textContent = `❌ ${this.results.failed} teste(s) falharam`;
                statusElement.className = 'test-status error';
            }
        }
        
        // Atualiza lista de erros
        const errorsElement = document.getElementById('test-errors');
        if (errorsElement) {
            if (this.results.errors.length > 0) {
                errorsElement.innerHTML = '<h3>Erros Encontrados:</h3>';
                const errorList = document.createElement('ul');
                
                this.results.errors.forEach(error => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <strong>${error.test}:</strong> ${error.error}
                        <details>
                            <summary>Stack Trace</summary>
                            <pre>${error.stack}</pre>
                        </details>
                    `;
                    errorList.appendChild(listItem);
                });
                
                errorsElement.appendChild(errorList);
            } else {
                errorsElement.innerHTML = '<p>✅ Nenhum erro encontrado!</p>';
            }
        }
        
        // Atualiza barra de progresso
        const progressElement = document.getElementById('test-progress');
        if (progressElement) {
            const successRate = (this.results.passed / this.results.total * 100);
            progressElement.style.width = `${successRate}%`;
            progressElement.className = `progress-bar ${successRate === 100 ? 'success' : 'partial'}`;
        }
    }

    /**
     * Executa testes específicos por categoria
     */
    async runCategory(category) {
        console.log(`🎯 Executando testes da categoria: ${category}`);
        
        // Implementação futura para executar apenas testes específicos
        // Por enquanto executa todos
        return await this.runAll();
    }

    /**
     * Gera relatório em formato JSON
     */
    generateReport() {
        if (!this.results) {
            throw new Error('Nenhum teste foi executado ainda');
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: this.endTime - this.startTime,
            summary: {
                total: this.results.total,
                passed: this.results.passed,
                failed: this.results.failed,
                successRate: (this.results.passed / this.results.total * 100).toFixed(1)
            },
            errors: this.results.errors,
            environment: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString()
            }
        };
        
        return report;
    }

    /**
     * Exporta relatório como arquivo
     */
    exportReport() {
        const report = this.generateReport();
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `test-report-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log('📄 Relatório exportado com sucesso!');
    }

    /**
     * Obtém estatísticas dos testes
     */
    getStats() {
        if (!this.results) {
            return null;
        }
        
        return {
            total: this.results.total,
            passed: this.results.passed,
            failed: this.results.failed,
            successRate: (this.results.passed / this.results.total * 100).toFixed(1),
            duration: this.endTime - this.startTime,
            hasErrors: this.results.failed > 0,
            errorCount: this.results.errors.length
        };
    }
}

// Instância global
const testRunner = new TestRunner();

// Execução automática se não estiver em modo de teste manual
if (typeof window !== 'undefined' && !window.MANUAL_TEST_MODE) {
    // Aguarda DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            testRunner.runAll();
        });
    } else {
        testRunner.runAll();
    }
}

// Exporta para uso global
window.testRunner = testRunner;

export default testRunner;

