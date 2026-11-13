interface ExitModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExitModal({ open, onCancel, onConfirm }: ExitModalProps): JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-panel p-6 shadow-panel">
        <h2 className="text-xl font-semibold text-slate-100">Exit Scenario?</h2>
        <p className="mt-2 text-sm text-slate-300">Your current progress remains available if persistence is enabled.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-lg border border-border bg-panelSoft px-4 py-2 text-sm font-medium text-slate-100"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-lg border border-accent/70 bg-accent px-4 py-2 text-sm font-semibold text-white"
            onClick={onConfirm}
            type="button"
          >
            Exit to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
