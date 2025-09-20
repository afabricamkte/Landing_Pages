import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { formatarMoeda, formatarPorcentagem } from '../lib/data';

const Dashboard = ({ dados }) => {
  const { ingredientes = [], receitas = [], custosOperacionais, precificacao = [] } = dados;

  // Calcular estatísticas
  const stats = {
    totalIngredientes: ingredientes.length,
    ingredientesAtivos: ingredientes.filter(ing => ing.ativo).length,
    totalReceitas: receitas.length,
    receitasAtivas: receitas.filter(rec => rec.ativa).length,
    custoMedioIngredientes: ingredientes.length > 0 
      ? ingredientes.reduce((acc, ing) => acc + ing.precoAtual, 0) / ingredientes.length 
      : 0,
    receitaMaisCara: receitas.length > 0 
      ? Math.max(...receitas.flatMap(rec => 
          Object.values(rec.tamanhos).map(t => t.custoTotal)
        ))
      : 0,
    receitaMaisBarata: receitas.length > 0 
      ? Math.min(...receitas.flatMap(rec => 
          Object.values(rec.tamanhos).map(t => t.custoTotal).filter(c => c > 0)
        ))
      : 0
  };

  // Alertas do sistema
  const alertas = [];
  
  // Verificar ingredientes sem preço
  const ingredientesSemPreco = ingredientes.filter(ing => ing.precoAtual === 0);
  if (ingredientesSemPreco.length > 0) {
    alertas.push({
      tipo: 'warning',
      titulo: 'Ingredientes sem preço',
      descricao: `${ingredientesSemPreco.length} ingrediente(s) sem preço definido`,
      acao: 'Atualizar preços na aba Ingredientes'
    });
  }

  // Verificar receitas sem ingredientes
  const receitasVazias = receitas.filter(rec => 
    Object.values(rec.tamanhos).every(t => !t.ingredientes || t.ingredientes.length === 0)
  );
  if (receitasVazias.length > 0) {
    alertas.push({
      tipo: 'warning',
      titulo: 'Receitas sem ingredientes',
      descricao: `${receitasVazias.length} receita(s) sem ingredientes definidos`,
      acao: 'Configurar receitas na aba Receitas'
    });
  }

  // Verificar custos operacionais
  if (!custosOperacionais) {
    alertas.push({
      tipo: 'error',
      titulo: 'Custos operacionais não configurados',
      descricao: 'Configure os custos para precificação precisa',
      acao: 'Definir custos na aba Custos Operacionais'
    });
  }

  // Ingredientes por categoria
  const ingredientesPorCategoria = ingredientes.reduce((acc, ing) => {
    acc[ing.categoria] = (acc[ing.categoria] || 0) + 1;
    return acc;
  }, {});

  // Receitas por categoria
  const receitasPorCategoria = receitas.reduce((acc, rec) => {
    acc[rec.categoria] = (acc[rec.categoria] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Visão geral do sistema de precificação</p>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            Alertas do Sistema
          </h3>
          <div className="grid gap-3">
            {alertas.map((alerta, index) => (
              <Card key={index} className={`border-l-4 ${
                alerta.tipo === 'error' ? 'border-l-red-500 bg-red-50' : 'border-l-amber-500 bg-amber-50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{alerta.titulo}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                      <p className="text-xs text-gray-500 mt-2">{alerta.acao}</p>
                    </div>
                    {alerta.tipo === 'error' ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingredientes</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIngredientes}</div>
            <p className="text-xs opacity-80">
              {stats.ingredientesAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
            <Calculator className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReceitas}</div>
            <p className="text-xs opacity-80">
              {stats.receitasAtivas} ativas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio Ingredientes</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(stats.custoMedioIngredientes)}</div>
            <p className="text-xs opacity-80">por ingrediente</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faixa de Custos</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatarMoeda(stats.receitaMaisBarata)} - {formatarMoeda(stats.receitaMaisCara)}
            </div>
            <p className="text-xs opacity-80">receitas</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuições */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredientes por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-500" />
              Ingredientes por Categoria
            </CardTitle>
            <CardDescription>
              Distribuição dos {stats.totalIngredientes} ingredientes cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(ingredientesPorCategoria).map(([categoria, quantidade]) => {
              const porcentagem = (quantidade / stats.totalIngredientes) * 100;
              return (
                <div key={categoria} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{categoria}</span>
                    <Badge variant="outline">{quantidade}</Badge>
                  </div>
                  <Progress value={porcentagem} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Receitas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-green-500" />
              Receitas por Categoria
            </CardTitle>
            <CardDescription>
              Distribuição das {stats.totalReceitas} receitas cadastradas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(receitasPorCategoria).map(([categoria, quantidade]) => {
              const porcentagem = (quantidade / stats.totalReceitas) * 100;
              return (
                <div key={categoria} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{categoria}</span>
                    <Badge variant="outline">{quantidade}</Badge>
                  </div>
                  <Progress value={porcentagem} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-500" />
            Status do Sistema
          </CardTitle>
          <CardDescription>
            Verificação da configuração do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              {stats.totalIngredientes > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              <div>
                <p className="font-medium">Ingredientes</p>
                <p className="text-sm text-gray-600">
                  {stats.totalIngredientes > 0 ? 'Configurado' : 'Pendente'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {stats.totalReceitas > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              <div>
                <p className="font-medium">Receitas</p>
                <p className="text-sm text-gray-600">
                  {stats.totalReceitas > 0 ? 'Configurado' : 'Pendente'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {custosOperacionais ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              <div>
                <p className="font-medium">Custos Operacionais</p>
                <p className="text-sm text-gray-600">
                  {custosOperacionais ? 'Configurado' : 'Pendente'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
