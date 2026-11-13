import type { GameActionType } from '../types';

export interface ActionDisplay {
  label: string;
  logLabel: string;
  emphasis: 'default' | 'primary';
}

export const ACTION_DISPLAY: Record<GameActionType, ActionDisplay> = {
  checkGlucose: {
    label: 'Check glucose',
    logLabel: 'Checked glucose',
    emphasis: 'default'
  },
  getBP: {
    label: 'Check blood pressure',
    logLabel: 'Checked blood pressure',
    emphasis: 'primary'
  },
  checkPulse: {
    label: 'Check pulse',
    logLabel: 'Checked pulse',
    emphasis: 'default'
  },
  checkSpO2: {
    label: 'Check oxygen saturation',
    logLabel: 'Checked oxygen saturation',
    emphasis: 'default'
  },
  checkRespirations: {
    label: 'Check respirations',
    logLabel: 'Checked respirations',
    emphasis: 'default'
  },
  auscultateLungs: {
    label: 'Auscultate Lungs',
    logLabel: 'Auscultated lung sounds',
    emphasis: 'default'
  },
  insertNPA: {
    label: 'Insert NPA',
    logLabel: 'Inserted nasopharyngeal airway',
    emphasis: 'primary'
  },
  insertOPA: {
    label: 'Insert OPA',
    logLabel: 'Inserted oropharyngeal airway',
    emphasis: 'primary'
  },
  beginBVM: {
    label: 'Begin BVM',
    logLabel: 'Started BVM ventilation',
    emphasis: 'primary'
  }
};

export const ACTION_ORDER: GameActionType[] = [
  'getBP',
  'checkPulse',
  'checkSpO2',
  'checkRespirations',
  'checkGlucose',
  'insertNPA',
  'insertOPA',
  'beginBVM',
  'auscultateLungs'
];
