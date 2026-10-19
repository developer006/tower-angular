import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameFacade } from '../../state/game-facade';
import { GamePage } from './game-page';

const PAD_IDS = [
  'pad-01',
  'pad-02',
  'pad-03',
  'pad-04',
  'pad-05',
  'pad-06',
  'pad-07',
  'pad-08',
  'pad-09',
  'pad-10',
  'pad-11',
  'pad-12',
  'pad-13',
  'pad-14',
];

describe('BoardOverlay', () => {
  it('selects a build type from the keyboard and does not spend gold on click', async () => {
    const fixture = TestBed.createComponent(GamePage);
    let second: ComponentFixture<GamePage> | undefined;
    try {
      await fixture.whenStable();
      const page = fixture.nativeElement as HTMLElement;
      const overlay = page.querySelector('[data-testid="board-overlay"]') as HTMLElement;
      const buttons = [...overlay.querySelectorAll('button')];

      expect(buttons).toHaveLength(14);
      expect(buttons.map((button) => button.getAttribute('data-testid'))).toEqual(PAD_IDS);
      expect(buttons.every((button) => button.getAttribute('tabindex') === '0')).toBe(true);
      expect(buttons.every((button) => button.getAttribute('type') === 'button')).toBe(true);
      expect(overlay.getAttribute('data-selected-type')).toBe('');
      expect(buttons.every((button) => button.getAttribute('data-build-target') === null)).toBe(true);

      dispatchKey(overlay, '1');
      fixture.detectChanges();
      expect(overlay.getAttribute('data-selected-type')).toBe('pulse');
      expect(buttons.every((button) => button.getAttribute('data-build-target') === 'true')).toBe(true);

      dispatchKey(overlay, ' ');
      dispatchKey(overlay, 'f');
      dispatchKey(overlay, 'F');
      fixture.detectChanges();
      expect(overlay.getAttribute('data-selected-type')).toBe('pulse');

      dispatchKey(overlay, '2');
      fixture.detectChanges();
      expect(overlay.getAttribute('data-selected-type')).toBe('mortar');

      dispatchKey(overlay, '3');
      fixture.detectChanges();
      expect(overlay.getAttribute('data-selected-type')).toBe('cryo');
      expect(buttons.every((button) => button.getAttribute('data-build-target') === 'true')).toBe(true);

      const gold = page.querySelector('[data-testid="hud-gold"]')?.textContent;
      buttons[0].click();
      fixture.detectChanges();
      expect(page.querySelector('[data-testid="hud-gold"]')?.textContent).toBe(gold);
      expect(gold).toBe('150');

      dispatchKey(overlay, 'Escape');
      fixture.detectChanges();
      expect(overlay.getAttribute('data-selected-type')).toBe('');
      expect(buttons.every((button) => button.getAttribute('data-build-target') === null)).toBe(true);

      second = TestBed.createComponent(GamePage);
      await second.whenStable();
    } finally {
      fixture.destroy();
      second?.destroy();
    }
  });

  it('places a paused Pulse, rejects a taken pad and a tower the player cannot afford, and keeps score at 0', async () => {
    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const facade = fixture.debugElement.injector.get(GameFacade);
      facade.setPaused(true);
      const page = fixture.nativeElement as HTMLElement;
      const overlay = page.querySelector('[data-testid="board-overlay"]') as HTMLElement;

      dispatchKey(overlay, '1');
      fixture.detectChanges();
      clickPad(page, 'pad-01');
      fixture.detectChanges();

      expect(errorText(page)).toBe('');
      expect(goldText(page)).toBe('80');
      expect(facade.getFullState().towers).toEqual([
        expect.objectContaining({ id: 't1', padId: 'pad-01', towerType: 'pulse' }),
      ]);
      expect(scoreText(page)).toBe('0');

      clickPad(page, 'pad-01');
      fixture.detectChanges();
      expect(goldText(page)).toBe('80');
      expect(errorText(page)).toBe('That pad is already taken.');
      expect(page.querySelector('[data-testid="tower-inspector"]')).toBeNull();
      expect(scoreText(page)).toBe('0');

      dispatchKey(overlay, '2');
      fixture.detectChanges();
      clickPad(page, 'pad-02');
      fixture.detectChanges();
      expect(goldText(page)).toBe('80');
      expect(errorText(page)).toBe('Not enough gold.');
      expect(scoreText(page)).toBe('0');
    } finally {
      fixture.destroy();
    }
  });

  it('does not dispatch when no tower is selected', async () => {
    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const facade = fixture.debugElement.injector.get(GameFacade);
      const page = fixture.nativeElement as HTMLElement;
      const gold = goldText(page);
      const dispatch = vi.spyOn(facade, 'dispatch');

      clickPad(page, 'pad-03');
      fixture.detectChanges();

      expect(goldText(page)).toBe(gold);
      expect(gold).toBe('150');
      expect(errorText(page)).toBe('Select a tower first.');
      expect(page.querySelector('[data-testid="tower-inspector"]')).toBeNull();
      expect(dispatch).not.toHaveBeenCalled();
      expect(scoreText(page)).toBe('0');
    } finally {
      fixture.destroy();
    }
  });

  it('places the selected tower when Enter is pressed on a focused pad', async () => {
    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const facade = fixture.debugElement.injector.get(GameFacade);
      facade.setPaused(true);
      const page = fixture.nativeElement as HTMLElement;
      const overlay = page.querySelector('[data-testid="board-overlay"]') as HTMLElement;

      dispatchKey(overlay, '1');
      fixture.detectChanges();
      const pad = page.querySelector('[data-testid="pad-04"]') as HTMLButtonElement;
      pad.focus();
      pad.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();

      expect(errorText(page)).toBe('');
      expect(goldText(page)).toBe('80');
      expect(facade.getFullState().towers).toEqual([
        expect.objectContaining({ id: 't1', padId: 'pad-04', towerType: 'pulse' }),
      ]);
      expect(scoreText(page)).toBe('0');
    } finally {
      fixture.destroy();
    }
  });

  it('selects mortar from the palette and shows the locked costs', async () => {
    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const page = fixture.nativeElement as HTMLElement;
      const overlay = page.querySelector('[data-testid="board-overlay"]') as HTMLElement;

      expect(paletteButton(page, 'pulse').textContent).toContain('70');
      expect(paletteButton(page, 'mortar').textContent).toContain('110');
      expect(paletteButton(page, 'cryo').textContent).toContain('90');

      paletteButton(page, 'mortar').click();
      fixture.detectChanges();
      expect(overlay.getAttribute('data-selected-type')).toBe('mortar');
      expect(scoreText(page)).toBe('0');
    } finally {
      fixture.destroy();
    }
  });

  it('upgrades a paused Pulse for 50, then sells it for a refund of 84', async () => {
    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const facade = fixture.debugElement.injector.get(GameFacade);
      facade.setPaused(true);
      const page = fixture.nativeElement as HTMLElement;
      const overlay = page.querySelector('[data-testid="board-overlay"]') as HTMLElement;

      dispatchKey(overlay, '1');
      fixture.detectChanges();
      clickPad(page, 'pad-01');
      fixture.detectChanges();
      dispatchKey(overlay, 'Escape');
      fixture.detectChanges();
      clickPad(page, 'pad-01');
      fixture.detectChanges();
      (page.querySelector('[data-testid="upgrade-tower"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(goldText(page)).toBe('30');
      expect(facade.getFullState().towers[0]).toEqual(
        expect.objectContaining({ id: 't1', level: 2, invested: 120 }),
      );
      expect(inspectorText(page)).toContain('t1');
      expect(inspectorText(page)).toContain('120');
      expect(scoreText(page)).toBe('0');

      (page.querySelector('[data-testid="sell-tower"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(goldText(page)).toBe('114');
      expect(facade.getFullState().towers).toEqual([]);
      expect(page.querySelector('[data-testid="tower-inspector"]')).toBeNull();
      expect(scoreText(page)).toBe('0');
    } finally {
      fixture.destroy();
    }
  });

  it('refunds 49 when a paused Pulse is sold without an upgrade', async () => {
    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const facade = fixture.debugElement.injector.get(GameFacade);
      facade.setPaused(true);
      const page = fixture.nativeElement as HTMLElement;
      const overlay = page.querySelector('[data-testid="board-overlay"]') as HTMLElement;

      dispatchKey(overlay, '1');
      fixture.detectChanges();
      clickPad(page, 'pad-01');
      fixture.detectChanges();
      dispatchKey(overlay, 'Escape');
      fixture.detectChanges();
      clickPad(page, 'pad-01');
      fixture.detectChanges();
      (page.querySelector('[data-testid="sell-tower"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(goldText(page)).toBe('129');
      expect(facade.getFullState().towers).toEqual([]);
      expect(page.querySelector('[data-testid="tower-inspector"]')).toBeNull();
      expect(scoreText(page)).toBe('0');
    } finally {
      fixture.destroy();
    }
  });

  it('opens the inspector without placing and keeps a targeting change', async () => {
    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const facade = fixture.debugElement.injector.get(GameFacade);
      facade.setPaused(true);
      const page = fixture.nativeElement as HTMLElement;
      const overlay = page.querySelector('[data-testid="board-overlay"]') as HTMLElement;

      dispatchKey(overlay, '1');
      fixture.detectChanges();
      clickPad(page, 'pad-01');
      fixture.detectChanges();
      dispatchKey(overlay, 'Escape');
      fixture.detectChanges();
      const dispatch = vi.spyOn(facade, 'dispatch');
      clickPad(page, 'pad-01');
      fixture.detectChanges();

      expect(dispatch).not.toHaveBeenCalled();
      expect(inspectorText(page)).toContain('t1');
      expect(goldText(page)).toBe('80');
      const select = page.querySelector('[data-testid="targeting-mode"]') as HTMLSelectElement;
      expect(select.tagName).toBe('SELECT');
      expect([...select.options].map((option) => option.value)).toEqual([
        'first',
        'strongest',
        'closest',
      ]);
      expect(select.value).toBe('first');
      select.value = 'closest';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      fixture.detectChanges();

      expect(facade.getFullState().towers[0]?.targeting).toBe('closest');
      expect(dispatch).toHaveBeenCalledWith({
        type: 'setTargeting',
        towerId: 't1',
        mode: 'closest',
      });
      expect(scoreText(page)).toBe('0');
    } finally {
      fixture.destroy();
    }
  });

  it('shows the level-1 range while a selected pad is hovered or focused', async () => {
    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const page = fixture.nativeElement as HTMLElement;
      const overlay = page.querySelector('[data-testid="board-overlay"]') as HTMLElement;
      const pad = page.querySelector('[data-testid="pad-01"]') as HTMLButtonElement;

      pad.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      expect(overlay.getAttribute('data-range-tiles')).toBeNull();

      dispatchKey(overlay, '1');
      fixture.detectChanges();
      pad.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      expect(overlay.getAttribute('data-range-tiles')).toBe('3.2');

      pad.dispatchEvent(new MouseEvent('mouseleave'));
      fixture.detectChanges();
      expect(overlay.getAttribute('data-range-tiles')).toBeNull();

      pad.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      expect(overlay.getAttribute('data-range-tiles')).toBe('3.2');
      pad.dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();

      dispatchKey(overlay, '2');
      fixture.detectChanges();
      pad.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      expect(overlay.getAttribute('data-range-tiles')).toBe('4');

      dispatchKey(overlay, '3');
      fixture.detectChanges();
      expect(overlay.getAttribute('data-range-tiles')).toBe('3');
      expect(scoreText(page)).toBe('0');
    } finally {
      fixture.destroy();
    }
  });

  it('disables upgrade at level 3 without re-rounding the table costs', async () => {
    const fixture = TestBed.createComponent(GamePage);
    try {
      await fixture.whenStable();
      const facade = fixture.debugElement.injector.get(GameFacade);
      facade.reset({ seed: 1, gold: 400 });
      facade.setPaused(true);
      const page = fixture.nativeElement as HTMLElement;
      const overlay = page.querySelector('[data-testid="board-overlay"]') as HTMLElement;

      dispatchKey(overlay, '1');
      fixture.detectChanges();
      clickPad(page, 'pad-01');
      fixture.detectChanges();
      dispatchKey(overlay, 'Escape');
      fixture.detectChanges();
      clickPad(page, 'pad-01');
      fixture.detectChanges();
      const upgrade = page.querySelector('[data-testid="upgrade-tower"]') as HTMLButtonElement;
      upgrade.click();
      fixture.detectChanges();
      upgrade.click();
      fixture.detectChanges();

      expect(facade.getFullState().towers[0]).toEqual(
        expect.objectContaining({ level: 3, invested: 190 }),
      );
      expect(upgrade.disabled).toBe(true);
      expect(scoreText(page)).toBe('0');
    } finally {
      fixture.destroy();
    }
  });
});

function dispatchKey(overlay: HTMLElement, key: string): void {
  overlay.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

function clickPad(page: HTMLElement, padId: string): void {
  (page.querySelector(`[data-testid="${padId}"]`) as HTMLButtonElement).click();
}

function paletteButton(page: HTMLElement, type: string): HTMLButtonElement {
  return page.querySelector(`[data-testid="palette-${type}"]`) as HTMLButtonElement;
}

function goldText(page: HTMLElement): string | null | undefined {
  return page.querySelector('[data-testid="hud-gold"]')?.textContent;
}

function scoreText(page: HTMLElement): string | null | undefined {
  return page.querySelector('[data-testid="hud-score"]')?.textContent;
}

function errorText(page: HTMLElement): string | null | undefined {
  return page.querySelector('[data-testid="placement-error"]')?.textContent;
}

function inspectorText(page: HTMLElement): string {
  return page.querySelector('[data-testid="tower-inspector"]')?.textContent ?? '';
}
