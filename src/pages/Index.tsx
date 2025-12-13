import { useState, useEffect } from "react";
import { Users, ShoppingCart, CheckCircle2, Loader2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [queueCount, setQueueCount] = useState(0);
  const [isInQueue, setIsInQueue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const targetCount = 59;
  const maxCap = 60;

  // Animate counter on load
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = targetCount / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setQueueCount(targetCount);
        clearInterval(timer);
      } else {
        setQueueCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const handleJoinQueue = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsInQueue(true);
      setQueueCount(maxCap);
      toast({
        title: "Packages Sent!",
        description: "Your order has been processed and packages are on their way.",
      });
    }, 1000);
  };

  const isMaxCapReached = queueCount >= maxCap;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Queue Counter */}
        <div className="text-center space-y-4 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-glow-primary mx-auto">
            <Users className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
              Users in Queue
            </p>
            <h1 className="text-7xl font-bold font-mono text-foreground tracking-tight">
              {queueCount.toLocaleString()}
            </h1>
            <p className="text-2xl font-semibold text-muted-foreground mt-2">
              out of {maxCap}
            </p>
          </div>

          <p className="text-muted-foreground">
            waiting to purchase this item
          </p>
        </div>

        {/* Buy Button */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {!isInQueue ? (
            <Button
              onClick={handleJoinQueue}
              disabled={isMaxCapReached || isLoading}
              className={`w-full h-14 text-lg font-semibold rounded-xl transition-all ${
                isMaxCapReached
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                  : isLoading
                  ? 'gradient-primary text-primary-foreground opacity-80'
                  : 'gradient-primary text-primary-foreground shadow-glow-primary hover:opacity-90'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isMaxCapReached ? 'Packages Sent to Users' : 'Reserve & Join Queue'}
                </>
              )}
            </Button>
          ) : (
            <div className="w-full h-14 flex items-center justify-center gap-2 rounded-xl glass border border-primary/30">
              <PackageCheck className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Packages Sent!</span>
            </div>
          )}
        </div>

        {/* Info text */}
        <p className="text-center text-xs text-muted-foreground animate-slide-up" style={{ animationDelay: '0.25s' }}>
          Funds will be reserved until checkout or cancellation
        </p>
      </div>
    </div>
  );
};

export default Index;
