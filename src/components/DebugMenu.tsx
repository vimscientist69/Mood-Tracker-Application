import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Animated,
    Pressable,
    ActivityIndicator,
    Dimensions,
    Platform,
    Easing,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useQueryClient } from '@tanstack/react-query';
import { deleteAllMoodData, populateRandomMoodData } from '../utils/debugUtils';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '../theme/styleConstants';
import { useAppTheme } from '../context/ThemeContext';
import alert from './alert';

interface DebugMenuProps {
    visible: boolean;
    onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

/**
 * Debug menu modal that slides up from the bottom
 * Only available in development builds
 */
export const DebugMenu: React.FC<DebugMenuProps> = ({ visible, onClose }) => {
    const { theme } = useAppTheme();
    const { userId } = useAuth();
    const queryClient = useQueryClient();
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPopulating, setIsPopulating] = useState(false);

    useEffect(() => {
        if (visible) {
            // Slide up with timing animation
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        } else {
            // Slide down with timing animation
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    const handleDeleteAllData = () => {
        alert(
            'Delete All Mood Data',
            'Are you sure you want to delete ALL mood data? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!userId) {
                            alert('Error', 'No user ID found');
                            return;
                        }

                        setIsDeleting(true);
                        try {
                            await deleteAllMoodData(userId);
                            // Invalidate queries to refresh UI
                            queryClient.invalidateQueries({ queryKey: ['mood_logs'] });
                            alert('Success', 'All mood data has been deleted');
                            onClose();
                        } catch (error) {
                            const errorMessage =
                                error instanceof Error ? error.message : String(error);
                            alert('Error', `Failed to delete mood data: ${errorMessage}`);
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ],
        );
    };

    const handlePopulateData = async () => {
        if (!userId) {
            alert('Error', 'No user ID found');
            return;
        }

        setIsPopulating(true);
        try {
            const count = await populateRandomMoodData(userId);
            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['mood_logs'] });
            alert('Success', `Created ${count} random mood entries`);
            onClose();
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            alert('Error', `Failed to populate mood data: ${errorMessage}`);
        } finally {
            setIsPopulating(false);
        }
    };

    if (!visible) {
        return null;
    }

    const styles = getStyles(theme);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <Pressable
                style={styles.backdrop}
                onPress={onClose}>
                <Animated.View
                    style={[
                        styles.modal,
                        {
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                    onStartShouldSetResponder={() => true}>
                    <View style={styles.header}>
                        <View style={styles.dragHandle} />
                        <Text style={styles.title}>Debug Menu</Text>
                        <Text style={styles.subtitle}>Development Tools</Text>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Data Management</Text>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    isPopulating && { opacity: 0.7 },
                                    pressed && { opacity: 0.8 }
                                ]}
                                onPress={handlePopulateData}
                                disabled={isPopulating}>
                                {isPopulating ? (
                                    <ActivityIndicator color={theme.colors.onPrimary} style={styles.buttonIcon} />
                                ) : (
                                    <Text style={styles.buttonIcon}>📊</Text>
                                )}
                                <Text style={styles.buttonText}>
                                    {isPopulating ? 'Generating...' : 'Generate Test Data'}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    styles.buttonDanger,
                                    isDeleting && { opacity: 0.7 },
                                    pressed && { opacity: 0.8 }
                                ]}
                                onPress={handleDeleteAllData}
                                disabled={isDeleting}>
                                {isDeleting ? (
                                    <ActivityIndicator color={theme.colors.onError} style={styles.buttonIcon} />
                                ) : (
                                    <Text style={styles.buttonIcon}>🗑️</Text>
                                )}
                                <Text style={styles.buttonText}>
                                    {isDeleting ? 'Deleting...' : 'Delete All Data'}
                                </Text>
                            </Pressable>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>App State</Text>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    { backgroundColor: theme.colors.secondary },
                                    pressed && { opacity: 0.8 }
                                ]}
                                onPress={() => queryClient.invalidateQueries()}
                            >
                                <Text style={styles.buttonIcon}>🔄</Text>
                                <Text style={styles.buttonText}>Force Refresh</Text>
                            </Pressable>
                        </View>
                    </View>

                    <Text style={styles.infoText}>
                        User ID: {userId?.substring(0, 8)}...
                    </Text>
                </Animated.View>
            </Pressable>
        </Modal>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: theme.colors.backdrop || 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: BORDER_RADIUS.large,
        borderTopRightRadius: BORDER_RADIUS.large,
        padding: SPACING.md,
        paddingTop: SPACING.lg,
        paddingBottom: Platform.OS === 'ios' ? SPACING.xxl : SPACING.lg,
        maxHeight: '85%',
        shadowColor: theme.colors.shadow || '#000',
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: theme.dark ? 0.3 : 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.outline,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.outlineVariant,
        borderRadius: 2,
        marginBottom: SPACING.md,
        alignSelf: 'center',
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
        color: theme.colors.onSurface,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
    },
    content: {
        paddingVertical: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        marginBottom: SPACING.md,
        color: theme.colors.onSurface,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.standard,
        marginBottom: SPACING.sm,
        backgroundColor: theme.colors.primary,
    },
    buttonDanger: {
        backgroundColor: theme.colors.error,
    },
    buttonIcon: {
        fontSize: 20,
        marginRight: SPACING.md,
        color: theme.colors.onPrimary,
    },
    buttonText: {
        color: theme.colors.onPrimary,
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
    },
    infoText: {
        fontSize: FONT_SIZES.sm,
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginTop: SPACING.sm,
        fontStyle: 'italic',
    },
});
