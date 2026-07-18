import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { applicationId } = await req.json()

    if (!applicationId) {
      throw new Error('applicationId is required')
    }

    // Initialize Supabase client with the SERVICE_ROLE key (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch the application
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('founder_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      throw new Error('Application not found')
    }

    if (application.status === 'approved') {
      return new Response(
        JSON.stringify({ message: 'Application is already approved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 2. Invite the user
    // The email will automatically be sent by Supabase using your template
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      application.email,
      {
        data: {
          full_name: application.name,
        }
      }
    )

    if (inviteError) {
      // If user already exists, it might throw an error. We can handle this gracefully
      // but for MVP we'll just throw
      throw inviteError
    }

    // 3. Create the Organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert([
        { 
          name: application.business_name, 
          application_id: application.id 
        }
      ])
      .select()
      .single()

    if (orgError) {
      console.error('Failed to create organization, but user was invited.', orgError)
      // Continuing anyway to update the status, org can be created later or handled in a hook
    }

    // 4. Update the application status to 'approved'
    const { error: updateError } = await supabaseAdmin
      .from('founder_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ message: 'Founder approved and invited successfully', user: inviteData.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
