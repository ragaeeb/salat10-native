import { FALLBACK_TIMELINE_VALUES } from '@/lib/constants';
import { clamp01, pick } from '@/lib/utils';
import type { DayData, Timeline } from '@/types/timeline';

const MAX_SCROLL_POSITION = 0.999;

export function buildTimeline(day: DayData): Timeline {
    const tFajr = pick(day.timings, 'fajr');
    const tSunrise = pick(day.timings, 'sunrise');
    const tAsr = pick(day.timings, 'asr');
    const tMaghrib = pick(day.timings, 'maghrib');
    const tIsha = pick(day.timings, 'isha');
    const tMid = pick(day.timings, 'middleOfTheNight');
    const tLast = pick(day.timings, 'lastThirdOfTheNight');
    const tNextFajr = day.nextFajr;

    if (!tFajr || !tSunrise || !tAsr || !tMaghrib || !tIsha || !tMid || !tLast || !tNextFajr) {
        return FALLBACK_TIMELINE_VALUES;
    }

    const start = tFajr.getTime();
    const end = tNextFajr.getTime();
    const span = Math.max(1, end - start);

    const toP = (d: Date) => clamp01((d.getTime() - start) / span);

    const pSunrise = toP(tSunrise);
    const pMaghrib = toP(tMaghrib);
    const pDhuhr = (pSunrise + pMaghrib) / 2;

    return {
        asr: toP(tAsr),
        dhuhr: pDhuhr,
        end: 1,
        fajr: 0,
        isha: toP(tIsha),
        lastThird: toP(tLast),
        maghrib: pMaghrib,
        midNight: toP(tMid),
        sunrise: pSunrise,
    };
}

export const timeToScroll = (nowMs: number, day: DayData) => {
    const fajr = pick(day.timings, 'fajr')?.getTime();
    const nextFajr = day.nextFajr?.getTime();
    if (!fajr || !nextFajr) {
        return 0;
    }

    if (nowMs <= fajr) {
        return 0;
    }
    if (nowMs >= nextFajr) {
        return MAX_SCROLL_POSITION;
    }

    return clamp01((nowMs - fajr) / (nextFajr - fajr));
};
