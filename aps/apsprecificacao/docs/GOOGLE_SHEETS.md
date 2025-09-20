# Estrutura do Google Sheets para Sistema de Precificação de Pizzarias

## Instruções para Configuração

### 1. Criar nova planilha no Google Sheets
- Acesse [sheets.google.com](https://sheets.google.com)
- Crie uma nova planilha
- Renomeie para "Sistema Precificação Pizzaria"

### 2. Criar as seguintes abas:

#### Aba 1: INGREDIENTES
Colunas:
- A: ID_Ingrediente (Texto)
- B: Nome (Texto)
- C: Categoria (Lista)
- D: Unidade_Compra (Lista)
- E: Quantidade_Compra (Número)
- F: Preco_Compra (Moeda)
- G: Rendimento_Liquido (Percentual)
- H: Custo_Unidade_Padrao (Fórmula)
- I: Fornecedor (Texto)
- J: Data_Atualizacao (Data)
- K: Estoque_Minimo (Número)
- L: Historico_Preco (Texto)

#### Aba 2: RECEITAS_BASE
Colunas:
- A: ID_Receita_Base (Texto)
- B: Tipo (Lista)
- C: Nome (Texto)
- D: Rendimento_Unidades (Número)
- E: Tamanho_Aplicavel (Lista)

#### Aba 3: PIZZAS_CARDAPIO
Colunas:
- A: ID_Pizza (Texto)
- B: Nome_Pizza (Texto)
- C: Categoria (Lista)
- D: ID_Massa (Referência)
- E: ID_Molho (Referência)
- F: Custo_Recheios (Fórmula)
- G: Popularidade (Número)

#### Aba 4: CUSTOS_FIXOS
Colunas:
- A: Categoria (Texto)
- B: Valor_Mensal (Moeda)
- C: Rateio_Por (Texto)

#### Aba 5: CUSTOS_VARIAVEIS
Colunas:
- A: Item (Texto)
- B: Tipo (Texto)
- C: P (Moeda)
- D: M (Moeda)
- E: G (Moeda)
- F: GG (Moeda)

#### Aba 6: IMPOSTOS_TAXAS
Colunas:
- A: Canal_Venda (Texto)
- B: Imposto_% (Percentual)
- C: Taxa_Cartao_% (Percentual)
- D: Taxa_App_% (Percentual)
- E: Entrega (Moeda)

#### Aba 7: RECHEIOS
Colunas:
- A: ID_Pizza (Texto)
- B: ID_Ingrediente (Texto)
- C: Quantidade_P (Número)
- D: Quantidade_M (Número)
- E: Quantidade_G (Número)
- F: Quantidade_GG (Número)

#### Aba 8: PARAMETROS
Colunas:
- A: Parametro (Texto)
- B: Valor (Variado)

#### Aba 9: PRECOS_FINAIS
Colunas:
- A: ID_Pizza (Texto)
- B: Nome_Pizza (Texto)
- C: Custo_Total_P (Moeda)
- D: Custo_Total_M (Moeda)
- E: Custo_Total_G (Moeda)
- F: Custo_Total_GG (Moeda)
- G: Preco_P (Moeda)
- H: Preco_M (Moeda)
- I: Preco_G (Moeda)
- J: Preco_GG (Moeda)

#### Aba 10: DASHBOARD
Para relatórios e análises

### 3. Configurar Validações de Dados

#### Para Categoria (Ingredientes):
- Queijos, Carnes, Vegetais, Molhos, Massas, Temperos

#### Para Unidade_Compra:
- kg, g, L, ml, unidade

#### Para Tipo (Receitas Base):
- Massa, Molho

#### Para Categoria (Pizzas):
- Tradicional, Especial, Premium, Doce

#### Para Tamanho_Aplicavel:
- P, M, G, GG, Todos

### 4. Dados Iniciais para Teste

#### INGREDIENTES (dados de exemplo):
```
ING001 | Farinha Tipo 1 | Massas | kg | 1 | 4.00 | 98% | =F2/(E2*1000*G2) | Fornecedor A | =TODAY() | 10 | 
ING002 | Mussarela | Queijos | kg | 1 | 45.00 | 95% | =F3/(E3*1000*G3) | Fornecedor B | =TODAY() | 5 |
ING003 | Molho Tomate | Molhos | L | 1 | 8.00 | 100% | =F4/(E4*1000*G4) | Fornecedor C | =TODAY() | 3 |
```

#### CUSTOS_FIXOS:
```
Aluguel | 4000 | Pizza
Salários | 8000 | Pizza
Energia | 500 | Pizza
```

#### CUSTOS_VARIAVEIS:
```
Embalagem pizza | Unidade | 1.20 | 1.50 | 1.80 | 2.20
Gás (por pizza) | Energia | 0.80 | 1.00 | 1.20 | 1.50
```

#### IMPOSTOS_TAXAS:
```
Balcão | 8% | 2.5% | 0% | 0
iFood | 8% | 0% | 23% | 0
```

#### PARAMETROS:
```
Vendas_Mensais_Previstas | 3120
Margem_Lucro_Desejada | 35%
```

### 5. Fórmulas Principais

#### Custo_Unidade_Padrao (Coluna H em INGREDIENTES):
```
=F2/(E2*1000*G2)
```

#### Custo_Recheios (Coluna F em PIZZAS_CARDAPIO):
```
=SUMPRODUCT((RECHEIOS!A:A=A2)*(RECHEIOS!D:D)*(VLOOKUP(RECHEIOS!B:B,INGREDIENTES!A:H,8,0)))
```

### 6. Configurar Permissões
- Compartilhar planilha com permissão de edição
- Anotar o ID da planilha (encontrado na URL)
- Habilitar Google Sheets API no Google Cloud Console

### 7. Próximos Passos
Após criar esta estrutura, o sistema web será desenvolvido para interagir com esta planilha via API.
