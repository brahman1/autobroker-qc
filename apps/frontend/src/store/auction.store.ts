import { create } from 'zustand';
import { api } from '../lib/api';
import { socket, connectSocket } from '../lib/socket';
import toast from 'react-hot-toast';
import { useAuthStore } from './auth.store';

interface AuctionStore {
  currentAuction: any | null;
  bids: any[];
  remainingSeconds: number;
  isLoading: boolean;
  error: string | null;
  fetchAuction: (id: string) => Promise<void>;
  subscribeToAuction: (id: string) => void;
  unsubscribeFromAuction: () => void;
  placeBid: (auctionId: string, amount: number) => Promise<void>;
}

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  currentAuction: null,
  bids: [],
  remainingSeconds: 0,
  isLoading: false,
  error: null,

  fetchAuction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/auctions/${id}`) as any;
      set({ currentAuction: response.data, isLoading: false });
    } catch (e: any) {
      set({ error: "Erreur lors du chargement de l'enchère", isLoading: false });
      toast.error("Erreur lors du chargement de l'enchère");
    }
  },

  placeBid: async (auctionId: string, amount: number) => {
    try {
      await api.post(`/bids`, { auctionId, amount });
      toast.success('Mise placée avec succès');
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erreur lors de la mise");
      throw e;
    }
  },

  subscribeToAuction: (auctionId: string) => {
    const s = connectSocket(useAuthStore.getState().accessToken || undefined);
    
    // Nettoyer les anciens listeners pour éviter les doublons
    s.off('auction:tick');
    s.off('bid:new');
    s.off('auction:ended');
    s.off('auction:extended');
    s.off('connect');

    s.emit('join:auction', auctionId);
    
    api.get(`/bids/auction/${auctionId}`).then((res: any) => {
      set({ bids: res.data || [] });
    }).catch(console.error);

    // SCENARIO 3: Résilience (reconnexion WebSocket)
    s.on('connect', () => {
       console.log('Reconnecté au serveur : resynchronisation...');
       s.emit('join:auction', auctionId);
       get().fetchAuction(auctionId);
       api.get(`/bids/auction/${auctionId}`).then((res: any) => {
         set({ bids: res.data || [] });
       }).catch(console.error);
    });

    s.on('auction:tick', (data: { auctionId: string, remainingSeconds: number }) => {
      if (data.auctionId === auctionId) {
        set({ remainingSeconds: data.remainingSeconds });
      }
    });

    s.on('auction:extended', (data: { newEndAt: string }) => {
      toast('Temps prolongé !', { icon: '⏱️' });
      const current = get().currentAuction;
      if (current) {
        set({ currentAuction: { ...current, scheduledEndAt: data.newEndAt } });
      }
    });

    s.on('bid:new', (data: { auctionId: string, currentBid: number, winnerId: string }) => {
      if (data.auctionId === auctionId) {
         const current = get().currentAuction;
         if (current) {
           set({ currentAuction: { ...current, currentBid: data.currentBid } });
         }
         api.get(`/bids/auction/${auctionId}`).then((res: any) => {
           set({ bids: res.data || [] });
         }).catch(console.error);
      }
    });

    s.on('auction:ended', (data: { auctionId: string }) => {
      if (data.auctionId === auctionId) {
         const current = get().currentAuction;
         if (current) {
           set({ currentAuction: { ...current, status: 'ENDED' } });
         }
      }
    });
  },

  unsubscribeFromAuction: () => {
    const s = socket;
    if (s) {
      s.off('auction:tick');
      s.off('bid:new');
      s.off('auction:ended');
      s.off('auction:extended');
      s.off('connect');
    }
    set({ currentAuction: null, bids: [], remainingSeconds: 0 });
  }
}));

