interface ActiveCallPanelProps {
  title: string;
  subtitle: string;
  location: string;
}

export function ActiveCallPanel({ title, subtitle, location }: ActiveCallPanelProps): JSX.Element {
  return (
    <section className="rounded-2xl border border-border bg-panel p-4 shadow-panel">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-warning">Active Call</h2>
      <div className="rounded-xl border border-border bg-panelSoft/50 p-4">
        <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
        <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
        <p className="mt-3 text-sm font-medium text-slate-200">{location}</p>
      </div>
    </section>
  );
}
