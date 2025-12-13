import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ success: false, error: "Product URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Tracking product from URL:", url);

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    // Step 1: Use Perplexity API to analyze the product URL and find best prices
    console.log("Analyzing product with Perplexity...");
    const analysisResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: `You are a product research assistant. Given a product URL, analyze what product it is and search for the best current prices across major retailers. Return a JSON object with the product details and best price found. Try to search for at least 5 different urls. ALWAYS make sure that the given URL with minimum price is valid and the product exists and is in stock. Try to search local retailers first. 

For the image_url field: You MUST find a REAL image URL from your search results. Look at the actual product pages you find and extract the image URL from there. Do NOT make up or guess image URLs. If you cannot find a real image URL, use null.

ALWAYS respond with ONLY a valid JSON object in this exact format, no other text:
{"name": "Product Name", "brand": "Brand Name", "lowest_price": 99.99, "store": "Store Name", "store_url": "https://store.com/product-page", "image_url": "https://real-image-from-search.jpg"}`,
          },
          {
            role: "user",
            content: `Analyze this product URL and find the best current price for this product across major online retailers (Amazon, Best Buy, Walmart, Target, etc.):

URL: ${url}

Based on the URL and your search results, determine:
1. The product name
2. The brand
3. The lowest current price you can find
4. Which store has the lowest price
5. The direct URL to the product page at the store with the lowest price
6. A REAL image URL that you found in your search results (from Amazon, Best Buy, the manufacturer site, etc.) - do NOT make up URLs

Respond with ONLY the JSON object, no other text.`,
          },
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error("Perplexity API failed:", analysisResponse.status, errorText);
      throw new Error("Failed to analyze product");
    }

    const analysisData = await analysisResponse.json();
    console.log("Perplexity response:", JSON.stringify(analysisData, null, 2));

    // Extract the response content
    const responseContent = analysisData.choices?.[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Perplexity did not return product information");
    }

    // Parse the JSON from the response
    let productInfo;
    try {
      productInfo = JSON.parse(responseContent);
    } catch (e) {
      console.error("Failed to parse product info JSON:", responseContent);
      throw new Error("Failed to parse product information");
    }
    console.log("Extracted product info:", productInfo);

    // Step 2: Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: savedItem, error: dbError } = await supabase
      .from("tracked_items")
      .insert({
        url,
        name: productInfo.name,
        brand: productInfo.brand,
        lowest_price: productInfo.lowest_price,
        store: productInfo.store,
        store_url: productInfo.store_url,
        image: productInfo.image_url || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save tracked item");
    }

    console.log("Product tracked successfully:", savedItem.id);

    return new Response(JSON.stringify({ success: true, data: savedItem }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error tracking product:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
