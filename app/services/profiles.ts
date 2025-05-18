import { createBrowserSupabaseClient, Database } from "@/lib/supabase"

export interface Profile {
  id: string
  name: string
  email: string
  avatar?: string
  location?: string
  phone?: string
  currency: string
  created_at?: string
  updated_at?: string
}

// Get the current user's profile
export async function getUserProfile(): Promise<{ 
  profile: Profile | null, 
  error: any 
}> {
  const supabase = createBrowserSupabaseClient()
  
  // Get the current session to identify the user
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { profile: null, error: "Not authenticated" }
  }
  
  // Get profile data from the profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
    
  if (error) {
    console.error('Error fetching profile:', error)
    return { profile: null, error }
  }

  // If name doesn't exist in profile but exists in user metadata
  if (!data.name && session.user.user_metadata?.name) {
    data.name = session.user.user_metadata.name
  }

  const profile: Profile = {
    id: data.id,
    name: data.name || session.user.email?.split('@')[0] || 'User',
    email: data.email || session.user.email || '',
    avatar: data.avatar_url,
    location: data.location,
    phone: data.phone,
    currency: 'USD', // Default, can be overridden from preferences
    created_at: data.created_at,
    updated_at: data.updated_at
  }

  // Get user preferences if they exist
  try {
    const { data: preferencesData } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (preferencesData) {
      profile.currency = preferencesData.preferred_currency
    }
  } catch (preferencesError) {
    // No preferences yet, that's okay
  }

  return { profile, error: null }
}

// Update a user's profile
export async function updateUserProfile(updates: Partial<Profile>): Promise<{ 
  profile: Profile | null, 
  error: any 
}> {
  const supabase = createBrowserSupabaseClient()
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { profile: null, error: "Not authenticated" }
  }

  // Extract data for the profiles table
  const { name, email, avatar, location, phone, currency } = updates
  
  // Update the profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name,
      email,
      avatar_url: avatar,
      location,
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', session.user.id)
    
  if (profileError) {
    console.error('Error updating profile:', profileError)
    return { profile: null, error: profileError }
  }

  // If currency is provided, update preferences
  if (currency) {
    const { error: preferencesError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: session.user.id,
        preferred_currency: currency,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (preferencesError) {
      console.error('Error updating preferences:', preferencesError)
      // We continue despite this error
    }
  }

  // Get the updated profile
  return getUserProfile()
} 