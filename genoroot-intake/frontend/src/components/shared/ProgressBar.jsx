// Props:
//   section        number | null  — 1-based section number; null hides bar (meta screen)
//   totalSections  number         — always 5
//   sectionName    string | null
export default function ProgressBar({ section, totalSections = 5, sectionName }) {
  if (!section) return null;

  const pct = Math.round((section / totalSections) * 100);

  return (
    <div className="progress-bar">
      <div className="progress-bar__label">
        Section {section} of {totalSections}
        {sectionName ? ` — ${sectionName}` : ''}
      </div>
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
