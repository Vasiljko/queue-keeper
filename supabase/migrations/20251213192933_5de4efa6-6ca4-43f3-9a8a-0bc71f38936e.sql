-- Create a table for queue items
CREATE TABLE public.queue_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  total_slots INTEGER NOT NULL DEFAULT 60,
  current_count INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.queue_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view queue items
CREATE POLICY "Anyone can view queue items"
ON public.queue_items
FOR SELECT
USING (true);

-- Allow anyone to insert queue items (via API)
CREATE POLICY "Anyone can insert queue items"
ON public.queue_items
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update queue items (for incrementing count)
CREATE POLICY "Anyone can update queue items"
ON public.queue_items
FOR UPDATE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_queue_items_updated_at
BEFORE UPDATE ON public.queue_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial hardcoded items
INSERT INTO public.queue_items (name, total_slots, current_count, image) VALUES
('Limited Edition Sneakers', 60, 59, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop'),
('PlayStation 5 Pro', 100, 87, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200&h=200&fit=crop'),
('iPhone 16 Pro Max', 50, 48, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop');