import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, Filter, BarChart3, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  CANAIS_VENDA,
  CATEGORIAS_INGREDIENTES,
  formatarMoeda,
  formatarPorcentagem
} from '../lib/data';

const HistoricoAnalisesSimple = ({ dados }) => {
  const { ingredientes = [], receitas = [], precificacao = [] } = dados;
  const [periodoFiltro, setPeriodoFiltro] = useState('30');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');

  // Calcular data limite baseada no filtro
  const dataLimite = useMemo(() => {
    const hoje = new Date();
    const dias = parseInt(periodoFiltro);
    return new Date(hoje.getTime() - (dias * 24 * 60 * 60 * 1000));
  }, [periodoFiltro]);

  // Filtrar dados por período
  const ingredientesFiltrados = useMemo(() => {
    return ingredientes.filter(ing => {
      const dataAtualizacao = new Date(ing.dataAtualizacao);
      const matchPeriodo = dataAtualizacao >= dataLimite;
      const matchCategoria = categoriaFiltro === 'todos' || ing.categoria === categoriaFiltro;
      return matchPeriodo && matchCategoria;
    });
  }, [ingredientes, dataLimite, categoriaFiltro]);

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const precoMedioIngredientes = ingredientesFiltrados.length > 0 
      ? ingredientesFiltrados.reduce((acc, ing) => acc + ing.precoAtual, 0) / ingredientesFiltrados.length 
      : 0;

    const custoMedioReceitas = receitas.length > 0
      ? receitas.reduce((acc, rec) => {
          const custos = Object.values(rec.tamanhos).map(t => t.custoTotal || 0);
          const custoMedio = custos.reduce((a, b) => a + b, 0) / custos.length;
          return acc + custoMedio;
        }, 0) / receitas.length
      : 0;

    const totalCalculosPrecificacao = precificacao.length;

    return {
      precoMedioIngredientes,
      custoMedioReceitas,
      totalCalculosPrecificacao
    };
  }, [ingredientesFiltrados, receitas, precificacao]);

  // Análise por categoria
  const dadosCategoriasIngredientes = useMemo(() => {
    const distribuicao = {};
    ingredientesFiltrados.forEach(ing => {
      distribuicao[ing.categoria] = (distribuicao[ing.categoria] || 0) + 1;
    });

    return Object.entries(distribuicao).map(([categoria, quantidade]) => ({
      categoria: categoria.charAt(0).toUpperCase() + categoria.slice(1),
      quantidade,
      valor: ingredientesFiltrados
        .filter(ing => ing.categoria === categoria)
        .reduce((acc, ing) => acc + ing.precoAtual, 0)
    }));
  }, [ingredientesFiltrados]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Histórico e Análises</h2>
          <p className="text-gray-600">Acompanhe a evolução dos custos e análises de precificação</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
              <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as categorias</SelectItem>
                  {CATEGORIAS_INGREDIENTES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Preço Médio Ingredientes</p>
                <p className="text-2xl font-bold">{formatarMoeda(estatisticas.precoMedioIngredientes)}</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Custo Médio Receitas</p>
                <p className="text-2xl font-bold">{formatarMoeda(estatisticas.custoMedioReceitas)}</p>
              </div>
              <Activity className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Ingredientes Filtrados</p>
                <p className="text-2xl font-bold">{ingredientesFiltrados.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Cálculos Realizados</p>
                <p className="text-2xl font-bold">{estatisticas.totalCalculosPrecificacao}</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análises Simples */}
      <Tabs defaultValue="categorias" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
        </TabsList>

        {/* Análise por Categorias */}
        <TabsContent value="categorias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
              <CardDescription>
                Quantidade e valor total dos ingredientes por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dadosCategoriasIngredientes.length > 0 ? (
                <div className="space-y-4">
                  {dadosCategoriasIngredientes.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{item.categoria}</h4>
                        <p className="text-sm text-gray-600">{item.quantidade} ingredientes</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatarMoeda(item.valor)}</p>
                        <p className="text-sm text-gray-600">Valor total</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum dado de categoria disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lista de Ingredientes */}
        <TabsContent value="ingredientes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ingredientes ({ingredientesFiltrados.length})</CardTitle>
              <CardDescription>
                Lista dos ingredientes no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ingredientesFiltrados.length > 0 ? (
                <div className="space-y-2">
                  {ingredientesFiltrados.slice(0, 10).map((ing, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{ing.nome}</h4>
                        <p className="text-sm text-gray-600 capitalize">{ing.categoria}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatarMoeda(ing.precoAtual)}</p>
                        <p className="text-sm text-gray-600">{ing.unidade}</p>
                      </div>
                    </div>
                  ))}
                  {ingredientesFiltrados.length > 10 && (
                    <p className="text-center text-gray-500 py-4">
                      ... e mais {ingredientesFiltrados.length - 10} ingredientes
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum ingrediente encontrado no período</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lista de Receitas */}
        <TabsContent value="receitas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receitas ({receitas.length})</CardTitle>
              <CardDescription>
                Lista das receitas cadastradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {receitas.length > 0 ? (
                <div className="space-y-2">
                  {receitas.map((rec, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{rec.nome}</h4>
                        <p className="text-sm text-gray-600 capitalize">{rec.categoria}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={rec.ativa ? "default" : "secondary"}>
                          {rec.ativa ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma receita cadastrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HistoricoAnalisesSimple;
