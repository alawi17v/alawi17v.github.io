import { useGameStore } from '../state/gameStore';
import { formatSeconds } from '../utils/time';

export function ResultsScreen(): JSX.Element {
  const scenario = useGameStore((state) => state.scenario);
  const result = useGameStore((state) => state.results);
  const stepReviews = useGameStore((state) => state.stepReviews);
  const restartScenario = useGameStore((state) => state.restartScenario);
  const confirmExit = useGameStore((state) => state.confirmExit);

  if (!scenario || !result) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-200">
        Results unavailable.
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6">
      <section className="rounded-3xl border border-border bg-panel p-6 shadow-panel">
        <p className="text-sm uppercase tracking-[0.2em] text-success">Scenario Complete</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-100">{scenario.title}</h1>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <div className="rounded-xl border border-border bg-panelSoft/70 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Total Score</p>
            <p className="mt-2 text-4xl font-bold text-success">{result.total}</p>
            <p className="mt-1 text-xs text-slate-400">
              {result.rawScore} / {result.maxScore} pts
            </p>
          </div>
          <div className="rounded-xl border border-border bg-panelSoft/70 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Correct Decisions</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">
              {result.correctDecisions}/{result.totalDecisions}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-panelSoft/70 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Decision Accuracy</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">{result.decisionAccuracy}%</p>
          </div>
          <div className="rounded-xl border border-border bg-panelSoft/70 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Time Efficiency</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">{result.timeEfficiency}%</p>
          </div>
          <div className="rounded-xl border border-border bg-panelSoft/70 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Critical / Missed</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">
              {result.criticalErrors} / {result.missedAssessments}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-black/25 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Airway Management</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">{result.airwayManagement}%</p>
          </div>
          <div className="rounded-xl border border-border bg-black/25 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Oxygenation</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">{result.oxygenation}%</p>
          </div>
          <div className="rounded-xl border border-border bg-black/25 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Suction Technique</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">{result.suctionTechnique}%</p>
          </div>
          <div className="rounded-xl border border-border bg-black/25 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Recognition of Deterioration</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">
              {result.recognitionOfDeterioration}%
            </p>
          </div>
        </div>

        <h2 className="mt-7 text-xl font-semibold text-slate-100">Step-by-Step Review</h2>
        <div className="mt-3 space-y-3">
          {stepReviews.map((review) => (
            <article key={review.stepId} className="rounded-xl border border-border bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Step {review.stepNumber}</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">{review.prompt}</p>
              <p className="mt-2 text-sm text-slate-300">
                Your choice: <span className="font-medium text-slate-100">{review.playerChoice}</span>
              </p>
              <p className="text-sm text-slate-300">
                Correct choice: <span className="font-medium text-slate-100">{review.correctChoice}</span>
              </p>
              <p className="mt-1 text-sm text-slate-300">Rationale: {review.rationale}</p>
              <p className="mt-1 text-xs text-slate-400">
                Time: {formatSeconds(review.timeTakenSeconds)} / {formatSeconds(review.timeLimitSeconds)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Score impact: {review.scoreDelta >= 0 ? '+' : ''}
                {review.scoreDelta} pts
              </p>
              {review.missedActions.length > 0 ? (
                <p className="mt-1 text-xs text-warning">Missed assessments: {review.missedActions.join(', ')}</p>
              ) : null}
            </article>
          ))}
        </div>

        <h2 className="mt-7 text-xl font-semibold text-slate-100">Educational Summary</h2>
        <ul className="mt-2 space-y-1 text-sm text-slate-300">
          {scenario.educationalSummary.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="mt-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          Final Diagnosis: {scenario.finalDiagnosis}
        </p>

        <div className="mt-7 flex gap-3">
          <button
            className="rounded-xl border border-accent/70 bg-accent px-6 py-3 text-base font-semibold text-white"
            onClick={restartScenario}
            type="button"
          >
            Reset
          </button>
          <button
            className="rounded-xl border border-border bg-panelSoft px-6 py-3 text-base font-semibold text-slate-100"
            onClick={confirmExit}
            type="button"
          >
            Return to Menu
          </button>
        </div>
      </section>
    </main>
  );
}
