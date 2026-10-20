import { Component, ElementRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { COLORBLIND_PALETTE, PALETTE } from '../../core/render/palette';
import { renderMap, useRenderPalette } from '../../core/render/renderer';
import { nextLiveAnnouncement, type LiveSnapshot } from '../../core/systems/wave';
import { installHarness } from '../../core/testing/harness-loader';
import { GameFacade } from '../../state/game-facade';
import { SettingsStore } from '../../state/settings-store';
import { play, type SynthCue } from '../audio/synth';
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
  host: {
    '[class.reduced-motion]': 'settings.reducedMotion()',
  },
})
export class GamePage implements OnInit, OnDestroy {
  protected readonly facade = inject(GameFacade);
  protected readonly settings = inject(SettingsStore);
  protected readonly liveText = signal('');
  private readonly host = inject(ElementRef<HTMLElement>);
  private hudTimer: ReturnType<typeof setInterval> | null = null;
  private seen: LiveSnapshot;

  constructor() {
    installHarness(this.facade);
    this.seen = this.snapshot();
    this.syncPresentation();
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
    document.documentElement.removeAttribute('data-colorblind');
    useRenderPalette(PALETTE);
  }

  protected deployWave(): void {
    this.facade.dispatch({ type: 'startWave' });
  }

  protected onColorblind(): void {
    this.settings.toggleColorblind();
    this.renderBoard();
  }

  private snapshot(): LiveSnapshot {
    const state = this.facade.getFullState();
    return { phase: state.phase, wave: state.wave, integrity: state.integrity };
  }

  private publishAnnouncement(): void {
    const current = this.snapshot();
    this.persistRunEnd(current);
    const message = nextLiveAnnouncement(this.seen, current);
    if (message !== null) {
      this.liveText.set(message);
      this.playLiveCue(message);
    } else if (
      (this.seen.phase === 'victory' || this.seen.phase === 'defeat') &&
      current.phase === 'build'
    ) {
      this.liveText.set('');
    }
    this.seen = current;
  }

  private persistRunEnd(current: LiveSnapshot): void {
    if (current.phase !== 'victory' && current.phase !== 'defeat') {
      return;
    }
    if (this.seen.phase === 'victory' || this.seen.phase === 'defeat') {
      return;
    }
    const state = this.facade.getFullState();
    this.settings.recordRunEnd(state.score, state.bestWave ?? 0);
  }

  private renderBoard(): void {
    this.syncPresentation();
    const canvas = this.host.nativeElement.querySelector('canvas');
    if (!canvas) {
      return;
    }
    renderMap(
      canvas,
      canvas.width,
      canvas.height,
      this.settings.colorblind() ? COLORBLIND_PALETTE : PALETTE,
      this.facade.getFullState(),
    );
  }

  private syncPresentation(): void {
    const colorblind = this.settings.colorblind();
    if (colorblind) {
      document.documentElement.setAttribute('data-colorblind', 'true');
    } else {
      document.documentElement.removeAttribute('data-colorblind');
    }
    useRenderPalette(colorblind ? COLORBLIND_PALETTE : PALETTE);
  }

  private playLiveCue(message: string): void {
    const cue = liveCue(message);
    if (cue === null) {
      return;
    }
    play(cue, this.settings.soundMuted());
  }
}

function liveCue(message: string): SynthCue | null {
  if (message.startsWith('Core hit. Integrity ')) {
    return 'leak';
  }
  if (message === 'Victory. The core holds.') {
    return 'victory';
  }
  if (message === 'Defeat. The core is lost.') {
    return 'defeat';
  }
  return null;
}
