-- Create tracked_items table to store products being tracked
CREATE TABLE public.tracked_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  name TEXT,
  brand TEXT,
  image TEXT,
  lowest_price NUMERIC,
  store TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for MVP - no auth)
ALTER TABLE public.tracked_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view tracked items" 
ON public.tracked_items 
FOR SELECT 
USING (true);

-- Allow public insert access
CREATE POLICY "Anyone can add tracked items" 
ON public.tracked_items 
FOR INSERT 
WITH CHECK (true);

-- Allow public delete access
CREATE POLICY "Anyone can remove tracked items" 
ON public.tracked_items 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tracked_items_updated_at
BEFORE UPDATE ON public.tracked_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();