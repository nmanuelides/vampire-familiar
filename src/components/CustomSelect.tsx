import { useState, useRef, useEffect } from "react";
import "./CustomSelect.scss";

interface CustomSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  descriptions?: Record<string, string>;
  translations?: Record<string, string>;
  isLocked?: boolean;
  showNewOption?: boolean;
  fullWidth?: boolean;
}

export default function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Seleccionar...",
  descriptions = {},
  translations = {},
  isLocked = false,
  showNewOption = true,
  fullWidth = false,
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

  const filteredOptions = options;

  if (isLocked) {
    return <span className="custom-select-locked">{translations[value] || value || "-"}</span>;
  }

  const displayValue = translations[value] || value;

  return (
    <div 
      className={`custom-select-container ${fullWidth ? "full-width" : ""} ${isOpen ? "is-open" : ""}`} 
      ref={containerRef}
      style={{ zIndex: isOpen ? 10000 : undefined }}
    >
      <div 
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!value ? "placeholder" : ""}>{displayValue || placeholder}</span>
        <span className="arrow">▼</span>
      </div>

      {isOpen && (
        <div className="custom-select-dropdown">
          <div className="custom-select-options-scroll">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div 
                  key={opt} 
                  className={`custom-select-option ${opt === value ? "selected" : ""}`}
                  onClick={() => handleSelect(opt)}
                  title={descriptions[opt] || ""}
                >
                  <span className="option-label">{translations[opt] || opt}</span>
                </div>
              ))
            ) : (
              <div className="custom-select-no-results">No se encontraron resultados</div>
            )}
          </div>
          {showNewOption && (
            <div 
              className="custom-select-option new-option"
              onClick={() => handleSelect("___NEW___")}
            >
              + Nuevo...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
