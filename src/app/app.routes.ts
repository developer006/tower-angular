import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'play',
    loadComponent: () => import('./features/game/game-page').then((m) => m.GamePage),
  },
];
