import React, { useState, useEffect } from 'react';
import { format, differenceInDays, parse, isValid, addYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Check, Clock } from 'lucide-react';
import { DatePicker } from './DatePicker';
import { Timeline } from './Timeline';
import type { TimelineData, ProcessEvent, RecurseType } from '../types';
import { DEFAULT_EVENTS } from '../data/processStages';

interface PrescriptionStage {
  name: string;
  startDate: Date;
  endDate: Date;
  prescriptionDate: Date;
  isPrescribed: boolean;
}

export const ProcessTimeline: React.FC = () => {
  const [timelineData, setTimelineData] = useState<TimelineData>({
    crimeType: '',
    maxPenaltyYears: 2,
    crimeDate: null,
    events: DEFAULT_EVENTS,
  });

  const [prescriptionStages, setPrescriptionStages] = useState<PrescriptionStage[]>([]);

  const validatePenaltyYears = (years: number) => {
    return Math.min(Math.max(years, 2), 12);
  };

  const updateEvent = (eventId: string, date: Date | null, endDate?: Date | null, recurseType?: RecurseType, tribunal?: string) => {
    setTimelineData(prev => ({
      ...prev,
      events: prev.events.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              date,
              ...(endDate !== undefined && { endDate }),
              ...(recurseType !== undefined && { recurseType }),
              ...(tribunal !== undefined && { tribunal })
            } 
          : event
      )
    }));
  };

  const calculatePrescriptionStages = () => {
    if (!timelineData.crimeDate) return [];

    const indictmentEvent = timelineData.events.find(e => e.id === 'indictment');
    const elevationEvent = timelineData.events.find(e => e.id === 'instruction_end');
    const sentenceEvent = timelineData.events.find(e => e.id === 'sentence');

    const currentDate = new Date();
    const stages: PrescriptionStage[] = [];

    // Etapa 1: Del hecho al primer llamado a indagatoria
    if (timelineData.crimeDate) {
      const endDate = indictmentEvent?.date || currentDate;
      const prescriptionDate = addYears(timelineData.crimeDate, timelineData.maxPenaltyYears);
      stages.push({
        name: 'Del hecho al primer llamado a indagatoria',
        startDate: timelineData.crimeDate,
        endDate,
        prescriptionDate,
        isPrescribed: endDate > prescriptionDate
      });
    }

    // Etapa 2: Del primer llamado a indagatoria al requerimiento de elevación
    if (indictmentEvent?.date) {
      const endDate = elevationEvent?.date || currentDate;
      const prescriptionDate = addYears(indictmentEvent.date, timelineData.maxPenaltyYears);
      stages.push({
        name: 'Del primer llamado a indagatoria al requerimiento de elevación',
        startDate: indictmentEvent.date,
        endDate,
        prescriptionDate,
        isPrescribed: endDate > prescriptionDate
      });
    }

    // Etapa 3: Del requerimiento de elevación a la sentencia
    if (elevationEvent?.date) {
      const endDate = sentenceEvent?.date || currentDate;
      const prescriptionDate = addYears(elevationEvent.date, timelineData.maxPenaltyYears);
      stages.push({
        name: 'Del requerimiento de elevación a la sentencia',
        startDate: elevationEvent.date,
        endDate,
        prescriptionDate,
        isPrescribed: endDate > prescriptionDate
      });
    }

    return stages;
  };

  useEffect(() => {
    const stages = calculatePrescriptionStages();
    setPrescriptionStages(stages);
  }, [timelineData.crimeDate, timelineData.maxPenaltyYears, timelineData.events]);

  const calculateStageDuration = (stage: 'instruction' | 'trial' | 'recurse') => {
    const events = timelineData.events.filter(e => e.stage === stage);
    if (events.length < 2) return null;
    
    const dates = events
      .filter(e => e.date)
      .map(e => e.date!)
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (dates.length < 2) return null;
    
    const days = differenceInDays(dates[dates.length - 1], dates[0]);
    return `${Math.floor(days / 30)} meses y ${days % 30} días`;
  };

  const handleDateInput = (eventId: string, dateStr: string) => {
    const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
    if (isValid(parsedDate) && (!timelineData.crimeDate || parsedDate >= timelineData.crimeDate)) {
      updateEvent(eventId, parsedDate);
    }
  };

  const calculateTotalDuration = () => {
    const validEvents = timelineData.events
      .filter(e => e.date)
      .sort((a, b) => a.date!.getTime() - b.date!.getTime());

    if (validEvents.length < 2) return null;

    const firstEvent = validEvents[0];
    const lastEvent = validEvents[validEvents.length - 1];

    const days = differenceInDays(lastEvent.date!, firstEvent.date!);
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    const months = Math.floor(remainingDays / 30);
    const finalDays = remainingDays % 30;

    return `${years} años, ${months} meses y ${finalDays} días`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Línea Temporal del Proceso Penal
      </h2>

      {prescriptionStages.some(stage => stage.isPrescribed) && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
            <span className="text-red-700 font-bold">ACCIÓN PRESCRIPTA</span>
          </div>
          <div className="space-y-2">
            {prescriptionStages
              .filter(stage => stage.isPrescribed)
              .map((stage, index) => (
                <div key={index} className="text-red-600">
                  Prescripción en etapa: {stage.name}
                  <br />
                  Fecha de prescripción: {format(stage.prescriptionDate, 'dd/MM/yyyy', { locale: es })}
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Delito
            </label>
            <input
              type="text"
              value={timelineData.crimeType}
              onChange={(e) => setTimelineData(prev => ({ ...prev, crimeType: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Ingrese el tipo de delito"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Máximo de la Pena (2-12 años)
            </label>
            <input
              type="number"
              min="2"
              max="12"
              value={timelineData.maxPenaltyYears}
              onChange={(e) => setTimelineData(prev => ({ 
                ...prev, 
                maxPenaltyYears: validatePenaltyYears(parseInt(e.target.value)) 
              }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha del Hecho
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => {
                  const parsedDate = parse(e.target.value, 'dd/MM/yyyy', new Date());
                  if (isValid(parsedDate)) {
                    setTimelineData(prev => ({ ...prev, crimeDate: parsedDate }));
                  }
                }}
              />
              <DatePicker
                selectedDate={timelineData.crimeDate}
                onChange={(date) => setTimelineData(prev => ({ ...prev, crimeDate: date }))}
                label=""
              />
            </div>
          </div>
        </div>

        <Timeline events={timelineData.events} crimeDate={timelineData.crimeDate} />

        {/* Información de Prescripción por Etapas */}
        {prescriptionStages.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Análisis de Prescripción por Etapas
            </h3>
            <div className="grid gap-4">
              {prescriptionStages.map((stage, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    stage.isPrescribed ? 'bg-red-50' : 'bg-green-50'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{stage.name}</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Inicio: {format(stage.startDate, 'dd/MM/yyyy', { locale: es })}</p>
                    <p>Fin: {format(stage.endDate, 'dd/MM/yyyy', { locale: es })}</p>
                    <p>Fecha de prescripción: {format(stage.prescriptionDate, 'dd/MM/yyyy', { locale: es })}</p>
                    <p className={stage.isPrescribed ? 'text-red-600 font-semibold' : 'text-green-600'}>
                      Estado: {stage.isPrescribed ? 'Prescripto' : 'No prescripto'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Etapa de Instrucción */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Etapa de Instrucción
              {calculateStageDuration('instruction') && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (Duración: {calculateStageDuration('instruction')})
                </span>
              )}
            </h3>
            <div className="space-y-4">
              {timelineData.events
                .filter(event => event.stage === 'instruction')
                .map(event => (
                  <div key={event.id} className={`flex items-center space-x-4 p-4 rounded-lg ${
                    event.isInterruption ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                  }`}>
                    {event.isInterruption ? (
                      <Clock className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <Check className="h-5 w-5 text-gray-600" />
                    )}
                    <div className="flex-grow">
                      <p className={`font-medium ${
                        event.isInterruption ? 'text-indigo-900' : 'text-gray-900'
                      }`}>
                        {event.name}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <input
                          type="text"
                          placeholder="DD/MM/AAAA"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          onChange={(e) => handleDateInput(event.id, e.target.value)}
                        />
                        <DatePicker
                          selectedDate={event.date}
                          onChange={(date) => updateEvent(event.id, date)}
                          label=""
                          minDate={timelineData.crimeDate}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Etapa de Juicio */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Etapa de Juicio
              {calculateStageDuration('trial') && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (Duración: {calculateStageDuration('trial')})
                </span>
              )}
            </h3>
            <div className="space-y-4">
              {timelineData.events
                .filter(event => event.stage === 'trial')
                .map(event => (
                  <div key={event.id} className={`flex items-center space-x-4 p-4 rounded-lg ${
                    event.isInterruption ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                  }`}>
                    {event.isInterruption ? (
                      <Clock className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <Check className="h-5 w-5 text-gray-600" />
                    )}
                    <div className="flex-grow">
                      <p className={`font-medium ${
                        event.isInterruption ? 'text-indigo-900' : 'text-gray-900'
                      }`}>
                        {event.name}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <input
                          type="text"
                          placeholder="DD/MM/AAAA"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          onChange={(e) => handleDateInput(event.id, e.target.value)}
                        />
                        <DatePicker
                          selectedDate={event.date}
                          onChange={(date) => updateEvent(event.id, date)}
                          label=""
                          minDate={timelineData.crimeDate}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Etapa Recursiva */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Etapa Recursiva
              {calculateStageDuration('recurse') && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (Duración: {calculateStageDuration('recurse')})
                </span>
              )}
            </h3>
            <div className="space-y-4">
              {timelineData.events
                .filter(event => event.stage === 'recurse')
                .map(event => (
                  <div key={event.id} className="space-y-4 p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <Check className="h-5 w-5 text-gray-600" />
                      <div className="flex-grow">
                        <p className="font-medium text-gray-900">{event.name}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="DD/MM/AAAA"
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              onChange={(e) => handleDateInput(event.id, e.target.value)}
                            />
                            <DatePicker
                              selectedDate={event.date}
                              onChange={(date) => updateEvent(event.id, date)}
                              label="Fecha de inicio"
                              minDate={timelineData.crimeDate}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="DD/MM/AAAA"
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              onChange={(e) => {
                                const parsedDate = parse(e.target.value, 'dd/MM/yyyy', new Date());
                                if (isValid(parsedDate)) {
                                  updateEvent(event.id, event.date, parsedDate);
                                }
                              }}
                            />
                            <DatePicker
                              selectedDate={event.endDate}
                              onChange={(date) => updateEvent(event.id, event.date, date)}
                              label="Fecha de finalización"
                              minDate={timelineData.crimeDate}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tipo de Recurso
                            </label>
                            <select
                              value={event.recurseType || ''}
                              onChange={(e) => updateEvent(
                                event.id,
                                event.date,
                                event.endDate,
                                e.target.value as RecurseType
                              )}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">Seleccionar tipo</option>
                              <option value="apelacion">Apelación</option>
                              <option value="casacion">Casación</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tribunal Interviniente
                            </label>
                            <input
                              type="text"
                              value={event.tribunal || ''}
                              onChange={(e) => updateEvent(
                                event.id,
                                event.date,
                                event.endDate,
                                event.recurseType,
                                e.target.value
                              )}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Nombre del tribunal"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Duración Total del Proceso */}
          {calculateTotalDuration() && (
            <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-900">
                Duración Total del Proceso
              </h3>
              <p className="text-indigo-700 mt-2">
                {calculateTotalDuration()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};