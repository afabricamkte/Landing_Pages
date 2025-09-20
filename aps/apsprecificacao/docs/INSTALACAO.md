# 🚀 Guia de Instalação - APS Sistema de Precificação

## 📋 Pré-requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conta Google (para Google Sheets)
- Servidor web local ou hospedagem web

## 📁 Estrutura dos Arquivos

```
aps-sistema-precificacao/
├── index.html              # Página principal
├── test.html               # Página de testes
├── src/                    # Código fonte
│   ├── styles.css          # Estilos CSS
│   ├── config.js           # Configurações do sistema
│   ├── google-config.js    # Configuração Google Sheets
│   ├── api.js              # API Google Sheets
│   ├── utils.js            # Funções utilitárias
│   ├── components.js       # Componentes da interface
│   └── app.js              # Aplicação principal
├── docs/                   # Documentação
├── screenshots/            # Capturas de tela
└── README.md               # Documentação principal
```

## 🛠️ Instalação Passo a Passo

### 1. Clonar Repositório
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/aps-sistema-precificacao.git

# Navegar para o diretório
cd aps-sistema-precificacao
```

### 2. Configurar Servidor Web

#### Opção A: Servidor Python (Recomendado para testes)
```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# Acessar: http://localhost:8080
```

#### Opção B: Servidor Node.js
```bash
# Instalar dependências
npm install

# Executar servidor
npm start
# ou
npm run serve

# Acessar: http://localhost:8080
```

#### Opção C: GitHub Pages
```bash
# Fazer deploy automático
npm run deploy

# Acessar: https://seu-usuario.github.io/aps-sistema-precificacao
```

### 3. Configurar Google Sheets API

#### 3.1 Google Cloud Console
1. Acesse [console.cloud.google.com](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Ative a **Google Sheets API**:
   - Menu lateral > "APIs e Serviços" > "Biblioteca"
   - Procure "Google Sheets API" e ative

#### 3.2 Criar Credenciais
1. Vá em "APIs e Serviços" > "Credenciais"
2. **API Key**:
   - Clique "Criar Credenciais" > "Chave de API"
   - Copie a chave gerada
3. **OAuth Client ID**:
   - Clique "Criar Credenciais" > "ID do cliente OAuth"
   - Escolha "Aplicativo da Web"
   - Adicione sua URL em "Origens JavaScript autorizadas"
   - Exemplo: `http://localhost:8080` ou `https://seu-usuario.github.io`
   - Copie o Client ID gerado

#### 3.3 Configurar Planilha
1. Acesse [sheets.google.com](https://sheets.google.com/)
2. Crie uma nova planilha
3. Copie o ID da URL (entre `/d/` e `/edit`)
4. Ou use o botão "Criar Planilha Modelo" no sistema

### 4. Configurar Sistema

1. **Abra o sistema** no navegador
2. **Clique em "Configurar"** no cabeçalho
3. **Insira as credenciais**:
   - API Key (obtida no passo 3.2)
   - Client ID (obtido no passo 3.2)
   - ID da Planilha (obtido no passo 3.3)
4. **Teste a conexão**
5. **Crie planilha modelo** (opcional)

## 🧪 Verificar Instalação

### Teste Rápido
1. Acesse `http://localhost:8080/test.html`
2. Clique em "Executar Todos os Testes"
3. Verifique se todos os testes passaram

### Teste Completo
1. Acesse `http://localhost:8080`
2. Configure as credenciais do Google Sheets
3. Navegue pelas seções do menu lateral
4. Teste adicionar um ingrediente
5. Verifique os cálculos no dashboard

## 🔧 Configurações Avançadas

### Personalizar Categorias
Edite `src/config.js`:
```javascript
CATEGORIAS: {
    INGREDIENTES: ['Queijos', 'Carnes', 'Vegetais', 'Molhos', 'Massas', 'Temperos']
}
```

### Personalizar Canais de Venda
```javascript
CANAIS: ['Balcão', 'Delivery', 'iFood', '99Food', 'Rappi', 'Uber Eats']
```

### Personalizar Tamanhos
```javascript
TAMANHOS: ['P', 'M', 'G', 'GG']
```

## 🚨 Solução de Problemas

### Erro de CORS
- Use servidor web (não abra arquivo diretamente)
- Configure origens no Google Cloud Console

### Erro de Autenticação
- Verifique credenciais no Google Cloud Console
- Confirme se a API está ativada
- Verifique origens autorizadas

### Dados não Carregam
- Verifique conexão com internet
- Teste credenciais nas configurações
- Verifique permissões da planilha

### Interface não Responsiva
- Limpe cache do navegador
- Verifique se todos os arquivos foram carregados
- Teste em navegador diferente

## 📱 Uso Mobile

O sistema é responsivo e funciona em dispositivos móveis:
- **Smartphone**: Funcionalidades essenciais
- **Tablet**: Interface adaptada
- **Desktop**: Experiência completa

## 🔒 Segurança

- Dados ficam no seu Google Sheets
- Credenciais armazenadas localmente
- Sem servidor próprio necessário
- Autenticação OAuth 2.0

## 📞 Suporte

Para problemas técnicos:
1. Verifique este guia de instalação
2. Teste com dados de demonstração
3. Valide configurações do Google Sheets
4. Consulte o README.md para documentação completa
5. Abra uma [issue no GitHub](https://github.com/seu-usuario/aps-sistema-precificacao/issues)

## 🎯 Próximos Passos

Após instalação bem-sucedida:
1. **Configure dados básicos** (ingredientes, custos)
2. **Monte receitas** de massa e molho
3. **Crie cardápio** de pizzas
4. **Ajuste margens** por canal de venda
5. **Monitore dashboard** regularmente

---

**APS - Sistema de Precificação v1.0**  
*Gestão inteligente para pizzarias modernas*
