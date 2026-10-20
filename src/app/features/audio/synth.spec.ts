import { play } from './synth';

describe('synth', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('muted play(place) does not touch a stub AudioContext', () => {
    const start = vi.fn();
    const AudioContext = vi.fn(function Stub() {
      return {
        destination: {},
        currentTime: 0,
        createOscillator: () => ({
          type: 'sine',
          frequency: { value: 0 },
          connect() {
            return undefined;
          },
          start,
          stop() {
            return undefined;
          },
        }),
        createGain: () => ({
          gain: { value: 0 },
          connect() {
            return undefined;
          },
        }),
      };
    });
    vi.stubGlobal('AudioContext', AudioContext);

    play('place', true);

    expect(AudioContext).not.toHaveBeenCalled();
    expect(start).not.toHaveBeenCalled();
  });

  it('unmuted play(place) calls start once', () => {
    const start = vi.fn();
    class StubAudioContext {
      destination = {};
      currentTime = 0;
      createOscillator(): {
        type: OscillatorType;
        frequency: { value: number };
        connect: () => void;
        start: typeof start;
        stop: () => void;
      } {
        return {
          type: 'sine',
          frequency: { value: 0 },
          connect() {
            return undefined;
          },
          start,
          stop() {
            return undefined;
          },
        };
      }
      createGain(): { gain: { value: number }; connect: () => void } {
        return {
          gain: { value: 0 },
          connect() {
            return undefined;
          },
        };
      }
    }
    vi.stubGlobal('AudioContext', StubAudioContext);

    play('place');

    expect(start).toHaveBeenCalledTimes(1);
  });

  it('does not throw when AudioContext is missing', () => {
    const host = globalThis as { AudioContext?: unknown };
    const previous = host.AudioContext;
    delete host.AudioContext;
    try {
      expect(() => play('place')).not.toThrow();
      expect(() => play('leak')).not.toThrow();
      expect(() => play('victory')).not.toThrow();
      expect(() => play('defeat')).not.toThrow();
    } finally {
      if (previous !== undefined) {
        host.AudioContext = previous;
      }
    }

    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('blocked');
        }
      },
    );
    expect(() => play('place')).not.toThrow();
  });
});
