# Gerador de Pacotes de Patrocínio

Uma aplicação web moderna para criar e personalizar imagens de pacotes de patrocínio para eventos corporativos.

## 🚀 Funcionalidades

- **Visualização Interativa**: 4 pacotes de patrocínio com diferentes níveis de preço
- **Temas Personalizáveis**: 3 temas visuais (Dark, Purple, Elegant)
- **Download de Imagem**: Exportação em alta qualidade para apresentações
- **Design Responsivo**: Funciona em desktop e mobile
- **Interface Moderna**: UI/UX profissional com Tailwind CSS

## 📦 Pacotes Disponíveis

- **STARTER** (R$ 5.000) - Nível básico
- **GROWTH** (R$ 10.000) - Nível intermediário  
- **SCALE** (R$ 15.000) - Nível avançado
- **PRO** (R$ 25.000) - Nível premium

## 🛠️ Tecnologias

- React 19
- Vite
- Tailwind CSS
- shadcn/ui
- html2canvas
- Lucide Icons

## 🚀 Como usar localmente

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd patrocinio-generator
```

2. Instale as dependências:
```bash
pnpm install
```

3. Execute em modo desenvolvimento:
```bash
pnpm run dev
```

4. Acesse: `http://localhost:5173`

## 📦 Build para produção

```bash
pnpm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

## 🌐 Deploy

### GitHub Pages
1. Faça push do código para GitHub
2. Vá em Settings > Pages
3. Configure source como "GitHub Actions"
4. Use o workflow fornecido

### Vercel
1. Conecte seu repositório GitHub ao Vercel
2. Deploy automático a cada push

### Netlify
1. Conecte seu repositório GitHub ao Netlify
2. Configure build command: `pnpm run build`
3. Configure publish directory: `dist`

## 📄 Licença

Este projeto foi desenvolvido pela A Fábrica Marketing e Eventos.

## 🤝 Contribuição

Para contribuir com o projeto, faça um fork e envie um pull request.

