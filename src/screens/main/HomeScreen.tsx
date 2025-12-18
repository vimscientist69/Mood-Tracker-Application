import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, FAB, Card } from "react-native-paper";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { useMoodLogs } from "../../hooks/useMoodLogs";
import { getMoodColor } from "../../utils/moodLogic";
import {
  responsive as r,
  responsiveSpacing as rs,
  isTablet,
  isDesktop,
  isSmallDevice,
} from "../../utils/responsive";
import { SkeletonLoader } from "../../components/animations/AnimatedComponents";
import alert from "@/components/alert";
import { useAppTheme } from "@/context/ThemeContext";
import { AppTheme } from "@/theme/theme";

export const HomeScreen = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation<any>();
  const { logs, isLoading } = useMoodLogs();
  const [currentStreak, setCurrentStreak] = useState(0);

  const markedDates = useMemo(() => {
    const marks: any = {};
    logs.forEach((log) => {
      marks[log.date] = {
        customStyles: {
          container: {
            backgroundColor: getMoodColor(log.moodRating),
            borderRadius: r.borderRadius.medium,
          },
          text: {
            color: "black",
            fontWeight: "bold",
          },
        },
      };
    });
    return marks;
  }, [logs]);

  const calculateCurrentStreak = useCallback(() => {
    if (!logs || logs.length === 0) {
      return 0;
    }

    // Sort logs by date in descending order
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let streak = 0;
    let currentDate = new Date();

    // Check if today's log exists
    const today = new Date().toISOString().split("T")[0];
    if (sortedLogs[0].date === today) {
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Check consecutive days
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].date);
      const formattedLogDate = logDate.toISOString().split("T")[0];
      const formattedCurrentDate = currentDate.toISOString().split("T")[0];

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      position: "relative",
    },
    desktopContainer: {
      flex: 1,
      flexDirection: "row",
    },
    desktopSidebar: {
      width: 300,
      padding: rs.xl,
      borderRightWidth: 1,
      borderRightColor: "rgba(0,0,0,0.1)",
    },
    desktopScrollView: {
      flexGrow: 1,
      padding: rs.xl,
    },
    desktopContent: {
      maxWidth: 1200,
      width: "100%",
      alignSelf: "center",
    },
    scrollView: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    content: {
      flex: 1,
    },
    calendarContainer: {
      margin: rs.md,
      borderRadius: r.borderRadius.large,
      overflow: "hidden",
      backgroundColor: "transparent",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    tabletCalendarContainer: {
      marginHorizontal: rs.xl,
      marginTop: rs.lg,
    },
    calendar: {
      borderWidth: 1,
      borderColor: "transparent",
      borderRadius: r.borderRadius.large,
      overflow: "hidden",
    },
    tabletCalendar: {
      padding: rs.md,
    },
    statsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: isTablet ? "flex-start" : "space-between",
      marginBottom: rs.xl,
      gap: rs.md,
      paddingHorizontal: rs.lg, // Add horizontal padding to match calendar
      width: "100%", // Ensure full width
    },
    tabletStatsContainer: {
      paddingHorizontal: rs.xl,
      marginTop: rs.lg,
    },
    statCard: {
      flex: 1, // Only use flex on tablet
      width: undefined, // Fixed width for mobile, flex for tablet
      minWidth: isTablet ? 200 : undefined, // Minimum width for tablet
      borderRadius: r.borderRadius.medium,
      backgroundColor: theme.colors.surface, // Add background color
      elevation: 2, // Add shadow
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    statCardContent: {
      padding: rs.md,
    },
    statValue: {
      fontWeight: "bold",
      marginTop: rs.xs,
    },
    fab: {
      position: "absolute",
      margin: rs.xl,
      right: 0,
      bottom: 0,
    },
    header: {
      padding: rs.lg,
      paddingBottom: rs.md,
    },
    title: {
      fontWeight: "bold",
      marginBottom: rs.xs,
    },
    subtitle: {
      opacity: 0.8,
    },
    headerTitle: {
      fontWeight: "bold",
      color: "#bb86fc", // theme.colors.primary
    },
    calendarContent: {
      padding: rs.xs,
    },
  });

  if (isLoading && isSmallDevice) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Title and subtitle Skeletons */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: rs.lg,
              paddingTop: rs.xl,
            },
          ]}
        >
          <SkeletonLoader
            style={[
              {
                width: 280,
                height: 32,
                marginBottom: rs.sm,
                borderRadius: r.borderRadius.small,
                backgroundColor: theme.colors.surfaceVariant,
              },
            ]}
          />
          <SkeletonLoader
            style={[
              {
                width: 220,
                height: 20,
                borderRadius: r.borderRadius.small,
                backgroundColor: theme.colors.surfaceVariant,
              },
            ]}
          />
        </View>

        {/* Calendar Skeleton */}
        <View
          style={{
            paddingHorizontal: rs.lg,
            marginBottom: rs.lg,
          }}
        >
          <SkeletonLoader
            style={[
              {
                width: "100%",
                height: 350,
                borderRadius: r.borderRadius.medium,
                alignSelf: "center",
                backgroundColor: theme.colors.surfaceVariant,
              },
            ]}
          />
        </View>
        <StatsCards styles={styles.statsContainer} theme={theme} />
      </SafeAreaView>
    );
  }

  const renderContent = () => (
    <View style={[styles.content, isDesktop && styles.desktopContent]}>
      <View
        style={[
          styles.calendarContainer,
          isTablet && styles.tabletCalendarContainer,
        ]}
      >
        <Calendar
          key={`calendar-${theme.dark ? "dark" : "light"}`}
          style={[styles.calendar, isTablet && styles.tabletCalendar]}
          theme={{
            backgroundColor: theme.colors.surface,
            calendarBackground: theme.colors.surface,
            textSectionTitleColor: theme.colors.onSurfaceVariant,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: theme.colors.onPrimary,
            todayTextColor: theme.colors.primary,
            dayTextColor: theme.colors.onSurface,
            textDisabledColor: theme.colors.surfaceVariant,
            dotColor: theme.colors.primary,
            selectedDotColor: theme.colors.onPrimary,
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.primary,
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "500",
            textDayFontSize: isTablet ? 18 : 16,
            textMonthFontSize: isTablet ? 24 : 20,
            textDayHeaderFontSize: isTablet ? 16 : 14,
          }}
          markingType={"custom"}
          markedDates={markedDates}
          onDayPress={(day) => {
            const today = new Date().toISOString().split("T")[0];
            if (day.dateString > today) {
              alert("Future Date", "You cannot log moods for future dates.");
              return;
            }
            const existingLog = logs.find((log) => log.date === day.dateString);
            navigation.navigate("LogMood", {
              initialLog: existingLog || { date: day.dateString },
            });
          }}
        />
      </View>

      <View
        style={[styles.statsContainer, isTablet && styles.tabletStatsContainer]}
      >
        <Card
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.elevation.level2 },
          ]}
        >
          <Card.Content style={styles.statCardContent}>
            <Text
              variant="labelMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Total Logs
            </Text>
            <Text
              variant={isTablet ? "displaySmall" : "headlineMedium"}
              style={styles.statValue}
            >
              {logs.length}
            </Text>
          </Card.Content>
        </Card>

        <Card
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.elevation.level2 },
          ]}
        >
          <Card.Content style={styles.statCardContent}>
            <Text
              variant="labelMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Current Streak
            </Text>
            <Text
              variant={isTablet ? "displaySmall" : "headlineMedium"}
              style={styles.statValue}
            >
              {currentStreak} day{currentStreak !== 1 ? "s" : ""}
            </Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {isDesktop ? (
        <View style={styles.desktopContainer}>
          <View style={styles.desktopSidebar}>
            <Text
              variant="headlineSmall"
              style={[styles.title, { color: theme.colors.onBackground }]}
            >
              Mood Tracker
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.subtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Track your daily mood and patterns
            </Text>
          </View>
          <ScrollView contentContainerStyle={styles.desktopScrollView}>
            {renderContent()}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.onBackground }]}
            >
              Mood Tracker
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.subtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Track your daily mood and patterns
            </Text>
          </View>
          {renderContent()}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate("LogMood")}
        size={isTablet ? "large" : "medium"}
        label="Check In"
      />
    </SafeAreaView>
  );
};

const StatsCards = (props: { styles: any; theme: AppTheme }) => (
  <View style={[props.styles, { width: "100%" }]}>
    {[1, 2].map((i) => (
      <SkeletonLoader
        key={i}
        style={[
          {
            flex: 1,
            height: 120,
            borderRadius: r.borderRadius.medium,
            backgroundColor: props.theme.colors.surfaceVariant,
            width: "100%",
          },
        ]}
      />
    ))}
  </View>
);
