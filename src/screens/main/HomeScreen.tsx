import React, { useMemo } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, FAB, useTheme, ActivityIndicator, Card } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { getMoodColor } from '../../utils/moodLogic';
import { BORDER_RADIUS } from '../../theme/styleConstants';

export const HomeScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const { logs, isLoading } = useMoodLogs();

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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View
            style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text
                        variant="headlineMedium"
                        style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                        Your Mood Calendar
                    </Text>
                    <Text
                        variant="bodyLarge"
                        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                        Track your journey, one day at a time.
                    </Text>
                </View>

                <Card
                    style={[
                        styles.calendarCard,
                        { backgroundColor: theme.colors.elevation.level1 },
                    ]}>
                    <Card.Content style={{ padding: 4 }}>
                        <Calendar
                            theme={{
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
                                    initialLog: existingLog || { date: day.dateString },
                                });
                            }}
                        />
                    </Card.Content>
                </Card>

                <View style={styles.statsContainer}>
                    {/* Placeholder for quick stats or streak if we had it computed here */}
                    <Card
                        style={[
                            styles.statCard,
                            { backgroundColor: theme.colors.elevation.level2 },
                        ]}>
                        <Card.Content>
                            <Text
                                variant="labelMedium"
                                style={{ color: theme.colors.onSurfaceVariant }}>
                                Total Logs
                            </Text>
                            <Text
                                variant="headlineMedium"
                                style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
                                {logs.length}
                            </Text>
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
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
    scrollContent: {
        padding: 16,
        paddingBottom: 80, // FAB space
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 24,
        marginTop: 8,
    },
    subtitle: {
        marginTop: 4,
        opacity: 0.8,
    },
    calendarCard: {
        borderRadius: BORDER_RADIUS.card,
        overflow: 'hidden',
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        borderRadius: BORDER_RADIUS.card,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
