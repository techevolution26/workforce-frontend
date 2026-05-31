import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: Props) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}