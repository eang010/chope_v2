import { createClient } from './supabase/client'

export interface User {
  id: string
  email: string
  name: string
  avatar_seed: string
  agency: string | null
  office_floor: string | null
  created_at: string
}

export interface Listing {
  id: string
  giver_id: string
  title: string
  description: string | null
  category: string
  condition: string
  location: string
  quantity: number
  quantity_remaining: number
  ends_at: string | null
  is_archived: boolean
  created_at: string
  giver?: User
  media?: ListingMedia[]
}

export interface ListingMedia {
  id: string
  listing_id: string
  type: 'image' | 'video'
  url: string
  display_order: number
  created_at: string
}

export interface Chope {
  id: string
  user_id: string
  listing_id: string
  message: string | null
  quantity: number
  created_at: string
  listing?: Listing
}

// Auth Functions
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) return null
  return data
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

// Image Upload Functions
export async function uploadListingImage(file: File): Promise<string | null> {
  const supabase = createClient()
  
  // Generate a unique filename
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const filename = `${timestamp}-${random}-${file.name}`
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(filename, file)
  
  if (error) {
    console.error('Error uploading image:', error)
    return null
  }
  
  // Get public URL
  const { data: publicData } = supabase.storage
    .from('listing-images')
    .getPublicUrl(filename)
  
  return publicData.publicUrl
}

// Listings Functions
export async function getAllListings(): Promise<Listing[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      giver:giver_id(id, email, name, avatar_seed, agency, office_floor),
      media:listing_media(id, listing_id, type, url, display_order)
    `)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching listings:', error)
    return []
  }

  return data || []
}

export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      giver:giver_id(id, email, name, avatar_seed, agency, office_floor),
      media:listing_media(id, listing_id, type, url, display_order)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

// Chopes Functions
export async function getChopesByUserId(userId: string): Promise<Chope[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('chopes')
    .select(`
      *,
      listing:listing_id(
        *,
        giver:giver_id(id, email, name, avatar_seed, agency, office_floor),
        media:listing_media(id, listing_id, type, url, display_order)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching chopes:', error)
    return []
  }

  return data || []
}

// Count Functions
export async function getGivenCount(userId: string): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('giver_id', userId)
    .eq('is_archived', false)

  if (error) {
    console.error('Error fetching given count:', error)
    return 0
  }

  return count || 0
}

export async function getChopedCount(userId: string): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('chopes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching choped count:', error)
    return 0
  }

  return count || 0
}

export async function getListingsByUserId(userId: string): Promise<Listing[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      media:listing_media(id, listing_id, type, url, display_order),
      chopes(id, user_id, quantity, created_at, users:user_id(id, name, avatar_seed))
    `)
    .eq('giver_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user listings:', error)
    return []
  }

  return data || []
}

// Create Functions
export async function createListing(
  listing: Omit<Listing, 'id' | 'created_at'>,
  media: Omit<ListingMedia, 'id' | 'listing_id' | 'created_at'>[]
): Promise<Listing | null> {
  const supabase = createClient()

  // Insert listing
  const { data: listingData, error: listingError } = await supabase
    .from('listings')
    .insert([listing])
    .select()
    .single()

  if (listingError || !listingData) {
    console.error('Error creating listing:', listingError)
    return null
  }

  // Insert media
  if (media.length > 0) {
    const mediaWithListingId = media.map((m) => ({
      ...m,
      listing_id: listingData.id,
    }))

    const { error: mediaError } = await supabase
      .from('listing_media')
      .insert(mediaWithListingId)

    if (mediaError) {
      console.error('Error creating listing media:', mediaError)
    }
  }

  return listingData
}

export async function createChope(
  userId: string,
  listingId: string,
  message: string | null,
  quantity: number
): Promise<Chope | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('chopes')
    .insert([
      {
        user_id: userId,
        listing_id: listingId,
        message,
        quantity,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating chope:', error)
    return null
  }

  return data
}

// Delete Functions
export async function deleteListing(listingId: string): Promise<boolean> {
  const supabase = createClient()

  // First delete related records (chopes and media)
  await supabase.from('chopes').delete().eq('listing_id', listingId)
  await supabase.from('listing_media').delete().eq('listing_id', listingId)

  // Then delete the listing itself
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)

  if (error) {
    console.error('Error deleting listing:', error)
    return false
  }

  return true
}

export async function deleteChope(chopeId: string): Promise<boolean> {
  const supabase = createClient()

  // Fetch the chope first to get quantity and listing_id
  const { data: chope, error: fetchError } = await supabase
    .from('chopes')
    .select('id, quantity, listing_id')
    .eq('id', chopeId)
    .single()

  if (fetchError || !chope) {
    console.error('Error fetching chope:', fetchError)
    return false
  }

  // Fetch current quantity_remaining and increment it
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('quantity_remaining, quantity')
    .eq('id', chope.listing_id)
    .single()

  if (listingError || !listing) {
    console.error('Error fetching listing:', listingError)
    return false
  }

  const newQuantity = Math.min(
    listing.quantity_remaining + chope.quantity,
    listing.quantity
  )

  const { error: updateError } = await supabase
    .from('listings')
    .update({ quantity_remaining: newQuantity })
    .eq('id', chope.listing_id)

  if (updateError) {
    console.error('Error restoring quantity:', updateError)
    return false
  }

  // Delete the chope record
  const { error: deleteError } = await supabase
    .from('chopes')
    .delete()
    .eq('id', chopeId)

  if (deleteError) {
    console.error('Error deleting chope:', deleteError)
    return false
  }

  return true
}

// Update Functions
export async function updateListingQuantity(listingId: string, newQuantity: number): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('listings')
    .update({ quantity_remaining: newQuantity })
    .eq('id', listingId)

  if (error) {
    console.error('Error updating listing quantity:', error)
    return false
  }

  return true
}

export type ListingUpdateFields = Pick<
  Listing,
  'title' | 'description' | 'location' | 'quantity' | 'quantity_remaining'
>

export async function updateListing(
  listingId: string,
  updates: ListingUpdateFields
): Promise<Listing | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', listingId)
    .select()
    .single()

  if (error || !data) {
    console.error('Error updating listing:', error)
    return null
  }

  return data
}

export async function replaceListingMedia(
  listingId: string,
  media: Omit<ListingMedia, 'id' | 'listing_id' | 'created_at'>[]
): Promise<ListingMedia[] | null> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('listing_media')
    .delete()
    .eq('listing_id', listingId)

  if (deleteError) {
    console.error('Error deleting listing media:', deleteError)
    return null
  }

  if (media.length === 0) {
    return []
  }

  const mediaWithListingId = media.map((m) => ({
    ...m,
    listing_id: listingId,
  }))

  const { data, error: insertError } = await supabase
    .from('listing_media')
    .insert(mediaWithListingId)
    .select()

  if (insertError || !data) {
    console.error('Error inserting listing media:', insertError)
    return null
  }

  return data
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'office_floor' | 'avatar_seed'>>
): Promise<User | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user:', error)
    return null
  }

  return data
}
