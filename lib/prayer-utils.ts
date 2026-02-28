import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { type CalculationConfig, daily, formatTimeRemaining, getActiveEvent, getTimeUntilNext } from '@/lib/calculator';
import { useCurrentData, usePrayerStore } from '@/store/usePrayerStore';
import { type SalatEvent, salatLabels } from './constants';
import { formatDate } from './formatting';

const useCalculationConfigInternal = (): CalculationConfig =>
    usePrayerStore(
        useShallow((state) => ({
            fajrAngle: Number.parseFloat(state.settings.fajrAngle),
            ishaAngle: Number.parseFloat(state.settings.ishaAngle),
            ishaInterval: Number.parseFloat(state.settings.ishaInterval),
            latitude: state.settings.latitude,
            longitude: state.settings.longitude,
            method: state.settings.method,
            timeZone: state.settings.timeZone,
        })),
    );

const useCurrentTimings = () => {
    const currentData = useCurrentData();
    const config = useCalculationConfigInternal();

    if (!currentData) {
        return [];
    }

    const result = daily(salatLabels, config, currentData.date);
    return result.timings;
};

export const useTimingsForDate = (date: Date) => {
    const config = useCalculationConfigInternal();
    return daily(salatLabels, config, date);
};

export const useActiveEvent = () => {
    const timings = useCurrentTimings();
    const [activeEvent, setActiveEvent] = useState<SalatEvent | null>(null);

    useEffect(() => {
        if (timings.length === 0) {
            setActiveEvent(null);
            return;
        }

        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const scheduleNext = () => {
            const now = Date.now();
            const event = getActiveEvent(timings, now);
            setActiveEvent(event);

            const nextTiming = timings.find((t) => t.value.getTime() > now);
            if (!nextTiming) return;

            const msUntilNext = nextTiming.value.getTime() - now;
            timeoutId = setTimeout(scheduleNext, msUntilNext);
        };

        scheduleNext();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [timings]);

    return activeEvent;
};

export const useCountdownToNext = () => {
    const timings = useCurrentTimings();
    const [countdown, setCountdown] = useState<string>('');

    useEffect(() => {
        if (timings.length === 0) {
            setCountdown('');
            return;
        }

        const updateCountdown = () => {
            const now = Date.now();
            const timeUntil = getTimeUntilNext(timings, now);

            if (!timeUntil || timeUntil <= 0) {
                setCountdown('');
                return null;
            }

            const nextTiming = timings.find((t) => t.value.getTime() > now);
            if (!nextTiming) {
                setCountdown('');
                return null;
            }

            const formatted = formatTimeRemaining(timeUntil);
            setCountdown(`${formatted} until ${nextTiming.label}`);

            return { nextTiming, timeUntil };
        };

        const result = updateCountdown();

        if (!result) {
            return;
        }

        const intervalId = setInterval(() => {
            const result = updateCountdown();
            if (!result) {
                clearInterval(intervalId);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timings]);

    return countdown;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

export const useDayNavigation = () => {
    const currentData = useCurrentData();
    const currentTimings = useCurrentTimings();

    const [viewDate, setViewDate] = useState<Date | null>(null);

    const previewResult = useTimingsForDate(viewDate ?? new Date());

    const isViewingToday = !currentData || viewDate === null ? true : isSameDay(viewDate, currentData.date);

    const timings = isViewingToday ? currentTimings : previewResult.timings;
    const dateLabel = isViewingToday && currentData ? formatDate(currentData.date) : previewResult.date;
    const effectiveDate = viewDate ?? (currentData?.date || new Date());

    const handlePrevDay = () => {
        setViewDate((prev) => {
            const base = prev ?? new Date();
            const next = new Date(base);
            next.setDate(base.getDate() - 1);
            return next;
        });
    };

    const handleNextDay = () => {
        setViewDate((prev) => {
            const base = prev ?? new Date();
            const next = new Date(base);
            next.setDate(base.getDate() + 1);
            return next;
        });
    };

    const handleToday = () => {
        setViewDate(null);
    };

    return { dateLabel, handleNextDay, handlePrevDay, handleToday, timings, viewDate: effectiveDate };
};

export const useCalculationConfig = (): CalculationConfig => useCalculationConfigInternal();
