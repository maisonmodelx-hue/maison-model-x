"use client";
import { useRef } from "react";

const HEADER_HEIGHT = 76;

type FilterBarProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (option: string) => void;
};

export default function FilterBar({ label, options, value, onChange }: FilterBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  function select(option: string) {
    onChange(option);
    // Bring the start of the new list into view, whichever way the visitor has scrolled.
    // The section is measured because a stuck bar reports its stuck position, not its real one.
    const section = barRef.current?.closest(".work-section");
    if (!section) return;
    const listTop = section.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
    const distance = Math.abs(listTop - window.scrollY);
    const isShortMove = distance < window.innerHeight * 1.5;
    const allowMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: listTop, behavior: isShortMove && allowMotion ? "smooth" : "auto" });
  }

  return (
    <div className="filter-dock">
      <div className="filter-bar" ref={barRef} role="group" aria-label={label}>
        {options.map((option) => (
          <button type="button" key={option} className={value === option ? "active" : ""} aria-pressed={value === option} onClick={() => select(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
