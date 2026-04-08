import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface UserProfile {
  name: string;
  email: string;
  avatarInitial: string;
}

interface UserState {
  profile: UserProfile;
  updateProfile: (patch: Partial<Pick<UserProfile, 'name' | 'email'>>) => void;
}

export const useUserStore = create<UserState>()(
  immer((set) => ({
    profile: {
      name: 'Alex',
      email: 'alex@example.com',
      avatarInitial: 'A',
    },

    updateProfile: (patch) => {
      set(s => {
        if (patch.name !== undefined) {
          s.profile.name = patch.name;
          s.profile.avatarInitial = patch.name.trim().charAt(0).toUpperCase() || 'A';
        }
        if (patch.email !== undefined) {
          s.profile.email = patch.email;
        }
      });
    },
  }))
);

export const selectUserProfile = (s: UserState) => s.profile;
