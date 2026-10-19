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
});

function dispatchKey(overlay: HTMLElement, key: string): void {
  overlay.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

function clickPad(page: HTMLElement, padId: string): void {
  (page.querySelector(`[data-testid="${padId}"]`) as HTMLButtonElement).click();
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
