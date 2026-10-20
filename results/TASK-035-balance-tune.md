status: pass
commit: pending
verify: npm run sim && npm test && npm run lint && npm run e2e
verify_exit: 0
files:
- src/app/core/content/towers.ts
- src/app/core/content/enemies.ts
- results/TASK-035-balance-tune.md
deviations:
- none
notes:
- none seed=1 outcome=defeat bestWave=2 wavesCleared=1 integrity=0 kills=0 score=100
- pulse seed=1 outcome=defeat bestWave=6 wavesCleared=5 integrity=0 kills=80 score=1300
- mortar seed=1 outcome=defeat bestWave=6 wavesCleared=5 integrity=0 kills=77 score=1270
- cryo seed=1 outcome=defeat bestWave=6 wavesCleared=5 integrity=0 kills=75 score=1250
- mixed seed=1 outcome=victory bestWave=10 wavesCleared=10 integrity=11 kills=196 score=3235
- Mixed search hit on the first seed. Seeds 2-30 were not run.
- mortarBase.damage 45 -> 34. Level 2 damage is now 44.2 (34 * 1.3). Level 3 damage is now 54.4 (34 * 1.6). Mortar rate, range, splash, cost, and upgrade costs were not changed.
- cryoBase.rate 1.2 -> 4.8. Level 2 rate is now 5.28 (4.8 * 1.1). Level 3 rate is now 5.76 (4.8 * 1.2). Cryo damage stayed 5. Slow strength and duration were not changed.
- tank.speed 0.55 -> 1.35. Tank hp stayed 300. Tank armor stayed 4.
- Pulse cost 70 and damage 12, drone hp 55 bounty 6 leak 1, wave 10 counts, leak damages, and sell refunds 49 and 84 were not changed.

# TASK-035 Result

**Status:** pass
**Branch:** task/TASK-035-balance-tune
**Commit:** pending

## Summary

Content tables were tuned so `npm run sim` meets the invariants. Rows below are copied from that stdout.

```text
none seed=1 outcome=defeat bestWave=2 wavesCleared=1 integrity=0 kills=0 score=100
pulse seed=1 outcome=defeat bestWave=6 wavesCleared=5 integrity=0 kills=80 score=1300
mortar seed=1 outcome=defeat bestWave=6 wavesCleared=5 integrity=0 kills=77 score=1270
cryo seed=1 outcome=defeat bestWave=6 wavesCleared=5 integrity=0 kills=75 score=1250
mixed seed=1 outcome=victory bestWave=10 wavesCleared=10 integrity=11 kills=196 score=3235
```

## Files changed

- `src/app/core/content/towers.ts` — mortar base damage 34; cryo base rate 4.8.
- `src/app/core/content/enemies.ts` — tank speed 1.35.
- `results/TASK-035-balance-tune.md` — this report.

## Tests and evidence

- `npm run sim && npm test && npm run lint && npm run e2e` -> exit 0
- `npm test` -> 13 files, 87 tests passed
- `npm run lint` -> All files pass linting
- `npm run e2e` -> 8 passed

## Acceptance criteria

- [x] `none` defeats at bestWave 2
- [x] `pulse`, `mortar`, and `cryo` defeat at bestWave 6
- [x] `mixed` seed 1 wins with integrity 11 (window 8-15)
- [x] Printed rows copied above. No unprinted row was added
- [x] Engine, systems, and `strategies.ts` were not edited

## Decisions / assumptions

- Cryo damage stayed 5 because `combat.spec.ts` asserts that projectile damage. Cryo rate was raised so a cryo-only build can clear unarmored waves and still die to wave 6 tanks.
- Tank hp stayed 300 because `combat.spec.ts` asserts a Pulse shot leaves a tank at 292. Tank speed was raised so single-type builds leak the wave 6 tanks.
- Mortar damage was lowered so a mortar-only build no longer clears those tanks. Mixed seed 1 still does, via cryo slow plus pulse and mortar.
- Wave tables were left unchanged. Wave 10 counts and every leak damage stayed locked.
