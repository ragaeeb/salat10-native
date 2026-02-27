import type { HijriDate } from '@/types/hijri';
import type { DayData, Timeline } from '@/types/timeline';
import { MINUTES_IN_DAY, salatLabels } from './constants';
import { pick } from './utils';

export const formatTime = (t: Date, timeZone: string) => {
    const time = new Date(t).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
        minute: '2-digit',
        timeZone,
    });
    return time;
};

export const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', weekday: 'long', year: 'numeric' });
};

export const formatMinutesLabel = (value: number) => {
    if (!Number.isFinite(value)) {
        return '';
    }
    const normalized = ((Math.round(value) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
    const hours = Math.floor(normalized / 60);
    const minutes = normalized % 60;
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const displayHour = ((hours + 11) % 12) + 1;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${suffix}`;
};

export const formatHijriDate = (hijri: HijriDate) => {
    return `${hijri.day}, ${hijri.date} ${hijri.month} ${hijri.year} AH`;
};

export const formatCoordinate = (value: number, positiveLabel: string, negativeLabel: string) => {
    return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positiveLabel : negativeLabel}`;
};

export function phaseLabelAndTime(p: number, tl: Timeline, timings: DayData['timings'], tz: string) {
    if (p < tl.sunrise) {
        return { label: salatLabels.fajr, time: formatTime(pick(timings, 'fajr')!, tz) };
    }
    if (p < tl.dhuhr) {
        return { label: salatLabels.sunrise, time: formatTime(pick(timings, 'sunrise')!, tz) };
    }
    if (p < tl.asr) {
        return { label: salatLabels.dhuhr, time: formatTime(pick(timings, 'dhuhr')!, tz) };
    }
    if (p < tl.maghrib) {
        return { label: salatLabels.asr, time: formatTime(pick(timings, 'asr')!, tz) };
    }
    if (p < tl.isha) {
        return { label: salatLabels.maghrib, time: formatTime(pick(timings, 'maghrib')!, tz) };
    }
    if (p < tl.midNight) {
        return { label: salatLabels.isha, time: formatTime(pick(timings, 'isha')!, tz) };
    }
    if (p < tl.lastThird) {
        return { label: salatLabels.middleOfTheNight, time: formatTime(pick(timings, 'middleOfTheNight')!, tz) };
    }
    return { label: salatLabels.lastThirdOfTheNight, time: formatTime(pick(timings, 'lastThirdOfTheNight')!, tz) };
}
