import { Room } from '../types';
import { INITIAL_ROOMS } from '../constants/mockData';

type RoomListener = (rooms: Room[]) => void;

class RoomService {
  private rooms: Room[] = [...INITIAL_ROOMS];
  private listeners: Set<RoomListener> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startSimulation();
  }

  public async getRooms(): Promise<Room[]> {
    // Simulate low-latency network call
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...this.rooms];
  }

  public async getRoomById(id: string): Promise<Room | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.rooms.find((r) => r.id === id);
  }

  /**
   * Mock real-time availability subscription.
   * Architecture ready for future WebSocket / Server-Sent Events integration.
   */
  public subscribeToRoomAvailability(listener: RoomListener): () => void {
    this.listeners.add(listener);
    // Emit immediate current state
    listener([...this.rooms]);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snapshot = [...this.rooms];
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn('Listener error in room availability subscription:', err);
      }
    });
  }

  /**
   * Simulates dynamic occupancy changes across campus rooms
   */
  private startSimulation() {
    if (this.timer) return;

    this.timer = setInterval(() => {
      if (this.listeners.size === 0) return;

      // Randomly pick a room that is not in maintenance
      const activeRooms = this.rooms.filter((r) => r.status !== 'Maintenance');
      if (activeRooms.length === 0) return;

      const randomIndex = Math.floor(Math.random() * activeRooms.length);
      const targetRoom = activeRooms[randomIndex];

      // Subtle occupancy delta (+1 or -1)
      const delta = Math.random() > 0.5 ? 1 : -1;
      let newOccupancy = targetRoom.currentOccupancy + delta;
      if (newOccupancy < 0) newOccupancy = 0;
      if (newOccupancy > targetRoom.capacity) newOccupancy = targetRoom.capacity;

      if (newOccupancy !== targetRoom.currentOccupancy) {
        targetRoom.currentOccupancy = newOccupancy;
        targetRoom.status = newOccupancy >= targetRoom.capacity ? 'Occupied' : 'Available Now';
        this.notify();
      }
    }, 15000); // Pulse every 15s
  }
}

export const roomService = new RoomService();
