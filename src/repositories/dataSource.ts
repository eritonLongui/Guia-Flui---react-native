let mockEnabled = false;

export function setMockModeEnabled(value: boolean) {
  mockEnabled = value;
}

export function isMockModeEnabled() {
  return mockEnabled;
}
