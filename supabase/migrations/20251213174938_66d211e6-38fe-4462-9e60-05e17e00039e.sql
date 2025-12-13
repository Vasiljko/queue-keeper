-- Add store_url column for the link to the lowest price
ALTER TABLE public.tracked_items ADD COLUMN store_url TEXT;