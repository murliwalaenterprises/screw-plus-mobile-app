import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBFAiGT_lp8AMUp19DcMzk4W1hkgoFwCao",
  authDomain: "murliwalaenterprises-app.firebaseapp.com",
  projectId: "murliwalaenterprises-app",
  storageBucket: "murliwalaenterprises-app.firebasestorage.app",
  messagingSenderId: "947363907554",
  appId: "1:947363907554:web:575cc46f2787629fce9bbb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;