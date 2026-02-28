import { beforeEach, describe, expect, it } from 'bun:test';

import {
    daily,
    type FormattedTiming,
    formatTimeRemaining,
    getActiveEvent,
    getTimeUntilNext,
    isFard,
    monthly,
} from './calculator';

const labels = {
    asr: 'Asr',
    dhuhr: 'Dhuhr',
    fajr: 'Fajr',
    isha: 'Isha',
    lastThirdOfTheNight: 'Last third',
    maghrib: 'Maghrib',
    middleOfTheNight: 'Half',
    sunrise: 'Sunrise',
} as const;

const defaultConfig = {
    fajrAngle: 15,
    ishaAngle: 15,
    ishaInterval: 0,
    latitude: '45.3506',
    longitude: '-75.7930',
    method: 'NorthAmerica' as const,
    timeZone: 'America/Toronto',
};

describe('isFard', () => {
    it('should return true for five obligatory prayers', () => {
        expect(isFard('fajr')).toBe(true);
        expect(isFard('dhuhr')).toBe(true);
        expect(isFard('asr')).toBe(true);
        expect(isFard('maghrib')).toBe(true);
        expect(isFard('isha')).toBe(true);
    });

    it('should return false for non-fard events', () => {
        expect(isFard('sunrise')).toBe(false);
        expect(isFard('middleOfTheNight')).toBe(false);
        expect(isFard('lastThirdOfTheNight')).toBe(false);
    });

    it('should return false for unknown events', () => {
        expect(isFard('unknown')).toBe(false);
        expect(isFard('sunset')).toBe(false);
    });
});

describe('daily', () => {
    it('should return timings in chronological order', () => {
        const result = daily(labels, defaultConfig, new Date('2024-03-11T14:30:00-05:00'));

        expect(result.timings.length).toBeGreaterThan(0);
        expect(result.timings[0]?.event).toBe('fajr');

        for (let i = 1; i < result.timings.length; i++) {
            const prev = result.timings[i - 1]!;
            const curr = result.timings[i]!;
            expect(curr.value.getTime()).toBeGreaterThanOrEqual(prev.value.getTime());
        }
    });

    it('should include all prayer events', () => {
        const result = daily(labels, defaultConfig, new Date('2024-03-11T14:30:00-05:00'));
        const events = result.timings.map((t) => t.event);

        expect(events).toContain('fajr');
        expect(events).toContain('sunrise');
        expect(events).toContain('dhuhr');
        expect(events).toContain('asr');
        expect(events).toContain('maghrib');
        expect(events).toContain('isha');
        expect(events).toContain('middleOfTheNight');
        expect(events).toContain('lastThirdOfTheNight');
    });

    it('should correctly mark fard prayers', () => {
        const result = daily(labels, defaultConfig, new Date('2024-03-11T14:30:00-05:00'));

        const fajr = result.timings.find((t) => t.event === 'fajr');
        expect(fajr?.isFard).toBe(true);

        const sunrise = result.timings.find((t) => t.event === 'sunrise');
        expect(sunrise?.isFard).toBe(false);
    });

    it('should format times correctly', () => {
        const result = daily(labels, defaultConfig, new Date('2024-03-11T14:30:00-05:00'));

        for (const timing of result.timings) {
            expect(timing.time).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
        }
    });

    it('should use provided labels', () => {
        const customLabels = { ...labels, fajr: 'Custom Fajr' };

        const result = daily(customLabels, defaultConfig, new Date('2024-03-11T14:30:00-05:00'));
        const fajr = result.timings.find((t) => t.event === 'fajr');

        expect(fajr?.label).toBe('Custom Fajr');
    });

    it('should include formatted date string', () => {
        const result = daily(labels, defaultConfig, new Date('2024-03-11T14:30:00-05:00'));
        expect(result.date).toBeTruthy();
        expect(typeof result.date).toBe('string');
    });

    it('should include dayOfMonth', () => {
        const result = daily(labels, defaultConfig, new Date('2024-03-11T14:30:00-05:00'));
        expect(result.dayOfMonth).toBe(11);
    });

    it('should handle different calculation methods', () => {
        const configs = [
            { ...defaultConfig, method: 'MuslimWorldLeague' as const },
            { ...defaultConfig, method: 'Egyptian' as const },
            { ...defaultConfig, method: 'Karachi' as const },
        ];

        for (const config of configs) {
            const result = daily(labels, config, new Date('2024-03-11T14:30:00-05:00'));
            expect(result.timings.length).toBeGreaterThan(0);
        }
    });

    it('should handle custom angles', () => {
        const customConfig = { ...defaultConfig, fajrAngle: 18, ishaAngle: 18 };

        const result = daily(labels, customConfig, new Date('2024-03-11T14:30:00-05:00'));
        expect(result.timings.length).toBeGreaterThan(0);
    });
});

describe('monthly', () => {
    it('should generate correct number of days', () => {
        const result = monthly(labels, defaultConfig, new Date('2024-03-11T00:00:00-05:00'));
        expect(result.label).toBe('March 2024');
        expect(result.dates.length).toBe(31);
    });

    it('should handle February in leap year', () => {
        const result = monthly(labels, defaultConfig, new Date('2024-02-15T00:00:00-05:00'));
        expect(result.label).toBe('February 2024');
        expect(result.dates.length).toBe(29);
    });

    it('should handle February in non-leap year', () => {
        const result = monthly(labels, defaultConfig, new Date('2023-02-15T00:00:00-05:00'));
        expect(result.label).toBe('February 2023');
        expect(result.dates.length).toBe(28);
    });

    it('should have valid prayer times for each day', () => {
        const result = monthly(labels, defaultConfig, new Date('2024-03-11T00:00:00-05:00'));

        for (const day of result.dates) {
            expect(day.timings.length).toBeGreaterThan(0);
            expect(day.date).toBeTruthy();
        }
    });

    it('should have sequential dates', () => {
        const result = monthly(labels, defaultConfig, new Date('2024-03-11T00:00:00-05:00'));

        for (let i = 1; i < result.dates.length; i++) {
            const prev = result.dates[i - 1]!;
            const curr = result.dates[i]!;
            const prevTime = prev.timings[0]!.value.getTime();
            const currTime = curr.timings[0]!.value.getTime();
            expect(currTime).toBeGreaterThan(prevTime);
        }
    });

    it('should have sequential dayOfMonth values', () => {
        const result = monthly(labels, defaultConfig, new Date('2024-03-11T00:00:00-05:00'));

        for (let i = 0; i < result.dates.length; i++) {
            expect(result.dates[i]!.dayOfMonth).toBe(i + 1);
        }
    });
});

describe('getActiveEvent', () => {
    let timings: FormattedTiming[];

    beforeEach(() => {
        const result = daily(labels, defaultConfig, new Date('2024-03-11T00:00:00-05:00'));
        timings = result.timings;
    });

    it('should return the correct event during daytime prayers', () => {
        const dhuhr = timings.find((t) => t.event === 'dhuhr')!;
        const timestamp = dhuhr.value.getTime() + 30 * 60 * 1000;

        const active = getActiveEvent(timings, timestamp);
        expect(active).toBe('dhuhr');
    });

    it('should return the correct event at exact prayer time', () => {
        const fajr = timings.find((t) => t.event === 'fajr')!;
        const active = getActiveEvent(timings, fajr.value.getTime());
        expect(active).toBe('fajr');
    });

    it('should return last event when before first prayer (early morning)', () => {
        const fajr = timings.find((t) => t.event === 'fajr')!;
        const earlyMorning = fajr.value.getTime() - 30 * 60 * 1000;

        const active = getActiveEvent(timings, earlyMorning);
        expect(active).toBe('lastThirdOfTheNight');
    });

    it('should handle night prayers correctly', () => {
        const isha = timings.find((t) => t.event === 'isha')!;
        const timestamp = isha.value.getTime() + 60 * 60 * 1000;

        const active = getActiveEvent(timings, timestamp);
        expect(['isha', 'middleOfTheNight', 'lastThirdOfTheNight']).toContain(active!);
    });

    it('should return null for empty timings', () => {
        const active = getActiveEvent([], Date.now());
        expect(active).toBeNull();
    });
});

describe('getTimeUntilNext', () => {
    let timings: FormattedTiming[];

    beforeEach(() => {
        const result = daily(labels, defaultConfig, new Date('2024-03-11T00:00:00-05:00'));
        timings = result.timings;
    });

    it('should return positive milliseconds until next event', () => {
        const fajr = timings.find((t) => t.event === 'fajr')!;
        const timestamp = fajr.value.getTime() + 30 * 60 * 1000;

        const timeUntil = getTimeUntilNext(timings, timestamp);
        expect(timeUntil).toBeGreaterThan(0);
    });

    it('should return null when no events remain', () => {
        const lastEvent = timings[timings.length - 1]!;
        const timestamp = lastEvent.value.getTime() + 60 * 1000;

        const timeUntil = getTimeUntilNext(timings, timestamp);
        expect(timeUntil).toBeNull();
    });

    it('should calculate correct time difference', () => {
        const sunrise = timings.find((t) => t.event === 'sunrise')!;
        const fajr = timings.find((t) => t.event === 'fajr')!;
        const timestamp = fajr.value.getTime() + 10 * 60 * 1000;

        const timeUntil = getTimeUntilNext(timings, timestamp);
        const expected = sunrise.value.getTime() - timestamp;

        expect(timeUntil).toBe(expected);
    });

    it('should return null for empty timings', () => {
        const timeUntil = getTimeUntilNext([], Date.now());
        expect(timeUntil).toBeNull();
    });
});

describe('formatTimeRemaining', () => {
    it('should format hours, minutes, seconds correctly', () => {
        const ms = 2 * 60 * 60 * 1000 + 30 * 60 * 1000 + 45 * 1000;
        expect(formatTimeRemaining(ms)).toBe('2h 30m 45s');
    });

    it('should handle zero values', () => {
        expect(formatTimeRemaining(0)).toBe('0h 0m 0s');
    });

    it('should handle only seconds', () => {
        const ms = 45 * 1000;
        expect(formatTimeRemaining(ms)).toBe('0h 0m 45s');
    });

    it('should handle only minutes', () => {
        const ms = 30 * 60 * 1000;
        expect(formatTimeRemaining(ms)).toBe('0h 30m 0s');
    });

    it('should handle only hours', () => {
        const ms = 5 * 60 * 60 * 1000;
        expect(formatTimeRemaining(ms)).toBe('5h 0m 0s');
    });

    it('should floor fractional values', () => {
        const ms = 2.7 * 60 * 60 * 1000 + 30.8 * 60 * 1000 + 45.9 * 1000;
        expect(formatTimeRemaining(ms)).toBe('3h 13m 33s');
    });
});
