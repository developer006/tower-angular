import { enemyDef } from '../content/enemies';
import { DT } from '../game/loop';
import type { GameState } from '../game/state';

export function spawnDue(state: GameState): void {
  if (state.phase === 'defeat') {
    return;
  }
  const elapsed = state.tick - state.waveStartTick;
  while (state.spawnQueue.length > 0) {
    const event = state.spawnQueue[0];
    if (elapsed < Math.round(event.time / DT)) {
      return;
    }
    state.spawnQueue.shift();
    const def = enemyDef(event.type);
    const id = state.nextEnemyId;
    state.nextEnemyId += 1;
    state.enemies.push({
      id: `e${id}`,
      enemyType: event.type,
      hp: def.hp,
      maxHp: def.hp,
      speed: def.speed,
      leakDamage: def.leakDamage,
      distanceAlongPath: 0,
      alive: true,
      slowStrength: 0,
      slowRemaining: 0,
      spawnedAtTick: state.tick,
    });
  }
}
