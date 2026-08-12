import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}

export function PageContainer({ children, className, maxWidth = "1400px" }: PageContainerProps) {
  return (
    <div 
      className={cn(
        "w-full mx-auto px-4 md:px-8 py-4 md:py-6 animate-in fade-in slide-in-from-bottom-2 duration-500",
        className
      )}
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
}

export function PageHeader({ 
  title, 
  subtitle, 
  actions 
}: { 
  title: string; 
  subtitle?: string; 
  actions?: ReactNode 
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
