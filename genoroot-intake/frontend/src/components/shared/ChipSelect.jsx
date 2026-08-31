// Multi-select chip group with optional mutual-exclusion "none" option (Gap 3).
//
// Props:
//   options    string[]
//   value      string[]   — currently selected items
//   onChange   (string[]) => void
//   noneOption string|null — chip key that clears all others when selected,
//                           and is cleared when any other chip is selected.
//                           Pass null if no mutual exclusion needed.
export default function ChipSelect({ options, value, onChange, noneOption = null }) {
  function toggle(option) {
    if (option === noneOption) {
      // Deselect if already active; otherwise select it and clear everything else
      onChange(value.includes(noneOption) ? [] : [noneOption]);
    } else {
      // Selecting a real option always removes noneOption
      const without = value.filter((v) => v !== noneOption);
      onChange(
        without.includes(option)
          ? without.filter((v) => v !== option)
          : [...without, option]
      );
    }
  }

  return (
    <div className="chip-group">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={[
            'chip',
            value.includes(option) ? 'chip--selected' : '',
            option === noneOption ? 'chip--none-option' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => toggle(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
