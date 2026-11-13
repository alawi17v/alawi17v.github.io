import type { NotesState } from '../types';

interface NotesHistoryPanelProps {
  notes: NotesState;
  activeTab: 'notes' | 'sample' | 'opqrst';
  onTabChange: (tab: 'notes' | 'sample' | 'opqrst') => void;
  onUpdate: (tab: 'notes' | 'sample' | 'opqrst', field: string, value: string) => void;
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-border bg-black/25 px-3 py-2 text-sm text-slate-100"
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
    </label>
  );
}

export function NotesHistoryPanel({
  notes,
  activeTab,
  onTabChange,
  onUpdate
}: NotesHistoryPanelProps): JSX.Element {
  const tabs: Array<{ id: 'notes' | 'sample' | 'opqrst'; label: string }> = [
    { id: 'notes', label: 'Notes' },
    { id: 'sample', label: 'SAMPLE' },
    { id: 'opqrst', label: 'OPQRST' }
  ];

  return (
    <section className="mt-3 rounded-2xl border border-border bg-panel p-4 shadow-panel">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">Notes / History</h2>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-warning/50 bg-warning/10 text-warning'
                : 'border-border bg-panelSoft text-slate-200 hover:border-slate-500'
            }`}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'notes' ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-warning">Notes</p>
          <textarea
            className="min-h-[280px] w-full rounded-xl border border-border bg-black/35 p-3 text-sm leading-relaxed text-slate-100"
            onChange={(event) => onUpdate('notes', 'notes', event.target.value)}
            placeholder="Document patient findings, treatments, observations, vital signs, medications administered..."
            value={notes.notes}
          />
        </div>
      ) : null}

      {activeTab === 'sample' ? (
        <div className="space-y-2">
          <Field
            label="Signs/Symptoms"
            onChange={(value) => onUpdate('sample', 'signsSymptoms', value)}
            value={notes.sample.signsSymptoms}
          />
          <Field
            label="Allergies"
            onChange={(value) => onUpdate('sample', 'allergies', value)}
            value={notes.sample.allergies}
          />
          <Field
            label="Medications"
            onChange={(value) => onUpdate('sample', 'medications', value)}
            value={notes.sample.medications}
          />
          <Field
            label="Past Medical History"
            onChange={(value) => onUpdate('sample', 'pastHistory', value)}
            value={notes.sample.pastHistory}
          />
          <Field
            label="Last Oral Intake"
            onChange={(value) => onUpdate('sample', 'lastOralIntake', value)}
            value={notes.sample.lastOralIntake}
          />
          <Field
            label="Events Leading Up"
            onChange={(value) => onUpdate('sample', 'eventsLeadingUp', value)}
            value={notes.sample.eventsLeadingUp}
          />
        </div>
      ) : null}

      {activeTab === 'opqrst' ? (
        <div className="space-y-2">
          <Field label="Onset" onChange={(value) => onUpdate('opqrst', 'onset', value)} value={notes.opqrst.onset} />
          <Field
            label="Provocation/Palliation"
            onChange={(value) => onUpdate('opqrst', 'provocation', value)}
            value={notes.opqrst.provocation}
          />
          <Field
            label="Quality"
            onChange={(value) => onUpdate('opqrst', 'quality', value)}
            value={notes.opqrst.quality}
          />
          <Field
            label="Radiation"
            onChange={(value) => onUpdate('opqrst', 'radiation', value)}
            value={notes.opqrst.radiation}
          />
          <Field
            label="Severity"
            onChange={(value) => onUpdate('opqrst', 'severity', value)}
            value={notes.opqrst.severity}
          />
          <Field label="Time" onChange={(value) => onUpdate('opqrst', 'time', value)} value={notes.opqrst.time} />
        </div>
      ) : null}
    </section>
  );
}
