import { runStrategy } from './strategies';

describe('balance strategies', () => {
  it('defeats a no-tower run by wave 2', () => {
    const recorded = runStrategy('none', 1);

    expect(recorded.outcome).toBe('defeat');
    expect(recorded.bestWave).toBeLessThanOrEqual(2);
    expect(recorded.seed).toBe(1);
    expect(recorded.wavesCleared).toBeGreaterThanOrEqual(0);
    expect(recorded.integrity).toBeGreaterThanOrEqual(0);
    expect(recorded.kills).toBeGreaterThanOrEqual(0);
    expect(recorded.score).toBeGreaterThanOrEqual(0);
  });

  it('returns the same outcome and recorded numbers for the same seed', () => {
    const first = runStrategy('none', 1);
    const second = runStrategy('none', 1);

    expect(second).toEqual(first);
    expect(second.outcome).toBe(first.outcome);
    expect(second.bestWave).toBe(first.bestWave);
    expect(second.wavesCleared).toBe(first.wavesCleared);
    expect(second.integrity).toBe(first.integrity);
    expect(second.kills).toBe(first.kills);
    expect(second.score).toBe(first.score);
    expect(second.seed).toBe(first.seed);
  });
});
