-- Add price and store_url columns to queue_items
ALTER TABLE public.queue_items 
ADD COLUMN price NUMERIC,
ADD COLUMN store_url TEXT;

-- Update existing items with prices and store URLs
UPDATE public.queue_items SET 
  price = 299,
  store_url = 'https://www.nike.com',
  current_count = 0
WHERE name = 'Limited Edition Sneakers';

UPDATE public.queue_items SET 
  price = 699,
  store_url = 'https://www.playstation.com',
  current_count = 0
WHERE name = 'PlayStation 5 Pro';

UPDATE public.queue_items SET 
  price = 1199,
  store_url = 'https://www.apple.com',
  current_count = 0
WHERE name = 'iPhone 16 Pro Max';