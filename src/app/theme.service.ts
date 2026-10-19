import { Injectable, signal } from '@angular/core';

export type AppTheme = 'purple-green' | 'deeppurple-amber';

const LIGHT: AppTheme = 'deeppurple-amber';
const DARK: AppTheme = 'purple-green';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly theme = signal<AppTheme>(DARK);

  constructor() {
    this.load();
  }

  activeTheme(): AppTheme {
    return this.theme();
  }

  isDark(): boolean {
    return this.theme() === DARK;
  }

  toggle(): void {
    this.apply(this.theme() === DARK ? LIGHT : DARK);
  }

  load(): void {
    const saved = globalThis.localStorage?.getItem('theme');
    this.apply(saved === LIGHT ? LIGHT : DARK);
  }

  private apply(next: AppTheme): void {
    this.theme.set(next);
    const link = document.getElementById('theme-link') as HTMLLinkElement | null;
    if (link) {
      link.href = `assets/themes/${next}.css`;
    }
    document.documentElement.classList.toggle('dark-mode', next === DARK);
    globalThis.localStorage?.setItem('theme', next);
  }
}
