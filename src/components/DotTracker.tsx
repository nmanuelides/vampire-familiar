import "./DotTracker.scss";

interface DotTrackerProps {
  label: string;
  value: number;
  max?: number;
  onChange: (newValue: number) => void;
  readOnly?: boolean;
  tooltip?: { desc: string; levels: string[] };
}

export default function DotTracker({
  label,
  value,
  max = 5,
  onChange,
  readOnly = false,
  tooltip,
}: DotTrackerProps) {
  const handleClick = (index: number) => {
    if (readOnly) return;
    if (value === index + 1) {
      onChange(index); // reduce by 1
    } else {
      onChange(index + 1); // set to exact value
    }
  };

  const dots = [];
  for (let i = 0; i < max; i++) {
    dots.push(
      <span
        key={i}
        className={`dot ${i < value ? "filled" : "empty"} ${readOnly ? "read-only" : ""}`}
        onClick={() => handleClick(i)}
      />,
    );
  }

  return (
    <div className="dot-tracker d-flex justify-between items-center">
      <div className="dot-label-container">
        <span className="dot-label">{label}</span>
        {tooltip && (
          <div className="tooltip-box">
            <p className="tooltip-desc">{tooltip.desc}</p>
            <ul className="tooltip-levels">
              {tooltip.levels.map((lvl, idx) => (
                <li key={idx}>{lvl}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="dots-container d-flex gap-xs">{dots}</div>
    </div>
  );
}
