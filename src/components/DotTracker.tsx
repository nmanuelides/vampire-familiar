import { useEffect, useState } from "react";
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
  flashing?: string;
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
  flashing = "",
}: DotTrackerProps) {
  const [flashPhase, setFlashPhase] = useState(0);

  useEffect(() => {
    if (flashing) {
      setFlashPhase(1); // First pulse ON
      const t1 = setTimeout(() => setFlashPhase(2), 150); // OFF
      const t2 = setTimeout(() => setFlashPhase(3), 300); // Second pulse ON
      const t3 = setTimeout(() => setFlashPhase(0), 525); // OFF completely
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [flashing]);

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
    <div 
      className="dot-tracker"
      style={
        flashPhase === 1 || flashPhase === 3
          ? { backgroundColor: 'rgba(243, 32, 19, 0.4)', boxShadow: '0 0 8px #f32013', borderRadius: '8px', transition: 'all 0.1s ease-in' }
          : { backgroundColor: 'transparent', boxShadow: 'none', transition: 'all 0.15s ease-out' }
      }
    >
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
