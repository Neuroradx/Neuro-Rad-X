
import { BrainCircuit } from 'lucide-react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 28, showText = true, className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <BrainCircuit color="hsl(var(--primary))" size={size} />
      {showText && <span className="text-xl font-bold text-foreground">NeuroRadX</span>}
    </div>
  );
}
