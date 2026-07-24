import { cn } from "@/lib/utils";

type SectionWaveProps = {
  className?: string;
  fill?: "paper" | "mist" | "navy";
  flip?: boolean;
};

const fillMap = {
  paper: "var(--surface-raised)",
  mist: "var(--background)",
  navy: "var(--fi-navy-950)",
} as const;

export function SectionWave({ className, fill = "paper", flip = false }: SectionWaveProps) {
  return (
    <div
      className={cn("relative h-8 w-full min-w-0 overflow-hidden sm:h-10 lg:h-12", className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className={cn("block h-full w-full", flip && "rotate-180")}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,24 C240,8 480,40 720,24 C960,8 1200,40 1440,20 L1440,48 L0,48 Z"
          fill={fillMap[fill]}
        />
      </svg>
    </div>
  );
}
