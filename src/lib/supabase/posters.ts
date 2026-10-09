import { ClinicPoster, CreatePosterInput } from '../../types/poster';
import { initialClinicPosters } from '../../data/postersData';
import { getSupabaseClient, isSupabaseConfigured } from './client';

const POSTERS_STORAGE_KEY = 'ldc_clinic_posters_v1';

function getStoredPosters(): ClinicPoster[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(POSTERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch {}
  return [...initialClinicPosters];
}

function saveStoredPosters(posters: ClinicPoster[]) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(POSTERS_STORAGE_KEY, JSON.stringify(posters));
    }
  } catch {}
}

/**
 * Fetch all posters (or only active ones for public pages)
 */
export async function fetchPosters(activeOnly = false): Promise<ClinicPoster[]> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    const list = getStoredPosters();
    const filtered = activeOnly ? list.filter((p) => p.is_active) : list;
    return filtered.sort((a, b) => a.display_order - b.display_order);
  }

  try {
    let query = client
      .from('posters')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) {
      return data as ClinicPoster[];
    }
    // Fallback if table is empty
    return getStoredPosters().filter((p) => !activeOnly || p.is_active);
  } catch (err) {
    console.warn('Error querying posters from Supabase, using local store:', err);
    return getStoredPosters().filter((p) => !activeOnly || p.is_active);
  }
}

/**
 * Add a new poster record
 */
export async function createPoster(
  input: CreatePosterInput
): Promise<{ success: boolean; data?: ClinicPoster; error?: string }> {
  const newPoster: ClinicPoster = {
    id: `poster-${Date.now().toString(36)}`,
    title: input.title.trim(),
    theme: input.theme.trim(),
    description: input.description.trim(),
    image_url: input.image_url?.trim() || '',
    display_order: Number(input.display_order) || 1,
    is_active: Boolean(input.is_active),
    highlights: input.highlights || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Always update local cache
  const stored = getStoredPosters();
  stored.push(newPoster);
  saveStoredPosters(stored);

  const client = getSupabaseClient();
  if (isSupabaseConfigured && client) {
    try {
      const { error } = await client.from('posters').insert([newPoster]);
      if (error) console.warn('Supabase poster insert note:', error);
    } catch {}
  }

  return { success: true, data: newPoster };
}

/**
 * Update an existing poster
 */
export async function updatePoster(
  id: string,
  updates: Partial<ClinicPoster>
): Promise<{ success: boolean; error?: string }> {
  const stored = getStoredPosters();
  const idx = stored.findIndex((p) => p.id === id);
  if (idx !== -1) {
    stored[idx] = {
      ...stored[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStoredPosters(stored);
  }

  const client = getSupabaseClient();
  if (isSupabaseConfigured && client) {
    try {
      const { error } = await client.from('posters').update(updates).eq('id', id);
      if (error) console.warn('Supabase poster update error:', error);
    } catch {}
  }

  return { success: true };
}

/**
 * Delete a poster
 */
export async function deletePoster(id: string): Promise<{ success: boolean; error?: string }> {
  const stored = getStoredPosters();
  const filtered = stored.filter((p) => p.id !== id);
  saveStoredPosters(filtered);

  const client = getSupabaseClient();
  if (isSupabaseConfigured && client) {
    try {
      const { error } = await client.from('posters').delete().eq('id', id);
      if (error) console.warn('Supabase poster delete error:', error);
    } catch {}
  }

  return { success: true };
}
