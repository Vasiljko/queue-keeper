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
            content: `You are a product research assistant. Given a product URL, analyze what product it is and search for the best current prices across major retailers. Return a JSON object with the product details and best price found. Try to search for at least 5 different urls. ALWAYS make sure that the given URL with minimum price is valid and the product exists and is in stock. Try to search local retailers first. ALWAYS respond with ONLY a valid JSON object in this exact format, no other text:
{"name": "Product Name", "brand": "Brand Name", "lowest_price": 99.99, "store": "Store Name", "store_url": "https://store.com/product-page", "image_url": "https://direct-image-url.jpg"}`,
          },
          {
            role: "user",
            content: `Analyze this product URL and find the best current price for this product across major online retailers (Amazon, Best Buy, Walmart, Target, etc.):

URL: ${url}

Based on the URL, determine:
1. The product name
2. The brand
3. The lowest current price you can find
4. Which store has the lowest price
5. The direct URL to the product page at the store with the lowest price
6. A direct image URL for this product (find an official product image from the manufacturer or a major retailer - must be a direct .jpg, .png, or .webp URL)

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

    // Step 2: Use Perplexity to find a real product image
    console.log("Searching for product image with Perplexity...");
    const imageResponse = await fetch("https://api.perplexity.ai/chat/completions", {
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
            content: `You are an image URL finder. Given product information, search for and return ONLY a direct URL to a real product image. The URL must be a direct link to an image file (ending in .jpg, .png, .webp, or from a CDN). Do NOT return placeholder images or generic category images. Return ONLY the raw URL, no JSON, no quotes, no other text.`,
          },
          {
            role: "user",
            content: `Find a real product image URL for this product:
Product Name: ${productInfo.name}
Brand: ${productInfo.brand}
Store: ${productInfo.store}

Search for an official product photo from ${productInfo.brand}'s website, ${productInfo.store}, or major retailers like Amazon, Best Buy, or Walmart. Return ONLY the direct image URL, nothing else.`,
          },
        ],
      }),
    });

    let imageUrl = null;
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      const imageContent = imageData.choices?.[0]?.message?.content?.trim();
      console.log("Image search response:", imageContent);
      
      // Validate it looks like a URL
      if (imageContent && (imageContent.startsWith('http://') || imageContent.startsWith('https://'))) {
        imageUrl = imageContent;
      }
    } else {
      console.error("Image search failed:", await imageResponse.text());
    }

    console.log("Final image URL:", imageUrl);

    // Step 3: Save to database
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
        image: imageUrl,
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
