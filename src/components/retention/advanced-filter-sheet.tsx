"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  RETENTION_EXPIRATION_FILTERS,
  type RetentionSearchParams,
} from "@/lib/validation/search-params";

const EXPIRATION_LABELS: Record<(typeof RETENTION_EXPIRATION_FILTERS)[number], string> = {
  all: "Any expiration window",
  within_30: "Within 30 days",
  within_60: "Within 60 days",
  within_90: "Within 90 days",
  within_180: "Within 180 days",
};

type AdvancedFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expiration: RetentionSearchParams["expiration"];
  onExpirationChange: (value: RetentionSearchParams["expiration"]) => void;
  minInactivityDays: string;
  onMinInactivityDaysChange: (value: string) => void;
  minEngagementPercent: string;
  onMinEngagementPercentChange: (value: string) => void;
  maxEngagementPercent: string;
  onMaxEngagementPercentChange: (value: string) => void;
  minAge: string;
  onMinAgeChange: (value: string) => void;
  maxAge: string;
  onMaxAgeChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
};

export function AdvancedFilterSheet({
  open,
  onOpenChange,
  expiration,
  onExpirationChange,
  minInactivityDays,
  onMinInactivityDaysChange,
  minEngagementPercent,
  onMinEngagementPercentChange,
  maxEngagementPercent,
  onMaxEngagementPercentChange,
  minAge,
  onMinAgeChange,
  maxAge,
  onMaxAgeChange,
  onApply,
  onClear,
}: AdvancedFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[min(100%,24rem)] flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border-subtle px-5 py-4 text-left">
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>
            Refine by license timing, placement history, engagement, and age preferences.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-text-primary">License expiration window</span>
            <Select
              value={expiration}
              onValueChange={(value) =>
                onExpirationChange((value ?? "all") as RetentionSearchParams["expiration"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any expiration window" />
              </SelectTrigger>
              <SelectContent>
                {RETENTION_EXPIRATION_FILTERS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {EXPIRATION_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-text-primary">
              Minimum days since last placement
            </span>
            <Input
              type="number"
              min={0}
              step={1}
              value={minInactivityDays}
              onChange={(event) => onMinInactivityDaysChange(event.target.value)}
              placeholder="e.g. 90"
            />
          </label>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-text-primary">Engagement rate range</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 text-sm">
                <span className="text-xs text-text-secondary">Min (%)</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={minEngagementPercent}
                  onChange={(event) => onMinEngagementPercentChange(event.target.value)}
                  placeholder="0"
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-xs text-text-secondary">Max (%)</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={maxEngagementPercent}
                  onChange={(event) => onMaxEngagementPercentChange(event.target.value)}
                  placeholder="100"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-text-primary">
              Preferred child age range
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 text-sm">
                <span className="text-xs text-text-secondary">Min age</span>
                <Input
                  type="number"
                  min={0}
                  max={21}
                  step={1}
                  value={minAge}
                  onChange={(event) => onMinAgeChange(event.target.value)}
                  placeholder="0"
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-xs text-text-secondary">Max age</span>
                <Input
                  type="number"
                  min={0}
                  max={21}
                  step={1}
                  value={maxAge}
                  onChange={(event) => onMaxAgeChange(event.target.value)}
                  placeholder="21"
                />
              </label>
            </div>
          </fieldset>
        </div>

        <SheetFooter className="flex-row gap-2 border-t border-border-subtle px-5 py-4">
          <Button type="button" variant="outline" onClick={onClear}>
            Clear all
          </Button>
          <Button type="button" onClick={onApply} className="flex-1">
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
