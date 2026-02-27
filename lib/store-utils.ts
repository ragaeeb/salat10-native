import { Coordinates, PrayerTimes, SunnahTimes } from 'adhan';
import type { ComputedPrayerData } from '@/types/prayer';
import type { Settings } from '@/types/settings';
import { createParameters } from './settings';

export function hasValidCoordinates(settings: Settings): boolean {
    const lat = Number.parseFloat(settings.latitude);
    const lon = Number.parseFloat(settings.longitude);
    return Number.isFinite(lat) && Number.isFinite(lon);
}

export function computePrayerTimesForDate(settings: Settings, date: Date): ComputedPrayerData | null {
    if (!hasValidCoordinates(settings)) {
        return null;
    }

    const lat = Number.parseFloat(settings.latitude);
    const lon = Number.parseFloat(settings.longitude);
    const fajrAngle = Number.parseFloat(settings.fajrAngle);
    const ishaAngle = Number.parseFloat(settings.ishaAngle);
    const ishaInterval = Number.parseFloat(settings.ishaInterval);

    const params = createParameters({
        fajrAngle: Number.isFinite(fajrAngle) ? fajrAngle : 0,
        ishaAngle: Number.isFinite(ishaAngle) ? ishaAngle : 0,
        ishaInterval: Number.isFinite(ishaInterval) ? ishaInterval : 0,
        method: settings.method,
    });

    const coordinates = new Coordinates(lat, lon);
    const prayerTimes = new PrayerTimes(coordinates, date, params);
    const sunnahTimes = new SunnahTimes(prayerTimes);

    return { computedAt: Date.now(), date, prayerTimes, sunnahTimes };
}

export function findNextEventTime(data: ComputedPrayerData | null): Date | null {
    if (!data) {
        return null;
    }

    const now = Date.now();
    const { prayerTimes, sunnahTimes } = data;

    const events = [
        prayerTimes.fajr,
        prayerTimes.sunrise,
        prayerTimes.dhuhr,
        prayerTimes.asr,
        prayerTimes.maghrib,
        prayerTimes.isha,
        sunnahTimes.middleOfTheNight,
        sunnahTimes.lastThirdOfTheNight,
    ]
        .filter((time): time is Date => time instanceof Date)
        .sort((a, b) => a.getTime() - b.getTime());

    return events.find((time) => time.getTime() > now) ?? null;
}

export function getMillisecondsUntilNextUpdate(data: ComputedPrayerData | null): number {
    const nextTime = findNextEventTime(data);

    if (!nextTime) {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        return midnight.getTime() - now.getTime();
    }

    const now = Date.now();
    return Math.max(0, nextTime.getTime() - now);
}
