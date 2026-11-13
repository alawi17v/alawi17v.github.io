import respiratoryConferenceStroke from './respiratory-conference-stroke.json';
import type { ScenarioDefinition } from '../types';

export const scenarios: ScenarioDefinition[] = [respiratoryConferenceStroke as ScenarioDefinition];

export function getScenarioById(id: string): ScenarioDefinition | undefined {
  return scenarios.find((scenario) => scenario.id === id);
}
