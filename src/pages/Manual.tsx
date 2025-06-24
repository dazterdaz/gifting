import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

const Manual = () => {
  const { user } = useAuthStore();
  const [manualContent, setManualContent] = useState('');

  useEffect(() => {
    fetch('/docs/manual.md')
      .then(response => response.text())
      .then(text => setManualContent(text))
      .catch(error => console.error('Error loading manual:', error));
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Configuración de la página
    doc.setFont('helvetica');
    doc.setFontSize(22);
    doc.text('Manual de Usuario - Daz Giftcard Register', 20, 20);
    
    // Contenido principal
    doc.setFontSize(12);
    
    // Dividir el contenido en líneas para manejar el salto de página
    const lines = manualContent.split('\n');
    let y = 40;
    
    lines.forEach(line => {
      // Detectar encabezados
      if (line.startsWith('# ')) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        y += 10;
        doc.text(line.replace('# ', ''), 20, y);
        y += 10;
      } else if (line.startsWith('## ')) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        y += 8;
        doc.text(line.replace('## ', ''), 20, y);
        y += 8;
      } else if (line.startsWith('### ')) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        y += 6;
        doc.text(line.replace('### ', ''), 20, y);
        y += 6;
      } else if (line.trim() !== '') {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        // Dividir líneas largas
        const words = line.split(' ');
        let currentLine = '';
        
        words.forEach(word => {
          if (doc.getTextWidth(currentLine + ' ' + word) < 170) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (y > 280) {
              doc.addPage();
              y = 20;
            }
            doc.text(currentLine, 20, y);
            y += 7;
            currentLine = word;
          }
        });
        
        if (currentLine) {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(currentLine, 20, y);
          y += 7;
        }
      }
    });
    
    doc.save('manual-usuario-daz-giftcard.pdf');
  };

  if (user?.role !== 'superadmin') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No tienes permisos para acceder a esta página
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Manual de Usuario
        </h1>
        
        <Button
          onClick={handleDownloadPDF}
          leftIcon={<Download className="h-4 w-4" />}
        >
          Descargar PDF
        </Button>
      </div>
      
      <Card>
        <CardContent className="prose dark:prose-invert max-w-none p-6">
          <ReactMarkdown>{manualContent}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
};

export default Manual;