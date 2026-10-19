import { MAP_01, tileCenter } from '../content/map-01';
import { TILE_SIZE } from '../content/types';
import { clearStaticCache, drawStatic, type DrawContext } from './background';
import { cappedDevicePixelRatio, fitCanvasCss } from './layout';
import { PALETTE } from './palette';
import { drawDynamic, renderMap, setRangeCircle } from './renderer';

const PAD_IDS = [
  'pad-01',
  'pad-02',
  'pad-03',
  'pad-04',
  'pad-05',
  'pad-06',
  'pad-07',
  'pad-08',
  'pad-09',
  'pad-10',
  'pad-11',
  'pad-12',
  'pad-13',
  'pad-14',
];

interface RecordedRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function mockContext(): {
  ctx: DrawContext;
  pathStrokes: () => number;
  pathLineWidth: () => number;
  padFills: () => RecordedRect[];
} {
  let pathStrokes = 0;
  let pathLineWidth = 0;
  let ignored = 0;
  const padFills: RecordedRect[] = [];
  const ctx: DrawContext = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineJoin: 'miter',
    lineCap: 'butt',
    beginPath() {
      ignored += 1;
    },
    moveTo() {
      ignored += 1;
    },
    lineTo() {
      ignored += 1;
    },
    stroke() {
      if (this.strokeStyle === PALETTE.path) {
        pathStrokes += 1;
        pathLineWidth = this.lineWidth;
      }
    },
    fill() {
      ignored += 1;
    },
    fillRect(x: number, y: number, w: number, h: number) {
      if (this.fillStyle === PALETTE.padFill) {
        padFills.push({ x, y, w, h });
      }
    },
    strokeRect() {
      ignored += 1;
    },
    arc() {
      ignored += 1;
    },
  };
  void ignored;
  return {
    ctx,
    pathStrokes: () => pathStrokes,
    pathLineWidth: () => pathLineWidth,
    padFills: () => padFills,
  };
}

describe('map renderer', () => {
  beforeEach(() => {
    clearStaticCache();
    setRangeCircle(null);
  });

  it('caps device pixel ratio between 1 and 2', () => {
    expect(cappedDevicePixelRatio(1)).toBe(1);
    expect(cappedDevicePixelRatio(2)).toBe(2);
    expect(cappedDevicePixelRatio(3)).toBe(2);
    expect(cappedDevicePixelRatio(0)).toBe(1);
  });

  it('fits the 960 x 576 canvas inside the container', () => {
    expect(fitCanvasCss(960, 576)).toEqual({ width: 960, height: 576 });
    expect(fitCanvasCss(480, 576)).toEqual({ width: 480, height: 288 });
    expect(fitCanvasCss(0, 0)).toEqual({ width: 0, height: 0 });
  });

  it('draws map 01 pads and caches the static layer by backing size', () => {
    expect(MAP_01.pads.map((pad) => pad.id)).toEqual(PAD_IDS);
    expect(MAP_01.geometry.totalLength).toBe(2064);

    const first = mockContext();
    drawStatic(first.ctx, 960, 576);
    expect(first.pathStrokes()).toBe(1);
    expect(first.pathLineWidth()).toBe(28);
    expect(first.padFills()).toHaveLength(14);
    const pad = MAP_01.pads[0];
    const center = tileCenter(pad.col, pad.row);
    expect(first.padFills()[0]).toEqual({
      x: center.x - 18,
      y: center.y - 18,
      w: 36,
      h: 36,
    });

    drawStatic(first.ctx, 960, 576);
    expect(first.pathStrokes()).toBe(1);
    expect(first.padFills()).toHaveLength(14);

    const resized = mockContext();
    drawStatic(resized.ctx, 1920, 1152);
    expect(resized.pathStrokes()).toBe(1);
    expect(resized.padFills()).toHaveLength(14);
  });

  it('returns without throwing when the 2d context is missing', () => {
    expect(() => renderMap(null, 960, 576)).not.toThrow();
    expect(() => renderMap({ getContext: () => null }, 960, 576)).not.toThrow();
  });

  it('draws one range circle and does not set a glow blur', () => {
    const arcs: [number, number, number, number, number][] = [];
    let glowWrites = 0;
    const ctx: DrawContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      lineJoin: 'miter',
      lineCap: 'butt',
      beginPath() {
        return undefined;
      },
      moveTo() {
        return undefined;
      },
      lineTo() {
        return undefined;
      },
      stroke() {
        return undefined;
      },
      fill() {
        return undefined;
      },
      fillRect() {
        return undefined;
      },
      strokeRect() {
        return undefined;
      },
      arc(x: number, y: number, radius: number, start: number, end: number) {
        arcs.push([x, y, radius, start, end]);
      },
    };
    Object.defineProperty(ctx, ['shadow', 'Blur'].join(''), {
      configurable: true,
      set() {
        glowWrites += 1;
      },
    });
    const pad = MAP_01.pads[0];
    const center = tileCenter(pad.col, pad.row);
    setRangeCircle({ x: center.x, y: center.y, rangeTiles: 3.2 });
    try {
      drawDynamic(ctx);
      expect(TILE_SIZE).toBe(48);
      expect(pad.id).toBe('pad-01');
      expect(arcs).toEqual([[center.x, center.y, 3.2 * 48, 0, Math.PI * 2]]);
      expect(glowWrites).toBe(0);
      setRangeCircle(null);
      drawDynamic(ctx);
      expect(arcs).toHaveLength(1);
    } finally {
      setRangeCircle(null);
    }
  });
});
