import { useState } from "react";
import { Bell, Settings, RefreshCw } from "lucide-react";
import QueueCounter from "./QueueCounter";
import ProductCard from "./ProductCard";
import QueuePosition from "./QueuePosition";
import FundingSection from "./FundingSection";
import { toast } from "@/hooks/use-toast";

const QueueTracker = () => {
  const [balance, setBalance] = useState(35);
  const [isSecured, setIsSecured] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentQueueCount, setCurrentQueueCount] = useState(0);

  const requiredAmount = 50;
  const queueCount = 59;
  const maxCap = 60;
  const userPosition = 342;
  const isMaxCapReached = currentQueueCount >= maxCap;

  const handleAddFunds = (amount: number) => {
    setBalance((prev) => {
      const newBalance = prev + amount;
      if (newBalance >= requiredAmount && !isMaxCapReached) {
        setIsSecured(true);
        // Increment counter to trigger max cap
        setCurrentQueueCount(maxCap);
        toast({
          title: "Spot Secured! 🎉",
          description: "Your position in the queue is now locked.",
        });
      }
      return newBalance;
    });
  };

  const handleCountChange = (count: number) => {
    setCurrentQueueCount(count);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="w-full max-w-sm mx-auto min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Queue Tracker</h1>
          <p className="text-xs text-muted-foreground">Track your spot in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Queue Counter */}
      <div className="mb-4">
        <QueueCounter count={queueCount} onCountChange={handleCountChange} />
      </div>

      {/* Product Card */}
      <div className="mb-4">
        <ProductCard
          name="Limited Edition Sneakers"
          brand="HYPEBEAST"
          price={299}
          originalPrice={450}
          image="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop"
          rating={4.9}
          trending={true}
        />
      </div>

      {/* Queue Position */}
      <div className="mb-4">
        <QueuePosition
          position={userPosition}
          totalInQueue={queueCount}
          isSecured={isSecured}
          estimatedTime={isSecured ? "Ready soon" : "~5 min"}
        />
      </div>

      {/* Funding Section */}
      <FundingSection
        requiredAmount={requiredAmount}
        currentBalance={balance}
        onAddFunds={handleAddFunds}
        isSecured={isSecured}
        isMaxCapReached={isMaxCapReached}
      />

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Funds are refundable if you leave the queue
        </p>
      </div>
    </div>
  );
};

export default QueueTracker;
