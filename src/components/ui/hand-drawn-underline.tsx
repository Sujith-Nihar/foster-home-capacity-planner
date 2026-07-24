import { cn } from "@/lib/utils";

type HandDrawnUnderlineProps = {
  className?: string;
};

export function HandDrawnUnderline({ className }: HandDrawnUnderlineProps) {
  return (
    <svg
      className={cn("hand-drawn-underline pointer-events-none absolute -bottom-1 left-0 w-full", className)}
      viewBox="0 0 200 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M2 5.5C28 2.5 52 7 78 5C104 3 128 6.5 154 4.5C170 3.5 186 5 198 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-brand-blue"
      />
    </svg>
  );
}
