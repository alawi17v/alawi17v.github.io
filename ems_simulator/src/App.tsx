import { MainMenu } from './screens/MainMenu';
import { GameScreen } from './screens/GameScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { useGameStore } from './state/gameStore';

export default function App(): JSX.Element {
  const phase = useGameStore((state) => state.phase);

  if (phase === 'results') {
    return <ResultsScreen />;
  }

  if (phase === 'menu') {
    return <MainMenu />;
  }

  return <GameScreen />;
}
