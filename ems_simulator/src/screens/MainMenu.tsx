import { useGameStore } from '../state/gameStore';

export function MainMenu(): JSX.Element {
  const scenario = useGameStore((state) => state.scenario);
  const startScenario = useGameStore((state) => state.startScenario);
  const resumeScenario = useGameStore((state) => state.resumeScenario);
  const togglePersistence = useGameStore((state) => state.togglePersistence);
  const persistEnabled = useGameStore((state) => state.persistEnabled);
  const stepReviews = useGameStore((state) => state.stepReviews);
  const totalElapsed = useGameStore((state) => state.totalElapsed);
  const hasProgress = stepReviews.length > 0 || totalElapsed > 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8">
      <section className="w-full rounded-3xl border border-border bg-panel p-10 shadow-panel">
        <p className="text-sm uppercase tracking-[0.25em] text-success">EMS Clinical Simulator</p>
        <h1 className="mt-3 text-5xl font-semibold text-slate-100">Decision-Making Scenario Trainer</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-300">
          Run through realistic EMS call steps with timed decisions, monitor actions, and structured documentation tabs.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-panelSoft/60 p-6">
          <h2 className="text-2xl font-semibold text-slate-100">{scenario?.title}</h2>
          <p className="mt-2 text-sm text-slate-300">{scenario?.subtitle}</p>
          <p className="mt-2 text-sm text-slate-300">Location: {scenario?.location}</p>
          <p className="mt-4 text-sm text-slate-400">Steps: {scenario?.steps.length ?? 0}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            className="rounded-xl border border-accent/70 bg-accent px-6 py-3 text-lg font-semibold text-white"
            onClick={() => startScenario(scenario?.id)}
            type="button"
          >
            Start Scenario
          </button>

          {hasProgress ? (
            <button
              className="rounded-xl border border-border bg-panelSoft px-6 py-3 text-lg font-semibold text-slate-100"
              onClick={resumeScenario}
              type="button"
            >
              Resume Saved Progress
            </button>
          ) : null}

          <button
            aria-pressed={persistEnabled}
            className="rounded-xl border border-border bg-black/25 px-5 py-3 text-sm font-semibold text-slate-200"
            onClick={() => togglePersistence(!persistEnabled)}
            type="button"
          >
            Persistence: {persistEnabled ? 'On' : 'Off'}
          </button>
        </div>
      </section>
    </main>
  );
}
