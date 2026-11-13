import type { ScenarioStep } from '../types';

interface DecisionPanelProps {
  step: ScenarioStep;
  totalSteps: number;
  canGoBack: boolean;
  selectedChoiceId: string | null;
  paused: boolean;
  gatingMessage: string | null;
  onBack: () => void;
  onSelectChoice: (choiceId: string) => void;
  onListen: () => void;
  onConfirm: () => void;
}

export function DecisionPanel({
  step,
  totalSteps,
  canGoBack,
  selectedChoiceId,
  paused,
  gatingMessage,
  onBack,
  onSelectChoice,
  onListen,
  onConfirm
}: DecisionPanelProps): JSX.Element {
  const stepType = step.stepType ?? (step.choices && step.choices.length > 0 ? 'mcq' : 'info');
  const choices = step.choices ?? [];
  const hasListenAction = step.allowedActions.includes('auscultateLungs');
  const confirmLabel =
    step.completionLabel ?? 'NEXT';
  const confirmDisabled =
    paused || (stepType === 'mcq' && !selectedChoiceId);
  const banner =
    step.bannerType === 'knowledge_check'
      ? (
          <div className="inline-flex rounded-lg border border-warning/60 bg-warning/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-warning">
            KNOWLEDGE CHECK
          </div>
        )
      : step.bannerType === 'decision'
        ? (
            <div className="inline-flex rounded-lg border border-accent/70 bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
              DECISION
            </div>
          )
        : null;

  return (
    <section className="relative self-start h-[620px] rounded-2xl border border-border bg-panel px-5 py-3 shadow-panel">
      <div className="mb-3">
        <div className="w-full">
          <div className="mb-2 flex min-h-7 items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {step.stepNumber}/{totalSteps}
            </p>
            {banner ? <div>{banner}</div> : <div className="h-7" />}
          </div>
          {step.context ? <p className="mt-1 whitespace-pre-line text-sm text-slate-300">{step.context}</p> : null}
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-100">{step.prompt}</h1>
          {step.narrativeLines && step.narrativeLines.length > 0 ? (
            <div className="mt-2 space-y-1 text-sm text-slate-300">
              {step.narrativeLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="h-[450px] overflow-y-auto pr-1 pb-14">
        {hasListenAction ? (
          <button
            className="mb-4 inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-panelSoft px-4 py-3 text-base font-medium text-slate-100 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={paused || !hasListenAction}
            onClick={onListen}
            type="button"
          >
            <span aria-hidden>▶</span>
            Listen to Lung Sounds
          </button>
        ) : null}

        <div className="mt-1 space-y-3">
          {choices.map((choice) => {
            const checked = selectedChoiceId === choice.id;
            return (
              <button
                key={choice.id}
                className={`w-full rounded-xl border px-4 py-4 text-left text-lg font-medium transition ${
                  checked
                    ? 'border-success bg-success/10 text-slate-100'
                    : 'border-border bg-panelSoft text-slate-100 hover:border-slate-500'
                } ${paused ? 'cursor-not-allowed opacity-60' : ''}`}
                disabled={paused}
                onClick={() => onSelectChoice(choice.id)}
                type="button"
              >
                {choice.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-3 right-5">
        {gatingMessage ? <p className="mb-3 text-sm text-warning">{gatingMessage}</p> : null}
        <div className="flex items-center justify-end gap-3">
          <button
            className="h-12 min-w-[160px] rounded-xl border border-border bg-panelSoft px-6 text-base font-semibold text-slate-100 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={paused || !canGoBack}
            onClick={onBack}
            type="button"
          >
            Back
          </button>
          <button
            className="h-12 min-w-[160px] rounded-xl border border-accent/70 bg-accent px-6 text-base font-semibold tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={confirmDisabled}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
