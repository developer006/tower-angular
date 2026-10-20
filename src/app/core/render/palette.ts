export interface MapPalette {
  background: string;
  grid: string;
  path: string;
  padFill: string;
  padStroke: string;
  entry: string;
  core: string;
}

export const PALETTE: MapPalette = {
  background: '#0b1020',
  grid: '#1c2744',
  path: '#3d4f7c',
  padFill: '#12343f',
  padStroke: '#3ec6ff',
  entry: '#7cffb2',
  core: '#ff4d6d',
};

/** Four hues, not a red/green pair. Grayscale order is path, pad, entry, core. */
export const COLORBLIND_HUES = {
  path: '#2f5584',
  pad: '#4f86c6',
  entry: '#f0b429',
  core: '#fff4c8',
} as const;

export const COLORBLIND_PALETTE: MapPalette = {
  background: PALETTE.background,
  grid: PALETTE.grid,
  path: COLORBLIND_HUES.path,
  padFill: COLORBLIND_HUES.pad,
  padStroke: PALETTE.padStroke,
  entry: COLORBLIND_HUES.entry,
  core: COLORBLIND_HUES.core,
};

const DEFAULT_PALETTE: MapPalette = {
  background: PALETTE.background,
  grid: PALETTE.grid,
  path: PALETTE.path,
  padFill: PALETTE.padFill,
  padStroke: PALETTE.padStroke,
  entry: PALETTE.entry,
  core: PALETTE.core,
};

export function samePalette(left: MapPalette, right: MapPalette): boolean {
  return (
    left.background === right.background &&
    left.grid === right.grid &&
    left.path === right.path &&
    left.padFill === right.padFill &&
    left.padStroke === right.padStroke &&
    left.entry === right.entry &&
    left.core === right.core
  );
}

export function writePalette(target: MapPalette, source: MapPalette): void {
  target.background = source.background;
  target.grid = source.grid;
  target.path = source.path;
  target.padFill = source.padFill;
  target.padStroke = source.padStroke;
  target.entry = source.entry;
  target.core = source.core;
}

export function restoreDefaultPalette(): void {
  writePalette(PALETTE, DEFAULT_PALETTE);
}
