import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  DollarSign,
  Percent
} from 'lucide-react'

export function AdvancedCharts({ vendas, metricas }) {
  // Dados para gráfico de performance horária
  const performanceHoraria = [
    { hora: '08:00', pedidos: 2, faturamento: 89.80 },
    { hora: '09:00', pedidos: 1, faturamento: 45.90 },
    { hora: '10:00', pedidos: 3, faturamento: 134.70 },
    { hora: '11:00', pedidos: 5, faturamento: 229.50 },
    { hora: '12:00', pedidos: 8, faturamento: 367.20 },
    { hora: '13:00', pedidos: 6, faturamento: 275.40 },
    { hora: '14:00', pedidos: 4, faturamento: 183.60 },
    { hora: '15:00', pedidos: 2, faturamento: 91.80 },
    { hora: '16:00', pedidos: 3, faturamento: 137.70 },
    { hora: '17:00', pedidos: 4, faturamento: 183.60 },
    { hora: '18:00', pedidos: 7, faturamento: 321.30 },
    { hora: '19:00', pedidos: 12, faturamento: 550.80 },
    { hora: '20:00', pedidos: 15, faturamento: 688.50 },
    { hora: '21:00', pedidos: 10, faturamento: 458.00 },
    { hora: '22:00', pedidos: 6, faturamento: 275.40 },
    { hora: '23:00', pedidos: 3, faturamento: 137.70 }
  ]

  // Dados para gráfico de margem de lucro
  const margemLucro = [
    { categoria: 'Pizza Tradicional', margem: 62.5, meta: 60 },
    { categoria: 'Pizza Especial', margem: 58.2, meta: 55 },
    { categoria: 'Pizza Gourmet', margem: 54.8, meta: 50 },
    { categoria: 'Bebidas', margem: 75.0, meta: 70 },
    { categoria: 'Sobremesas', margem: 68.5, meta: 65 }
  ]

  // Dados para gráfico radial de metas
  const metasVendas = [
    { nome: 'Pedidos', atual: 87, meta: 100, cor: '#3B82F6' },
    { nome: 'Faturamento', atual: 92, meta: 100, cor: '#10B981' },
    { nome: 'Ticket Médio', atual: 78, meta: 100, cor: '#8B5CF6' },
    { nome: 'Satisfação', atual: 95, meta: 100, cor: '#F59E0B' }
  ]

  // Dados de comparação semanal
  const comparacaoSemanal = [
    { dia: 'Seg', semanaAtual: 12, semanaAnterior: 8 },
    { dia: 'Ter', semanaAtual: 15, semanaAnterior: 12 },
    { dia: 'Qua', semanaAtual: 18, semanaAnterior: 14 },
    { dia: 'Qui', semanaAtual: 22, semanaAnterior: 18 },
    { dia: 'Sex', semanaAtual: 28, semanaAnterior: 25 },
    { dia: 'Sáb', semanaAtual: 35, semanaAnterior: 32 },
    { dia: 'Dom', semanaAtual: 30, semanaAnterior: 28 }
  ]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('faturamento') || entry.name.includes('Faturamento') 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Performance por Horário */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Performance por Horário</span>
          </CardTitle>
          <CardDescription>Distribuição de pedidos e faturamento ao longo do dia</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={performanceHoraria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="pedidos" fill="#3B82F6" name="Pedidos" />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="faturamento" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Faturamento"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margem de Lucro por Categoria */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Percent className="h-5 w-5 text-green-600" />
              <span>Margem de Lucro</span>
            </CardTitle>
            <CardDescription>Margem atual vs meta por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={margemLucro} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="categoria" type="category" width={100} />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, name === 'margem' ? 'Atual' : 'Meta']}
                />
                <Bar dataKey="meta" fill="#E5E7EB" name="Meta" />
                <Bar dataKey="margem" fill="#10B981" name="Atual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Metas de Vendas - Gráfico Radial */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Metas do Mês</span>
            </CardTitle>
            <CardDescription>Progresso das metas mensais</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={metasVendas}>
                <RadialBar 
                  minAngle={15} 
                  label={{ position: 'insideStart', fill: '#fff' }} 
                  background 
                  clockWise 
                  dataKey="atual" 
                />
                <Legend 
                  iconSize={10} 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                />
                <Tooltip formatter={(value) => [`${value}%`, 'Progresso']} />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparação Semanal */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span>Comparação Semanal</span>
          </CardTitle>
          <CardDescription>Pedidos desta semana vs semana anterior</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={comparacaoSemanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="semanaAnterior" 
                stackId="1" 
                stroke="#94A3B8" 
                fill="#94A3B8" 
                fillOpacity={0.6}
                name="Semana Anterior"
              />
              <Area 
                type="monotone" 
                dataKey="semanaAtual" 
                stackId="2" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.8}
                name="Semana Atual"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Indicadores de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Eficiência Operacional</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-blue-400 text-blue-900">
                +2% vs ontem
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Tempo Médio Preparo</p>
                <p className="text-2xl font-bold">18min</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-green-400 text-green-900">
                -2min vs meta
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Taxa Conversão</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-purple-400 text-purple-900">
                +5% vs semana
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">ROI Marketing</p>
                <p className="text-2xl font-bold">340%</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-200" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-orange-400 text-orange-900">
                +15% vs mês
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
