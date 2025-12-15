import { useState, useEffect, useCallback } from 'react';
import { useUser } from "@clerk/clerk-expo";
import { LocalStorageService } from '../services/LocalStorageService';
import { SyncService } from '../services/SyncService';

export function useMoodData() {
    const { user } = useUser();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper to generate empty calendar for current month
    const generateCurrentMonthCalendar = () => {
        const totalDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const currentMonthCalendarValues = [];
        for (let i = 0; i < totalDays; i++) {
            currentMonthCalendarValues.push({
                day: i + 1,
                value: 0,
            });
        }

        let weeksArray = [];
        const daysInWeek = 7;
        for (let i = 0; i < currentMonthCalendarValues.length; i += daysInWeek) {
            const week = currentMonthCalendarValues.slice(i, i + daysInWeek);
            weeksArray.push({ week });
        }
        return weeksArray;
    };

    const initializeOrUpdateData = useCallback(async (data) => {
        const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

        let newData = data ? { ...data } : null;

        if (!newData) {
            // No data exists, initialize new user data
            newData = {
                userId: user?.id || "",
                currentMonthCalendar: generateCurrentMonthCalendar(),
                currentMonthYear: currentMonthYear,
                previousMonths: []
            };
        } else {
            // Data exists, check for month rollover
            if (newData.currentMonthYear !== currentMonthYear) {
                const previousMonths = newData.previousMonths || [];
                // Only archive if there is essentially data to archive (optional check, but good for safety)
                previousMonths.push({
                    monthAndYear: newData.currentMonthYear,
                    monthData: newData.currentMonthCalendar
                });

                newData.previousMonths = previousMonths;
                newData.currentMonthCalendar = generateCurrentMonthCalendar();
                newData.currentMonthYear = currentMonthYear;
            }
        }

        return newData;

    }, [user?.id]);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!user) return;

            setLoading(true);

            // 1. Try Local Storage first
            const localData = await LocalStorageService.getUserData();

            // 2. Process Data (Initialize/Rollover)
            // Even if we have local data, we check if month rolled over
            const processedData = await initializeOrUpdateData(localData);

            if (isMounted) {
                setUserData(processedData);
                setLoading(false); // UI is now ready with local data
            }

            // 3. Save back processed data to local if it changed (e.g. initialization or rollover)
            // We do a deep comparison or just save to be safe if it was null
            if (!localData || localData.currentMonthYear !== processedData.currentMonthYear) {
                await LocalStorageService.saveUserData(processedData);
            }

            // 4. Background Sync (PULL)
            // Pull from remote, merge/update if necessary
            const remoteData = await SyncService.syncPull(user.id);
            if (remoteData) {
                const processedRemote = await initializeOrUpdateData(remoteData);
                // In a real app, we might merge local changes here if they happened while offline.
                // For now, we update local with remote if remote exists (assuming remote is source of truth after sync)
                // However, if we want to be truly offline first and we made changes that are not on remote, this overwrites them.
                // Given the user request "sending fetching... only when opening", we assume syncPull happens once.

                // TODO: A better merge strategy would be checking timestamps.
                // For this MVP step, we will use remote if it's available, assuming the user works on one device mostly.
                if (isMounted) {
                    setUserData(processedRemote);
                    await LocalStorageService.saveUserData(processedRemote);
                }
            } else {
                // If no remote data, but we have local (or initialized) data, push it to ensure remote is in sync
                await SyncService.syncPush(user.id, processedData);
            }
        };

        loadData();

        return () => { isMounted = false; };
    }, [user, initializeOrUpdateData]);

    const updateMood = async (day, value) => {
        if (!userData) return;

        // 1. Optimistic Update
        const newUserData = { ...userData };
        const newCalendar = [...newUserData.currentMonthCalendar];

        // Find the day and update it
        for (let weekObj of newCalendar) {
            const dayObj = weekObj.week.find(d => d.day === day);
            if (dayObj) {
                dayObj.value = value;
                break;
            }
        }

        newUserData.currentMonthCalendar = newCalendar;
        setUserData(newUserData);

        // 2. Save Local
        await LocalStorageService.saveUserData(newUserData);

        // 3. Sync Background
        await SyncService.syncPush(user.id, newUserData);
    };

    return {
        userData,
        loading,
        updateMood
    };
}
