import { create } from 'zustand';
import { Building, Equipment, FilterState, RoomType } from '../types';
import { getNext7Days } from '../utils/dateUtils';

interface FilterStore extends FilterState {
  setSearchQuery: (query: string) => void;
  setBuilding: (building: Building | 'ALL') => void;
  setMinimumCapacity: (capacity: number | null) => void;
  toggleEquipment: (item: Equipment) => void;
  setRoomType: (roomType: RoomType | 'ALL') => void;
  setSelectedDate: (date: string) => void;
  setTimeRange: (startTime: string | null, endTime: string | null) => void;
  resetFilters: () => void;
}

const initialDate = getNext7Days()[0].dateString;

const initialState: FilterState = {
  searchQuery: '',
  building: 'ALL',
  minimumCapacity: null,
  selectedEquipment: [],
  roomType: 'ALL',
  selectedDate: initialDate,
  startTime: null,
  endTime: null,
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialState,

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  setBuilding: (building: Building | 'ALL') => set({ building }),

  setMinimumCapacity: (capacity: number | null) => set({ minimumCapacity: capacity }),

  toggleEquipment: (item: Equipment) =>
    set((state) => {
      const exists = state.selectedEquipment.includes(item);
      return {
        selectedEquipment: exists
          ? state.selectedEquipment.filter((eq) => eq !== item)
          : [...state.selectedEquipment, item],
      };
    }),

  setRoomType: (roomType: RoomType | 'ALL') => set({ roomType }),

  setSelectedDate: (date: string) => set({ selectedDate: date }),

  setTimeRange: (startTime: string | null, endTime: string | null) =>
    set({ startTime, endTime }),

  resetFilters: () => set({ ...initialState, selectedDate: getNext7Days()[0].dateString }),
}));
