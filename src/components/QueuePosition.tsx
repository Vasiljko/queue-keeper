import { CheckCircle2, Clock, Zap } from "lucide-react";

interface QueuePositionProps {
  position: number;
  totalInQueue: number;
  isSecured: boolean;
  estimatedTime?: string;
}

const QueuePosition = ({ position, totalInQueue, isSecured, estimatedTime = "~2 min" }: QueuePositionProps) => {
  const progressPercentage = Math.max(5, Math.min(95, ((totalInQueue - position + 1) / totalInQueue) * 100));

  return (
    <div className="rounded-2xl gradient-card border border-border/50 p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isSecured ? (
            <CheckCircle2 className="w-5 h-5 text-primary" />
          ) : (
            <Clock className="w-5 h-5 text-accent animate-pulse" />
          )}
          <span className="text-sm font-medium text-foreground">
            {isSecured ? "Spot Secured" : "Waiting in Queue"}
          </span>
        </div>
        {isSecured && (
          <div className="px-2 py-1 rounded-full gradient-primary">
            <span className="text-xs font-semibold text-primary-foreground">LOCKED</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Position</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-bold font-mono text-foreground">#{position}</span>
            <span className="text-sm text-muted-foreground">of {totalInQueue}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Est. Wait</p>
          <div className="flex items-center gap-1 mt-1">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-lg font-semibold text-foreground">{estimatedTime}</span>
          </div>
        </div>
      </div>

      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 gradient-primary rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
        <div 
          className="absolute inset-y-0 left-0 gradient-primary rounded-full opacity-50 blur-sm"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {Math.round(progressPercentage)}% ahead of queue
      </p>
    </div>
  );
};

export default QueuePosition;
