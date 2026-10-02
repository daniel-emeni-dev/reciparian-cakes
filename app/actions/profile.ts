'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema, type ProfileInput } from '@/lib/validations/profile'

export interface ProfileResult {
  success: boolean
  error?: string
}

const SAVE_ERROR = 'Could not save your details. Please try again.'

// Only full_name and phone are ever written. role is never sent from here.
export async function updateProfile(input: ProfileInput): Promise<ProfileResult> {
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please check your details and try again.' }
  }
  const { fullName, phone } = parsed.data

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Please log in again to update your details.' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone: phone === '' ? null : phone })
      .eq('id', user.id)
      .select('id')

    if (error) {
      console.error('Profile update failed:', error)
      return { success: false, error: SAVE_ERROR }
    }

    // RLS hides rows silently, so zero rows back means the update never happened.
    if (data.length === 0) {
      console.error('Profile update matched no rows for user', user.id)
      return { success: false, error: SAVE_ERROR }
    }

    // The header reads the name from auth metadata, so keep it in sync.
    const { error: metadataError } = await supabase.auth.updateUser({ data: { full_name: fullName } })
    if (metadataError) {
      console.error('Auth metadata update failed:', metadataError)
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Unexpected profile update error:', error)
    return { success: false, error: SAVE_ERROR }
  }
}