import { create } from 'zustand';
import type { User } from '@horo/shared';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));
