import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { type CompassQuality, qualityColor } from '@/lib/qibla';

type Props = {
    qiblaBearing: number;
    currentHeading: number | null;
    relativeRotation: number | null;
    isAligned: boolean;
    directionInstruction: string;
    stability: { text: string; quality: CompassQuality } | null;
    latitude: number;
    longitude: number;
};

export function QiblaInfoCard({
    qiblaBearing,
    currentHeading,
    relativeRotation,
    isAligned,
    directionInstruction,
    stability,
    latitude,
    longitude,
}: Props) {
    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.label}>Qibla Direction</Text>
                <Text style={[styles.value, { color: theme.colors.green400 }]}>{Math.round(qiblaBearing)}°</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Your Heading</Text>
                <Text style={styles.value}>
                    {currentHeading !== null ? `${Math.round(currentHeading)}°` : '—'}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Turn</Text>
                <Text style={[styles.value, isAligned && { color: theme.colors.green400 }]}>
                    {isAligned ? 'Aligned!' : directionInstruction}
                </Text>
            </View>

            {stability && (
                <View style={styles.row}>
                    <Text style={styles.label}>Compass</Text>
                    <Text style={[styles.value, { color: qualityColor(stability.quality) }]}>
                        {stability.text}
                    </Text>
                </View>
            )}

            <View style={styles.row}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.valueSmall}>
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.black70,
        borderRadius: theme.radius['2xl'],
        padding: theme.spacing.md,
        gap: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        color: theme.colors.white70,
        fontSize: theme.fontSize.sm,
    },
    value: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.base,
        fontWeight: '600',
    },
    valueSmall: {
        color: theme.colors.white70,
        fontSize: theme.fontSize.sm,
    },
});
