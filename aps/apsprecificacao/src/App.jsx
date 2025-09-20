import { useState, useEffect } from 'react';
import { Truck, Calculator, Package, DollarSign, TrendingUp, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Importar componentes das seções
import Dashboard from './components/Dashboard';
import GestaoIngredientes from './components/GestaoIngredientes';
import GestaoReceitas from './components/GestaoReceitas';
import CustosOperacionais from './components/CustosOperacionais';
import Precificacao from './components/Precificacao';
import HistoricoAnalisesSimple from './components/HistoricoAnalisesSimple';
import ImportExportSimple from './components/ImportExportSimple';

// Importar utilitários
import { carregarDados, salvarDados } from './lib/data';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dados, setDados] = useState({
    ingredientes: [],
    receitas: [],
    custosOperacionais: null,
    precificacao: [],
    configuracoes: {
      nomeEmpresa: 'Pizzaria Pro',
      ultimoBackup: null
    }
  });

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const dadosCarregados = {
      ingredientes: carregarDados('pizzaria_ingredientes', []),
      receitas: carregarDados('pizzaria_receitas', []),
      custosOperacionais: carregarDados('pizzaria_custos_operacionais', null),
      precificacao: carregarDados('pizzaria_precificacao', []),
      configuracoes: carregarDados('pizzaria_configuracoes', {
        nomeEmpresa: 'Pizzaria Pro',
        ultimoBackup: null
      })
    };
    
    setDados(dadosCarregados);
  }, []);

  // Salvar dados automaticamente quando houver mudanças
  useEffect(() => {
    if (dados.ingredientes.length > 0 || dados.receitas.length > 0) {
      salvarDados('pizzaria_ingredientes', dados.ingredientes);
      salvarDados('pizzaria_receitas', dados.receitas);
      salvarDados('pizzaria_custos_operacionais', dados.custosOperacionais);
      salvarDados('pizzaria_precificacao', dados.precificacao);
      salvarDados('pizzaria_configuracoes', dados.configuracoes);
    }
  }, [dados]);

  const atualizarDados = (novosDados) => {
    setDados(prev => ({ ...prev, ...novosDados }));
  };

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: TrendingUp,
      description: 'Visão geral e KPIs'
    },
    {
      id: 'ingredientes',
      label: 'Ingredientes',
      icon: Package,
      description: 'Gestão com histórico'
    },
    {
      id: 'receitas',
      label: 'Receitas',
      icon: Calculator,
      description: 'Criação e edição'
    },
    {
      id: 'custos',
      label: 'Custos Operacionais',
      icon: Settings,
      description: 'Despesas fixas e variáveis'
    },
    {
      id: 'precificacao',
      label: 'Precificação',
      icon: DollarSign,
      description: 'Cálculos por canal'
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: FileText,
      description: 'Análises temporais'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {dados.configuracoes.nomeEmpresa}
                </h1>
                <p className="text-sm text-gray-500">Sistema de Precificação</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                {dados.ingredientes.length} Ingredientes
              </Badge>
              <Badge variant="outline" className="text-red-600 border-red-200">
                {dados.receitas.length} Receitas
              </Badge>
              <ImportExportSimple dados={dados} onImportar={atualizarDados} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-1">
            <TabsList className="grid w-full grid-cols-6 gap-1 bg-transparent">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center space-y-1 p-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-md transition-all duration-200"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            <TabsContent value="dashboard" className="space-y-6">
              <Dashboard dados={dados} />
            </TabsContent>

            <TabsContent value="ingredientes" className="space-y-6">
              <GestaoIngredientes 
                ingredientes={dados.ingredientes}
                onAtualizarIngredientes={(ingredientes) => atualizarDados({ ingredientes })}
              />
            </TabsContent>

            <TabsContent value="receitas" className="space-y-6">
              <GestaoReceitas 
                receitas={dados.receitas}
                ingredientes={dados.ingredientes}
                onAtualizarReceitas={(receitas) => atualizarDados({ receitas })}
              />
            </TabsContent>

            <TabsContent value="custos" className="space-y-6">
              <CustosOperacionais 
                custosOperacionais={dados.custosOperacionais}
                onAtualizarCustos={(custosOperacionais) => atualizarDados({ custosOperacionais })}
              />
            </TabsContent>

            <TabsContent value="precificacao" className="space-y-6">
              <Precificacao 
                receitas={dados.receitas}
                ingredientes={dados.ingredientes}
                custosOperacionais={dados.custosOperacionais}
                precificacao={dados.precificacao}
                onAtualizarPrecificacao={(precificacao) => atualizarDados({ precificacao })}
              />
            </TabsContent>

            <TabsContent value="historico" className="space-y-6">
              <HistoricoAnalisesSimple dados={dados} />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-orange-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2024 Pizzaria Pro - Sistema de Precificação v1.0
            </div>
            <div className="text-sm text-gray-500">
              {dados.configuracoes.ultimoBackup && (
                <>Último backup: {new Date(dados.configuracoes.ultimoBackup).toLocaleString('pt-BR')}</>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
