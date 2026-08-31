// Layer 1 validation helpers.
// An empty answer (e.g., past_6_months=[]) must be deliberate, not the default.
// Screens call dispatch({ type: 'TOUCH_SCREEN', payload: screenKey }) on first interaction.

export function isTouched(state, screenKey) {
  return Boolean(state._touched?.[screenKey]);
}

// Returns true if the screen is ready to advance (touched AND has a valid value).
// Used by StickyContinueButton to enable/disable Continue.
export function isScreenComplete(state, screenKey, validator) {
  return isTouched(state, screenKey) && validator(state);
}
