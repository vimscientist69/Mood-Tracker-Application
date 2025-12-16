import React, { useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import {
    Button,
    Text,
    TextInput,
    SegmentedButtons,
    HelperText,
    Chip,
    useTheme,
    IconButton,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { MoodLogDocument } from '../../types/firestore';

// Define the schema for the mood log
const moodLogSchema = z.object({
    moodRating: z.number().min(1).max(5),
    tags: z.array(z.string()),
    note: z.string().optional(),
    date: z.string(), // ISO date string YYYY-MM-DD
});

type MoodLogFormValues = {
    moodRating: number;
    tags: string[];
    note?: string;
    date: string;
};

// Common tags for the user to select
const AVAILABLE_TAGS = [
    'Happy',
    'Sad',
    'Excited',
    'Tired',
    'Anxious',
    'Productive',
    'Relaxed',
    'Stressed',
];

export const LogMoodScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const theme = useTheme();

    // Check if we are editing an existing log
    const initialLog = route.params?.initialLog as MoodLogDocument | undefined;
    const isEditing = !!initialLog?.moodRating; // If moodRating exists, it's a full log, otherwise it might just be a date object or null

    const {
        createLog,
        isCreating,
        updateLog,
        isUpdating,
        deleteLog,
        isDeleting
    } = useMoodLogs();

    const today = new Date().toISOString().split('T')[0];

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MoodLogFormValues>({
        resolver: zodResolver(moodLogSchema),
        defaultValues: {
            moodRating: initialLog?.moodRating || 3,
            tags: initialLog?.tags || [],
            note: initialLog?.note || '',
            date: initialLog?.date || today,
        },
    });

    const selectedTags = watch('tags');

    // Set navigation options (title) dynamically
    useEffect(() => {
        navigation.setOptions({
            title: isEditing ? 'Edit Mood' : 'Log Mood',
        });
    }, [navigation, isEditing]);

    const onSubmit = (data: MoodLogFormValues) => {
        if (isEditing) {
            updateLog(data, {
                onSuccess: () => {
                    navigation.goBack();
                },
                onError: error => {
                    console.error('Failed to update mood', error);
                }
            });
        } else {
            createLog(data, {
                onSuccess: () => {
                    navigation.goBack();
                },
                onError: error => {
                    console.error('Failed to log mood', error);
                },
            });
        }
    };

    const onDelete = () => {
        Alert.alert(
            'Delete Mood Log',
            'Are you sure you want to delete this mood log?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        if (initialLog?.date) {
                            deleteLog(initialLog.date, {
                                onSuccess: () => navigation.goBack(),
                            });
                        }
                    },
                },
            ],
        );
    };

    const toggleTag = (tag: string) => {
        const currentTags = selectedTags || [];
        if (currentTags.includes(tag)) {
            setValue(
                'tags',
                currentTags.filter(t => t !== tag),
            );
        } else {
            setValue('tags', [...currentTags, tag]);
        }
    };

    const isLoading = isCreating || isUpdating || isDeleting;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}>
            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}>

                <View style={styles.headerRow}>
                    <Text variant="headlineMedium" style={styles.title}>
                        {isEditing ? 'Update your entry' : 'How are you feeling?'}
                    </Text>
                    {isEditing && (
                        <IconButton
                            icon="delete"
                            iconColor={theme.colors.error}
                            onPress={onDelete}
                            testID="delete-button"
                        />
                    )}
                </View>

                <Text style={styles.dateLabel}>Date: {initialLog?.date || today}</Text>

                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.label}>
                        Mood (1-5)
                    </Text>
                    <Controller
                        control={control}
                        name="moodRating"
                        render={({ field: { value, onChange } }) => (
                            <SegmentedButtons
                                value={String(value)}
                                onValueChange={val => onChange(Number(val))}
                                buttons={[
                                    { value: '1', label: '😢' }, // 1 - Very Sad
                                    { value: '2', label: '😕' }, // 2 - Sad
                                    { value: '3', label: '😐' }, // 3 - Neutral
                                    { value: '4', label: '🙂' }, // 4 - Happy
                                    { value: '5', label: '🤩' }, // 5 - Very Happy
                                ]}
                            />
                        )}
                    />
                    {errors.moodRating && (
                        <HelperText type="error">{errors.moodRating.message}</HelperText>
                    )}
                </View>

                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.label}>
                        Tags
                    </Text>
                    <View style={styles.chipContainer}>
                        {AVAILABLE_TAGS.map(tag => (
                            <Chip
                                key={tag}
                                selected={selectedTags?.includes(tag)}
                                onPress={() => toggleTag(tag)}
                                showSelectedOverlay
                                style={styles.chip}>
                                {tag}
                            </Chip>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.label}>
                        Note
                    </Text>
                    <Controller
                        control={control}
                        name="note"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                mode="outlined"
                                placeholder="Write a thought..."
                                multiline
                                numberOfLines={4}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />
                </View>

                <Button
                    mode="contained"
                    onPress={handleSubmit(onSubmit)}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.submitButton}>
                    {isEditing ? 'Update Mood' : 'Save Mood'}
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        padding: 24,
        flexGrow: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        flex: 1,
        textAlign: 'center',
    },
    dateLabel: {
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.6,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        marginBottom: 12,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        marginBottom: 8,
    },
    submitButton: {
        marginTop: 'auto',
        paddingVertical: 8,
    },
});
