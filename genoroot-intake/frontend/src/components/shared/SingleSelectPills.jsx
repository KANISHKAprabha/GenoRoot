// Single-select vertical pill list.
// Used for duration, menstrual_cycle, pregnancy_related, hair_wash_frequency,
// smoking_severity, product duration, procedure sessions, sample_type, sex.
//
// Props:
//   options  string[]
//   value    string | null
//   onChange (string) => void
export default function SingleSelectPills({ options, value, onChange }) {
  return (
    <div className="pill-group">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`pill${value === option ? ' pill--selected' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
