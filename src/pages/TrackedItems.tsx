import { useState, useEffect } from "react";
import { Package, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TrackedItem {
  id: string;
  name: string | null;
  brand: string | null;
  image: string | null;
  lowest_price: number | null;
  store: string | null;
  url: string;
}

const TrackedItems = () => {
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('tracked_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Failed to load tracked items.",
        variant: "destructive",
      });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('tracked_items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tracked_items' },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUntrack = async (id: string, name: string | null) => {
    const { error } = await supabase
      .from('tracked_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to untrack item.",
        variant: "destructive",
      });
    } else {
      setItems(items.filter(item => item.id !== id));
      toast({
        title: "Item untracked",
        description: `${name || 'Item'} has been removed from your tracking list.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-glow-primary mx-auto">
            <Package className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
              Currently Tracking
            </p>
            <h1 className="text-7xl font-bold font-mono text-foreground tracking-tight">
              {items.length}
            </h1>
            <p className="text-muted-foreground mt-2">
              items in your watchlist
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {items.length === 0 ? (
            <div className="text-center py-12 glass rounded-xl border border-border/50">
              <p className="text-muted-foreground">No items being tracked</p>
              <p className="text-sm text-muted-foreground mt-2">
                Send a POST request to /functions/v1/track-product with a product URL
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="glass rounded-xl p-4 border border-border/50 flex items-center gap-4"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name || 'Product'}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {item.name || 'Unknown Product'}
                  </h3>
                  {item.store && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.store}
                    </p>
                  )}
                  {item.lowest_price && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-primary">
                        ${Number(item.lowest_price).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUntrack(item.id, item.name)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Info text */}
        <p className="text-center text-xs text-muted-foreground animate-slide-up" style={{ animationDelay: '0.25s' }}>
          Prices update automatically every hour
        </p>
      </div>
    </div>
  );
};

export default TrackedItems;
