import { Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { MAP_01, tileCenter } from '../../core/content/map-01';
import { towerDef } from '../../core/content/towers';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  type TargetingMode,
  type TowerType,
} from '../../core/content/types';
import type { RejectReason, TowerState } from '../../core/game/state';
import { setRangeCircle } from '../../core/render/renderer';
import { GameFacade } from '../../state/game-facade';

const PAD_SIZE = 36;

interface PadButton {
  id: string;
  left: string;
  top: string;
}

interface InspectedTower {
  id: string;
  padId: string;
  towerType: TowerType;
  level: 1 | 2 | 3;
  invested: number;
  targeting: TargetingMode;
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

function inspectedFrom(tower: TowerState): InspectedTower {
  return {
    id: tower.id,
    padId: tower.padId,
    towerType: tower.towerType,
    level: tower.level,
    invested: tower.invested,
    targeting: tower.targeting,
  };
}

@Component({
  selector: 'app-board-overlay',
  templateUrl: './board-overlay.html',
  styleUrl: './board-overlay.css',
  host: {
    'data-testid': 'board-overlay',
    '[attr.data-selected-type]': 'selectedType() ?? ""',
    '[attr.data-range-tiles]': 'rangeTiles()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class BoardOverlay {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly facade = inject(GameFacade);
  protected readonly pads = padButtons();
  protected readonly selectedType = signal<TowerType | null>(null);
  protected readonly placementError = signal('');
  protected readonly inspected = signal<InspectedTower | null>(null);
  protected readonly rangeTiles = signal<string | null>(null);
  private readonly hoveredPadId = signal<string | null>(null);
  private readonly focusedPadId = signal<string | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    const onDocumentKey = (event: KeyboardEvent): void => {
      this.onKeydown(event);
    };
    document.addEventListener('keydown', onDocumentKey);
    destroyRef.onDestroy(() => {
      document.removeEventListener('keydown', onDocumentKey);
      setRangeCircle(null);
    });
  }

  selectType(type: TowerType): void {
    this.selectedType.set(type);
    this.inspected.set(null);
    this.publishRange();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.currentTarget === document && this.host.nativeElement.contains(event.target as Node)) {
      return;
    }
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      return;
    }
    switch (event.key) {
      case '1':
        this.selectType('pulse');
        return;
      case '2':
        this.selectType('mortar');
        return;
      case '3':
        this.selectType('cryo');
        return;
      case 'Escape':
        this.selectedType.set(null);
        this.publishRange();
        return;
      default:
        return;
    }
  }

  protected onPadClick(padId: string): void {
    if (!this.selectedType()) {
      const tower = this.towerOnPad(padId);
      if (tower) {
        this.inspected.set(tower);
        this.placementError.set('');
        this.publishRange();
        return;
      }
    }
    this.place(padId);
  }

  protected onPadKeydown(event: KeyboardEvent, padId: string): void {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    this.place(padId);
  }

  protected onPadEnter(padId: string): void {
    this.hoveredPadId.set(padId);
    this.publishRange();
  }

  protected onPadLeave(padId: string): void {
    if (this.hoveredPadId() === padId) {
      this.hoveredPadId.set(null);
      this.publishRange();
    }
  }

  protected onPadFocus(padId: string): void {
    this.focusedPadId.set(padId);
    this.publishRange();
  }

  protected onPadBlur(padId: string): void {
    if (this.focusedPadId() === padId) {
      this.focusedPadId.set(null);
      this.publishRange();
    }
  }

  protected onUpgrade(): void {
    const tower = this.inspected();
    if (!tower || tower.level === 3) {
      return;
    }
    this.facade.dispatch({ type: 'upgradeTower', towerId: tower.id });
    this.inspected.set(this.towerById(tower.id));
    this.publishRange();
  }

  protected onSell(): void {
    const tower = this.inspected();
    if (!tower) {
      return;
    }
    const result = this.facade.dispatch({ type: 'sellTower', towerId: tower.id });
    if (!result.ok) {
      return;
    }
    this.inspected.set(null);
    this.placementError.set('');
    this.publishRange();
  }

  protected onTargeting(event: Event): void {
    const tower = this.inspected();
    const select = event.target;
    if (!tower || !(select instanceof HTMLSelectElement)) {
      return;
    }
    const mode = select.value;
    if (mode !== 'first' && mode !== 'strongest' && mode !== 'closest') {
      return;
    }
    this.facade.dispatch({ type: 'setTargeting', towerId: tower.id, mode });
    this.inspected.set(this.towerById(tower.id));
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

  private towerOnPad(padId: string): InspectedTower | null {
    const tower = this.facade.getFullState().towers.find((item) => item.padId === padId);
    return tower ? inspectedFrom(tower) : null;
  }

  private towerById(id: string): InspectedTower | null {
    const tower = this.facade.getFullState().towers.find((item) => item.id === id);
    return tower ? inspectedFrom(tower) : null;
  }

  private publishRange(): void {
    const selected = this.selectedType();
    const activePadId = this.hoveredPadId() ?? this.focusedPadId();
    const tower = this.inspected();
    let padId: string | null = null;
    let tiles: number | null = null;
    if (selected && activePadId) {
      padId = activePadId;
      tiles = towerDef(selected).levels[0].range;
    } else if (tower) {
      padId = tower.padId;
      tiles = towerDef(tower.towerType).levels[tower.level - 1].range;
    }
    this.rangeTiles.set(tiles === null ? null : String(tiles));
    const pad = padId ? MAP_01.pads.find((item) => item.id === padId) : undefined;
    if (tiles === null || !pad) {
      setRangeCircle(null);
      return;
    }
    const center = tileCenter(pad.col, pad.row);
    setRangeCircle({ x: center.x, y: center.y, rangeTiles: tiles });
  }
}
