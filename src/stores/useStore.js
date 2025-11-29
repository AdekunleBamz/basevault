import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Wallet state
  address: null,
  isConnected: false,
  isConnecting: false,
  chainId: null,
  
  // Contract state
  userStats: null,
  protocolStats: null,
  currentRound: null,
  leaderboard: [],
  circles: [],
  userCircles: [],
  
  // UI state
  activeTab: 'vault',
  isLoading: false,
  
  // Actions
  setAddress: (address) => set({ address, isConnected: !!address }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setChainId: (chainId) => set({ chainId }),
  setUserStats: (userStats) => set({ userStats }),
  setProtocolStats: (protocolStats) => set({ protocolStats }),
  setCurrentRound: (currentRound) => set({ currentRound }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setCircles: (circles) => set({ circles }),
  setUserCircles: (userCircles) => set({ userCircles }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setLoading: (isLoading) => set({ isLoading }),
  
  disconnect: () => set({
    address: null,
    isConnected: false,
    userStats: null,
    userCircles: [],
  }),
}));
