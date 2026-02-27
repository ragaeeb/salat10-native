import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import type { FormattedTiming } from '@/lib/calculator';
import type { SalatEvent } from '@/lib/constants';
import { formatHijriDate } from '@/lib/formatting';
import { writeIslamicDate } from '@/lib/hijri';
import { methodLabelMap } from '@/lib/settings';
import { useSettings } from '@/store/usePrayerStore';

type Props = {
    timings: FormattedTiming[];
    dateLabel: string;
    countdown: string;
    activeEvent: SalatEvent | null;
    viewDate: Date;
    onPrevDay: () => void;
    onNextDay: () => void;
    onToday: () => void;
};

export function PrayerTimesCard({
    timings,
    dateLabel,
    countdown,
    activeEvent,
    viewDate,
    onPrevDay,
    onNextDay,
    onToday,
}: Props) {
    const settings = useSettings();
    const hijri = writeIslamicDate(0, viewDate);
    const hijriLabel = formatHijriDate(hijri);
    const methodLabel = methodLabelMap[settings.method] ?? settings.method;

    return (
        <View style={styles.card}>
            {/* Header badges */}
            <View style={styles.badges}>
                <View style={styles.dateBadge}>
                    <Text style={styles.badgeText} numberOfLines={1}>
                        {dateLabel}
                    </Text>
                </View>
                <View style={styles.hijriBadge}>
                    <Text style={styles.badgeTextSmall} numberOfLines={1}>
                        {hijriLabel}
                    </Text>
                </View>
            </View>

            {/* Method badge */}
            <View style={styles.methodBadge}>
                <Text style={styles.methodText} numberOfLines={1}>
                    {methodLabel}
                </Text>
            </View>

            {/* Day navigation */}
            <View style={styles.dayNav}>
                <Pressable onPress={onPrevDay} hitSlop={8} style={styles.navButton} accessibilityRole="button" accessibilityLabel="Previous day">
                    <Ionicons name="chevron-back" size={18} color={theme.colors.foreground} />
                    <Text style={styles.navText}>Prev</Text>
                </Pressable>
                <Pressable onPress={onToday} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go to today">
                    <Text style={styles.todayText}>Today</Text>
                </Pressable>
                <Pressable onPress={onNextDay} hitSlop={8} style={styles.navButton} accessibilityRole="button" accessibilityLabel="Next day">
                    <Text style={styles.navText}>Next</Text>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.foreground} />
                </Pressable>
            </View>

            {/* Prayer times list */}
            <View style={styles.prayerList}>
                {timings.map((timing) => {
                    const isActive = timing.event === activeEvent;
                    return (
                        <View
                            key={timing.event}
                            style={[styles.prayerRow, isActive && styles.prayerRowActive]}
                        >
                            <View style={styles.prayerLabelContainer}>
                                {timing.isFard && <View style={styles.fardDot} />}
                                <Text
                                    style={[
                                        styles.prayerLabel,
                                        isActive && styles.prayerLabelActive,
                                        !timing.isFard && styles.prayerLabelSunnah,
                                    ]}
                                >
                                    {timing.label}
                                </Text>
                            </View>
                            <Text style={[styles.prayerTime, isActive && styles.prayerTimeActive]}>
                                {timing.time}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Countdown */}
            {countdown ? (
                <View style={styles.countdownContainer}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.white70} />
                    <Text style={styles.countdownText}>{countdown}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius['3xl'],
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.white15,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    dateBadge: {
        backgroundColor: theme.colors.white20,
        borderRadius: theme.radius.full,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    hijriBadge: {
        backgroundColor: theme.colors.white10,
        borderRadius: theme.radius.full,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    badgeText: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.sm,
        fontWeight: '500',
    },
    badgeTextSmall: {
        color: theme.colors.white90,
        fontSize: theme.fontSize.xs,
    },
    methodBadge: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.white10,
        borderRadius: theme.radius.full,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginBottom: theme.spacing.sm,
    },
    methodText: {
        color: theme.colors.white70,
        fontSize: theme.fontSize.xs,
    },
    dayNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    navText: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.sm,
    },
    todayText: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.sm,
        fontWeight: '600',
    },
    prayerList: {
        gap: 2,
    },
    prayerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: theme.radius.lg,
    },
    prayerRowActive: {
        backgroundColor: theme.colors.white10,
        borderWidth: 1,
        borderColor: theme.colors.white20,
    },
    prayerLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fardDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.foreground,
    },
    prayerLabel: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.base,
        fontWeight: '500',
    },
    prayerLabelActive: {
        fontWeight: '700',
        fontSize: theme.fontSize.lg,
    },
    prayerLabelSunnah: {
        color: theme.colors.white70,
    },
    prayerTime: {
        color: theme.colors.foreground,
        fontSize: theme.fontSize.base,
    },
    prayerTimeActive: {
        fontWeight: '700',
        fontSize: theme.fontSize.lg,
    },
    countdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: theme.colors.white10,
        borderRadius: theme.radius.lg,
        paddingVertical: 8,
        marginTop: theme.spacing.sm,
    },
    countdownText: {
        color: theme.colors.white70,
        fontSize: theme.fontSize.sm,
    },
});
