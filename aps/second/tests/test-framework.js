/**
 * Framework de Testes Simples
 * Sistema básico para executar testes unitários e de integração
 */

class TestFramework {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            errors: []
        };
        this.currentSuite = null;
    }

    /**
     * Define uma suíte de testes
     */
    describe(suiteName, callback) {
        this.currentSuite = suiteName;
        console.group(`📋 ${suiteName}`);
        
        try {
            callback();
        } catch (error) {
            console.error(`Erro na suíte ${suiteName}:`, error);
        }
        
        console.groupEnd();
        this.currentSuite = null;
    }

    /**
     * Define um teste individual
     */
    it(testName, callback) {
        const fullName = this.currentSuite ? `${this.currentSuite} - ${testName}` : testName;
        
        try {
            callback();
            this.results.passed++;
            console.log(`✅ ${testName}`);
        } catch (error) {
            this.results.failed++;
            this.results.errors.push({
                test: fullName,
                error: error.message,
                stack: error.stack
            });
            console.error(`❌ ${testName}:`, error.message);
        }
        
        this.results.total++;
    }

    /**
     * Executa todos os testes
     */
    async run() {
        console.log('🚀 Iniciando execução dos testes...\n');
        
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            errors: []
        };

        const startTime = Date.now();
        
        // Executa todos os testes registrados
        for (const test of this.tests) {
            try {
                await test();
            } catch (error) {
                console.error('Erro ao executar teste:', error);
            }
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Mostra resultados
        this.showResults(duration);
        
        return this.results;
    }

    /**
     * Registra uma função de teste
     */
    register(testFunction) {
        this.tests.push(testFunction);
    }

    /**
     * Mostra resultados dos testes
     */
    showResults(duration) {
        console.log('\n📊 Resultados dos Testes:');
        console.log('========================');
        console.log(`Total: ${this.results.total}`);
        console.log(`✅ Passou: ${this.results.passed}`);
        console.log(`❌ Falhou: ${this.results.failed}`);
        console.log(`⏱️ Tempo: ${duration}ms`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ Erros encontrados:');
            this.results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.test}: ${error.error}`);
            });
        }
        
        const successRate = (this.results.passed / this.results.total * 100).toFixed(1);
        console.log(`\n📈 Taxa de sucesso: ${successRate}%`);
    }

    /**
     * Assertions básicas
     */
    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Esperado: ${expected}, Recebido: ${actual}`);
                }
            },
            
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Esperado: ${JSON.stringify(expected)}, Recebido: ${JSON.stringify(actual)}`);
                }
            },
            
            toBeNull: () => {
                if (actual !== null) {
                    throw new Error(`Esperado: null, Recebido: ${actual}`);
                }
            },
            
            toBeUndefined: () => {
                if (actual !== undefined) {
                    throw new Error(`Esperado: undefined, Recebido: ${actual}`);
                }
            },
            
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Esperado valor truthy, Recebido: ${actual}`);
                }
            },
            
            toBeFalsy: () => {
                if (actual) {
                    throw new Error(`Esperado valor falsy, Recebido: ${actual}`);
                }
            },
            
            toBeGreaterThan: (expected) => {
                if (actual <= expected) {
                    throw new Error(`Esperado ${actual} > ${expected}`);
                }
            },
            
            toBeLessThan: (expected) => {
                if (actual >= expected) {
                    throw new Error(`Esperado ${actual} < ${expected}`);
                }
            },
            
            toContain: (expected) => {
                if (Array.isArray(actual)) {
                    if (!actual.includes(expected)) {
                        throw new Error(`Array não contém: ${expected}`);
                    }
                } else if (typeof actual === 'string') {
                    if (!actual.includes(expected)) {
                        throw new Error(`String não contém: ${expected}`);
                    }
                } else {
                    throw new Error('toContain só funciona com arrays e strings');
                }
            },
            
            toHaveLength: (expected) => {
                if (!actual || typeof actual.length !== 'number') {
                    throw new Error('Valor não tem propriedade length');
                }
                if (actual.length !== expected) {
                    throw new Error(`Esperado length: ${expected}, Recebido: ${actual.length}`);
                }
            },
            
            toThrow: () => {
                if (typeof actual !== 'function') {
                    throw new Error('toThrow só funciona com funções');
                }
                
                let threw = false;
                try {
                    actual();
                } catch (error) {
                    threw = true;
                }
                
                if (!threw) {
                    throw new Error('Função deveria ter lançado erro');
                }
            },
            
            toBeCloseTo: (expected, precision = 2) => {
                const diff = Math.abs(actual - expected);
                const tolerance = Math.pow(10, -precision);
                
                if (diff > tolerance) {
                    throw new Error(`Esperado ${actual} próximo de ${expected} (precisão: ${precision})`);
                }
            }
        };
    }

    /**
     * Mock simples
     */
    mock(originalFunction) {
        const calls = [];
        const mockFn = (...args) => {
            calls.push(args);
            if (mockFn._implementation) {
                return mockFn._implementation(...args);
            }
        };
        
        mockFn.calls = calls;
        mockFn.mockImplementation = (fn) => {
            mockFn._implementation = fn;
            return mockFn;
        };
        mockFn.mockReturnValue = (value) => {
            mockFn._implementation = () => value;
            return mockFn;
        };
        mockFn.mockClear = () => {
            calls.length = 0;
            return mockFn;
        };
        
        return mockFn;
    }

    /**
     * Spy simples
     */
    spy(object, methodName) {
        const originalMethod = object[methodName];
        const calls = [];
        
        object[methodName] = (...args) => {
            calls.push(args);
            return originalMethod.apply(object, args);
        };
        
        object[methodName].calls = calls;
        object[methodName].restore = () => {
            object[methodName] = originalMethod;
        };
        
        return object[methodName];
    }

    /**
     * Utilitário para testes assíncronos
     */
    async waitFor(condition, timeout = 5000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            if (await condition()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error(`Timeout: condição não foi atendida em ${timeout}ms`);
    }

    /**
     * Setup e teardown
     */
    beforeEach(callback) {
        this._beforeEach = callback;
    }

    afterEach(callback) {
        this._afterEach = callback;
    }

    beforeAll(callback) {
        this._beforeAll = callback;
    }

    afterAll(callback) {
        this._afterAll = callback;
    }
}

// Instância global
const testFramework = new TestFramework();

// Exporta funções globais para facilitar uso
window.describe = testFramework.describe.bind(testFramework);
window.it = testFramework.it.bind(testFramework);
window.expect = testFramework.expect.bind(testFramework);
window.mock = testFramework.mock.bind(testFramework);
window.spy = testFramework.spy.bind(testFramework);
window.waitFor = testFramework.waitFor.bind(testFramework);

export default testFramework;

