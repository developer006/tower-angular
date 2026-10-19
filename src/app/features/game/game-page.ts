import { Component } from '@angular/core';
import { GameCanvas } from './game-canvas';

@Component({
  selector: 'app-game-page',
  imports: [GameCanvas],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
})
export class GamePage {}
