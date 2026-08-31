// Screen 6 — UNIVERSAL (Gap 2). Shown to every patient regardless of sex
// or diagnosed_conditions. Do NOT gate behind PCOS or female-only branch.
import ToggleRow from '../shared/ToggleRow';
import StickyContinueButton from '../shared/StickyContinueButton';

export default function AcneBodyHair({ state, dispatch, onContinue, onBack }) {
  const { adult_acne_oily_skin, excess_body_facial_hair } = state.hormonal_health;
  const canContinue = adult_acne_oily_skin !== null && excess_body_facial_hair !== null;

  function patch(key, val) {
    dispatch({ type: 'PATCH_HORMONAL_HEALTH', payload: { [key]: val } });
  }

  return (
    <div className="screen">
      <h2 className="screen-title">Skin aur extra baal ke baare mein</h2>
      <p className="screen-subtitle">Dono sawaalon ka jawab zaroor dein</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ToggleRow
          label="Kya aapko adult acne ya oily skin ki problem hai?"
          value={adult_acne_oily_skin}
          onChange={(val) => patch('adult_acne_oily_skin', val)}
        />
        <ToggleRow
          label="Kya aapke body ya chehere par zyada baal aate hain?"
          value={excess_body_facial_hair}
          onChange={(val) => patch('excess_body_facial_hair', val)}
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
