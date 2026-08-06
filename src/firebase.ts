import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase with custom config
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Realtime Database instance using configured databaseURL
const databaseURL = (firebaseConfig as any).databaseURL || `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`;

let rtdbInstance: Database;
try {
  rtdbInstance = getDatabase(app, databaseURL);
} catch (e) {
  console.warn('Realtime Database init warning, falling back to default instance:', e);
  rtdbInstance = getDatabase(app);
}

export const rtdb = rtdbInstance;
export const db = rtdbInstance;
export default app;

