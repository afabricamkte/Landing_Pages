import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Bell,
  Package,
  TrendingDown,
  Clock,
  DollarSign
} from 'lucide-react'

export function AlertSystem({ insumos, metricas, vendas }) {
  const [alerts, setAlerts] = useState([])
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())

  useEffect(() => {
    const newAlerts = []

    // Alertas de estoque crítico
    if (insumos && insumos.length > 0) {
      const estoquesCriticos = insumos.filter(item => item.status === 'critico')
      estoquesCriticos.forEach(item => {
        newAlerts.push({
          id: `estoque-${item.item}`,
          type: 'critical',
          icon: AlertTriangle,
          title: 'Estoque Crítico',
          message: `${item.item} está no nível mínimo (${item.atual}/${item.minimo})`,
          action: 'Reabastecer',
          timestamp: new Date()
        })
      })
    }

    // Alertas de performance
    if (metricas) {
      // Queda no ticket médio
      if (metricas.ticketMedio < 40) {
        newAlerts.push({
          id: 'ticket-baixo',
          type: 'warning',
          icon: TrendingDown,
          title: 'Ticket Médio Baixo',
          message: `Ticket médio atual: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.ticketMedio)}`,
          action: 'Analisar',
          timestamp: new Date()
        })
      }

      // Crescimento negativo
      if (metricas.crescimentoPedidos < -10) {
        newAlerts.push({
          id: 'crescimento-negativo',
          type: 'critical',
          icon: TrendingDown,
          title: 'Queda nas Vendas',
          message: `Pedidos caíram ${Math.abs(metricas.crescimentoPedidos)}% vs ontem`,
          action: 'Investigar',
          timestamp: new Date()
        })
      }
    }

    // Alertas de horário de pico
    const horaAtual = new Date().getHours()
    if (horaAtual >= 18 && horaAtual <= 21) {
      newAlerts.push({
        id: 'horario-pico',
        type: 'info',
        icon: Clock,
        title: 'Horário de Pico',
        message: 'Período de maior movimento. Monitore os tempos de preparo.',
        action: 'Monitorar',
        timestamp: new Date()
      })
    }

    // Alertas de meta
    if (metricas && metricas.faturamentoHoje > 1000) {
      newAlerts.push({
        id: 'meta-atingida',
        type: 'success',
        icon: CheckCircle,
        title: 'Meta Diária Atingida',
        message: `Faturamento de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.faturamentoHoje)} superou a meta!`,
        action: 'Celebrar',
        timestamp: new Date()
      })
    }

    // Filtrar alertas já dispensados
    const filteredAlerts = newAlerts.filter(alert => !dismissedAlerts.has(alert.id))
    setAlerts(filteredAlerts)
  }, [insumos, metricas, vendas, dismissedAlerts])

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  const getAlertVariant = (type) => {
    switch (type) {
      case 'critical': return 'destructive'
      case 'warning': return 'default'
      case 'success': return 'default'
      case 'info': return 'default'
      default: return 'default'
    }
  }

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'warning': return 'border-yellow-500 bg-yellow-50'
      case 'success': return 'border-green-500 bg-green-50'
      case 'info': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      case 'success': return 'text-green-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  if (alerts.length === 0) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Sistema de Alertas</span>
          </CardTitle>
          <CardDescription>Tudo funcionando normalmente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-gray-500">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p className="font-medium">Nenhum alerta ativo</p>
              <p className="text-sm">Sua pizzaria está operando sem problemas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <span>Sistema de Alertas</span>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <span>{alerts.length}</span>
            <span>ativo{alerts.length !== 1 ? 's' : ''}</span>
          </Badge>
        </CardTitle>
        <CardDescription>Monitoramento automático de indicadores críticos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => {
          const IconComponent = alert.icon
          return (
            <Alert key={alert.id} className={`${getAlertColor(alert.type)} border-l-4`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <IconComponent className={`h-5 w-5 mt-0.5 ${getIconColor(alert.type)}`} />
                  <div className="flex-1">
                    <AlertTitle className="text-sm font-semibold">
                      {alert.title}
                    </AlertTitle>
                    <AlertDescription className="text-sm mt-1">
                      {alert.message}
                    </AlertDescription>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs"
                      >
                        {alert.action}
                      </Button>
                      <span className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="h-6 w-6 p-0 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          )
        })}
      </CardContent>
    </Card>
  )
}

// Componente de notificações toast
export function NotificationToast({ notification, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 5000) // Auto dismiss após 5 segundos

    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!notification) return null

  const getToastColor = (type) => {
    switch (type) {
      case 'critical': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      case 'success': return 'bg-green-500'
      case 'info': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${getToastColor(notification.type)} text-white p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <notification.icon className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">{notification.title}</p>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
