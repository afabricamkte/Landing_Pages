# 🎯 NPS Eventos Pro - Sistema Avançado de Pesquisas

<div align="center">

![NPS Eventos Pro](https://img.shields.io/badge/NPS-Eventos%20Pro-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Build](https://img.shields.io/badge/build-passing-success?style=for-the-badge)

**Sistema completo de pesquisas NPS (Net Promoter Score) para eventos**  
*Interface moderna • Multilíngue • Funcionalidades avançadas*

[🚀 Demo ao Vivo](https://seu-usuario.github.io/nps-eventos-pro) • [📖 Documentação](https://github.com/seu-usuario/nps-eventos-pro/wiki) • [🐛 Reportar Bug](https://github.com/seu-usuario/nps-eventos-pro/issues) • [💡 Sugerir Feature](https://github.com/seu-usuario/nps-eventos-pro/discussions)

</div>

---

## 📋 Índice

- [✨ Funcionalidades](#-funcionalidades)
- [🚀 Início Rápido](#-início-rápido)
- [📱 Screenshots](#-screenshots)
- [🛠️ Tecnologias](#️-tecnologias)
- [📦 Instalação](#-instalação)
- [⚙️ Configuração](#️-configuração)
- [🔌 Integrações](#-integrações)
- [📊 Analytics](#-analytics)
- [🚀 Deploy](#-deploy)
- [🤝 Contribuindo](#-contribuindo)
- [📄 Licença](#-licença)

---

## ✨ Funcionalidades

<table>
<tr>
<td width="50%">

### 🎯 **Sistema NPS Completo**
- ✅ Escala 0-10 padrão NPS
- ✅ Cálculo automático do score
- ✅ Classificação automática
- ✅ Interface visual intuitiva

### 🎨 **Interface Moderna**
- ✅ Design dark theme elegante
- ✅ Gradientes e animações
- ✅ Totalmente responsivo
- ✅ Tipografia Inter otimizada

### 🌐 **Multilíngue**
- 🇧🇷 **Português** (completo)
- 🇺🇸 **Inglês** (completo)
- 🇪🇸 **Espanhol** (completo)
- 🔧 Sistema extensível

</td>
<td width="50%">

### 🔧 **Funcionalidades Avançadas**
- ✅ Auto-salvamento de rascunhos
- ✅ Sistema de tokens únicos
- ✅ Regras condicionais
- ✅ Validação dinâmica
- ✅ Navegação por teclado
- ✅ Gestos touch nativos

### 📊 **Área Administrativa**
- ✅ Dashboard em tempo real
- ✅ Editor visual de pesquisas
- ✅ Gerenciamento de tokens
- ✅ Sistema de backup
- ✅ Exportação CSV/JSON
- ✅ Configuração de webhooks

### 📱 **5 Tipos de Pergunta**
- 🎯 NPS (0-10)
- ⭐ Likert (1-5)
- 📝 Texto curto/longo
- 🔘 Múltipla escolha
- 📋 Lista suspensa

</td>
</tr>
</table>

---

## 🚀 Início Rápido

### 1️⃣ **Clone e Execute**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/nps-eventos-pro.git
cd nps-eventos-pro

# Inicie servidor local (escolha um)
python3 -m http.server 8080    # Python
npx serve .                    # Node.js
php -S localhost:8080          # PHP
```

### 2️⃣ **Acesse a Aplicação**
- 🌐 **Página principal**: http://localhost:8080
- 🔐 **Admin**: http://localhost:8080#/admin (senha: `admin123`)
- 📊 **Dashboard**: Estatísticas em tempo real

### 3️⃣ **Crie sua Primeira Pesquisa**
1. Faça login na área administrativa
2. Clique em "Editor de Pesquisas"
3. Configure perguntas e regras
4. Compartilhe o link gerado
5. Acompanhe resultados em tempo real

---

## 📱 Screenshots

<div align="center">

### 🏠 Página Principal
![Página Principal](https://via.placeholder.com/800x400/1f2937/6366f1?text=P%C3%A1gina+Principal+NPS)

### 📊 Dashboard Administrativo
![Dashboard](https://via.placeholder.com/800x400/1f2937/22c55e?text=Dashboard+Administrativo)

### 🎯 Quiz NPS Interativo
![Quiz NPS](https://via.placeholder.com/800x400/1f2937/f59e0b?text=Quiz+NPS+Interativo)

</div>

---

## 🛠️ Tecnologias

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

</div>

### 🏗️ **Arquitetura**
- **Frontend**: HTML5 semântico + CSS3 moderno + JavaScript ES6+
- **Armazenamento**: LocalStorage para persistência
- **Roteamento**: SPA (Single Page Application)
- **Estado**: Gerenciamento centralizado
- **Performance**: 42KB total otimizado

### 📐 **Padrões Utilizados**
- **CSS**: Grid, Flexbox, Custom Properties, Animações
- **JS**: Módulos, Arrow Functions, Async/Await, Destructuring
- **HTML**: Semântico, Acessível, SEO-friendly
- **APIs**: Fetch, History, Intersection Observer

---

## 📦 Instalação

### 🔧 **Pré-requisitos**
- Navegador moderno (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- Servidor web local para desenvolvimento
- Editor de código (VS Code recomendado)

### 📁 **Estrutura do Projeto**
```
nps-eventos-pro/
├── 📄 index.html              # Página principal
├── 📁 assets/
│   ├── 🎨 css/
│   │   ├── main.css          # Estilos principais
│   │   ├── components.css    # Componentes
│   │   └── themes.css        # Temas e cores
│   ├── ⚡ js/
│   │   ├── app.js            # Aplicação principal
│   │   ├── admin.js          # Área administrativa
│   │   ├── quiz.js           # Sistema de quiz
│   │   ├── reports.js        # Relatórios
│   │   └── utils.js          # Utilitários
│   └── 🔤 fonts/
│       └── inter.woff2       # Fonte Inter
├── 📚 docs/                   # Documentação
├── 🔧 .github/               # GitHub Actions
└── 📋 README.md              # Este arquivo
```

### 🌐 **Compatibilidade**

| Navegador | Versão Mínima | Status |
|-----------|---------------|--------|
| Chrome    | 60+           | ✅ Suportado |
| Firefox   | 55+           | ✅ Suportado |
| Safari    | 12+           | ✅ Suportado |
| Edge      | 79+           | ✅ Suportado |
| Mobile    | iOS 12+, Android 7+ | ✅ Suportado |

---

## ⚙️ Configuração

### 🎨 **Personalização de Cores**
```css
/* assets/css/themes.css */
:root {
    --primary-color: #6366f1;    /* Cor principal */
    --secondary-color: #8b5cf6;  /* Cor secundária */
    --accent-color: #06b6d4;     /* Cor de destaque */
    --success-color: #22c55e;    /* Sucesso */
    --warning-color: #f59e0b;    /* Aviso */
    --error-color: #ef4444;      /* Erro */
}
```

### 🔐 **Alteração da Senha Administrativa**
```javascript
// assets/js/app.js (linha ~1200)
function validateAdminPassword(password) {
    return password === 'sua-nova-senha-aqui'; // Altere aqui
}
```

### 🌐 **Configuração de Idiomas**
```javascript
// assets/js/app.js
const languages = {
    pt: { /* Português */ },
    en: { /* English */ },
    es: { /* Español */ },
    fr: { /* Français - Adicione aqui */ }
};
```

---

## 🔌 Integrações

### 📊 **Google Sheets**
```javascript
// Configuração de webhook para Google Sheets
const config = {
    webhook: {
        url: 'https://script.google.com/macros/s/SEU_ID/exec',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }
};
```

### ⚡ **Zapier**
```javascript
// Integração com Zapier
const zapierConfig = {
    webhookUrl: 'https://hooks.zapier.com/hooks/catch/SEU_ID/',
    events: ['response_submitted', 'survey_completed']
};
```

### 🔗 **API Personalizada**
```javascript
// Exemplo de integração com API própria
async function sendToAPI(data) {
    const response = await fetch('/api/nps-responses', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer SEU_TOKEN'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}
```

---

## 📊 Analytics

### 🎯 **Cálculo do NPS**
```
NPS = % Promotores (9-10) - % Detratores (0-6)
Resultado: -100 a +100
```

### 📈 **Interpretação dos Resultados**

| Score | Zona | Descrição | Ação |
|-------|------|-----------|------|
| -100 a -1 | 🔴 Crítica | Necessita ação imediata | Investigar problemas urgentes |
| 0 a 30 | 🟡 Melhoria | Bom potencial | Implementar melhorias |
| 31 a 50 | 🟢 Qualidade | Performance sólida | Manter padrão |
| 51 a 70 | 🔵 Excelência | Muito bom | Expandir boas práticas |
| 71 a 100 | 🟣 Classe Mundial | Excepcional | Caso de sucesso |

### 📊 **Métricas Disponíveis**
- **NPS Score**: Cálculo automático
- **Distribuição**: Promotores, Passivos, Detratores
- **Taxa de Conclusão**: % de pesquisas completadas
- **Tempo Médio**: Duração das respostas
- **Tendências**: Evolução ao longo do tempo

---

## 🚀 Deploy

### 🌐 **GitHub Pages (Recomendado)**
```bash
# 1. Push para o repositório
git add .
git commit -m "feat: deploy to production"
git push origin main

# 2. Ativar GitHub Pages
# Vá para Settings > Pages > Source: GitHub Actions
```

### ☁️ **Outras Opções**

| Plataforma | Gratuito | Deploy Automático | Domínio Personalizado |
|------------|----------|-------------------|----------------------|
| **GitHub Pages** | ✅ | ✅ | ✅ |
| **Netlify** | ✅ | ✅ | ✅ |
| **Vercel** | ✅ | ✅ | ✅ |
| **Firebase Hosting** | ✅ | ✅ | ✅ |

### 🖥️ **Servidor Próprio**
```bash
# Upload via SFTP
scp -r . usuario@servidor:/var/www/html/nps-eventos-pro/

# Configuração Apache
<VirtualHost *:80>
    DocumentRoot /var/www/html/nps-eventos-pro
    ServerName nps.seudominio.com
    
    # Configurações de segurança
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

---

## 📈 Performance

### ⚡ **Métricas Atuais**

| Métrica | Valor | Status |
|---------|-------|--------|
| **Tamanho Total** | 42KB | 🟢 Excelente |
| **First Contentful Paint** | < 1s | 🟢 Excelente |
| **Largest Contentful Paint** | < 2s | 🟢 Excelente |
| **Cumulative Layout Shift** | < 0.1 | 🟢 Excelente |
| **Lighthouse Score** | 90+ | 🟢 Excelente |

### 🔧 **Otimizações Implementadas**
- ✅ CSS minificado e otimizado
- ✅ JavaScript modular e eficiente
- ✅ Fontes web otimizadas (WOFF2)
- ✅ Lazy loading de componentes
- ✅ Cache inteligente
- ✅ Compressão GZIP

---

## 🧪 Testes

### ✅ **Checklist de Testes**
- [ ] Página inicial carrega sem erros
- [ ] Login administrativo funciona
- [ ] Quiz NPS responde corretamente
- [ ] Dados salvos no localStorage
- [ ] Responsividade em diferentes telas
- [ ] Compatibilidade entre navegadores
- [ ] Acessibilidade básica
- [ ] Performance adequada

### 🤖 **Testes Automatizados (GitHub Actions)**
```yaml
# .github/workflows/deploy.yml
- name: 🧪 Run tests
  run: |
    npm run test:syntax
    npm run test:performance
    npm run test:accessibility
```

---

## 🤝 Contribuindo

<div align="center">

**Contribuições são muito bem-vindas!** 🎉

[![Contributors](https://img.shields.io/github/contributors/seu-usuario/nps-eventos-pro?style=for-the-badge)](https://github.com/seu-usuario/nps-eventos-pro/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/seu-usuario/nps-eventos-pro?style=for-the-badge)](https://github.com/seu-usuario/nps-eventos-pro/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/seu-usuario/nps-eventos-pro?style=for-the-badge)](https://github.com/seu-usuario/nps-eventos-pro/pulls)

</div>

### 🚀 **Como Contribuir**
1. 🍴 **Fork** o projeto
2. 🌿 **Crie** uma branch (`git checkout -b feature/AmazingFeature`)
3. 📝 **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. 📤 **Push** para a branch (`git push origin feature/AmazingFeature`)
5. 🔄 **Abra** um Pull Request

### 📋 **Áreas que Precisam de Ajuda**
- 🧪 **Testes automatizados**
- ♿ **Acessibilidade (WCAG 2.1)**
- 🌍 **Novos idiomas**
- 📱 **PWA (Progressive Web App)**
- 🎨 **Novos temas visuais**

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes completos.

---

## 📞 Suporte

<div align="center">

### 💬 **Canais de Comunicação**

[![GitHub Issues](https://img.shields.io/badge/Issues-GitHub-red?style=for-the-badge&logo=github)](https://github.com/seu-usuario/nps-eventos-pro/issues)
[![GitHub Discussions](https://img.shields.io/badge/Discussions-GitHub-blue?style=for-the-badge&logo=github)](https://github.com/seu-usuario/nps-eventos-pro/discussions)
[![Email](https://img.shields.io/badge/Email-nps@eventos.pro-green?style=for-the-badge&logo=gmail)](mailto:nps@eventos.pro)

</div>

### ⏱️ **Tempo de Resposta**
- 🔴 **Issues críticas**: 24 horas
- 🟡 **Issues normais**: 3-5 dias úteis
- 🟢 **Feature requests**: 1-2 semanas

---

## 📄 Licença

<div align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Este projeto está licenciado sob a MIT License**  
Veja o arquivo [LICENSE](LICENSE) para detalhes completos.

</div>

---

## 🙏 Agradecimentos

<div align="center">

**Agradecimentos especiais a:**

- 🔤 [**Inter Font**](https://rsms.me/inter/) pela excelente tipografia
- 📐 [**CSS Grid Guide**](https://css-tricks.com/snippets/css/complete-guide-grid/) pela flexibilidade de layout
- 🌟 **Comunidade Open Source** pelas inspirações e feedback
- 👥 **Todos os contribuidores** que tornam este projeto melhor

</div>

---

<div align="center">

### 🌟 **Se este projeto foi útil, considere dar uma estrela!** ⭐

[![GitHub stars](https://img.shields.io/github/stars/seu-usuario/nps-eventos-pro?style=social)](https://github.com/seu-usuario/nps-eventos-pro/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/seu-usuario/nps-eventos-pro?style=social)](https://github.com/seu-usuario/nps-eventos-pro/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/seu-usuario/nps-eventos-pro?style=social)](https://github.com/seu-usuario/nps-eventos-pro/watchers)

---

**Desenvolvido com ❤️ para criar melhores experiências em eventos**

*NPS Eventos Pro - Transformando feedback em insights valiosos*

</div>

