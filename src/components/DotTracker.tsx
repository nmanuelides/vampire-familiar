import "./DotTracker.scss";

interface DotTrackerProps {
  label: string;
  value: number;
  max?: number;
  onChange: (newValue: number) => void;
  readOnly?: boolean;
  tooltip?: { desc: string; levels: string[] };
  mobileAlignRight?: boolean;
  desktopAlignRight?: boolean;
  isDiscipline?: boolean;
  flashing?: boolean;
}

export default function DotTracker({
  label,
  value,
  max = 5,
  onChange,
  readOnly = false,
  tooltip,
  mobileAlignRight = false,
  desktopAlignRight = false,
  isDiscipline = false,
  flashing = false,
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
    <div className={`dot-tracker ${flashing ? "flashing" : ""}`}>
      <div className="dot-label-column">
        <div className="tooltip-anchor">
          <span className="dot-label">{label}</span>
          {tooltip && (
            <div
              className={`tooltip-box ${
                mobileAlignRight ? "mobile-align-right" : ""
              } ${desktopAlignRight ? "desktop-align-right" : ""}`}
            >
              <p className="tooltip-desc">{tooltip.desc}</p>
              <ul className="tooltip-levels">
                {tooltip.levels
                  .filter((lvl) => {
                    if (!isDiscipline) return true;
                    // Only filter for disciplines if it's a level-specific line (e.g., "1: ...")
                    const levelMatch = lvl.match(/^(\d+):/);
                    if (levelMatch) {
                      const levelVal = parseInt(levelMatch[1], 10);
                      return levelVal <= value;
                    }
                    // Keep headers or general descriptive text
                    return true;
                  })
                  .map((lvl, idx) => {
                    // Determine if this level should be highlighted.
                    const isCurrent = lvl.startsWith(`${value}:`);

                    return (
                      <li key={idx} className={isCurrent ? "active-level" : ""}>
                        {isCurrent && <span className="active-marker">• </span>}
                        {lvl}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="dots-container">{dots}</div>
    </div>
  );
}
