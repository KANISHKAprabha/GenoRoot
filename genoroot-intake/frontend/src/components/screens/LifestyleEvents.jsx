// Screen 7 — Gap 4: "None of these apply" stores the string in UI state;
// intakeApi.js converts to [] before sending. A touched flag is required so
// an unanswered screen cannot look like a confirmed-empty one.
import ChipSelect from '../shared/ChipSelect';
import StickyContinueButton from '../shared/StickyContinueButton';
import { isTouched } from '../../validation/touchedTracker';

const OPTIONS = [
  'Crash dieting or major weight loss',
  'High stress or emotional trauma',
  'Fever with illness (COVID, Dengue, Typhoid)',
  'Recent surgery',
  'Change in location/water/air quality',
  'None of these apply',
];

const SCREEN_KEY = 'LifestyleEvents';

export default function LifestyleEvents({ state, dispatch, onContinue, onBack }) {
  const value = state.lifestyle.past_6_months;
  const touched = isTouched(state, SCREEN_KEY);
  // Any non-empty selection is valid; "None of these apply" (length=1) is also valid.
  const canContinue = touched && value.length > 0;

  function handleChange(newVal) {
    if (!touched) {
      dispatch({ type: 'TOUCH_SCREEN', payload: SCREEN_KEY });
    }
    dispatch({ type: 'PATCH_LIFESTYLE', payload: { past_6_months: newVal } });
  }

  return (
    <div className="screen">
      <h2 className="screen-title">Pichle 6 mahine mein kya hua?</h2>
      <p className="screen-subtitle">
        Koi bhi hua ho to select karein — ya "None of these apply" chunein
      </p>

      <ChipSelect
        options={OPTIONS}
        value={value}
        onChange={handleChange}
        noneOption="None of these apply"
      />

      {!touched && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Koi option zaroor chunein aage badhne ke liye
        </p>
      )}

      <StickyContinueButton
        onContinue={onContinue}
        onBack={onBack}
        disabled={!canContinue}
      />
    </div>
  );
}
