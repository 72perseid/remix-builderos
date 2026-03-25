// Triggering new deployment - Dec 10, 2025
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface XanoUser {
  id: number;
  created_at: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  onboarded: boolean;
  profile_image: string;
  stripe_customer_id: string;
  location: string;
  bio: string;
  linkedIn_profile: string;
  twitter_profile: string;
  discord_user_id: string;
  discord_channel_id: string;
  discord_username: string;
  visibilty: boolean;
  timezone: string;
  country: string;
  last_seen: number;
  enrollment_of_user?: {
    id: number;
    activations_id: number;
    created_at: number;
    user_id: number;
    email: string;
    products_id: number;
    enrollment_term_days: number;
    status: string;
    entity_id: number;
    entity_type: number;
    enrollment_method: string;
  };
  app_idea_of_user?: {
    id: number;
    created_at: number;
    user_id: number;
    app_name: string;
    app_category: string;
    app_for: string;
    app_description: string;
    idea_generation: string;
    figma_link: string;
    updated_at: number;
    app_type: string;
    persona_description: string;
    user_demography: string;
    kanban_board_id: number;
    invited_users_id: number[];
    currently_building: boolean;
    one_liner: string;
    logo_text: string;
    isBoardActive: boolean;
    isArtifactActive: boolean;
    logo: string | null;
  };
  products?: {
    id: number;
    created_at: number;
    product_name: string;
    notion_reference: string;
    monthly_price: number;
    yearly_price: number;
    stripe_product_id: string;
    lab_room: boolean;
    category: string;
    events: boolean;
    logo_ai: boolean;
    course_id: number[];
    programs_id: number;
    build_features: string[];
    connect_features: string[];
    event_types: string[];
    price_list: string[];
    annual_stripe_price_id: string;
    monthly_stripe_price_id: string;
    one_off_stripe_price_id: string;
    duration_days: number;
    email_template: string;
    periodicity: string;
    perks: string[];
    internal_details: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("JWT verification failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authenticatedUserId = claimsData.claims.sub;
    const authenticatedEmail = claimsData.claims.email as string | undefined;
    console.log(`Authenticated user: ${authenticatedUserId}`);

    // Read email from request body (POST) or URL params (GET fallback)
    let email: string | null = null;
    
    if (req.method === "POST") {
      const body = await req.json();
      email = body.email;
    } else {
      const url = new URL(req.url);
      email = url.searchParams.get("email");
    }

    if (!email) {
      console.error("Missing email parameter");
      return new Response(
        JSON.stringify({ error: "Email parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure the user can only sync their own data
    if (authenticatedEmail && email.toLowerCase() !== authenticatedEmail.toLowerCase()) {
      console.error(`Email mismatch: authenticated=${authenticatedEmail}, requested=${email}`);
      return new Response(
        JSON.stringify({ error: "You can only sync your own data" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting sync for email: ${email}`);

    // Initialize Supabase client with service role for admin access
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Fetch data from Xano
    const xanoUrl = `https://x8y9-puwb-160f.n7d.xano.io/api:dniSNeUj/xano_user_data?email=${encodeURIComponent(email)}`;
    console.log(`Fetching from Xano: ${xanoUrl}`);

    const xanoResponse = await fetch(xanoUrl);
    if (!xanoResponse.ok) {
      console.error(`Xano fetch failed: ${xanoResponse.status}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch from Xano: ${xanoResponse.statusText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const xanoData: XanoUser[] = await xanoResponse.json();
    console.log(`Xano returned ${xanoData.length} records`);

    if (!xanoData || xanoData.length === 0) {
      // This is expected for users who signed up directly in Supabase (not from Xano)
      // Return success with no data to sync - not an error
      console.log("No user found in Xano - this is normal for Supabase-only users");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No Xano data to sync - user may be Supabase-only",
          synced: false 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const xanoUser = xanoData[0];
    console.log(`Processing Xano user ID: ${xanoUser.id}`);

    // Step 2: Find Supabase user by email
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error(`Auth error: ${authError.message}`);
      return new Response(
        JSON.stringify({ error: `Failed to query auth users: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = authUsers.users.find(u => u.email === email);
    
    if (!supabaseUser) {
      console.error(`No Supabase user found for email: ${email}`);
      return new Response(
        JSON.stringify({ error: `No Supabase user found with email: ${email}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUserId = supabaseUser.id;
    console.log(`Found Supabase user UUID: ${supabaseUserId}`);

    const results: Record<string, any> = {};

    // Step 3: Sync Profile
    console.log("Syncing profile...");
    const profileData = {
      id: supabaseUserId,
      xano_id: xanoUser.id,
      first_name: xanoUser.first_name || null,
      last_name: xanoUser.last_name || null,
      email: xanoUser.email,
      bio: xanoUser.bio || null,
      profile_image: xanoUser.profile_image || null,
      stripe_customer_id: xanoUser.stripe_customer_id || null,
      location: xanoUser.location || null,
      linkedin_profile: xanoUser.linkedIn_profile || null,
      twitter_profile: xanoUser.twitter_profile || null,
      discord_user_id: xanoUser.discord_user_id || null,
      discord_channel_id: xanoUser.discord_channel_id || null,
      discord_username: xanoUser.discord_username || null,
      visibility: xanoUser.visibilty || false,
      timezone: xanoUser.timezone || null,
      country: xanoUser.country || null,
      onboarded: xanoUser.onboarded || false,
      last_seen: xanoUser.last_seen ? new Date(xanoUser.last_seen).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { data: profileResult, error: profileError } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "id" })
      .select();

    if (profileError) {
      console.error(`Profile sync error: ${profileError.message}`);
      results.profile = { error: profileError.message };
    } else {
      console.log("Profile synced successfully");
      results.profile = { success: true, data: profileResult };
    }

    // Step 4: Sync Product
    // DEBUG: Log the entire products object
    console.log("DEBUG - products from Xano:", JSON.stringify(xanoUser.products, null, 2));
    
    if (xanoUser.products) {
      console.log("Syncing product...");
      const product = xanoUser.products;
      
      // Explicit field mapping with proper array handling (use empty array if null/undefined)
      const productData = {
        id: product.id,
        created_at: product.created_at 
          ? new Date(product.created_at).toISOString() 
          : new Date().toISOString(),
        product_name: product.product_name,
        notion_reference: product.notion_reference || null,
        monthly_price: product.monthly_price ?? null,
        yearly_price: product.yearly_price ?? null,
        stripe_product_id: product.stripe_product_id || null,
        lab_room: product.lab_room ?? false,
        category: product.category || null,
        events: product.events ?? false,
        logo_ai: product.logo_ai ?? false,
        programs_id: product.programs_id ?? null,
        annual_stripe_price_id: product.annual_stripe_price_id || null,
        monthly_stripe_price_id: product.monthly_stripe_price_id || null,
        one_off_stripe_price_id: product.one_off_stripe_price_id || null,
        duration_days: product.duration_days ?? null,
        email_template: product.email_template || null,
        periodicity: product.periodicity || null,
        internal_details: product.internal_details || null,
        // Array fields - ensure empty array if null/undefined
        course_id: Array.isArray(product.course_id) ? product.course_id : [],
        build_features: Array.isArray(product.build_features) ? product.build_features : [],
        connect_features: Array.isArray(product.connect_features) ? product.connect_features : [],
        event_types: Array.isArray(product.event_types) ? product.event_types : [],
        price_list: Array.isArray(product.price_list) ? product.price_list : [],
        perks: Array.isArray(product.perks) ? product.perks : [],
      };

      console.log("DEBUG - productData being upserted:", JSON.stringify(productData, null, 2));

      const { data: productResult, error: productError } = await supabase
        .from("products")
        .upsert(productData, { onConflict: "id" })
        .select();

      if (productError) {
        console.error(`Product sync error: ${productError.message}`);
        console.error(`Product sync error details:`, JSON.stringify(productError, null, 2));
        results.product = { error: productError.message };
      } else {
        console.log("Product synced successfully:", JSON.stringify(productResult, null, 2));
        results.product = { success: true, data: productResult };
      }
    } else {
      console.log("DEBUG - No products found in Xano response");
      results.product = { skipped: true, reason: "No product data in Xano" };
    }

    // Step 5: Sync Enrollment (if exists)
    if (xanoUser.enrollment_of_user) {
      console.log("Syncing enrollment...");
      const enrollment = xanoUser.enrollment_of_user;
      const enrollmentData = {
        id: enrollment.id,
        activations_id: enrollment.activations_id || null,
        user_id: supabaseUserId, // Use Supabase UUID, not Xano ID
        email: enrollment.email,
        products_id: enrollment.products_id || null,
        enrollment_term_days: enrollment.enrollment_term_days 
          ? new Date(enrollment.enrollment_term_days).toISOString() 
          : null,
        status: enrollment.status || null,
        entity_id: enrollment.entity_id || null,
        entity_type: enrollment.entity_type || null,
        enrollment_method: enrollment.enrollment_method || null,
        created_at: enrollment.created_at 
          ? new Date(enrollment.created_at).toISOString() 
          : new Date().toISOString(),
      };

      const { data: enrollmentResult, error: enrollmentError } = await supabase
        .from("enrollments")
        .upsert(enrollmentData, { onConflict: "id" })
        .select();

      if (enrollmentError) {
        console.error(`Enrollment sync error: ${enrollmentError.message}`);
        results.enrollment = { error: enrollmentError.message };
      } else {
        console.log("Enrollment synced successfully");
        results.enrollment = { success: true, data: enrollmentResult };
      }
    }

    // Step 6: Sync App Idea (if exists)
    // DEBUG: Log the entire app_idea_of_user object
    console.log("DEBUG - app_idea_of_user from Xano:", JSON.stringify(xanoUser.app_idea_of_user, null, 2));
    
    if (xanoUser.app_idea_of_user) {
      console.log("Syncing app idea...");
      const appIdea = xanoUser.app_idea_of_user;
      
      // Explicit field mapping - DO NOT use Xano integer ID as Supabase UUID
      // Let Supabase auto-generate UUID, use user_id for conflict resolution
      const appIdeaData = {
        user_id: supabaseUserId, // Supabase UUID, NOT Xano ID
        app_name: appIdea.app_name || null,
        app_description: appIdea.app_description || null,
        app_category: appIdea.app_category || null,
        app_for: appIdea.app_for || null,
        persona_description: appIdea.persona_description || null,
        user_demography: appIdea.user_demography || null,
        is_board_active: appIdea.isBoardActive || false,
        is_artifact_active: appIdea.isArtifactActive || false,
        idea_generation: appIdea.idea_generation || null,
        figma_link: appIdea.figma_link || null,
        app_type: appIdea.app_type || null,
        kanban_board_id: appIdea.kanban_board_id || null,
        invited_users_id: appIdea.invited_users_id || [],
        currently_building: appIdea.currently_building || false,
        one_liner: appIdea.one_liner || null,
        logo_text: appIdea.logo_text || null,
        logo: appIdea.logo || null,
        updated_at: new Date().toISOString(),
      };

      console.log("DEBUG - appIdeaData being upserted:", JSON.stringify(appIdeaData, null, 2));

      // First check if user already has an app idea
      const { data: existingIdea, error: checkError } = await supabase
        .from("app_ideas")
        .select("id")
        .eq("user_id", supabaseUserId)
        .maybeSingle();

      if (checkError) {
        console.error(`App idea check error: ${checkError.message}`);
        results.app_idea = { error: checkError.message };
      } else if (existingIdea) {
        // Update existing
        console.log(`Updating existing app idea: ${existingIdea.id}`);
        const { data: appIdeaResult, error: appIdeaError } = await supabase
          .from("app_ideas")
          .update(appIdeaData)
          .eq("id", existingIdea.id)
          .select();

        if (appIdeaError) {
          console.error(`App idea UPDATE error: ${appIdeaError.message}`);
          results.app_idea = { error: appIdeaError.message };
        } else {
          console.log("App idea updated successfully");
          results.app_idea = { success: true, data: appIdeaResult };
        }
      } else {
        // Insert new
        console.log("Inserting new app idea...");
        const { data: appIdeaResult, error: appIdeaError } = await supabase
          .from("app_ideas")
          .insert(appIdeaData)
          .select();

        if (appIdeaError) {
          console.error(`App idea INSERT error: ${appIdeaError.message}`);
          results.app_idea = { error: appIdeaError.message };
        } else {
          console.log("App idea inserted successfully");
          results.app_idea = { success: true, data: appIdeaResult };
        }
      }
    } else {
      console.log("DEBUG - No app_idea_of_user found in Xano response");
      results.app_idea = { skipped: true, reason: "No app idea data in Xano" };
    }

    console.log("Sync completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        supabase_user_id: supabaseUserId,
        xano_user_id: xanoUser.id,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Unexpected error: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
