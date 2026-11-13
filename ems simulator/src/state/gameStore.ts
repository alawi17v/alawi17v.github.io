import { create } from 'zustand';
import { ACTION_DISPLAY } from '../constants/actions';
import { getScenarioById, scenarios } from '../scenarios';
import type {
  ActionLogEntry,
  GameActionType,
  GamePhase,
  NotesState,
  ScenarioChoice,
  ScenarioDefinition,
  ScenarioStep,
  ScoreBreakdown,
  ScoreCategory,
  StepGatingRule,
  StepReview,
  StepType
} from '../types';

const STORAGE_KEY = 'ems-simulator-progress-v2';

const notesDefaults: NotesState = {
  notes: '',
  sample: {
    signsSymptoms: '',
    allergies: '',
    medications: '',
    pastHistory: '',
    lastOralIntake: '',
    eventsLeadingUp: ''
  },
  opqrst: {
    onset: '',
    provocation: '',
    quality: '',
    radiation: '',
    severity: '',
    time: ''
  }
};

type NotesTab = 'notes' | 'sample' | 'opqrst';

interface PersistedGameState {
  persistEnabled: boolean;
  phase: GamePhase;
  scenarioId: string | null;
  currentStepIndex: number;
  stepTimeRemaining: number;
  stepElapsed: number;
  totalElapsed: number;
  selectedChoiceId: string | null;
  actionsByStep: Record<string, GameActionType[]>;
  performedScenarioActions: GameActionType[];
  actionLog: ActionLogEntry[];
  stepReviews: StepReview[];
  notes: NotesState;
  activeNotesTab: NotesTab;
  results: ScoreBreakdown | null;
}

interface GameStore {
  phase: GamePhase;
  scenario: ScenarioDefinition | null;
  currentStepIndex: number;
  stepTimeRemaining: number;
  stepElapsed: number;
  totalElapsed: number;
  selectedChoiceId: string | null;
  actionsByStep: Record<string, GameActionType[]>;
  performedScenarioActions: GameActionType[];
  actionLog: ActionLogEntry[];
  stepReviews: StepReview[];
  notes: NotesState;
  activeNotesTab: NotesTab;
  persistEnabled: boolean;
  showExitConfirm: boolean;
  gatingMessage: string | null;
  results: ScoreBreakdown | null;
  startScenario: (scenarioId?: string) => void;
  resumeScenario: () => void;
  restartScenario: () => void;
  goBackStep: () => void;
  tick: () => void;
  togglePause: () => void;
  requestExit: () => void;
  cancelExit: () => void;
  confirmExit: () => void;
  selectChoice: (choiceId: string) => void;
  performAction: (action: GameActionType) => void;
  confirmAction: () => void;
  updateNotes: (tab: NotesTab, field: string, value: string) => void;
  setNotesTab: (tab: NotesTab) => void;
  togglePersistence: (enabled: boolean) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getStepType(step: ScenarioStep): StepType {
  if (step.stepType) {
    return step.stepType;
  }

  return step.choices && step.choices.length > 0 ? 'mcq' : 'info';
}

function getStepChoices(step: ScenarioStep): ScenarioChoice[] {
  return step.choices ?? [];
}

function getCorrectChoice(step: ScenarioStep): ScenarioChoice | undefined {
  return getStepChoices(step).find((choice) => choice.correctness);
}

function getStepMaxPoints(step: ScenarioStep): number {
  if (typeof step.maxScore === 'number') {
    return Math.max(0, step.maxScore);
  }

  const stepType = getStepType(step);
  if (stepType === 'mcq') {
    return Math.max(
      0,
      ...getStepChoices(step)
        .filter((choice) => choice.scoreDelta > 0)
        .map((choice) => choice.scoreDelta)
    );
  }

  if (stepType === 'actions') {
    return Math.max(0, step.scoreOnComplete ?? 0);
  }

  return Math.max(0, step.scoreOnComplete ?? 0);
}

function getMissingRequiredActions(
  step: ScenarioStep,
  actionsByStep: Record<string, GameActionType[]>,
  performedScenarioActions: GameActionType[]
): StepGatingRule[] {
  const rules = step.gatingRules ?? [];
  return rules.filter((rule) => {
    if (!rule.required) {
      return false;
    }

    const performedInStep = (actionsByStep[step.stepId] ?? []).includes(rule.action);
    const performedInScenario = performedScenarioActions.includes(rule.action);

    if (rule.scope === 'scenario') {
      return !performedInScenario;
    }

    return !performedInStep;
  });
}

function sequenceSatisfied(
  actionSequence: GameActionType[],
  requiredSequence: GameActionType[]
): boolean {
  if (requiredSequence.length === 0) {
    return true;
  }

  let index = 0;
  for (const action of actionSequence) {
    if (action === requiredSequence[index]) {
      index += 1;
    }

    if (index >= requiredSequence.length) {
      return true;
    }
  }

  return false;
}

function createLogEntry(
  action: ActionLogEntry['action'],
  label: string,
  stepNumber: number,
  atSeconds: number
): ActionLogEntry {
  return {
    id: `${action}-${stepNumber}-${atSeconds}-${Math.random().toString(16).slice(2)}`,
    action,
    label,
    stepNumber,
    atSeconds
  };
}

function getInitialScenario(): ScenarioDefinition {
  return scenarios[0];
}

function toPersistedState(state: GameStore): PersistedGameState {
  return {
    persistEnabled: state.persistEnabled,
    phase: state.phase,
    scenarioId: state.scenario?.id ?? null,
    currentStepIndex: state.currentStepIndex,
    stepTimeRemaining: state.stepTimeRemaining,
    stepElapsed: state.stepElapsed,
    totalElapsed: state.totalElapsed,
    selectedChoiceId: state.selectedChoiceId,
    actionsByStep: state.actionsByStep,
    performedScenarioActions: state.performedScenarioActions,
    actionLog: state.actionLog,
    stepReviews: state.stepReviews,
    notes: state.notes,
    activeNotesTab: state.activeNotesTab,
    results: state.results
  };
}

function saveState(state: GameStore): void {
  if (!state.persistEnabled) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersistedState(state)));
}

function clearPersistedState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function loadPersistedState(): PersistedGameState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedGameState;
  } catch {
    return null;
  }
}

function nextStepIndexForChoice(
  scenario: ScenarioDefinition,
  currentStepIndex: number,
  choice?: ScenarioChoice,
  timeoutNextStepId?: string
): number {
  const mappedStepId = choice?.nextStepId ?? timeoutNextStepId;
  if (mappedStepId) {
    const mappedIndex = scenario.steps.findIndex((step) => step.stepId === mappedStepId);
    if (mappedIndex !== -1) {
      return mappedIndex;
    }
  }

  return currentStepIndex + 1;
}

function categoryPercent(stepReviews: StepReview[], category: ScoreCategory): number {
  const categoryReviews = stepReviews.filter((review) => review.scoreCategory === category && review.maxPoints > 0);
  if (categoryReviews.length === 0) {
    return 0;
  }

  const earned = categoryReviews.reduce((sum, review) => sum + review.scoreDelta, 0);
  const possible = categoryReviews.reduce((sum, review) => sum + review.maxPoints, 0);

  if (possible <= 0) {
    return 0;
  }

  return clamp(Math.round((Math.max(0, earned) / possible) * 100), 0, 100);
}

function buildScore(stepReviews: StepReview[]): ScoreBreakdown {
  const scoredSteps = stepReviews.filter((review) => review.maxPoints > 0);
  const rawScore = scoredSteps.reduce((sum, review) => sum + review.scoreDelta, 0);
  const maxScore = scoredSteps.reduce((sum, review) => sum + review.maxPoints, 0);

  const decisionReviews = stepReviews.filter((review) => review.countsTowardAccuracy);
  const totalDecisions = decisionReviews.length;
  const correctDecisions = decisionReviews.filter((review) => review.wasCorrect).length;
  const decisionAccuracy =
    totalDecisions === 0 ? 0 : Math.round((correctDecisions / totalDecisions) * 100);

  const timedReviews = stepReviews.filter((review) => review.timeLimitSeconds > 0);
  const timeEfficiency =
    timedReviews.length === 0
      ? 0
      : Math.round(
          (timedReviews.reduce((total, review) => {
            const ratio = clamp(1 - review.timeTakenSeconds / review.timeLimitSeconds, 0, 1);
            return total + ratio;
          }, 0) /
            timedReviews.length) *
            100
        );

  return {
    total: maxScore > 0 ? clamp(Math.round((rawScore / maxScore) * 100), 0, 100) : 0,
    rawScore,
    maxScore,
    decisionAccuracy,
    timeEfficiency,
    criticalErrors: stepReviews.filter((review) => review.criticalError).length,
    missedAssessments: stepReviews.reduce((sum, review) => sum + review.missedActions.length, 0),
    correctDecisions,
    totalDecisions,
    airwayManagement: categoryPercent(stepReviews, 'Airway Management'),
    oxygenation: categoryPercent(stepReviews, 'Oxygenation'),
    suctionTechnique: categoryPercent(stepReviews, 'Suction Technique'),
    recognitionOfDeterioration: categoryPercent(stepReviews, 'Recognition of Deterioration')
  };
}

export const useGameStore = create<GameStore>((set, get) => {
  const persisted = loadPersistedState();
  const fallbackScenario = getInitialScenario();
  const persistedScenario = persisted?.scenarioId
    ? getScenarioById(persisted.scenarioId) ?? fallbackScenario
    : fallbackScenario;
  const initialStep = persistedScenario.steps[persisted?.currentStepIndex ?? 0] ?? persistedScenario.steps[0];

  return {
    phase: persisted?.phase ?? 'menu',
    scenario: persistedScenario,
    currentStepIndex: persisted?.currentStepIndex ?? 0,
    stepTimeRemaining: persisted?.stepTimeRemaining ?? initialStep.timeLimitSeconds,
    stepElapsed: persisted?.stepElapsed ?? 0,
    totalElapsed: persisted?.totalElapsed ?? 0,
    selectedChoiceId: persisted?.selectedChoiceId ?? null,
    actionsByStep: persisted?.actionsByStep ?? {},
    performedScenarioActions: persisted?.performedScenarioActions ?? [],
    actionLog: persisted?.actionLog ?? [],
    stepReviews: persisted?.stepReviews ?? [],
    notes: persisted?.notes ?? notesDefaults,
    activeNotesTab: persisted?.activeNotesTab ?? 'notes',
    persistEnabled: persisted?.persistEnabled ?? true,
    showExitConfirm: false,
    gatingMessage: null,
    results: persisted?.results ?? null,

    startScenario: (scenarioId?: string) => {
      const scenario = scenarioId ? getScenarioById(scenarioId) ?? getInitialScenario() : getInitialScenario();
      set({
        phase: 'playing',
        scenario,
        currentStepIndex: 0,
        stepTimeRemaining: scenario.steps[0]?.timeLimitSeconds ?? 60,
        stepElapsed: 0,
        totalElapsed: 0,
        selectedChoiceId: null,
        actionsByStep: {},
        performedScenarioActions: [],
        actionLog: [],
        stepReviews: [],
        notes: notesDefaults,
        activeNotesTab: 'notes',
        showExitConfirm: false,
        gatingMessage: null,
        results: null
      });
      saveState(get());
    },

    resumeScenario: () => {
      const current = get();
      if (!current.scenario) {
        return;
      }

      set({ phase: 'playing' });
      saveState(get());
    },

    restartScenario: () => {
      const current = get();
      if (!current.scenario) {
        return;
      }

      set({
        phase: 'playing',
        currentStepIndex: 0,
        stepTimeRemaining: current.scenario.steps[0]?.timeLimitSeconds ?? 60,
        stepElapsed: 0,
        totalElapsed: 0,
        selectedChoiceId: null,
        actionsByStep: {},
        performedScenarioActions: [],
        actionLog: [],
        stepReviews: [],
        notes: notesDefaults,
        activeNotesTab: 'notes',
        showExitConfirm: false,
        gatingMessage: null,
        results: null
      });
      saveState(get());
    },

    goBackStep: () => {
      const state = get();
      const scenario = state.scenario;
      if (!scenario || state.currentStepIndex === 0) {
        return;
      }

      const targetIndex = state.currentStepIndex - 1;
      const targetStep = scenario.steps[targetIndex];
      const retainedSteps = scenario.steps.slice(0, targetIndex);
      const allowedStepIds = new Set(retainedSteps.map((step) => step.stepId));

      const filteredActionsByStep = Object.fromEntries(
        Object.entries(state.actionsByStep).filter(([stepId]) => allowedStepIds.has(stepId))
      ) as Record<string, GameActionType[]>;

      const filteredActionLog = state.actionLog.filter((entry) => entry.stepNumber < targetStep.stepNumber);
      const filteredReviews = state.stepReviews.filter((review) => review.stepNumber < targetStep.stepNumber);
      const recomputedScenarioActions = Array.from(
        new Set(Object.values(filteredActionsByStep).flat())
      );

      set({
        phase: state.phase === 'results' ? 'playing' : state.phase,
        currentStepIndex: targetIndex,
        selectedChoiceId: null,
        stepElapsed: 0,
        stepTimeRemaining: targetStep.timeLimitSeconds,
        actionsByStep: filteredActionsByStep,
        performedScenarioActions: recomputedScenarioActions,
        actionLog: filteredActionLog,
        stepReviews: filteredReviews,
        gatingMessage: null,
        results: null
      });
      saveState(get());
    },

    tick: () => {
      const state = get();
      if (state.phase !== 'playing' || !state.scenario) {
        return;
      }

      set({
        stepElapsed: state.stepElapsed + 1,
        totalElapsed: state.totalElapsed + 1
      });
      saveState(get());
    },

    togglePause: () => {
      const state = get();
      if (state.phase === 'playing') {
        set({ phase: 'paused' });
      } else if (state.phase === 'paused') {
        set({ phase: 'playing' });
      }
      saveState(get());
    },

    requestExit: () => {
      set({ showExitConfirm: true });
    },

    cancelExit: () => {
      set({ showExitConfirm: false });
    },

    confirmExit: () => {
      set({
        phase: 'menu',
        showExitConfirm: false,
        gatingMessage: null
      });
      saveState(get());
    },

    selectChoice: (choiceId: string) => {
      const state = get();
      if (state.phase !== 'playing') {
        return;
      }

      set({ selectedChoiceId: choiceId, gatingMessage: null });
      saveState(get());
    },

    performAction: (action: GameActionType) => {
      const state = get();
      const scenario = state.scenario;
      if (state.phase !== 'playing' || !scenario) {
        return;
      }

      const step = scenario.steps[state.currentStepIndex];
      if (!step || !step.allowedActions.includes(action)) {
        return;
      }

      const currentActions = state.actionsByStep[step.stepId] ?? [];
      if (currentActions.includes(action)) {
        return;
      }

      set({
        actionsByStep: {
          ...state.actionsByStep,
          [step.stepId]: [...currentActions, action]
        },
        performedScenarioActions: state.performedScenarioActions.includes(action)
          ? state.performedScenarioActions
          : [...state.performedScenarioActions, action],
        actionLog: [
          ...state.actionLog,
          createLogEntry(action, ACTION_DISPLAY[action].logLabel, step.stepNumber, state.totalElapsed)
        ],
        gatingMessage: null
      });
      saveState(get());
    },

    confirmAction: () => {
      const state = get();
      const scenario = state.scenario;
      if (state.phase !== 'playing' || !scenario) {
        return;
      }

      const step = scenario.steps[state.currentStepIndex];
      if (!step) {
        return;
      }

      const stepType = getStepType(step);
      const missingActions = getMissingRequiredActions(
        step,
        state.actionsByStep,
        state.performedScenarioActions
      );

      if (missingActions.length > 0) {
        set({ gatingMessage: missingActions[0].message ?? 'Required assessment/action missing.' });
        return;
      }

      const stepChoices = getStepChoices(step);
      const selectedChoice =
        stepType === 'mcq'
          ? stepChoices.find((choice) => choice.id === state.selectedChoiceId) ?? null
          : null;

      if (stepType === 'mcq' && !selectedChoice) {
        return;
      }

      const stepActions = state.actionsByStep[step.stepId] ?? [];
      const sequenceTarget = step.requiredActionSequence ?? [];
      const sequenceValid =
        stepType !== 'actions' ? true : sequenceSatisfied(stepActions, sequenceTarget);

      const correctChoice = getCorrectChoice(step);
      const maxPoints = getStepMaxPoints(step);

      const review: StepReview = {
        stepId: step.stepId,
        stepNumber: step.stepNumber,
        stepType,
        prompt: step.prompt,
        playerChoice:
          stepType === 'mcq'
            ? (selectedChoice?.label ?? 'No choice selected')
            : stepType === 'actions'
              ? sequenceValid
                ? 'Completed required airway actions'
                : 'Completed actions out of sequence'
              : 'Advanced to next step',
        correctChoice:
          stepType === 'mcq'
            ? (correctChoice?.label ?? 'No configured answer')
            : stepType === 'actions'
              ? sequenceTarget.map((action) => ACTION_DISPLAY[action].label).join(' -> ') || 'Complete required actions'
              : 'N/A',
        rationale:
          stepType === 'mcq'
            ? (selectedChoice?.rationale ?? step.context ?? 'No rationale configured.')
            : stepType === 'actions'
              ? sequenceValid
                ? (step.successRationale ?? step.context ?? 'Correct airway support sequence.')
                : (step.failureRationale ?? 'Action sequence was not appropriate.')
              : (step.context ?? 'Narrative progression.'),
        timeTakenSeconds: state.stepElapsed,
        timeLimitSeconds: step.timeLimitSeconds,
        wasCorrect:
          stepType === 'mcq'
            ? Boolean(selectedChoice?.correctness)
            : stepType === 'actions'
              ? sequenceValid
              : true,
        timedOut: false,
        criticalError:
          stepType === 'mcq'
            ? selectedChoice?.severity === 'critical'
            : stepType === 'actions'
              ? !sequenceValid && (step.sequenceFailurePenalty ?? 0) >= 15
              : false,
        missedActions: getMissingRequiredActions(
          step,
          state.actionsByStep,
          state.performedScenarioActions
        ).map((rule) => rule.action),
        scoreDelta:
          stepType === 'mcq'
            ? (selectedChoice?.scoreDelta ?? 0)
            : stepType === 'actions'
              ? sequenceValid
                ? (step.scoreOnComplete ?? 0)
                : -(step.sequenceFailurePenalty ?? Math.max(step.maxScore ?? 10, 10))
              : (step.scoreOnComplete ?? 0),
        maxPoints,
        countsTowardAccuracy: stepType !== 'info',
        scoreCategory: step.scoreCategory ?? null
      };

      const nextIndex = nextStepIndexForChoice(
        scenario,
        state.currentStepIndex,
        selectedChoice ?? undefined
      );
      const nextStep = scenario.steps[nextIndex];
      const nextReviews = [...state.stepReviews, review];

      set({
        stepReviews: nextReviews,
        actionLog: state.actionLog,
        currentStepIndex: nextIndex,
        stepTimeRemaining: nextStep?.timeLimitSeconds ?? 0,
        stepElapsed: 0,
        selectedChoiceId: null,
        gatingMessage: null,
        phase: nextStep ? state.phase : 'results',
        results: nextStep ? state.results : buildScore(nextReviews)
      });
      saveState(get());
    },

    updateNotes: (tab, field, value) => {
      const state = get();
      if (tab === 'notes') {
        set({ notes: { ...state.notes, notes: value } });
      } else if (tab === 'sample') {
        set({
          notes: {
            ...state.notes,
            sample: {
              ...state.notes.sample,
              [field]: value
            }
          }
        });
      } else {
        set({
          notes: {
            ...state.notes,
            opqrst: {
              ...state.notes.opqrst,
              [field]: value
            }
          }
        });
      }
      saveState(get());
    },

    setNotesTab: (tab) => {
      set({ activeNotesTab: tab });
      saveState(get());
    },

    togglePersistence: (enabled) => {
      set({ persistEnabled: enabled });
      if (!enabled) {
        clearPersistedState();
      } else {
        saveState(get());
      }
    }
  };
});
