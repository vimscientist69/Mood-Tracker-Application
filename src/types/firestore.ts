import {Timestamp} from 'firebase/firestore';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  reminderTime?: string;
}

export interface UserStats {
  currentStreak: number;
  lastLogDate?: string;
  totalLogs: number;
}

export interface UserDocument {
  displayName?: string;
  email?: string;
  photoURL?: string;
  createdAt: Timestamp;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface MoodLogDocument {
  id?: string; // Document ID (YYYY-MM-DD or UUID)
  date: string; // YYYY-MM-DD
  timestamp: Timestamp;
  moodRating: number; // 1-5
  tags: string[];
  note?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
