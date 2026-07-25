"use client";

import { useId, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { filterCountySuggestions } from "@/lib/filters/county-search";
import { cn } from "@/lib/utils";
import { formatCountyName } from "@/lib/utils/formatters";

import { OPERATIONAL_FILTER_CONTROL_CLASS } from "./operational-filter-panel";

type CountySearchInputProps = {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  counties: string[];
  placeholder?: string;
  onEnter?: () => void;
  className?: string;
};

export function CountySearchInput({
  label = "Search county",
  value,
  onValueChange,
  counties,
  placeholder = "Search by county name",
  onEnter,
  className,
}: CountySearchInputProps) {
  const inputId = useId();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = useMemo(
    () => filterCountySuggestions(counties, value),
    [counties, value],
  );

  const showSuggestions = isOpen && suggestions.length > 0;

  function selectSuggestion(county: string) {
    onValueChange(county);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "Enter") {
      if (showSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
        event.preventDefault();
        selectSuggestion(suggestions[activeIndex]!);
        return;
      }

      onEnter?.();
      return;
    }

    if (!showSuggestions) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        id={inputId}
        type="search"
        role="combobox"
        aria-expanded={showSuggestions}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          showSuggestions && activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          window.setTimeout(() => {
            setIsOpen(false);
            setActiveIndex(-1);
          }, 120);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={OPERATIONAL_FILTER_CONTROL_CLASS}
        aria-label={label}
      />

      {showSuggestions ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border-default bg-surface-raised py-1 shadow-sm"
        >
          {suggestions.map((county, index) => (
            <li
              key={county}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={cn(
                "cursor-pointer px-3 py-2 text-sm text-text-primary",
                index === activeIndex && "bg-surface-tint",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(county)}
            >
              {formatCountyName(county)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
