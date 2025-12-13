-- Enable realtime for tracked_items table
ALTER TABLE public.tracked_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracked_items;