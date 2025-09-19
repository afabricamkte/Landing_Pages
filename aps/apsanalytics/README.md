# 🍕 Dashboard Pizzaria - Sistema de Monitoramento em Tempo Real

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-teal.svg)](https://tailwindcss.com/)
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-API-green.svg)](https://developers.google.com/sheets/api)

## 📊 Visão Geral

Dashboard profissional para monitoramento operacional de pizzarias em tempo real, com integração ao Google Sheets e atualização automática a cada 3 segundos.

![Dashboard Preview](https://via.placeholder.com/800x400/1f2937/ffffff?text=Dashboard+Pizzaria+Preview)

## ✨ Funcionalidades

### 🎯 **Métricas em Tempo Real**
- Pedidos diários com comparativo
- Faturamento e crescimento
- Ticket médio por pedido
- Status operacional

### 📈 **Visualizações Avançadas**
- Gráfico de vendas por dia
- Distribuição por canais (iFood, WhatsApp, etc.)
- Produtos mais vendidos
- Performance por horário
- Margem de lucro por categoria
- Metas mensais (gráfico radial)
- Comparação semanal

### 🚨 **Sistema de Alertas**
- Estoque crítico automático
- Alertas de horário de pico
- Notificações de metas atingidas
- Indicadores de performance

### 🔄 **Integração Google Sheets**
- Planilha unificada com 4 abas
- Sincronização automática
- Fallback com dados mock
- Configuração simplificada

## 🚀 Instalação e Uso

### Pré-requisitos
- Node.js 18+ 
- pnpm (recomendado) ou npm
- Conta Google (para planilhas)

### 1. Clone e Instale
```bash
git clone https://github.com/seu-usuario/dashboard-pizzaria.git
cd dashboard-pizzaria
pnpm install
```

### 2. Execute em Desenvolvimento
```bash
pnpm run dev
```
Acesse: `http://localhost:5173`

### 3. Build para Produção
```bash
pnpm run build
```

## 📋 Configuração da Planilha

### Estrutura Obrigatória
Crie uma planilha no Google Sheets com **4 abas**:

1. **`Vendas`** - Registro de pedidos
2. **`Insumos`** - Controle de estoque  
3. **`Cardapio`** - Produtos e preços
4. **`Metricas`** - KPIs calculados

### Configuração Rápida
1. Baixe o template: `Planilha_Pizzaria_Completa.csv`
2. Importe no Google Sheets
3. Torne a planilha pública
4. Configure no dashboard

## 🛠️ Tecnologias

- **Frontend**: React 18, Vite, TailwindCSS
- **UI Components**: Shadcn/UI, Lucide Icons
- **Gráficos**: Recharts
- **HTTP**: Axios
- **Integração**: Google Sheets API

## 📁 Estrutura do Projeto

```
dashboard-pizzaria/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes base
│   │   ├── AdvancedCharts.jsx
│   │   ├── AlertSystem.jsx
│   │   └── ConfigModalUnified.jsx
│   ├── services/
│   │   └── googleSheetsUnified.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── README.md
```

## 🎨 Screenshots

### Dashboard Principal
![Dashboard](https://via.placeholder.com/600x400/3b82f6/ffffff?text=Dashboard+Principal)

### Gráficos Avançados
![Charts](https://via.placeholder.com/600x400/10b981/ffffff?text=Graficos+Avancados)

### Sistema de Alertas
![Alerts](https://via.placeholder.com/600x400/f59e0b/ffffff?text=Sistema+Alertas)

## 📊 Dados de Exemplo

O projeto inclui dados mock para demonstração:
- 15 pedidos de exemplo
- 12 ingredientes no estoque
- 12 produtos no cardápio
- 3 dias de métricas

## 🔧 Personalização

### Adicionar Novos Canais
Edite `src/services/googleSheetsUnified.js`:
```javascript
const processCanaisData = (vendas) => {
  // Adicione novos canais aqui
}
```

### Customizar Alertas
Modifique `src/components/AlertSystem.jsx`:
```javascript
// Ajuste limites e condições
if (atual <= minimo) {
  status = 'critico'
}
```

## 📱 Responsividade

- ✅ Desktop (experiência completa)
- ✅ Tablet (layout adaptado)
- ✅ Mobile (interface otimizada)

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload da pasta dist/
```

### GitHub Pages
```bash
npm run build
# Configure GitHub Actions
```

## 📈 Roadmap

### v2.0
- [ ] Integração APIs de delivery
- [ ] Relatórios PDF automáticos
- [ ] Previsão de demanda (IA)
- [ ] App mobile nativo

### v2.1
- [ ] Multi-loja (franquias)
- [ ] Gestão de funcionários
- [ ] Controle financeiro
- [ ] Integração contábil

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- 📧 Email: suporte@dashboardpizzaria.com
- 💬 Issues: [GitHub Issues](https://github.com/seu-usuario/dashboard-pizzaria/issues)
- 📖 Docs: [Documentação Completa](./README_Dashboard_Pizzaria.md)

## 🏆 Créditos

Desenvolvido com ❤️ para pizzarias que querem crescer com dados!

### 🍕 **Dashboard Pizzaria v1.0** - Transformando dados em decisões inteligentes

---

⭐ **Se este projeto te ajudou, deixe uma estrela!** ⭐
