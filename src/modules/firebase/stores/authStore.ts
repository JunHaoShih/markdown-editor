import { defineStore } from 'pinia';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from 'src/boot/firebase';
import { Notify } from 'quasar';

export interface AuthData {
  user?: FirebaseUser | null,
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthData => ({}),
  actions: {
    async register(email: string, password: string, displayName: string): Promise<boolean> {
      const response = await createUserWithEmailAndPassword(auth, email, password)
        .then(async (result): Promise<boolean> => {
          this.user = result.user;
          await updateProfile(this.user, {
            displayName,
          });
          // await setDefaultFolderView(result.user.uid);
          return true;
        })
        .catch((error): boolean => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          Notify.create({
            type: 'error',
            message: `Error ${errorCode}, ${errorMessage}`,
          });
          return false;
        });
      return response;
    },
    async login(email: string, password: string): Promise<boolean> {
      const response = await signInWithEmailAndPassword(auth, email, password)
        .then((result): boolean => {
          this.user = result.user;
          return true;
        })
        .catch((error): boolean => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          Notify.create({
            type: 'error',
            message: `Error ${errorCode}, ${errorMessage}`,
          });
          return false;
        });
      return response;
    },
    async logout() {
      const response = await signOut(auth)
        .then(() => {
          this.user = null;
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          Notify.create({
            type: 'error',
            message: `Error ${errorCode}, ${errorMessage}`,
          });
        });
      return response;
    },
  },
});
