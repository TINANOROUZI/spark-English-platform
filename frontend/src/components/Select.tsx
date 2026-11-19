import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export interface SelectOption { value: string; label: string }

interface Props {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

/** Themed, keyboard-accessible dropdown (the native <select> popup can't be styled). */
export default function Select({ label, value, options, onChange, disabled, error }: Props) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const [active, setActive] = useState(selectedIndex);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openMenu = () => { setActive(selectedIndex); setOpen(true); };
  const choose = (i: number) => { onChange(options[i].value); setOpen(false); };

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    const last = options.length - 1;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); open ? setActive((a) => Math.min(last, a + 1)) : openMenu(); break;
      case "ArrowUp": e.preventDefault(); open ? setActive((a) => Math.max(0, a - 1)) : openMenu(); break;
      case "Home": if (open) { e.preventDefault(); setActive(0); } break;
      case "End": if (open) { e.preventDefault(); setActive(last); } break;
      case "Enter":
      case " ": e.preventDefault(); open ? choose(active) : openMenu(); break;
      case "Escape": if (open) { e.preventDefault(); e.stopPropagation(); setOpen(false); } break;
      case "Tab": setOpen(false); break;
      default: {
        // type-ahead: jump to the next option starting with the typed letter
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const k = e.key.toLowerCase();
          const from = open ? active + 1 : selectedIndex + 1;
          const idx = [...options.slice(from), ...options.slice(0, from)].findIndex((o) => o.label.toLowerCase().startsWith(k));
          if (idx >= 0) { const real = (from + idx) % options.length; open ? setActive(real) : onChange(options[real].value); }
        }
      }
    }
  }

  return (
    <div className="field select" ref={root}>
      <span id={`${id}-label`}>{label}</span>
      <button
        type="button" className={`select-btn ${open ? "open" : ""}`} role="combobox" disabled={disabled}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`} aria-labelledby={`${id}-label ${id}-value`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())} onKeyDown={onKeyDown}
      >
        <span id={`${id}-value`} className="select-value">{selected?.label}</span>
        <svg className="select-caret" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <ul id={`${id}-list`} className="select-menu" role="listbox" aria-labelledby={`${id}-label`} ref={listRef}>
          {options.map((o, i) => (
            <li
              key={o.value} id={`${id}-opt-${i}`} role="option" aria-selected={o.value === value}
              className={`select-opt ${i === active ? "active" : ""} ${o.value === value ? "selected" : ""}`}
              onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(i)}
            >
              <span>{o.label}</span>
              {o.value === value && <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </li>
          ))}
        </ul>
      )}
      {error && <small className="field-error" role="alert">{error}</small>}
    </div>
  );
}
