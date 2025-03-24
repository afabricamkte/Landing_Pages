# Plataforma de Quiz SaaS - A FÁBRICA

Uma plataforma completa para criar e gerenciar quizzes interativos, com suporte a múltiplos clientes e URLs específicas para cada quiz.

## Características Principais

- **Múltiplos Quizzes**: Crie e gerencie diversos quizzes simultaneamente.
- **Múltiplos Tenants**: Suporte a múltiplos clientes, cada um com seus próprios quizzes e configurações.
- **URLs Específicas**: Cada quiz responde por uma URL específica, facilitando campanhas de marketing.
- **Checkout Personalizado**: Configure links de checkout diferentes para cada resultado de quiz.
- **White Label**: Interface totalmente personalizável com as cores e logotipos de cada cliente.
- **Captura de Leads**: Coleta e gestão de leads obtidos através dos quizzes.
- **Painel Administrativo**: Interface de gestão completa com estatísticas e relatórios.

## Requisitos de Sistema

- Node.js (v14 ou superior)
- NPM (v6 ou superior)

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/afabrica/quiz-platform.git
   cd quiz-platform
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente (opcional):
   - Crie um arquivo `.env` na raiz do projeto
   - Defina as variáveis desejadas (exemplo abaixo)
   ```
   PORT=3000
   DATA_DIR=./data
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```

5. Acesse a plataforma:
   - Interface de Quiz: http://localhost:3000
   - Painel Administrativo: http://localhost:3000/admin

## Estrutura de Arquivos

```
├── data/               # Diretório para armazenamento de dados
│   ├── quizzes.json    # Dados dos quizzes
│   ├── tenants.json    # Dados dos clientes
│   ├── leads.json      # Dados dos leads capturados
│   └── users.json      # Dados dos usuários da plataforma
├── public/             # Arquivos públicos
│   ├── index.html      # Interface principal do quiz
│   ├── admin.html      # Painel administrativo
│   ├── css/            # Estilos
│   └── js/             # Scripts
├── server.js           # Servidor Node.js
├── package.json        # Dependências do projeto
└── README.md           # Este arquivo
```

## Uso

### Interface de Quiz

Para acessar um quiz específico, use o formato:
```
http://localhost:3000/?quiz=SLUG_DO_QUIZ&tenant=ID_DO_TENANT
```

Onde:
- `SLUG_DO_QUIZ`: É o identificador único do quiz (ex: "vender-pdfs")
- `ID_DO_TENANT`: É o identificador do cliente (ex: "tenant1")

### Painel Administrativo

Para acessar o painel administrativo:
```
http://localhost:3000/admin
```

Login padrão inicial:
- Email: admin@afabrica.com
- Senha: admin123

**IMPORTANTE**: Altere estas credenciais após o primeiro acesso.

## Personalização

### Estilo Visual

O estilo visual de cada quiz pode ser personalizado através do painel administrativo:

1. Acesse o painel admin
2. Vá para "Quizzes" > Edite um quiz
3. Na aba "Branding", configure as cores, fontes e elementos visuais

### Configuração de Checkout

Para configurar URLs de checkout diferentes:

1. Acesse o painel admin
2. Vá para "Quizzes" > Edite um quiz
3. Na aba "Checkout", configure as URLs para cada tipo de resultado

## APIs Disponíveis

A plataforma expõe as seguintes APIs:

- `GET /api/quizzes`: Lista todos os quizzes
- `GET /api/quizzes/:id`: Obtém um quiz específico
- `POST /api/quizzes`: Cria um novo quiz
- `PUT /api/quizzes/:id`: Atualiza um quiz existente
- `DELETE /api/quizzes/:id`: Remove um quiz

- `GET /api/tenants`: Lista todos os clientes
- `POST /api/tenants`: Cria um novo cliente
- `PUT /api/tenants/:id`: Atualiza um cliente
- `DELETE /api/tenants/:id`: Remove um cliente

- `GET /api/leads`: Lista todos os leads (com opções de filtro)
- `POST /api/leads`: Salva um novo lead

- `POST /api/auth/login`: Autenticação de usuários

## Suporte

Para dúvidas ou problemas, entre em contato:
- Email: suporte@afabrica.com
- Telefone: (xx) xxxx-xxxx

## Licença

Este projeto é licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
