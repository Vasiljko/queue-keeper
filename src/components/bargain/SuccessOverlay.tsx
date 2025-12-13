import { useEffect, useState } from "react";
import { CheckCircle2, Package, Sparkles, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DealResult {
  retailerName: string;
  discount: number;
}

interface SuccessOverlayProps {
  isVisible: boolean;
  product: string;
  discount: number;
  deals: DealResult[];
  onRestart: () => void;
}

export function SuccessOverlay({ isVisible, product, discount, deals, onRestart }: SuccessOverlayProps) {
  const [showContent, setShowContent] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);

  const totalUnits = 47;
  const pricePerUnit = 1999;
  const savedPerUnit = Math.round(pricePerUnit * (discount / 100));
  const finalPricePerUnit = pricePerUnit - savedPerUnit;
  const totalSaved = savedPerUnit * totalUnits;

  useEffect(() => {
    if (isVisible) {
      const contentTimer = setTimeout(() => setShowContent(true), 300);
      const buttonTimer = setTimeout(() => setShowRestartButton(true), 3300);
      return () => {
        clearTimeout(contentTimer);
        clearTimeout(buttonTimer);
      };
    } else {
      setShowContent(false);
      setShowRestartButton(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl animate-fade-in">
      <div className={`text-center max-w-2xl mx-auto px-8 ${showContent ? 'animate-scale-in' : 'opacity-0'}`}>
        {/* Success Icon */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center shadow-[0_0_30px_hsl(142_76%_45%/0.4)]">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <Sparkles className="absolute top-0 right-1/3 w-5 h-5 text-green-500 animate-pulse" />
          <Sparkles className="absolute bottom-2 left-1/3 w-3 h-3 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Main Message */}
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">Order Confirmed</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-6">
          Bulk purchase successfully negotiated
        </p>

        {/* Order Summary Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-green-500/30 rounded-lg shadow-[0_0_30px_hsl(142_76%_45%/0.4)] p-6 mb-6 inline-block text-left">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <Package className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">{product}</h2>
              <p className="text-sm text-muted-foreground">Best deal: {deals.find(d => d.discount === discount)?.retailerName}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Units ordered</span>
              <span className="font-mono font-bold text-foreground">{totalUnits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Price per unit</span>
              <span className="font-mono font-bold text-foreground">${finalPricePerUnit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Discount secured</span>
              <span className="font-mono font-bold text-green-500">{discount}% OFF</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-muted-foreground">Total saved</span>
              <span className="font-mono font-bold text-green-500 text-lg">${totalSaved.toLocaleString()}</span>
            </div>
          </div>

          {/* Informing Buyers Status */}
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
            <Send className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Informing {totalUnits} buyers of successful negotiation...</span>
          </div>
        </div>

        {/* Restart Button */}
        {showRestartButton && (
          <div className="animate-fade-in mb-4">
            <Button onClick={onRestart} size="lg" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Run Demo Again
            </Button>
          </div>
        )}

        {/* Tagline */}
        <p className="text-xs text-muted-foreground font-mono">
          POWERED BY <span className="text-primary">CASCADA</span>
        </p>
      </div>
    </div>
  );
}