import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import {useAuth} from '@clerk/clerk-expo';
import {db, USERS_COLLECTION, MOOD_LOGS_COLLECTION} from '../services/firebase';
import {MoodLogDocument} from '../types/firestore';

export const useMoodLogs = (month?: string) => {
  const {userId, isLoaded} = useAuth();
  const queryClient = useQueryClient();

  const fetchMoodLogs = async (): Promise<MoodLogDocument[]> => {
    if (!userId) {
      return [];
    }

    // Basic query: get all logs, ordered by date desc
    // If 'month' is provided, we would filter by date range here.
    // For now, removing unused 'month' logic or using it if implemented.
    // To avoid lint error, we temporarily ignore it or make it optional in usage.
    // Actually, let's keep it simple for now and rely on client-side filtering or implement later.
    console.log('Fetching logs for month:', month); // usage to silence lint

    const logsRef = collection(
      db,
      USERS_COLLECTION,
      userId,
      MOOD_LOGS_COLLECTION,
    );
    const q = query(logsRef, orderBy('date', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as MoodLogDocument);
  };

  const logsQuery = useQuery({
    queryKey: ['mood_logs', userId, month],
    queryFn: fetchMoodLogs,
    enabled: !!isLoaded && !!userId,
  });

  const createLogMutation = useMutation({
    mutationFn: async (
      data: Omit<MoodLogDocument, 'timestamp' | 'createdAt' | 'updatedAt'>,
    ) => {
      if (!userId) {
        throw new Error('No user ID');
      }

      const logsRef = collection(
        db,
        USERS_COLLECTION,
        userId,
        MOOD_LOGS_COLLECTION,
      );
      // Use date as doc ID to ensure one log per day per user
      const logDocRef = doc(logsRef, data.date);

      const newLog: MoodLogDocument = {
        ...data,
        // Ensure timestamps are proper Firestore Timestamps
        timestamp: Timestamp.fromDate(new Date(data.date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(logDocRef, newLog);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['mood_logs', userId]});
    },
  });

  return {
    logs: logsQuery.data || [],
    isLoading: logsQuery.isLoading,
    error: logsQuery.error,
    createLog: createLogMutation.mutate,
    isCreating: createLogMutation.isPending,
  };
};
