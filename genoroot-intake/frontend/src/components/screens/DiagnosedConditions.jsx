import ChipSelect from '../shared/ChipSelect';
import StickyContinueButton from '../shared/StickyContinueButton';

const OPTIONS_ALL = [
  'PCOS/PCOD',
  'Thyroid disorder',
  'Diabetes',
  'Autoimmune disease',
  'Anemia',
  'None',
];
const OPTIONS_MALE = [
  'Thyroid disorder',
  'Diabetes',
  'Autoimmune disease',
  'Anemia',
  'None',
];

export default function DiagnosedConditions({ state, dispatch, onContinue, onBack }) {
  const value = state.hormonal_health.diagnosed_conditions;
  const options = state.sex === 'Male' ? OPTIONS_MALE : OPTIONS_ALL;
  const canContinue = value.length > 0;

  return (
    <div className="screen">
      <h2 className="screen-title">Koi health condition diagnose hui hai?</h2>
      <p className="screen-subtitle">
        Doctor ne jo bataya ho select karein — ya "None" chunein
      </p>

      <ChipSelect
        options={options}
        value={value}
        onChange={(newVal) =>
          dispatch({ type: 'PATCH_HORMONAL_HEALTH', payload: { diagnosed_conditions: newVal } })
        }
        noneOption="None"
      />

      <StickyContinueButton
        onContinue={onContinue}
        onBack={onBack}
        disabled={!canContinue}
      />
    </div>
  );
}
