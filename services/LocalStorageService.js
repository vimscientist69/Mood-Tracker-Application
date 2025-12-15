import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DATA_KEY = 'MOOD_TRACKER_USER_DATA';
const LAST_SYNC_KEY = 'MOOD_TRACKER_LAST_SYNC';

export const LocalStorageService = {
    async getUserData() {
        try {
            const jsonValue = await AsyncStorage.getItem(USER_DATA_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Error reading user data from local storage:', e);
            return null;
        }
    },

    async saveUserData(userData) {
        try {
            const jsonValue = JSON.stringify(userData);
            await AsyncStorage.setItem(USER_DATA_KEY, jsonValue);
        } catch (e) {
            console.error('Error saving user data to local storage:', e);
        }
    },

    async getLastSyncTime() {
        try {
            return await AsyncStorage.getItem(LAST_SYNC_KEY);
        } catch (e) {
            console.error('Error reading last sync time:', e);
            return null;
        }
    },

    async setLastSyncTime(timestamp) {
        try {
            await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
        } catch (e) {
            console.error('Error saving last sync time:', e);
        }
    },

    async clearAll() {
        try {
            await AsyncStorage.removeItem(USER_DATA_KEY);
            await AsyncStorage.removeItem(LAST_SYNC_KEY);
        } catch (e) {
            console.error('Error clearing local storage:', e);
        }
    }
};
