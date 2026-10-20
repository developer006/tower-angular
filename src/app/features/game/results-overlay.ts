import { Component, computed, inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { GameFacade } from '../../state/game-facade';
import { SettingsStore } from '../../state/settings-store';

@Component({
  selector: 'app-results-overlay',
  templateUrl: './results-overlay.html',
  styleUrl: './results-overlay.css',
})
export class ResultsOverlay {
  private readonly facade = inject(GameFacade);
  private readonly settings = inject(SettingsStore);
  private readonly injector = inject(Injector);

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
      bestScore: this.settings.bestScore(),
    };
  });

  protected retry(): void {
    this.facade.dispatch({ type: 'reset', seed: 1 });
  }

  protected mainMenu(): void {
    void this.injector.get(Router).navigateByUrl('/');
  }
}
