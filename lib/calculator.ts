import { Coordinates, PrayerTimes, SunnahTimes } from 'adhan';
import type { MethodValue } from '@/types/settings';
import type { SalatEvent } from './constants';
import { formatDate, formatTime } from './formatting';
import { createParameters } from './settings';

export type FormattedTiming = {
    event: SalatEvent;
    isFard: boolean;
    label: string;
    time: string;
    value: Date;
};

export type CalculationConfig = {
    fajrAngle: number;
    ishaAngle: number;
    ishaInterval: number;
    latitude: string;
    longitude: string;
    method: MethodValue;
    timeZone: string;
};

export type DailyResult = {
    date: string;
    timings: FormattedTiming[];
    nextEventTime: Date | null;
};

export const isFard = (event: string): boolean => {
    return ['asr', 'dhuhr', 'fajr', 'isha', 'maghrib'].includes(event);
};

const formatTimings = (
    prayerTimes: PrayerTimes,
    sunnahTimes: SunnahTimes,
    timeZone: string,
    salatLabels: Record<string, string>,
): FormattedTiming[] => {
    const labelFor = (event: SalatEvent) => salatLabels[event] ?? event;

    const allTimes: Record<SalatEvent, Date> = {
        asr: prayerTimes.asr,
        dhuhr: prayerTimes.dhuhr,
        fajr: prayerTimes.fajr,
        isha: prayerTimes.isha,
        lastThirdOfTheNight: sunnahTimes.lastThirdOfTheNight,
        maghrib: prayerTimes.maghrib,
        middleOfTheNight: sunnahTimes.middleOfTheNight,
        sunrise: prayerTimes.sunrise,
    };

    return Object.entries(allTimes)
        .sort(([, a], [, b]) => a.getTime() - b.getTime())
        .map(([event, value]) => ({
            event: event as SalatEvent,
            isFard: isFard(event),
            label: labelFor(event as SalatEvent),
            time: formatTime(value, timeZone),
            value,
        }));
};

export const daily = (salatLabels: Record<string, string>, config: CalculationConfig, date: Date): DailyResult => {
    const { fajrAngle, ishaAngle, ishaInterval, latitude, longitude, method, timeZone } = config;

    const params = createParameters({ fajrAngle, ishaAngle, ishaInterval, method });
    const coords = new Coordinates(Number(latitude), Number(longitude));
    const prayerTimes = new PrayerTimes(coords, date, params);
    const sunnahTimes = new SunnahTimes(prayerTimes);

    const timings = formatTimings(prayerTimes, sunnahTimes, timeZone, salatLabels);

    const now = Date.now();
    const nextEventTime = timings.find((t) => t.value.getTime() > now)?.value ?? null;

    return { date: formatDate(prayerTimes.fajr), nextEventTime, timings };
};

export const monthly = (salatLabels: Record<string, string>, config: CalculationConfig, targetDate = new Date()) => {
    const times: DailyResult[] = [];
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= lastDayOfMonth; day += 1) {
        const date = new Date(year, month, day);
        const result = daily(salatLabels, config, date);
        times.push(result);
    }

    const monthName = targetDate.toLocaleDateString('en-US', { month: 'long' });

    return { dates: times, label: `${monthName} ${year}` };
};

export const yearly = (salatLabels: Record<string, string>, config: CalculationConfig, targetDate = new Date()) => {
    const times: DailyResult[] = [];
    const current = new Date(targetDate.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(current.getFullYear(), 11, 31);

    while (current <= lastDayOfYear) {
        const result = daily(salatLabels, config, current);
        times.push(result);
        current.setDate(current.getDate() + 1);
    }

    return { dates: times, label: targetDate.getFullYear() };
};

export const getActiveEvent = (timings: FormattedTiming[], timestamp: number): SalatEvent | null => {
    if (!timings || timings.length === 0) {
        return null;
    }

    let activeEvent: SalatEvent | null = null;

    for (let i = timings.length - 1; i >= 0; i--) {
        const timing = timings[i];
        if (timing && timing.value.getTime() <= timestamp) {
            activeEvent = timing.event;
            break;
        }
    }

    if (activeEvent) {
        return activeEvent;
    }

    const nightEvents = timings.slice(-3);
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    for (let i = nightEvents.length - 1; i >= 0; i--) {
        const event = nightEvents[i];
        if (event) {
            const yesterdayTime = event.value.getTime() - TWENTY_FOUR_HOURS_MS;
            if (yesterdayTime <= timestamp) {
                return event.event;
            }
        }
    }

    return timings[timings.length - 1]?.event ?? null;
};

export const getNextEvent = (timings: FormattedTiming[], timestamp: number): string | null => {
    if (!timings || timings.length === 0) {
        return null;
    }
    const nextEntry = timings.find((timing) => timing.value.getTime() > timestamp);
    return nextEntry?.event ?? null;
};

export const getTimeUntilNext = (timings: FormattedTiming[], timestamp: number): number | null => {
    if (!timings || timings.length === 0) {
        return null;
    }
    const nextEntry = timings.find((timing) => timing.value.getTime() > timestamp);
    return nextEntry ? nextEntry.value.getTime() - timestamp : null;
};

export const formatTimeRemaining = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
};
