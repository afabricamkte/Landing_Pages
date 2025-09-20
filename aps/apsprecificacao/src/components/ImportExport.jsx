import { useState, useRef } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, Database, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { 
  exportarParaExcel,
  exportarParaCSV,
  exportarParaJSON,
  importarDeExcel,
  importarDeCSV,
  importarDeJSON,
  validarDadosImportados
} from '../lib/importExport';

const ImportExport = ({ dados, onImportar }) => {
  const [dialogExportAberto, setDialogExportAberto] = useState(false);
  const [dialogImportAberto, setDialogImportAberto] = useState(false);
  const [nomeEmpresa, setNomeEmpresa] = useState(dados.configuracoes?.nomeEmpresa || 'Pizzaria Pro');
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [errosImportacao, setErrosImportacao] = useState([]);
  const fileInputRef = useRef(null);

  const handleExportar = async (formato) => {
    setExportando(true);
    setProgresso(0);
    setResultado(null);

    try {
      // Simular progresso
      const intervalos = [20, 40, 60, 80, 100];
      for (let i = 0; i < intervalos.length; i++) {
        setTimeout(() => setProgresso(intervalos[i]), i * 200);
      }

      let resultadoExport;
      
      switch (formato) {
        case 'excel':
          resultadoExport = await exportarParaExcel(dados, nomeEmpresa);
          break;
        case 'csv':
          resultadoExport = await exportarParaCSV(dados, nomeEmpresa);
          break;
        case 'json':
          resultadoExport = await exportarParaJSON(dados, nomeEmpresa);
          break;
        default:
          throw new Error('Formato não suportado');
      }

      setTimeout(() => {
        setProgresso(100);
        setResultado({
          sucesso: resultadoExport.sucesso,
          mensagem: resultadoExport.sucesso 
            ? `Arquivo ${resultadoExport.nomeArquivo} exportado com sucesso!`
            : `Erro na exportação: ${resultadoExport.erro}`,
          tipo: 'export'
        });
        setExportando(false);
      }, 1000);

    } catch (error) {
      setResultado({
        sucesso: false,
        mensagem: `Erro na exportação: ${error.message}`,
        tipo: 'export'
      });
      setExportando(false);
    }
  };

  const handleImportar = async (arquivo) => {
    if (!arquivo) return;

    setImportando(true);
    setProgresso(0);
    setResultado(null);
    setErrosImportacao([]);

    try {
      // Simular progresso inicial
      setProgresso(20);

      const extensao = arquivo.name.split('.').pop().toLowerCase();
      let dadosImportados;

      setProgresso(40);

      switch (extensao) {
        case 'xlsx':
        case 'xls':
          dadosImportados = await importarDeExcel(arquivo);
          break;
        case 'csv':
          dadosImportados = await importarDeCSV(arquivo);
          break;
        case 'json':
          dadosImportados = await importarDeJSON(arquivo);
          break;
        default:
          throw new Error('Formato de arquivo não suportado');
      }

      setProgresso(60);

      // Validar dados importados
      const validacao = validarDadosImportados(dadosImportados);
      
      setProgresso(80);

      if (!validacao.valido) {
        setErrosImportacao(validacao.erros);
        setResultado({
          sucesso: false,
          mensagem: `Dados inválidos encontrados. Verifique os erros abaixo.`,
          tipo: 'import'
        });
      } else {
        // Mesclar dados importados com dados existentes
        const dadosMesclados = {
          ...dados,
          ...dadosImportados,
          configuracoes: {
            ...dados.configuracoes,
            ultimoBackup: new Date().toISOString()
          }
        };

        onImportar(dadosMesclados);

        setResultado({
          sucesso: true,
          mensagem: `Dados importados com sucesso! ${dadosImportados.ingredientes?.length || 0} ingredientes, ${dadosImportados.receitas?.length || 0} receitas.`,
          tipo: 'import'
        });
      }

      setProgresso(100);

    } catch (error) {
      setResultado({
        sucesso: false,
        mensagem: `Erro na importação: ${error.message}`,
        tipo: 'import'
      });
    } finally {
      setImportando(false);
    }
  };

  const resetarEstado = () => {
    setProgresso(0);
    setResultado(null);
    setErrosImportacao([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const estatisticasDados = {
    ingredientes: dados.ingredientes?.length || 0,
    receitas: dados.receitas?.length || 0,
    custosOperacionais: dados.custosOperacionais ? 1 : 0,
    precificacao: dados.precificacao?.length || 0
  };

  return (
    <div className="flex space-x-2">
      {/* Botão de Exportação */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setDialogExportAberto(true)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Configurar Exportação
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportar('excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportar('csv')}>
            <FileText className="h-4 w-4 mr-2" />
            CSV (.csv)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportar('json')}>
            <Database className="h-4 w-4 mr-2" />
            JSON (.json)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Botão de Importação */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setDialogImportAberto(true)}
      >
        <Upload className="h-4 w-4 mr-2" />
        Importar
      </Button>

      {/* Dialog de Exportação */}
      <Dialog open={dialogExportAberto} onOpenChange={setDialogExportAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2 text-blue-500" />
              Exportar Dados
            </DialogTitle>
            <DialogDescription>
              Exporte todos os dados do sistema para backup ou análise externa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Resumo dos Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dados a serem exportados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{estatisticasDados.ingredientes}</div>
                    <div className="text-sm text-gray-600">Ingredientes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{estatisticasDados.receitas}</div>
                    <div className="text-sm text-gray-600">Receitas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{estatisticasDados.custosOperacionais}</div>
                    <div className="text-sm text-gray-600">Config. Custos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{estatisticasDados.precificacao}</div>
                    <div className="text-sm text-gray-600">Cálculos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeEmpresa">Nome da Empresa (para o arquivo)</Label>
                <Input
                  id="nomeEmpresa"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  placeholder="Nome da sua pizzaria"
                />
              </div>

              {/* Formatos de Exportação */}
              <div className="space-y-3">
                <Label>Escolha o formato:</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => handleExportar('excel')}
                    disabled={exportando}
                  >
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div className="text-center">
                      <div className="font-medium">Excel</div>
                      <div className="text-xs text-gray-500">Múltiplas abas organizadas</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => handleExportar('csv')}
                    disabled={exportando}
                  >
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="text-center">
                      <div className="font-medium">CSV</div>
                      <div className="text-xs text-gray-500">Formato tabular simples</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => handleExportar('json')}
                    disabled={exportando}
                  >
                    <Database className="h-8 w-8 text-purple-600" />
                    <div className="text-center">
                      <div className="font-medium">JSON</div>
                      <div className="text-xs text-gray-500">Estrutura completa</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Progresso e Resultado */}
            {(exportando || resultado?.tipo === 'export') && (
              <div className="space-y-3">
                {exportando && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Exportando dados...</span>
                      <span>{progresso}%</span>
                    </div>
                    <Progress value={progresso} />
                  </div>
                )}

                {resultado?.tipo === 'export' && (
                  <Alert className={resultado.sucesso ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    {resultado.sucesso ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={resultado.sucesso ? 'text-green-700' : 'text-red-700'}>
                      {resultado.mensagem}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDialogExportAberto(false);
                resetarEstado();
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Importação */}
      <Dialog open={dialogImportAberto} onOpenChange={setDialogImportAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2 text-green-500" />
              Importar Dados
            </DialogTitle>
            <DialogDescription>
              Importe dados de backup ou planilhas externas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Seleção de Arquivo */}
            <div className="space-y-4">
              <Label>Selecione o arquivo para importar:</Label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Arraste um arquivo aqui ou clique para selecionar
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    onChange={(e) => {
                      const arquivo = e.target.files?.[0];
                      if (arquivo) handleImportar(arquivo);
                    }}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importando}
                  >
                    Selecionar Arquivo
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Formatos suportados:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Excel (.xlsx, .xls):</strong> Importação completa com múltiplas abas</li>
                  <li><strong>CSV (.csv):</strong> Dados tabulares simples</li>
                  <li><strong>JSON (.json):</strong> Backup completo do sistema</li>
                </ul>
              </div>
            </div>

            {/* Progresso e Resultado */}
            {(importando || resultado?.tipo === 'import') && (
              <div className="space-y-3">
                {importando && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Importando dados...</span>
                      <span>{progresso}%</span>
                    </div>
                    <Progress value={progresso} />
                  </div>
                )}

                {resultado?.tipo === 'import' && (
                  <Alert className={resultado.sucesso ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    {resultado.sucesso ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={resultado.sucesso ? 'text-green-700' : 'text-red-700'}>
                      {resultado.mensagem}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Erros de Validação */}
                {errosImportacao.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-red-800 text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Erros encontrados na importação:
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-red-700 space-y-1">
                        {errosImportacao.map((erro, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {erro}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Aviso sobre Mesclagem */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Os dados importados serão mesclados com os dados existentes. 
                Recomendamos fazer um backup antes da importação.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDialogImportAberto(false);
                resetarEstado();
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImportExport;
