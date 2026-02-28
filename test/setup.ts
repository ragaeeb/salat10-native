import { mock } from 'bun:test';

mock.module('react-native', () => ({
    AppState: { addEventListener: () => ({ remove: () => {} }) },
    Platform: { OS: 'ios', select: (map: Record<string, unknown>) => map.ios ?? map.default },
    StyleSheet: { create: (styles: Record<string, unknown>) => styles },
}));

mock.module('expo-localization', () => ({
    getCalendars: () => [{ timeZone: 'America/New_York' }],
    getLocales: () => [{ languageCode: 'en', regionCode: 'US' }],
}));
