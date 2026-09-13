import { supabase } from '../lib/supabase/client';

interface LocationData {
  zipcode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  searchRadius: number;
}

interface BasketballCourt {
  id: string;
  name: string;
  type: 'Indoor' | 'Outdoor';
  address: string;
  latitude: number;
  longitude: number;
  hoops: number;
  surface: string;
  lighting: boolean;
  amenities: string[];
  rating: number;
  hours_weekday: string;
  hours_weekend: string;
  popular_times: string;
  distance?: number;
  zipcode?: string;
  city?: string;
  state?: string;
}

export class CourtDiscoveryService {
  private static instance: CourtDiscoveryService;

  static getInstance(): CourtDiscoveryService {
    if (!CourtDiscoveryService.instance) {
      CourtDiscoveryService.instance = new CourtDiscoveryService();
    }
    return CourtDiscoveryService.instance;
  }

  async findBasketballCourts(location: LocationData): Promise<BasketballCourt[]> {
    try {
      const { data, error } = await supabase
        .from('courts')
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) return [];

      const courtsWithDistance: BasketballCourt[] = data
        .filter((court: any) => court.latitude != null && court.longitude != null)
        .map((court: any) => {
          const distance = this.calculateDistance(
            location.latitude,
            location.longitude,
            court.latitude,
            court.longitude
          );
          return {
            id: court.id,
            name: court.name,
            type: court.type,
            address: court.address,
            latitude: court.latitude,
            longitude: court.longitude,
            hoops: court.hoops,
            surface: court.surface,
            lighting: court.lighting,
            amenities: court.amenities || [],
            rating: parseFloat(court.rating) || 0,
            hours_weekday: court.hours_weekday,
            hours_weekend: court.hours_weekend,
            popular_times: court.popular_times,
            zipcode: court.zipcode,
            city: court.city,
            state: court.state,
            distance,
          } as BasketballCourt;
        })
        .filter((court) => court.distance <= location.searchRadius)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));

      return courtsWithDistance;
    } catch (error) {
      console.error('Error fetching courts from database:', error);
      return [];
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const courtDiscovery = CourtDiscoveryService.getInstance();
