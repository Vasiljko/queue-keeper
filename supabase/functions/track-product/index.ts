import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'Product URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Tracking product from URL:', url);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Step 1: Use AI to analyze the product URL and extract product info
    console.log('Analyzing product with AI...');
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a product research assistant. Given a product URL, analyze what product it is and search for the best current prices across major retailers. Return a JSON object with the product details and best price found.`
          },
          {
            role: 'user',
            content: `Analyze this product URL and find the best current price for this product across major online retailers (Amazon, Best Buy, Walmart, Target, etc.):

URL: ${url}

Based on the URL, determine:
1. The product name
2. The brand
3. A placeholder image URL (use a relevant unsplash image)
4. The lowest current price you can find
5. Which store has the lowest price

Return ONLY a valid JSON object in this exact format, no other text:
{
  "name": "Product Name",
  "brand": "Brand Name", 
  "image": "https://images.unsplash.com/photo-xxx?w=200&h=200&fit=crop",
  "lowest_price": 99.99,
  "store": "Store Name"
}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_product_info",
              description: "Extract product information and best price",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Product name" },
                  brand: { type: "string", description: "Brand name" },
                  image: { type: "string", description: "Product image URL (use unsplash)" },
                  lowest_price: { type: "number", description: "Lowest price found" },
                  store: { type: "string", description: "Store with lowest price" }
                },
                required: ["name", "brand", "image", "lowest_price", "store"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_product_info" } }
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('AI analysis failed:', analysisResponse.status, errorText);
      throw new Error('Failed to analyze product');
    }

    const analysisData = await analysisResponse.json();
    console.log('AI response:', JSON.stringify(analysisData, null, 2));

    // Extract the tool call result
    const toolCall = analysisData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('AI did not return product information');
    }

    const productInfo = JSON.parse(toolCall.function.arguments);
    console.log('Extracted product info:', productInfo);

    // Step 2: Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: savedItem, error: dbError } = await supabase
      .from('tracked_items')
      .insert({
        url,
        name: productInfo.name,
        brand: productInfo.brand,
        image: productInfo.image,
        lowest_price: productInfo.lowest_price,
        store: productInfo.store,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save tracked item');
    }

    console.log('Product tracked successfully:', savedItem.id);

    return new Response(
      JSON.stringify({ success: true, data: savedItem }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error tracking product:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
