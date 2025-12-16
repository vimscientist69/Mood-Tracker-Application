import { getMoodColor, MOOD_COLORS_MAP } from '../moodLogic';

describe('moodLogic', () => {
    describe('getMoodColor', () => {
        it('returns correct color for rating 5', () => {
            expect(getMoodColor(5)).toBe('#66BB6A');
        });
        it('returns correct color for rating 1', () => {
            expect(getMoodColor(1)).toBe('#FF5252');
        });
        it('returns default color for invalid rating', () => {
            expect(getMoodColor(0)).toBe('#CCCCCC');
            expect(getMoodColor(6)).toBe('#CCCCCC');
        });
    });

    describe('MOOD_COLORS_MAP', () => {
        it('has keys 1-5', () => {
            expect(Object.keys(MOOD_COLORS_MAP)).toEqual(['1', '2', '3', '4', '5']);
        });
        it('matches getMoodColor values', () => {
            expect(MOOD_COLORS_MAP[5]).toBe(getMoodColor(5));
            expect(MOOD_COLORS_MAP[1]).toBe(getMoodColor(1));
        });
    });
});
