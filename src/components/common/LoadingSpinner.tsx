import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export const LoadingSpinner = ({
  size = "md",
  className,
  text,
}: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

// Full page loading state
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

// Inline loading for buttons/small areas
export const InlineLoader = ({ className }: { className?: string }) => (
  <LoadingSpinner size="sm" className={className} />
);
