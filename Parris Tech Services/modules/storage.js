const clone = (value) => JSON.parse(JSON.stringify(value));
const STORAGE_KEY = "parrisTechServicesApp";

export function loadState(defaultState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(defaultState);
    const parsed = JSON.parse(raw);
    return { ...clone(defaultState), ...parsed };
  } catch (err) {
    console.error("Failed to load state", err);
    return clone(defaultState);
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save state", err);
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
