import { useState, useCallback, useEffect } from "react";
import { BargainHeader } from "@/components/bargain/BargainHeader";
import { AgentPanel } from "@/components/bargain/AgentPanel";
import { SuccessOverlay } from "@/components/bargain/SuccessOverlay";
import { negotiations } from "@/data/negotiations";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, RotateCcw, Users, Percent, Gauge } from "lucide-react";

interface DealResult {
  retailerName: string;
  discount: number;
}

const BargainDemo = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [completedAgents, setCompletedAgents] = useState<Set<number>>(new Set());
  const [successfulDeals, setSuccessfulDeals] = useState<DealResult[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hideFailedPanels, setHideFailedPanels] = useState(false);
  const [showDealsSummary, setShowDealsSummary] = useState(false);
  const [key, setKey] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(1);

  const handleAgentComplete = useCallback((agentId: number, success: boolean, discount?: number) => {
    setCompletedAgents(prev => {
      const next = new Set(prev);
      next.add(agentId);
      return next;
    });

    if (success && discount) {
      const retailer = negotiations.find(n => n.agentId === agentId);
      if (retailer) {
        setSuccessfulDeals(prev => {
          if (prev.some(d => d.retailerName === retailer.retailerName)) {
            return prev;
          }
          return [...prev, { retailerName: retailer.retailerName, discount }];
        });
      }
    }
  }, []);

  const startDemo = useCallback(() => {
    setKey(k => k + 1);
    setCompletedAgents(new Set());
    setSuccessfulDeals([]);
    setShowSuccess(false);
    setHideFailedPanels(false);
    setShowDealsSummary(false);
    setTimeout(() => setIsRunning(true), 50);
  }, []);

  const resetDemo = useCallback(() => {
    setIsRunning(false);
    setCompletedAgents(new Set());
    setSuccessfulDeals([]);
    setShowSuccess(false);
    setHideFailedPanels(false);
    setShowDealsSummary(false);
    setKey(k => k + 1);
  }, []);

  const handleRestartFromOverlay = useCallback(() => {
    resetDemo();
    setTimeout(() => startDemo(), 150);
  }, [resetDemo, startDemo]);

  const allDone = completedAgents.size === 4;

  const getSpeedMultiplier = () => typingSpeed;

  useEffect(() => {
    if (allDone && successfulDeals.length > 0 && !hideFailedPanels && isRunning) {
      const speed = getSpeedMultiplier();
      const timer = setTimeout(() => {
        setHideFailedPanels(true);
        setShowDealsSummary(true);
      }, 2000 / speed);

      return () => clearTimeout(timer);
    }
  }, [allDone, successfulDeals.length, hideFailedPanels, isRunning, typingSpeed]);

  useEffect(() => {
    if (hideFailedPanels && successfulDeals.length > 0 && !showSuccess && isRunning) {
      const speed = getSpeedMultiplier();
      const timer = setTimeout(() => {
        setShowSuccess(true);
      }, 3000 / speed);

      return () => clearTimeout(timer);
    }
  }, [hideFailedPanels, successfulDeals.length, showSuccess, isRunning, typingSpeed]);

  const bestDiscount = successfulDeals.length > 0
    ? Math.max(...successfulDeals.map(d => d.discount))
    : 0;

  const successfulNegotiations = negotiations.filter(n => n.willSucceed);
  const visibleNegotiations = hideFailedPanels ? successfulNegotiations : negotiations;

  const speedLabel = `${Math.round(typingSpeed * 100)}%`;

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <BargainHeader />

      {/* Stats Bar */}
      <div className="border-b border-border bg-card/50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-mono text-sm">
                <span className="text-muted-foreground">BUYERS:</span>{" "}
                <span className="text-foreground font-semibold">47</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-green-500" />
              <span className="font-mono text-sm">
                <span className="text-muted-foreground">TARGET:</span>{" "}
                <span className="text-green-500 font-semibold">5-10%</span>
              </span>
            </div>
            {showDealsSummary && successfulDeals.length > 0 && (
              <div className="font-mono text-sm animate-fade-in">
                <span className="text-muted-foreground">DEALS LOCKED:</span>{" "}
                <span className="text-green-500 font-semibold">{successfulDeals.length}</span>
                <span className="text-muted-foreground ml-2">BEST:</span>{" "}
                <span className="text-green-500 font-semibold">{bestDiscount}% OFF</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isRunning && (
              <div className="flex items-center gap-3">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono w-12">{speedLabel}</span>
                  <Slider
                    value={[typingSpeed]}
                    onValueChange={(v) => setTypingSpeed(v[0])}
                    min={0.25}
                    max={3}
                    step={0.05}
                    className="w-32"
                  />
                </div>
              </div>
            )}

            {!isRunning ? (
              <Button onClick={startDemo} className="gap-2">
                <Play className="w-4 h-4" />
                Launch Agents
              </Button>
            ) : (
              <Button onClick={resetDemo} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset Demo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <main className="flex-1 p-4 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <div className={`grid gap-3 h-full transition-all duration-500 ${
            hideFailedPanels
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
              : 'grid-cols-1 md:grid-cols-2'
          }`}>
            {visibleNegotiations.map((neg, idx) => (
              <AgentPanel
                key={`${key}-${neg.agentId}`}
                agentId={neg.agentId}
                retailerName={neg.retailerName}
                retailerEmail={neg.retailerEmail}
                product={neg.product}
                isRunning={isRunning}
                willSucceed={neg.willSucceed}
                finalDiscount={neg.finalDiscount}
                hardcodedRetailerResponse={neg.hardcodedRetailerResponse}
                startDelay={idx * 400}
                shouldHide={hideFailedPanels}
                typingSpeed={typingSpeed}
                onComplete={handleAgentComplete}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Success Overlay */}
      <SuccessOverlay
        isVisible={showSuccess}
        product="MacBook Pro M4 14 inch"
        discount={bestDiscount}
        deals={successfulDeals}
        originalPrice={1999}
        onRestart={handleRestartFromOverlay}
      />
    </div>
  );
};

export default BargainDemo;