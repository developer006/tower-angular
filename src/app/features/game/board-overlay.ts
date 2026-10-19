import { Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { MAP_01, tileCenter } from '../../core/content/map-01';
import { CANVAS_HEIGHT, CANVAS_WIDTH, type TowerType } from '../../core/content/types';

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
  protected readonly pads = padButtons();
  protected readonly selectedType = signal<TowerType | null>(null);

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

  protected onPadClick(): void {
    // TASK-021 places the tower
    return;
  }
}
