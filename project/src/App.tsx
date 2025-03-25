import React, { useState } from 'react';
import { Scale, Calculator, BookOpen, Gavel, FileText } from 'lucide-react';
import { ToolCard } from './components/ToolCard';
import { PrescriptionCalculator } from './components/PrescriptionCalculator';
import { ProcessTimeline } from './components/ProcessTimeline';

function App() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'prescription',
      title: 'Sorteo',
      description: 'Calcula plazos de prescripción en casos penales',
      icon: Scale,
    },
    {
      id: 'timeline',
      title: 'Línea Temporal del Proceso',
      description: 'Visualiza y gestiona etapas del proceso penal',
      icon: Gavel,
    },
    {
      id: 'statistics',
      title: 'Estadística',
      description: 'Análisis estadístico de casos',
      icon: Calculator,
    },
    {
      id: 'library',
      title: 'Biblioteca Legal',
      description: 'Accede a leyes y jurisprudencia',
      icon: BookOpen,
    },
    {
      id: 'templates',
      title: 'Plantillas',
      description: 'Modelos de documentos legales',
      icon: FileText,
    },
  ];

  const renderTool = () => {
    switch (selectedTool) {
      case 'prescription':
        return <PrescriptionCalculator />;
      case 'timeline':
        return <ProcessTimeline />;
      default:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Herramientas Legales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  onClick={() => setSelectedTool(tool.id)}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                Portal Legal
              </h1>
            </div>
            {selectedTool && (
              <button
                onClick={() => setSelectedTool(null)}
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                ← Volver al inicio
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {renderTool()}
      </main>
    </div>
  );
}

export default App;