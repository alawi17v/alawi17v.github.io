export type GamePhase = 'menu' | 'playing' | 'paused' | 'results';

export type GameActionType =
  | 'checkGlucose'
  | 'getBP'
  | 'checkPulse'
  | 'checkSpO2'
  | 'checkRespirations'
  | 'auscultateLungs'
  | 'insertNPA'
  | 'insertOPA'
  | 'beginBVM';

export type SeverityLevel = 'none' | 'minor' | 'critical';
export type StepType = 'info' | 'mcq' | 'actions';
export type StepBannerType = 'knowledge_check' | 'decision';
export type ScoreCategory =
  | 'Airway Management'
  | 'Oxygenation'
  | 'Suction Technique'
  | 'Recognition of Deterioration';

export type TimeoutBehavior = 'penaltyAndAdvance' | 'autoFailAndAdvance' | 'hold';

export interface VitalValue {
  value: string;
  hidden?: boolean;
  revealByAction?: GameActionType;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  correctness: boolean;
  rationale: string;
  severity: SeverityLevel;
  nextStepId?: string;
  scoreDelta: number;
}

export interface StepGatingRule {
  action: GameActionType;
  required: boolean;
  scope?: 'step' | 'scenario';
  message?: string;
  missedAssessmentPenalty?: number;
}

export interface TimeoutConfig {
  behavior: TimeoutBehavior;
  nextStepId?: string;
  scorePenalty?: number;
}

export interface ScenarioStep {
  stepId: string;
  stepNumber: number;
  stepType?: StepType;
  bannerType?: StepBannerType;
  prompt: string;
  context?: string;
  narrativeLines?: string[];
  completionLabel?: string;
  allowedActions: GameActionType[];
  vitals: {
    hr: VitalValue;
    spo2: VitalValue;
    bp: VitalValue;
    rr: VitalValue;
    etco2: VitalValue;
    temp?: VitalValue;
    glucose?: VitalValue;
  };
  audioCues?: {
    lungSounds?: string;
  };
  choices?: ScenarioChoice[];
  gatingRules?: StepGatingRule[];
  requiredActionSequence?: GameActionType[];
  scoreOnComplete?: number;
  sequenceFailurePenalty?: number;
  maxScore?: number;
  scoreCategory?: ScoreCategory;
  successRationale?: string;
  failureRationale?: string;
  timeoutRationale?: string;
  timeLimitSeconds: number;
  onTimeout?: TimeoutConfig;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  chiefComplaint: string;
  subtitle: string;
  location: string;
  patientAge: number;
  historyHighlights: string[];
  unitLabel: string;
  sceneStatus: string;
  patientPresentation: string;
  category: string;
  finalDiagnosis: string;
  educationalSummary: string[];
  steps: ScenarioStep[];
}

export interface ActionLogEntry {
  id: string;
  stepNumber: number;
  action: GameActionType | 'stepTimeout';
  label: string;
  atSeconds: number;
}

export interface StepReview {
  stepId: string;
  stepNumber: number;
  stepType: StepType;
  prompt: string;
  playerChoice: string;
  correctChoice: string;
  rationale: string;
  timeTakenSeconds: number;
  timeLimitSeconds: number;
  wasCorrect: boolean;
  timedOut: boolean;
  criticalError: boolean;
  missedActions: GameActionType[];
  scoreDelta: number;
  maxPoints: number;
  countsTowardAccuracy: boolean;
  scoreCategory: ScoreCategory | null;
}

export interface ScoreBreakdown {
  total: number;
  rawScore: number;
  maxScore: number;
  decisionAccuracy: number;
  timeEfficiency: number;
  criticalErrors: number;
  missedAssessments: number;
  correctDecisions: number;
  totalDecisions: number;
  airwayManagement: number;
  oxygenation: number;
  suctionTechnique: number;
  recognitionOfDeterioration: number;
}

export interface NotesState {
  notes: string;
  sample: {
    signsSymptoms: string;
    allergies: string;
    medications: string;
    pastHistory: string;
    lastOralIntake: string;
    eventsLeadingUp: string;
  };
  opqrst: {
    onset: string;
    provocation: string;
    quality: string;
    radiation: string;
    severity: string;
    time: string;
  };
}
