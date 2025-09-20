# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o APS Sistema de Precificação! Este documento fornece diretrizes para contribuições.

## 📋 Código de Conduta

Este projeto adere ao [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você deve seguir este código.

## 🚀 Como Contribuir

### Reportando Bugs

Antes de reportar um bug, verifique se ele já não foi reportado nas [issues existentes](https://github.com/seu-usuario/aps-sistema-precificacao/issues).

**Para reportar um bug:**
1. Use o template de bug report
2. Inclua passos para reproduzir
3. Descreva o comportamento esperado vs atual
4. Inclua screenshots se aplicável
5. Mencione versão do navegador e SO

### Sugerindo Melhorias

**Para sugerir uma melhoria:**
1. Use o template de feature request
2. Explique o problema que a funcionalidade resolveria
3. Descreva a solução proposta
4. Considere alternativas
5. Adicione mockups se aplicável

### Pull Requests

1. **Fork** o repositório
2. **Crie** uma branch a partir da `main`
3. **Faça** suas alterações
4. **Teste** suas alterações
5. **Commit** seguindo as convenções
6. **Push** para sua branch
7. **Abra** um Pull Request

## 🏗️ Configuração do Ambiente

### Pré-requisitos
- Node.js 14+ ou Python 3.7+
- Navegador moderno
- Editor de código (VS Code recomendado)

### Setup Local
```bash
# Clone seu fork
git clone https://github.com/seu-usuario/aps-sistema-precificacao.git
cd aps-sistema-precificacao

# Inicie servidor local
python3 -m http.server 8080
# ou
npx http-server -p 8080

# Acesse http://localhost:8080
```

## 📝 Padrões de Código

### JavaScript
- Use ES6+ features
- Siga o padrão de nomenclatura camelCase
- Documente funções complexas
- Use const/let ao invés de var
- Mantenha funções pequenas e focadas

### CSS
- Use classes semânticas
- Siga metodologia BEM quando aplicável
- Mantenha especificidade baixa
- Use variáveis CSS para cores e espaçamentos
- Organize por componentes

### HTML
- Use HTML5 semântico
- Mantenha acessibilidade (ARIA labels)
- Valide markup
- Use indentação consistente

## 🧪 Testes

### Executando Testes
```bash
# Abra test.html no navegador
# Execute todos os testes
# Verifique se passaram
```

### Adicionando Testes
- Teste novas funcionalidades
- Mantenha cobertura alta
- Use dados de exemplo
- Teste em múltiplos navegadores

## 📦 Estrutura de Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(escopo): descrição

[corpo opcional]

[rodapé opcional]
```

### Tipos
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

### Exemplos
```bash
feat(ingredientes): adiciona validação de preços
fix(dashboard): corrige cálculo de margem
docs(readme): atualiza instruções de instalação
```

## 🏷️ Versionamento

Seguimos [Semantic Versioning](https://semver.org/):
- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções compatíveis

## 📁 Estrutura de Arquivos

```
src/
├── styles.css          # Estilos principais
├── config.js           # Configurações
├── utils.js            # Utilitários
├── api.js              # API Google Sheets
├── components.js       # Componentes UI
├── app.js              # Aplicação principal
└── google-config.js    # Configuração Google
```

## 🎯 Áreas de Contribuição

### 🔧 Desenvolvimento
- Novas funcionalidades
- Correções de bugs
- Melhorias de performance
- Refatoração de código

### 📖 Documentação
- Guias de uso
- Tutoriais
- Exemplos
- Traduções

### 🎨 Design
- Melhorias de UI/UX
- Responsividade
- Acessibilidade
- Temas

### 🧪 Testes
- Testes unitários
- Testes de integração
- Testes de usabilidade
- Automação

## 🏆 Reconhecimento

Contribuidores são reconhecidos:
- Lista de contribuidores no README
- Menção em releases
- Badge de contribuidor
- Convite para equipe (contribuições significativas)

## ❓ Dúvidas

Tem dúvidas? Entre em contato:
- 📧 Email: seu-email@exemplo.com
- 💬 Discord: [Servidor da Comunidade](https://discord.gg/seu-servidor)
- 📱 WhatsApp: [Grupo de Desenvolvedores](https://wa.me/seu-numero)

## 📚 Recursos Úteis

- [Documentação JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Chart.js Docs](https://www.chartjs.org/docs/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

**Obrigado por contribuir! 🙏**
