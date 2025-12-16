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
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useQueryClient } from '@tanstack/react-query';
import Alert from '@blazejkustra/react-native-alert';
import { deleteAllMoodData, populateRandomMoodData } from '../utils/debugUtils';
import {
    BORDER_RADIUS,
    FONT_SIZES,
    SPACING,
} from '../theme/styleConstants';

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
    const { userId } = useAuth();
    const queryClient = useQueryClient();
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPopulating, setIsPopulating] = useState(false);

    useEffect(() => {
        if (visible) {
            // Slide up
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            // Slide down
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    const handleDeleteAllData = () => {
        Alert.alert(
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
                            Alert.alert('Error', 'No user ID found');
                            return;
                        }

                        setIsDeleting(true);
                        try {
                            await deleteAllMoodData(userId);
                            // Invalidate queries to refresh UI
                            queryClient.invalidateQueries({ queryKey: ['mood_logs'] });
                            Alert.alert('Success', 'All mood data has been deleted');
                            onClose();
                        } catch (error) {
                            const errorMessage =
                                error instanceof Error ? error.message : String(error);
                            Alert.alert('Error', `Failed to delete mood data: ${errorMessage}`);
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
            Alert.alert('Error', 'No user ID found');
            return;
        }

        setIsPopulating(true);
        try {
            const count = await populateRandomMoodData(userId);
            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['mood_logs'] });
            Alert.alert('Success', `Created ${count} random mood entries`);
            onClose();
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            Alert.alert('Error', `Failed to populate mood data: ${errorMessage}`);
        } finally {
            setIsPopulating(false);
        }
    };

    if (!visible) {
        return null;
    }

    return (
        <Modal transparent visible={visible} animationType="none">
            {/* Backdrop */}
            <Pressable style={styles.backdrop} onPress={onClose}>
                <View style={styles.backdropOverlay} />
            </Pressable>

            {/* Menu Content */}
            <Animated.View
                style={[
                    styles.menuContainer,
                    {
                        transform: [{ translateY: slideAnim }],
                    },
                ]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.dragHandle} />
                    <Text style={styles.title}>🛠️ Debug Menu</Text>
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </Pressable>
                </View>

                {/* Buttons */}
                <View style={styles.content}>
                    <Text style={styles.subtitle}>Development Tools</Text>

                    {/* Delete All Data Button */}
                    <Pressable
                        style={[
                            styles.button,
                            styles.deleteButton,
                            isDeleting && styles.buttonDisabled,
                        ]}
                        onPress={handleDeleteAllData}
                        disabled={isDeleting || isPopulating}>
                        {isDeleting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.buttonIcon}>🗑️</Text>
                                <Text style={styles.buttonText}>Delete All Mood Data</Text>
                            </>
                        )}
                    </Pressable>

                    {/* Populate Random Data Button */}
                    <Pressable
                        style={[
                            styles.button,
                            styles.populateButton,
                            isPopulating && styles.buttonDisabled,
                        ]}
                        onPress={handlePopulateData}
                        disabled={isDeleting || isPopulating}>
                        {isPopulating ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.buttonIcon}>📊</Text>
                                <Text style={styles.buttonText}>Populate Random Data</Text>
                            </>
                        )}
                    </Pressable>

                    <Text style={styles.infoText}>
                        Random data will populate ~75% of days in the past year
                    </Text>
                </View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdropOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#666',
        borderRadius: 2,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: 16,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    subtitle: {
        fontSize: 14,
        color: '#999',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 12,
        minHeight: 56,
    },
    deleteButton: {
        backgroundColor: '#DC2626',
    },
    populateButton: {
        backgroundColor: '#2563EB',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
});
