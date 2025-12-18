import { getFirestore, collection } from "firebase/firestore";
import app from "../../firebaseConfig";

// Initialize Firebase only if not already initialized
export const db = getFirestore(app);

// Collection References
export const USERS_COLLECTION = "users";
export const MOOD_LOGS_COLLECTION = "mood_logs";

export const getUserRef = (userId: string) =>
  collection(db, USERS_COLLECTION, userId);
export const getMoodLogsRef = (userId: string) =>
  collection(db, USERS_COLLECTION, userId, MOOD_LOGS_COLLECTION);
