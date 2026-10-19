import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamePage } from './game-page';

describe('GamePage', () => {
  it('shows the play shell and static HUD', async () => {
    const fixture = TestBed.createComponent(GamePage);
    let second: ComponentFixture<GamePage> | undefined;
    try {
      await fixture.whenStable();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('[data-testid="game-page"]')).not.toBeNull();
      expect(compiled.querySelector('[data-testid="game-canvas"]')).not.toBeNull();
      expect(compiled.querySelector('[data-testid="hud-integrity"]')?.textContent).toBe('20');
      expect(compiled.querySelector('[data-testid="hud-gold"]')?.textContent).toBe('150');
      expect(compiled.querySelector('[data-testid="hud-wave"]')?.textContent).toBe('1');
      expect(compiled.querySelector('[data-testid="hud-score"]')?.textContent).toBe('0');
      expect(compiled.querySelector('[data-testid="deploy-wave"]')?.textContent).toBe('Deploy Wave');
      expect((compiled.querySelector('[data-testid="deploy-wave"]') as HTMLButtonElement).disabled).toBe(
        false,
      );

      second = TestBed.createComponent(GamePage);
      await second.whenStable();
      const again = second.nativeElement as HTMLElement;
      expect(again.querySelector('[data-testid="hud-integrity"]')?.textContent).toBe('20');
      expect(again.querySelector('[data-testid="hud-gold"]')?.textContent).toBe('150');
      expect(again.querySelector('[data-testid="hud-wave"]')?.textContent).toBe('1');
      expect(again.querySelector('[data-testid="hud-score"]')?.textContent).toBe('0');
    } finally {
      fixture.destroy();
      second?.destroy();
    }
  });
});
