"use client";

import { useCallback, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import type { MethodologyDefinition } from "@/lib/methodology/page-content";
import { cn } from "@/lib/utils";

type MethodologyDefinitionRowProps = {
  definition: MethodologyDefinition;
};

function MethodologyDefinitionRow({ definition }: MethodologyDefinitionRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const handleToggle = useCallback(() => {
    setIsOpen((current) => !current);
    requestAnimationFrame(() => {
      toggleRef.current?.focus({ preventScroll: true });
    });
  }, []);

  if (!definition.technicalDetail) {
    return (
      <div className="methodology-definition-row">
        <dt className="methodology-definition-row__term">{definition.term}</dt>
        <dd className="methodology-definition-row__definition">{definition.definition}</dd>
      </div>
    );
  }

  return (
    <div className="methodology-definition-row">
      <dt className="methodology-definition-row__term">{definition.term}</dt>
      <dd className="methodology-definition-row__definition">{definition.definition}</dd>
      <div className="methodology-definition-row__technical">
        <button
          ref={toggleRef}
          type="button"
          className="methodology-technical-toggle"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={handleToggle}
        >
          <span>Technical detail</span>
          <ChevronDown
            className={cn(
              "methodology-technical-toggle__chevron",
              isOpen && "methodology-technical-toggle__chevron--expanded",
            )}
            aria-hidden="true"
          />
        </button>
        <div id={panelId} hidden={!isOpen} className="methodology-technical-toggle__panel">
          {isOpen ? <p>{definition.technicalDetail}</p> : null}
        </div>
      </div>
    </div>
  );
}

type MethodologyCoreDefinitionsProps = {
  groups: Array<{
    title: string;
    definitions: MethodologyDefinition[];
  }>;
};

export function MethodologyCoreDefinitions({ groups }: MethodologyCoreDefinitionsProps) {
  return (
    <section
      id="methodology-definitions"
      aria-labelledby="methodology-definitions-heading"
      className="methodology-panel methodology-scroll-target"
    >
      <h2 id="methodology-definitions-heading" className="text-lg font-semibold text-text-primary">
        Core definitions
      </h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">
        Plain-language terms used across recruitment and retention views.{" "}
        <a href="#methodology-important-things" className="methodology-inline-link">
          See important things to know
        </a>{" "}
        for interpretation caveats.
      </p>

      <div className="mt-4 space-y-5">
        {groups.map((group) => (
          <div key={group.title} className="methodology-definition-group">
            <h3 className="methodology-definition-group__title">{group.title}</h3>
            <dl className="methodology-definition-group__list">
              {group.definitions.map((definition) => (
                <MethodologyDefinitionRow key={definition.term} definition={definition} />
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
