import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, FAB, useTheme, ActivityIndicator} from 'react-native-paper';
import {Calendar, DateData} from 'react-native-calendars';
import {useNavigation} from '@react-navigation/native';
import {useMoodLogs} from '../../hooks/useMoodLogs';

// Helper to get color for mood rating (5 = best, 1 = worst)
const getMoodColor = (rating: number, theme: any) => {
  switch (rating) {
    case 5:
      return '#4CAF50'; // Green
    case 4:
      return '#8BC34A'; // Light Green
    case 3:
      return '#FFEB3B'; // Yellow
    case 2:
      return '#FF9800'; // Orange
    case 1:
      return '#F44336'; // Red
    default:
      return theme.colors.primary;
  }
};

export const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const {logs, isLoading} = useMoodLogs();

  const markedDates = useMemo(() => {
    const marks: any = {};
    logs.forEach(log => {
      marks[log.date] = {
        customStyles: {
          container: {
            backgroundColor: getMoodColor(log.moodRating, theme),
            borderRadius: 8,
          },
          text: {
            color: 'black',
            fontWeight: 'bold',
          },
        },
      };
    });
    return marks;
  }, [logs, theme]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Your Mood Calendar</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Track your journey, one day at a time.
        </Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          theme={{
            calendarBackground: theme.colors.elevation.level1,
            textSectionTitleColor: theme.colors.onSurface,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: theme.colors.onPrimary,
            todayTextColor: theme.colors.primary,
            dayTextColor: theme.colors.onSurface,
            textDisabledColor: theme.colors.onSurfaceDisabled,
            monthTextColor: theme.colors.primary,
            indicatorColor: theme.colors.primary,
            arrowColor: theme.colors.onSurface,
          }}
          markingType={'custom'}
          markedDates={markedDates}
          onDayPress={(day: DateData) => {
            // Optionally filter list below or open log for that day
            console.log('selected day', day);
          }}
        />
      </View>

      <FAB
        icon="plus"
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('LogMood')}
        label="Check In"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingBottom: 12,
  },
  subtitle: {
    opacity: 0.7,
  },
  calendarContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
