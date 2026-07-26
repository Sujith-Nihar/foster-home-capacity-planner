"use client";

import { useCallback, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import type { ProviderCalculationDetail } from "@/lib/providers/outreach-factors";
import { cn } from "@/lib/utils";

type ProviderCalculationDisclosureProps = {
  details: ProviderCalculationDetail[];
};

function CalculationDetailItem({ detail }: { detail: ProviderCalculationDetail }) {
  return (
    <div className="provider-calculation-detail">
      <dl className="provider-calculation-detail__fields">
        <div className="provider-calculation-detail__field">
          <dt>Actual value</dt>
          <dd>{detail.actualValue}</dd>
        </div>
        <div className="provider-calculation-detail__field">
          <dt>Triggered rule</dt>
          <dd>{detail.triggeredRule}</dd>
        </div>
        <div className="provider-calculation-detail__field">
          <dt>What this means</dt>
          <dd>{detail.whatThisMeans}</dd>
        </div>
      </dl>
    </div>
  );
}

export function ProviderCalculationDisclosure({ details }: ProviderCalculationDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const handleToggle = useCallback(() => {
    setIsOpen((current) => !current);
    requestAnimationFrame(() => {
      toggleRef.current?.focus({ preventScroll: true });
    });
  }, []);

  if (details.length === 0) {
    return null;
  }

  return (
    <div className="provider-calculation-disclosure">
      <button
        ref={toggleRef}
        type="button"
        className="provider-calculation-disclosure__toggle"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleToggle}
      >
        <span>How this category was calculated</span>
        <ChevronDown
          className={cn(
            "provider-calculation-disclosure__chevron",
            isOpen && "provider-calculation-disclosure__chevron--expanded",
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        className="provider-calculation-disclosure__panel"
      >
        {isOpen ? (
          <div className="space-y-5">
            {details.map((detail) => (
              <CalculationDetailItem key={detail.triggeredRule} detail={detail} />
            ))}
            <Link
              href="/methodology#methodology-retention-rules"
              className="inline-flex text-sm font-medium text-brand-navy underline-offset-4 hover:underline"
            >
              Review retention methodology
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
