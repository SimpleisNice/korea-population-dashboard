import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function MobileShell({ children, className }: Props) {
  return (
    <div
      className={cn("min-h-screen pb-[72px]", className)}
      style={{
        maxWidth: "var(--max-w)",
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}
