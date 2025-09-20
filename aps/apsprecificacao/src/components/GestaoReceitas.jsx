import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calculator, Search, Filter, ChefHat, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import { 
  criarReceita, 
  CATEGORIAS_RECEITAS, 
  TAMANHOS_PIZZA,
  calcularCustoIngredientes,
  formatarMoeda,
  formatarData
} from '../lib/data';

const GestaoReceitas = ({ receitas, ingredientes, onAtualizarReceitas }) => {
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [receitaEditando, setReceitaEditando] = useState(null);
  const [dialogAberto, setDialogAberto] = useState(false);

  // Filtrar receitas
  const receitasFiltradas = receitas.filter(rec => {
    const matchNome = rec.nome.toLowerCase().includes(filtro.toLowerCase());
    const matchCategoria = categoriaFiltro === 'todos' || rec.categoria === categoriaFiltro;
    return matchNome && matchCategoria;
  });

  const handleSalvarReceita = (dadosReceita) => {
    if (receitaEditando) {
      // Editar receita existente
      const receitasAtualizadas = receitas.map(rec => 
        rec.id === receitaEditando.id 
          ? { 
              ...rec, 
              ...dadosReceita,
              dataAtualizacao: new Date().toISOString()
            }
          : rec
      );
      onAtualizarReceitas(receitasAtualizadas);
    } else {
      // Criar nova receita
      const novaReceita = criarReceita(dadosReceita);
      onAtualizarReceitas([...receitas, novaReceita]);
    }
    
    setReceitaEditando(null);
    setDialogAberto(false);
  };

  const handleExcluirReceita = (id) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      const receitasAtualizadas = receitas.filter(rec => rec.id !== id);
      onAtualizarReceitas(receitasAtualizadas);
    }
  };

  const handleDuplicarReceita = (receita) => {
    const receitaDuplicada = criarReceita({
      ...receita,
      nome: `${receita.nome} (Cópia)`,
      id: undefined // Forçar criação de novo ID
    });
    onAtualizarReceitas([...receitas, receitaDuplicada]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Receitas</h2>
          <p className="text-gray-600">Crie e gerencie receitas com composição detalhada</p>
        </div>
        <Button 
          onClick={() => {
            setReceitaEditando(null);
            setDialogAberto(true);
          }}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar receitas..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as categorias</SelectItem>
                  {CATEGORIAS_RECEITAS.map(cat => (
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

      {/* Lista de Receitas */}
      <div className="grid gap-6">
        {receitasFiltradas.map(receita => (
          <ReceitaCard
            key={receita.id}
            receita={receita}
            ingredientes={ingredientes}
            onEditar={() => {
              setReceitaEditando(receita);
              setDialogAberto(true);
            }}
            onExcluir={() => handleExcluirReceita(receita.id)}
            onDuplicar={() => handleDuplicarReceita(receita)}
          />
        ))}
        
        {receitasFiltradas.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma receita encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {filtro || categoriaFiltro !== 'todos' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira receita'
                }
              </p>
              {!filtro && categoriaFiltro === 'todos' && (
                <Button 
                  onClick={() => {
                    setReceitaEditando(null);
                    setDialogAberto(true);
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Receita
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Edição/Criação */}
      <FormularioReceita
        receita={receitaEditando}
        ingredientes={ingredientes}
        aberto={dialogAberto}
        onFechar={() => setDialogAberto(false)}
        onSalvar={handleSalvarReceita}
      />
    </div>
  );
};

// Componente do card de receita
const ReceitaCard = ({ receita, ingredientes, onEditar, onExcluir, onDuplicar }) => {
  const custosPorTamanho = Object.entries(receita.tamanhos).map(([tamanho, dados]) => ({
    tamanho,
    custo: calcularCustoIngredientes(dados.ingredientes || [], ingredientes),
    ingredientes: dados.ingredientes || []
  }));

  const custoMedio = custosPorTamanho.reduce((acc, item) => acc + item.custo, 0) / custosPorTamanho.length;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-xl">{receita.nome}</CardTitle>
              <Badge variant="outline" className="capitalize">
                {receita.categoria}
              </Badge>
              <Badge variant={receita.ativa ? 'default' : 'secondary'}>
                {receita.ativa ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            {receita.descricao && (
              <CardDescription className="mt-2">
                {receita.descricao}
              </CardDescription>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onDuplicar}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onEditar}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExcluir}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Custos por Tamanho */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Custos por Tamanho
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {custosPorTamanho.map(({ tamanho, custo, ingredientes }) => (
                <div key={tamanho} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-600">
                    {TAMANHOS_PIZZA[tamanho]?.nome} ({TAMANHOS_PIZZA[tamanho]?.diametro})
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatarMoeda(custo)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {ingredientes.length} ingrediente(s)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo de Ingredientes */}
          <div>
            <h4 className="font-semibold mb-3">Ingredientes Principais</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(
                Object.values(receita.tamanhos)
                  .flatMap(t => t.ingredientes || [])
                  .map(ing => ing.ingredienteId)
              )).slice(0, 8).map(ingredienteId => {
                const ingrediente = ingredientes.find(ing => ing.id === ingredienteId);
                return ingrediente ? (
                  <Badge key={ingredienteId} variant="secondary" className="text-xs">
                    {ingrediente.nome}
                  </Badge>
                ) : null;
              })}
              {Object.values(receita.tamanhos)
                .flatMap(t => t.ingredientes || [])
                .length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{Object.values(receita.tamanhos)
                    .flatMap(t => t.ingredientes || [])
                    .length - 8} mais
                </Badge>
              )}
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t">
            <span>Custo médio: {formatarMoeda(custoMedio)}</span>
            <span>Atualizada em: {formatarData(receita.dataAtualizacao)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente do formulário de receita
const FormularioReceita = ({ receita, ingredientes, aberto, onFechar, onSalvar }) => {
  const [dados, setDados] = useState({
    nome: '',
    categoria: 'tradicional',
    descricao: '',
    tamanhos: {
      P: { ingredientes: [] },
      M: { ingredientes: [] },
      G: { ingredientes: [] },
      GG: { ingredientes: [] }
    },
    ativa: true
  });

  const [tamanhoAtivo, setTamanhoAtivo] = useState('M');

  // Atualizar dados quando receita muda
  useEffect(() => {
    if (receita) {
      setDados(receita);
    } else {
      setDados({
        nome: '',
        categoria: 'tradicional',
        descricao: '',
        tamanhos: {
          P: { ingredientes: [] },
          M: { ingredientes: [] },
          G: { ingredientes: [] },
          GG: { ingredientes: [] }
        },
        ativa: true
      });
    }
  }, [receita]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calcular custos para cada tamanho
    const dadosComCustos = {
      ...dados,
      tamanhos: Object.fromEntries(
        Object.entries(dados.tamanhos).map(([tamanho, dadosTamanho]) => [
          tamanho,
          {
            ...dadosTamanho,
            custoTotal: calcularCustoIngredientes(dadosTamanho.ingredientes || [], ingredientes)
          }
        ])
      )
    };
    
    onSalvar(dadosComCustos);
  };

  const adicionarIngrediente = (tamanho) => {
    setDados(prev => ({
      ...prev,
      tamanhos: {
        ...prev.tamanhos,
        [tamanho]: {
          ...prev.tamanhos[tamanho],
          ingredientes: [
            ...(prev.tamanhos[tamanho].ingredientes || []),
            { ingredienteId: '', quantidade: 0 }
          ]
        }
      }
    }));
  };

  const removerIngrediente = (tamanho, index) => {
    setDados(prev => ({
      ...prev,
      tamanhos: {
        ...prev.tamanhos,
        [tamanho]: {
          ...prev.tamanhos[tamanho],
          ingredientes: prev.tamanhos[tamanho].ingredientes.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const atualizarIngrediente = (tamanho, index, campo, valor) => {
    setDados(prev => ({
      ...prev,
      tamanhos: {
        ...prev.tamanhos,
        [tamanho]: {
          ...prev.tamanhos[tamanho],
          ingredientes: prev.tamanhos[tamanho].ingredientes.map((ing, i) => 
            i === index ? { ...ing, [campo]: valor } : ing
          )
        }
      }
    }));
  };

  const copiarComposicao = (tamanhoOrigem, tamanhoDestino) => {
    if (confirm(`Copiar composição do tamanho ${TAMANHOS_PIZZA[tamanhoOrigem].nome} para ${TAMANHOS_PIZZA[tamanhoDestino].nome}?`)) {
      setDados(prev => ({
        ...prev,
        tamanhos: {
          ...prev.tamanhos,
          [tamanhoDestino]: {
            ...prev.tamanhos[tamanhoDestino],
            ingredientes: [...(prev.tamanhos[tamanhoOrigem].ingredientes || [])]
          }
        }
      }));
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {receita ? 'Editar Receita' : 'Nova Receita'}
          </DialogTitle>
          <DialogDescription>
            {receita 
              ? 'Edite as informações da receita' 
              : 'Crie uma nova receita definindo ingredientes por tamanho'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Receita *</Label>
              <Input
                id="nome"
                value={dados.nome}
                onChange={(e) => setDados(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Pizza Margherita"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={dados.categoria} 
                onValueChange={(value) => setDados(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_RECEITAS.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={dados.descricao}
              onChange={(e) => setDados(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição da receita (opcional)"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativa"
              checked={dados.ativa}
              onCheckedChange={(checked) => setDados(prev => ({ ...prev, ativa: checked }))}
            />
            <Label htmlFor="ativa">Receita ativa</Label>
          </div>

          <Separator />

          {/* Composição por Tamanho */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Composição por Tamanho</h3>
            
            <Tabs value={tamanhoAtivo} onValueChange={setTamanhoAtivo}>
              <TabsList className="grid w-full grid-cols-4">
                {Object.entries(TAMANHOS_PIZZA).map(([tamanho, info]) => (
                  <TabsTrigger key={tamanho} value={tamanho} className="text-sm">
                    {info.nome}
                    <br />
                    <span className="text-xs opacity-70">({info.diametro})</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(TAMANHOS_PIZZA).map(([tamanho, info]) => (
                <TabsContent key={tamanho} value={tamanho} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">
                      Ingredientes - {info.nome} ({info.diametro})
                    </h4>
                    <div className="flex space-x-2">
                      {Object.keys(TAMANHOS_PIZZA)
                        .filter(t => t !== tamanho)
                        .map(outroTamanho => (
                          <Button
                            key={outroTamanho}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => copiarComposicao(outroTamanho, tamanho)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar {TAMANHOS_PIZZA[outroTamanho].nome}
                          </Button>
                        ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => adicionarIngrediente(tamanho)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(dados.tamanhos[tamanho].ingredientes || []).map((ingredienteItem, index) => {
                      const ingrediente = ingredientes.find(ing => ing.id === ingredienteItem.ingredienteId);
                      const custoItem = ingrediente ? ingrediente.precoAtual * ingredienteItem.quantidade : 0;
                      
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Select
                              value={ingredienteItem.ingredienteId}
                              onValueChange={(value) => atualizarIngrediente(tamanho, index, 'ingredienteId', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o ingrediente" />
                              </SelectTrigger>
                              <SelectContent>
                                {ingredientes
                                  .filter(ing => ing.ativo)
                                  .map(ing => (
                                    <SelectItem key={ing.id} value={ing.id}>
                                      {ing.nome} ({ing.unidade}) - {formatarMoeda(ing.precoAtual)}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="w-32">
                            <Input
                              type="number"
                              step="0.001"
                              min="0"
                              value={ingredienteItem.quantidade}
                              onChange={(e) => atualizarIngrediente(tamanho, index, 'quantidade', parseFloat(e.target.value) || 0)}
                              placeholder="Qtd"
                            />
                          </div>
                          
                          <div className="w-24 text-sm font-mono text-right">
                            {formatarMoeda(custoItem)}
                          </div>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removerIngrediente(tamanho, index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                    
                    {(!dados.tamanhos[tamanho].ingredientes || dados.tamanhos[tamanho].ingredientes.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhum ingrediente adicionado</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarIngrediente(tamanho)}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Primeiro Ingrediente
                        </Button>
                      </div>
                    )}
                    
                    {dados.tamanhos[tamanho].ingredientes && dados.tamanhos[tamanho].ingredientes.length > 0 && (
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="font-medium">Custo Total:</span>
                        <span className="text-lg font-bold">
                          {formatarMoeda(calcularCustoIngredientes(dados.tamanhos[tamanho].ingredientes, ingredientes))}
                        </span>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit">
              {receita ? 'Salvar Alterações' : 'Criar Receita'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GestaoReceitas;
