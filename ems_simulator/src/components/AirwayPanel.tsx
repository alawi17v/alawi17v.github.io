import { ACTION_DISPLAY } from '../constants/actions';
import type { GameActionType, ScenarioStep } from '../types';

interface AirwayPanelProps {
  step: ScenarioStep;
  actionsInStep: GameActionType[];
  actionsAcrossScenario: GameActionType[];
  paused: boolean;
  onAction: (action: GameActionType) => void;
}

const airwayActions: GameActionType[] = ['insertNPA', 'insertOPA', 'beginBVM', 'auscultateLungs'];

export function AirwayPanel({
  step,
  actionsInStep,
  actionsAcrossScenario,
  paused,
  onAction
}: AirwayPanelProps): JSX.Element {
  return (
    <section className="rounded-2xl border border-border bg-panel p-3 shadow-panel">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-warning">Airway</h2>
      <div className="space-y-2">
        {airwayActions.map((actionType) => {
          const enabled = !paused && step.allowedActions.includes(actionType);
          const actionUsed =
            actionsInStep.includes(actionType) || actionsAcrossScenario.includes(actionType);

          return (
            <button
              key={actionType}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                actionUsed
                  ? 'border-success/50 bg-success/10 text-success'
                  : 'border-border bg-panelSoft text-slate-100 hover:border-slate-500'
              } ${!enabled ? 'cursor-not-allowed opacity-45' : ''}`}
              disabled={!enabled}
              onClick={() => onAction(actionType)}
              type="button"
            >
              {ACTION_DISPLAY[actionType].label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
