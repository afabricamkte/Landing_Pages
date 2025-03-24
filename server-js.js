/**
 * Servidor Node.js para a Plataforma de Quiz SaaS
 * 
 * Este servidor gerencia os quizzes para múltiplos clientes, com capacidade para:
 * - Servir múltiplos quizzes baseados em URL específica
 * - Gerenciar múltiplos tenants (clientes)
 * - Possibilitar configuração de checkout personalizado
 * - Armazenar e recuperar dados de leads
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Para servir arquivos estáticos

// Caminho para arquivos de dados
const DATA_DIR = path.join(__dirname, 'data');
const QUIZZES_FILE = path.join(DATA_DIR, 'quizzes.json');
const TENANTS_FILE = path.join(DATA_DIR, 'tenants.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Garantir que os diretórios de dados existam
async function ensureDataDirExists() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Verificar e criar arquivos de dados se não existirem
        const files = [QUIZZES_FILE, TENANTS_FILE, LEADS_FILE, USERS_FILE];
        
        for (const file of files) {
            try {
                await fs.access(file);
            } catch (error) {
                // Arquivo não existe, criar com array vazio
                if (file === QUIZZES_FILE) {
                    // Copiar do arquivo de exemplo para não começar vazio
                    try {
                        const exampleData = await fs.readFile(path.join(__dirname, 'quizzes.json'), 'utf8');
                        await fs.writeFile(file, exampleData);
                    } catch (err) {
                        await fs.writeFile(file, '[]');
                    }
                } else {
                    await fs.writeFile(file, '[]');
                }
            }
        }
    } catch (error) {
        console.error('Erro ao configurar diretórios de dados:', error);
        throw error;
    }
}

// Funções auxiliares para manipulação de dados
async function readDataFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Erro ao ler o arquivo ${filePath}:`, error);
        return [];
    }
}

async function writeDataFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Erro ao escrever no arquivo ${filePath}:`, error);
        throw error;
    }
}

// Rotas da API

// 1. Rota principal - Renderiza a interface de quiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. Rota para admin - Renderiza o painel administrativo
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 3. Rota para recuperar todos os quizzes (com opção de filtro por tenant)
app.get('/api/quizzes', async (req, res) => {
    try {
        const quizzes = await readDataFile(QUIZZES_FILE);
        const { tenant, slug } = req.query;
        
        let filteredQuizzes = quizzes;
        
        // Filtrar por tenant se fornecido
        if (tenant) {
            filteredQuizzes = filteredQuizzes.filter(quiz => quiz.tenantId === tenant);
        }
        
        // Filtrar por slug se fornecido
        if (slug) {
            filteredQuizzes = filteredQuizzes.filter(quiz => quiz.slug === slug);
        }
        
        res.json(filteredQuizzes);
    } catch (error) {
        console.error('Erro ao buscar quizzes:', error);
        res.status(500).json({ error: 'Erro ao buscar quizzes' });
    }
});

// 4. Rota para recuperar um quiz específico por ID
app.get('/api/quizzes/:id', async (req, res) => {
    try {
        const quizzes = await readDataFile(QUIZZES_FILE);
        const quiz = quizzes.find(q => q.id === req.params.id);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz não encontrado' });
        }
        
        res.json(quiz);
    } catch (error) {
        console.error('Erro ao buscar quiz:', error);
        res.status(500).json({ error: 'Erro ao buscar quiz' });
    }
});

// 5. Rota para criar um novo quiz
app.post('/api/quizzes', async (req, res) => {
    try {
        const quizzes = await readDataFile(QUIZZES_FILE);
        const newQuiz = {
            id: uuidv4(), // Gera um ID único
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        quizzes.push(newQuiz);
        await writeDataFile(QUIZZES_FILE, quizzes);
        
        res.status(201).json(newQuiz);
    } catch (error) {
        console.error('Erro ao criar quiz:', error);
        res.status(500).json({ error: 'Erro ao criar quiz' });
    }
});

// 6. Rota para atualizar um quiz existente
app.put('/api/quizzes/:id', async (req, res) => {
    try {
        const quizzes = await readDataFile(QUIZZES_FILE);
        const index = quizzes.findIndex(q => q.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Quiz não encontrado' });
        }
        
        quizzes[index] = {
            ...quizzes[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeDataFile(QUIZZES_FILE, quizzes);
        
        res.json(quizzes[index]);
    } catch (error) {
        console.error('Erro ao atualizar quiz:', error);
        res.status(500).json({ error: 'Erro ao atualizar quiz' });
    }
});

// 7. Rota para excluir um quiz
app.delete('/api/quizzes/:id', async (req, res) => {
    try {
        const quizzes = await readDataFile(QUIZZES_FILE);
        const newQuizzes = quizzes.filter(q => q.id !== req.params.id);
        
        if (quizzes.length === newQuizzes.length) {
            return res.status(404).json({ error: 'Quiz não encontrado' });
        }
        
        await writeDataFile(QUIZZES_FILE, newQuizzes);
        
        res.json({ message: 'Quiz excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir quiz:', error);
        res.status(500).json({ error: 'Erro ao excluir quiz' });
    }
});

// 8. Rota para salvar um lead (resultado do quiz)
app.post('/api/leads', async (req, res) => {
    try {
        const leads = await readDataFile(LEADS_FILE);
        const newLead = {
            id: uuidv4(),
            ...req.body,
            capturedAt: new Date().toISOString()
        };
        
        leads.push(newLead);
        await writeDataFile(LEADS_FILE, leads);
        
        res.status(201).json(newLead);
    } catch (error) {
        console.error('Erro ao salvar lead:', error);
        res.status(500).json({ error: 'Erro ao salvar lead' });
    }
});

// 9. Rota para buscar leads (com opção de filtro por tenant ou quiz)
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await readDataFile(LEADS_FILE);
        const { tenant, quiz, startDate, endDate } = req.query;
        
        let filteredLeads = leads;
        
        // Filtrar por tenant se fornecido
        if (tenant) {
            filteredLeads = filteredLeads.filter(lead => lead.tenantId === tenant);
        }
        
        // Filtrar por quiz se fornecido
        if (quiz) {
            filteredLeads = filteredLeads.filter(lead => lead.quizId === quiz);
        }
        
        // Filtrar por data se fornecido
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            filteredLeads = filteredLeads.filter(lead => {
                const leadDate = new Date(lead.capturedAt);
                return leadDate >= start && leadDate <= end;
            });
        }
        
        res.json(filteredLeads);
    } catch (error) {
        console.error('Erro ao buscar leads:', error);
        res.status(500).json({ error: 'Erro ao buscar leads' });
    }
});

// 10. Rota para gerenciar tenants (clientes)
app.get('/api/tenants', async (req, res) => {
    try {
        const tenants = await readDataFile(TENANTS_FILE);
        res.json(tenants);
    } catch (error) {
        console.error('Erro ao buscar tenants:', error);
        res.status(500).json({ error: 'Erro ao buscar tenants' });
    }
});

app.post('/api/tenants', async (req, res) => {
    try {
        const tenants = await readDataFile(TENANTS_FILE);
        const newTenant = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        tenants.push(newTenant);
        await writeDataFile(TENANTS_FILE, tenants);
        
        res.status(201).json(newTenant);
    } catch (error) {
        console.error('Erro ao criar tenant:', error);
        res.status(500).json({ error: 'Erro ao criar tenant' });
    }
});

app.put('/api/tenants/:id', async (req, res) => {
    try {
        const tenants = await readDataFile(TENANTS_FILE);
        const index = tenants.findIndex(t => t.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Tenant não encontrado' });
        }
        
        tenants[index] = {
            ...tenants[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeDataFile(TENANTS_FILE, tenants);
        
        res.json(tenants[index]);
    } catch (error) {
        console.error('Erro ao atualizar tenant:', error);
        res.status(500).json({ error: 'Erro ao atualizar tenant' });
    }
});

app.delete('/api/tenants/:id', async (req, res) => {
    try {
        const tenants = await readDataFile(TENANTS_FILE);
        const newTenants = tenants.filter(t => t.id !== req.params.id);
        
        if (tenants.length === newTenants.length) {
            return res.status(404).json({ error: 'Tenant não encontrado' });
        }
        
        await writeDataFile(TENANTS_FILE, newTenants);
        
        res.json({ message: 'Tenant excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir tenant:', error);
        res.status(500).json({ error: 'Erro ao excluir tenant' });
    }
});

// 11. Rota para gerenciar usuários
app.get('/api/users', async (req, res) => {
    try {
        const users = await readDataFile(USERS_FILE);
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const users = await readDataFile(USERS_FILE);
        const { email } = req.body;
        
        // Verificar se já existe um usuário com este email
        if (users.some(u => u.email === email)) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        
        const newUser = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        await writeDataFile(USERS_FILE, users);
        
        // Remover a senha antes de enviar a resposta
        const { password, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// 12. Rota para autenticação
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await readDataFile(USERS_FILE);
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // Em uma aplicação real, você usaria JWT ou outro método de autenticação
        // Para simplificar, estamos apenas retornando o usuário (sem a senha)
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            user: userWithoutPassword,
            token: 'token-simulado-' + Date.now() // Token simulado
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro no processo de login' });
    }
});

// 13. Rota para estatísticas
app.get('/api/stats', async (req, res) => {
    try {
        const quizzes = await readDataFile(QUIZZES_FILE);
        const leads = await readDataFile(LEADS_FILE);
        const tenants = await readDataFile(TENANTS_FILE);
        
        const stats = {
            totalQuizzes: quizzes.length,
            totalLeads: leads.length,
            totalTenants: tenants.length,
            completionRate: leads.length > 0 ? 
                Math.round((leads.filter(l => l.completed).length / leads.length) * 100) : 0,
            
            // Estatísticas por quiz
            quizStats: quizzes.map(quiz => {
                const quizLeads = leads.filter(l => l.quizId === quiz.id);
                return {
                    id: quiz.id,
                    title: quiz.title,
                    tenantId: quiz.tenantId,
                    leadCount: quizLeads.length,
                    conversionRate: quizLeads.length > 0 ? 
                        Math.round((quizLeads.filter(l => l.converted).length / quizLeads.length) * 100) : 0
                };
            }),
            
            // Estatísticas por tenant
            tenantStats: tenants.map(tenant => {
                const tenantQuizzes = quizzes.filter(q => q.tenantId === tenant.id);
                const tenantLeads = leads.filter(l => l.tenantId === tenant.id);
                
                return {
                    id: tenant.id,
                    name: tenant.name,
                    quizCount: tenantQuizzes.length,
                    leadCount: tenantLeads.length,
                    conversionRate: tenantLeads.length > 0 ? 
                        Math.round((tenantLeads.filter(l => l.converted).length / tenantLeads.length) * 100) : 0
                };
            })
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

// Iniciar o servidor
async function startServer() {
    try {
        await ensureDataDirExists();
        
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`- Interface do Quiz: http://localhost:${PORT}`);
            console.log(`- Painel Admin: http://localhost:${PORT}/admin`);
        });
    } catch (error) {
        console.error('Falha ao iniciar o servidor:', error);
    }
}

startServer();
