import { Room, Building, RoomType, Equipment, RoomStatus } from '../types';
import { INITIAL_ROOMS } from '../constants/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type RoomListener = (rooms: Room[]) => void;

/**
 * Maps PostgreSQL snake_case database row from 'rooms' table
 * to the client TypeScript Room domain model.
 */
export function mapSupabaseRoomToRoom(row: any): Room {
  let uiStatus: RoomStatus = 'Available Now';
  if (row.status === 'occupied') {
    uiStatus = 'Occupied';
  } else if (row.status === 'maintenance') {
    uiStatus = 'Maintenance';
  } else {
    // If occupancy meets or exceeds capacity, mark Occupied
    if (row.current_occupancy >= row.capacity) {
      uiStatus = 'Occupied';
    } else {
      uiStatus = 'Available Now';
    }
  }

  return {
    id: row.id,
    name: row.name,
    photo: row.photo_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    building: row.building as Building,
    floor: row.floor ?? 1,
    capacity: row.capacity,
    type: row.room_type as RoomType,
    equipment: Array.isArray(row.equipment) ? (row.equipment as Equipment[]) : [],
    currentOccupancy: row.current_occupancy ?? 0,
    status: uiStatus,
    description: row.description || '',
  };
}

class RoomService {
  private rooms: Room[] = [...INITIAL_ROOMS];
  private listeners: Set<RoomListener> = new Set();
  private simulationTimer: ReturnType<typeof setInterval> | null = null;
  private realtimeChannel: any = null;

  constructor() {
    if (!isSupabaseConfigured()) {
      this.startSimulation();
    }
  }

  /**
   * Fetches all rooms from Supabase with automatic fallback to seed data.
   */
  public async getRooms(): Promise<Room[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .order('code', { ascending: true });

        if (error) {
          console.warn('Error querying Supabase rooms:', error.message);
          return [...this.rooms];
        }

        if (data && data.length > 0) {
          this.rooms = data.map(mapSupabaseRoomToRoom);
          return [...this.rooms];
        }
      } catch (err) {
        console.warn('Network error fetching rooms from Supabase:', err);
      }
    }

    // Fallback to local rooms
    return [...this.rooms];
  }

  /**
   * Retrieves a single room by its ID or room code.
   */
  public async getRoomById(id: string): Promise<Room | undefined> {
    if (isSupabaseConfigured()) {
      try {
        // Query by id or code
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .or(`id.eq.${id},code.eq.${id}`)
          .maybeSingle();

        if (!error && data) {
          return mapSupabaseRoomToRoom(data);
        }
      } catch (err) {
        console.warn('Error fetching room by id from Supabase:', err);
      }
    }

    return this.rooms.find((r) => r.id === id || r.name.toLowerCase().includes(id.toLowerCase()));
  }

  /**
   * Retrieves rooms currently available for booking.
   */
  public async getAvailableRooms(): Promise<Room[]> {
    const all = await this.getRooms();
    return all.filter((r) => r.status === 'Available Now');
  }

  /**
   * Subscribes to real-time room occupancy and status changes.
   * Uses Supabase Realtime when configured, or simulation timer when offline.
   */
  public subscribeToRoomAvailability(listener: RoomListener): () => void {
    this.listeners.add(listener);
    // Emit current cached state immediately
    listener([...this.rooms]);

    if (isSupabaseConfigured()) {
      if (!this.realtimeChannel) {
        this.realtimeChannel = supabase
          .channel('public:rooms')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'rooms' },
            async () => {
              const updated = await this.getRooms();
              this.notify(updated);
            }
          )
          .subscribe();
      }

      return () => {
        this.listeners.delete(listener);
        if (this.listeners.size === 0 && this.realtimeChannel) {
          supabase.removeChannel(this.realtimeChannel);
          this.realtimeChannel = null;
        }
      };
    }

    // Mock simulation subscription fallback
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(snapshot: Room[] = [...this.rooms]) {
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn('Listener error in room availability subscription:', err);
      }
    });
  }

  /**
   * Simulates dynamic occupancy changes across campus rooms when running in offline/mock mode.
   */
  private startSimulation() {
    if (this.simulationTimer) return;

    this.simulationTimer = setInterval(() => {
      if (this.listeners.size === 0) return;

      const activeRooms = this.rooms.filter((r) => r.status !== 'Maintenance');
      if (activeRooms.length === 0) return;

      const randomIndex = Math.floor(Math.random() * activeRooms.length);
      const targetRoom = activeRooms[randomIndex];

      const delta = Math.random() > 0.5 ? 1 : -1;
      let newOccupancy = targetRoom.currentOccupancy + delta;
      if (newOccupancy < 0) newOccupancy = 0;
      if (newOccupancy > targetRoom.capacity) newOccupancy = targetRoom.capacity;

      if (newOccupancy !== targetRoom.currentOccupancy) {
        targetRoom.currentOccupancy = newOccupancy;
        targetRoom.status = newOccupancy >= targetRoom.capacity ? 'Occupied' : 'Available Now';
        this.notify();
      }
    }, 15000);
  }
}

export const roomService = new RoomService();
