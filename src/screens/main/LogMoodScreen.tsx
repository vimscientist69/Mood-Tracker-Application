import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
  SegmentedButtons,
  HelperText,
  Chip,
  IconButton,
} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAppTheme} from '../../context/ThemeContext';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMoodLogs} from '../../hooks/useMoodLogs';
import {MoodLogDocument} from '../../types/firestore';
import {ConfettiCelebration} from '../../components/animations/ConfettiCelebration';

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
  const {theme} = useAppTheme();
  const [showConfetti, setShowConfetti] = useState(false);

  // Check if we are editing an existing log
  const initialLog = route.params?.initialLog as MoodLogDocument | undefined;
  const isEditing = !!initialLog?.moodRating; // If moodRating exists, it's a full log, otherwise it might just be a date object or null

  const {createLog, isCreating, updateLog, isUpdating, deleteLog, isDeleting} =
    useMoodLogs();

  const today = new Date().toISOString().split('T')[0];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {errors},
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
    const handleSuccess = () => {
      // Show confetti for high mood ratings (4 or 5)
      if (data.moodRating >= 4) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          navigation.goBack();
        }, 5000);
      } else {
        navigation.goBack();
      }
    };

    if (isEditing) {
      updateLog(data, {
        onSuccess: handleSuccess,
        onError: error => {
          console.error('Failed to update mood', error);
        },
      });
    } else {
      createLog(data, {
        onSuccess: handleSuccess,
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
        {text: 'Cancel', style: 'cancel'},
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

  const styles = getStyles(theme);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <View style={styles.container}>
        {showConfetti && <ConfettiCelebration isVisible={true} count={300} />}
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled">
        <View style={[styles.headerRow, { marginBottom: 24 }]}>
          <View style={{ flex: 1 }}>
            <Text variant="headlineMedium" style={[styles.title, { marginBottom: 8 }]}>
              {isEditing ? 'Update your entry' : 'How are you feeling?'}
            </Text>
            <Text style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>
              {new Date(initialLog?.date || today).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          {isEditing && (
            <IconButton
              icon="delete"
              iconColor={theme.colors.error}
              onPress={onDelete}
              testID="delete-button"
              style={{ margin: 0, marginLeft: 8 }}
            />
          )}
        </View>


        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.label}>
            Mood (1-5)
          </Text>
            <Controller
              control={control}
              name="moodRating"
              render={({field: {value, onChange}}) => (
                <View style={styles.moodContainer}>
                  <SegmentedButtons
                    value={String(value)}
                    onValueChange={val => onChange(Number(val))}
                    buttons={[
                      {value: '1', label: '😢', style: styles.moodButton}, // 1 - Very Sad
                      {value: '2', label: '😕', style: styles.moodButton}, // 2 - Sad
                      {value: '3', label: '😐', style: styles.moodButton}, // 3 - Neutral
                      {value: '4', label: '🙂', style: styles.moodButton}, // 4 - Happy
                      {value: '5', label: '🤩', style: styles.moodButton}, // 5 - Very Happy
                    ]}
                    style={styles.moodButtons}
                  />
                </View>
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
            render={({field: {onChange, onBlur, value}}) => (
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
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100, // Extra space for FAB/keyboard
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  title: {
    flex: 1,
    textAlign: 'left',
    color: theme.colors.onBackground,
  },
  dateLabel: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
  },
  section: {
    marginBottom: 32,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  label: {
    marginBottom: 12,
  },
  moodContainer: {
    width: '100%',
    paddingVertical: 8,
  },
  moodButtons: {
    height: 44,
  },
  moodButton: {
    flex: 1,
    minWidth: 0, // Allow buttons to shrink below their content size
    paddingHorizontal: 2, // Add some horizontal padding between buttons
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
