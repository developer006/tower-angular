import { ComponentFixture, TestBed } from '@angular/core/testing';
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
});

function dispatchKey(overlay: HTMLElement, key: string): void {
  overlay.dispatchEvent(new KeyboardEvent('keydown', { key }));
}
