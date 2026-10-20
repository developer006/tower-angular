import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MainMenu } from './main-menu';

describe('MainMenu', () => {
  it('navigates to /play when Play is clicked', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'play', children: [] }])],
    });
    const fixture: ComponentFixture<MainMenu> = TestBed.createComponent(MainMenu);
    try {
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector('[data-testid="main-menu"]')).not.toBeNull();
      const play = root.querySelector('[data-testid="play"]') as HTMLButtonElement;
      expect(play.textContent?.trim()).toBe('Play');

      play.click();
      await fixture.whenStable();

      expect(TestBed.inject(Router).url).toBe('/play');
    } finally {
      fixture.destroy();
    }
  });
});
