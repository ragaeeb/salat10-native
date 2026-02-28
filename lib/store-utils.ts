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
    const rawFajr = Number.parseFloat(settings.fajrAngle);
    const rawIsha = Number.parseFloat(settings.ishaAngle);
    const rawInterval = Number.parseFloat(settings.ishaInterval);
    const fajrAngle = Number.isFinite(rawFajr) ? rawFajr : 0;
    const ishaAngle = Number.isFinite(rawIsha) ? rawIsha : 0;
    const ishaInterval = Number.isFinite(rawInterval) ? rawInterval : 0;

    try {
        const params = createParameters({ fajrAngle, ishaAngle, ishaInterval, method: settings.method });

        const coordinates = new Coordinates(lat, lon);
        const prayerTimes = new PrayerTimes(coordinates, date, params);
        const sunnahTimes = new SunnahTimes(prayerTimes);

        return { computedAt: Date.now(), date, prayerTimes, sunnahTimes };
    } catch {
        return null;
    }
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
