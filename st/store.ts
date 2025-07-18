// lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProfileState {
  fullName: string;
  email: string;
  phone: string;
  profileImage: string; // URL for the profile picture
  setProfile: (profile: Partial<ProfileState>) => void;
}

// Create a persistent store using Zustand's `create` and `persist` middleware.
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      fullName: 'Rashid Riyad',
      email: 'Rashid.dev@example.com',
      phone: '+1 123 456 7890',
      profileImage: 'https://placeimg.com/140/140/people', // default profile image
      setProfile: (profile: Partial<ProfileState>) => set((state) => ({ ...state, ...profile })),
    }),
    {
      name: 'profile-storage', 
      getStorage: () => AsyncStorage,
    }
  )
);
