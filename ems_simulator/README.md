# EMS Clinical Decision-Making Simulator (MVP)

Browser-based EMS simulator built with React + TypeScript + Vite + TailwindCSS. The current build is a mock exam-style airway scenario with timed steps, monitor/actions interaction, notes tabs, and structured scoring feedback.

## Tech Stack

- Frontend: React 18 + TypeScript + Vite
- Styling: TailwindCSS
- State: Zustand store (lightweight, typed)
- Audio: HTML5 Audio API (`new Audio(...).play()`)
- Backend: none (local JSON scenarios)

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview production build:

```bash
npm run preview
```

## Project Structure

- `src/components`: UI panels/cards (`TopBar`, `VitalsPanel`, `DecisionPanel`, `NotesHistoryPanel`, etc.)
- `src/screens`: `MainMenu`, `GameScreen`, `ResultsScreen`
- `src/state`: game store (`gameStore.ts`) with timer, scoring, persistence, action logging
- `src/scenarios/*.json`: data-driven scenario files
- `src/audio`: lung sound placeholder files (`wheeze.mp3`, `crackles.mp3`)
- `src/assets`: placeholder patient illustration

## Gameplay Features (MVP)

- Timed step-based simulation (`Step X/13`)
- Interactive monitor actions:
- `Check Glucose`
- `Check blood pressure`
- `Insert NPA`
- `Begin BVM`
- Hidden vitals revealed by actions using scenario gating rules
- Mixed step modes:
  - `info` (narrative + Next)
  - `mcq` (exam question + choices)
  - `actions` (required intervention sequence, no MCQ)
- Required-action gating before advancing when configured
- Pause/resume and exit confirmation modal
- Action log with timestamps
- Notes + SAMPLE + OPQRST tabs
- End results with score breakdown, category performance, and educational summary
- LocalStorage progress persistence (toggleable from menu)

## Scenario Engine

Scenarios are fully data-driven from JSON. No hard-coded per-step logic in components.

### Scenario Schema (high level)

Each scenario includes:

- Metadata: `id`, `title`, `subtitle`, `location`, `patientAge`, history highlights
- `steps[]`:
  - `stepId`, `stepNumber`, `stepType`, `prompt`, `instruction`
  - `allowedActions[]`
  - `vitals` (supports hidden values + `revealByAction`)
  - Optional `choices[]` with correctness, rationale, severity, scoring, optional branching
  - `gatingRules[]` for required assessments
  - Optional `requiredActionSequence[]` for skills/intervention steps
  - `scoreCategory` for results breakdown
  - `timeLimitSeconds`
  - `onTimeout` behavior and penalties

### Included Scenario

- `Respiratory Distress - Conference Collapse`
- Scenario ID: `respiratory_conference_stroke`
- 13 total steps in JSON
- Includes airway-first decision flow, suction technique checks, oxygen decisions, and a non-MCQ respiratory failure intervention step
- Final diagnosis reveal on results screen: acute stroke with airway compromise

## Adding New Scenarios

1. Create a new file in `src/scenarios/`, e.g.:

```text
src/scenarios/chest-pain-acs.json
```

2. Follow the same schema used in `respiratory-conference-stroke.json`.

3. Register the scenario in `src/scenarios/index.ts`.

4. Start it by passing its `id` to `startScenario(<id>)`.

## Extensibility Notes

- Add new actions by extending `GameActionType` and updating action button rendering.
- Add richer branching by using `choice.nextStepId`.
- Add treatment-effect vitals shifts by expanding per-step or post-choice updates in the store.
- Add additional audio cues by dropping files in `src/audio` and mapping in `src/audio/index.ts`.
