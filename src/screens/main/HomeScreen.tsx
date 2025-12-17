import React, {useMemo, useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, FAB, Card} from 'react-native-paper';
import {Calendar, DateData} from 'react-native-calendars';
import {useNavigation} from '@react-navigation/native';
import {useMoodLogs} from '../../hooks/useMoodLogs';
import {useAppTheme} from '../../context/ThemeContext';
import {getMoodColor} from '../../utils/moodLogic';
import {BORDER_RADIUS, SPACING} from '../../theme/styleConstants';
import {SkeletonLoader} from '../../components/animations/AnimatedComponents';
import Alert from '@blazejkustra/react-native-alert';

export const HomeScreen = () => {
  const {theme} = useAppTheme();
  const navigation = useNavigation<any>();
  const {logs, isLoading} = useMoodLogs();
  const [currentStreak, setCurrentStreak] = useState(0);

  const markedDates = useMemo(() => {
    const marks: any = {};
    logs.forEach(log => {
      marks[log.date] = {
        customStyles: {
          container: {
            backgroundColor: getMoodColor(log.moodRating),
            borderRadius: BORDER_RADIUS.medium,
          },
          text: {
            color: 'black',
            fontWeight: 'bold',
          },
        },
      };
    });
    return marks;
  }, [logs]);

  const calculateCurrentStreak = useCallback(() => {
    if (!logs || logs.length === 0) return 0;
    
    // Sort logs by date in descending order
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    
    // Check if today's log exists
    const today = new Date().toISOString().split('T')[0];
    if (sortedLogs[0].date === today) {
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Check consecutive days
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].date);
      const formattedLogDate = logDate.toISOString().split('T')[0];
      const formattedCurrentDate = currentDate.toISOString().split('T')[0];
      
      if (formattedLogDate === formattedCurrentDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (i > 0) {
        // If there's a gap in the logs, break the streak
        break;
      }
    }
    
    return streak;
  }, [logs]);

  useEffect(() => {
    if (!isLoading) {
      const streak = calculateCurrentStreak();
      setCurrentStreak(streak);
    }
  }, [logs, isLoading, calculateCurrentStreak]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header Skeleton */}
        <View style={[styles.header, { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl }]}>
          <SkeletonLoader 
            style={[{
              width: 280,
              height: 32,
              marginBottom: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.surfaceVariant,
            }]}
          />
          <SkeletonLoader 
            style={[{
              width: 220,
              height: 20,
              marginTop: 4,
              borderRadius: 4,
              backgroundColor: theme.colors.surfaceVariant,
            }]}
          />
        </View>
        
        {/* Calendar Skeleton */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <SkeletonLoader 
            style={[{
              width: "100%",
              height: 350,
              borderRadius: BORDER_RADIUS.medium,
              maxWidth: 600,
              alignSelf: 'center',
              backgroundColor: theme.colors.surfaceVariant,
            }]}
          />
        </View>

        {/* Stats Cards Skeleton */}
        <View style={[styles.statsContainer, { paddingHorizontal: SPACING.lg }]}>
          <View style={{ flex: 1, width: "100%", alignSelf: 'center' }}>
            <View style={{ flexDirection: 'row', width: '100%' }}>
              <View style={{ flex: 1, marginRight: SPACING.sm, minHeight: 120 }}>
                <SkeletonLoader 
                  style={[{
                    width: "100%",
                    height: "100%",
                    borderRadius: BORDER_RADIUS.medium,
                    backgroundColor: theme.colors.surfaceVariant,
                    flex: 1,
                  }]}
                />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.sm, minHeight: 120 }}>
                <SkeletonLoader 
                  style={[{
                    width: "100%",
                    height: "100%",
                    borderRadius: BORDER_RADIUS.medium,
                    backgroundColor: theme.colors.surfaceVariant,
                    flex: 1,
                  }]}
                />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Your Mood Calendar
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.subtitle, {color: theme.colors.onSurfaceVariant}]}>
            Track your journey, one day at a time.
          </Text>
        </View>

        <Card
          style={[
            styles.calendarCard,
            {backgroundColor: theme.colors.elevation.level1},
          ]}>
          <Card.Content style={styles.calendarContent}>
            <Calendar
              key={`calendar-${theme.dark ? 'dark' : 'light'}`}
              theme={{
                backgroundColor: theme.colors.surface,
                calendarBackground: 'transparent',
                textSectionTitleColor: theme.colors.onSurface,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: theme.colors.onPrimary,
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.onSurface,
                textDisabledColor: theme.colors.onSurfaceDisabled,
                monthTextColor: theme.colors.primary,
                indicatorColor: theme.colors.primary,
                arrowColor: theme.colors.onSurface,
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: 'bold',
              }}
              markingType={'custom'}
              markedDates={markedDates}
              onDayPress={(day: DateData) => {
                const today = new Date().toISOString().split('T')[0];
                if (day.dateString > today) {
                  Alert.alert(
                    'Future Date',
                    'You cannot log moods for future dates.',
                  );
                  return;
                }
                const existingLog = logs.find(
                  log => log.date === day.dateString,
                );
                navigation.navigate('LogMood', {
                  initialLog: existingLog || {date: day.dateString},
                });
              }}
            />
          </Card.Content>
        </Card>

        <View style={[styles.statsContainer, { paddingHorizontal: SPACING.lg }]}>
          <View style={{ flexDirection: 'row', gap: SPACING.md, width: '100%' }}>
            {/* Total Logs Card */}
            <Card style={[styles.statCard, { backgroundColor: theme.colors.elevation.level2 }]}>
              <Card.Content>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Total Logs
                </Text>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {logs.length}
                </Text>
              </Card.Content>
            </Card>
            
            {/* Streak Card */}
            <Card style={[styles.statCard, { backgroundColor: theme.colors.elevation.level2 }]}>
              <Card.Content>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Current Streak
                </Text>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {currentStreak} day{currentStreak !== 1 ? 's' : ''}
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('LogMood')}
        label="Check In"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 80, // FAB space
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: SPACING.xl,
    marginTop: SPACING.sm,
  },
  subtitle: {
    marginTop: SPACING.xs,
    opacity: 0.8,
  },
  calendarCard: {
    borderRadius: BORDER_RADIUS.card,
    marginBottom: SPACING.xl,
  },
  statsContainer: {
    marginVertical: SPACING.lg,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.card,
    minHeight: 120,
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#bb86fc', // theme.colors.primary
  },
  calendarContent: {
    padding: SPACING.xs,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#ce93d8', // theme.colors.secondary
  },
});
