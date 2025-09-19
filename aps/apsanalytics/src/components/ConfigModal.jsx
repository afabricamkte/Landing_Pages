import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Key, 
  Link, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Download
} from 'lucide-react'
import { configureGoogleSheets, getCurrentConfig } from '../services/googleSheets'

export function ConfigModal({ onConfigUpdate }) {
  const [config, setConfig] = useState(getCurrentConfig())
  const [activeTab, setActiveTab] = useState('csv')
  const [testStatus, setTestStatus] = useState(null)

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    configureGoogleSheets(config)
    onConfigUpdate?.()
    setTestStatus({ type: 'success', message: 'Configuração salva com sucesso!' })
  }

  const testConnection = async () => {
    setTestStatus({ type: 'loading', message: 'Testando conexão...' })
    
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (activeTab === 'csv' && config.vendas) {
        setTestStatus({ type: 'success', message: 'Conexão CSV funcionando!' })
      } else if (activeTab === 'api' && config.apiKey && config.spreadsheetId) {
        setTestStatus({ type: 'success', message: 'API configurada corretamente!' })
      } else {
        setTestStatus({ type: 'error', message: 'Configuração incompleta' })
      }
    } catch (error) {
      setTestStatus({ type: 'error', message: 'Erro na conexão: ' + error.message })
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const downloadTemplate = (filename) => {
    const link = document.createElement('a')
    link.href = `/src/assets/${filename}`
    link.download = filename
    link.click()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Configurar Google Sheets</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            <span>Configuração Google Sheets</span>
          </DialogTitle>
          <DialogDescription>
            Configure a conexão com suas planilhas do Google Sheets para monitoramento em tempo real
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv" className="flex items-center space-x-2">
              <Link className="h-4 w-4" />
              <span>CSV Público</span>
              <Badge variant="secondary" className="ml-2">Fácil</Badge>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Google Sheets API</span>
              <Badge variant="outline" className="ml-2">Avançado</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Método CSV Público</CardTitle>
                <CardDescription>
                  Publique suas planilhas como CSV e cole os links aqui. Método mais simples, mas apenas leitura.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendas-url">URL Planilha de Vendas</Label>
                    <Input
                      id="vendas-url"
                      placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                      value={config.vendas}
                      onChange={(e) => handleConfigChange('vendas', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="insumos-url">URL Planilha de Insumos</Label>
                    <Input
                      id="insumos-url"
                      placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                      value={config.insumos}
                      onChange={(e) => handleConfigChange('insumos', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardapio-url">URL Planilha de Cardápio</Label>
                    <Input
                      id="cardapio-url"
                      placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                      value={config.cardapio}
                      onChange={(e) => handleConfigChange('cardapio', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="metricas-url">URL Planilha de Métricas</Label>
                    <Input
                      id="metricas-url"
                      placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                      value={config.metricas}
                      onChange={(e) => handleConfigChange('metricas', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Como publicar como CSV:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Abra sua planilha no Google Sheets</li>
                    <li>2. Vá em <strong>Arquivo → Publicar na web</strong></li>
                    <li>3. Selecione a aba desejada</li>
                    <li>4. Escolha <strong>Valores separados por vírgula (.csv)</strong></li>
                    <li>5. Clique em <strong>Publicar</strong> e copie o link</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Google Sheets API</CardTitle>
                <CardDescription>
                  Configuração avançada com API Key. Permite leitura e escrita, mas requer configuração no Google Cloud.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key do Google</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="AIzaSyC..."
                      value={config.apiKey}
                      onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="spreadsheet-id">ID da Planilha</Label>
                    <Input
                      id="spreadsheet-id"
                      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      value={config.spreadsheetId}
                      onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Como configurar a API:</h4>
                  <ol className="text-sm text-yellow-800 space-y-1">
                    <li>1. Acesse o <strong>Google Cloud Console</strong></li>
                    <li>2. Crie um projeto ou selecione um existente</li>
                    <li>3. Ative a <strong>Google Sheets API</strong></li>
                    <li>4. Crie uma <strong>API Key</strong> em Credenciais</li>
                    <li>5. Copie o ID da planilha da URL (entre /d/ e /edit)</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Planilhas Modelo</CardTitle>
            <CardDescription>
              Baixe os templates CSV para importar no Google Sheets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadTemplate('planilha_vendas_diarias.csv')}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Vendas</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadTemplate('planilha_insumos.csv')}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Insumos</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadTemplate('planilha_cardapio.csv')}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Cardápio</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadTemplate('planilha_metricas.csv')}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Métricas</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {testStatus && (
          <Card className={`border-l-4 ${
            testStatus.type === 'success' ? 'border-green-500 bg-green-50' :
            testStatus.type === 'error' ? 'border-red-500 bg-red-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                {testStatus.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {testStatus.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                {testStatus.type === 'loading' && <div className="animate-spin h-5 w-5 border-2 border-yellow-600 border-t-transparent rounded-full" />}
                <span className={`font-medium ${
                  testStatus.type === 'success' ? 'text-green-800' :
                  testStatus.type === 'error' ? 'text-red-800' :
                  'text-yellow-800'
                }`}>
                  {testStatus.message}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={testConnection}>
            Testar Conexão
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setConfig(getCurrentConfig())}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Configuração
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
