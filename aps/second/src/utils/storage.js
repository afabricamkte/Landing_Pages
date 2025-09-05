/**
 * Módulo de Gerenciamento de Storage
 * Centraliza todas as operações de localStorage com validação e backup
 */

import { STORAGE_KEYS, APP_VERSION, EVENTOS } from './constants.js';

class StorageManager {
    constructor() {
        this.isAvailable = this.checkStorageAvailability();
        this.eventTarget = new EventTarget();
    }

    /**
     * Verifica se o localStorage está disponível
     */
    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage não está disponível:', e);
            return false;
        }
    }

    /**
     * Salva dados no localStorage com validação
     */
    save(key, data) {
        if (!this.isAvailable) {
            console.warn('Storage não disponível');
            return false;
        }

        try {
            const dataToSave = {
                data,
                timestamp: new Date().toISOString(),
                version: APP_VERSION
            };

            localStorage.setItem(key, JSON.stringify(dataToSave));
            
            // Dispara evento de dados salvos
            this.eventTarget.dispatchEvent(new CustomEvent(EVENTOS.DADOS_SALVOS, {
                detail: { key, data }
            }));

            return true;
        } catch (error) {
            console.error('Erro ao salvar no storage:', error);
            this.eventTarget.dispatchEvent(new CustomEvent(EVENTOS.ERRO_OCORRIDO, {
                detail: { error, operation: 'save', key }
            }));
            return false;
        }
    }

    /**
     * Carrega dados do localStorage com validação
     */
    load(key, defaultValue = null) {
        if (!this.isAvailable) {
            return defaultValue;
        }

        try {
            const stored = localStorage.getItem(key);
            if (!stored) {
                return defaultValue;
            }

            const parsed = JSON.parse(stored);
            
            // Verifica se tem a estrutura esperada
            if (parsed && typeof parsed === 'object' && parsed.data !== undefined) {
                // Dispara evento de dados carregados
                this.eventTarget.dispatchEvent(new CustomEvent(EVENTOS.DADOS_CARREGADOS, {
                    detail: { key, data: parsed.data }
                }));
                
                return parsed.data;
            }

            // Dados antigos sem estrutura - migra automaticamente
            this.save(key, parsed);
            return parsed;

        } catch (error) {
            console.error('Erro ao carregar do storage:', error);
            this.eventTarget.dispatchEvent(new CustomEvent(EVENTOS.ERRO_OCORRIDO, {
                detail: { error, operation: 'load', key }
            }));
            return defaultValue;
        }
    }

    /**
     * Remove dados do localStorage
     */
    remove(key) {
        if (!this.isAvailable) {
            return false;
        }

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover do storage:', error);
            return false;
        }
    }

    /**
     * Limpa todos os dados do sistema
     */
    clear() {
        if (!this.isAvailable) {
            return false;
        }

        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Erro ao limpar storage:', error);
            return false;
        }
    }

    /**
     * Cria backup completo dos dados
     */
    createBackup() {
        const backup = {
            version: APP_VERSION,
            timestamp: new Date().toISOString(),
            data: {}
        };

        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            const data = this.load(key);
            if (data !== null) {
                backup.data[name] = data;
            }
        });

        return backup;
    }

    /**
     * Restaura dados de um backup
     */
    restoreBackup(backup) {
        if (!backup || !backup.data) {
            throw new Error('Backup inválido');
        }

        try {
            Object.entries(backup.data).forEach(([name, data]) => {
                const key = STORAGE_KEYS[name];
                if (key) {
                    this.save(key, data);
                }
            });

            // Salva timestamp do backup
            this.save(STORAGE_KEYS.BACKUP_TIMESTAMP, backup.timestamp);
            
            return true;
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            throw error;
        }
    }

    /**
     * Exporta dados para download
     */
    exportData() {
        const backup = this.createBackup();
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pizzaria-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Importa dados de arquivo
     */
    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    this.restoreBackup(backup);
                    resolve(backup);
                } catch (error) {
                    reject(new Error('Arquivo de backup inválido'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Erro ao ler arquivo'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Obtém informações sobre o storage
     */
    getStorageInfo() {
        if (!this.isAvailable) {
            return null;
        }

        let totalSize = 0;
        const items = {};

        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            const data = localStorage.getItem(key);
            if (data) {
                const size = new Blob([data]).size;
                totalSize += size;
                items[name] = {
                    key,
                    size,
                    sizeFormatted: this.formatBytes(size)
                };
            }
        });

        return {
            totalSize,
            totalSizeFormatted: this.formatBytes(totalSize),
            items,
            available: this.isAvailable,
            lastBackup: this.load(STORAGE_KEYS.BACKUP_TIMESTAMP)
        };
    }

    /**
     * Formata bytes em formato legível
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Adiciona listener para eventos de storage
     */
    addEventListener(event, callback) {
        this.eventTarget.addEventListener(event, callback);
    }

    /**
     * Remove listener de eventos
     */
    removeEventListener(event, callback) {
        this.eventTarget.removeEventListener(event, callback);
    }

    /**
     * Migra dados antigos para nova estrutura
     */
    migrateOldData() {
        // Verifica se existe dados no formato antigo
        const oldDataKey = 'pizzaria_dados_pro_completo';
        const oldData = localStorage.getItem(oldDataKey);
        
        if (oldData) {
            try {
                const parsed = JSON.parse(oldData);
                
                // Mapeia dados antigos para nova estrutura
                const migrations = {
                    ingredientes: STORAGE_KEYS.INGREDIENTES,
                    pizzas: STORAGE_KEYS.RECEITAS,
                    estoque: STORAGE_KEYS.ESTOQUE,
                    historicoPrecos: STORAGE_KEYS.HISTORICO_PRECOS,
                    entradasEstoque: STORAGE_KEYS.ENTRADAS_ESTOQUE,
                    vendas: STORAGE_KEYS.VENDAS,
                    produtosExtras: STORAGE_KEYS.PRODUTOS_EXTRAS,
                    custosOperacionais: STORAGE_KEYS.CUSTOS_OPERACIONAIS,
                    precosDirecto: STORAGE_KEYS.PRECOS_DIRETO,
                    precosIfood: STORAGE_KEYS.PRECOS_IFOOD,
                    resultadosDiarios: STORAGE_KEYS.RESULTADOS_DIARIOS,
                    historico: STORAGE_KEYS.HISTORICO
                };

                Object.entries(migrations).forEach(([oldKey, newKey]) => {
                    if (parsed[oldKey]) {
                        this.save(newKey, parsed[oldKey]);
                    }
                });

                // Remove dados antigos
                localStorage.removeItem(oldDataKey);
                
                console.log('Migração de dados concluída com sucesso');
                return true;
            } catch (error) {
                console.error('Erro na migração de dados:', error);
                return false;
            }
        }
        
        return false;
    }

    /**
     * Valida integridade dos dados
     */
    validateData() {
        const errors = [];
        
        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            try {
                const data = this.load(key);
                if (data !== null) {
                    // Validações específicas por tipo de dado
                    switch (name) {
                        case 'INGREDIENTES':
                            if (!Array.isArray(data)) {
                                errors.push(`${name}: deve ser um array`);
                            }
                            break;
                        case 'RECEITAS':
                            if (!Array.isArray(data)) {
                                errors.push(`${name}: deve ser um array`);
                            }
                            break;
                        case 'ESTOQUE':
                            if (typeof data !== 'object') {
                                errors.push(`${name}: deve ser um objeto`);
                            }
                            break;
                    }
                }
            } catch (error) {
                errors.push(`${name}: erro ao validar - ${error.message}`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Compacta dados removendo entradas antigas
     */
    compactData() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 365); // 1 ano atrás

        // Compacta histórico
        const historico = this.load(STORAGE_KEYS.HISTORICO, []);
        const historicoCompactado = historico.filter(item => {
            const itemDate = new Date(item.timestamp);
            return itemDate > cutoffDate;
        });
        
        if (historicoCompactado.length !== historico.length) {
            this.save(STORAGE_KEYS.HISTORICO, historicoCompactado);
            console.log(`Histórico compactado: ${historico.length - historicoCompactado.length} itens removidos`);
        }

        // Compacta vendas antigas
        const vendas = this.load(STORAGE_KEYS.VENDAS, []);
        const vendasCompactadas = vendas.filter(venda => {
            const vendaDate = new Date(venda.data);
            return vendaDate > cutoffDate;
        });
        
        if (vendasCompactadas.length !== vendas.length) {
            this.save(STORAGE_KEYS.VENDAS, vendasCompactadas);
            console.log(`Vendas compactadas: ${vendas.length - vendasCompactadas.length} itens removidos`);
        }
    }
}

// Instância singleton
const storage = new StorageManager();

// Executa migração na inicialização
storage.migrateOldData();

export default storage;

