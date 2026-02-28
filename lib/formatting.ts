import type { HijriDate } from '@/types/hijri';
import { MINUTES_IN_DAY } from './constants';

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
