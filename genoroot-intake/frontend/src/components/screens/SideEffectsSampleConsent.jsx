import { useEffect } from 'react';
import ToggleRow from '../shared/ToggleRow';
import SingleSelectPills from '../shared/SingleSelectPills';
import StickyContinueButton from '../shared/StickyContinueButton';

const SAMPLE_OPTIONS = ['Saliva', 'Blood', 'Either'];

export default function SideEffectsSampleConsent({ state, dispatch, onContinue, onBack }) {
  const { past_treatment_side_effects, describe } = state.treatments;
  const { sample_type, consent } = state.sample_consent;

  const anyProductSideEffect = Object.values(state.treatments.products).some(
    (p) => p.side_effects === true
  );

  // Gap 7: pre-fill toggle only when products had side effects — never pre-fill describe text
  useEffect(() => {
    if (past_treatment_side_effects === null && anyProductSideEffect) {
      dispatch({ type: 'PATCH_TREATMENTS', payload: { past_treatment_side_effects: true } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canContinue =
    past_treatment_side_effects !== null &&
    (past_treatment_side_effects === false ||
      (describe && describe.trim().length > 0)) &&
    sample_type !== null &&
    consent === true;

  function setSideEffects(val) {
    dispatch({
      type: 'PATCH_TREATMENTS',
      payload: {
        past_treatment_side_effects: val,
        describe: val ? describe : null,
      },
    });
  }

  return (
    <div className="screen">
      <h2 className="screen-title">Side effects, sample aur consent</h2>

      {/* Field 14 — naked toggle so Haan/Nahi sit inline with question, no box */}
      <div>
        <ToggleRow
          label="Kya kisi bhi treatment se side effects hue?"
          hint={
            anyProductSideEffect && past_treatment_side_effects === true
              ? 'Aapne products section mein side effects bataye hain — zaroorat ho to badlein'
              : null
          }
          naked
          value={past_treatment_side_effects}
          onChange={setSideEffects}
        />
        {past_treatment_side_effects === true && (
          <div className="followup" style={{ marginTop: 12 }}>
            <p style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.95rem' }}>
              Kaun se side effects hue? (apne shabd mein likhein)
            </p>
            <textarea
              className="text-input"
              placeholder="e.g. Scalp irritation, redness, hairfall badh gayi..."
              value={describe ?? ''}
              autoFocus
              onChange={(e) =>
                dispatch({ type: 'PATCH_TREATMENTS', payload: { describe: e.target.value } })
              }
            />
          </div>
        )}
      </div>

      {/* Field 15 — sample_type */}
      <div>
        <p style={{ fontWeight: 600, marginBottom: 12 }}>
          Aap kaunsa sample dena chahenge?
        </p>
        <SingleSelectPills
          options={SAMPLE_OPTIONS}
          value={sample_type}
          onChange={(val) =>
            dispatch({ type: 'PATCH_SAMPLE_CONSENT', payload: { sample_type: val } })
          }
        />
      </div>

      {/* Field 16 — consent: must be explicitly true, never pre-checked */}
      <div>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>
          Aapki sahmat (consent) chahiye
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          Kya aap apni hair aur health information GenoRoot ke saath share karne ke liye taiyaar hain?
        </p>
        <ToggleRow
          label="Haan, main agree karta / karti hoon"
          value={consent}
          onChange={(val) =>
            dispatch({ type: 'PATCH_SAMPLE_CONSENT', payload: { consent: val } })
          }
        />
        {consent === false && (
          <p style={{ color: 'var(--error)', fontSize: '0.9rem', marginTop: 8 }}>
            Consent diye bina form submit nahi ho sakta.
          </p>
        )}
      </div>

      <StickyContinueButton
        onContinue={onContinue}
        onBack={onBack}
        disabled={!canContinue}
        label="Review Karein →"
      />
    </div>
  );
}
