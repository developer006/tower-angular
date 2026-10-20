import { AfterViewInit, Component, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
import {
  cappedDevicePixelRatio,
  fitCanvasCss,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
} from '../../core/render/layout';
import { renderMap } from '../../core/render/renderer';
import { GameFacade } from '../../state/game-facade';

@Component({
  selector: 'app-game-canvas',
  templateUrl: './game-canvas.html',
  styleUrl: './game-canvas.css',
})
export class GameCanvas implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly facade = inject(GameFacade);
  private readonly board = viewChild<ElementRef<HTMLCanvasElement>>('board');
  private observer: ResizeObserver | null = null;
  private destroyed = false;

  ngAfterViewInit(): void {
    this.sync();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    this.observer = new ResizeObserver(() => {
      this.sync();
    });
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.observer?.disconnect();
    this.observer = null;
  }

  private sync(): void {
    if (this.destroyed) {
      return;
    }
    const canvas = this.board()?.nativeElement ?? this.host.nativeElement.querySelector('canvas');
    if (!canvas) {
      return;
    }
    const rect = this.host.nativeElement.getBoundingClientRect();
    const css =
      rect.width > 0 && rect.height > 0
        ? fitCanvasCss(rect.width, rect.height)
        : { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT };
    const dpr = cappedDevicePixelRatio(
      typeof globalThis.devicePixelRatio === 'number' ? globalThis.devicePixelRatio : 1,
    );
    canvas.style.width = `${css.width}px`;
    canvas.style.height = `${css.height}px`;
    canvas.width = css.width * dpr;
    canvas.height = css.height * dpr;
    renderMap(canvas, canvas.width, canvas.height, undefined, this.facade.getFullState());
  }
}
