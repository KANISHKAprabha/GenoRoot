import SingleSelectPills from '../shared/SingleSelectPills';
import StickyContinueButton from '../shared/StickyContinueButton';

export default function SexGate({ state, dispatch, onContinue }) {
  const canContinue = state.sex !== null;

  return (
    <div className="screen" style={{ paddingTop: 32 }}>
      <div>
        <h1 className="screen-title" style={{ fontSize: '1.7rem', marginBottom: 8 }}>
          GenoRoot Hair &amp; Scalp Intake
        </h1>
        <p className="screen-subtitle">
          Yeh ek chhota sa guided check-in hai aapke baalon ke baare mein.
          Sirf 5–7 minute lagenge — koi typing nahi, bas tap karte jaiye.
        </p>
      </div>

      <div>
        <p style={{ fontWeight: 600, marginBottom: 16 }}>
          Pehle batayein — aap kaun hain?
        </p>
        <SingleSelectPills
          options={['Male', 'Female']}
          value={state.sex}
          onChange={(val) => dispatch({ type: 'SET_SEX', payload: val })}
        />
      </div>

      <StickyContinueButton
        onContinue={onContinue}
        disabled={!canContinue}
        label="Shuru Karein →"
      />
    </div>
  );
}
