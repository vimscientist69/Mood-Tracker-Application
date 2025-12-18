import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  ActivityIndicator,
  Card,
  Chip,
  Menu,
  Button,
} from "react-native-paper";
import { PieChart, LineChart } from "react-native-gifted-charts";
import { useMoodLogs } from "../../hooks/useMoodLogs";
import { useAppTheme } from "../../context/ThemeContext";
import { format, parseISO } from "date-fns";
import { MOOD_COLORS_MAP } from "../../utils/moodLogic";
import {
  TimeRange,
  filterLogsByDate,
  calculateMoodCounts,
  calculateAverageMood,
  calculateTopTags,
} from "../../utils/analyticsLogic";
import {
  responsive as r,
  responsiveSpacing as rs,
  responsiveFontSizes as rf,
  isTablet,
  isDesktop,
} from "../../utils/responsive";

const RANGE_LABELS: Record<TimeRange, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "3m": "Last 3 Months",
  "6m": "Last 6 Months",
  "1y": "Last Year",
  all: "All Time",
};

export const AnalyticsScreen = () => {
  const { theme } = useAppTheme();
  const { logs, isLoading } = useMoodLogs();
  const [range, setRange] = useState<TimeRange>("7d");
  const [menuVisible, setMenuVisible] = useState(false);
  const { width } = useWindowDimensions();

  // Helper to filter logs by range
  const filteredLogs = useMemo(() => {
    return filterLogsByDate(logs, range);
  }, [logs, range]);

  // Mood data with emojis and theme.colors
  interface MoodData {
    [key: number]: {
      emoji: string;
      color: string;
      label: string;
    };
  }

  const moodData: MoodData = useMemo(
    () => ({
      1: { emoji: "😢", color: MOOD_COLORS_MAP[1], label: "Very Sad" },
      2: { emoji: "😕", color: MOOD_COLORS_MAP[2], label: "Sad" },
      3: { emoji: "😐", color: MOOD_COLORS_MAP[3], label: "Neutral" },
      4: { emoji: "🙂", color: MOOD_COLORS_MAP[4], label: "Happy" },
      5: { emoji: "🤩", color: MOOD_COLORS_MAP[5], label: "Very Happy" },
    }),
    [],
  );

  // pie chart data: Mood Distribution
  const pieData = useMemo(() => {
    const counts = calculateMoodCounts(filteredLogs);
    const total = filteredLogs.length;
    if (total === 0) {
      return [];
    }

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        value,
        color: moodData[parseInt(key, 10) as keyof typeof moodData].color,
        label: moodData[parseInt(key, 10) as keyof typeof moodData].emoji,
        moodKey: parseInt(key, 10),
      }));
  }, [filteredLogs, moodData]);

  // line chart data: Mood History
  const lineData = useMemo(() => {
    const sorted = [...filteredLogs].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return sorted.map((log) => ({
      value: log.moodRating,
      label: format(parseISO(log.date), "dd/MM"),
      dataPointText: "", // Remove text from points for cleaner look
      labelTextStyle: {
        color: theme.colors.onSurfaceVariant,
        fontSize: rf.xs,
      },
    }));
  }, [filteredLogs, theme]);

  // Top Tags
  const topTags = useMemo(() => {
    return calculateTopTags(filteredLogs);
  }, [filteredLogs]);

  const averageMood = useMemo(() => {
    return calculateAverageMood(filteredLogs);
  }, [filteredLogs]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderContent = () => (
    <View style={styles.content}>
      {/* Stats Overview */}
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
              Total Entries
            </Text>
            <Text
              variant={isTablet ? "displaySmall" : "headlineMedium"}
              style={[styles.statValue, { color: theme.colors.primary }]}
            >
              {filteredLogs.length}
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
              Avg. Mood
            </Text>
            <Text
              variant={isTablet ? "displaySmall" : "headlineMedium"}
              style={[styles.statValue, { color: theme.colors.primary }]}
            >
              {averageMood.toFixed(1)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Mood Distribution */}
      <Card
        style={[
          styles.chartCard,
          { backgroundColor: theme.colors.elevation.level2 },
        ]}
      >
        <Card.Content>
          <Text
            variant="titleMedium"
            style={{ marginBottom: rs.md, color: theme.colors.onSurface }}
          >
            Mood Distribution
          </Text>
          <View style={styles.chartContainer}>
            {pieData.length > 0 ? (
              <View style={styles.pieChartWrapper}>
                <PieChart
                  data={pieData}
                  donut
                  showGradient
                  sectionAutoFocus
                  radius={isTablet ? 100 : 80}
                  innerRadius={isTablet ? 60 : 45}
                  innerCircleColor={theme.colors.surface}
                  centerLabelComponent={pieChartLabel}
                />
                <View style={styles.legendContainer}>
                  {pieData.map((item) => (
                    <View key={item.moodKey} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendColor,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text
                        variant="labelSmall"
                        style={{
                          color: theme.colors.onSurfaceVariant,
                          marginLeft: rs.xs,
                        }}
                      >
                        {moodData[item.moodKey].emoji}{" "}
                        {moodData[item.moodKey].label}
                      </Text>
                      <Text
                        variant="labelSmall"
                        style={{
                          color: theme.colors.onSurfaceVariant,
                          marginLeft: rs.xs,
                          opacity: 0.7,
                        }}
                      >
                        ({Math.round((item.value / filteredLogs.length) * 100)}
                        %)
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  No data available
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Mood Trend */}
      <Card
        style={[
          styles.chartCard,
          { backgroundColor: theme.colors.elevation.level2 },
        ]}
      >
        <Card.Content>
          <Text
            variant="titleMedium"
            style={{ marginBottom: rs.md, color: theme.colors.onSurface }}
          >
            Mood Trend
          </Text>
          <View style={styles.chartContainer}>
            {lineData.length > 1 ? (
              <LineChart
                data={lineData}
                width={isTablet ? width - rs.xl * 2 : width - rs.lg * 2}
                height={220}
                initialSpacing={0}
                spacing={Math.max(
                  20,
                  Math.min(40, (width - 40) / lineData.length),
                )}
                color1={theme.colors.primary}
                textColor1={theme.colors.onSurface}
                dataPointsColor1={theme.colors.primary}
                textShiftY={-2}
                textShiftX={1}
                textFontSize={10}
                hideRules
                yAxisColor={theme.colors.surfaceVariant}
                xAxisColor={theme.colors.surfaceVariant}
                yAxisTextStyle={{
                  color: theme.colors.onSurfaceVariant,
                  fontSize: 10,
                }}
                xAxisLabelTextStyle={{
                  color: theme.colors.onSurfaceVariant,
                  fontSize: 10,
                }}
                yAxisLabelPrefix=""
                yAxisLabelSuffix=""
                yAxisLabelWidth={30}
                noOfSections={4}
                maxValue={5}
                yAxisTextNumberOfLines={1}
                adjustToWidth
                isAnimated
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  Not enough data to show trend
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Top Tags */}
      {topTags.length > 0 && (
        <Card
          style={[
            styles.chartCard,
            { backgroundColor: theme.colors.elevation.level2 },
          ]}
        >
          <Card.Content>
            <Text
              variant="titleMedium"
              style={{ marginBottom: rs.md, color: theme.colors.onSurface }}
            >
              Top Mood Tags
            </Text>
            <View style={styles.tagsContainer}>
              {topTags.map((tag) => (
                <Chip
                  key={tag.tag}
                  mode="outlined"
                  style={[
                    styles.tagChip,
                    {
                      borderColor: theme.colors.primary,
                      backgroundColor: `${theme.colors.primary}10`,
                    },
                  ]}
                  textStyle={{ color: theme.colors.primary }}
                >
                  {tag.tag} ({tag.count})
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const pieChartLabel = () => (
    <View style={styles.pieCenterLabel}>
      <Text
        variant={isTablet ? "headlineSmall" : "titleMedium"}
        style={{ color: theme.colors.primary }}
      >
        {filteredLogs.length}
      </Text>
      <Text
        variant={isTablet ? "bodyMedium" : "bodySmall"}
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        total
      </Text>
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
              Analytics
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.subtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Track your mood patterns and insights
            </Text>

            <View style={styles.rangeSelector}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    icon="calendar-range"
                    style={styles.rangeButton}
                    contentStyle={styles.rangeButtonContent}
                  >
                    {RANGE_LABELS[range]}
                  </Button>
                }
                style={styles.rangeMenu}
              >
                {Object.entries(RANGE_LABELS).map(([key, label]) => (
                  <Menu.Item
                    key={key}
                    onPress={() => {
                      setRange(key as TimeRange);
                      setMenuVisible(false);
                    }}
                    title={label}
                    titleStyle={{
                      color:
                        key === range
                          ? theme.colors.primary
                          : theme.colors.onSurface,
                    }}
                  />
                ))}
              </Menu>
            </View>
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
              Analytics
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.subtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Track your mood patterns and insights
            </Text>
          </View>

          {/* Time Range Selector */}
          <View style={styles.rangeSelector}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  icon="calendar-range"
                  style={styles.rangeButton}
                  contentStyle={styles.rangeButtonContent}
                >
                  {RANGE_LABELS[range]}
                </Button>
              }
            >
              {Object.entries(RANGE_LABELS).map(([key, label]) => (
                <Menu.Item
                  key={key}
                  onPress={() => {
                    setRange(key as TimeRange);
                    setMenuVisible(false);
                  }}
                  title={label}
                  titleStyle={{
                    color:
                      key === range
                        ? theme.colors.primary
                        : theme.colors.onSurface,
                  }}
                />
              ))}
            </Menu>
          </View>
          {renderContent()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    flex: 1,
    paddingBottom: 100,
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    padding: rs.lg,
    paddingBottom: 0,
  },
  title: {
    fontWeight: "bold",
    marginBottom: rs.xs,
  },
  subtitle: {
    opacity: 0.8,
  },
  rangeSelector: {
    margin: rs.lg,
    marginBottom: rs.xl,
    alignItems: "flex-start",
  },
  rangeButton: {
    borderRadius: r.borderRadius.medium,
  },
  rangeButtonContent: {
    flexDirection: "row-reverse",
  },
  rangeMenu: {
    marginTop: rs.md,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: rs.lg,
    paddingHorizontal: rs.lg,
  },
  tabletStatsContainer: {
    paddingHorizontal: rs.xl,
  },
  statCard: {
    flex: 1,
    marginHorizontal: rs.sm,
    borderRadius: r.borderRadius.medium,
  },
  statCardContent: {
    alignItems: "center",
    padding: rs.md,
  },
  statValue: {
    fontWeight: "bold",
    color: "#ce93d8",
    marginTop: rs.xs,
  },
  chartCard: {
    marginHorizontal: rs.lg,
    marginBottom: rs.lg,
    borderRadius: r.borderRadius.medium,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    minHeight: 200,
    padding: rs.md,
  },
  pieCenterLabel: {
    alignItems: "center",
    justifyContent: "center",
  },
  noDataContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: rs.sm,
  },
  tagChip: {
    marginRight: rs.sm,
    marginBottom: rs.sm,
    borderWidth: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pieChartWrapper: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: rs.lg,
    width: "100%",
  },
  legendContainer: {
    flexDirection: "column",
    gap: rs.sm,
    marginTop: rs.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rs.xs,
    paddingHorizontal: rs.sm,
    borderRadius: r.borderRadius.small,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: rs.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: r.borderRadius.small,
    marginRight: rs.xs,
  },
  menuButtonContent: {
    flexDirection: "row-reverse",
  },
  avgMoodValue: {
    fontWeight: "bold",
    color: "#bb86fc", // theme.colors.primary
  },
  pieChartContainer: {
    alignItems: "center",
  },
  lineChartContainer: {
    marginLeft: -10,
  },
  bottomSpacer: {
    height: 48,
  },
});
