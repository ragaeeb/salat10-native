import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { type DailyResult, isFard, monthly } from '@/lib/calculator';
import { salatLabels } from '@/lib/constants';
import { useCalculationConfig } from '@/lib/prayer-utils';
import { useHasValidCoordinates } from '@/store/usePrayerStore';


const PRAYER_COLUMNS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
const COLUMN_LABELS: Record<string, string> = {
    fajr: 'Fajr',
    sunrise: 'Rise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Magh',
    isha: 'Isha',
};

export default function TimetableScreen() {
    const router = useRouter();
    const hasValidCoords = useHasValidCoordinates();
    const config = useCalculationConfig();
    const [monthOffset, setMonthOffset] = useState(0);

    const targetDate = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + monthOffset);
        return d;
    })();

    const schedule = hasValidCoords ? monthly(salatLabels, config, targetDate) : null;

    if (!hasValidCoords) {
        return (
            <SafeAreaView style={styles.centered}>
                <Ionicons name="calendar-outline" size={64} color={theme.colors.white50} />
                <Text style={styles.emptyTitle}>Set Your Location</Text>
                <Text style={styles.emptySubtitle}>
                    Set your location in Settings to view the prayer timetable.
                </Text>
                <Pressable style={styles.setupButton} onPress={() => router.push('/settings')} accessibilityRole="button" accessibilityLabel="Open Settings">
                    <Ionicons name="settings-outline" size={18} color={theme.colors.primaryForeground} />
                    <Text style={styles.setupButtonText}>Open Settings</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    const getTimeForEvent = (day: DailyResult, event: string): string => {
        const timing = day.timings.find((t) => t.event === event);
        return timing?.time ?? '—';
    };

    const renderHeader = () => (
        <View style={styles.headerRow}>
            <View style={styles.dateCol}>
                <Text style={styles.headerText}>Date</Text>
            </View>
            {PRAYER_COLUMNS.map((col) => (
                <View key={col} style={styles.timeCol}>
                    <Text style={[styles.headerText, isFard(col) && styles.headerTextBold]}>
                        {COLUMN_LABELS[col]}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderRow = ({ item, index }: { item: DailyResult; index: number }) => {
        const dayNum = item.dayOfMonth;
        const isToday = monthOffset === 0 && new Date().getDate() === dayNum;

        return (
            <View style={[styles.dataRow, isToday && styles.dataRowToday, index % 2 === 0 && styles.dataRowEven]}>
                <View style={styles.dateCol}>
                    <Text style={[styles.dateText, isToday && styles.dateTodayText]}>{String(dayNum)}</Text>
                </View>
                {PRAYER_COLUMNS.map((col) => (
                    <View key={col} style={styles.timeCol}>
                        <Text style={[styles.timeText, isToday && styles.timeTodayText]}>
                            {getTimeForEvent(item, col)}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Month navigation */}
            <View style={styles.monthNav}>
                <Pressable onPress={() => setMonthOffset((p) => p - 1)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Previous month">
                    <Ionicons name="chevron-back" size={24} color={theme.colors.foreground} />
                </Pressable>
                <Pressable onPress={() => setMonthOffset(0)} accessibilityRole="button" accessibilityLabel="Go to current month">
                    <Text style={styles.monthTitle}>{schedule?.label ?? ''}</Text>
                </Pressable>
                <Pressable onPress={() => setMonthOffset((p) => p + 1)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Next month">
                    <Ionicons name="chevron-forward" size={24} color={theme.colors.foreground} />
                </Pressable>
            </View>

            {renderHeader()}

            <FlatList
                data={schedule?.dates ?? []}
                renderItem={renderRow}
                keyExtractor={(item) => item.date}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centered: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        gap: theme.spacing.md,
    },
    emptyTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: '700',
        color: theme.colors.foreground,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: theme.fontSize.base,
        color: theme.colors.white70,
        textAlign: 'center',
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
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    monthTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: '700',
        color: theme.colors.foreground,
    },
    headerRow: {
        flexDirection: 'row',
        paddingHorizontal: 4,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.card,
    },
    dateCol: {
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 11,
        color: theme.colors.mutedForeground,
        fontWeight: '500',
    },
    headerTextBold: {
        color: theme.colors.foreground,
        fontWeight: '600',
    },
    dataRow: {
        flexDirection: 'row',
        paddingHorizontal: 4,
        paddingVertical: 7,
    },
    dataRowEven: {
        backgroundColor: theme.colors.white10,
    },
    dataRowToday: {
        backgroundColor: theme.colors.white10,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
    },
    dateText: {
        fontSize: 12,
        color: theme.colors.mutedForeground,
        fontWeight: '500',
    },
    dateTodayText: {
        color: theme.colors.foreground,
        fontWeight: '700',
    },
    timeText: {
        fontSize: 11,
        color: theme.colors.foreground,
    },
    timeTodayText: {
        fontWeight: '600',
    },
});
