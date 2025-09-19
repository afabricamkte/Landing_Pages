import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Clock,
  Calculator,
  FileText,
  Download,
  Upload
} from 'lucide-react'
import './App.css'

function App() {
  const [kpiData, setKpiData] = useState({
    ticketMedio: 45.50,
    cmv: 32.5,
    custoAlimentos: 30.2,
    custoMaoObra: 28.5,
    margemLucroBruto: 67.5,
    rotacaoMesas: 3.2,
    nps: 8.5,
    crescimento: 12.3
  })

  const [financialData, setFinancialData] = useState({
    receita: 125000,
    custos: 87500,
    lucroLiquido: 37500,
    liquidezCorrente: 1.8,
    endividamento: 35.2
  })

  const [taxData, setTaxData] = useState({
    regime: 'Simples Nacional',
    aliquota: 6.5,
    impostosMes: 8125,
    iss: 2500,
    icms: 3200,
    pis: 812,
    cofins: 3750,
    inss: 2100
  })

  const chartData = [
    { mes: 'Jan', receita: 98000, custos: 68600, lucro: 29400 },
    { mes: 'Fev', receita: 105000, custos: 73500, lucro: 31500 },
    { mes: 'Mar', receita: 112000, custos: 78400, lucro: 33600 },
    { mes: 'Abr', receita: 118000, custos: 82600, lucro: 35400 },
    { mes: 'Mai', receita: 125000, custos: 87500, lucro: 37500 },
  ]

  const kpiChartData = [
    { nome: 'CMV', valor: kpiData.cmv, meta: 30, status: kpiData.cmv <= 30 ? 'good' : 'warning' },
    { nome: 'Custo Alimentos', valor: kpiData.custoAlimentos, meta: 32, status: kpiData.custoAlimentos <= 32 ? 'good' : 'warning' },
    { nome: 'Custo Mão de Obra', valor: kpiData.custoMaoObra, meta: 30, status: kpiData.custoMaoObra <= 30 ? 'good' : 'warning' },
    { nome: 'Margem Bruta', valor: kpiData.margemLucroBruto, meta: 65, status: kpiData.margemLucroBruto >= 65 ? 'good' : 'warning' }
  ]

  const impostosPieData = [
    { name: 'ISS', value: taxData.iss, color: '#8884d8' },
    { name: 'ICMS', value: taxData.icms, color: '#82ca9d' },
    { name: 'PIS', value: taxData.pis, color: '#ffc658' },
    { name: 'COFINS', value: taxData.cofins, color: '#ff7300' },
    { name: 'INSS', value: taxData.inss, color: '#00ff88' }
  ]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'danger': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const exportData = () => {
    const data = {
      kpis: kpiData,
      financeiro: financialData,
      impostos: taxData,
      historico: chartData
    }
    
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `analise_financeira_pizzaria_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🍕 Análise Financeira - Pizzaria Pro
              </h1>
              <p className="text-lg text-gray-600">
                Dashboard completo para análise da saúde financeira da sua pizzaria
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Importar Dados
              </Button>
              <Button onClick={exportData} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar Relatório
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="kpis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="kpis">KPIs Principais</TabsTrigger>
            <TabsTrigger value="financeiro">Saúde Financeira</TabsTrigger>
            <TabsTrigger value="impostos">Impostos & Fiscal</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* KPIs Tab */}
          <TabsContent value="kpis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(kpiData.ticketMedio)}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline w-3 h-3 mr-1" />
                    +2.5% vs mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CMV</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(kpiData.cmv)}</div>
                  <p className="text-xs text-muted-foreground">
                    Meta: ≤ 30%
                    <Badge variant={kpiData.cmv <= 30 ? "default" : "destructive"} className="ml-2">
                      {kpiData.cmv <= 30 ? "✓" : "!"}
                    </Badge>
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rotação de Mesas</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.rotacaoMesas}x</div>
                  <p className="text-xs text-muted-foreground">
                    Por período de pico
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">NPS</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.nps}/10</div>
                  <p className="text-xs text-muted-foreground">
                    Satisfação dos clientes
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance dos KPIs vs Metas</CardTitle>
                  <CardDescription>Comparação com benchmarks do setor</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={kpiChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="valor" fill="#8884d8" />
                      <Bar dataKey="meta" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indicadores de Custo</CardTitle>
                  <CardDescription>Distribuição dos principais custos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Custo dos Alimentos</span>
                      <span className="text-sm">{formatPercentage(kpiData.custoAlimentos)}</span>
                    </div>
                    <Progress value={kpiData.custoAlimentos} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Custo de Mão de Obra</span>
                      <span className="text-sm">{formatPercentage(kpiData.custoMaoObra)}</span>
                    </div>
                    <Progress value={kpiData.custoMaoObra} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Margem de Lucro Bruto</span>
                      <span className="text-sm">{formatPercentage(kpiData.margemLucroBruto)}</span>
                    </div>
                    <Progress value={kpiData.margemLucroBruto} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Health Tab */}
          <TabsContent value="financeiro" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Receita Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(financialData.receita)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <TrendingUp className="inline w-4 h-4 mr-1" />
                    +{formatPercentage(kpiData.crescimento)} vs mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lucro Líquido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(financialData.lucroLiquido)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Margem: {formatPercentage((financialData.lucroLiquido / financialData.receita) * 100)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Liquidez Corrente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {financialData.liquidezCorrente}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Capacidade de pagamento
                    <Badge variant={financialData.liquidezCorrente >= 1.5 ? "default" : "destructive"} className="ml-2">
                      {financialData.liquidezCorrente >= 1.5 ? "Saudável" : "Atenção"}
                    </Badge>
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Evolução Financeira - Últimos 5 Meses</CardTitle>
                <CardDescription>Receita, custos e lucro ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="receita" stroke="#8884d8" strokeWidth={3} />
                    <Line type="monotone" dataKey="custos" stroke="#82ca9d" strokeWidth={3} />
                    <Line type="monotone" dataKey="lucro" stroke="#ffc658" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Tab */}
          <TabsContent value="impostos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Regime Tributário</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {taxData.regime}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Alíquota atual: {formatPercentage(taxData.aliquota)}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    Anexo I - Comércio
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impostos do Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {formatCurrency(taxData.impostosMes)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatPercentage((taxData.impostosMes / financialData.receita) * 100)} da receita
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximo Vencimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-orange-600 mb-2">
                    DAS - 20/06/2025
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Valor estimado: {formatCurrency(taxData.impostosMes)}
                  </p>
                  <Badge variant="destructive" className="mt-2">
                    Vence em 15 dias
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição dos Impostos</CardTitle>
                  <CardDescription>Composição dos tributos mensais</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={impostosPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {impostosPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento dos Impostos</CardTitle>
                  <CardDescription>Valores individuais por tributo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {impostosPieData.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="relatorios" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Disponíveis</CardTitle>
                  <CardDescription>Gere relatórios detalhados para análise</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Relatório de KPIs Mensal
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Análise de Custos Detalhada
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Demonstrativo Fiscal
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Fluxo de Caixa Projetado
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo Executivo</CardTitle>
                  <CardDescription>Principais insights do período</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Pontos Positivos</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Crescimento de {formatPercentage(kpiData.crescimento)} na receita</li>
                      <li>• Margem de lucro bruto acima da meta ({formatPercentage(kpiData.margemLucroBruto)})</li>
                      <li>• Liquidez corrente saudável ({financialData.liquidezCorrente})</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Pontos de Atenção</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• CMV ligeiramente acima da meta ({formatPercentage(kpiData.cmv)})</li>
                      <li>• Custo de mão de obra próximo do limite</li>
                      <li>• Vencimento do DAS em 15 dias</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
