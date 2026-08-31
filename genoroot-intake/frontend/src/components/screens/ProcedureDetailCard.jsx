// Reusable detail card for one selected procedure (interaction 10b).
// Gap 8: other_detail required only when procedureName === 'Other'.
// No side_effects column here — never infer field 14 from procedures (SKILL.md Gap 7).
import SingleSelectPills from '../shared/SingleSelectPills';
import ToggleRow from '../shared/ToggleRow';

const SESSION_OPTIONS = ['1-3', '4-6', '>6'];

export default function ProcedureDetailCard({ procedureName, data, dispatch, onNext, isLast }) {
  const isOther = procedureName === 'Other';

  const canNext =
    data.sessions !== null &&
    data.helped !== null &&
    (!isOther || (data.other_detail && data.other_detail.trim()));

  function setField(field, val) {
    dispatch({
      type: 'SET_PROCEDURE',
      payload: { name: procedureName, data: { ...data, [field]: val } },
    });
  }

  return (
    <div className="screen">
      <h2 className="screen-title">
        {isOther ? 'Doosra Treatment' : procedureName}
      </h2>
      <p className="screen-subtitle">Thoda aur detail batayein</p>

      {/* Gap 8: other_detail only when 'Other' and done=true */}
      {isOther && (
        <div>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>
            Kaun sa procedure tha?
          </p>
          <textarea
            className="text-input"
            placeholder="Procedure ka naam likhein..."
            value={data.other_detail ?? ''}
            autoFocus
            onChange={(e) => setField('other_detail', e.target.value)}
          />
        </div>
      )}

      <div>
        <p style={{ fontWeight: 600, marginBottom: 12 }}>
          Kitne sessions liye?
        </p>
        <SingleSelectPills
          options={SESSION_OPTIONS}
          value={data.sessions}
          onChange={(val) => setField('sessions', val)}
        />
      </div>

      <ToggleRow
        label="Kya isse baalon mein fark pada?"
        value={data.helped}
        onChange={(val) => setField('helped', val)}
      />

      <div className="sticky-continue">
        <div className="sticky-continue__inner">
          <button
            type="button"
            className="btn-primary"
            onClick={onNext}
            disabled={!canNext}
          >
            {isLast ? 'Aage Badho →' : 'Agla Procedure →'}
          </button>
        </div>
      </div>
    </div>
  );
}
