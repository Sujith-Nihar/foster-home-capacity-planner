import type { OutreachPriority } from "@/lib/types/domain";

export type OutreachPriorityBadgeLevel = "high" | "medium" | "low";

export function getOutreachPriorityBadgeLevel(priority: OutreachPriority): OutreachPriorityBadgeLevel {
  switch (priority) {
    case "High":
      return "high";
    case "Medium":
      return "medium";
    case "Low":
      return "low";
  }
}

export function formatOutreachPriorityBadgeLabel(priority: OutreachPriority): string {
  return `${priority} outreach`;
}

export function formatOutreachPriorityAccessibleLabel(priority: OutreachPriority): string {
  return `${priority} suggested outreach priority`;
}

export function formatOutreachPriorityMetricCountLabel(priority: OutreachPriority): string {
  return `${priority}-priority outreach providers`;
}

export function getOutreachPriorityBadgeTitle(priority: OutreachPriority): string {
  return `${priority} suggested outreach`;
}

export function getOutreachPriorityBadgeExplanation(priority: OutreachPriority): string {
  switch (priority) {
    case "High":
      return "Meets at least one High outreach rule based on placement inactivity, limited placement activity, or license timing.";
    case "Medium":
      return "Meets at least one Medium outreach rule and no High outreach rule.";
    case "Low":
      return "No High or Medium outreach rule applies.";
  }
}
