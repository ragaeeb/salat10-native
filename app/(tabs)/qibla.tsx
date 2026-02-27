import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QiblaArrow } from '@/components/qibla/arrow';
import { QiblaInfoCard } from '@/components/qibla/info-card';
import { theme } from '@/constants/theme';
import { useNativeCompass } from '@/hooks/use-native-compass';
import {
    calculateHeadingStability,
    calculateQibla,
    calculateRelativeRotation,
    formatDirectionInstruction,
    isPointingAtQibla,
    smoothHeading,
} from '@/lib/qibla';
import { useNumericSettings } from '@/store/usePrayerStore';

export default function QiblaScreen() {
    const router = useRouter();
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const { heading: rawHeading, available: compassAvailable, error: compassError } = useNativeCompass();
    const { latitude, longitude } = useNumericSettings();

    const [smoothedHeading, setSmoothedHeading] = useState<number | null>(null);
    const headingHistory = useRef<number[]>([]);
    const wasAligned = useRef(false);

    const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);
    const qiblaBearing = hasCoords ? calculateQibla(latitude, longitude) : 0;

    useEffect(() => {
        if (rawHeading === null) return;

        setSmoothedHeading((prev) => {
            const newHeading = smoothHeading(prev, rawHeading, 0.15);

            headingHistory.current.push(newHeading);
            if (headingHistory.current.length > 30) {
                headingHistory.current = headingHistory.current.slice(-30);
            }

            return newHeading;
        });
    }, [rawHeading]);

    const relativeRotation = smoothedHeading !== null ? calculateRelativeRotation(qiblaBearing, smoothedHeading) : null;
    const isAligned = relativeRotation !== null && isPointingAtQibla(relativeRotation);
    const directionInstruction = relativeRotation !== null ? formatDirectionInstruction(relativeRotation) : '';
    const stability = calculateHeadingStability(headingHistory.current);

    useEffect(() => {
        if (isAligned && !wasAligned.current) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        wasAligned.current = isAligned;
    }, [isAligned]);

    if (!hasCoords) {
        return (
            <SafeAreaView style={styles.centered}>
                <Ionicons name="location-outline" size={64} color={theme.colors.white50} />
                <Text style={styles.messageTitle}>Location Required</Text>
                <Text style={styles.messageSubtitle}>
                    Please set your location in Settings to use the Qibla finder.
                </Text>
                <Pressable style={styles.setupButton} onPress={() => router.push('/settings')} accessibilityRole="button" accessibilityLabel="Open Settings">
                    <Ionicons name="settings-outline" size={18} color={theme.colors.primaryForeground} />
                    <Text style={styles.setupButtonText}>Open Settings</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    if (compassAvailable === false || compassError) {
        return (
            <SafeAreaView style={styles.centered}>
                <Ionicons name="warning-outline" size={64} color={theme.colors.yellow400} />
                <Text style={styles.messageTitle}>Compass Unavailable</Text>
                <Text style={styles.messageSubtitle}>
                    {compassError ?? 'The magnetometer is not available on this device.'}
                </Text>
            </SafeAreaView>
        );
    }

    if (compassAvailable === null) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.foreground} />
                <Text style={styles.messageSubtitle}>Initializing compass...</Text>
            </SafeAreaView>
        );
    }

    const showCamera = cameraPermission?.granted;

    return (
        <View style={styles.container}>
            {showCamera ? (
                <CameraView style={StyleSheet.absoluteFill} facing="back" />
            ) : (
                <View style={[StyleSheet.absoluteFill, styles.cameraFallback]} />
            )}

            {/* Camera permission request */}
            {!cameraPermission?.granted && (
                <View style={styles.permissionOverlay}>
                    <Pressable style={styles.permissionButton} onPress={requestCameraPermission}>
                        <Ionicons name="camera" size={20} color={theme.colors.primaryForeground} />
                        <Text style={styles.permissionButtonText}>Enable Camera for AR</Text>
                    </Pressable>
                    <Text style={styles.permissionHint}>
                        Camera is optional - the compass works without it
                    </Text>
                </View>
            )}

            {/* Arrow overlay */}
            <View style={styles.arrowOverlay}>
                <QiblaArrow rotation={relativeRotation ?? 0} isAligned={isAligned} />
            </View>

            {/* Alignment indicator */}
            {isAligned && (
                <View style={styles.alignedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.green500} />
                    <Text style={styles.alignedText}>Facing Qibla</Text>
                </View>
            )}

            {/* Info card */}
            <SafeAreaView edges={['bottom']} style={styles.infoContainer}>
                <QiblaInfoCard
                    qiblaBearing={qiblaBearing}
                    currentHeading={smoothedHeading}
                    relativeRotation={relativeRotation}
                    isAligned={isAligned}
                    directionInstruction={directionInstruction}
                    stability={stability}
                    latitude={latitude}
                    longitude={longitude}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    cameraFallback: {
        backgroundColor: '#000000',
    },
    centered: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        gap: theme.spacing.md,
    },
    messageTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: '700',
        color: theme.colors.foreground,
        textAlign: 'center',
    },
    messageSubtitle: {
        fontSize: theme.fontSize.base,
        color: theme.colors.white70,
        textAlign: 'center',
        lineHeight: 22,
    },
    setupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.full,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: theme.spacing.sm,
    },
    setupButtonText: {
        fontSize: theme.fontSize.base,
        fontWeight: '600',
        color: theme.colors.primaryForeground,
    },
    permissionOverlay: {
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 20,
        gap: 8,
    },
    permissionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: theme.radius.full,
    },
    permissionButtonText: {
        color: theme.colors.primaryForeground,
        fontWeight: '600',
        fontSize: theme.fontSize.base,
    },
    permissionHint: {
        color: theme.colors.white50,
        fontSize: theme.fontSize.sm,
    },
    arrowOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    alignedBadge: {
        position: 'absolute',
        top: 80,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.black70,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: theme.radius.full,
    },
    alignedText: {
        color: theme.colors.green500,
        fontSize: theme.fontSize.base,
        fontWeight: '700',
    },
    infoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: theme.spacing.md,
    },
});
