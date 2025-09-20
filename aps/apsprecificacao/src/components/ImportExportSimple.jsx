import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ImportExportSimple = ({ dados, onImportar }) => {
  const [exportando, setExportando] = useState(false);

  const handleExportar = () => {
    setExportando(true);
    
    try {
      const dadosExport = {
        ...dados,
        exportadoEm: new Date().toISOString(),
        versao: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(dadosExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dados.configuracoes?.nomeEmpresa || 'Pizzaria'}_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro na exportação:', error);
    } finally {
      setExportando(false);
    }
  };

  const handleImportar = (event) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dadosImportados = JSON.parse(e.target.result);
        onImportar(dadosImportados);
        alert('Dados importados com sucesso!');
      } catch (error) {
        alert('Erro ao importar arquivo: ' + error.message);
      }
    };
    reader.readAsText(arquivo);
  };

  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportar}
        disabled={exportando}
      >
        <Download className="h-4 w-4 mr-2" />
        {exportando ? 'Exportando...' : 'Exportar'}
      </Button>
      
      <div>
        <input
          type="file"
          accept=".json"
          onChange={handleImportar}
          style={{ display: 'none' }}
          id="import-file"
        />
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => document.getElementById('import-file').click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Importar
        </Button>
      </div>
    </div>
  );
};

export default ImportExportSimple;
