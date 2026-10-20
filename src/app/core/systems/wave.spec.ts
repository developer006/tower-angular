import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameEngine } from '../game/engine';
import type { EnemyState, GameState } from '../game/state';
import { GameFacade } from '../../state/game-facade';
import { GamePage } from '../../features/game/game-page';
import { applyDamage } from './damage';
import { moveEnemies } from './movement';
import { advanceWave, nextLiveAnnouncement } from './wave';

function drone(id: string, distance: number, leakDamage = 1): EnemyState {
  return {
    id,
    enemyType: 'drone',
    hp: 55,
    maxHp: 55,
    speed: 1,
    leakDamage,
    distanceAlongPath: distance,
    alive: true,
    slowStrength: 0,
    slowRemaining: 0,
    spawnedAtTick: -1,
  };
}

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    tick: 5,
    phase: 'wave',
    gold: 150,
    integrity: 20,
    wave: 1,
    score: 0,
    kills: 0,
    wavesCleared: 0,
    bestWave: 1,
    towers: [],
    enemies: [],
    projectiles: [],
    effects: [],
    spawnQueue: [],
    waveStartTick: 1,
    rngState: 1,
    paused: false,
    speed: 1,
    nextTowerId: 1,
    nextEnemyId: 3,
    nextProjectileId: 1,
    history: [],
    pending: [],
    ...overrides,
  };
}

function engineState(facade: GameFacade): GameState {
  return (facade as unknown as { engine: { state: GameState } }).engine.state;
}

describe('wave clears, score, and end states', () => {
  it('clears a crafted wave 1 with integrity 20', () => {
    const state = baseState({ integrity: 20, gold: 150, wave: 1 });
    advanceWave(state);
    expect(state.gold).toBe(180);
    expect(state.gold - 150).toBe(30);
    expect(state.wavesCleared).toBe(1);
    expect(state.phase).toBe('build');
    expect(state.wave).toBe(2);
    expect(state.score).toBe(0);
  });

  it('clears wave 10 with integrity 8 and scores once', () => {
    const state = baseState({
      wave: 10,
      integrity: 8,
      gold: 40,
      kills: 6,
      wavesCleared: 9,
      bestWave: 10,
    });
    advanceWave(state);
    expect(state.phase).toBe('victory');
    expect(state.wavesCleared).toBe(10);
    expect(state.integrity).toBe(8);
    expect(state.score).toBe(state.kills! * 10 + 10 * 100 + 8 * 25);
    expect(state.gold).toBe(40 + 75);
    const settled = state.score;
    state.kills = 99;
    advanceWave(state);
    expect(state.score).toBe(settled);
  });

  it('scores a defeat during wave 4 after 3 clears and pays no bonus', () => {
    const state = baseState({
      wave: 4,
      integrity: 1,
      gold: 200,
      kills: 2,
      wavesCleared: 3,
      bestWave: 4,
      enemies: [drone('e9', 2063.5)],
    });
    moveEnemies(state);
    advanceWave(state);
    expect(state.phase).toBe('defeat');
    expect(state.bestWave).toBe(4);
    expect(state.wavesCleared).toBe(3);
    expect(state.gold).toBe(200);
    expect(state.integrity).toBe(0);
    expect(state.score).toBe(2 * 10 + 3 * 100 + 0 * 25);
    expect(state.score).toBe(state.kills! * 10 + state.wavesCleared! * 100 + state.integrity * 25);
    const settled = state.score;
    state.kills = 8;
    advanceWave(state);
    expect(state.score).toBe(settled);
  });

  it('treats a leaked Overlord as a normal leak and can still win', () => {
    const state = baseState({
      wave: 10,
      integrity: 12,
      gold: 40,
      kills: 1,
      wavesCleared: 9,
      bestWave: 10,
      enemies: [
        {
          ...drone('boss', 2063.5, 10),
          enemyType: 'overlord',
          hp: 2200,
          maxHp: 2200,
        },
      ],
    });
    moveEnemies(state);
    advanceWave(state);
    expect(state.integrity).toBe(2);
    expect(state.kills).toBe(1);
    expect(state.phase).toBe('victory');
    expect(state.wavesCleared).toBe(10);
    expect(state.score).toBe(1 * 10 + 10 * 100 + 2 * 25);
  });

  it('does not clear while a projectile or an alive enemy remains', () => {
    const blocked = baseState({
      projectiles: [
        { id: 'p1', towerId: 't1', targetId: 'e1', x: 0, y: 0, damage: 1, splashRadius: 0 },
      ],
    });
    advanceWave(blocked);
    expect(blocked.phase).toBe('wave');
    expect(blocked.gold).toBe(150);
    expect(blocked.wavesCleared).toBe(0);

    const alive = baseState({ enemies: [drone('e1', 10)] });
    advanceWave(alive);
    expect(alive.phase).toBe('wave');
    expect(alive.wavesCleared).toBe(0);
  });

  it('increments kills on a kill and still does not change score', () => {
    const state = baseState({
      gold: 80,
      enemies: [drone('e1', 0)],
      projectiles: [
        {
          id: 'p1',
          towerId: 't1',
          targetId: 'e1',
          x: 0,
          y: 0,
          damage: 12,
          splashRadius: 0,
          impacted: true,
        } as GameState['projectiles'][number],
      ],
    });
    state.enemies[0].hp = 1;
    applyDamage(state);
    expect(state.kills).toBe(1);
    expect(state.gold).toBe(86);
    expect(state.score).toBe(0);
  });

  it('sets bestWave from the wave being started and resets counters to 0', () => {
    const engine = new GameEngine(1);
    expect(engine.getState().kills).toBe(0);
    expect(engine.getState().wavesCleared).toBe(0);
    expect(engine.getState().bestWave).toBe(0);
    expect(engine.getState().score).toBe(0);

    engine.dispatch({ type: 'startWave' });
    expect(engine.getState().phase).toBe('build');
    engine.step();
    expect(engine.getState().phase).toBe('wave');
    expect(engine.getState().bestWave).toBe(1);

    engine.configureScenario({ seed: 1, wave: 4 });
    engine.dispatch({ type: 'startWave' });
    engine.step();
    expect(engine.getState().bestWave).toBe(4);
    expect(engine.getState().wave).toBe(4);

    engine.dispatch({ type: 'reset', seed: 1 });
    const reset = engine.getState();
    expect(reset.gold).toBe(150);
    expect(reset.integrity).toBe(20);
    expect(reset.wave).toBe(1);
    expect(reset.kills).toBe(0);
    expect(reset.wavesCleared).toBe(0);
    expect(reset.bestWave).toBe(0);
    expect(reset.score).toBe(0);
    expect(reset.rngState).toBe(1);
  });

  it('announces one whole sentence, not a join', () => {
    expect(nextLiveAnnouncement({ phase: 'build', wave: 1, integrity: 20 }, { phase: 'wave', wave: 1, integrity: 20 })).toBe(
      'Wave 1 deployed.',
    );
    expect(nextLiveAnnouncement({ phase: 'wave', wave: 3, integrity: 20 }, { phase: 'build', wave: 4, integrity: 20 })).toBe(
      'Wave 3 cleared.',
    );
    expect(nextLiveAnnouncement({ phase: 'wave', wave: 2, integrity: 20 }, { phase: 'wave', wave: 2, integrity: 19 })).toBe(
      'Core hit. Integrity 19.',
    );
    expect(
      nextLiveAnnouncement({ phase: 'wave', wave: 10, integrity: 8 }, { phase: 'victory', wave: 10, integrity: 8 }),
    ).toBe('Victory. The core holds.');
    expect(
      nextLiveAnnouncement({ phase: 'wave', wave: 4, integrity: 1 }, { phase: 'defeat', wave: 4, integrity: 0 }),
    ).toBe('Defeat. The core is lost.');
    expect(
      nextLiveAnnouncement({ phase: 'wave', wave: 4, integrity: 1 }, { phase: 'defeat', wave: 4, integrity: 0 }),
    ).not.toContain('Core hit');
  });
});

describe('results overlay and wave preview', () => {
  async function page(): Promise<{ fixture: ComponentFixture<GamePage>; root: HTMLElement; facade: GameFacade }> {
    const fixture = TestBed.createComponent(GamePage);
    await fixture.whenStable();
    const facade = fixture.debugElement.injector.get(GameFacade);
    facade.setManualMode(true);
    return { fixture, root: fixture.nativeElement as HTMLElement, facade };
  }

  it('keeps HUD score at 0 while the overlay shows the end score, then Retry hides it', async () => {
    const { fixture, root, facade } = await page();
    try {
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
      state.enemies = [drone('e9', 2063.5)];

      facade.stepTicks(1);
      fixture.detectChanges();
      await fixture.whenStable();

      const score = facade.getFullState().score;
      expect(score).toBe(4 * 10 + 3 * 100 + 0 * 25);
      expect(root.querySelector('[data-testid="hud-score"]')?.textContent).toBe('0');
      const overlay = root.querySelector('[data-testid="results-overlay"]');
      expect(overlay).not.toBeNull();
      expect(overlay?.textContent).toContain('Waves cleared 3');
      expect(overlay?.textContent).toContain('Kills 4');
      expect(overlay?.textContent).toContain('Integrity 0');
      expect(overlay?.textContent).toContain(`Score ${score}`);
      expect(root.querySelector('[data-testid="live-region"]')?.getAttribute('aria-live')).toBe('polite');
      expect(root.querySelector('[data-testid="live-region"]')?.textContent).toBe('Defeat. The core is lost.');
      expect(root.querySelector('[data-testid="retry"]')).not.toBeNull();

      (root.querySelector('[data-testid="retry"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      await fixture.whenStable();

      const after = facade.getFullState();
      expect(after.gold).toBe(150);
      expect(after.integrity).toBe(20);
      expect(after.wave).toBe(1);
      expect(after.rngState).toBe(1);
      expect(after.phase).toBe('build');
      expect(root.querySelector('[data-testid="results-overlay"]')).toBeNull();
      expect(root.querySelector('[data-testid="hud-gold"]')?.textContent).toBe('150');
      expect(root.querySelector('[data-testid="hud-integrity"]')?.textContent).toBe('20');
      expect(root.querySelector('[data-testid="hud-wave"]')?.textContent).toBe('1');
      expect(root.querySelector('[data-testid="hud-score"]')?.textContent).toBe('0');
    } finally {
      fixture.destroy();
    }
  });

  it('lists wave 1 as 8 Drones and wave 10 ending in 1 Overlord after 4 Tanks', async () => {
    const { fixture, root, facade } = await page();
    try {
      const first = root.querySelector('[data-testid="wave-preview"]')?.textContent ?? '';
      expect(first).toContain('8 Drones');

      facade.reset({ seed: 1, wave: 10 });
      fixture.detectChanges();
      await fixture.whenStable();
      const preview = root.querySelector('[data-testid="wave-preview"]')?.textContent ?? '';
      const tanks = preview.indexOf('4 Tanks');
      const overlord = preview.indexOf('1 Overlord');
      expect(tanks).toBeGreaterThanOrEqual(0);
      expect(overlord).toBeGreaterThan(tanks);
      expect(preview.indexOf('10 Drones')).toBeLessThan(tanks);
    } finally {
      fixture.destroy();
    }
  });

  it('queues Deploy Wave until step and announces the deployed wave', async () => {
    const { fixture, root, facade } = await page();
    try {
      (root.querySelector('[data-testid="deploy-wave"]') as HTMLButtonElement).click();
      expect(facade.getFullState().phase).toBe('build');
      expect(facade.getFullState().pending).toEqual([{ type: 'startWave' }]);

      facade.stepTicks(1);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(facade.getFullState().phase).toBe('wave');
      expect(facade.getFullState().bestWave).toBe(1);
      expect(root.querySelector('[data-testid="live-region"]')?.textContent).toBe('Wave 1 deployed.');
      expect(root.querySelector('[data-testid="results-overlay"]')).toBeNull();
    } finally {
      fixture.destroy();
    }
  });
});
