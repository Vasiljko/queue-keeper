import { useState, useEffect } from "react";
import { Users, ShoppingCart, Loader2, ExternalLink, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface QueueItem {
  id: string;
  name: string;
  total_slots: number;
  current_count: number;
  image: string | null;
  price: number | null;
  store_url: string | null;
}

// Demo settings - match TrackedItems pricing
const ORIGINAL_PRICE = 1999;
const DISCOUNT_PERCENT = 10;

const Index = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [animatedCount, setAnimatedCount] = useState(53); // Start at 53 for demo

  // Fetch queue items
  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('queue_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching queue items:', error);
      } else if (data && data.length > 0) {
        setItems(data as QueueItem[]);
        setSelectedItem(data[0] as QueueItem);
      }
      setLoadingItems(false);
    };

    fetchItems();
  }, []);

  // For demo: always allow joining (ignore DB sold out state)
  const isAlreadySoldOut = false;

  // Initialize counter at 53 and simulate random growth (keeps running even after join)
  useEffect(() => {
    if (!selectedItem) return;
    
    // Start at 53 for demo
    setAnimatedCount(53);
    let currentCount = 53;
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextIncrement = () => {
      const randomDelay = Math.random() * 1500 + 500; // 0.5 to 2 seconds
      timeoutId = setTimeout(() => {
        if (currentCount < selectedItem.total_slots) {
          currentCount++;
          setAnimatedCount(currentCount);
          scheduleNextIncrement();
        }
      }, randomDelay);
    };

    scheduleNextIncrement();

    return () => clearTimeout(timeoutId);
  }, [selectedItem]);

  const handleJoinQueue = () => {
    if (!selectedItem) return;
    
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
  };

  const isMaxCapReached = selectedItem ? animatedCount >= selectedItem.total_slots : false;
  const hasJoinedAndFull = isSent && isMaxCapReached;

  if (loadingItems) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground">No queue items available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Item Selector */}
        {items.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 animate-slide-up">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setIsSent(false);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedItem.id === item.id
                    ? 'gradient-primary text-primary-foreground shadow-glow-primary'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}

        {/* Queue Counter */}
        <div className="text-center space-y-4 animate-slide-up">
          {selectedItem.image && (
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="w-24 h-24 rounded-2xl object-cover mx-auto shadow-lg"
            />
          )}
          {!selectedItem.image && (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-glow-primary mx-auto">
              <Users className="w-10 h-10 text-primary-foreground" />
            </div>
          )}
          
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {selectedItem.name}
            </h2>
            <div className="mb-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg text-muted-foreground line-through">
                  ${ORIGINAL_PRICE.toLocaleString()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-xs font-bold">
                  {DISCOUNT_PERCENT}% OFF
                </span>
              </div>
              <p className="text-2xl font-bold text-green-500">
                ${Math.round(ORIGINAL_PRICE * (1 - DISCOUNT_PERCENT / 100)).toLocaleString()}
              </p>
            </div>
            {selectedItem.store_url && (
              <a 
                href={selectedItem.store_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-3"
              >
                View on store <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
              Users in Queue
            </p>
            <h1 className="text-7xl font-bold font-mono text-foreground tracking-tight">
              {animatedCount.toLocaleString()}
            </h1>
            <p className="text-2xl font-semibold text-muted-foreground mt-2">
              out of {selectedItem.total_slots}
            </p>
          </div>

          <p className="text-muted-foreground">
            waiting to purchase this item
          </p>
        </div>

        {/* Buy Button / Status */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {hasJoinedAndFull ? (
            <div className="space-y-4 animate-scale-in">
              <div className="w-full py-6 flex flex-col items-center justify-center gap-3 rounded-xl bg-green-500/10 border border-green-500/30 shadow-[0_0_30px_hsl(142_76%_45%/0.2)]">
                <div className="relative">
                  <CheckCircle2 className="w-12 h-12 text-green-500 animate-scale-in" />
                  <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-green-500">Queue Complete!</p>
                  <p className="text-sm text-muted-foreground">Your purchase will be processed shortly</p>
                </div>
              </div>
              <div className="text-center text-xs text-muted-foreground animate-fade-in">
                <p>All {selectedItem.total_slots} buyers are ready. Bulk order submitted to retailer.</p>
              </div>
            </div>
          ) : isAlreadySoldOut ? (
            <div className="w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-secondary border border-border">
              <span className="font-semibold text-muted-foreground">Sorry, Sold Out</span>
            </div>
          ) : !isSent ? (
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
                  Reserve & Join Queue
                </>
              )}
            </Button>
          ) : (
            <div className="w-full h-14 flex items-center justify-center gap-2 rounded-xl glass border border-primary/30">
              <Clock className="w-5 h-5 text-primary animate-pulse" />
              <span className="font-semibold text-foreground">Waiting for queue to fill up...</span>
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