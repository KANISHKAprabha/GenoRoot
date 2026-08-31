import ChipSelect from '../shared/ChipSelect';
import StickyContinueButton from '../shared/StickyContinueButton';

const OPTIONS = [
  'Father had hair loss',
  'Mother had hair loss',
  'Siblings with thinning or baldness',
  'No known family history',
];

export default function FamilyHistory({ state, dispatch, onContinue, onBack }) {
  const value = state.personal_family.family_history;
  const canContinue = value.length > 0;

  return (
    <div className="screen">
      <h2 className="screen-title">Family mein baal jhadne ki history?</h2>
      <p className="screen-subtitle">Jo bhi lagu ho select karein</p>

      <ChipSelect
        options={OPTIONS}
        value={value}
        onChange={(newVal) =>
          dispatch({ type: 'PATCH_PERSONAL_FAMILY', payload: { family_history: newVal } })
        }
        noneOption="No known family history"
      />

      <StickyContinueButton
        onContinue={onContinue}
        onBack={onBack}
        disabled={!canContinue}
      />
    </div>
  );
}
