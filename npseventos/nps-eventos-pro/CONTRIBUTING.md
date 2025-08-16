# 🤝 Guia de Contribuição - NPS Eventos Pro

Obrigado por considerar contribuir para o NPS Eventos Pro! Este documento fornece diretrizes para contribuições ao projeto.

## 📋 Índice

- [Como Contribuir](#como-contribuir)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Estrutura do Projeto](#estrutura-do-projeto)

## 🚀 Como Contribuir

### 1. Fork do Repositório
```bash
# Clone seu fork
git clone https://github.com/SEU_USUARIO/nps-eventos-pro.git
cd nps-eventos-pro

# Adicione o repositório original como upstream
git remote add upstream https://github.com/USUARIO_ORIGINAL/nps-eventos-pro.git
```

### 2. Crie uma Branch
```bash
# Crie uma branch para sua feature/correção
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 3. Faça suas Alterações
- Siga os padrões de código estabelecidos
- Adicione comentários quando necessário
- Teste suas alterações localmente

### 4. Commit suas Alterações
```bash
git add .
git commit -m "tipo: descrição breve da alteração

Descrição mais detalhada se necessário.

Fixes #123"
```

## 🐛 Reportando Bugs

Antes de reportar um bug, verifique se ele já não foi reportado nas [Issues](../../issues).

### Template para Bug Report
```markdown
**Descrição do Bug**
Uma descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role para baixo até '...'
4. Veja o erro

**Comportamento Esperado**
Uma descrição clara do que você esperava que acontecesse.

**Screenshots**
Se aplicável, adicione screenshots para ajudar a explicar o problema.

**Ambiente:**
- OS: [ex: Windows 10, macOS 11.0, Ubuntu 20.04]
- Navegador: [ex: Chrome 91, Firefox 89, Safari 14]
- Versão do Projeto: [ex: v1.0.0]

**Contexto Adicional**
Adicione qualquer outro contexto sobre o problema aqui.
```

## 💡 Sugerindo Melhorias

### Template para Feature Request
```markdown
**A sua feature request está relacionada a um problema? Descreva.**
Uma descrição clara e concisa do problema. Ex: Eu fico frustrado quando [...]

**Descreva a solução que você gostaria**
Uma descrição clara e concisa do que você quer que aconteça.

**Descreva alternativas que você considerou**
Uma descrição clara e concisa de qualquer solução ou feature alternativa que você considerou.

**Contexto Adicional**
Adicione qualquer outro contexto ou screenshots sobre a feature request aqui.
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Navegador moderno (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- Servidor web local (Python, Node.js, ou similar)
- Editor de código (VS Code recomendado)

### Configuração do Ambiente
```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/nps-eventos-pro.git
cd nps-eventos-pro

# Inicie um servidor local
python3 -m http.server 8080
# ou
npx serve .
# ou
php -S localhost:8080
```

### Testando Localmente
1. Abra `http://localhost:8080` no navegador
2. Teste a página inicial
3. Acesse `#/admin` e teste o login (senha: `admin123`)
4. Teste o quiz NPS
5. Verifique responsividade em diferentes tamanhos de tela

## 📝 Padrões de Código

### JavaScript
- Use ES6+ quando possível
- Prefira `const` e `let` ao invés de `var`
- Use arrow functions para callbacks simples
- Adicione comentários JSDoc para funções complexas
- Mantenha funções pequenas e focadas

```javascript
/**
 * Calcula o score NPS baseado nas respostas
 * @param {Array} responses - Array de respostas
 * @returns {number} Score NPS (-100 a 100)
 */
function calculateNPS(responses) {
    // Implementação...
}
```

### CSS
- Use classes semânticas
- Prefira CSS Grid e Flexbox
- Use variáveis CSS para cores e espaçamentos
- Mantenha especificidade baixa
- Organize por componentes

```css
/* Variáveis */
:root {
    --primary-color: #6366f1;
    --spacing-md: 1rem;
}

/* Componente */
.quiz-container {
    display: grid;
    gap: var(--spacing-md);
}
```

### HTML
- Use HTML5 semântico
- Adicione atributos de acessibilidade
- Mantenha estrutura limpa e organizada

```html
<section class="quiz-section" role="main" aria-labelledby="quiz-title">
    <h2 id="quiz-title">Pesquisa de Satisfação</h2>
    <!-- Conteúdo -->
</section>
```

## 🔄 Processo de Pull Request

### Antes de Submeter
- [ ] Código testado localmente
- [ ] Sem erros no console do navegador
- [ ] Funciona em diferentes navegadores
- [ ] Responsivo em diferentes tamanhos de tela
- [ ] Documentação atualizada se necessário

### Template de Pull Request
```markdown
## Descrição
Breve descrição das alterações realizadas.

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação (mudança apenas na documentação)

## Como Foi Testado?
Descreva os testes realizados para verificar suas mudanças.

## Screenshots (se aplicável)
Adicione screenshots das mudanças visuais.

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Realizei uma auto-revisão do meu código
- [ ] Comentei meu código, especialmente em áreas complexas
- [ ] Minhas mudanças não geram novos warnings
- [ ] Testei em diferentes navegadores
- [ ] Testei responsividade
```

## 📁 Estrutura do Projeto

```
nps-eventos-pro/
├── index.html              # Página principal
├── assets/
│   ├── css/
│   │   ├── main.css        # Estilos principais
│   │   ├── components.css  # Componentes
│   │   └── themes.css      # Temas e cores
│   ├── js/
│   │   ├── app.js          # Aplicação principal
│   │   ├── admin.js        # Área administrativa
│   │   ├── quiz.js         # Sistema de quiz
│   │   ├── reports.js      # Relatórios
│   │   └── utils.js        # Utilitários
│   └── fonts/
│       └── inter.woff2     # Fonte Inter
├── README.md               # Documentação principal
├── CONTRIBUTING.md         # Este arquivo
├── CHANGELOG.md            # Histórico de mudanças
└── .gitignore             # Arquivos ignorados pelo Git
```

### Responsabilidades dos Arquivos

#### JavaScript
- **app.js**: Lógica principal, roteamento, estado global
- **quiz.js**: Sistema de quiz, perguntas, validações
- **admin.js**: Área administrativa, CRUD de pesquisas
- **reports.js**: Geração de relatórios e estatísticas
- **utils.js**: Funções utilitárias reutilizáveis

#### CSS
- **main.css**: Reset, layout principal, componentes base
- **components.css**: Componentes específicos (botões, cards, etc.)
- **themes.css**: Cores, tipografia, variáveis CSS

## 🎯 Áreas que Precisam de Contribuição

### 🔴 Alta Prioridade
- [ ] Testes automatizados
- [ ] Acessibilidade (WCAG 2.1)
- [ ] Performance (Lighthouse 90+)
- [ ] Internacionalização (i18n)

### 🟡 Média Prioridade
- [ ] Novos tipos de pergunta
- [ ] Temas personalizáveis
- [ ] Integração com APIs externas
- [ ] PWA (Progressive Web App)

### 🟢 Baixa Prioridade
- [ ] Animações avançadas
- [ ] Dark/Light mode toggle
- [ ] Exportação para PDF
- [ ] Gamificação

## 📞 Suporte

### Canais de Comunicação
- **Issues**: Para bugs e feature requests
- **Discussions**: Para perguntas e discussões gerais
- **Email**: nps@eventos.pro (para questões sensíveis)

### Tempo de Resposta
- **Issues críticas**: 24 horas
- **Issues normais**: 3-5 dias úteis
- **Feature requests**: 1-2 semanas

## 📜 Código de Conduta

Este projeto adere ao [Contributor Covenant](https://www.contributor-covenant.org/). Ao participar, você deve seguir este código de conduta.

### Nossos Padrões

**Comportamentos que contribuem para um ambiente positivo:**
- Usar linguagem acolhedora e inclusiva
- Respeitar diferentes pontos de vista e experiências
- Aceitar críticas construtivas graciosamente
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros da comunidade

**Comportamentos inaceitáveis:**
- Uso de linguagem ou imagens sexualizadas
- Trolling, comentários insultuosos/depreciativos
- Assédio público ou privado
- Publicar informações privadas de outros sem permissão
- Outras condutas que poderiam ser consideradas inadequadas

## 🙏 Reconhecimentos

Agradecemos a todos os contribuidores que ajudam a tornar este projeto melhor!

### Como Ser Reconhecido
- Contribuições são automaticamente listadas no GitHub
- Contribuidores significativos são mencionados no README
- Releases incluem agradecimentos aos contribuidores

---

**Obrigado por contribuir para o NPS Eventos Pro! 🎉**

*Juntos, criamos uma ferramenta melhor para pesquisas de satisfação.*

