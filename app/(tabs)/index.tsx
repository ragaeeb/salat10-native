import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrayerTimesCard } from '@/components/prayer/prayer-times-card';
import { QuoteCard } from '@/components/prayer/quote-card';
import { theme } from '@/constants/theme';
import { useMotivationalQuote } from '@/hooks/use-motivational-quote';
import { useActiveEvent, useCountdownToNext, useDayNavigation } from '@/lib/prayer-utils';
import { useHasHydrated, useHasValidCoordinates } from '@/store/usePrayerStore';

export default function HomeScreen() {
    const router = useRouter();
    const hasHydrated = useHasHydrated();
    const hasValidCoords = useHasValidCoordinates();
    const { timings, dateLabel, handlePrevDay, handleNextDay, handleToday, viewDate } = useDayNavigation();
    const activeEvent = useActiveEvent();
    const countdown = useCountdownToNext();
    const { quote } = useMotivationalQuote();

    if (!hasHydrated) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.foreground} />
            </SafeAreaView>
        );
    }

    if (!hasValidCoords) {
        return (
            <SafeAreaView style={styles.centered}>
                <Ionicons name="location-outline" size={64} color={theme.colors.white50} />
                <Text style={styles.emptyTitle}>Set Your Location</Text>
                <Text style={styles.emptySubtitle}>
                    To see accurate prayer times, please set your location in Settings.
                </Text>
                <Pressable style={styles.setupButton} onPress={() => router.push('/settings')} accessibilityRole="button" accessibilityLabel="Open Settings">
                    <Ionicons name="settings-outline" size={18} color={theme.colors.primaryForeground} />
                    <Text style={styles.setupButtonText}>Open Settings</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Salat10</Text>
                <View style={styles.headerButtons}>
                    <Pressable onPress={() => router.push('/graph')} hitSlop={8} style={styles.headerIcon} accessibilityRole="button" accessibilityLabel="View prayer trends">
                        <Ionicons name="stats-chart-outline" size={22} color={theme.colors.foreground} />
                    </Pressable>
                    <Pressable onPress={() => router.push('/settings')} hitSlop={8} style={styles.headerIcon} accessibilityRole="button" accessibilityLabel="Open settings">
                        <Ionicons name="settings-outline" size={22} color={theme.colors.foreground} />
                    </Pressable>
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {quote && <QuoteCard quote={quote} />}

                <PrayerTimesCard
                    timings={timings}
                    dateLabel={dateLabel}
                    countdown={countdown}
                    activeEvent={activeEvent}
                    viewDate={viewDate}
                    onPrevDay={handlePrevDay}
                    onNextDay={handleNextDay}
                    onToday={handleToday}
                />
            </ScrollView>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    title: {
        fontSize: theme.fontSize['2xl'],
        fontWeight: '800',
        color: theme.colors.foreground,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    headerIcon: {
        padding: 4,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.md,
        gap: theme.spacing.md,
        paddingBottom: 20,
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
});
