# 🍕 Pizzaria Pro - Sistema de Precificação

Sistema web completo para precificação inteligente de pizzarias com gestão de custos operacionais e precificação multi-canal.

## ✨ Características Principais

- 🎯 **Precificação Multi-Canal** - 9 canais de venda configurados
- 📊 **Dashboard Inteligente** - KPIs e alertas automáticos
- 🥘 **Gestão Completa** - Ingredientes, receitas e custos
- 📈 **Histórico de Preços** - Análises e tendências
- 💾 **Import/Export** - Backup e restauração de dados
- 🎨 **Interface Moderna** - Design responsivo e profissional

## 🚀 Início Rápido

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm run dev

# Build para produção
pnpm run build
```

## 🏗️ Tecnologias

- **React.js** - Framework frontend
- **TailwindCSS** - Estilização
- **Shadcn/UI** - Componentes
- **Lucide Icons** - Iconografia
- **LocalStorage** - Persistência

## 📋 Funcionalidades

### Dashboard
- Visão geral do sistema
- Alertas inteligentes
- KPIs em tempo real

### Ingredientes
- CRUD completo
- Histórico de preços
- Categorização
- Controle de fornecedores

### Receitas
- Composição por tamanhos
- Cálculo automático de custos
- Sistema de abas
- Duplicação facilitada

### Custos Operacionais
- **Fixos**: Água, luz, aluguel, salários
- **Embalagens**: Caixas, sacolas, guardanapos
- **Sachês**: Ketchup, maionese, mostarda
- **Delivery**: Combustível, entregador

### Precificação
- **9 canais** configurados
- Cálculo inteligente
- Comparação automática
- Margem personalizável

### Histórico
- Análises por período
- Filtros avançados
- Estatísticas visuais

## 🎯 Canais de Venda

| Canal | Taxa | Tipo |
|-------|------|------|
| iFood | 15% | Delivery |
| 99Food | 12% | Delivery |
| Rappi | 14% | Delivery |
| Uber Eats | 15% | Delivery |
| Aiqfome | 10% | Delivery |
| James Delivery | 8% | Delivery |
| Delivery Much | 12% | Delivery |
| Delivery Direto | 0% | Delivery |
| Balcão | 0% | Presencial |

## 💰 Cálculo de Precificação

```
Preço Final = (Custo Ingredientes + Custo Operacional + Custo Delivery) 
              ÷ (1 - Taxa Plataforma - Margem Desejada)
```

### Componentes do Custo:
1. **Ingredientes** - Baseado na receita e quantidades
2. **Operacional** - Rateio dos custos fixos mensais
3. **Por Pedido** - Embalagens e sachês
4. **Delivery** - Combustível e entregador (quando aplicável)

## 📊 Exemplo Prático

**Pizza Margherita Média:**
- Ingredientes: R$ 11,20
- Operacional: R$ 2,80
- Embalagem: R$ 3,50
- Delivery: R$ 7,70
- **Total**: R$ 25,20

**Precificação:**
- iFood (15%): R$ 32,90 (margem 20%)
- Delivery Direto: R$ 25,90 (margem 30%)
- Balcão: R$ 18,20 (margem 35%)

## 🔧 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── Dashboard.jsx    # Visão geral
│   ├── GestaoIngredientes.jsx
│   ├── GestaoReceitas.jsx
│   ├── CustosOperacionais.jsx
│   ├── Precificacao.jsx
│   ├── HistoricoAnalisesSimple.jsx
│   └── ImportExportSimple.jsx
├── lib/
│   ├── data.js          # Estruturas de dados
│   └── importExport.js  # Utilitários I/O
└── App.jsx              # Componente principal
```

## 📱 Interface

- **Design Responsivo** - Funciona em desktop e mobile
- **Navegação por Abas** - Interface intuitiva
- **Cards Coloridos** - Organização visual
- **Alertas Inteligentes** - Guias de configuração
- **Animações Suaves** - Experiência moderna

## 💾 Persistência de Dados

O sistema utiliza **LocalStorage** para manter os dados localmente no navegador:

- ✅ **Sem servidor** necessário
- ✅ **Dados privados** mantidos localmente
- ✅ **Backup manual** via exportação JSON
- ✅ **Importação** de dados históricos

## 🎨 Customização

### Cores por Categoria:
- **Dashboard**: Laranja (#FF6B35)
- **Ingredientes**: Vermelho (#E53E3E)
- **Receitas**: Verde (#38A169)
- **Custos**: Rosa (#D53F8C)
- **Precificação**: Roxo (#805AD5)
- **Histórico**: Laranja (#FF8C00)

### Componentes UI:
- Botões com estados hover
- Cards com sombras suaves
- Inputs com validação visual
- Modais responsivos
- Tabelas interativas

## 📈 Benefícios

### Para o Negócio:
- Precificação assertiva
- Comparação automática entre canais
- Identificação do canal mais rentável
- Controle total sobre margens

### Para a Operação:
- Interface intuitiva
- Alertas para configurações pendentes
- Histórico para análise de tendências
- Backup automático dos dados

## 🔄 Fluxo de Uso

1. **Configure** os custos operacionais
2. **Cadastre** ingredientes com preços
3. **Crie** receitas com composições
4. **Calcule** preços para diferentes canais
5. **Compare** e escolha o melhor canal
6. **Monitore** histórico e tendências
7. **Exporte** dados para backup

## 📞 Suporte

Para dúvidas ou sugestões sobre o sistema, consulte a documentação completa em `DOCUMENTACAO.md`.

---

**Desenvolvido com ❤️ para pizzarias que buscam precificação inteligente**
