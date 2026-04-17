import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyC7MP9QpoQ7lHrtSOQosyY14RFyv7ekkxw',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'the-patrol-hub.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'the-patrol-hub',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'the-patrol-hub.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '745111630402',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ?? '1:745111630402:web:698f4080930b458a38b3db',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Could not set auth persistence', error);
});
