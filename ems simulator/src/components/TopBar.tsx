import { formatSeconds } from '../utils/time';

interface TopBarProps {
  unitLabel: string;
  sceneStatus: string;
  elapsedSeconds: number;
  paused: boolean;
  onStartOver: () => void;
  onPauseToggle: () => void;
  onExit: () => void;
}

export function TopBar({
  unitLabel,
  sceneStatus,
  elapsedSeconds,
  paused,
  onStartOver,
  onPauseToggle,
  onExit
}: TopBarProps): JSX.Element {
  return (
    <header className="mb-3 flex items-center justify-between rounded-2xl border border-border bg-panel px-4 py-3 shadow-panel">
      <div className="flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-200">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
        <span>{unitLabel}</span>
        <span className="text-slate-500">|</span>
        <span>{sceneStatus}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg border border-border bg-panelSoft px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500"
          onClick={onStartOver}
          type="button"
        >
          Reset
        </button>
        <button
          className="rounded-lg border border-warning/60 bg-warning/20 px-4 py-2 text-sm font-semibold text-warning transition hover:border-warning disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onPauseToggle}
          type="button"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          className="rounded-lg border border-accent/70 bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          onClick={onExit}
          type="button"
        >
          Exit
        </button>
        <div className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-base font-semibold text-success">
          {formatSeconds(Math.max(0, elapsedSeconds))}
        </div>
      </div>
    </header>
  );
}
