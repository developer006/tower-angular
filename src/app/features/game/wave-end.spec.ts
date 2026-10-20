import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { EnemyState, GameState } from '../../core/game/state';
import { GameFacade } from '../../state/game-facade';
import { GamePage } from './game-page';

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

function engineState(facade: GameFacade): GameState {
  return (facade as unknown as { engine: { state: GameState } }).engine.state;
}

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
