import { useState, useEffect } from 'react';
import { Save, Calculator, DollarSign, Truck, Package, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { 
  criarCustosOperacionais, 
  TAMANHOS_PIZZA,
  formatarMoeda
} from '../lib/data';

const CustosOperacionais = ({ custosOperacionais, onAtualizarCustos }) => {
  const [dados, setDados] = useState(criarCustosOperacionais());
  const [salvando, setSalvando] = useState(false);

  // Carregar dados existentes
  useEffect(() => {
    if (custosOperacionais) {
      setDados(custosOperacionais);
    }
  }, [custosOperacionais]);

  const handleSalvar = async () => {
    setSalvando(true);
    
    const dadosAtualizados = {
      ...dados,
      dataAtualizacao: new Date().toISOString()
    };
    
    onAtualizarCustos(dadosAtualizados);
    
    // Simular delay de salvamento
    setTimeout(() => {
      setSalvando(false);
    }, 500);
  };

  const atualizarCustoFixo = (campo, valor) => {
    setDados(prev => ({
      ...prev,
      custosFixosMensais: {
        ...prev.custosFixosMensais,
        [campo]: parseFloat(valor) || 0
      }
    }));
  };

  const atualizarCustoEmbalagem = (tipo, tamanho, valor) => {
    if (tamanho) {
      // Embalagem por tamanho (caixa de pizza)
      setDados(prev => ({
        ...prev,
        custosPorPedido: {
          ...prev.custosPorPedido,
          embalagens: {
            ...prev.custosPorPedido.embalagens,
            [tipo]: {
              ...prev.custosPorPedido.embalagens[tipo],
              [tamanho]: parseFloat(valor) || 0
            }
          }
        }
      }));
    } else {
      // Embalagem única (sacola, guardanapo, etc.)
      setDados(prev => ({
        ...prev,
        custosPorPedido: {
          ...prev.custosPorPedido,
          embalagens: {
            ...prev.custosPorPedido.embalagens,
            [tipo]: parseFloat(valor) || 0
          }
        }
      }));
    }
  };

  const atualizarCustoSache = (tipo, valor) => {
    setDados(prev => ({
      ...prev,
      custosPorPedido: {
        ...prev.custosPorPedido,
        saches: {
          ...prev.custosPorPedido.saches,
          [tipo]: parseFloat(valor) || 0
        }
      }
    }));
  };

  const atualizarCustoDelivery = (tipo, valor) => {
    setDados(prev => ({
      ...prev,
      custosDelivery: {
        ...prev.custosDelivery,
        [tipo]: parseFloat(valor) || 0
      }
    }));
  };

  // Calcular totais
  const totalFixosMensal = Object.values(dados.custosFixosMensais).reduce((a, b) => a + b, 0);
  const rateioFixoPorPedido = totalFixosMensal / dados.volumeVendasMensal;
  const totalEmbalagensPorPedido = Object.values(dados.custosPorPedido.embalagens).reduce((total, item) => {
    if (typeof item === 'object') {
      return total + Object.values(item).reduce((a, b) => a + b, 0) / 4; // Média dos tamanhos
    }
    return total + item;
  }, 0);
  const totalSachesPorPedido = Object.values(dados.custosPorPedido.saches).reduce((a, b) => a + b, 0);
  const totalDeliveryPorPedido = Object.values(dados.custosDelivery).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Custos Operacionais</h2>
          <p className="text-gray-600">Configure despesas fixas e variáveis para precificação precisa</p>
        </div>
        <Button 
          onClick={handleSalvar}
          disabled={salvando}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {salvando ? 'Salvando...' : 'Salvar Custos'}
        </Button>
      </div>

      {/* Resumo dos Custos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Custos Fixos/Mês</p>
                <p className="text-2xl font-bold">{formatarMoeda(totalFixosMensal)}</p>
              </div>
              <DollarSign className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Rateio/Pedido</p>
                <p className="text-2xl font-bold">{formatarMoeda(rateioFixoPorPedido)}</p>
              </div>
              <Calculator className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Embalagens/Pedido</p>
                <p className="text-2xl font-bold">{formatarMoeda(totalEmbalagensPorPedido)}</p>
              </div>
              <Package className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Delivery/Pedido</p>
                <p className="text-2xl font-bold">{formatarMoeda(totalDeliveryPorPedido)}</p>
              </div>
              <Truck className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuração dos Custos */}
      <Tabs defaultValue="fixos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fixos">Custos Fixos</TabsTrigger>
          <TabsTrigger value="embalagens">Embalagens</TabsTrigger>
          <TabsTrigger value="saches">Sachês</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        {/* Custos Fixos Mensais */}
        <TabsContent value="fixos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                Custos Fixos Mensais
              </CardTitle>
              <CardDescription>
                Despesas fixas que são rateadas entre todos os pedidos do mês
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agua">Água</Label>
                  <Input
                    id="agua"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosFixosMensais.agua}
                    onChange={(e) => atualizarCustoFixo('agua', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="luz">Energia Elétrica</Label>
                  <Input
                    id="luz"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosFixosMensais.luz}
                    onChange={(e) => atualizarCustoFixo('luz', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internet">Internet/Telefone</Label>
                  <Input
                    id="internet"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosFixosMensais.internet}
                    onChange={(e) => atualizarCustoFixo('internet', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aluguel">Aluguel</Label>
                  <Input
                    id="aluguel"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosFixosMensais.aluguel}
                    onChange={(e) => atualizarCustoFixo('aluguel', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salarios">Salários e Encargos</Label>
                  <Input
                    id="salarios"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosFixosMensais.salarios}
                    onChange={(e) => atualizarCustoFixo('salarios', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosFixosMensais.telefone}
                    onChange={(e) => atualizarCustoFixo('telefone', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contabilidade">Contabilidade</Label>
                  <Input
                    id="contabilidade"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosFixosMensais.contabilidade}
                    onChange={(e) => atualizarCustoFixo('contabilidade', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outros">Outros Custos</Label>
                  <Input
                    id="outros"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosFixosMensais.outros}
                    onChange={(e) => atualizarCustoFixo('outros', e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="volume">Volume de Vendas Mensal (para rateio)</Label>
                <Input
                  id="volume"
                  type="number"
                  min="1"
                  value={dados.volumeVendasMensal}
                  onChange={(e) => setDados(prev => ({ 
                    ...prev, 
                    volumeVendasMensal: parseInt(e.target.value) || 1000 
                  }))}
                  placeholder="1000"
                />
                <p className="text-sm text-gray-600">
                  Número estimado de pedidos por mês para calcular o rateio dos custos fixos
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Custos Fixos Mensais:</span>
                  <Badge variant="outline" className="text-lg font-bold">
                    {formatarMoeda(totalFixosMensal)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Rateio por pedido:</span>
                  <span className="text-sm font-medium">
                    {formatarMoeda(rateioFixoPorPedido)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Embalagens */}
        <TabsContent value="embalagens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-orange-500" />
                Custos de Embalagens
              </CardTitle>
              <CardDescription>
                Custos de embalagens por pedido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Caixas de Pizza por Tamanho */}
              <div className="space-y-4">
                <h4 className="font-semibold">Caixas de Pizza por Tamanho</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(TAMANHOS_PIZZA).map(([tamanho, info]) => (
                    <div key={tamanho} className="space-y-2">
                      <Label>{info.nome} ({info.diametro})</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={dados.custosPorPedido.embalagens.caixaPizza[tamanho]}
                        onChange={(e) => atualizarCustoEmbalagem('caixaPizza', tamanho, e.target.value)}
                        placeholder="0,00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Outras Embalagens */}
              <div className="space-y-4">
                <h4 className="font-semibold">Outras Embalagens</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sacola">Sacola de Delivery</Label>
                    <Input
                      id="sacola"
                      type="number"
                      step="0.01"
                      min="0"
                      value={dados.custosPorPedido.embalagens.sacola}
                      onChange={(e) => atualizarCustoEmbalagem('sacola', null, e.target.value)}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardanapo">Guardanapos</Label>
                    <Input
                      id="guardanapo"
                      type="number"
                      step="0.01"
                      min="0"
                      value={dados.custosPorPedido.embalagens.guardanapo}
                      onChange={(e) => atualizarCustoEmbalagem('guardanapo', null, e.target.value)}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="papel">Papel/Outros</Label>
                    <Input
                      id="papel"
                      type="number"
                      step="0.01"
                      min="0"
                      value={dados.custosPorPedido.embalagens.papel}
                      onChange={(e) => atualizarCustoEmbalagem('papel', null, e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Custo Médio Embalagens/Pedido:</span>
                  <Badge variant="outline" className="text-lg font-bold">
                    {formatarMoeda(totalEmbalagensPorPedido)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sachês */}
        <TabsContent value="saches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Utensils className="h-5 w-5 mr-2 text-green-500" />
                Sachês e Condimentos
              </CardTitle>
              <CardDescription>
                Custos de sachês por pedido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ketchup">Ketchup</Label>
                  <Input
                    id="ketchup"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosPorPedido.saches.ketchup}
                    onChange={(e) => atualizarCustoSache('ketchup', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maionese">Maionese</Label>
                  <Input
                    id="maionese"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosPorPedido.saches.maionese}
                    onChange={(e) => atualizarCustoSache('maionese', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mostarda">Mostarda</Label>
                  <Input
                    id="mostarda"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosPorPedido.saches.mostarda}
                    onChange={(e) => atualizarCustoSache('mostarda', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oregano">Orégano</Label>
                  <Input
                    id="oregano"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosPorPedido.saches.oregano}
                    onChange={(e) => atualizarCustoSache('oregano', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pimenta">Pimenta</Label>
                  <Input
                    id="pimenta"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosPorPedido.saches.pimenta}
                    onChange={(e) => atualizarCustoSache('pimenta', e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Sachês/Pedido:</span>
                  <Badge variant="outline" className="text-lg font-bold">
                    {formatarMoeda(totalSachesPorPedido)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery */}
        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2 text-red-500" />
                Custos de Delivery
              </CardTitle>
              <CardDescription>
                Custos específicos para pedidos de delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="combustivel">Combustível por Entrega</Label>
                  <Input
                    id="combustivel"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosDelivery.combustivel}
                    onChange={(e) => atualizarCustoDelivery('combustivel', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manutencao">Manutenção por Entrega</Label>
                  <Input
                    id="manutencao"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosDelivery.manutencao}
                    onChange={(e) => atualizarCustoDelivery('manutencao', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entregador">Entregador por Entrega</Label>
                  <Input
                    id="entregador"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosDelivery.entregador}
                    onChange={(e) => atualizarCustoDelivery('entregador', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seguro">Seguro por Entrega</Label>
                  <Input
                    id="seguro"
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.custosDelivery.seguro}
                    onChange={(e) => atualizarCustoDelivery('seguro', e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Delivery/Pedido:</span>
                  <Badge variant="outline" className="text-lg font-bold">
                    {formatarMoeda(totalDeliveryPorPedido)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Este custo é aplicado apenas aos pedidos de delivery, não aos de balcão/retirada
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustosOperacionais;
