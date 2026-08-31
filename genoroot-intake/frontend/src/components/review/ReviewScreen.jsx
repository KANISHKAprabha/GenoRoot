const PRODUCT_KEYS = [
  'OTC/Medicated Shampoos',
  'Hair Oils/Serums',
  'Topical Minoxidil',
  'Oral Minoxidil',
  'Supplements',
];
const PROCEDURE_KEYS = [
  'PRP/GFC/iPRF',
  'Stem Cells/Exosomes',
  'Hair Transplant',
  'Other',
];

function SectionCard({ letter, title, onEdit, children }) {
  return (
    <div className="summary-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="section-badge">{letter}</span>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</span>
        </div>
        <button className="summary-card__edit" onClick={onEdit}>Edit</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="summary-item">
      <span className="summary-label">{label}: </span>
      {value}
    </div>
  );
}

export default function ReviewScreen({ state, onEdit, onSubmit, submitting = false, submitError = null }) {
  const { sex, personal_family: pf, hormonal_health: hh, lifestyle, treatments, sample_consent: sc } = state;
  const h = lifestyle.habits;

  const usedProducts = PRODUCT_KEYS.filter((k) => treatments.products[k].used);
  const doneProcedures = PROCEDURE_KEYS.filter((k) => treatments.procedures[k].done);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Progress header — full bar, review stage */}
      <div className="progress-bar">
        <div className="progress-bar__label">Jaankari review karein — sabse ant mein</div>
        <div className="progress-bar__track">
          <div className="progress-bar__fill" style={{ width: '100%' }} />
        </div>
      </div>

      {/* Content */}
      <div className="screen-container" style={{ paddingBottom: 100 }}>
        <h2 className="screen-title">Aapki jaankari check karein</h2>
        <p className="screen-subtitle" style={{ marginTop: 6, marginBottom: 0 }}>
          Kuch galat lage to Edit dabayein, phir Submit karein
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>

          {/* Section A — Personal & Family */}
          <SectionCard
            letter="A"
            title="Personal & Family History"
            onEdit={() => onEdit('HairLossTimeline')}
          >
            <Row
              label="Umra jab baal jhade"
              value={pf.age_hair_loss_began != null ? `${pf.age_hair_loss_began} saal` : null}
            />
            <Row label="Kitne samay se" value={pf.duration} />
            <Row
              label="Family history"
              value={
                pf.family_history.length === 0
                  ? null
                  : pf.family_history.includes('No known family history')
                  ? 'Koi family history nahi'
                  : pf.family_history.join(' · ')
              }
            />
            <Row
              label="Pattern"
              value={pf.pattern.length > 0 ? pf.pattern.join(' · ') : null}
            />
          </SectionCard>

          {/* Section B — Hormonal & Health */}
          <SectionCard
            letter="B"
            title="Hormonal & Health"
            onEdit={() => onEdit('DiagnosedConditions')}
          >
            <Row
              label="Conditions"
              value={
                hh.diagnosed_conditions.length === 0
                  ? null
                  : hh.diagnosed_conditions.includes('None')
                  ? 'Koi diagnosed condition nahi'
                  : hh.diagnosed_conditions.join(' · ')
              }
            />
            {sex === 'Female' && (
              <Row label="Menstrual cycle" value={hh.menstrual_cycle} />
            )}
            {sex === 'Female' && (
              <Row label="Pregnancy" value={hh.pregnancy_related} />
            )}
            {hh.adult_acne_oily_skin === true && (
              <Row label="Adult acne / oily skin" value="Haan" />
            )}
            {hh.excess_body_facial_hair === true && (
              <Row label="Excess body/facial hair" value="Haan" />
            )}
          </SectionCard>

          {/* Section C — Lifestyle */}
          <SectionCard
            letter="C"
            title="Lifestyle & Environment"
            onEdit={() => onEdit('LifestyleEvents')}
          >
            <Row
              label="Pichle 6 mahine mein"
              value={
                lifestyle.past_6_months.length === 0
                  ? 'Jawab nahi diya'
                  : lifestyle.past_6_months.includes('None of these apply')
                  ? 'Koi khas event nahi'
                  : lifestyle.past_6_months.join(' · ')
              }
            />
            {h.smoking === true && (
              <Row
                label="Smoking"
                value={h.smoking_severity ? `Haan — ${h.smoking_severity}` : 'Haan'}
              />
            )}
            {h.alcohol === true && <Row label="Alcohol" value="Haan" />}
            {h.hard_water === true && <Row label="Hard water" value="Haan" />}
            <Row label="Baal dhona" value={h.hair_wash_frequency} />
            {h.heating_tools_styling_chemicals === true && (
              <Row label="Heat/chemical styling" value="Haan" />
            )}
            {h.salon_treatments === true && (
              <Row
                label="Salon treatments"
                value={
                  h.salon_treatment_detail && h.salon_treatment_detail.trim()
                    ? h.salon_treatment_detail.trim()
                    : 'Haan'
                }
              />
            )}
          </SectionCard>

          {/* Section D — Treatments */}
          <SectionCard
            letter="D"
            title="Hair Care & Treatments"
            onEdit={() => onEdit('ProductsSelector')}
          >
            {usedProducts.length === 0 ? (
              <div className="summary-item" style={{ color: 'var(--text-muted)' }}>
                Koi products use nahi kiye
              </div>
            ) : (
              usedProducts.map((name) => {
                const p = treatments.products[name];
                const details = [
                  p.duration,
                  p.helped === true ? 'fark pada' : p.helped === false ? 'fark nahi pada' : null,
                  p.side_effects === true ? 'side effects hue' : null,
                ].filter(Boolean).join(' · ');
                return (
                  <div key={name} className="summary-item">
                    <span className="summary-label">{name}: </span>
                    {details}
                  </div>
                );
              })
            )}

            {doneProcedures.length === 0 ? (
              <div className="summary-item" style={{ color: 'var(--text-muted)' }}>
                Koi procedure nahi karwaya
              </div>
            ) : (
              doneProcedures.map((name) => {
                const pr = treatments.procedures[name];
                const displayName =
                  name === 'Other' && pr.other_detail && pr.other_detail.trim()
                    ? pr.other_detail.trim()
                    : name;
                const details = [
                  pr.sessions ? `${pr.sessions} sessions` : null,
                  pr.helped === true ? 'fark pada' : pr.helped === false ? 'fark nahi pada' : null,
                ].filter(Boolean).join(' · ');
                return (
                  <div key={name} className="summary-item">
                    <span className="summary-label">{displayName}: </span>
                    {details}
                  </div>
                );
              })
            )}
          </SectionCard>

          {/* Section E — Sample & Consent */}
          <SectionCard
            letter="E"
            title="Sample & Consent"
            onEdit={() => onEdit('SideEffectsSampleConsent')}
          >
            <Row
              label="Treatment side effects"
              value={
                treatments.past_treatment_side_effects === true
                  ? `Haan${
                      treatments.describe && treatments.describe.trim()
                        ? ` — ${treatments.describe.trim()}`
                        : ''
                    }`
                  : treatments.past_treatment_side_effects === false
                  ? 'Nahi'
                  : null
              }
            />
            <Row label="Sample type" value={sc.sample_type} />
            <Row
              label="Consent"
              value={sc.consent === true ? 'Diya ✓' : sc.consent === false ? 'Nahi diya' : null}
            />
          </SectionCard>

        </div>
      </div>

      {/* Submit footer */}
      <div className="sticky-continue">
        <div className="sticky-continue__inner" style={{ flexDirection: 'column', gap: 8 }}>
          {submitError && (
            <p style={{ color: 'var(--error)', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>
              Submit fail hua — dobara try karein
            </p>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submit ho raha hai…' : 'Submit Karein →'}
          </button>
        </div>
      </div>
    </div>
  );
}
