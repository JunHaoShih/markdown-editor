import { defineStore } from 'pinia';
import {
  User as FirebaseUser, GoogleAuthProvider, getAuth, signInWithPopup,
} from 'firebase/auth';

export interface AuthData {
  user?: FirebaseUser,
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthData => ({}),
  actions: {
    googleLogin() {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      const auth = getAuth();
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
          console.log(appUser);
          // IdP data available using getAdditionalUserInfo(result)
          // ...
        }).catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const { email } = error.customData;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
          // ...
        });
    },
  },
});
