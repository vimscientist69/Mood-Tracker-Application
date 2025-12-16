import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
  SegmentedButtons,
  HelperText,
  Chip,
  useTheme,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMoodLogs} from '../../hooks/useMoodLogs';

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
  const theme = useTheme();
  const {createLog, isCreating} = useMoodLogs();

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
      moodRating: 3,
      tags: [],
      note: '',
      date: today,
    },
  });

  const selectedTags = watch('tags');

  const onSubmit = (data: MoodLogFormValues) => {
    createLog(data, {
      onSuccess: () => {
        navigation.goBack();
      },
      onError: error => {
        console.error('Failed to log mood', error);
        // Toast or error handling would go here
      },
    });
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {backgroundColor: theme.colors.background},
        ]}>
        <Text variant="headlineMedium" style={styles.title}>
          How are you feeling?
        </Text>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.label}>
            Mood (1-5)
          </Text>
          <Controller
            control={control}
            name="moodRating"
            render={({field: {value, onChange}}) => (
              <SegmentedButtons
                value={String(value)}
                onValueChange={val => onChange(Number(val))}
                buttons={[
                  {value: '1', label: '😢'}, // 1 - Very Sad
                  {value: '2', label: '😕'}, // 2 - Sad
                  {value: '3', label: '😐'}, // 3 - Neutral
                  {value: '4', label: '🙂'}, // 4 - Happy
                  {value: '5', label: '🤩'}, // 5 - Very Happy
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
          loading={isCreating}
          disabled={isCreating}
          style={styles.submitButton}>
          Save Mood
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
  title: {
    textAlign: 'center',
    marginBottom: 24,
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
