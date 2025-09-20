# 🍕 APS - Sistema de Precificação para Pizzarias

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Google Sheets](https://img.shields.io/badge/Database-Google%20Sheets-green.svg)](https://sheets.google.com/)
[![Responsive](https://img.shields.io/badge/Design-Responsive-blue.svg)](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

Sistema completo de gestão de custos e precificação para pizzarias, integrado com Google Sheets como banco de dados. Desenvolvido com tecnologias web modernas para oferecer uma solução robusta, acessível e sem necessidade de infraestrutura complexa.

## 🚀 Demonstração

[🔗 **Demo Online**](https://seu-usuario.github.io/aps-sistema-precificacao) | [📱 **Mobile Demo**](https://seu-usuario.github.io/aps-sistema-precificacao)

![Screenshot do Sistema](screenshots/dashboard.png)

## ✨ Características Principais

- **🎯 Precificação Inteligente**: Cálculo automático de preços por canal de venda
- **📊 Dashboard Analítico**: Métricas em tempo real com gráficos interativos
- **🔄 Integração Google Sheets**: Banco de dados na nuvem sem custos adicionais
- **📱 Totalmente Responsivo**: Interface adaptada para desktop, tablet e mobile
- **🛠️ Modo Demonstração**: Teste sem configuração inicial
- **⚡ Performance Otimizada**: Carregamento rápido e interface fluida

## 🎯 Funcionalidades

### 📋 Gestão de Ingredientes
- Cadastro completo com categoria, fornecedor e preços
- Cálculo automático de custo por grama/ml
- Controle de rendimento e perdas
- Histórico de preços para análise de tendências

### 🍕 Receitas e Cardápio
- Receitas base para massas e molhos
- Cardápio de pizzas com recheios por tamanho
- Cálculo automático de custos por receita
- Gestão de quantidades por tamanho (P, M, G, GG)

### 💰 Gestão de Custos
- Custos fixos mensais com rateio inteligente
- Custos variáveis por pizza (embalagens, gás, etc.)
- Impostos e taxas configuráveis por canal
- Cálculo automático de custo total por produto

### 🏷️ Precificação por Canal
- Múltiplos canais de venda (Balcão, Delivery, Apps)
- Margens diferenciadas por canal
- Simulador de preços para cenários
- Preços finais calculados automaticamente

### 📈 Dashboard e Análises
- Métricas em tempo real (margem, CMV, ticket médio)
- Gráficos interativos de custos e margens
- Análise de lucratividade por pizza
- Relatórios gerenciais exportáveis

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Database**: Google Sheets API
- **Authentication**: OAuth 2.0 Google
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **Responsive**: CSS Grid & Flexbox

## 📦 Instalação

### Pré-requisitos
- Navegador web moderno
- Conta Google (para Google Sheets)
- Servidor web local ou hospedagem

### Instalação Rápida

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/aps-sistema-precificacao.git
cd aps-sistema-precificacao
```

2. **Inicie servidor local**
```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx http-server -p 8080
```

3. **Acesse o sistema**
```
http://localhost:8080
```

### Configuração Google Sheets

1. **Google Cloud Console**
   - Acesse [console.cloud.google.com](https://console.cloud.google.com/)
   - Crie projeto e ative Google Sheets API
   - Crie credenciais (API Key + OAuth Client ID)

2. **Configure no Sistema**
   - Clique em "Configurar" no sistema
   - Insira API Key, Client ID e Spreadsheet ID
   - Teste a conexão

📖 **[Guia Completo de Instalação](docs/INSTALACAO.md)**

## 🎮 Uso Rápido

### Primeiro Acesso
1. **Modo Demo**: Use sem configuração para testar
2. **Configure Google Sheets**: Para dados reais
3. **Cadastre Ingredientes**: Base do sistema
4. **Configure Custos**: Fixos e variáveis
5. **Monte Cardápio**: Pizzas e receitas

### Operação Diária
- **Atualize preços** de ingredientes
- **Monitore dashboard** para métricas
- **Use simulador** para novos preços
- **Exporte relatórios** para análise

## 📊 Screenshots

<details>
<summary>🖼️ Ver Screenshots</summary>

### Dashboard Principal
![Dashboard](screenshots/dashboard.png)

### Gestão de Ingredientes
![Ingredientes](screenshots/ingredientes.png)

### Precificação por Canal
![Precos](screenshots/precos.png)

### Interface Mobile
![Mobile](screenshots/mobile.png)

</details>

## 🏗️ Estrutura do Projeto

```
aps-sistema-precificacao/
├── 📄 index.html              # Página principal
├── 🧪 test.html               # Página de testes
├── 📁 src/                    # Código fonte
│   ├── 🎨 styles.css          # Estilos CSS
│   ├── ⚙️ config.js           # Configurações
│   ├── 🔧 utils.js            # Utilitários
│   ├── 🔌 api.js              # API Google Sheets
│   ├── 🧩 components.js       # Componentes UI
│   ├── 🚀 app.js              # Aplicação principal
│   └── 🔑 google-config.js    # Config Google
├── 📁 docs/                   # Documentação
│   ├── 📖 INSTALACAO.md       # Guia instalação
│   ├── 📋 RESUMO_EXECUTIVO.md # Resumo executivo
│   └── 📊 GOOGLE_SHEETS.md    # Config planilhas
├── 📁 screenshots/            # Capturas de tela
├── 📁 .github/               # GitHub configs
│   └── workflows/            # GitHub Actions
└── 📄 README.md              # Este arquivo
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia nosso [Guia de Contribuição](CONTRIBUTING.md).

### Como Contribuir
1. **Fork** o projeto
2. **Crie** uma branch (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

## 📝 Roadmap

- [ ] **v1.1**: Exportação para Excel/PDF
- [ ] **v1.2**: Integração com ERPs
- [ ] **v1.3**: App mobile nativo
- [ ] **v1.4**: Análise preditiva de custos
- [ ] **v1.5**: Multi-idiomas

## 🐛 Reportar Bugs

Encontrou um bug? [Abra uma issue](https://github.com/seu-usuario/aps-sistema-precificacao/issues/new?template=bug_report.md)

## 💡 Solicitar Funcionalidades

Tem uma ideia? [Solicite uma funcionalidade](https://github.com/seu-usuario/aps-sistema-precificacao/issues/new?template=feature_request.md)

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Seu Nome** - *Desenvolvimento inicial* - [@seu-usuario](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- Comunidade de desenvolvedores JavaScript
- Google pela API do Sheets
- Chart.js pela biblioteca de gráficos
- Font Awesome pelos ícones

## 📞 Suporte

- 📧 **Email**: seu-email@exemplo.com
- 💬 **Discord**: [Servidor da Comunidade](https://discord.gg/seu-servidor)
- 📱 **WhatsApp**: [Grupo de Suporte](https://wa.me/seu-numero)

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

[![GitHub stars](https://img.shields.io/github/stars/seu-usuario/aps-sistema-precificacao.svg?style=social&label=Star)](https://github.com/seu-usuario/aps-sistema-precificacao)
[![GitHub forks](https://img.shields.io/github/forks/seu-usuario/aps-sistema-precificacao.svg?style=social&label=Fork)](https://github.com/seu-usuario/aps-sistema-precificacao/fork)

**Desenvolvido com ❤️ para a comunidade de pizzarias**

</div>
