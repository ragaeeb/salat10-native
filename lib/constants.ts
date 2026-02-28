import * as Localization from 'expo-localization';

export const CALCULATION_METHOD_OPTIONS = [
    { label: 'Nautical Twilight (12°, 12°)', value: 'Other' },
    { label: 'Muslim World League (18°, 17°)', value: 'MuslimWorldLeague' },
    { label: 'Egyptian General Authority (19.5°, 17.5°)', value: 'Egyptian' },
    { label: 'Karachi - University of Islamic Sciences (18°, 18°)', value: 'Karachi' },
    { label: 'Umm al-Qura - Makkah (18.5°, 90 min)', value: 'UmmAlQura' },
    { label: 'Dubai (18.2°, 18.2°)', value: 'Dubai' },
    { label: 'Moonsighting Committee Worldwide (18°, 18°)', value: 'MoonsightingCommittee' },
    { label: 'North America - ISNA (15°, 15°)', value: 'NorthAmerica' },
    { label: 'Kuwait (18°, 17.5°)', value: 'Kuwait' },
    { label: 'Qatar (18°, 90 min)', value: 'Qatar' },
    { label: 'Singapore (20°, 18°)', value: 'Singapore' },
    { label: 'Turkey - Diyanet (18°, 17°)', value: 'Turkey' },
] as const;

const getDeviceTimezone = (): string => {
    try {
        const calendars = Localization.getCalendars();
        return calendars[0]?.timeZone ?? 'UTC';
    } catch {
        return 'UTC';
    }
};

export const defaultSettings = {
    address: '',
    fajrAngle: '12',
    ishaAngle: '12',
    ishaInterval: '0',
    latitude: '',
    longitude: '',
    method: 'Other',
    timeZone: getDeviceTimezone(),
} as const;

export const MINUTES_IN_DAY = 24 * 60;

export const SERIES_COLORS: Record<string, string> = {
    fajr: '#e0f2fe',
    sunrise: '#fbbf24',
    dhuhr: '#fde68a',
    asr: '#4ade80',
    maghrib: '#fb923c',
    isha: '#f9a8d4',
    middleOfTheNight: '#c4b5fd',
    lastThirdOfTheNight: '#fca5a5',
};

export const FALLBACK_COLORS = ['#e0f2fe', '#fbbf24', '#fde68a', '#4ade80', '#fb923c', '#f9a8d4', '#c4b5fd', '#fca5a5'];


export const salatLabels = {
    asr: 'ʿAṣr',
    dhuhr: 'Dhuhr',
    fajr: 'Fajr',
    isha: 'ʿIshāʾ',
    lastThirdOfTheNight: 'Last 1/3 Night Begins',
    maghrib: 'Maġrib',
    middleOfTheNight: '1/2 Night Begins',
    sunrise: 'Sunrise',
} as const;

export type SalatEvent = keyof typeof salatLabels;
