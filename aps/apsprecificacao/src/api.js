// API para integração com Google Sheets
class GoogleSheetsAPI {
    constructor() {
        this.gapi = null;
        this.isInitialized = false;
        this.isSignedIn = false;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    // Inicialização da API
    async init() {
        try {
            Utils.log('Inicializando Google Sheets API...');
            
            // Carrega a biblioteca do Google API
            await this.loadGoogleAPI();
            
            // Inicializa o cliente
            await gapi.load('client:auth2', async () => {
                await gapi.client.init({
                    apiKey: CONFIG.GOOGLE_SHEETS.API_KEY,
                    clientId: CONFIG.GOOGLE_SHEETS.CLIENT_ID,
                    discoveryDocs: [CONFIG.GOOGLE_SHEETS.DISCOVERY_DOC],
                    scope: CONFIG.GOOGLE_SHEETS.SCOPES
                });

                this.gapi = gapi;
                this.isInitialized = true;
                
                // Verifica se já está autenticado
                const authInstance = gapi.auth2.getAuthInstance();
                this.isSignedIn = authInstance.isSignedIn.get();
                
                Utils.log('Google Sheets API inicializada', { isSignedIn: this.isSignedIn });
            });

            return true;
        } catch (error) {
            Utils.error('Erro ao inicializar Google Sheets API', error);
            throw error;
        }
    }

    // Carrega a biblioteca do Google API
    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (typeof gapi !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Autenticação
    async signIn() {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            const authInstance = this.gapi.auth2.getAuthInstance();
            await authInstance.signIn();
            this.isSignedIn = true;
            
            Utils.log('Usuário autenticado com sucesso');
            return true;
        } catch (error) {
            Utils.error('Erro na autenticação', error);
            throw error;
        }
    }

    async signOut() {
        try {
            if (this.isSignedIn) {
                const authInstance = this.gapi.auth2.getAuthInstance();
                await authInstance.signOut();
                this.isSignedIn = false;
                this.cache.clear();
                
                Utils.log('Usuário desconectado');
            }
            return true;
        } catch (error) {
            Utils.error('Erro ao desconectar', error);
            throw error;
        }
    }

    // Verificação de autenticação
    async ensureAuthenticated() {
        if (!this.isInitialized) {
            await this.init();
        }

        if (!this.isSignedIn) {
            await this.signIn();
        }
    }

    // Cache management
    getCacheKey(range, params = {}) {
        return `${range}_${JSON.stringify(params)}`;
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    // Leitura de dados
    async readRange(range, useCache = true) {
        try {
            await this.ensureAuthenticated();

            const cacheKey = this.getCacheKey(range);
            
            if (useCache) {
                const cached = this.getFromCache(cacheKey);
                if (cached) {
                    Utils.log(`Dados carregados do cache: ${range}`);
                    return cached;
                }
            }

            Utils.log(`Lendo dados do Google Sheets: ${range}`);

            const response = await this.gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID,
                range: range,
                valueRenderOption: 'UNFORMATTED_VALUE',
                dateTimeRenderOption: 'FORMATTED_STRING'
            });

            const values = response.result.values || [];
            
            if (useCache) {
                this.setCache(cacheKey, values);
            }

            Utils.log(`Dados lidos com sucesso: ${values.length} linhas`);
            return values;
        } catch (error) {
            Utils.error(`Erro ao ler dados: ${range}`, error);
            throw error;
        }
    }

    // Escrita de dados
    async writeRange(range, values, valueInputOption = 'USER_ENTERED') {
        try {
            await this.ensureAuthenticated();

            Utils.log(`Escrevendo dados no Google Sheets: ${range}`, values);

            const response = await this.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID,
                range: range,
                valueInputOption: valueInputOption,
                resource: {
                    values: values
                }
            });

            // Limpa cache relacionado
            this.clearCache(range.split('!')[0]);

            Utils.log('Dados escritos com sucesso', response.result);
            return response.result;
        } catch (error) {
            Utils.error(`Erro ao escrever dados: ${range}`, error);
            throw error;
        }
    }

    // Adição de dados
    async appendRange(range, values, valueInputOption = 'USER_ENTERED') {
        try {
            await this.ensureAuthenticated();

            Utils.log(`Adicionando dados no Google Sheets: ${range}`, values);

            const response = await this.gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID,
                range: range,
                valueInputOption: valueInputOption,
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: values
                }
            });

            // Limpa cache relacionado
            this.clearCache(range.split('!')[0]);

            Utils.log('Dados adicionados com sucesso', response.result);
            return response.result;
        } catch (error) {
            Utils.error(`Erro ao adicionar dados: ${range}`, error);
            throw error;
        }
    }

    // Limpeza de dados
    async clearRange(range) {
        try {
            await this.ensureAuthenticated();

            Utils.log(`Limpando dados no Google Sheets: ${range}`);

            const response = await this.gapi.client.sheets.spreadsheets.values.clear({
                spreadsheetId: CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID,
                range: range
            });

            // Limpa cache relacionado
            this.clearCache(range.split('!')[0]);

            Utils.log('Dados limpos com sucesso');
            return response.result;
        } catch (error) {
            Utils.error(`Erro ao limpar dados: ${range}`, error);
            throw error;
        }
    }

    // Operações em lote
    async batchUpdate(requests) {
        try {
            await this.ensureAuthenticated();

            Utils.log('Executando operações em lote', requests);

            const response = await this.gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID,
                resource: {
                    requests: requests
                }
            });

            // Limpa todo o cache
            this.cache.clear();

            Utils.log('Operações em lote executadas com sucesso');
            return response.result;
        } catch (error) {
            Utils.error('Erro nas operações em lote', error);
            throw error;
        }
    }

    // Métodos específicos para o sistema APS

    // Ingredientes
    async getIngredientes() {
        const values = await this.readRange(CONFIG.RANGES.INGREDIENTES);
        return this.parseIngredientes(values);
    }

    async saveIngrediente(ingrediente) {
        const values = this.formatIngrediente(ingrediente);
        
        if (ingrediente.isNew) {
            return await this.appendRange(CONFIG.RANGES.INGREDIENTES, [values]);
        } else {
            // Encontra a linha do ingrediente e atualiza
            const row = await this.findIngredienteRow(ingrediente.id);
            if (row) {
                const range = `${CONFIG.SHEETS.INGREDIENTES}!A${row}:L${row}`;
                return await this.writeRange(range, [values]);
            }
        }
    }

    async deleteIngrediente(id) {
        const row = await this.findIngredienteRow(id);
        if (row) {
            return await this.deleteRow(CONFIG.SHEETS.INGREDIENTES, row);
        }
    }

    // Pizzas
    async getPizzas() {
        const values = await this.readRange(CONFIG.RANGES.PIZZAS_CARDAPIO);
        return this.parsePizzas(values);
    }

    async savePizza(pizza) {
        const values = this.formatPizza(pizza);
        
        if (pizza.isNew) {
            return await this.appendRange(CONFIG.RANGES.PIZZAS_CARDAPIO, [values]);
        } else {
            const row = await this.findPizzaRow(pizza.id);
            if (row) {
                const range = `${CONFIG.SHEETS.PIZZAS_CARDAPIO}!A${row}:G${row}`;
                return await this.writeRange(range, [values]);
            }
        }
    }

    // Custos Fixos
    async getCustosFixos() {
        const values = await this.readRange(CONFIG.RANGES.CUSTOS_FIXOS);
        return this.parseCustosFixos(values);
    }

    async saveCustosFixos(custos) {
        const values = custos.map(custo => this.formatCustoFixo(custo));
        return await this.writeRange(CONFIG.RANGES.CUSTOS_FIXOS, values);
    }

    // Custos Variáveis
    async getCustosVariaveis() {
        const values = await this.readRange(CONFIG.RANGES.CUSTOS_VARIAVEIS);
        return this.parseCustosVariaveis(values);
    }

    // Impostos e Taxas
    async getImpostosTaxas() {
        const values = await this.readRange(CONFIG.RANGES.IMPOSTOS_TAXAS);
        return this.parseImpostosTaxas(values);
    }

    // Parâmetros
    async getParametros() {
        const values = await this.readRange(CONFIG.RANGES.PARAMETROS);
        return this.parseParametros(values);
    }

    // Métodos auxiliares de parsing
    parseIngredientes(values) {
        return values.map(row => ({
            id: row[0] || '',
            nome: row[1] || '',
            categoria: row[2] || '',
            unidade: row[3] || '',
            quantidade: parseFloat(row[4]) || 0,
            preco: parseFloat(row[5]) || 0,
            rendimento: parseFloat(row[6]) || 100,
            custoUnitario: parseFloat(row[7]) || 0,
            fornecedor: row[8] || '',
            dataAtualizacao: row[9] || '',
            estoqueMinimo: parseFloat(row[10]) || 0,
            historico: row[11] || ''
        }));
    }

    parsePizzas(values) {
        return values.map(row => ({
            id: row[0] || '',
            nome: row[1] || '',
            categoria: row[2] || '',
            idMassa: row[3] || '',
            idMolho: row[4] || '',
            custoRecheios: parseFloat(row[5]) || 0,
            popularidade: parseInt(row[6]) || 1
        }));
    }

    parseCustosFixos(values) {
        return values.map(row => ({
            categoria: row[0] || '',
            valor: parseFloat(row[1]) || 0,
            rateio: row[2] || 'Pizza'
        }));
    }

    parseCustosVariaveis(values) {
        return values.map(row => ({
            item: row[0] || '',
            tipo: row[1] || '',
            P: parseFloat(row[2]) || 0,
            M: parseFloat(row[3]) || 0,
            G: parseFloat(row[4]) || 0,
            GG: parseFloat(row[5]) || 0
        }));
    }

    parseImpostosTaxas(values) {
        return values.map(row => ({
            canal: row[0] || '',
            imposto: parseFloat(row[1]) || 0,
            taxaCartao: parseFloat(row[2]) || 0,
            taxaApp: parseFloat(row[3]) || 0,
            entrega: parseFloat(row[4]) || 0
        }));
    }

    parseParametros(values) {
        const params = {};
        values.forEach(row => {
            params[row[0]] = row[1];
        });
        return params;
    }

    // Métodos auxiliares de formatação
    formatIngrediente(ingrediente) {
        return [
            ingrediente.id,
            ingrediente.nome,
            ingrediente.categoria,
            ingrediente.unidade,
            ingrediente.quantidade,
            ingrediente.preco,
            ingrediente.rendimento,
            Utils.calcularCustoUnitario(
                ingrediente.preco,
                ingrediente.quantidade,
                ingrediente.rendimento,
                ingrediente.unidade
            ),
            ingrediente.fornecedor,
            new Date().toISOString().split('T')[0],
            ingrediente.estoqueMinimo || 0,
            ingrediente.historico || ''
        ];
    }

    formatPizza(pizza) {
        return [
            pizza.id,
            pizza.nome,
            pizza.categoria,
            pizza.idMassa,
            pizza.idMolho,
            pizza.custoRecheios || 0,
            pizza.popularidade || 1
        ];
    }

    formatCustoFixo(custo) {
        return [
            custo.categoria,
            custo.valor,
            custo.rateio || 'Pizza'
        ];
    }

    // Métodos auxiliares de busca
    async findIngredienteRow(id) {
        const values = await this.readRange(CONFIG.RANGES.INGREDIENTES, false);
        for (let i = 0; i < values.length; i++) {
            if (values[i][0] === id) {
                return i + 2; // +2 porque começa na linha 2 (header na linha 1)
            }
        }
        return null;
    }

    async findPizzaRow(id) {
        const values = await this.readRange(CONFIG.RANGES.PIZZAS_CARDAPIO, false);
        for (let i = 0; i < values.length; i++) {
            if (values[i][0] === id) {
                return i + 2;
            }
        }
        return null;
    }

    // Exclusão de linhas
    async deleteRow(sheetName, rowIndex) {
        const requests = [{
            deleteDimension: {
                range: {
                    sheetId: await this.getSheetId(sheetName),
                    dimension: 'ROWS',
                    startIndex: rowIndex - 1,
                    endIndex: rowIndex
                }
            }
        }];

        return await this.batchUpdate(requests);
    }

    // Obter ID da aba
    async getSheetId(sheetName) {
        // Cache dos IDs das abas
        if (!this.sheetIds) {
            const response = await this.gapi.client.sheets.spreadsheets.get({
                spreadsheetId: CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID
            });

            this.sheetIds = {};
            response.result.sheets.forEach(sheet => {
                this.sheetIds[sheet.properties.title] = sheet.properties.sheetId;
            });
        }

        return this.sheetIds[sheetName];
    }

    // Teste de conexão
    async testConnection() {
        try {
            await this.ensureAuthenticated();
            
            // Tenta ler uma célula simples
            await this.gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID,
                range: 'A1:A1'
            });

            return { success: true, message: 'Conexão estabelecida com sucesso' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Instância global da API
const sheetsAPI = new GoogleSheetsAPI();

// Exportar API
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleSheetsAPI;
}
