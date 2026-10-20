import { Component, ElementRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { renderMap } from '../../core/render/renderer';
import { nextLiveAnnouncement, type LiveSnapshot } from '../../core/systems/wave';
import { installHarness } from '../../core/testing/harness-loader';
import { GameFacade } from '../../state/game-facade';
import { BoardOverlay } from './board-overlay';
import { GameCanvas } from './game-canvas';
import { ResultsOverlay } from './results-overlay';
import { WavePreview } from './wave-preview';

@Component({
  selector: 'app-game-page',
  imports: [GameCanvas, BoardOverlay, WavePreview, ResultsOverlay],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
  providers: [GameFacade],
})
export class GamePage implements OnInit, OnDestroy {
  protected readonly facade = inject(GameFacade);
  protected readonly liveText = signal('');
  private readonly host = inject(ElementRef<HTMLElement>);
  private hudTimer: ReturnType<typeof setInterval> | null = null;
  private seen: LiveSnapshot;

  constructor() {
    installHarness(this.facade);
    this.seen = this.snapshot();
    const refresh = this.facade.refresh.bind(this.facade);
    this.facade.refresh = () => {
      refresh();
      this.publishAnnouncement();
    };
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

  protected deployWave(): void {
    this.facade.dispatch({ type: 'startWave' });
  }

  private snapshot(): LiveSnapshot {
    const state = this.facade.getFullState();
    return { phase: state.phase, wave: state.wave, integrity: state.integrity };
  }

  private publishAnnouncement(): void {
    const current = this.snapshot();
    const message = nextLiveAnnouncement(this.seen, current);
    if (message !== null) {
      this.liveText.set(message);
    } else if (
      (this.seen.phase === 'victory' || this.seen.phase === 'defeat') &&
      current.phase === 'build'
    ) {
      this.liveText.set('');
    }
    this.seen = current;
  }

  private renderBoard(): void {
    const canvas = this.host.nativeElement.querySelector('canvas');
    if (!canvas) {
      return;
    }
    renderMap(canvas, canvas.width, canvas.height);
  }
}
