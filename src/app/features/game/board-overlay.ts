import { Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { MAP_01, tileCenter } from '../../core/content/map-01';
import { CANVAS_HEIGHT, CANVAS_WIDTH, type TowerType } from '../../core/content/types';
import type { RejectReason } from '../../core/game/state';
import { GameFacade } from '../../state/game-facade';

const PAD_SIZE = 36;

interface PadButton {
  id: string;
  left: string;
  top: string;
}

function padButtons(): PadButton[] {
  const widthPct = (PAD_SIZE / CANVAS_WIDTH) * 100;
  const heightPct = (PAD_SIZE / CANVAS_HEIGHT) * 100;
  return MAP_01.pads.map((pad) => {
    const center = tileCenter(pad.col, pad.row);
    const left = (center.x / CANVAS_WIDTH) * 100 - widthPct / 2;
    const top = (center.y / CANVAS_HEIGHT) * 100 - heightPct / 2;
    return {
      id: pad.id,
      left: `${left}%`,
      top: `${top}%`,
    };
  });
}

const PLACEMENT_ERRORS = {
  occupied: 'That pad is already taken.',
  'insufficient-gold': 'Not enough gold.',
  'unknown-pad': 'That pad is not on the map.',
  'unknown-tower': 'Unknown tower.',
} as const;

function placementMessage(reason: RejectReason | undefined): string {
  switch (reason) {
    case 'occupied':
    case 'insufficient-gold':
    case 'unknown-pad':
    case 'unknown-tower':
      return PLACEMENT_ERRORS[reason];
    default:
      return '';
  }
}

@Component({
  selector: 'app-board-overlay',
  templateUrl: './board-overlay.html',
  styleUrl: './board-overlay.css',
  host: {
    'data-testid': 'board-overlay',
    '[attr.data-selected-type]': 'selectedType() ?? ""',
    '(keydown)': 'onKeydown($event)',
  },
})
export class BoardOverlay {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly facade = inject(GameFacade);
  protected readonly pads = padButtons();
  protected readonly selectedType = signal<TowerType | null>(null);
  protected readonly placementError = signal('');

  constructor() {
    const destroyRef = inject(DestroyRef);
    const onDocumentKey = (event: KeyboardEvent): void => {
      this.onKeydown(event);
    };
    document.addEventListener('keydown', onDocumentKey);
    destroyRef.onDestroy(() => {
      document.removeEventListener('keydown', onDocumentKey);
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.currentTarget === document && this.host.nativeElement.contains(event.target as Node)) {
      return;
    }
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return;
    }
    switch (event.key) {
      case '1':
        this.selectedType.set('pulse');
        return;
      case '2':
        this.selectedType.set('mortar');
        return;
      case '3':
        this.selectedType.set('cryo');
        return;
      case 'Escape':
        this.selectedType.set(null);
        return;
      default:
        return;
    }
  }

  protected onPadClick(padId: string): void {
    this.place(padId);
  }

  protected onPadKeydown(event: KeyboardEvent, padId: string): void {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    this.place(padId);
  }

  private place(padId: string): void {
    const towerType = this.selectedType();
    if (!towerType) {
      this.placementError.set('Select a tower first.');
      return;
    }
    const result = this.facade.dispatch({ type: 'placeTower', towerType, padId });
    this.placementError.set(result.ok ? '' : placementMessage(result.reason));
  }
}
