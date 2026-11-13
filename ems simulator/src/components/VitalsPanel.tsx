import patientPlaceholder from '../assets/patient-placeholder.svg';
import { ACTION_DISPLAY } from '../constants/actions';
import type { GameActionType, ScenarioStep } from '../types';

interface VitalsPanelProps {
  step: ScenarioStep;
  patientAge: number;
  presentation: string;
  actionsInStep: GameActionType[];
  actionsAcrossScenario: GameActionType[];
  paused: boolean;
  onAction: (action: GameActionType) => void;
}

const monitorOrder: Array<{
  key: 'hr' | 'spo2' | 'bp' | 'rr' | 'glucose';
  label: string;
  unit: string;
}> = [
  { key: 'hr', label: 'HR', unit: 'bpm' },
  { key: 'spo2', label: 'SpO2', unit: '%' },
  { key: 'bp', label: 'BP', unit: 'mmHg' },
  { key: 'rr', label: 'Respirations', unit: 'rpm' },
  { key: 'glucose', label: 'Glucose', unit: '' }
];

function isVitalVisible(
  hidden: boolean | undefined,
  revealByAction: GameActionType | undefined,
  actionsInStep: GameActionType[],
  actionsAcrossScenario: GameActionType[]
): boolean {
  if (!hidden) {
    return true;
  }

  if (!revealByAction) {
    return !hidden;
  }

  return actionsInStep.includes(revealByAction) || actionsAcrossScenario.includes(revealByAction);
}

function actionEnabled(step: ScenarioStep, action: GameActionType, paused: boolean): boolean {
  return !paused && step.allowedActions.includes(action);
}

export function VitalsPanel({
  step,
  patientAge,
  presentation,
  actionsInStep,
  actionsAcrossScenario,
  paused,
  onAction
}: VitalsPanelProps): JSX.Element {
  const actions = ['getBP', 'checkPulse', 'checkSpO2', 'checkRespirations', 'checkGlucose'] as const;

  return (
    <section className="rounded-2xl border border-border bg-panel p-3 shadow-panel">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-success">Vitals Monitor</h2>

      <div className="mb-3 rounded-xl border border-border bg-black/80 p-3">
        <div className="grid grid-cols-2 gap-3">
          {monitorOrder.map((item) => {
            const source = step.vitals[item.key] ?? { value: '--', hidden: true };
            const visible = isVitalVisible(
              source.hidden,
              source.revealByAction,
              actionsInStep,
              actionsAcrossScenario
            );
            return (
              <div key={item.key} className="rounded-md border border-slate-800 bg-black/60 p-2">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className="monitor-blink min-h-12 overflow-hidden font-mono text-lg font-bold leading-tight text-warning [overflow-wrap:anywhere]">
                  {visible ? source.value : '--'}
                </p>
                <p className="text-[10px] text-slate-500">{item.unit}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        {actions.map((actionType) => {
          const enabled = actionEnabled(step, actionType, paused);
          const actionUsed =
            actionsInStep.includes(actionType) || actionsAcrossScenario.includes(actionType);

          const styleClass =
            ACTION_DISPLAY[actionType].emphasis === 'primary'
              ? 'border-warning/50 bg-warning/20 text-warning hover:border-warning'
              : 'border-border bg-panelSoft text-slate-100 hover:border-slate-500';

          return (
            <button
              key={actionType}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${styleClass} ${
                !enabled ? 'cursor-not-allowed opacity-45' : ''
              } ${actionUsed ? 'ring-1 ring-success/60' : ''}`}
              disabled={!enabled}
              onClick={() => onAction(actionType)}
              type="button"
            >
              {ACTION_DISPLAY[actionType].label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-panelSoft/50 p-3">
        <img
          alt="Patient placeholder illustration"
          className="mb-3 h-44 w-full rounded-lg object-cover"
          src={patientPlaceholder}
        />
        <p className="text-center text-base font-semibold text-slate-100">{patientAge} year old male</p>
        <p className="mt-1 text-center text-sm leading-relaxed text-slate-300">{presentation}</p>

      </div>
    </section>
  );
}
