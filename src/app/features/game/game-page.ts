import { Component, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { renderMap } from '../../core/render/renderer';
import { installHarness } from '../../core/testing/harness-loader';
import { GameFacade } from '../../state/game-facade';
import { BoardOverlay } from './board-overlay';
import { GameCanvas } from './game-canvas';

@Component({
  selector: 'app-game-page',
  imports: [GameCanvas, BoardOverlay],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
  providers: [GameFacade],
})
export class GamePage implements OnInit, OnDestroy {
  protected readonly facade = inject(GameFacade);
  private readonly host = inject(ElementRef<HTMLElement>);
  private hudTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    installHarness(this.facade);
    this.facade.registerRender(() => {
      this.renderBoard();
    });
  }

  ngOnInit(): void {
    this.facade.start();
    this.hudTimer = setInterval(() => {
      this.facade.refresh();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.hudTimer !== null) {
      clearInterval(this.hudTimer);
      this.hudTimer = null;
    }
    this.facade.stop();
  }

  private renderBoard(): void {
    const canvas = this.host.nativeElement.querySelector('canvas');
    if (!canvas) {
      return;
    }
    renderMap(canvas, canvas.width, canvas.height);
  }
}
