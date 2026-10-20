import { TestBed } from '@angular/core/testing';
import { SETTINGS_STORAGE_KEY, SettingsStore } from './settings-store';

describe('SettingsStore', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  });

  it('loads defaults for a missing key and does not throw or touch theme', () => {
    localStorage.setItem('theme', 'deeppurple-amber');
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    const store = expectNoThrow();
    expect(store.bestScore()).toBe(0);
    expect(store.bestWave()).toBe(0);
    expect(store.soundMuted()).toBe(false);
    expect(store.reducedMotion()).toBe(false);
    expect(store.colorblind()).toBe(false);
    expect(localStorage.getItem('theme')).toBe('deeppurple-amber');
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
  });

  it('loads defaults for corrupt JSON and does not throw', () => {
    localStorage.setItem('theme', 'purple-green');
    localStorage.setItem(SETTINGS_STORAGE_KEY, '{');
    const store = expectNoThrow();
    expect(store.bestScore()).toBe(0);
    expect(store.bestWave()).toBe(0);
    expect(store.soundMuted()).toBe(false);
    expect(store.reducedMotion()).toBe(false);
    expect(store.colorblind()).toBe(false);
    expect(localStorage.getItem('theme')).toBe('purple-green');
  });

  it('loads defaults when bestScore has the wrong type and does not throw', () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        bestScore: 'nope',
        bestWave: 4,
        soundMuted: true,
        reducedMotion: true,
        colorblind: true,
      }),
    );
    const store = expectNoThrow();
    expect(store.bestScore()).toBe(0);
    expect(store.bestWave()).toBe(0);
    expect(store.soundMuted()).toBe(false);
    expect(store.reducedMotion()).toBe(false);
    expect(store.colorblind()).toBe(false);
  });

  it('keeps bestScore at 100 after a later finalized score of 50', () => {
    const store = TestBed.inject(SettingsStore);
    store.recordRunEnd(100, 2);
    store.recordRunEnd(50, 1);
    expect(store.bestScore()).toBe(100);
    expect(store.bestWave()).toBe(2);
    store.load();
    expect(store.bestScore()).toBe(100);
    expect(store.bestWave()).toBe(2);
    const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? '{}') as Record<
      string,
      unknown
    >;
    expect(saved['bestScore']).toBe(100);
    expect(saved).not.toHaveProperty('theme');
    expect(localStorage.getItem('theme')).not.toBe(SETTINGS_STORAGE_KEY);
  });

  it('writes reduced motion and colorblind booleans and leaves theme unchanged', () => {
    localStorage.setItem('theme', 'deeppurple-amber');
    const store = TestBed.inject(SettingsStore);
    store.toggleReducedMotion();
    store.toggleColorblind();
    const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? '{}') as Record<
      string,
      unknown
    >;
    expect(saved['reducedMotion']).toBe(true);
    expect(saved['colorblind']).toBe(true);
    expect(typeof saved['reducedMotion']).toBe('boolean');
    expect(typeof saved['colorblind']).toBe('boolean');
    expect(saved).not.toHaveProperty('theme');
    expect(localStorage.getItem('theme')).toBe('deeppurple-amber');
    store.load();
    expect(store.reducedMotion()).toBe(true);
    expect(store.colorblind()).toBe(true);
    expect(localStorage.getItem('theme')).toBe('deeppurple-amber');
  });
});

function expectNoThrow(): SettingsStore {
  let store: SettingsStore | undefined;
  expect(() => {
    store = TestBed.inject(SettingsStore);
  }).not.toThrow();
  if (!store) {
    throw new Error('SettingsStore was not created');
  }
  return store;
}
