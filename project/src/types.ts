export type CrimeType = {
  id: string;
  name: string;
  prescriptionYears: number;
};

export type ProcessStage = {
  id: string;
  name: string;
  order: number;
};

export type Case = {
  id: string;
  crimeDate: Date;
  crimeType: string;
  currentStage: string;
  notes?: string;
};

export type RecurseType = 'apelacion' | 'casacion';

export type ProcessEvent = {
  id: string;
  name: string;
  date: Date | null;
  isInterruption: boolean;
  stage: 'instruction' | 'trial' | 'recurse';
  endDate?: Date | null;
  recurseType?: RecurseType;
  tribunal?: string;
};

export type TimelineData = {
  crimeType: string;
  maxPenaltyYears: number;
  crimeDate: Date | null;
  events: ProcessEvent[];
};