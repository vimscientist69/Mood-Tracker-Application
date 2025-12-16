import React, { useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import {
    Text,
    useTheme,
    ActivityIndicator,
    Card,
    Chip,
    Menu,
    Button,
    Divider,
} from 'react-native-paper';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { format, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MOOD_COLORS_MAP } from '../../utils/moodLogic';
import {
    TimeRange,
    filterLogsByDate,
    calculateMoodCounts,
    calculateAverageMood,
    calculateTopTags,
} from '../../utils/analyticsLogic';
import { FONT_SIZES, BORDER_RADIUS, CHART } from '../../theme/styleConstants';

const SCREEN_WIDTH = Dimensions.get('window').width;

const RANGE_LABELS: Record<TimeRange, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '3m': 'Last 3 Months',
    '6m': 'Last 6 Months',
    '1y': 'Last Year',
    all: 'All Time',
};

export const AnalyticsScreen = () => {
    const theme = useTheme();
    const { logs, isLoading } = useMoodLogs();
    const [range, setRange] = useState<TimeRange>('7d');
    const [menuVisible, setMenuVisible] = useState(false);

    // Helper to filter logs by range
    const filteredLogs = useMemo(() => {
        return filterLogsByDate(logs, range);
    }, [logs, range]);

    // pie chart data: Mood Distribution
    const pieData = useMemo(() => {
        const counts = calculateMoodCounts(filteredLogs);
        const total = filteredLogs.length;
        if (total === 0) {
            return [];
        }

        // Using simple labels or legend instead of on-chart text if plain looking
        return [
            { value: counts[1], color: MOOD_COLORS_MAP[1], label: '😢' },
            { value: counts[2], color: MOOD_COLORS_MAP[2], label: '😕' },
            { value: counts[3], color: MOOD_COLORS_MAP[3], label: '😐' },
            { value: counts[4], color: MOOD_COLORS_MAP[4], label: '🙂' },
            { value: counts[5], color: MOOD_COLORS_MAP[5], label: '🤩' },
        ].filter(item => item.value > 0);
    }, [filteredLogs]);

    // line chart data: Mood History
    const lineData = useMemo(() => {
        const sorted = [...filteredLogs].sort((a, b) =>
            a.date.localeCompare(b.date),
        );

        return sorted.map(log => ({
            value: log.moodRating,
            label: format(parseISO(log.date), 'dd/MM'),
            dataPointText: '', // Remove text from points for cleaner look
            labelTextStyle: { color: theme.colors.onSurfaceVariant, fontSize: FONT_SIZES.xs },
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

    const renderLegend = () => {
        const moods = [
            { label: 'Very Sad', icon: '😢', color: '#FF5252' },
            { label: 'Sad', icon: '😕', color: '#FFB74D' },
            { label: 'Neutral', icon: '😐', color: '#FFEB3B' },
            { label: 'Happy', icon: '🙂', color: '#9CCC65' },
            { label: 'Very Happy', icon: '🤩', color: '#66BB6A' },
        ];
        return (
            <View style={styles.legendContainer}>
                {moods.map((m, i) => (
                    <View key={i} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: m.color }]} />
                        <Text style={{ fontSize: FONT_SIZES.sm, color: theme.colors.onSurfaceVariant }}>
                            {m.icon}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.headerRow}>
                <Text
                    variant="headlineMedium"
                    style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    Analytics
                </Text>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setMenuVisible(true)}
                            icon="calendar"
                            contentStyle={{ flexDirection: 'row-reverse' }}>
                            {RANGE_LABELS[range]}
                        </Button>
                    }>
                    {(Object.keys(RANGE_LABELS) as TimeRange[]).map(key => (
                        <Menu.Item
                            key={key}
                            onPress={() => {
                                setRange(key);
                                setMenuVisible(false);
                            }}
                            title={RANGE_LABELS[key]}
                        />
                    ))}
                </Menu>
            </View>

            <View style={styles.statsRow}>
                <Card
                    style={[
                        styles.statCard,
                        { backgroundColor: theme.colors.elevation.level2 },
                    ]}>
                    <Card.Content style={styles.statContent}>
                        <Text
                            variant="labelMedium"
                            style={{ color: theme.colors.onSurfaceVariant }}>
                            Entries
                        </Text>
                        <Text
                            variant="displaySmall"
                            style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
                            {filteredLogs.length}
                        </Text>
                    </Card.Content>
                </Card>
                <Card
                    style={[
                        styles.statCard,
                        { backgroundColor: theme.colors.elevation.level2 },
                    ]}>
                    <Card.Content style={styles.statContent}>
                        <Text
                            variant="labelMedium"
                            style={{ color: theme.colors.onSurfaceVariant }}>
                            Avg Mood
                        </Text>
                        <Text
                            variant="displaySmall"
                            style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                            {averageMood}
                        </Text>
                    </Card.Content>
                </Card>
            </View>

            <Card
                style={[
                    styles.chartCard,
                    { backgroundColor: theme.colors.elevation.level1 },
                ]}>
                <Card.Title title="Mood Distribution" titleStyle={styles.cardTitle} />
                <Card.Content style={styles.chartContent}>
                    {pieData.length > 0 ? (
                        <View style={{ alignItems: 'center' }}>
                            <PieChart
                                data={pieData}
                                donut
                                radius={CHART.pieRadius}
                                innerRadius={CHART.pieInnerRadius}
                                // showText // Removing text from chart for cleaner look
                                // labelsPosition="outward"
                                focusOnPress
                                backgroundColor={theme.colors.elevation.level1}
                            />
                            {renderLegend()}
                        </View>
                    ) : (
                        <Text style={styles.noDataText}>No data for this period.</Text>
                    )}
                </Card.Content>
            </Card>

            <Card
                style={[
                    styles.chartCard,
                    { backgroundColor: theme.colors.elevation.level1 },
                ]}>
                <Card.Title title="Mood History" titleStyle={styles.cardTitle} />
                <Card.Content>
                    {lineData.length > 0 ? (
                        <View style={{ marginLeft: -10 }}>
                            <LineChart
                                data={lineData}
                                height={220}
                                width={SCREEN_WIDTH - 60}
                                spacing={40}
                                initialSpacing={20}
                                color={theme.colors.primary}
                                thickness={CHART.lineThickness}
                                dataPointsColor={theme.colors.primary}
                                dataPointsRadius={CHART.dataPointRadius}
                                textColor={theme.colors.onSurface} // Fix for dark mode text
                                xAxisColor={theme.colors.outline}
                                yAxisColor={theme.colors.outline}
                                noOfSections={5}
                                maxValue={5}
                                yAxisTextStyle={{ color: theme.colors.onSurfaceVariant }}
                                xAxisLabelTextStyle={{
                                    color: theme.colors.onSurfaceVariant,
                                    fontSize: FONT_SIZES.xs,
                                }}
                                isAnimated
                                curved
                                startFillColor={theme.colors.primary}
                                endFillColor={theme.colors.primary}
                                startOpacity={0.2}
                                endOpacity={0.0}
                                areaChart
                            />
                        </View>
                    ) : (
                        <Text style={styles.noDataText}>No data for this period.</Text>
                    )}
                </Card.Content>
            </Card>

            <Card
                style={[
                    styles.chartCard,
                    { backgroundColor: theme.colors.elevation.level1 },
                ]}>
                <Card.Title title="Top Feelings" titleStyle={styles.cardTitle} />
                <Card.Content>
                    <View style={styles.tagsContainer}>
                        {topTags.length > 0 ? (
                            topTags.map(({ tag, count }) => (
                                <Chip key={tag} style={styles.tagChip} mode="outlined">
                                    {tag} • {count}
                                </Chip>
                            ))
                        ) : (
                            <Text style={styles.noDataText}>No tags recorded.</Text>
                        )}
                    </View>
                </Card.Content>
            </Card>

            <View style={{ height: 48 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 8,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        borderRadius: BORDER_RADIUS.card,
    },
    statContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    chartCard: {
        marginBottom: 24,
        borderRadius: BORDER_RADIUS.card,
        overflow: 'hidden', // prevent bleed
    },
    cardTitle: {
        fontWeight: 'bold',
        opacity: 0.9,
    },
    chartContent: {
        alignItems: 'center',
        paddingBottom: 16,
    },
    noDataText: {
        textAlign: 'center',
        opacity: 0.5,
        marginVertical: 24,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    tagChip: {
        marginBottom: 4,
        borderRadius: BORDER_RADIUS.large,
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: BORDER_RADIUS.small,
        marginRight: 4,
    },
});
