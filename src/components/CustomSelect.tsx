import { useState, useRef, useEffect } from "react";
import "./CustomSelect.scss";

interface CustomSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  descriptions?: Record<string, string>;
  isLocked?: boolean;
}

export default function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Seleccionar...",
  descriptions = {},
  isLocked = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  if (isLocked) {
    return <span className="custom-select-locked">{value || "-"}</span>;
  }

  return (
    <div className="custom-select-container" ref={containerRef}>
      <div 
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!value ? "placeholder" : ""}>{value || placeholder}</span>
        <span className="arrow">▼</span>
      </div>

      {isOpen && (
        <div className="custom-select-dropdown">
          {options.map((opt) => (
            <div 
              key={opt} 
              className={`custom-select-option ${opt === value ? "selected" : ""}`}
              onClick={() => handleSelect(opt)}
              title={descriptions[opt] || ""}
            >
              <span className="option-label">{opt}</span>
            </div>
          ))}
          <div 
            className="custom-select-option new-option"
            onClick={() => handleSelect("___NEW___")}
          >
            + Nuevo...
          </div>
        </div>
      )}
    </div>
  );
}
