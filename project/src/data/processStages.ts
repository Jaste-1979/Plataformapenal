import { ProcessStage } from '../types';

export const processStages: ProcessStage[] = [
  { id: 'investigation', name: 'Investigación Preliminar', order: 1 },
  { id: 'instruction', name: 'Instrucción', order: 2 },
  { id: 'trial', name: 'Juicio', order: 3 },
  { id: 'recurse', name: 'Etapa Recursiva', order: 4 },
];

export const DEFAULT_EVENTS = [
  // Etapa de Instrucción
  { 
    id: 'instruction_start',
    name: 'Inicio de Instrucción',
    date: null,
    isInterruption: false,
    stage: 'instruction' as const,
    endDate: null
  },
  { 
    id: 'indictment',
    name: 'Primer llamado a indagatoria',
    date: null,
    isInterruption: true,
    stage: 'instruction' as const
  },
  { 
    id: 'declaration',
    name: 'Declaración indagatoria',
    date: null,
    isInterruption: false,
    stage: 'instruction' as const
  },
  { 
    id: 'processing',
    name: 'Procesamiento',
    date: null,
    isInterruption: false,
    stage: 'instruction' as const
  },
  { 
    id: 'instruction_end',
    name: 'Requerimiento de elevación a juicio',
    date: null,
    isInterruption: true,
    stage: 'instruction' as const
  },

  // Etapa de Juicio
  { 
    id: 'trial_citation',
    name: 'Decreto de citación a juicio',
    date: null,
    isInterruption: true,
    stage: 'trial' as const
  },
  { 
    id: 'sentence',
    name: 'Sentencia',
    date: null,
    isInterruption: false,
    stage: 'trial' as const
  },

  // Etapa Recursiva
  { 
    id: 'recurse_start',
    name: 'Inicio Etapa Recursiva',
    date: null,
    isInterruption: false,
    stage: 'recurse' as const,
    endDate: null,
    recurseType: null,
    tribunal: null
  }
];