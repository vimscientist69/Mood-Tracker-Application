import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, onlineManager, QueryClientConfig, QueryKey } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState, Platform } from 'react-native';

// Custom cache key for AsyncStorage
const CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE';

// Custom cache interface
type QueryCache = {
  timestamp: number;
  data: any;
};

// Custom cache persister
const persistCache = async (queryClient: QueryClient) => {
  try {
    const cache = queryClient.getQueryCache();
    const queries = cache.findAll();
    
    const cacheData: Record<string, QueryCache> = {};
    
    queries.forEach(({ queryKey, state }) => {
      if (state.status === 'success' && state.data) {
        cacheData[JSON.stringify(queryKey)] = {
          timestamp: Date.now(),
          data: state.data,
        };
      }
    });
    
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error persisting cache:', error);
  }
};

// Restore cache from storage
const restoreCache = async (queryClient: QueryClient) => {
    try {
        const cacheString = await AsyncStorage.getItem(CACHE_KEY);
        if (!cacheString) return;

        const cacheData: Record<string, QueryCache> = JSON.parse(cacheString);
        const cache = queryClient.getQueryCache();

        await Promise.all(
            Object.entries(cacheData).map(async ([key, { data }]) => {
                try {
                    const queryKey = JSON.parse(key) as QueryKey;
                    // Only set the cache if we don't already have fresh data
                    const existingQuery = cache.find({ queryKey });
                    if (!existingQuery || !existingQuery.state.data) {
                        queryClient.setQueryData(queryKey, data);
                    }
                } catch (e) {
                    console.error('Error restoring query:', e);
                    return Promise.resolve();
                }
            })
        );
    } catch (error) {
        console.error('Error restoring cache:', error);
    }
};

// Set up network status detection
const setupNetworkStatus = () => {
  // Initial network status check
  NetInfo.fetch().then(state => {
    onlineManager.setOnline(state.isConnected ?? false);
  });

  // Subscribe to network status changes
  return NetInfo.addEventListener(state => {
    const isOnline = state.isConnected ?? false;
    onlineManager.setOnline(isOnline);
    
    // When coming back online, refetch all active queries
    if (isOnline) {
      queryClient.refetchQueries();
    }
  });
};

// Query client configuration
const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      networkMode: 'offlineFirst', // Try cache first, then network
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
};

// Create the query client
export const queryClient = new QueryClient(queryConfig);

// Initialize the cache when the app starts
const initializeCache = async () => {
  await restoreCache(queryClient);
  
  // Set up a subscription to persist the cache when it changes
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    // Throttle the persistance to avoid too many writes
    persistCache(queryClient);
  });
  
  // Return a cleanup function
  return () => {
    unsubscribe();
    // Make one final save when unsubscribing
    persistCache(queryClient);
  };
};

// Start the cache initialization
let cleanupCache: (() => void) | null = null;
initializeCache().then(cleanup => {
  cleanupCache = cleanup;
});

// Initialize network status detection
setupNetworkStatus();

// Export functions for manual cache management
export const cacheUtils = {
  persist: () => persistCache(queryClient),
  restore: () => restoreCache(queryClient),
  clear: async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
    queryClient.clear();
  },
};

// Set up automatic cache persistence when the app goes to background
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state: string) => {
    if (state === 'background') {
      persistCache(queryClient);
    }
  });
}
