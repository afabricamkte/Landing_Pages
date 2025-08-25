import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Download, Palette, Settings } from 'lucide-react'
import html2canvas from 'html2canvas'
import sponsorshipData from './assets/dados_patrocinio.json'
import './App.css'

function App() {
  const [selectedTheme, setSelectedTheme] = useState('dark')
  const [showCustomization, setShowCustomization] = useState(false)
  const cardContainerRef = useRef(null)

  const themes = {
    dark: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      cardBg: 'rgba(255, 255, 255, 0.1)',
      textColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    purple: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardBg: 'rgba(255, 255, 255, 0.15)',
      textColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.3)'
    },
    elegant: {
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      cardBg: 'rgba(255, 255, 255, 0.1)',
      textColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.2)'
    }
  }

  const downloadImage = async () => {
    if (cardContainerRef.current) {
      try {
        const canvas = await html2canvas(cardContainerRef.current, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: cardContainerRef.current.scrollWidth,
          height: cardContainerRef.current.scrollHeight
        })
        
        const link = document.createElement('a')
        link.download = 'pacotes-patrocinio.png'
        link.href = canvas.toDataURL()
        link.click()
      } catch (error) {
        console.error('Erro ao gerar imagem:', error)
        alert('Erro ao gerar imagem. Tente novamente.')
      }
    }
  }

  const PackageCard = ({ pkg, theme }) => {
    return (
      <div 
        className="relative p-6 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        style={{
          background: pkg.gradient || theme.cardBg,
          borderColor: pkg.color || theme.borderColor,
          color: theme.textColor,
          minHeight: '500px',
          width: '280px'
        }}
      >
        {/* Ícone do pacote */}
        <div className="flex justify-center mb-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2"
            style={{ 
              backgroundColor: pkg.color,
              borderColor: theme.borderColor,
              color: 'white'
            }}
          >
            {pkg.icon}
          </div>
        </div>

        {/* Nome do pacote */}
        <h2 className="text-2xl font-bold text-center mb-6 tracking-wider">
          {pkg.name}
        </h2>

        {/* Lista de benefícios */}
        <div className="space-y-3 mb-8 flex-1">
          {pkg.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div 
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: pkg.color }}
              />
              <p className="text-sm leading-relaxed opacity-90">
                {benefit}
              </p>
            </div>
          ))}
        </div>

        {/* Preço */}
        <div className="text-center pt-4 border-t border-opacity-30" style={{ borderColor: theme.borderColor }}>
          <p className="text-3xl font-bold tracking-wider">
            {pkg.price}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerador de Pacotes de Patrocínio
              </h1>
              <p className="text-gray-600">
                A Fábrica Marketing e Eventos
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowCustomization(!showCustomization)}
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Personalizar</span>
              </Button>
              <Button
                onClick={downloadImage}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Imagem</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Panel */}
      {showCustomization && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Tema:</span>
              </div>
              <div className="flex space-x-2">
                {Object.keys(themes).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedTheme === theme
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="py-8">
        <div 
          ref={cardContainerRef}
          className="flex justify-center items-center min-h-[600px] p-8"
          style={{
            background: themes[selectedTheme].background,
            borderRadius: '0px'
          }}
        >
          <div className="flex flex-wrap justify-center gap-8 max-w-6xl">
            {sponsorshipData.packages.map((pkg) => (
              <PackageCard 
                key={pkg.id} 
                pkg={pkg} 
                theme={themes[selectedTheme]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Como usar</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">1. Personalizar</h4>
                <p className="text-sm text-gray-600">
                  Use o botão "Personalizar" para escolher diferentes temas visuais
                  que melhor se adequem à sua apresentação.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Baixar</h4>
                <p className="text-sm text-gray-600">
                  Clique em "Baixar Imagem" para salvar a imagem dos pacotes
                  em alta qualidade para usar em suas apresentações.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App

