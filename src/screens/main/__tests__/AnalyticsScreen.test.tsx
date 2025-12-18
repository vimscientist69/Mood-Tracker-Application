import React from 'react';
import {render} from '@testing-library/react-native';
import {AnalyticsScreen} from '../AnalyticsScreen';
import {Provider as PaperProvider} from 'react-native-paper';

// Mock dependencies
jest.mock('react-native-gifted-charts', () => ({
  PieChart: () => null,
  LineChart: () => null,
}));

jest.mock('firebase/app')
jest.mock('firebase/firestore')

jest.mock('../../../hooks/useMoodLogs', () => ({
  useMoodLogs: () => ({
    logs: [
      {date: '2025-01-01', moodRating: 5, tags: ['Happy']},
      {date: '2025-01-02', moodRating: 3, tags: ['Neutral']},
    ],
    isLoading: false,
  }),
}));

describe('AnalyticsScreen', () => {
  it('renders correctly', () => {
    const {getByText} = render(
      <PaperProvider>
        <AnalyticsScreen />
      </PaperProvider>,
    );

    expect(getByText('Analytics')).toBeTruthy();
    expect(getByText('Last 7 Days')).toBeTruthy(); // Default selected range
  });
});
