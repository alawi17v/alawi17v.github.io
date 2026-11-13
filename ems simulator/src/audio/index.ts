import wheeze from './wheeze.mp3';
import crackles from './crackles.mp3';

const audioMap: Record<string, string> = {
  'wheeze.mp3': wheeze,
  'crackles.mp3': crackles
};

export function resolveAudioSrc(name?: string): string | null {
  if (!name) {
    return null;
  }
  return audioMap[name] ?? null;
}
