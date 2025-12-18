import React, {useEffect, useState, useMemo} from 'react';
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
import alert from '@/components/alert';
import {isDesktop, isTablet} from '@/utils/responsive';

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
    alert('Delete Mood Log', 'Are you sure you want to delete this mood log?', [
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
    ]);
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

  // Responsive layout for the form
  const formLayout = useMemo(() => {
    const containerStyle = {
      flex: 1,
      maxWidth: isDesktop ? 800 : '100%',
      alignSelf: 'center' as const,
      width: '100%' as const,
      paddingHorizontal: isTablet ? 32 : 16,
    };

    const gridStyle = {
      flexDirection: isTablet ? ('row' as const) : ('column' as const),
      flexWrap: 'wrap' as const,
      gap: 16,
    };

    const sectionStyle = {
      flex: isTablet ? 1 : undefined,
      minWidth: isTablet ? 300 : ('100%' as const),
    };

    return {
      container: containerStyle,
      grid: gridStyle,
      section: sectionStyle,
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? (isTablet ? 90 : 64) : 0}>
      <View style={styles.container}>
        {showConfetti && <ConfettiCelebration isVisible={true} count={300} />}
        <ScrollView
          contentContainerStyle={[
            styles.scrollViewContent,
            {paddingBottom: isTablet ? 40 : 100},
          ]}
          keyboardShouldPersistTaps="handled">
          <View style={formLayout.container as any}>
            <View
              style={[styles.headerRow, {marginBottom: isTablet ? 32 : 24}]}>
              <View style={{flex: 1}}>
                <Text
                  variant={isTablet ? 'headlineLarge' : 'headlineMedium'}
                  style={[styles.title, {marginBottom: isTablet ? 12 : 8}]}>
                  {isEditing ? 'Update your entry' : 'How are you feeling?'}
                </Text>
                <Text
                  style={[
                    styles.dateLabel,
                    {
                      color: theme.colors.onSurfaceVariant,
                      fontSize: isTablet ? 16 : 14,
                    },
                  ]}>
                  {new Date(initialLog?.date || today).toLocaleDateString(
                    'en-US',
                    {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    },
                  )}
                </Text>
              </View>
              {isEditing && (
                <IconButton
                  icon="delete"
                  size={isTablet ? 28 : 24}
                  iconColor={theme.colors.error}
                  onPress={onDelete}
                  testID="delete-button"
                  style={{margin: 0, marginLeft: 8}}
                />
              )}
            </View>

            <View style={[formLayout.grid as any, {marginBottom: 16}]}>
              <View style={[styles.section, formLayout.section as any]}>
                <Text
                  variant="titleMedium"
                  style={[styles.label, {fontSize: isTablet ? 18 : 16}]}>
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
                          {
                            value: '1',
                            label: isTablet ? '😢' : '😢',
                            style: styles.moodButton,
                          },
                          {
                            value: '2',
                            label: isTablet ? '😕' : '😕',
                            style: styles.moodButton,
                          },
                          {
                            value: '3',
                            label: isTablet ? '😐' : '😐',
                            style: styles.moodButton,
                          },
                          ...(isTablet
                            ? []
                            : [
                                {
                                  value: '4',
                                  label: '🙂',
                                  style: styles.moodButton,
                                },
                              ]),
                          {
                            value: isTablet ? '4' : '5',
                            label: isTablet ? '🙂' : '🤩',
                            style: styles.moodButton,
                          },
                          ...(isTablet
                            ? [
                                {
                                  value: '5',
                                  label: '🤩',
                                  style: styles.moodButton,
                                },
                              ]
                            : []),
                        ]}
                        style={[styles.moodButtons, isTablet && {height: 48}]}
                        density={isTablet ? 'regular' : 'small'}
                      />
                    </View>
                  )}
                />
                {errors.moodRating && (
                  <HelperText type="error" style={{marginTop: 8}}>
                    {errors.moodRating.message}
                  </HelperText>
                )}
              </View>

              <View
                style={[
                  styles.section,
                  formLayout.section as any,
                  {flex: isTablet ? 1 : undefined},
                ]}>
                <Text
                  variant="titleMedium"
                  style={[styles.label, {fontSize: isTablet ? 18 : 16}]}>
                  Tags
                </Text>
                <View
                  style={[
                    styles.chipContainer,
                    {
                      justifyContent: isTablet ? 'flex-start' : 'center',
                      padding: isTablet ? 8 : 0,
                    },
                  ]}>
                  {AVAILABLE_TAGS.map(tag => (
                    <Chip
                      key={tag}
                      selected={selectedTags?.includes(tag)}
                      onPress={() => toggleTag(tag)}
                      showSelectedOverlay
                      style={[
                        styles.chip,
                        {
                          height: isTablet ? 40 : 36,
                          paddingHorizontal: isTablet ? 12 : 8,
                          margin: isTablet ? 4 : 2,
                        },
                      ]}
                      textStyle={{
                        fontSize: isTablet ? 15 : 14,
                      }}
                      selectedColor={theme.colors.primary}>
                      {tag}
                    </Chip>
                  ))}
                </View>
              </View>
            </View>

            <View style={[styles.section, {marginTop: isTablet ? 16 : 0}]}>
              <Text
                variant="titleMedium"
                style={[styles.label, {fontSize: isTablet ? 18 : 16}]}>
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
                    numberOfLines={isTablet ? 6 : 4}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={{
                      minHeight: isTablet ? 120 : 100,
                      fontSize: isTablet ? 16 : 15,
                      lineHeight: isTablet ? 24 : 22,
                    }}
                    outlineStyle={{
                      borderWidth: 1.5,
                      borderRadius: 12,
                    }}
                    theme={{
                      ...theme,
                      roundness: 12,
                    }}
                  />
                )}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={[
                styles.submitButton,
                {
                  marginTop: isTablet ? 24 : 16,
                  paddingVertical: isTablet ? 8 : 6,
                  borderRadius: 12,
                },
              ]}
              labelStyle={{
                fontSize: isTablet ? 16 : 15,
                paddingVertical: isTablet ? 6 : 4,
              }}
              contentStyle={{
                height: isTablet ? 50 : 44,
              }}>
              {isEditing ? 'Update Mood' : 'Save Mood'}
            </Button>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollViewContent: {
      flexGrow: 1,
      padding: 16,
      paddingBottom: 100, // Extra space for FAB/keyboard
      maxWidth: '100%',
    },
    container: {
      flex: 1,
      position: 'relative',
      backgroundColor: theme.colors.background,
      alignItems: 'center',
    },
    scrollContent: {
      padding: 16,
      width: '100%',
      maxWidth: 1200,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginTop: 8,
      width: '100%',
    },
    title: {
      flex: 1,
      textAlign: 'left',
      color: theme.colors.onBackground,
      fontWeight: '600',
    },
    dateLabel: {
      textAlign: 'left',
      opacity: 0.8,
    },
    section: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      width: '100%',
    },
    label: {
      marginBottom: 12,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    moodContainer: {
      width: '100%',
      paddingVertical: 4,
    },
    moodButtons: {
      height: 44,
      width: '100%',
    },
    moodButton: {
      flex: 1,
      minWidth: 0,
      paddingHorizontal: 4,
      justifyContent: 'center',
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    chip: {
      margin: 2,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    submitButton: {
      marginTop: 'auto',
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
  });
