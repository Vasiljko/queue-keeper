import { useState, useEffect } from "react";
import { Package, X, Loader2, ExternalLink, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, useLocation } from "react-router-dom";

// Generic placeholder when no image is available from Perplexity
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200&h=200&fit=crop';

interface TrackedItem {
  id: string;
  name: string | null;
  brand: string | null;
  image: string | null;
  lowest_price: number | null;
  store: string | null;
  url: string;
  store_url: string | null;
}

// Deal info from the demo negotiation
const DEAL_INFO = {
  productName: "MacBook Pro M4 14''",
  originalPrice: 1999,
  discountPercent: 10,
  expiresInMs: 60 * 60 * 1000, // 1 hour
};

const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return "00:00:00";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const TrackedItems = () => {
  const location = useLocation();
  const showNegotiatedDeal = location.state?.fromDemo === true;
  
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(DEAL_INFO.expiresInMs);

  const discountedPrice = Math.round(DEAL_INFO.originalPrice * (1 - DEAL_INFO.discountPercent / 100));

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

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
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

  const isExpired = timeRemaining <= 0;

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
              {showNegotiatedDeal ? 'Your Negotiated Deal' : 'Tracked Items'}
            </p>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {showNegotiatedDeal ? DEAL_INFO.productName : 'Price Tracker'}
            </h1>
          </div>
        </div>

        {/* Deal Card - Only shown if came from demo */}
        {showNegotiatedDeal && (
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="glass rounded-xl p-6 border border-green-500/30 shadow-[0_0_30px_hsl(142_76%_45%/0.15)]">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop"
                  alt={DEAL_INFO.productName}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{DEAL_INFO.productName}</p>
                  <p className="text-xs text-muted-foreground">Negotiated bulk discount</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Original price</span>
                  <span className="font-mono text-muted-foreground line-through">${DEAL_INFO.originalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Discount</span>
                  <span className="font-mono font-bold text-green-500">{DEAL_INFO.discountPercent}% OFF</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-foreground">Your price</span>
                  <span className="font-mono font-bold text-green-500 text-2xl">${discountedPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Timer */}
              <div className={`flex items-center justify-center gap-2 p-3 rounded-lg mb-4 ${
                isExpired 
                  ? 'bg-destructive/10 border border-destructive/30' 
                  : 'bg-primary/10 border border-primary/30'
              }`}>
                <Clock className={`w-5 h-5 ${isExpired ? 'text-destructive' : 'text-primary animate-pulse'}`} />
                <div className="text-center">
                  <p className={`font-mono font-bold text-lg ${isExpired ? 'text-destructive' : 'text-primary'}`}>
                    {formatTimeRemaining(timeRemaining)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isExpired ? 'Deal expired' : 'Time remaining to join'}
                  </p>
                </div>
              </div>

              {/* Join Queue Button */}
              {!isExpired ? (
                <Link to="/">
                  <Button className="w-full gap-2 gradient-primary text-primary-foreground shadow-glow-primary">
                    <Users className="w-4 h-4" />
                    Join Queue for This Deal
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              ) : (
                <Button disabled className="w-full">
                  Deal Expired
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Tracked Items */}
        {items.length > 0 && (
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: showNegotiatedDeal ? '0.2s' : '0.1s' }}>
            {showNegotiatedDeal && <p className="text-xs text-muted-foreground uppercase tracking-widest">Other tracked items</p>}
            {items.map((item) => (
              <div
                key={item.id}
                className="glass rounded-xl p-4 border border-border/50 flex items-center gap-4"
              >
                <img
                  src={item.image || PLACEHOLDER_IMAGE}
                  alt={item.name || 'Product'}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <a 
                    href={item.store_url || item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold text-foreground text-sm truncate block hover:text-primary transition-colors group"
                  >
                    {item.name || 'Unknown Product'}
                    <ExternalLink className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
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
            ))}
          </div>
        )}

        {/* Info text */}
        <p className="text-center text-xs text-muted-foreground animate-slide-up" style={{ animationDelay: '0.3s' }}>
          Prices update automatically every hour
        </p>
      </div>
    </div>
  );
};

export default TrackedItems;
