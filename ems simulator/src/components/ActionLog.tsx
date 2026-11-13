import { useState } from 'react';
import type { ActionLogEntry } from '../types';
import { formatSeconds } from '../utils/time';

interface ActionLogProps {
  logs: ActionLogEntry[];
}

export function ActionLog({ logs }: ActionLogProps): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-3 rounded-2xl border border-border bg-panel p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">Action Log</h2>
        <button
          className="rounded-lg border border-border bg-panelSoft px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-200 transition hover:border-slate-500"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open ? (
        <div className="rounded-xl border border-border bg-black/25 p-3">
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <li className="rounded-lg border border-border bg-black/20 p-2 text-sm text-slate-400">
                No actions logged yet.
              </li>
            ) : (
              logs
                .slice()
                .reverse()
                .map((entry) => (
                  <li key={entry.id} className="rounded-lg border border-border bg-black/20 p-2 text-sm text-slate-200">
                    <span className="mr-2 font-mono text-slate-400">{formatSeconds(entry.atSeconds)}</span>
                    <span>{entry.label}</span>
                    <span className="ml-2 text-xs text-slate-400">(Step {entry.stepNumber})</span>
                  </li>
                ))
            )}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
