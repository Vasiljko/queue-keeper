import { useState, useEffect } from "react";
import { Users, ShoppingCart, Loader2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QueueItem {
  id: string;
  name: string;
  total_slots: number;
  current_count: number;
  image: string | null;
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

  // Animate counter when selected item changes
  useEffect(() => {
    if (!selectedItem) return;
    
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
    
    // Update count in database
    const newCount = selectedItem.total_slots;
    await supabase
      .from('queue_items')
      .update({ current_count: newCount })
      .eq('id', selectedItem.id);

    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      setAnimatedCount(newCount);
      toast({
        title: "Packages Sent!",
        description: "Your order has been processed and packages are on their way.",
      });
    }, 1000);
  };

  const isMaxCapReached = selectedItem ? animatedCount >= selectedItem.total_slots : false;

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

        {/* Buy Button */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {!isSent ? (
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