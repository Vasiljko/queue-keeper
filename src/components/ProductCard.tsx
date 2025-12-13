import { ExternalLink, Star, TrendingUp } from "lucide-react";

interface ProductCardProps {
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  trending?: boolean;
}

const ProductCard = ({ 
  name, 
  brand, 
  price, 
  originalPrice, 
  image, 
  rating = 4.8,
  trending = true 
}: ProductCardProps) => {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="gradient-card rounded-2xl p-4 border border-border/50 animate-slide-up">
      <div className="flex gap-4">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
          />
          {trending && (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md gradient-accent flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-accent-foreground" />
              <span className="text-[10px] font-semibold text-accent-foreground">HOT</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{brand}</p>
          <h3 className="font-semibold text-foreground truncate mt-0.5">{name}</h3>
          
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            <span className="text-sm font-medium text-foreground">{rating}</span>
            <span className="text-xs text-muted-foreground">(2.4k)</span>
          </div>
          
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-bold text-foreground">${price}</span>
            {originalPrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
                <span className="text-xs font-medium text-primary">-{discount}%</span>
              </>
            )}
          </div>
        </div>
        
        <button className="self-start p-2 rounded-lg hover:bg-secondary transition-colors">
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
