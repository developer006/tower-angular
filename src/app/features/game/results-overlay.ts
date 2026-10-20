import { Component, computed, inject } from '@angular/core';
import { GameFacade } from '../../state/game-facade';

@Component({
  selector: 'app-results-overlay',
  templateUrl: './results-overlay.html',
  styleUrl: './results-overlay.css',
})
export class ResultsOverlay {
  private readonly facade = inject(GameFacade);

  protected readonly view = computed(() => {
    this.facade.score();
    this.facade.integrity();
    this.facade.gold();
    this.facade.wave();
    this.facade.paused();
    const state = this.facade.getFullState();
    return {
      ended: state.phase === 'victory' || state.phase === 'defeat',
      wavesCleared: state.wavesCleared ?? 0,
      kills: state.kills ?? 0,
      integrity: state.integrity,
      score: state.score,
    };
  });

  protected retry(): void {
    this.facade.dispatch({ type: 'reset', seed: 1 });
  }
}
