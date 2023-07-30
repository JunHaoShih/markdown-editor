import { defineStore } from 'pinia';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
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
    googleLogin() {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      signInWithPopup(auth, provider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential) {
            const token = credential.accessToken;
          }
          // The signed-in user info.
          const appUser = result.user;
          this.user = appUser;
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const { email } = error.customData;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
          Notify.create({
            type: 'error',
            message: `Error ${errorCode}, ${errorMessage}`,
          });
        });
    },
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
