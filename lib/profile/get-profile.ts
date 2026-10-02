import { createClient } from '@/lib/supabase/server'

export interface ProfileDetails {
  fullName: string
  phone: string | null
}

export async function getProfile(userId: string): Promise<ProfileDetails | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    if (!data) return null

    return { fullName: data.full_name, phone: data.phone }
  } catch (error) {
    console.error('Unexpected error fetching profile:', error)
    return null
  }
}