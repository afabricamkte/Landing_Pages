# 🍕 Pizzaria Pro - Sistema de Precificação

## 📋 Visão Geral

O **Pizzaria Pro** é um sistema web completo para precificação inteligente de pizzarias, desenvolvido com foco na gestão de custos operacionais e precificação multi-canal. O sistema permite controle total sobre ingredientes, receitas, custos fixos e variáveis, oferecendo precificação otimizada para diferentes canais de venda.

## 🎯 Funcionalidades Principais

### 1. **Dashboard Inteligente**
- Visão geral do sistema com KPIs essenciais
- Alertas automáticos para configurações pendentes
- Estatísticas em tempo real de ingredientes e receitas
- Faixa de custos operacionais por categoria

### 2. **Gestão de Ingredientes**
- CRUD completo com histórico de preços
- Categorização por tipo (queijos, carnes, vegetais, etc.)
- Controle de fornecedores e unidades de medida
- Quantidade padrão por tamanho de pizza (P, M, G, GG)
- Sistema de busca e filtros avançados

### 3. **Gestão de Receitas**
- Criação de receitas por tamanho
- Composição detalhada com ingredientes e quantidades
- Cálculo automático de custos por receita
- Sistema de abas para diferentes tamanhos
- Funcionalidade de cópia entre tamanhos
- Duplicação de receitas para facilitar criação

### 4. **Custos Operacionais**
Organizados em 4 categorias principais:

#### **Custos Fixos Mensais**
- Água, energia elétrica, internet/telefone
- Aluguel, salários e encargos
- Contabilidade e outros custos fixos
- Rateio automático baseado no volume mensal

#### **Embalagens**
- Caixas por tamanho (P, M, G, GG)
- Sacolas, guardanapos, talheres
- Custos específicos por item

#### **Sachês**
- Ketchup, maionese, mostarda
- Orégano e outros temperos
- Controle de quantidade por pedido

#### **Delivery**
- Combustível e manutenção
- Pagamento do entregador
- Custos aplicados apenas nos canais de delivery

### 5. **Precificação Multi-Canal**
Sistema inteligente que considera **9 canais de venda**:

#### **Principais Plataformas**
- **iFood** (taxa 15%)
- **99Food** (taxa 12%)
- **Rappi** (taxa 14%)
- **Uber Eats** (taxa 15%)

#### **Plataformas Regionais**
- **Aiqfome** (taxa 10%)
- **James Delivery** (taxa 8%)
- **Delivery Much** (taxa 12%)

#### **Canais Diretos**
- **Delivery Direto** (sem taxa)
- **Balcão** (sem taxa, sem delivery)

#### **Cálculo Inteligente**
Para cada canal, o sistema calcula:
1. **Custo dos ingredientes** (com histórico)
2. **Custos operacionais rateados**
3. **Custos por pedido** (embalagens + sachês)
4. **Custos de delivery** (quando aplicável)
5. **Taxa da plataforma**
6. **Margem de lucro desejada**

### 6. **Histórico e Análises**
- Filtros por período (7, 30, 90 dias, 1 ano)
- Análise por categoria de ingredientes
- Estatísticas de preços médios
- Distribuição de custos por categoria
- Acompanhamento de evolução de preços

### 7. **Import/Export**
- **Exportação** em JSON para backup completo
- **Importação** de dados históricos
- Manutenção do histórico sem banco de dados
- Compatibilidade com planilhas externas

## 🏗️ Arquitetura Técnica

### **Frontend**
- **React.js** com hooks modernos
- **TailwindCSS** para estilização
- **Shadcn/UI** para componentes profissionais
- **Lucide Icons** para iconografia
- **LocalStorage** para persistência

### **Estrutura de Dados**
```javascript
{
  ingredientes: [
    {
      id, nome, categoria, precoAtual, unidade,
      fornecedor, quantidadePorTamanho: { P, M, G, GG },
      historicoPrecos: [{ data, preco }],
      ativo, dataAtualizacao
    }
  ],
  receitas: [
    {
      id, nome, categoria, descricao,
      tamanhos: {
        P: { ingredientes: [{ id, quantidade }], custoTotal },
        M: { ingredientes: [{ id, quantidade }], custoTotal },
        G: { ingredientes: [{ id, quantidade }], custoTotal },
        GG: { ingredientes: [{ id, quantidade }], custoTotal }
      },
      ativa, dataCriacao
    }
  ],
  custosOperacionais: {
    fixosMensais: { agua, energia, internet, aluguel, salarios, telefone, contabilidade, outros, volumeMensal },
    embalagens: { caixaP, caixaM, caixaG, caixaGG, sacola, guardanapo, talher },
    saches: { ketchup, maionese, mostarda, oregano },
    delivery: { combustivel, entregador, manutencao }
  },
  precificacao: [
    {
      receitaId, tamanho, canal, custoIngredientes,
      custoOperacional, custoDelivery, taxaPlataforma,
      margemDesejada, precoFinal, data
    }
  ]
}
```

## 🚀 Como Usar

### **1. Configuração Inicial**
1. Acesse o sistema via navegador
2. Configure os **Custos Operacionais** primeiro
3. Cadastre os **Ingredientes** com preços atuais
4. Crie as **Receitas** com composições

### **2. Precificação**
1. Selecione uma receita na aba **Precificação**
2. Escolha o tamanho desejado
3. Defina a margem de lucro
4. Compare preços entre todos os canais
5. Identifique o canal mais rentável

### **3. Gestão Contínua**
1. Atualize preços de ingredientes regularmente
2. Monitore o **Histórico** para identificar tendências
3. Ajuste custos operacionais mensalmente
4. Exporte dados para backup

## 📊 Exemplo Prático

### **Pizza Margherita Média**
```
Ingredientes:
- Massa: R$ 2,50
- Molho: R$ 1,20
- Mussarela: R$ 6,80
- Manjericão: R$ 0,70
Total Ingredientes: R$ 11,20

Custos Operacionais:
- Fixos rateados: R$ 2,80
- Embalagem: R$ 3,50
- Sachês: R$ 1,20
Total Operacional: R$ 7,50

Delivery: R$ 7,70

Custo Total: R$ 26,40

Precificação por Canal:
- iFood (15%): R$ 32,90 (margem 20%)
- Delivery Direto: R$ 25,90 (margem 30%)
- Balcão: R$ 18,20 (margem 35%)
```

## 🔧 Instalação e Deploy

### **Desenvolvimento Local**
```bash
cd pizzaria-precificacao
pnpm install
pnpm run dev
```

### **Build para Produção**
```bash
pnpm run build
pnpm run preview
```

## 📈 Benefícios

### **Para o Negócio**
- **Precificação assertiva** considerando todos os custos
- **Comparação automática** entre canais de venda
- **Identificação** do canal mais rentável
- **Controle total** sobre margens de lucro

### **Para a Operação**
- **Interface intuitiva** e fácil de usar
- **Alertas inteligentes** para configurações pendentes
- **Histórico completo** para análise de tendências
- **Backup automático** dos dados

### **Para a Gestão**
- **Visibilidade completa** dos custos operacionais
- **Análises visuais** para tomada de decisão
- **Controle de fornecedores** e ingredientes
- **Otimização** da precificação por canal

## 🎨 Interface

O sistema possui uma interface moderna e profissional com:
- **Design responsivo** para desktop e mobile
- **Navegação por abas** intuitiva
- **Cards coloridos** para diferentes categorias
- **Alertas visuais** para ações necessárias
- **Animações suaves** e micro-interações
- **Tema consistente** em toda a aplicação

## 🔒 Segurança e Dados

- **Armazenamento local** no navegador
- **Sem dependência** de servidores externos
- **Backup manual** via exportação JSON
- **Dados privados** mantidos localmente
- **Sem coleta** de informações pessoais

## 📞 Suporte

Para dúvidas, sugestões ou suporte técnico, entre em contato através dos canais oficiais da Pizzaria Pro.

---

**© 2024 Pizzaria Pro - Sistema de Precificação v1.0**
