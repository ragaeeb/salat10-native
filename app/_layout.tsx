import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { ErrorBoundary } from '@/components/error-boundary';
import { theme } from '@/constants/theme';
import { useHasHydrated, usePrayerStore } from '@/store/usePrayerStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const hasHydrated = useHasHydrated();

    useEffect(() => {
        if (hasHydrated) SplashScreen.hideAsync();
    }, [hasHydrated]);

    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                usePrayerStore.getState().computePrayerTimes();
                usePrayerStore.getState()._scheduleNextUpdate();
            }
        });
        return () => sub.remove();
    }, []);

    return (
        <ErrorBoundary>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.background },
                }}
            >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                    name="settings"
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom',
                    }}
                />
                <Stack.Screen
                    name="graph"
                    options={{
                        animation: 'slide_from_right',
                    }}
                />
            </Stack>
        </ErrorBoundary>
    );
}
