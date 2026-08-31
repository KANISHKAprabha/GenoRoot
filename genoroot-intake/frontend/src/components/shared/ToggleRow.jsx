export default function ToggleRow({ label, value, onChange, hint = null, disabled = false, naked = false }) {
  return (
    <div className={`toggle-row${naked ? ' toggle-row--naked' : ''}`}>
      {(label || hint) && (
        <div style={{ flex: 1 }}>
          {label && <div className="toggle-row__label">{label}</div>}
          {hint && <div className="toggle-row__hint">{hint}</div>}
        </div>
      )}
      <div className="toggle-pair">
        <button
          type="button"
          className={`toggle-btn toggle-btn--yes${value === true ? ' toggle-btn--active' : ''}`}
          onClick={() => !disabled && onChange(true)}
          disabled={disabled}
        >
          Haan
        </button>
        <button
          type="button"
          className={`toggle-btn toggle-btn--no${value === false ? ' toggle-btn--active' : ''}`}
          onClick={() => !disabled && onChange(false)}
          disabled={disabled}
        >
          Nahi
        </button>
      </div>
    </div>
  );
}
