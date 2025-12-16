import { MD3Theme } from 'react-native-paper';

export const getMoodColor = (rating: number) => {
    switch (rating) {
        case 1: return '#FF5252'; // Very Sad
        case 2: return '#FFB74D'; // Sad
        case 3: return '#FFEB3B'; // Neutral
        case 4: return '#9CCC65'; // Happy
        case 5: return '#66BB6A'; // Very Happy
        default: return '#CCCCCC';
    }
};

// Map used in Analytics Screen legend/charts
export const MOOD_COLORS_MAP: Record<number, string> = {
    1: '#FF5252',
    2: '#FFB74D',
    3: '#FFEB3B',
    4: '#9CCC65',
    5: '#66BB6A',
};
