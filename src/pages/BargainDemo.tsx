import { useState, useCallback, useEffect } from "react";
import { AgentPanel } from "@/components/bargain/AgentPanel";
import { SuccessOverlay } from "@/components/bargain/SuccessOverlay";
import { negotiations } from "@/data/negotiations";

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

  const handleScreenClick = useCallback(() => {
    if (!isRunning) {
      startDemo();
    }
  }, [isRunning, startDemo]);

  return (
    <div 
      className="h-screen overflow-hidden bg-background flex flex-col cursor-pointer"
      onClick={handleScreenClick}
    >

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