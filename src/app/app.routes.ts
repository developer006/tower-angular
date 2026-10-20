import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/menu/main-menu').then((m) => m.MainMenu),
  },
  {
    path: 'play',
    loadComponent: () => import('./features/game/game-page').then((m) => m.GamePage),
  },
];
