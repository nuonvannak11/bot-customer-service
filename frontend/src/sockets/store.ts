import { SocketState } from '@/interface';
import { create } from 'zustand';

export const useSocketStore = create<SocketState>((set) => ({
  notifications: [],
  lastScanResult: null,
  confirmGroupEvent: null,

  setConfirmGroupEvent: (data) => set({ confirmGroupEvent: data }),

  addNotification: (data) =>
    set((state) => ({ notifications: [data, ...state.notifications] })),

  setLastScanResult: (data) =>
    set({ lastScanResult: data }),
}));