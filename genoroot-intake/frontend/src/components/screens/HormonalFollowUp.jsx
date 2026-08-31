// Screen 5 — female-only (Gap 1). Only rendered when state.sex === 'Female'.
import SingleSelectPills from '../shared/SingleSelectPills';
import StickyContinueButton from '../shared/StickyContinueButton';

const MENSTRUAL_OPTIONS = ['Regular', 'Irregular', 'Menopausal', 'Not applicable'];
const PREGNANCY_OPTIONS = ['Currently pregnant', 'Postpartum <1 year', 'Not applicable'];

export default function HormonalFollowUp({ state, dispatch, onContinue, onBack }) {
  const { menstrual_cycle, pregnancy_related } = state.hormonal_health;
  const canContinue = menstrual_cycle !== null && pregnancy_related !== null;

  return (
    <div className="screen">
      <h2 className="screen-title">Hormonal health ke baare mein</h2>

      <div>
        <p style={{ fontWeight: 600, marginBottom: 12 }}>
          Aapka menstrual cycle kaisa hai?
        </p>
        <SingleSelectPills
          options={MENSTRUAL_OPTIONS}
          value={menstrual_cycle}
          onChange={(val) =>
            dispatch({ type: 'PATCH_HORMONAL_HEALTH', payload: { menstrual_cycle: val } })
          }
        />
      </div>

      <div>
        <p style={{ fontWeight: 600, marginBottom: 12 }}>
          Pregnancy ke baare mein batayein:
        </p>
        <SingleSelectPills
          options={PREGNANCY_OPTIONS}
          value={pregnancy_related}
          onChange={(val) =>
            dispatch({ type: 'PATCH_HORMONAL_HEALTH', payload: { pregnancy_related: val } })
          }
        />
      </div>

      <StickyContinueButton
        onContinue={onContinue}
        onBack={onBack}
        disabled={!canContinue}
      />
    </div>
  );
}
