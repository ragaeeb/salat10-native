export type Timeline = {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
    midNight: number;
    lastThird: number;
    end: number;
};

export type Timing = { event: string; value: Date; label: string };

export type DayData = {
    date: Date;
    timings: Timing[];
    nextFajr: Date | null;
    dayIndex: number;
};
