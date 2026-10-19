export interface TdHarnessStub {
  ready: boolean;
}

export function installHarness(_facade?: unknown): void {
  void _facade;
  const hook: TdHarnessStub = { ready: false };
  (globalThis as { __TD__?: TdHarnessStub }).__TD__ = hook;
}
