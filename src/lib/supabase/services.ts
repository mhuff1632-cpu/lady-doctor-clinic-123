import { getSupabaseClient, isSupabaseConfigured } from './client';
import { Service } from '../../types/service';
import { demoServices } from '../../data/services';

export interface FetchServicesResult {
  data: Service[];
  error: string | null;
  isLive: boolean;
}

export async function fetchActiveServices(): Promise<FetchServicesResult> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: demoServices,
      error: null,
      isLive: false,
    };
  }

  try {
    const { data, error } = await client
      .from('services')
      .select('id, name, category, description, icon, image_url, duration, features, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase services query notice:', error.message);
      return {
        data: demoServices,
        error: error.message,
        isLive: false,
      };
    }

    if (!data || data.length === 0) {
      return {
        data: [],
        error: null,
        isLive: true,
      };
    }

    const mappedServices: Service[] = data.map((row) => {
      let parsedFeatures: string[] = [];
      if (Array.isArray(row.features)) {
        parsedFeatures = row.features as string[];
      } else if (typeof row.features === 'string') {
        try {
          parsedFeatures = JSON.parse(row.features);
        } catch {
          parsedFeatures = [row.features];
        }
      }

      return {
        id: row.id,
        name: row.name,
        category: row.category,
        shortDescription: row.description.slice(0, 120) + (row.description.length > 120 ? '...' : ''),
        description: row.description,
        icon: row.icon || 'Stethoscope',
        image: row.image_url || '/src/assets/images/clinic_interior_consultation_1791390183063.jpg',
        image_url: row.image_url,
        duration: row.duration,
        features: parsedFeatures,
        is_active: row.is_active,
        status: 'active',
      };
    });

    return {
      data: mappedServices,
      error: null,
      isLive: true,
    };
  } catch (err: any) {
    console.error('Unexpected error fetching services from Supabase:', err);
    return {
      data: demoServices,
      error: err?.message || 'Unable to connect to live database.',
      isLive: false,
    };
  }
}
