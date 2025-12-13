import { useState, useEffect } from "react";
import { Users, ShoppingCart, Loader2, ExternalLink, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
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

const Index = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [animatedCount, setAnimatedCount] = useState(0);

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

  // Check if already sold out on load
  const isAlreadySoldOut = selectedItem ? selectedItem.current_count >= selectedItem.total_slots : false;

  // Animate counter when selected item changes (only if not sold out)
  useEffect(() => {
    if (!selectedItem) return;
    
    // If already sold out, show full count immediately
    if (selectedItem.current_count >= selectedItem.total_slots) {
      setAnimatedCount(selectedItem.current_count);
      return;
    }
    
    setAnimatedCount(0);
    const targetCount = selectedItem.current_count;
    const duration = 1200;
    const steps = 40;
    const increment = targetCount / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setAnimatedCount(targetCount);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [selectedItem]);

  const handleJoinQueue = async () => {
    if (!selectedItem) return;
    
    setIsLoading(true);
    
    // Increment count by 1
    const newCount = selectedItem.current_count + 1;
    await supabase
      .from('queue_items')
      .update({ current_count: newCount })
      .eq('id', selectedItem.id);

    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      setAnimatedCount(newCount);
      
      // Update selected item locally
      setSelectedItem({ ...selectedItem, current_count: newCount });
      
      toast({
        title: "You're in the queue!",
        description: `Position ${newCount} of ${selectedItem.total_slots}. We'll notify you when it's your turn.`,
      });
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
            {selectedItem.price && (
              <p className="text-2xl font-bold text-primary mb-2">
                ${selectedItem.price.toLocaleString()}
              </p>
            )}
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