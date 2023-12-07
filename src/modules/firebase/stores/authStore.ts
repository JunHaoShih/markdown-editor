import { defineStore } from 'pinia';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from 'src/boot/firebase';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { FirebaseError } from 'firebase/app';

/**
 * Handle Firebase auth error
 * @param error Error object, can be anything
 * @returns Always false
 */
function handleAuthError(error: unknown): false {
  if (error instanceof FirebaseError) {
    const errorCode = error.code;
    const errorName = error.message;
    Notify.create({
      type: 'error',
      message: `Error ${errorCode}: ${errorName}`,
    });
  } else if (error instanceof Error) {
    const errorName = error.name;
    const errorMessage = error.message;
    Notify.create({
      type: 'error',
      message: `Error ${errorName}: ${errorMessage}`,
    });
  } else {
    Notify.create({
      type: 'error',
      message: `Error : ${String(error)}`,
    });
  }
  return false;
}

export const useAuthStore = defineStore('auth', () => {
  /**
   * Current Firebase user
   */
  const user = ref<FirebaseUser | undefined | null>();

  /**
   * Register with email and password
   * @param email User email
   * @param password password
   * @param displayName User's display name
   * @returns Success or failed
   */
  async function register(email: string, password: string, displayName: string): Promise<boolean> {
    const response = await createUserWithEmailAndPassword(auth, email, password)
      .then(async (result): Promise<boolean> => {
        user.value = result.user;
        await updateProfile(user.value, {
          displayName,
        });
        await sendEmailVerification(result.user);
        return true;
      })
      .catch(handleAuthError);
    return response;
  }

  /**
   * Login with email and password
   * @param email User email
   * @param password User password
   * @returns Success or failed
   */
  async function login(email: string, password: string): Promise<boolean> {
    const response = await signInWithEmailAndPassword(auth, email, password)
      .then((result): boolean => {
        user.value = result.user;
        return true;
      })
      .catch(handleAuthError);
    return response;
  }

  /**
   * Logout current user
   * @returns Success or failed
   */
  async function logout(): Promise<boolean> {
    const response = await signOut(auth)
      .then(() => {
        user.value = null;
        return true;
      })
      .catch(handleAuthError);
    return response;
  }

  /**
   * Login with Google account
   * @returns Success or failed
   */
  async function googleLogin(): Promise<boolean> {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    const response = await signInWithPopup(auth, provider)
      .then((result): boolean => {
        user.value = result.user;
        return true;
      })
      .catch(handleAuthError);
    return response;
  }

  return {
    user,
    register,
    login,
    logout,
    googleLogin,
  };
});
