import { useState } from "react";
import { Wallet, Shield, ChevronRight, Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";

interface FundingSectionProps {
  requiredAmount: number;
  currentBalance: number;
  onAddFunds: (amount: number) => void;
  isSecured: boolean;
}

const FundingSection = ({ requiredAmount, currentBalance, onAddFunds, isSecured }: FundingSectionProps) => {
  const [selectedAmount, setSelectedAmount] = useState(requiredAmount);
  const presetAmounts = [25, 50, 100, 250];
  const needsMore = currentBalance < requiredAmount;
  const shortfall = requiredAmount - currentBalance;

  return (
    <div className="rounded-2xl gradient-card border border-border/50 p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Secure Your Spot</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">Protected</span>
        </div>
      </div>

      <div className="glass rounded-xl p-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">Current Balance</span>
          <span className="text-sm font-semibold font-mono text-foreground">${currentBalance.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Required to Secure</span>
          <span className={`text-sm font-semibold font-mono ${needsMore ? 'text-accent' : 'text-primary'}`}>
            ${requiredAmount.toFixed(2)}
          </span>
        </div>
        {needsMore && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-xs text-accent">Add to secure spot</span>
              <span className="text-sm font-bold font-mono text-accent">${shortfall.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {!isSecured && (
        <>
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Quick add</p>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedAmount === amount
                      ? 'gradient-primary text-primary-foreground shadow-glow-primary'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => setSelectedAmount(Math.max(10, selectedAmount - 10))}
              className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <Minus className="w-4 h-4 text-foreground" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold font-mono text-foreground">${selectedAmount}</span>
            </div>
            <button 
              onClick={() => setSelectedAmount(selectedAmount + 10)}
              className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <Plus className="w-4 h-4 text-foreground" />
            </button>
          </div>

          <Button 
            onClick={() => onAddFunds(selectedAmount)}
            className="w-full h-12 gradient-primary text-primary-foreground font-semibold rounded-xl shadow-glow-primary hover:opacity-90 transition-opacity group"
          >
            <span>Add ${selectedAmount} to Secure</span>
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </>
      )}

      {isSecured && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-primary shadow-glow-primary">
            <Shield className="w-5 h-5 text-primary-foreground" />
            <span className="font-semibold text-primary-foreground">Spot Secured!</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Your position is locked. We'll notify you when it's your turn.
          </p>
        </div>
      )}
    </div>
  );
};

export default FundingSection;
