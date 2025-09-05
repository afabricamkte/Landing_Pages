# Pizzaria Pro - Sistema de Gestão para Pizzarias

![Versão](https://img.shields.io/badge/versão-2.0.0-blue)
![Licença](https://img.shields.io/badge/licença-MIT-green)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

## 🍕 Sobre o Projeto

Pizzaria Pro é um sistema de gestão completo e moderno para pizzarias, desenvolvido para simplificar o controle de ingredientes, receitas, estoque, vendas e finanças. A aplicação foi totalmente refatorada para seguir as melhores práticas de desenvolvimento web, com código modular, interface responsiva e uma base sólida para futuras expansões.

Esta versão foi desenvolvida utilizando apenas HTML, CSS e JavaScript puros (Vanilla JS), demonstrando a capacidade de criar aplicações ricas e complexas sem a necessidade de frameworks pesados.

## ✨ Funcionalidades Principais

- **Dashboard Inteligente:** Visão geral do negócio com KPIs (Key Performance Indicators) em tempo real.
- **Gestão de Ingredientes:** Cadastro e controle de matérias-primas, com preços, unidades e fornecedores.
- **Engenharia de Cardápio:** Criação de receitas de pizzas com cálculo automático de custo baseado nos ingredientes.
- **Controle de Estoque:** Monitoramento de estoque em tempo real com alertas de nível baixo e crítico.
- **Registro de Vendas:** Lançamento de vendas por múltiplos canais (Balcão, iFood, Delivery Próprio, etc.).
- **Precificação Avançada:** Tabela de preços dinâmica por canal de venda, considerando comissões de aplicativos.
- **Simulador de Preços:** Ferramenta para simular o impacto de alterações de preço na margem de lucro.
- **Análises e Relatórios:** Gráficos e tabelas para análise de performance de vendas, rentabilidade por canal e mais.
- **Backup e Exportação:** Funcionalidades para exportar todos os dados do sistema em formato JSON, garantindo a segurança das informações.
- **Interface Responsiva:** Totalmente adaptável para uso em desktops, tablets e celulares.

## 🚀 Como Executar o Projeto

Como este é um projeto baseado em HTML, CSS e JavaScript puros, não há necessidade de um processo de build complexo. Basta abrir o arquivo `index.html` em um navegador moderno.

Para uma melhor experiência, recomenda-se o uso de um servidor web local para evitar problemas com políticas de CORS do navegador ao carregar os módulos JavaScript.

**Usando um servidor local com Python (se você tiver Python instalado):**

1. Navegue até a pasta raiz do projeto (`pizzaria-pro`) pelo terminal.
2. Execute um dos seguintes comandos:
   ```bash
   # Para Python 3
   python -m http.server

   # Para Python 2
   python -m SimpleHTTPServer
   ```
3. Abra seu navegador e acesse `http://localhost:8000`.

**Usando a extensão Live Server no VS Code:**

1. Abra a pasta do projeto no Visual Studio Code.
2. Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
3. Clique com o botão direito no arquivo `index.html` e selecione "Open with Live Server".

## 📂 Estrutura de Diretórios

O projeto foi organizado de forma modular para facilitar a manutenção e a escalabilidade.

```
pizzaria-pro/
├── src/
│   ├── components/      # Componentes reutilizáveis (Modal, Toast)
│   ├── modules/         # Módulos de funcionalidades (Dashboard, Ingredientes, etc.)
│   ├── styles/          # Arquivos de estilo CSS
│   │   ├── main.css
│   │   ├── components.css
│   │   └── responsive.css
│   ├── utils/           # Funções utilitárias (Cálculos, Validação, Helpers)
│   └── app.js           # Ponto de entrada principal da aplicação
├── tests/
│   ├── *.test.js        # Arquivos de teste para cada módulo
│   ├── index.html       # Interface para visualização dos testes
│   └── run-tests.js     # Executor principal dos testes
├── index.html           # Arquivo HTML principal
└── README.md            # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura semântica e moderna.
- **CSS3:** Estilização avançada com Flexbox, Grid Layout e Variáveis CSS para fácil customização.
- **JavaScript (ES6+):** Lógica da aplicação com módulos, classes e funcionalidades modernas da linguagem.

## 🧪 Testes

O projeto conta com uma suíte de testes unitários para garantir a qualidade e a estabilidade das funcionalidades críticas, como os módulos de cálculo e validação. Para executar os testes, abra o arquivo `tests/index.html` no seu navegador e clique em "Executar Testes".

## 🤝 Como Contribuir

Contribuições são bem-vindas! Se você tem ideias para novas funcionalidades, melhorias ou correções de bugs, sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.

Consulte o arquivo `CONTRIBUTING.md` para mais detalhes sobre como contribuir para o projeto.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.


