import { createClient } from '@/lib/supabase/server'

export interface Testimonial {
  id: string
  customer_name: string
  rating: number
  message: string
  avatar_url: string | null
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('testimonials')
    .select('id, customer_name, rating, message, avatar_url')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }

  return data
}
