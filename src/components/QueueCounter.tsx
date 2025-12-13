import { useEffect, useState } from "react";
import { Users } from "lucide-react";

interface QueueCounterProps {
  count: number;
  maxVisible?: number;
  maxCap?: number;
  onCountChange?: (count: number) => void;
}

const QueueCounter = ({ count, maxVisible = 999, maxCap, onCountChange }: QueueCounterProps) => {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = count / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= count) {
        setDisplayCount(count);
        onCountChange?.(count);
        clearInterval(timer);
      } else {
        const newCount = Math.floor(current);
        setDisplayCount(newCount);
        onCountChange?.(newCount);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [count, onCountChange]);

  const displayValue = displayCount > maxVisible ? `${maxVisible}+` : displayCount.toLocaleString();

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass">
      <div className="relative">
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-glow-primary">
          <Users className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse-glow" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">In Queue</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-foreground animate-count-up">
            {displayValue}
          </span>
          {maxCap && (
            <span className="text-sm font-semibold text-muted-foreground">
              / {maxCap}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueCounter;
