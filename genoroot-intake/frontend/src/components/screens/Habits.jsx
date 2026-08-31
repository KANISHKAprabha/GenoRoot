// Screen 8 — Stacked toggle list with inline followups.
// Toggle-to-No clearing rule enforced in SET_HABIT (reducer).
// Gap 5: heating_tools_styling_chemicals is compound — copy is honest about "either".
// Gap 6: hard_water has inline hint about white residue.
import ToggleRow from '../shared/ToggleRow';
import SingleSelectPills from '../shared/SingleSelectPills';
import StickyContinueButton from '../shared/StickyContinueButton';

const SMOKING_SEVERITY = ['Mild <5/day', 'Moderate 5-10/day', 'Severe >10/day'];
const HAIR_WASH_FREQ = ['Daily', 'Alternate Days', 'Weekly'];

export default function Habits({ state, dispatch, onContinue, onBack }) {
  const h = state.lifestyle.habits;

  function set(key, val) {
    dispatch({ type: 'SET_HABIT', payload: { key, value: val } });
  }

  const canContinue =
    h.smoking !== null &&
    (h.smoking === false || h.smoking_severity !== null) &&
    h.alcohol !== null &&
    h.hard_water !== null &&
    h.hair_wash_frequency !== null &&
    h.heating_tools_styling_chemicals !== null &&
    h.salon_treatments !== null &&
    (h.salon_treatments === false ||
      (h.salon_treatment_detail && h.salon_treatment_detail.trim()));

  return (
    <div className="screen">
      <h2 className="screen-title">Roz ki aadat aur lifestyle</h2>
      <p className="screen-subtitle">Har sawaal ka jawab dein</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Smoking + severity followup */}
        <div>
          <ToggleRow
            label="Kya aap smoking karte hain?"
            value={h.smoking}
            onChange={(val) => set('smoking', val)}
          />
          {h.smoking === true && (
            <div className="followup">
              <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.95rem' }}>
                Kitna smoking karte hain?
              </p>
              <SingleSelectPills
                options={SMOKING_SEVERITY}
                value={h.smoking_severity}
                onChange={(val) => set('smoking_severity', val)}
              />
            </div>
          )}
        </div>

        {/* Alcohol */}
        <ToggleRow
          label="Kya aap alcohol lete hain?"
          value={h.alcohol}
          onChange={(val) => set('alcohol', val)}
        />

        {/* Hard water — Gap 6: inline hint */}
        <ToggleRow
          label="Kya aap hard water use karte hain?"
          hint="Pehchanein: taps par white residue ya soap ka jhag kam hona"
          value={h.hard_water}
          onChange={(val) => set('hard_water', val)}
        />

        {/* Hair wash frequency — always shown, single select */}
        <div>
          <p style={{ fontWeight: 600, marginBottom: 12 }}>
            Aap baal kitni baar dhote hain?
          </p>
          <SingleSelectPills
            options={HAIR_WASH_FREQ}
            value={h.hair_wash_frequency}
            onChange={(val) => set('hair_wash_frequency', val)}
          />
        </div>

        {/* Gap 5: compound question — heat tools OR chemical treatments */}
        <ToggleRow
          label="Kya aap heat styling tools ya chemical hair treatments use karte hain?"
          value={h.heating_tools_styling_chemicals}
          onChange={(val) => set('heating_tools_styling_chemicals', val)}
        />

        {/* Salon treatments + detail followup */}
        <div>
          <ToggleRow
            label="Kya aap salon treatments lete hain?"
            value={h.salon_treatments}
            onChange={(val) => set('salon_treatments', val)}
          />
          {h.salon_treatments === true && (
            <div className="followup">
              <p style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.95rem' }}>
                Kaun se salon treatments? (likhein)
              </p>
              <textarea
                className="text-input"
                placeholder="e.g. Keratin, hair spa, bleaching..."
                value={h.salon_treatment_detail ?? ''}
                autoFocus
                onChange={(e) => set('salon_treatment_detail', e.target.value)}
              />
            </div>
          )}
        </div>

      </div>

      <StickyContinueButton
        onContinue={onContinue}
        onBack={onBack}
        disabled={!canContinue}
      />
    </div>
  );
}
