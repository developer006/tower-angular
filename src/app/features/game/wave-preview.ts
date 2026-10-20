import { Component, computed, inject } from '@angular/core';
import type { EnemyType } from '../../core/content/types';
import { getWave } from '../../core/content/waves';
import { GameFacade } from '../../state/game-facade';

const GROUP_LABELS: Record<EnemyType, readonly [string, string]> = {
  drone: ['Drone', 'Drones'],
  runner: ['Runner', 'Runners'],
  tank: ['Tank', 'Tanks'],
  swarm: ['Swarm', 'Swarm'],
  overlord: ['Overlord', 'Overlords'],
};

function groupLabel(type: EnemyType, count: number): string {
  const [one, many] = GROUP_LABELS[type];
  return count === 1 ? one : many;
}

@Component({
  selector: 'app-wave-preview',
  templateUrl: './wave-preview.html',
})
export class WavePreview {
  private readonly facade = inject(GameFacade);

  protected readonly groups = computed(() =>
    getWave(this.facade.wave()).groups.map((group) => ({
      count: group.count,
      label: groupLabel(group.type, group.count),
    })),
  );
}
