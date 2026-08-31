import ChipSelect from '../shared/ChipSelect';
import StickyContinueButton from '../shared/StickyContinueButton';

const OPTIONS = [
  'Receding hairline',
  'Thinning at crown',
  'Widening part line',
  'Diffuse thinning',
  'Patchy loss',
  'Sudden excessive shedding',
];

export default function HairLossPattern({ state, dispatch, onContinue, onBack }) {
  const value = state.personal_family.pattern;
  const canContinue = value.length > 0;

  return (
    <div className="screen">
      <h2 className="screen-title">Baal kis tarah se jhad rahe hain?</h2>
      <p className="screen-subtitle">Ek ya zyada select kar sakte hain</p>

      <ChipSelect
        options={OPTIONS}
        value={value}
        onChange={(newVal) =>
          dispatch({ type: 'PATCH_PERSONAL_FAMILY', payload: { pattern: newVal } })
        }
      />

      <StickyContinueButton
        onContinue={onContinue}
        onBack={onBack}
        disabled={!canContinue}
      />
    </div>
  );
}
