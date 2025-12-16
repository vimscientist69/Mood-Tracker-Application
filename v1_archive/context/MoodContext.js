import React, {createContext, useContext} from 'react';
import {useMoodData} from '../hooks/useMoodData';

const MoodContext = createContext(null);

export function MoodProvider({children}) {
  const moodData = useMoodData();

  return (
    <MoodContext.Provider value={moodData}>{children}</MoodContext.Provider>
  );
}

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};
