import { useEffect, useState } from "react";
import { CheckCircle2, Package, Sparkles, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DealResult {
  retailerName: string;
  discount: number;
}

interface SuccessOverlayProps {
  isVisible: boolean;
  product: string;
  discount: number;
  deals: DealResult[];
  originalPrice: number;
  onRestart: () => void;
}

export function SuccessOverlay({ isVisible, product, discount, deals, originalPrice, onRestart }: SuccessOverlayProps) {
  const [showContent, setShowContent] = useState(false);
  const [showJoinButton, setShowJoinButton] = useState(false);

  const discountedPrice = Math.round(originalPrice * (1 - discount / 100));
  const savedAmount = originalPrice - discountedPrice;

  useEffect(() => {
    if (isVisible) {
      const contentTimer = setTimeout(() => setShowContent(true), 300);
      const buttonTimer = setTimeout(() => setShowJoinButton(true), 2000);
      return () => {
        clearTimeout(contentTimer);
        clearTimeout(buttonTimer);
      };
    } else {
      setShowContent(false);
      setShowJoinButton(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const bestDeal = deals.find(d => d.discount === discount);

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
          <span className="bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">Bulk Deal Secured!</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-6">
          We negotiated a group discount for you
        </p>

        {/* Deal Summary Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-green-500/30 rounded-lg shadow-[0_0_30px_hsl(142_76%_45%/0.4)] p-6 mb-6 inline-block text-left min-w-[320px]">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <Package className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">{product}</h2>
              {bestDeal && (
                <p className="text-sm text-muted-foreground">From: {bestDeal.retailerName}</p>
              )}
            </div>
          </div>

          {/* Pricing Details */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Original price</span>
              <span className="font-mono text-muted-foreground line-through">${originalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-mono font-bold text-green-500">{discount}% OFF</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="font-semibold text-foreground">Discounted price</span>
              <span className="font-mono font-bold text-green-500 text-xl">${discountedPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">You save</span>
              <span className="font-mono text-green-500">${savedAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* View Deal Button */}
        {showJoinButton && (
          <div className="animate-fade-in space-y-4">
            <Link to="/tracked" state={{ fromDemo: true }}>
              <Button size="lg" className="gap-2 w-full max-w-xs">
                <Package className="w-4 h-4" />
                View Your Deal
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Your discounted price is locked for 1 hour
            </p>
          </div>
        )}

        {/* Tagline */}
        <p className="text-xs text-muted-foreground font-mono mt-6">
          POWERED BY <span className="text-primary">CASCADA</span>
        </p>
      </div>
    </div>
  );
}