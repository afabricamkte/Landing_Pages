// GOOGLE SHEETS API - VERSÃO CORRIGIDA
// Corrige erro: Cannot read properties of null (reading 'auth2')

class GoogleSheetsAPI {
    constructor() {
        this.isLoaded = false;
        this.isInitialized = false;
        this.config = {
            apiKey: '',
            clientId: '',
            spreadsheetId: '',
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            scope: 'https://www.googleapis.com/auth/spreadsheets'
        };
    }

    // Carregar APIs do Google de forma segura
    async loadGoogleAPIs() {
        return new Promise((resolve, reject) => {
            // Verificar se já está carregado
            if (window.gapi && this.isLoaded) {
                resolve();
                return;
            }

            // Carregar script do Google APIs se não existir
            if (!window.gapi) {
                const script = document.createElement('script');
                script.src = 'https://apis.google.com/js/api.js';
                script.onload = () => {
                    this.loadGapiModules().then(resolve).catch(reject);
                };
                script.onerror = () => reject(new Error('Falha ao carregar Google APIs'));
                document.head.appendChild(script);
            } else {
                this.loadGapiModules().then(resolve).catch(reject);
            }
        });
    }

    // Carregar módulos específicos do GAPI
    async loadGapiModules() {
        return new Promise((resolve, reject) => {
            window.gapi.load('client:auth2', {
                callback: () => {
                    this.isLoaded = true;
                    console.log('Google APIs carregadas com sucesso');
                    resolve();
                },
                onerror: () => {
                    reject(new Error('Erro ao carregar módulos do Google API'));
                }
            });
        });
    }

    // Inicializar configuração
    async initialize(apiKey, clientId, spreadsheetId) {
        try {
            console.log('Iniciando configuração Google Sheets...');

            // Salvar configurações
            this.config.apiKey = apiKey;
            this.config.clientId = clientId;
            this.config.spreadsheetId = spreadsheetId;

            // Carregar APIs
            await this.loadGoogleAPIs();

            // Verificar se gapi.client existe
            if (!window.gapi || !window.gapi.client) {
                throw new Error('Google API client não disponível');
            }

            // Inicializar cliente
            await window.gapi.client.init({
                apiKey: this.config.apiKey,
                clientId: this.config.clientId,
                discoveryDocs: this.config.discoveryDocs,
                scope: this.config.scope
            });

            this.isInitialized = true;
            console.log('Google Sheets API inicializada!');

            // Testar conexão básica
            return await this.testConnection();

        } catch (error) {
            console.error('Erro na inicialização:', error);
            return this.handleError(error);
        }
    }

    // Testar conexão com a planilha
    async testConnection() {
        try {
            if (!this.isInitialized) {
                throw new Error('API não inicializada');
            }

            // Verificar se precisa de autenticação
            const authInstance = window.gapi.auth2.getAuthInstance();
            if (authInstance && !authInstance.isSignedIn.get()) {
                console.log('Fazendo login...');
                await authInstance.signIn();
            }

            // Testar acesso à planilha
            const response = await window.gapi.client.sheets.spreadsheets.get({
                spreadsheetId: this.config.spreadsheetId
            });

            console.log('Conexão testada com sucesso!');
            
            // Configurar estrutura se necessário
            await this.setupSpreadsheetStructure();

            return {
                success: true,
                message: 'Conexão estabelecida com sucesso!',
                spreadsheetTitle: response.result.properties.title
            };

        } catch (error) {
            console.error('Erro no teste de conexão:', error);
            return this.handleError(error);
        }
    }

    // Configurar estrutura da planilha
    async setupSpreadsheetStructure() {
        try {
            const sheets = [
                {
                    name: 'Ingredientes',
                    headers: ['ID', 'Nome', 'Categoria', 'Unidade', 'Quantidade', 'Preco', 'Rendimento', 'Fornecedor', 'EstoqueMinimo']
                },
                {
                    name: 'Receitas',
                    headers: ['ID', 'Nome', 'Categoria', 'Ingredientes', 'Modo_Preparo']
                },
                {
                    name: 'Cardapio',
                    headers: ['ID', 'Nome', 'Categoria', 'Receita_Base', 'Tamanhos', 'Preco_P', 'Preco_M', 'Preco_G', 'Preco_GG']
                },
                {
                    name: 'Custos_Fixos',
                    headers: ['ID', 'Categoria', 'Descricao', 'Valor_Mensal']
                }
            ];

            // Verificar abas existentes
            const spreadsheet = await window.gapi.client.sheets.spreadsheets.get({
                spreadsheetId: this.config.spreadsheetId
            });

            const existingSheets = spreadsheet.result.sheets.map(sheet => sheet.properties.title);

            // Criar abas que não existem
            for (const sheet of sheets) {
                if (!existingSheets.includes(sheet.name)) {
                    await this.createSheet(sheet.name, sheet.headers);
                }
            }

            console.log('Estrutura da planilha configurada!');
        } catch (error) {
            console.warn('Aviso: Não foi possível configurar estrutura completa:', error.message);
        }
    }

    // Criar nova aba na planilha
    async createSheet(sheetName, headers) {
        try {
            // Criar aba
            await window.gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.config.spreadsheetId,
                resource: {
                    requests: [{
                        addSheet: {
                            properties: { title: sheetName }
                        }
                    }]
                }
            });

            // Adicionar cabeçalhos
            await window.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.config.spreadsheetId,
                range: `${sheetName}!A1:${String.fromCharCode(64 + headers.length)}1`,
                valueInputOption: 'RAW',
                resource: { values: [headers] }
            });

            console.log(`Aba '${sheetName}' criada com sucesso!`);
        } catch (error) {
            console.warn(`Não foi possível criar aba '${sheetName}':`, error.message);
        }
    }

    // Tratar erros de forma amigável
    handleError(error) {
        let message = 'Erro desconhecido';
        let solutions = [];

        if (error.message.includes('API key')) {
            message = 'API Key inválida ou sem permissões';
            solutions = [
                'Verifique se a API Key está correta',
                'Confirme se a Google Sheets API está ativada'
            ];
        } else if (error.message.includes('Client ID') || error.message.includes('origin')) {
            message = 'Problema de autenticação OAuth - Domínio não autorizado';
            solutions = [
                'Adicione https://afabricamkte.com.br nas origens autorizadas do Google Cloud Console',
                'Verifique se o Client ID está correto'
            ];
        } else if (error.status === 404) {
            message = 'Planilha não encontrada';
            solutions = [
                'Verifique se o ID da planilha está correto',
                'Confirme se a planilha existe e está acessível'
            ];
        } else if (error.status === 403) {
            message = 'Sem permissão para acessar a planilha';
            solutions = [
                'Compartilhe a planilha publicamente (qualquer pessoa com o link pode editar)',
                'Ou adicione o email do projeto Google Cloud nas permissões'
            ];
        }

        return {
            success: false,
            message: message,
            error: error.message,
            solutions: solutions
        };
    }
}

// Instância global
window.googleSheetsAPI = new GoogleSheetsAPI();

// Função de compatibilidade com o código existente
window.testGoogleSheetsConnection = async function(apiKey, clientId, spreadsheetId) {
    try {
        const result = await window.googleSheetsAPI.initialize(apiKey, clientId, spreadsheetId);
        
        // Salvar configuração se bem-sucedida
        if (result.success) {
            localStorage.setItem('googleSheetsConfig', JSON.stringify({
                apiKey, clientId, spreadsheetId
            }));
        }
        
        return result;
    } catch (error) {
        console.error('Erro na função de teste:', error);
        return {
            success: false,
            message: 'Erro inesperado: ' + error.message,
            solutions: ['Recarregue a página e tente novamente']
        };
    }
};

console.log('Google Sheets API - Versão Corrigida carregada!');