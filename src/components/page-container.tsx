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
        "w-full mx-auto px-6 py-8 md:px-10 md:py-12 animate-in fade-in slide-in-from-bottom-2 duration-500 relative",
        className
      )}
      style={{ maxWidth }}
    >
      {/* Assinatura Inferior (Sempre no final do container de cada página) */}
      <div className="mt-20 pb-10 flex flex-col items-center space-y-4">
         <div className="flex items-center gap-6 w-full max-w-2xl">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-primary shadow-[0_0_10px_var(--primary)]" />
            <span className="text-2xl md:text-4xl font-black tracking-[0.4em] text-foreground italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">SEM LIMITES</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/50 to-primary shadow-[0_0_10px_var(--primary)]" />
         </div>
         <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-muted-foreground/40">
            AUTOMAÇÃO • PRODUTIVIDADE • RESULTADOS
         </p>
      </div>
      {children}
    </div>
  );
}

export function PageHeader({ 
  group,
  title, 
  subtitle, 
  breadcrumb,
  actions 
}: { 
  group?: string;
  title: string; 
  subtitle?: string; 
  breadcrumb?: string;
  actions?: ReactNode 
}) {
  return (
    <div className="flex flex-col gap-6 mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          {group && (
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 mb-2">
               {group}
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground leading-none">{title}</h1>
          {subtitle && <p className="text-sm md:text-base text-muted-foreground/60 max-w-2xl pt-2">{subtitle}</p>}
          
          {breadcrumb && (
            <div className="flex items-center gap-2 pt-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
               <span>Painel</span>
               <span>/</span>
               <span className="text-primary/40">{breadcrumb}</span>
            </div>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
      </div>
      <div className="h-px w-full bg-gradient-to-r from-border/40 via-border/10 to-transparent" />
    </div>
  );
}
