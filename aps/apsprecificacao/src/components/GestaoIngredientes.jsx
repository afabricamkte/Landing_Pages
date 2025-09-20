import { useState } from 'react';
import { Plus, Edit, Trash2, History, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { 
  criarIngrediente, 
  UNIDADES_MEDIDA, 
  CATEGORIAS_INGREDIENTES, 
  TAMANHOS_PIZZA,
  formatarMoeda,
  formatarData
} from '../lib/data';

const GestaoIngredientes = ({ ingredientes, onAtualizarIngredientes }) => {
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [ingredienteEditando, setIngredienteEditando] = useState(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [ingredienteHistorico, setIngredienteHistorico] = useState(null);

  // Filtrar ingredientes
  const ingredientesFiltrados = ingredientes.filter(ing => {
    const matchNome = ing.nome.toLowerCase().includes(filtro.toLowerCase());
    const matchCategoria = categoriaFiltro === 'todos' || ing.categoria === categoriaFiltro;
    return matchNome && matchCategoria;
  });

  const handleSalvarIngrediente = (dadosIngrediente) => {
    if (ingredienteEditando) {
      // Editar ingrediente existente
      const ingredientesAtualizados = ingredientes.map(ing => 
        ing.id === ingredienteEditando.id 
          ? { 
              ...ing, 
              ...dadosIngrediente,
              dataAtualizacao: new Date().toISOString(),
              // Adicionar ao histórico se o preço mudou
              historico: ing.precoAtual !== dadosIngrediente.precoAtual 
                ? [
                    ...ing.historico,
                    {
                      data: new Date().toISOString(),
                      preco: dadosIngrediente.precoAtual,
                      fornecedor: dadosIngrediente.fornecedor,
                      observacoes: 'Atualização manual'
                    }
                  ]
                : ing.historico
            }
          : ing
      );
      onAtualizarIngredientes(ingredientesAtualizados);
    } else {
      // Criar novo ingrediente
      const novoIngrediente = criarIngrediente({
        ...dadosIngrediente,
        historico: [{
          data: new Date().toISOString(),
          preco: dadosIngrediente.precoAtual,
          fornecedor: dadosIngrediente.fornecedor,
          observacoes: 'Cadastro inicial'
        }]
      });
      onAtualizarIngredientes([...ingredientes, novoIngrediente]);
    }
    
    setIngredienteEditando(null);
    setDialogAberto(false);
  };

  const handleExcluirIngrediente = (id) => {
    if (confirm('Tem certeza que deseja excluir este ingrediente?')) {
      const ingredientesAtualizados = ingredientes.filter(ing => ing.id !== id);
      onAtualizarIngredientes(ingredientesAtualizados);
    }
  };

  const handleVerHistorico = (ingrediente) => {
    setIngredienteHistorico(ingrediente);
    setHistoricoAberto(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Ingredientes</h2>
          <p className="text-gray-600">Cadastre e gerencie ingredientes com histórico de preços</p>
        </div>
        <Button 
          onClick={() => {
            setIngredienteEditando(null);
            setDialogAberto(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Ingrediente
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
                  placeholder="Buscar ingredientes..."
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

      {/* Lista de Ingredientes */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredientes Cadastrados ({ingredientesFiltrados.length})</CardTitle>
          <CardDescription>
            Gerencie seus ingredientes e acompanhe o histórico de preços
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço Atual</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredientesFiltrados.map(ingrediente => (
                <TableRow key={ingrediente.id}>
                  <TableCell className="font-medium">{ingrediente.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {ingrediente.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatarMoeda(ingrediente.precoAtual)}
                  </TableCell>
                  <TableCell>{ingrediente.unidade}</TableCell>
                  <TableCell>{ingrediente.fornecedor || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={ingrediente.ativo ? 'default' : 'secondary'}>
                      {ingrediente.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerHistorico(ingrediente)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIngredienteEditando(ingrediente);
                          setDialogAberto(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExcluirIngrediente(ingrediente.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Edição/Criação */}
      <FormularioIngrediente
        ingrediente={ingredienteEditando}
        aberto={dialogAberto}
        onFechar={() => setDialogAberto(false)}
        onSalvar={handleSalvarIngrediente}
      />

      {/* Dialog de Histórico */}
      <HistoricoPrecos
        ingrediente={ingredienteHistorico}
        aberto={historicoAberto}
        onFechar={() => setHistoricoAberto(false)}
      />
    </div>
  );
};

// Componente do formulário de ingrediente
const FormularioIngrediente = ({ ingrediente, aberto, onFechar, onSalvar }) => {
  const [dados, setDados] = useState({
    nome: '',
    categoria: 'outros',
    unidade: 'kg',
    precoAtual: 0,
    fornecedor: '',
    quantidadePadrao: { P: 0, M: 0, G: 0, GG: 0 },
    ativo: true
  });

  // Atualizar dados quando ingrediente muda
  useState(() => {
    if (ingrediente) {
      setDados(ingrediente);
    } else {
      setDados({
        nome: '',
        categoria: 'outros',
        unidade: 'kg',
        precoAtual: 0,
        fornecedor: '',
        quantidadePadrao: { P: 0, M: 0, G: 0, GG: 0 },
        ativo: true
      });
    }
  }, [ingrediente]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar(dados);
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {ingrediente ? 'Editar Ingrediente' : 'Novo Ingrediente'}
          </DialogTitle>
          <DialogDescription>
            {ingrediente 
              ? 'Edite as informações do ingrediente' 
              : 'Cadastre um novo ingrediente no sistema'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={dados.nome}
                onChange={(e) => setDados(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Mussarela"
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
                  {CATEGORIAS_INGREDIENTES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco">Preço Atual *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={dados.precoAtual}
                onChange={(e) => setDados(prev => ({ ...prev, precoAtual: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade</Label>
              <Select 
                value={dados.unidade} 
                onValueChange={(value) => setDados(prev => ({ ...prev, unidade: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES_MEDIDA.map(unidade => (
                    <SelectItem key={unidade.value} value={unidade.value}>
                      {unidade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input
                id="fornecedor"
                value={dados.fornecedor}
                onChange={(e) => setDados(prev => ({ ...prev, fornecedor: e.target.value }))}
                placeholder="Nome do fornecedor"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quantidade Padrão por Tamanho</Label>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(TAMANHOS_PIZZA).map(([tamanho, info]) => (
                <div key={tamanho} className="space-y-1">
                  <Label className="text-xs">{info.nome} ({info.diametro})</Label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    value={dados.quantidadePadrao[tamanho]}
                    onChange={(e) => setDados(prev => ({
                      ...prev,
                      quantidadePadrao: {
                        ...prev.quantidadePadrao,
                        [tamanho]: parseFloat(e.target.value) || 0
                      }
                    }))}
                    placeholder="0,000"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={dados.ativo}
              onCheckedChange={(checked) => setDados(prev => ({ ...prev, ativo: checked }))}
            />
            <Label htmlFor="ativo">Ingrediente ativo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit">
              {ingrediente ? 'Salvar Alterações' : 'Cadastrar Ingrediente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente do histórico de preços
const HistoricoPrecos = ({ ingrediente, aberto, onFechar }) => {
  if (!ingrediente) return null;

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Histórico de Preços - {ingrediente.nome}</DialogTitle>
          <DialogDescription>
            Acompanhe a evolução dos preços deste ingrediente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {ingrediente.historico && ingrediente.historico.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingrediente.historico
                  .sort((a, b) => new Date(b.data) - new Date(a.data))
                  .map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatarData(item.data)}</TableCell>
                      <TableCell className="font-mono">
                        {formatarMoeda(item.preco)}
                      </TableCell>
                      <TableCell>{item.fornecedor || '-'}</TableCell>
                      <TableCell>{item.observacoes || '-'}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum histórico de preços disponível
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onFechar}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GestaoIngredientes;
