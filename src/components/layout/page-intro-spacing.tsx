import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageIntroSpacingProps = {
  children: ReactNode;
  className?: string;
};

export function PageIntroSpacing({ children, className }: PageIntroSpacingProps) {
  return <div className={cn("page-intro-spacing", className)}>{children}</div>;
}
