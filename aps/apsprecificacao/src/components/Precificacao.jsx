import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, AlertCircle, Target, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { 
  CANAIS_VENDA,
  TAMANHOS_PIZZA,
  calcularCustoIngredientes,
  calcularCustoOperacional,
  calcularCustoDelivery,
  calcularPrecoSugerido,
  calcularMargemReal,
  formatarMoeda,
  formatarPorcentagem
} from '../lib/data';

const Precificacao = ({ receitas, ingredientes, custosOperacionais, precificacao, onAtualizarPrecificacao }) => {
  const [receitaSelecionada, setReceitaSelecionada] = useState('');
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState('M');
  const [margemDesejada, setMargemDesejada] = useState(65);
  const [calculando, setCalculando] = useState(false);
  const [resultados, setResultados] = useState(null);

  // Verificar se todos os dados necessários estão disponíveis
  const dadosCompletos = receitas.length > 0 && ingredientes.length > 0 && custosOperacionais;

  const calcularPrecificacao = async () => {
    if (!receitaSelecionada || !custosOperacionais) return;

    setCalculando(true);

    const receita = receitas.find(r => r.id === receitaSelecionada);
    if (!receita) return;

    const dadosTamanho = receita.tamanhos[tamanhoSelecionado];
    if (!dadosTamanho) return;

    // Calcular custos
    const custoIngredientes = calcularCustoIngredientes(dadosTamanho.ingredientes || [], ingredientes);
    const custoOperacional = calcularCustoOperacional(custosOperacionais, tamanhoSelecionado);
    const custoDelivery = calcularCustoDelivery(custosOperacionais);
    
    // Calcular para cada canal
    const canaisCalculados = {};
    
    Object.entries(CANAIS_VENDA).forEach(([canalId, canalInfo]) => {
      const custoTotalCanal = custoIngredientes + custoOperacional + (canalInfo.temDelivery ? custoDelivery : 0);
      const precoSugerido = calcularPrecoSugerido(custoTotalCanal, margemDesejada / 100, canalInfo.taxa);
      const margemReal = calcularMargemReal(precoSugerido, custoTotalCanal, canalInfo.taxa);
      
      canaisCalculados[canalId] = {
        taxa: canalInfo.taxa,
        custoDelivery: canalInfo.temDelivery ? custoDelivery : 0,
        custoTotalCanal,
        precoSugerido,
        margemLiquida: margemReal,
        receitaLiquida: precoSugerido * (1 - canalInfo.taxa),
        lucroLiquido: (precoSugerido * (1 - canalInfo.taxa)) - custoTotalCanal
      };
    });

    const novoResultado = {
      receitaId: receitaSelecionada,
      nomeReceita: receita.nome,
      tamanho: tamanhoSelecionado,
      custoIngredientes,
      custoOperacional,
      custoTotal: custoIngredientes + custoOperacional,
      margemDesejada: margemDesejada / 100,
      canais: canaisCalculados,
      dataCalculo: new Date().toISOString()
    };

    setResultados(novoResultado);

    // Salvar no histórico de precificação
    const precificacaoAtualizada = [
      ...precificacao.filter(p => !(p.receitaId === receitaSelecionada && p.tamanho === tamanhoSelecionado)),
      novoResultado
    ];
    
    onAtualizarPrecificacao(precificacaoAtualizada);

    setTimeout(() => setCalculando(false), 500);
  };

  // Carregar último cálculo se disponível
  useEffect(() => {
    if (receitaSelecionada && tamanhoSelecionado) {
      const ultimoCalculo = precificacao.find(p => 
        p.receitaId === receitaSelecionada && p.tamanho === tamanhoSelecionado
      );
      if (ultimoCalculo) {
        setResultados(ultimoCalculo);
        setMargemDesejada(ultimoCalculo.margemDesejada * 100);
      }
    }
  }, [receitaSelecionada, tamanhoSelecionado, precificacao]);

  // Encontrar melhor e pior canal
  const melhorCanal = resultados ? Object.entries(resultados.canais)
    .sort(([,a], [,b]) => b.margemLiquida - a.margemLiquida)[0] : null;
  
  const piorCanal = resultados ? Object.entries(resultados.canais)
    .sort(([,a], [,b]) => a.margemLiquida - b.margemLiquida)[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Precificação Multi-Canal</h2>
        <p className="text-gray-600">Calcule preços otimizados para cada canal de venda</p>
      </div>

      {/* Verificação de Dados */}
      {!dadosCompletos && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para usar a precificação, você precisa ter:
            {receitas.length === 0 && ' receitas cadastradas,'}
            {ingredientes.length === 0 && ' ingredientes cadastrados,'}
            {!custosOperacionais && ' custos operacionais configurados.'}
            {' '}Configure estes dados nas abas correspondentes.
          </AlertDescription>
        </Alert>
      )}

      {dadosCompletos && (
        <>
          {/* Configuração do Cálculo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-blue-500" />
                Configuração do Cálculo
              </CardTitle>
              <CardDescription>
                Selecione a receita, tamanho e margem desejada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receita">Receita</Label>
                  <Select value={receitaSelecionada} onValueChange={setReceitaSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma receita" />
                    </SelectTrigger>
                    <SelectContent>
                      {receitas.filter(r => r.ativa).map(receita => (
                        <SelectItem key={receita.id} value={receita.id}>
                          {receita.nome} ({receita.categoria})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tamanho">Tamanho</Label>
                  <Select value={tamanhoSelecionado} onValueChange={setTamanhoSelecionado}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TAMANHOS_PIZZA).map(([tamanho, info]) => (
                        <SelectItem key={tamanho} value={tamanho}>
                          {info.nome} ({info.diametro})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Margem Desejada: {margemDesejada}%</Label>
                  <Slider
                    value={[margemDesejada]}
                    onValueChange={(value) => setMargemDesejada(value[0])}
                    max={80}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10%</span>
                    <span>45%</span>
                    <span>80%</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={calcularPrecificacao}
                  disabled={!receitaSelecionada || calculando}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  size="lg"
                >
                  {calculando ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Calcular Precificação
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          {resultados && (
            <>
              {/* Resumo dos Custos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-500" />
                    Resumo dos Custos - {resultados.nomeReceita} ({TAMANHOS_PIZZA[resultados.tamanho].nome})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Ingredientes</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatarMoeda(resultados.custoIngredientes)}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Operacional</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {formatarMoeda(resultados.custoOperacional)}
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-600 font-medium">Base Total</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {formatarMoeda(resultados.custoTotal)}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Margem Alvo</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatarPorcentagem(resultados.margemDesejada)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Análise por Canal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                    Análise por Canal de Venda
                  </CardTitle>
                  <CardDescription>
                    Comparação de preços e margens entre os canais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Canal</TableHead>
                        <TableHead>Taxa</TableHead>
                        <TableHead>Custo Delivery</TableHead>
                        <TableHead>Custo Total</TableHead>
                        <TableHead>Preço Sugerido</TableHead>
                        <TableHead>Receita Líquida</TableHead>
                        <TableHead>Margem Real</TableHead>
                        <TableHead>Lucro Líquido</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(resultados.canais).map(([canalId, dados]) => {
                        const canalInfo = CANAIS_VENDA[canalId];
                        const isMelhor = melhorCanal && melhorCanal[0] === canalId;
                        const isPior = piorCanal && piorCanal[0] === canalId;
                        
                        return (
                          <TableRow key={canalId} className={
                            isMelhor ? 'bg-green-50' : isPior ? 'bg-red-50' : ''
                          }>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: canalInfo.cor }}
                                />
                                <span className="font-medium">{canalInfo.nome}</span>
                                {isMelhor && <Badge variant="default" className="text-xs">Melhor</Badge>}
                                {isPior && <Badge variant="destructive" className="text-xs">Pior</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>{formatarPorcentagem(dados.taxa)}</TableCell>
                            <TableCell>{formatarMoeda(dados.custoDelivery)}</TableCell>
                            <TableCell className="font-mono">{formatarMoeda(dados.custoTotalCanal)}</TableCell>
                            <TableCell className="font-mono font-bold">{formatarMoeda(dados.precoSugerido)}</TableCell>
                            <TableCell className="font-mono">{formatarMoeda(dados.receitaLiquida)}</TableCell>
                            <TableCell>
                              <Badge variant={dados.margemLiquida >= resultados.margemDesejada ? 'default' : 'destructive'}>
                                {formatarPorcentagem(dados.margemLiquida)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono">{formatarMoeda(dados.lucroLiquido)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Insights e Recomendações */}
              <Card>
                <CardHeader>
                  <CardTitle>Insights e Recomendações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {melhorCanal && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">🏆 Melhor Canal</h4>
                      <p className="text-green-700">
                        <strong>{CANAIS_VENDA[melhorCanal[0]].nome}</strong> oferece a melhor margem líquida 
                        ({formatarPorcentagem(melhorCanal[1].margemLiquida)}) com lucro de {formatarMoeda(melhorCanal[1].lucroLiquido)} por pizza.
                      </p>
                    </div>
                  )}

                  {piorCanal && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">⚠️ Canal Menos Rentável</h4>
                      <p className="text-red-700">
                        <strong>{CANAIS_VENDA[piorCanal[0]].nome}</strong> tem a menor margem líquida 
                        ({formatarPorcentagem(piorCanal[1].margemLiquida)}) com lucro de {formatarMoeda(piorCanal[1].lucroLiquido)} por pizza.
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Dicas de Precificação</h4>
                    <ul className="text-blue-700 space-y-1 text-sm">
                      <li>• Considere ajustar preços nos canais com taxas mais altas</li>
                      <li>• Monitore regularmente os custos dos ingredientes</li>
                      <li>• Avalie promoções específicas por canal</li>
                      <li>• Considere o volume de vendas além da margem</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Precificacao;
