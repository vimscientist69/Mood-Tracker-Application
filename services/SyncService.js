import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig";
import { LocalStorageService } from "./LocalStorageService";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const SyncService = {
    // Pull data from Firebase and update local storage if remote is different/newer
    // For simplicity in this iteration, we'll assume remote is source of truth on startup
    // but we need to be careful not to overwrite un-synced local changes if we go strictly by that.
    // However, the user request implies a sync on open.

    async syncPull(userId) {
        if (!userId) return null;
        console.log('Starting background sync (PULL)...');

        try {
            const docRef = doc(db, "users", userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const remoteData = docSnap.data();
                // Save to local storage
                await LocalStorageService.saveUserData(remoteData);
                await LocalStorageService.setLastSyncTime(new Date().toISOString());
                console.log('Background sync (PULL) completed. Local data updated.');
                return remoteData;
            } else {
                console.log('No remote document found for user during sync.');
                return null;
            }
        } catch (error) {
            console.error("Error during background sync (PULL):", error);
            return null;
        }
    },

    // Push local data to Firebase
    async syncPush(userId, data) {
        if (!userId || !data) return;
        console.log('Starting background sync (PUSH)...');

        try {
            const docRef = doc(db, "users", userId);
            await setDoc(docRef, data, { merge: true });
            await LocalStorageService.setLastSyncTime(new Date().toISOString());
            console.log('Background sync (PUSH) completed. Remote data updated.');
        } catch (error) {
            console.error("Error during background sync (PUSH):", error);
            // We don't throw here to avoid blocking UI, as this is background sync
        }
    }
};
