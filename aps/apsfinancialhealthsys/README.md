# 🍕 Análise Financeira - Pizzaria Pro

Uma aplicação web completa para análise de dados financeiros de pizzarias, desenvolvida com React e focada nos principais indicadores de performance (KPIs) do setor alimentício.

## 📊 Funcionalidades

### Dashboard Interativo
- **KPIs Principais**: Ticket médio, CMV, rotação de mesas, NPS
- **Saúde Financeira**: Receita, lucro líquido, liquidez corrente
- **Gestão Fiscal**: Impostos, regime tributário, vencimentos
- **Relatórios**: Análise executiva com insights automáticos

### Visualizações
- Gráficos de barras para comparação de KPIs vs metas
- Gráficos de linha para evolução temporal
- Gráficos de pizza para distribuição de impostos
- Barras de progresso para indicadores de custo

## 🚀 Tecnologias

- **React 18** - Framework principal
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js 18 ou superior
- npm ou pnpm

## 🛠️ Instalação

1. Descompacte o arquivo ZIP
2. Navegue até o diretório do projeto:
   ```bash
   cd pizzaria-financeira
   ```

3. Instale as dependências:
   ```bash
   npm install
   # ou
   pnpm install
   ```

4. Execute o projeto em modo de desenvolvimento:
   ```bash
   npm run dev
   # ou
   pnpm run dev
   ```

5. Acesse `http://localhost:5173` no seu navegador

## 📦 Build para Produção

```bash
npm run build
# ou
pnpm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

## 📊 KPIs Monitorados

| Métrica | Benchmark | Descrição |
|---------|-----------|-----------|
| **CMV** | ≤ 30% | Custo de Mercadoria Vendida |
| **Custo Alimentos** | ≤ 32% | Percentual dos ingredientes |
| **Custo Mão de Obra** | 25-35% | Percentual da folha de pagamento |
| **Margem Lucro Bruto** | ≥ 65% | Meta para pizzarias |
| **Liquidez Corrente** | ≥ 1,5 | Capacidade de pagamento |

## 💰 Gestão Fiscal

### Impostos Monitorados
- **ISS** - Imposto Sobre Serviços
- **ICMS** - Imposto sobre Circulação de Mercadorias
- **PIS/COFINS** - Contribuições sociais
- **INSS** - Contribuição previdenciária

### Regimes Tributários
- **Simples Nacional** (Anexo I - Comércio)
- Alíquotas de 4% a 19% conforme faturamento
- Pagamento via DAS (Documento de Arrecadação Simplificada)

## 📁 Estrutura do Projeto

```
pizzaria-financeira/
├── src/
│   ├── components/ui/     # Componentes shadcn/ui
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilitários
│   ├── App.jsx           # Componente principal
│   ├── App.css           # Estilos customizados
│   └── main.jsx          # Entry point
├── public/               # Arquivos estáticos
├── package.json          # Dependências
└── README.md            # Este arquivo
```

## 🎨 Design System

- **Cores**: Gradiente laranja-vermelho (tema pizzaria)
- **Tipografia**: Inter (sistema)
- **Componentes**: shadcn/ui com Tailwind CSS
- **Responsividade**: Mobile-first approach
- **Acessibilidade**: Contraste adequado e navegação por teclado

## 📈 Funcionalidades Futuras

- [ ] Integração com APIs de PDV
- [ ] Relatórios em PDF
- [ ] Alertas automáticos
- [ ] Comparação setorial
- [ ] Projeções financeiras
- [ ] Sistema de autenticação
- [ ] Multi-tenant (múltiplas pizzarias)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvido por

**Manus AI** - Setembro 2025

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!
