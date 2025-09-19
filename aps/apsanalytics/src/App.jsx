import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Pizza, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Clock,
  AlertTriangle,
  Smartphone,
  Store,
  Truck
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { ConfigModalUnified } from './components/ConfigModalUnified'
import { AdvancedCharts } from './components/AdvancedCharts'
import { AlertSystem, NotificationToast } from './components/AlertSystem'
import { 
  fetchAllData, 
  processVendasData, 
  processCanaisData, 
  processProdutosData, 
  processEstoqueData, 
  calculateMetrics 
} from './services/googleSheetsUnified'
import './App.css'

function App() {
  const [vendas, setVendas] = useState([])
  const [metricas, setMetricas] = useState([])
  const [insumos, setInsumos] = useState([])
  const [cardapio, setCardapio] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [notification, setNotification] = useState(null)

  // Dados mock para demonstração (serão substituídos pela conexão real)
  const mockVendas = [
    { data: '2024-09-19', pedidos: 10, faturamento: 459.80 },
    { data: '2024-09-20', pedidos: 15, faturamento: 687.50 },
    { data: '2024-09-21', pedidos: 12, faturamento: 548.90 },
    { data: '2024-09-22', pedidos: 18, faturamento: 825.60 }
  ]

  const mockCanais = [
    { nome: 'iFood', pedidos: 6, cor: '#EA1D2C' },
    { nome: 'WhatsApp', pedidos: 5, cor: '#25D366' },
    { nome: 'Balcão', pedidos: 3, cor: '#8B5CF6' },
    { nome: '99Food', pedidos: 2, cor: '#FFD700' },
    { nome: 'Rappi', pedidos: 1, cor: '#FF6B35' }
  ]

  const mockProdutos = [
    { produto: 'Pizza Margherita', vendas: 8 },
    { produto: 'Pizza Calabresa', vendas: 6 },
    { produto: 'Pizza Portuguesa', vendas: 5 },
    { produto: 'Pizza Frango Catupiry', vendas: 4 },
    { produto: 'Pizza Quatro Queijos', vendas: 3 }
  ]

  const mockEstoque = [
    { item: 'Queijo Mussarela', atual: 8, minimo: 5, status: 'ok' },
    { item: 'Farinha de Trigo', atual: 25, minimo: 10, status: 'ok' },
    { item: 'Champignon', atual: 2, minimo: 2, status: 'critico' },
    { item: 'Azeitona', atual: 1, minimo: 1, status: 'critico' },
    { item: 'Calabresa', atual: 6, minimo: 3, status: 'ok' }
  ]

  // Função para buscar dados do Google Sheets
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Tentar buscar dados do Google Sheets
      const data = await fetchAllData()
      
      if (data.vendas && data.vendas.length > 0) {
        // Processar dados reais do Google Sheets
        const vendasProcessadas = processVendasData(data.vendas)
        const canaisProcessados = processCanaisData(data.vendas)
        const produtosProcessados = processProdutosData(data.vendas)
        const estoqueProcessado = processEstoqueData(data.insumos)
        const metricasCalculadas = calculateMetrics(data.vendas)
        
        setVendas(vendasProcessadas)
        setMetricas(metricasCalculadas)
        setInsumos(estoqueProcessado)
        
        // Atualizar dados dos gráficos
        mockCanais.splice(0, mockCanais.length, ...canaisProcessados)
        mockProdutos.splice(0, mockProdutos.length, ...produtosProcessados)
        mockEstoque.splice(0, mockEstoque.length, ...estoqueProcessado)
      } else {
        // Usar dados mock se não conseguir conectar
        setVendas(mockVendas)
        setMetricas({
          pedidosHoje: 15,
          faturamentoHoje: 687.50,
          ticketMedio: 45.83,
          crescimentoPedidos: 50.0,
          crescimentoFaturamento: 49.5
        })
        setInsumos(mockEstoque)
      }
      
      setLastUpdate(new Date())
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      
      // Fallback para dados mock em caso de erro
      setVendas(mockVendas)
      setMetricas({
        pedidosHoje: 15,
        faturamentoHoje: 687.50,
        ticketMedio: 45.83,
        crescimentoPedidos: 50.0,
        crescimentoFaturamento: 49.5
      })
      setInsumos(mockEstoque)
      
      setLastUpdate(new Date())
      setLoading(false)
    }
  }

  // Atualização automática a cada 3 segundos
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-3 rounded-full">
              <Pizza className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Pizzaria</h1>
              <p className="text-gray-600">Monitoramento em tempo real</p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div>
              <p className="text-sm text-gray-500">Última atualização</p>
              <p className="font-semibold text-gray-700">{formatTime(lastUpdate)}</p>
              <Badge variant={loading ? "destructive" : "default"} className="mt-1">
                {loading ? 'Atualizando...' : 'Online'}
              </Badge>
            </div>
            <ConfigModalUnified onConfigUpdate={fetchData} />
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metricas.pedidosHoje || 0}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{metricas.crescimentoPedidos || 0}% vs ontem
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(metricas.faturamentoHoje || 0)}
              </div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{metricas.crescimentoFaturamento || 0}% vs ontem
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(metricas.ticketMedio || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Por pedido
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">Ativo</div>
              <p className="text-xs text-gray-500 mt-1">
                Atualização automática
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendas por Dia */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart className="h-5 w-5 text-blue-600" />
                <span>Vendas por Dia</span>
              </CardTitle>
              <CardDescription>Pedidos e faturamento dos últimos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={vendas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'faturamento' ? formatCurrency(value) : value,
                      name === 'faturamento' ? 'Faturamento' : 'Pedidos'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="faturamento" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3}
                  />
                  <Bar dataKey="pedidos" fill="#3B82F6" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Canais de Venda */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                <span>Canais de Venda</span>
              </CardTitle>
              <CardDescription>Distribuição de pedidos por canal</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockCanais}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, pedidos }) => `${nome}: ${pedidos}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="pedidos"
                  >
                    {mockCanais.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Produtos Mais Vendidos e Estoque */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produtos Mais Vendidos */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pizza className="h-5 w-5 text-orange-600" />
                <span>Produtos Mais Vendidos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProdutos.map((produto, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{produto.produto}</span>
                    <div className="flex items-center space-x-2">
                      <div className="bg-orange-100 px-2 py-1 rounded text-sm font-semibold text-orange-700">
                        {produto.vendas} vendas
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Controle de Estoque */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="h-5 w-5 text-red-600" />
                <span>Controle de Estoque</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEstoque.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{item.item}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {item.atual}/{item.minimo}
                      </span>
                      <Badge 
                        variant={item.status === 'critico' ? 'destructive' : 'default'}
                        className="flex items-center space-x-1"
                      >
                        {item.status === 'critico' && <AlertTriangle className="h-3 w-3" />}
                        <span>{item.status === 'critico' ? 'Crítico' : 'OK'}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sistema de Alertas */}
        <AlertSystem insumos={insumos} metricas={metricas} vendas={vendas} />

        {/* Gráficos Avançados */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Análises Avançadas</h2>
            <Badge variant="outline" className="text-sm">
              Métricas Detalhadas
            </Badge>
          </div>
          <AdvancedCharts vendas={vendas} metricas={metricas} />
        </div>

        {/* Footer */}
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>🍕 Dashboard Pizzaria v1.0</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Conectado ao Google Sheets</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData}
                disabled={loading}
              >
                {loading ? 'Atualizando...' : 'Atualizar Agora'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notificação Toast */}
      <NotificationToast 
        notification={notification} 
        onDismiss={() => setNotification(null)} 
      />
    </div>
  )
}

export default App
