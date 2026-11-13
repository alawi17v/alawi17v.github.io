import { useEffect } from 'react';
import { resolveAudioSrc } from '../audio';
import { ActionLog } from '../components/ActionLog';
import { ActiveCallPanel } from '../components/ActiveCallPanel';
import { AirwayPanel } from '../components/AirwayPanel';
import { DecisionPanel } from '../components/DecisionPanel';
import { ExitModal } from '../components/ExitModal';
import { NotesHistoryPanel } from '../components/NotesHistoryPanel';
import { TopBar } from '../components/TopBar';
import { VitalsPanel } from '../components/VitalsPanel';
import { useGameStore } from '../state/gameStore';

export function GameScreen(): JSX.Element {
  const {
    scenario,
    phase,
    currentStepIndex,
    totalElapsed,
    selectedChoiceId,
    actionsByStep,
    performedScenarioActions,
    actionLog,
    notes,
    activeNotesTab,
    showExitConfirm,
    gatingMessage,
    tick,
    goBackStep,
    restartScenario,
    togglePause,
    requestExit,
    cancelExit,
    confirmExit,
    selectChoice,
    performAction,
    confirmAction,
    updateNotes,
    setNotesTab
  } = useGameStore((state) => state);

  useEffect(() => {
    if (phase !== 'playing') {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      tick();
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [phase, tick]);

  if (!scenario) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-200">
        Scenario unavailable.
      </main>
    );
  }

  const step = scenario.steps[currentStepIndex] ?? scenario.steps[scenario.steps.length - 1];
  const actionsInStep = actionsByStep[step.stepId] ?? [];

  const listenToLungs = (): void => {
    if (!step.allowedActions.includes('auscultateLungs') || phase === 'paused') {
      return;
    }

    performAction('auscultateLungs');
    const audioSrc = resolveAudioSrc(step.audioCues?.lungSounds);
    if (!audioSrc) {
      return;
    }

    const audio = new Audio(audioSrc);
    void audio.play();
  };

  const paused = phase === 'paused';

  return (
    <main className="min-h-screen p-3 lg:p-4">
      <TopBar
        elapsedSeconds={totalElapsed}
        onExit={requestExit}
        onPauseToggle={togglePause}
        onStartOver={restartScenario}
        paused={paused}
        sceneStatus={scenario.sceneStatus}
        unitLabel={scenario.unitLabel}
      />

      <div className={`${paused ? 'pointer-events-none opacity-70' : ''}`}>
        <div className="grid items-start gap-3 xl:grid-cols-[310px_minmax(0,1fr)_360px]">
          <div className="space-y-3">
            <VitalsPanel
              actionsAcrossScenario={performedScenarioActions}
              actionsInStep={actionsInStep}
              onAction={performAction}
              patientAge={scenario.patientAge}
              paused={paused}
              presentation={scenario.patientPresentation}
              step={step}
            />
            <AirwayPanel
              actionsAcrossScenario={performedScenarioActions}
              actionsInStep={actionsInStep}
              onAction={performAction}
              paused={paused}
              step={step}
            />
          </div>

          <DecisionPanel
            canGoBack={currentStepIndex > 0}
            gatingMessage={gatingMessage}
            onBack={goBackStep}
            onConfirm={confirmAction}
            onListen={listenToLungs}
            onSelectChoice={selectChoice}
            paused={paused}
            selectedChoiceId={selectedChoiceId}
            step={step}
            totalSteps={scenario.steps.length}
          />

          <div>
            <ActiveCallPanel
              location={scenario.location}
              subtitle={scenario.subtitle}
              title={scenario.title}
            />
            <NotesHistoryPanel
              activeTab={activeNotesTab}
              notes={notes}
              onTabChange={setNotesTab}
              onUpdate={updateNotes}
            />
            <ActionLog logs={actionLog} />
          </div>
        </div>
      </div>

      {paused ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="rounded-2xl border border-border bg-panel px-8 py-5 text-center shadow-panel">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Simulation Paused</p>
            <p className="mt-2 text-xl font-semibold text-slate-100">Press Resume to continue</p>
            <button
              className="mt-4 rounded-lg border border-warning/60 bg-warning/20 px-5 py-2 text-sm font-semibold text-warning transition hover:border-warning"
              onClick={togglePause}
              type="button"
            >
              Resume
            </button>
          </div>
        </div>
      ) : null}

      <ExitModal onCancel={cancelExit} onConfirm={confirmExit} open={showExitConfirm} />
    </main>
  );
}
