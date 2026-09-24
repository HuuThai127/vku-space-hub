import { create } from 'zustand';
import { Room } from '../types';
import { roomService } from '../services/roomService';

interface RoomStore {
  rooms: Room[];
  selectedRoom: Room | null;
  loading: boolean;
  error: string | null;
  fetchRooms: () => Promise<void>;
  subscribeRealtime: () => () => void;
  selectRoom: (room: Room | null) => void;
  getRoomById: (id: string) => Room | undefined;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  rooms: [],
  selectedRoom: null,
  loading: false,
  error: null,

  fetchRooms: async () => {
    set({ loading: true, error: null });
    try {
      const data = await roomService.getRooms();
      set({ rooms: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch rooms', loading: false });
    }
  },

  subscribeRealtime: () => {
    return roomService.subscribeToRoomAvailability((updatedRooms) => {
      set({ rooms: updatedRooms });
    });
  },

  selectRoom: (room: Room | null) => {
    set({ selectedRoom: room });
  },

  getRoomById: (id: string) => {
    return get().rooms.find((r) => r.id === id);
  },
}));
