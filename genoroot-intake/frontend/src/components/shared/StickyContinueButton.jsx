export default function StickyContinueButton({
  onContinue,
  onBack = null,
  disabled = false,
  label = 'Aage Badho →',
}) {
  return (
    <div className="sticky-continue">
      <div className="sticky-continue__inner">
        {onBack && (
          <button type="button" className="btn-back" onClick={onBack}>
            ← Peeche
          </button>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={onContinue}
          disabled={disabled}
        >
          {label}
        </button>
      </div>
    </div>
  );
}
