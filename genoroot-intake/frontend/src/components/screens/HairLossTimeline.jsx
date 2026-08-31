import SingleSelectPills from '../shared/SingleSelectPills';
import StickyContinueButton from '../shared/StickyContinueButton';

const DURATION_OPTIONS = ['Less than 6 months', '6-12 months', 'Over a year'];

export default function HairLossTimeline({ state, dispatch, onContinue, onBack }) {
  const { age_hair_loss_began, duration } = state.personal_family;

  // SKILL.md: both confirmed explicitly — never compute one from the other
  const canContinue =
    age_hair_loss_began !== null &&
    age_hair_loss_began > 0 &&
    age_hair_loss_began <= 100 &&
    duration !== null;

  function handleAge(e) {
    const raw = e.target.value;
    const val = raw === '' ? null : parseInt(raw, 10);
    dispatch({
      type: 'PATCH_PERSONAL_FAMILY',
      payload: { age_hair_loss_began: isNaN(val) ? null : val },
    });
  }

  return (
    <div className="screen">
      <h2 className="screen-title">Baal kab se jhad rahe hain?</h2>

      <div>
        <p style={{ fontWeight: 600, marginBottom: 12 }}>
          Jab baal jhad ne shuru hue, uss waqt aapki umra kitni thi?
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="number"
            className="number-input"
            min="1"
            max="100"
            value={age_hair_loss_began ?? ''}
            onChange={handleAge}
            placeholder="e.g. 32"
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>saal ki umra mein</span>
        </div>
      </div>

      <div>
        <p style={{ fontWeight: 600, marginBottom: 12 }}>
          Aur tab se ab tak kitna time ho gaya?
        </p>
        <SingleSelectPills
          options={DURATION_OPTIONS}
          value={duration}
          onChange={(val) =>
            dispatch({ type: 'PATCH_PERSONAL_FAMILY', payload: { duration: val } })
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
