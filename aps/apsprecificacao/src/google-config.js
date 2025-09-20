// Configuração específica para Google Sheets API
class GoogleSheetsConfig {
    constructor() {
        this.isConfigured = false;
        this.apiKey = '';
        this.clientId = '';
        this.spreadsheetId = '';
        this.loadFromStorage();
    }

    // Carrega configuração do localStorage
    loadFromStorage() {
        const stored = localStorage.getItem('aps-google-config');
        if (stored) {
            try {
                const config = JSON.parse(stored);
                this.apiKey = config.apiKey || '';
                this.clientId = config.clientId || '';
                this.spreadsheetId = config.spreadsheetId || '';
                this.isConfigured = this.validate();
            } catch (error) {
                Utils.error('Erro ao carregar configuração do Google Sheets', error);
            }
        }
    }

    // Salva configuração no localStorage
    saveToStorage() {
        const config = {
            apiKey: this.apiKey,
            clientId: this.clientId,
            spreadsheetId: this.spreadsheetId
        };
        
        try {
            localStorage.setItem('aps-google-config', JSON.stringify(config));
            return true;
        } catch (error) {
            Utils.error('Erro ao salvar configuração do Google Sheets', error);
            return false;
        }
    }

    // Valida se a configuração está completa
    validate() {
        return !!(this.apiKey && this.clientId && this.spreadsheetId);
    }

    // Atualiza configuração
    update(apiKey, clientId, spreadsheetId) {
        this.apiKey = apiKey;
        this.clientId = clientId;
        this.spreadsheetId = spreadsheetId;
        this.isConfigured = this.validate();
        
        if (this.isConfigured) {
            // Atualiza CONFIG global
            updateConfig({
                'GOOGLE_SHEETS.API_KEY': this.apiKey,
                'GOOGLE_SHEETS.CLIENT_ID': this.clientId,
                'GOOGLE_SHEETS.SPREADSHEET_ID': this.spreadsheetId
            });
            
            this.saveToStorage();
        }
        
        return this.isConfigured;
    }

    // Limpa configuração
    clear() {
        this.apiKey = '';
        this.clientId = '';
        this.spreadsheetId = '';
        this.isConfigured = false;
        localStorage.removeItem('aps-google-config');
    }

    // Mostra modal de configuração
    showConfigModal() {
        const modal = this.createConfigModal();
        document.body.appendChild(modal);
        modal.classList.add('show');
    }

    createConfigModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'googleConfigModal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>Configuração do Google Sheets</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div class="config-instructions">
                        <h4>Como configurar:</h4>
                        <ol>
                            <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
                            <li>Crie um novo projeto ou selecione um existente</li>
                            <li>Ative a API do Google Sheets</li>
                            <li>Crie credenciais (API Key e OAuth 2.0 Client ID)</li>
                            <li>Crie uma planilha no Google Sheets e copie o ID da URL</li>
                        </ol>
                    </div>
                    
                    <form id="googleConfigForm" class="form-grid">
                        <div class="form-group">
                            <label>API Key *</label>
                            <input type="text" id="configApiKey" value="${this.apiKey}" required 
                                   placeholder="AIzaSyC...">
                            <small>Chave da API do Google Sheets</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Client ID *</label>
                            <input type="text" id="configClientId" value="${this.clientId}" required 
                                   placeholder="123456789-abc...googleusercontent.com">
                            <small>ID do cliente OAuth 2.0</small>
                        </div>
                        
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label>ID da Planilha *</label>
                            <input type="text" id="configSpreadsheetId" value="${this.spreadsheetId}" required 
                                   placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms">
                            <small>ID encontrado na URL da planilha: docs.google.com/spreadsheets/d/<strong>ID_AQUI</strong>/edit</small>
                        </div>
                    </form>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                        Cancelar
                    </button>
                    <button type="button" class="btn-primary" onclick="googleConfig.saveConfig()">
                        Salvar e Testar
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    async saveConfig() {
        const apiKey = document.getElementById('configApiKey').value.trim();
        const clientId = document.getElementById('configClientId').value.trim();
        const spreadsheetId = document.getElementById('configSpreadsheetId').value.trim();

        if (!apiKey || !clientId || !spreadsheetId) {
            Components.showToast('Todos os campos são obrigatórios', 'error');
            return;
        }

        // Atualiza configuração
        const success = this.update(apiKey, clientId, spreadsheetId);
        
        if (!success) {
            Components.showToast('Erro na configuração', 'error');
            return;
        }

        // Testa conexão
        Components.showLoading('Testando conexão...');
        
        try {
            // Reinicializa a API com nova configuração
            sheetsAPI.isInitialized = false;
            sheetsAPI.isSignedIn = false;
            
            const testResult = await sheetsAPI.testConnection();
            
            if (testResult.success) {
                Components.showToast('Configuração salva e testada com sucesso!', 'success');
                document.getElementById('googleConfigModal').remove();
                
                // Recarrega a aplicação
                if (window.app) {
                    app.isDemoMode = false;
                    await app.loadData();
                    app.loadSectionData(app.currentSection);
                }
            } else {
                throw new Error(testResult.message);
            }
            
        } catch (error) {
            Utils.error('Erro no teste de conexão', error);
            Components.showToast(`Erro na conexão: ${error.message}`, 'error');
        } finally {
            Components.hideLoading();
        }
    }

    // Cria planilha modelo
    async createTemplateSpreadsheet() {
        if (!this.isConfigured) {
            Components.showToast('Configure primeiro a API do Google Sheets', 'warning');
            return;
        }

        Components.showLoading('Criando planilha modelo...');

        try {
            await sheetsAPI.ensureAuthenticated();

            // Cria nova planilha
            const response = await gapi.client.sheets.spreadsheets.create({
                resource: {
                    properties: {
                        title: 'APS - Sistema de Precificação - Modelo'
                    },
                    sheets: [
                        { properties: { title: 'INGREDIENTES' } },
                        { properties: { title: 'RECEITAS_BASE' } },
                        { properties: { title: 'PIZZAS_CARDAPIO' } },
                        { properties: { title: 'CUSTOS_FIXOS' } },
                        { properties: { title: 'CUSTOS_VARIAVEIS' } },
                        { properties: { title: 'IMPOSTOS_TAXAS' } },
                        { properties: { title: 'RECHEIOS' } },
                        { properties: { title: 'PARAMETROS' } },
                        { properties: { title: 'PRECOS_FINAIS' } },
                        { properties: { title: 'DASHBOARD' } }
                    ]
                }
            });

            const newSpreadsheetId = response.result.spreadsheetId;
            
            // Atualiza configuração com novo ID
            this.update(this.apiKey, this.clientId, newSpreadsheetId);

            // Adiciona cabeçalhos
            await this.setupSpreadsheetHeaders(newSpreadsheetId);

            // Adiciona dados de exemplo
            await this.populateExampleData(newSpreadsheetId);

            Components.showToast('Planilha modelo criada com sucesso!', 'success');
            
            // Abre a planilha
            window.open(`https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`, '_blank');

        } catch (error) {
            Utils.error('Erro ao criar planilha modelo', error);
            Components.showToast('Erro ao criar planilha modelo', 'error');
        } finally {
            Components.hideLoading();
        }
    }

    async setupSpreadsheetHeaders(spreadsheetId) {
        const requests = [];

        // Headers para INGREDIENTES
        requests.push({
            updateCells: {
                range: {
                    sheetId: 0, // INGREDIENTES
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: 12
                },
                rows: [{
                    values: [
                        { userEnteredValue: { stringValue: 'ID_Ingrediente' } },
                        { userEnteredValue: { stringValue: 'Nome' } },
                        { userEnteredValue: { stringValue: 'Categoria' } },
                        { userEnteredValue: { stringValue: 'Unidade_Compra' } },
                        { userEnteredValue: { stringValue: 'Quantidade_Compra' } },
                        { userEnteredValue: { stringValue: 'Preco_Compra' } },
                        { userEnteredValue: { stringValue: 'Rendimento_Liquido' } },
                        { userEnteredValue: { stringValue: 'Custo_Unidade_Padrao' } },
                        { userEnteredValue: { stringValue: 'Fornecedor' } },
                        { userEnteredValue: { stringValue: 'Data_Atualizacao' } },
                        { userEnteredValue: { stringValue: 'Estoque_Minimo' } },
                        { userEnteredValue: { stringValue: 'Historico_Preco' } }
                    ]
                }],
                fields: 'userEnteredValue'
            }
        });

        // Headers para CUSTOS_FIXOS
        requests.push({
            updateCells: {
                range: {
                    sheetId: 3, // CUSTOS_FIXOS
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: 3
                },
                rows: [{
                    values: [
                        { userEnteredValue: { stringValue: 'Categoria' } },
                        { userEnteredValue: { stringValue: 'Valor_Mensal' } },
                        { userEnteredValue: { stringValue: 'Rateio_Por' } }
                    ]
                }],
                fields: 'userEnteredValue'
            }
        });

        // Headers para CUSTOS_VARIAVEIS
        requests.push({
            updateCells: {
                range: {
                    sheetId: 4, // CUSTOS_VARIAVEIS
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: 6
                },
                rows: [{
                    values: [
                        { userEnteredValue: { stringValue: 'Item' } },
                        { userEnteredValue: { stringValue: 'Tipo' } },
                        { userEnteredValue: { stringValue: 'P' } },
                        { userEnteredValue: { stringValue: 'M' } },
                        { userEnteredValue: { stringValue: 'G' } },
                        { userEnteredValue: { stringValue: 'GG' } }
                    ]
                }],
                fields: 'userEnteredValue'
            }
        });

        // Headers para IMPOSTOS_TAXAS
        requests.push({
            updateCells: {
                range: {
                    sheetId: 5, // IMPOSTOS_TAXAS
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: 5
                },
                rows: [{
                    values: [
                        { userEnteredValue: { stringValue: 'Canal_Venda' } },
                        { userEnteredValue: { stringValue: 'Imposto_%' } },
                        { userEnteredValue: { stringValue: 'Taxa_Cartao_%' } },
                        { userEnteredValue: { stringValue: 'Taxa_App_%' } },
                        { userEnteredValue: { stringValue: 'Entrega' } }
                    ]
                }],
                fields: 'userEnteredValue'
            }
        });

        // Headers para PARAMETROS
        requests.push({
            updateCells: {
                range: {
                    sheetId: 7, // PARAMETROS
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: 2
                },
                rows: [{
                    values: [
                        { userEnteredValue: { stringValue: 'Parametro' } },
                        { userEnteredValue: { stringValue: 'Valor' } }
                    ]
                }],
                fields: 'userEnteredValue'
            }
        });

        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: { requests: requests }
        });
    }

    async populateExampleData(spreadsheetId) {
        // Popula dados de exemplo
        const ranges = [
            {
                range: 'INGREDIENTES!A2:L4',
                values: CONFIG.DADOS_EXEMPLO.INGREDIENTES.map(ing => [
                    ing.id, ing.nome, ing.categoria, ing.unidade,
                    ing.quantidade, ing.preco, ing.rendimento / 100,
                    `=F2/(E2*1000*G2)`, ing.fornecedor, new Date().toISOString().split('T')[0],
                    ing.estoque, ''
                ])
            },
            {
                range: 'CUSTOS_FIXOS!A2:C5',
                values: CONFIG.DADOS_EXEMPLO.CUSTOS_FIXOS.map(custo => [
                    custo.categoria, custo.valor, custo.rateio
                ])
            },
            {
                range: 'CUSTOS_VARIAVEIS!A2:F4',
                values: CONFIG.DADOS_EXEMPLO.CUSTOS_VARIAVEIS.map(custo => [
                    custo.item, custo.tipo, custo.P, custo.M, custo.G, custo.GG
                ])
            },
            {
                range: 'IMPOSTOS_TAXAS!A2:E5',
                values: CONFIG.DADOS_EXEMPLO.IMPOSTOS_TAXAS.map(imposto => [
                    imposto.canal, imposto.imposto / 100, imposto.taxa_cartao / 100,
                    imposto.taxa_app / 100, imposto.entrega
                ])
            },
            {
                range: 'PARAMETROS!A2:B3',
                values: CONFIG.DADOS_EXEMPLO.PARAMETROS.map(param => [
                    param.parametro, param.valor
                ])
            }
        ];

        for (const range of ranges) {
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: range.range,
                valueInputOption: 'USER_ENTERED',
                resource: { values: range.values }
            });
        }
    }

    // Mostra instruções de configuração
    showInstructions() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>Instruções de Configuração</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 24px;">
                    <div class="instructions-content">
                        <h4>Passo 1: Google Cloud Console</h4>
                        <ol>
                            <li>Acesse <a href="https://console.cloud.google.com/" target="_blank">console.cloud.google.com</a></li>
                            <li>Crie um novo projeto ou selecione um existente</li>
                            <li>No menu lateral, vá em "APIs e Serviços" > "Biblioteca"</li>
                            <li>Procure por "Google Sheets API" e ative</li>
                        </ol>

                        <h4>Passo 2: Criar Credenciais</h4>
                        <ol>
                            <li>Vá em "APIs e Serviços" > "Credenciais"</li>
                            <li>Clique em "Criar Credenciais" > "Chave de API"</li>
                            <li>Copie a API Key gerada</li>
                            <li>Clique em "Criar Credenciais" > "ID do cliente OAuth"</li>
                            <li>Escolha "Aplicativo da Web"</li>
                            <li>Adicione sua URL em "Origens JavaScript autorizadas"</li>
                            <li>Copie o Client ID gerado</li>
                        </ol>

                        <h4>Passo 3: Criar Planilha</h4>
                        <ol>
                            <li>Acesse <a href="https://sheets.google.com/" target="_blank">sheets.google.com</a></li>
                            <li>Crie uma nova planilha</li>
                            <li>Copie o ID da URL (parte entre /d/ e /edit)</li>
                            <li>Ou use o botão "Criar Planilha Modelo" abaixo</li>
                        </ol>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                        Fechar
                    </button>
                    <button type="button" class="btn-primary" onclick="googleConfig.showConfigModal(); this.closest('.modal').remove();">
                        Configurar Agora
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');
    }
}

// Instância global
const googleConfig = new GoogleSheetsConfig();

// Adiciona botão de configuração no header se não estiver configurado
document.addEventListener('DOMContentLoaded', () => {
    if (!googleConfig.isConfigured) {
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const configBtn = document.createElement('button');
            configBtn.className = 'btn-sync';
            configBtn.innerHTML = '<i class="fas fa-cog"></i> Configurar';
            configBtn.onclick = () => googleConfig.showConfigModal();
            headerActions.insertBefore(configBtn, headerActions.firstChild);
        }
    }
});
