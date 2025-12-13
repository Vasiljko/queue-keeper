import { useState } from "react";
import { Package, TrendingDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface TrackedItem {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  lowestPrice: number;
  store: string;
}

const initialItems: TrackedItem[] = [
  {
    id: "1",
    name: "Sony WH-1000XM5 Headphones",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&h=200&fit=crop",
    originalPrice: 399.99,
    lowestPrice: 279.99,
    store: "Amazon",
  },
  {
    id: "2",
    name: "MacBook Pro 14\" M3",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop",
    originalPrice: 1999.99,
    lowestPrice: 1749.99,
    store: "Best Buy",
  },
  {
    id: "3",
    name: "Nike Air Max 90",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
    originalPrice: 130.00,
    lowestPrice: 89.99,
    store: "Nike",
  },
];

const TrackedItems = () => {
  const [items, setItems] = useState<TrackedItem[]>(initialItems);

  const handleUntrack = (id: string, name: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Item untracked",
      description: `${name} has been removed from your tracking list.`,
    });
  };

  const calculateDiscount = (original: number, lowest: number) => {
    return Math.round(((original - lowest) / original) * 100);
  };

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
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="glass rounded-xl p-4 border border-border/50 flex items-center gap-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.store}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-primary">
                      ${item.lowestPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      ${item.originalPrice.toFixed(2)}
                    </span>
                    <span className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                      {calculateDiscount(item.originalPrice, item.lowestPrice)}%
                    </span>
                  </div>
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
