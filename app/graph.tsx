import { Ionicons } from '@expo/vector-icons';
import { matchFont } from '@shopify/react-native-skia';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartesianChart, Line } from 'victory-native';
import { CalendarPicker } from '@/components/calendar-picker';
import { theme } from '@/constants/theme';
import { daily } from '@/lib/calculator';
import { getColorFor } from '@/lib/colors';
import { salatLabels } from '@/lib/constants';
import { formatMinutesLabel } from '@/lib/formatting';
import { useCalculationConfig } from '@/lib/prayer-utils';
import { useHasValidCoordinates } from '@/store/usePrayerStore';

type PrayerEvent = keyof typeof salatLabels;

const SELECTABLE_EVENTS: { event: PrayerEvent; label: string }[] = [
    { event: 'fajr', label: 'Fajr' },
    { event: 'sunrise', label: 'Sunrise' },
    { event: 'dhuhr', label: 'Dhuhr' },
    { event: 'asr', label: 'Asr' },
    { event: 'maghrib', label: 'Maghrib' },
    { event: 'isha', label: 'Isha' },
];

const dateToMinutes = (date: Date): number => {
    return date.getHours() * 60 + date.getMinutes();
};

const formatShortDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDateLabel = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDefaultFrom = (): Date => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getDefaultTo = (): Date => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(0, 0, 0, 0);
    return d;
};

const chartFont = matchFont({ fontSize: 11, fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }) });

export default function GraphScreen() {
    const router = useRouter();
    const hasValidCoords = useHasValidCoordinates();
    const config = useCalculationConfig();
    const [selectedEvent, setSelectedEvent] = useState<PrayerEvent>('fajr');
    const [fromDate, setFromDate] = useState<Date>(getDefaultFrom);
    const [toDate, setToDate] = useState<Date>(getDefaultTo);
    const [showEventPicker, setShowEventPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(null);

    const chartData = useMemo(() => {
        if (!hasValidCoords) return [];

        const data: { x: number; y: number; dateLabel: string }[] = [];
        const current = new Date(fromDate);
        let index = 0;

        while (current <= toDate) {
            const result = daily(salatLabels, config, current);
            const timing = result.timings.find((t) => t.event === selectedEvent);
            const minutes = timing ? dateToMinutes(timing.value) : 0;
            data.push({ x: index, y: minutes, dateLabel: formatShortDate(current) });
            current.setDate(current.getDate() + 1);
            index++;
        }

        return data;
    }, [hasValidCoords, config, fromDate, toDate, selectedEvent]);

    const xTickLabels = useMemo(() => {
        const map: Record<number, string> = {};
        for (const d of chartData) {
            map[d.x] = d.dateLabel;
        }
        return map;
    }, [chartData]);

    const color = getColorFor(selectedEvent, 0);
    const selectedEventLabel = SELECTABLE_EVENTS.find((e) => e.event === selectedEvent)?.label ?? 'Fajr';

    const handleSelectEvent = useCallback((event: PrayerEvent) => {
        setSelectedEvent(event);
        setShowEventPicker(false);
    }, []);

    const handleFromSelect = useCallback((date: Date) => {
        setFromDate(date);
        if (date > toDate) {
            const newTo = new Date(date);
            newTo.setMonth(newTo.getMonth() + 1, 0);
            setToDate(newTo);
        }
    }, [toDate]);

    const handleToSelect = useCallback((date: Date) => {
        setToDate(date);
        if (date < fromDate) {
            const newFrom = new Date(date);
            newFrom.setDate(1);
            setFromDate(newFrom);
        }
    }, [fromDate]);

    const handleThisMonth = useCallback(() => {
        setFromDate(getDefaultFrom());
        setToDate(getDefaultTo());
    }, []);

    const handleNext3Months = useCallback(() => {
        const from = new Date();
        from.setHours(0, 0, 0, 0);
        const to = new Date();
        to.setMonth(to.getMonth() + 3);
        to.setHours(0, 0, 0, 0);
        setFromDate(from);
        setToDate(to);
    }, []);

    const handleFullYear = useCallback(() => {
        const from = new Date();
        from.setMonth(0, 1);
        from.setHours(0, 0, 0, 0);
        const to = new Date();
        to.setMonth(11, 31);
        to.setHours(0, 0, 0, 0);
        setFromDate(from);
        setToDate(to);
    }, []);

    if (!hasValidCoords) {
        return (
            <SafeAreaView style={styles.centered}>
                <Ionicons name="stats-chart-outline" size={64} color={theme.colors.white50} />
                <Text style={styles.emptyTitle}>Set Your Location</Text>
                <Text style={styles.emptySubtitle}>
                    Set your location in Settings to view prayer time trends.
                </Text>
                <Pressable style={styles.setupButton} onPress={() => router.push('/settings')} accessibilityRole="button" accessibilityLabel="Open Settings">
                    <Ionicons name="settings-outline" size={18} color={theme.colors.primaryForeground} />
                    <Text style={styles.setupButtonText}>Open Settings</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
                    <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
                </Pressable>
                <Text style={styles.headerTitle}>Prayer Trends</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Date range row */}
            <View style={styles.controlsRow}>
                <Pressable style={styles.dateButton} onPress={() => setShowDatePicker('from')}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.white70} />
                    <Text style={styles.dateButtonText}>{formatDateLabel(fromDate)}</Text>
                </Pressable>
                <Text style={styles.dateSeparator}>→</Text>
                <Pressable style={styles.dateButton} onPress={() => setShowDatePicker('to')}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.white70} />
                    <Text style={styles.dateButtonText}>{formatDateLabel(toDate)}</Text>
                </Pressable>
            </View>

            {/* Quick range presets + event picker */}
            <View style={styles.controlsRow}>
                <View style={styles.presetsRow}>
                    <Pressable style={styles.presetChip} onPress={handleThisMonth}>
                        <Text style={styles.presetText}>This Month</Text>
                    </Pressable>
                    <Pressable style={styles.presetChip} onPress={handleNext3Months}>
                        <Text style={styles.presetText}>Next 3M</Text>
                    </Pressable>
                    <Pressable style={styles.presetChip} onPress={handleFullYear}>
                        <Text style={styles.presetText}>Full Year</Text>
                    </Pressable>
                </View>

                <Pressable style={styles.dropdownButton} onPress={() => setShowEventPicker(true)}>
                    <View style={[styles.colorDot, { backgroundColor: color }]} />
                    <Text style={styles.dropdownText}>{selectedEventLabel}</Text>
                    <Ionicons name="chevron-down" size={14} color={theme.colors.white70} />
                </Pressable>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                {chartData.length > 0 && (
                    <CartesianChart
                        data={chartData}
                        xKey="x"
                        yKeys={['y']}
                        domainPadding={{ top: 20, bottom: 20, left: 10, right: 10 }}
                        axisOptions={{
                            font: chartFont,
                            tickCount: { x: 5, y: 6 },
                            formatXLabel: (val) => {
                                const idx = Math.round(val as number);
                                return xTickLabels[idx] ?? '';
                            },
                            formatYLabel: (val) => formatMinutesLabel(val as number),
                            labelColor: theme.colors.mutedForeground,
                            lineColor: { grid: theme.colors.white10, frame: theme.colors.border },
                            labelOffset: { x: 4, y: 8 },
                        }}
                    >
                        {({ points }) => (
                            <Line
                                points={points.y}
                                color={color}
                                strokeWidth={2.5}
                                curveType="natural"
                            />
                        )}
                    </CartesianChart>
                )}
            </View>

            {/* Calendar date pickers */}
            <CalendarPicker
                visible={showDatePicker === 'from'}
                title="Start Date"
                value={fromDate}
                onSelect={handleFromSelect}
                onClose={() => setShowDatePicker(null)}
            />
            <CalendarPicker
                visible={showDatePicker === 'to'}
                title="End Date"
                value={toDate}
                onSelect={handleToSelect}
                onClose={() => setShowDatePicker(null)}
            />

            {/* Event picker modal */}
            <Modal visible={showEventPicker} transparent animationType="fade" onRequestClose={() => setShowEventPicker(false)}>
                <Pressable style={styles.modalBackdrop} onPress={() => setShowEventPicker(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Prayer</Text>
                        {SELECTABLE_EVENTS.map((item) => {
                            const isSelected = item.event === selectedEvent;
                            const itemColor = getColorFor(item.event, 0);
                            return (
                                <Pressable
                                    key={item.event}
                                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                                    onPress={() => handleSelectEvent(item.event)}
                                >
                                    <View style={[styles.colorDot, { backgroundColor: itemColor }]} />
                                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                                        {item.label}
                                    </Text>
                                    {isSelected && <Ionicons name="checkmark" size={18} color={theme.colors.foreground} />}
                                </Pressable>
                            );
                        })}
                    </View>
                </Pressable>
            </Modal>
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
    headerSpacer: {
        width: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    headerTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: '700',
        color: theme.colors.foreground,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        gap: theme.spacing.sm,
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.white10,
        borderRadius: theme.radius.lg,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: theme.colors.white15,
    },
    dateButtonText: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.sm,
        fontWeight: '600',
    },
    dateSeparator: {
        color: theme.colors.white50,
        fontSize: theme.fontSize.base,
    },
    presetsRow: {
        flex: 1,
        flexDirection: 'row',
        gap: 6,
    },
    presetChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.white10,
        borderWidth: 1,
        borderColor: theme.colors.white15,
    },
    presetText: {
        color: theme.colors.white70,
        fontSize: theme.fontSize.xs,
        fontWeight: '500',
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.white10,
        borderRadius: theme.radius.lg,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: theme.colors.white15,
    },
    dropdownText: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.sm,
        fontWeight: '600',
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    chartContainer: {
        flex: 1,
        marginHorizontal: theme.spacing.sm,
        paddingBottom: theme.spacing.md,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: theme.colors.black40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius['2xl'],
        padding: theme.spacing.md,
        width: '80%',
        maxWidth: 320,
        borderWidth: 1,
        borderColor: theme.colors.white20,
    },
    modalTitle: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.lg,
        fontWeight: '700',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: theme.radius.md,
    },
    modalOptionSelected: {
        backgroundColor: theme.colors.white10,
    },
    modalOptionText: {
        flex: 1,
        color: theme.colors.white70,
        fontSize: theme.fontSize.base,
    },
    modalOptionTextSelected: {
        color: theme.colors.foreground,
        fontWeight: '600',
    },
});
