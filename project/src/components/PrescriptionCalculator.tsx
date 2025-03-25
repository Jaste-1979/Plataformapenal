import React, { useState } from 'react';
import { addYears, format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { crimeTypes } from '../data/crimeTypes';
import { processStages } from '../data/processStages';

export const PrescriptionCalculator: React.FC = () => {
  const [crimeDate, setCrimeDate] = useState<string>('');
  const [selectedCrimeType, setSelectedCrimeType] = useState<string>('');
  const [currentStage, setCurrentStage] = useState<string>('');

  const calculatePrescription = () => {
    if (!crimeDate || !selectedCrimeType) return null;

    const crime = crimeTypes.find((c) => c.id === selectedCrimeType);
    if (!crime) return null;

    const crimeDateObj = new Date(crimeDate);
    const prescriptionDate = addYears(crimeDateObj, crime.prescriptionYears);
    const daysRemaining = differenceInDays(prescriptionDate, new Date());

    return {
      prescriptionDate,
      daysRemaining,
      isExpired: daysRemaining < 0,
      isWarning: daysRemaining <= 180,
    };
  };

  const result = calculatePrescription();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Calculadora de Prescripción Penal
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha del Delito
          </label>
          <input
            type="date"
            value={crimeDate}
            onChange={(e) => setCrimeDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Delito
          </label>
          <select
            value={selectedCrimeType}
            onChange={(e) => setSelectedCrimeType(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Seleccione un delito</option>
            {crimeTypes.map((crime) => (
              <option key={crime.id} value={crime.id}>
                {crime.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etapa Procesal Actual
          </label>
          <select
            value={currentStage}
            onChange={(e) => setCurrentStage(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Seleccione una etapa</option>
            {processStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.isExpired
              ? 'bg-red-100 text-red-800'
              : result.isWarning
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            <h3 className="font-semibold mb-2">Resultados:</h3>
            <p>
              Fecha de prescripción:{' '}
              {format(result.prescriptionDate, 'dd/MM/yyyy', { locale: es })}
            </p>
            <p>
              {result.isExpired
                ? 'El caso ha prescrito'
                : `Días restantes: ${result.daysRemaining}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};