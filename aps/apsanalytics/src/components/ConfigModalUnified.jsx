import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Settings, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  Loader2
} from 'lucide-react'
import { 
  saveConfig, 
  loadConfig, 
  extractSpreadsheetId, 
  testConnection,
  validateConfig 
} from '../services/googleSheetsUnified'

export function ConfigModalUnified({ onConfigUpdate }) {
  const [open, setOpen] = useState(false)
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('')
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [activeTab, setActiveTab] = useState('config')

  useEffect(() => {
    loadConfig()
  }, [])

  const handleUrlChange = (url) => {
    setSpreadsheetUrl(url)
    const id = extractSpreadsheetId(url)
    setSpreadsheetId(id || '')
    setTestResult(null)
  }

  const handleTest = async () => {
    if (!spreadsheetId) {
      setTestResult({ success: false, message: 'Por favor, insira uma URL válida' })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const result = await testConnection(spreadsheetId)
      setTestResult(result)
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `Erro no teste: ${error.message}` 
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = () => {
    if (!spreadsheetId) {
      setTestResult({ success: false, message: 'Por favor, configure uma planilha válida' })
      return
    }

    try {
      validateConfig(spreadsheetId)
      
      saveConfig({
        spreadsheetId,
        spreadsheetUrl,
        configuredAt: new Date().toISOString()
      })

      setTestResult({ success: true, message: 'Configuração salva com sucesso!' })
      
      // Atualizar dados no dashboard
      if (onConfigUpdate) {
        setTimeout(() => {
          onConfigUpdate()
        }, 1000)
      }

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setOpen(false)
      }, 2000)
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `Erro ao salvar: ${error.message}` 
      })
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const exampleUrl = "https://docs.google.com/spreadsheets/d/1ABC123DEF456/edit#gid=0"
  const exampleCsvUrl = "https://docs.google.com/spreadsheets/d/1ABC123DEF456/gviz/tq?tqx=out:csv&sheet=Vendas"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Configurar Google Sheets</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            <span>Configuração Google Sheets - Planilha Unificada</span>
          </DialogTitle>
          <DialogDescription>
            Configure a conexão com sua planilha do Google Sheets contendo todas as abas necessárias
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="instructions">Instruções</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Planilha Unificada</CardTitle>
                <CardDescription>
                  Uma única planilha com 4 abas: Vendas, Insumos, Cardapio e Metricas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spreadsheet-url">URL da Planilha do Google Sheets</Label>
                  <Input
                    id="spreadsheet-url"
                    placeholder={exampleUrl}
                    value={spreadsheetUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Cole a URL completa da sua planilha do Google Sheets
                  </p>
                </div>

                {spreadsheetId && (
                  <div className="space-y-2">
                    <Label>ID Extraído da Planilha</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={spreadsheetId}
                        readOnly
                        className="font-mono text-sm bg-gray-50"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(spreadsheetId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleTest} 
                    disabled={!spreadsheetId || testing}
                    variant="outline"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleSave} 
                    disabled={!spreadsheetId}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Salvar Configuração
                  </Button>
                </div>

                {testResult && (
                  <Alert className={testResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                      {testResult.message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Como Configurar sua Planilha</CardTitle>
                <CardDescription>Siga estes passos para configurar corretamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline" className="mt-1">1</Badge>
                    <div>
                      <p className="font-semibold">Crie uma nova planilha no Google Sheets</p>
                      <p className="text-sm text-gray-600">Acesse sheets.google.com e crie uma nova planilha</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Badge variant="outline" className="mt-1">2</Badge>
                    <div>
                      <p className="font-semibold">Crie 4 abas com os nomes exatos:</p>
                      <div className="mt-2 space-y-1">
                        <Badge variant="secondary">Vendas</Badge>
                        <Badge variant="secondary">Insumos</Badge>
                        <Badge variant="secondary">Cardapio</Badge>
                        <Badge variant="secondary">Metricas</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Badge variant="outline" className="mt-1">3</Badge>
                    <div>
                      <p className="font-semibold">Importe os dados do template</p>
                      <p className="text-sm text-gray-600">Use o template fornecido na aba "Template"</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Badge variant="outline" className="mt-1">4</Badge>
                    <div>
                      <p className="font-semibold">Torne a planilha pública</p>
                      <p className="text-sm text-gray-600">Compartilhar → Alterar para "Qualquer pessoa com o link"</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Badge variant="outline" className="mt-1">5</Badge>
                    <div>
                      <p className="font-semibold">Copie a URL da planilha</p>
                      <p className="text-sm text-gray-600">Cole na configuração acima</p>
                    </div>
                  </div>
                </div>

                <Alert className="border-blue-500 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Importante:</strong> Os nomes das abas devem ser exatamente: Vendas, Insumos, Cardapio, Metricas
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template da Planilha</CardTitle>
                <CardDescription>Baixe o template completo com dados de exemplo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span>Aba: Vendas</span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      Registre todos os pedidos com data, produto, valor, canal, etc.
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Colunas: Data, Hora, Produto, Quantidade, Valor_Total, Canal, Status
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                      <span>Aba: Insumos</span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      Controle de estoque com quantidades atuais e mínimas
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Colunas: Item, Quantidade_Atual, Quantidade_Minima, Custo_Unitario
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                      <span>Aba: Cardapio</span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      Produtos, preços, custos e margens de lucro
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Colunas: Produto, Categoria, Preco, Custo, Ativo
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <FileSpreadsheet className="h-4 w-4 text-orange-600" />
                      <span>Aba: Metricas</span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      KPIs e indicadores de performance calculados
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Colunas: Data, Pedidos_Total, Faturamento_Total, Ticket_Medio
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center space-y-2">
                    <Download className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Template completo disponível nos arquivos do projeto
                    </p>
                    <p className="text-xs text-gray-500">
                      Arquivo: Planilha_Pizzaria_Completa.csv
                    </p>
                  </div>
                </div>

                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    O template inclui dados de exemplo para você começar imediatamente!
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
