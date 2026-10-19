import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.getElementById('theme-link')?.remove();
    const link = document.createElement('link');
    link.id = 'theme-link';
    link.href = 'assets/themes/deeppurple-amber.css';
    document.head.append(link);
  });

  it('rewrites a corrupt value to dark even when the link starts light', () => {
    localStorage.setItem('theme', 'deeppurple-amber ');
    const service = TestBed.inject(ThemeService);
    const link = document.getElementById('theme-link') as HTMLLinkElement;
    expect(service.activeTheme()).toBe('purple-green');
    expect(link.getAttribute('href')).toBe('assets/themes/purple-green.css');
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('purple-green');
  });

  it('selects light only for the exact stored string', () => {
    localStorage.setItem('theme', 'deeppurple-amber');
    const service = TestBed.inject(ThemeService);
    expect(service.activeTheme()).toBe('deeppurple-amber');
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });
});
