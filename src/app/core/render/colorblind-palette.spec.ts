import { clearStaticCache, type DrawContext } from './background';
import { COLORBLIND_HUES, COLORBLIND_PALETTE, PALETTE, restoreDefaultPalette } from './palette';
import { renderMap, setRangeCircle } from './renderer';

function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const channel = (start: number): number => {
    const srgb = parseInt(value.slice(start, start + 2), 16) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function recordingContext(): { ctx: DrawContext; fills: string[] } {
  const fills: string[] = [];
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
      fills.push(String(this.fillStyle));
    },
    fillRect() {
      return undefined;
    },
    strokeRect() {
      return undefined;
    },
    arc() {
      return undefined;
    },
  };
  return { ctx, fills };
}

describe('colorblind palette', () => {
  beforeEach(() => {
    clearStaticCache();
    setRangeCircle(null);
    restoreDefaultPalette();
  });

  afterEach(() => {
    clearStaticCache();
    setRangeCircle(null);
    restoreDefaultPalette();
  });

  it('fills the core with the lightest of the four locked hues', () => {
    const hues = [
      COLORBLIND_HUES.path,
      COLORBLIND_HUES.pad,
      COLORBLIND_HUES.entry,
      COLORBLIND_HUES.core,
    ];
    const ordered = [...hues].sort((left, right) => luminance(left) - luminance(right));
    expect(ordered).toEqual([
      COLORBLIND_HUES.path,
      COLORBLIND_HUES.pad,
      COLORBLIND_HUES.entry,
      COLORBLIND_HUES.core,
    ]);
    expect(luminance(COLORBLIND_HUES.path)).toBeLessThan(luminance(COLORBLIND_HUES.pad));
    expect(luminance(COLORBLIND_HUES.pad)).toBeLessThan(luminance(COLORBLIND_HUES.entry));
    expect(luminance(COLORBLIND_HUES.entry)).toBeLessThan(luminance(COLORBLIND_HUES.core));

    const recorded = recordingContext();
    const defaultCore = PALETTE.core;
    renderMap({ getContext: () => recorded.ctx }, 960, 576, COLORBLIND_PALETTE);

    expect(recorded.fills.at(-1)).toBe(COLORBLIND_HUES.core);
    expect(recorded.fills.at(-1)).toBe(ordered.at(-1));
    expect(PALETTE.core).toBe(defaultCore);
    expect(defaultCore).toBe('#ff4d6d');
  });
});
