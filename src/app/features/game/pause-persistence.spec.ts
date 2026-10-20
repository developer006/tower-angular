import { TestBed } from '@angular/core/testing';
import type { EnemyState, GameState } from '../../core/game/state';
import { GameEngine } from '../../core/game/engine';
import { advanceFrame, createLoop } from '../../core/game/loop';
import { GameFacade } from '../../state/game-facade';
import { SETTINGS_STORAGE_KEY } from '../../state/settings-store';
import { GamePage } from './game-page';

function drone(id: string): EnemyState {
  return {
    id,
    enemyType: 'drone',
    hp: 55,
    maxHp: 55,
    speed: 1,
    leakDamage: 1,
    distanceAlongPath: 2063.5,
    alive: true,
    slowStrength: 0,
    slowRemaining: 0,
    spawnedAtTick: -1,
  };
}

function engineState(facade: GameFacade): GameState {
  return (facade as unknown as { engine: { state: GameState } }).engine.state;
}

describe('pause, speed, and persistence', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  });

  it('paused advanceFrame leaves tick and accumulator at 0 and does not dump a remainder', () => {
    const engine = new GameEngine(1);
    const loop = createLoop();
    engine.setPaused(true);
    expect(advanceFrame(engine, loop, 1)).toBe(0);
    expect(engine.getState().tick).toBe(0);
    expect(loop.accumulator).toBe(0);

    loop.accumulator = 0.01;
    expect(advanceFrame(engine, loop, 1)).toBe(0);
    expect(engine.getState().tick).toBe(0);
    expect(loop.accumulator).toBe(0.01);
  });

  it('toggles speed with F and ignores F and Space from form controls', async () => {
    const fixture = TestBed.createComponent(GamePage);
    const input = document.createElement('input');
    const area = document.createElement('textarea');
    const select = document.createElement('select');
    document.body.append(input, area, select);
    try {
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      const facade = fixture.debugElement.injector.get(GameFacade);
      const speed = root.querySelector('[data-testid="speed"]') as HTMLButtonElement;

      expect(facade.speed()).toBe(1);
      expect(speed.textContent?.trim()).toBe('1');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
      fixture.detectChanges();
      expect(facade.speed()).toBe(2);
      expect(speed.textContent?.trim()).toBe('2');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F' }));
      fixture.detectChanges();
      expect(facade.speed()).toBe(1);
      expect(speed.textContent?.trim()).toBe('1');
      expect(root.querySelector('[data-testid="board-overlay"]')?.getAttribute('data-selected-type')).toBe('');

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true }));
      area.dispatchEvent(new KeyboardEvent('keydown', { key: 'F', bubbles: true }));
      select.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(facade.speed()).toBe(1);
      expect(facade.paused()).toBe(false);
    } finally {
      input.remove();
      area.remove();
      select.remove();
      fixture.destroy();
    }
  });

  it('disables deploy while paused and leaves build, upgrade, sell, and targeting enabled', async () => {
    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      const facade = fixture.debugElement.injector.get(GameFacade);
      facade.setManualMode(true);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      fixture.detectChanges();
      expect(facade.paused()).toBe(true);
      expect(root.querySelector('[data-testid="pause"]')?.textContent?.trim()).toBe('Paused');
      expect((root.querySelector('[data-testid="deploy-wave"]') as HTMLButtonElement).disabled).toBe(true);
      expect((root.querySelector('[data-testid="palette-pulse"]') as HTMLButtonElement).disabled).toBe(false);

      facade.dispatch({ type: 'placeTower', towerType: 'pulse', padId: 'pad-01' });
      (root.querySelector('[data-testid="pad-01"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect((root.querySelector('[data-testid="upgrade-tower"]') as HTMLButtonElement).disabled).toBe(false);
      expect((root.querySelector('[data-testid="sell-tower"]') as HTMLButtonElement).disabled).toBe(false);
      expect((root.querySelector('[data-testid="targeting-mode"]') as HTMLSelectElement).disabled).toBe(false);
      expect(facade.getFullState().towers).toHaveLength(1);
    } finally {
      fixture.destroy();
    }
  });

  it('does not call setPaused when a hidden tab discards frame time', async () => {
    const frames: FrameRequestCallback[] = [];
    const originalRaf = globalThis.requestAnimationFrame;
    const originalCancel = globalThis.cancelAnimationFrame;
    const hidden = { value: false };
    const hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
    const visibilityDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState');
    globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      frames.push(callback);
      return frames.length;
    };
    globalThis.cancelAnimationFrame = () => undefined;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden.value });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => (hidden.value ? 'hidden' : 'visible'),
    });

    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const facade = fixture.debugElement.injector.get(GameFacade);
      let setPausedCalls = 0;
      const original = facade.setPaused.bind(facade);
      facade.setPaused = (paused: boolean): void => {
        setPausedCalls += 1;
        original(paused);
      };

      frames[0](0);
      hidden.value = true;
      document.dispatchEvent(new Event('visibilitychange'));
      frames[1](5000);
      expect(setPausedCalls).toBe(0);
      expect(facade.paused()).toBe(false);
      expect(facade.getFullState().paused).toBe(false);
      expect(facade.getState().tick).toBe(0);

      hidden.value = false;
      document.dispatchEvent(new Event('visibilitychange'));
      frames[2](9000);
      expect(setPausedCalls).toBe(0);
      expect(facade.paused()).toBe(false);
      expect(facade.getState().tick).toBe(0);
    } finally {
      fixture.destroy();
      globalThis.requestAnimationFrame = originalRaf;
      globalThis.cancelAnimationFrame = originalCancel;
      restoreDescriptor('hidden', hiddenDescriptor);
      restoreDescriptor('visibilityState', visibilityDescriptor);
    }
  });

  it('shows the stored best score and does not lower it when the run scores less', async () => {
    localStorage.setItem(
      'core-defense:v1',
      JSON.stringify({
        bestScore: 500,
        bestWave: 9,
        soundMuted: false,
        reducedMotion: false,
        colorblind: false,
      }),
    );
    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      const facade = fixture.debugElement.injector.get(GameFacade);
      facade.setManualMode(true);
      const state = engineState(facade);
      state.phase = 'wave';
      state.wave = 4;
      state.integrity = 1;
      state.gold = 200;
      state.kills = 4;
      state.wavesCleared = 3;
      state.bestWave = 4;
      state.spawnQueue = [];
      state.projectiles = [];
      state.enemies = [drone('e9')];

      facade.stepTicks(1);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(facade.getFullState().score).toBe(340);
      expect(root.querySelector('[data-testid="hud-score"]')?.textContent).toBe('0');
      expect(root.querySelector('[data-testid="best-score"]')?.textContent).toContain('500');
      const saved = JSON.parse(localStorage.getItem('core-defense:v1') ?? '{}') as { bestScore: number; bestWave: number };
      expect(saved.bestScore).toBe(500);
      expect(saved.bestWave).toBe(9);
    } finally {
      fixture.destroy();
    }
  });

  it('toggles the stored sound flag and does not play audio', async () => {
    const played: string[] = [];
    const media = HTMLMediaElement.prototype;
    const originalPlay = media.play;
    media.play = () => {
      played.push('play');
      return Promise.resolve();
    };

    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      const button = root.querySelector('[data-testid="sound-muted"]') as HTMLButtonElement;
      expect(button.textContent?.trim()).toBe('Sound');
      button.click();
      fixture.detectChanges();
      expect(button.textContent?.trim()).toBe('Muted');
      const saved = JSON.parse(localStorage.getItem('core-defense:v1') ?? '{}') as Record<string, unknown>;
      expect(saved['soundMuted']).toBe(true);
      expect(saved).not.toHaveProperty('theme');
      expect(played).toEqual([]);
    } finally {
      fixture.destroy();
      media.play = originalPlay;
    }
  });
});

function restoreDescriptor(name: 'hidden' | 'visibilityState', descriptor: PropertyDescriptor | undefined): void {
  if (descriptor) {
    Object.defineProperty(document, name, descriptor);
    return;
  }
  Reflect.deleteProperty(document, name);
}
