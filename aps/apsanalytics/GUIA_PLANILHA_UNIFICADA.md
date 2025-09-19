# 🍕 Guia Completo - Planilha Unificada Dashboard Pizzaria

## 🎯 **ATUALIZAÇÃO IMPORTANTE**

Agora você precisa de **apenas 1 planilha** no Google Sheets com **4 abas**! Muito mais simples e prático de gerenciar.

## ⚡ Configuração em 3 Passos

### Passo 1: Criar a Planilha Unificada

1. **Acesse o Google Sheets** → [sheets.google.com](https://sheets.google.com)
2. **Crie uma nova planilha** → "Planilha em branco"
3. **Renomeie para**: "Dashboard Pizzaria - [Seu Nome]"

### Passo 2: Criar as 4 Abas Obrigatórias

**⚠️ IMPORTANTE: Os nomes devem ser EXATAMENTE assim:**

1. **Aba 1**: `Vendas` (renomeie "Planilha1")
2. **Aba 2**: `Insumos` (clique no + para criar)
3. **Aba 3**: `Cardapio` (clique no + para criar)
4. **Aba 4**: `Metricas` (clique no + para criar)

### Passo 3: Configurar no Dashboard

1. **Torne a planilha pública**:
   - Clique em "Compartilhar" (canto superior direito)
   - "Alterar para qualquer pessoa com o link"
   - Permissão: "Visualizador"
   - Copie o link da planilha

2. **Configure no Dashboard**:
   - Abra o Dashboard da Pizzaria
   - Clique em "Configurar Google Sheets"
   - Cole a URL da planilha
   - Clique em "Testar Conexão"
   - Clique em "Salvar Configuração"

## 📊 Estrutura das Abas

### 🛒 **Aba: Vendas**
**Registre todos os pedidos realizados**

| Coluna | Exemplo | Descrição |
|--------|---------|-----------|
| Data | 2024-09-19 | Data do pedido (YYYY-MM-DD) |
| Hora | 12:30 | Horário do pedido |
| Produto | Pizza Margherita | Nome do produto |
| Quantidade | 1 | Quantidade vendida |
| Valor_Unitario | 42.90 | Preço unitário |
| Valor_Total | 42.90 | Valor total do item |
| Canal | iFood | Canal de venda |
| Cliente | João Silva | Nome do cliente |
| Status | Entregue | Status do pedido |

**Canais suportados**: iFood, WhatsApp, Balcão, Rappi, 99Food, Uber Eats

### 📦 **Aba: Insumos**
**Controle de estoque com alertas automáticos**

| Coluna | Exemplo | Descrição |
|--------|---------|-----------|
| Item | Queijo Mussarela | Nome do ingrediente |
| Quantidade_Atual | 8 | Estoque atual |
| Quantidade_Minima | 5 | Estoque mínimo |
| Unidade | kg | Unidade de medida |
| Custo_Unitario | 28.50 | Custo por unidade |
| Fornecedor | Laticínios ABC | Nome do fornecedor |
| Ultima_Compra | 2024-09-18 | Data da última compra |

**🚨 Alertas automáticos quando**: `Quantidade_Atual <= Quantidade_Minima`

### 🍕 **Aba: Cardapio**
**Produtos, preços e margens**

| Coluna | Exemplo | Descrição |
|--------|---------|-----------|
| Produto | Pizza Margherita | Nome do produto |
| Categoria | Pizza Tradicional | Categoria do produto |
| Preco | 42.90 | Preço de venda |
| Custo | 16.20 | Custo de produção |
| Margem | 62.2 | Margem de lucro (%) |
| Ativo | Sim | Se está ativo no cardápio |
| Descricao | Molho e queijo | Descrição do produto |

### 📈 **Aba: Metricas**
**KPIs e indicadores calculados**

| Coluna | Exemplo | Descrição |
|--------|---------|-----------|
| Data | 2024-09-19 | Data da métrica |
| Pedidos_Total | 15 | Total de pedidos do dia |
| Faturamento_Total | 687.50 | Faturamento do dia |
| Ticket_Medio | 45.83 | Valor médio por pedido |
| Crescimento_Pedidos | 50.0 | Crescimento vs dia anterior (%) |
| Crescimento_Faturamento | 49.5 | Crescimento faturamento (%) |

## 📋 Template Pronto para Usar

Baixe o arquivo `Planilha_Pizzaria_Completa.csv` que contém:
- ✅ Estrutura completa das 4 abas
- ✅ Dados de exemplo para teste
- ✅ Fórmulas e formatação
- ✅ 15 pedidos de exemplo
- ✅ 12 ingredientes no estoque
- ✅ 12 produtos no cardápio
- ✅ 3 dias de métricas

## 🔄 Como Importar o Template

### Método 1: Importar CSV (Recomendado)
1. Abra o Google Sheets
2. Arquivo → Importar
3. Upload → Selecione `Planilha_Pizzaria_Completa.csv`
4. Separador: "Vírgula"
5. Importar dados
6. Separe manualmente em 4 abas

### Método 2: Copiar e Colar
1. Abra o arquivo CSV em um editor de texto
2. Copie os dados de cada seção
3. Cole em cada aba correspondente
4. Ajuste a formatação se necessário

## 🎨 Formatação Recomendada

### Cores das Abas
- **Vendas**: Verde 🟢
- **Insumos**: Azul 🔵  
- **Cardapio**: Roxo 🟣
- **Metricas**: Laranja 🟠

### Formatação de Células
- **Datas**: Formato brasileiro (DD/MM/AAAA)
- **Valores**: Moeda brasileira (R$ 0,00)
- **Percentuais**: Formato percentual (0,0%)
- **Headers**: Negrito e cor de fundo

## 🚨 Alertas Automáticos

O dashboard detecta automaticamente:

### 🔴 **Crítico**
- Estoque no nível mínimo ou abaixo
- Queda de vendas > 20%
- Margem de lucro < 30%

### 🟡 **Atenção**
- Estoque próximo ao mínimo (até 50% acima)
- Ticket médio abaixo da média
- Tempo de preparo acima do normal

### 🔵 **Informativo**
- Horário de pico (18h-21h)
- Metas atingidas
- Novos recordes

## 📱 Acesso Mobile

A planilha unificada funciona perfeitamente no mobile:
- **Google Sheets App**: Para editar dados
- **Dashboard Web**: Para visualizar métricas
- **Sincronização**: Automática entre dispositivos

## 🔧 Manutenção Diária

### ✅ **Tarefas Diárias**
1. Registrar vendas na aba "Vendas"
2. Atualizar estoque na aba "Insumos"
3. Verificar alertas no dashboard
4. Analisar métricas de performance

### ✅ **Tarefas Semanais**
1. Revisar preços na aba "Cardapio"
2. Calcular métricas na aba "Metricas"
3. Fazer backup da planilha
4. Analisar tendências nos gráficos

## 🎯 Vantagens da Planilha Unificada

### ✅ **Mais Simples**
- Apenas 1 planilha para gerenciar
- 1 URL para configurar
- Dados centralizados

### ✅ **Mais Rápido**
- Configuração em 3 passos
- Menos URLs para copiar
- Sincronização mais eficiente

### ✅ **Mais Organizado**
- Todas as informações em um lugar
- Fácil navegação entre abas
- Backup simplificado

### ✅ **Mais Confiável**
- Menos pontos de falha
- Conexão mais estável
- Dados sempre sincronizados

## 🆘 Solução de Problemas

### ❌ **"Dados não carregam"**
1. Verifique se a planilha está pública
2. Confirme os nomes das abas: Vendas, Insumos, Cardapio, Metricas
3. Teste a URL no navegador

### ❌ **"Alertas não aparecem"**
1. Adicione dados na aba "Insumos"
2. Configure quantidades mínimas
3. Aguarde 3 segundos para atualização

### ❌ **"Gráficos em branco"**
1. Adicione dados na aba "Vendas"
2. Use formato de data: YYYY-MM-DD
3. Verifique valores numéricos (sem R$)

## 📞 Suporte Rápido

**Problema comum**: Planilha não conecta
**Solução**: 
1. Copie a URL da barra do navegador
2. Certifique-se que termina com `/edit#gid=0`
3. Planilha deve estar pública (ícone de link)

---

## 🎉 **Pronto! Sua pizzaria agora tem um sistema profissional unificado!**

**⏱️ Tempo de configuração**: 5 minutos
**📊 Dados em tempo real**: A cada 3 segundos
**📱 Acesso**: Desktop, tablet e mobile
**🔄 Backup**: Automático no Google Drive

### 🍕 **Transforme sua pizzaria com dados inteligentes!**
