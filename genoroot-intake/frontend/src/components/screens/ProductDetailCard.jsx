// Reusable detail card for one selected product (interaction 9b).
// Props: productName, data, dispatch, onNext, isLast
import SingleSelectPills from '../shared/SingleSelectPills';
import ToggleRow from '../shared/ToggleRow';

const DURATION_OPTIONS = ['<3mo', '3-6mo', '>6mo'];

export default function ProductDetailCard({ productName, data, dispatch, onNext, isLast }) {
  const canNext =
    data.duration !== null && data.helped !== null && data.side_effects !== null;

  function setField(field, val) {
    dispatch({
      type: 'SET_PRODUCT',
      payload: { name: productName, data: { ...data, [field]: val } },
    });
  }

  return (
    <div className="screen">
      <h2 className="screen-title">{productName}</h2>
      <p className="screen-subtitle">Thoda aur detail batayein</p>

      <div>
        <p style={{ fontWeight: 600, marginBottom: 12 }}>
          Kitne time se use kar rahe hain?
        </p>
        <SingleSelectPills
          options={DURATION_OPTIONS}
          value={data.duration}
          onChange={(val) => setField('duration', val)}
        />
      </div>

      <ToggleRow
        label="Kya isse baalon mein fark pada?"
        value={data.helped}
        onChange={(val) => setField('helped', val)}
      />

      <ToggleRow
        label="Kya koi side effect hua?"
        value={data.side_effects}
        onChange={(val) => setField('side_effects', val)}
      />

      <div className="sticky-continue">
        <div className="sticky-continue__inner">
          <button
            type="button"
            className="btn-primary"
            onClick={onNext}
            disabled={!canNext}
          >
            {isLast ? 'Aage Badho →' : 'Agla Product →'}
          </button>
        </div>
      </div>
    </div>
  );
}
