import { describe, expect, it } from 'bun:test';

import { writeIslamicDate } from './hijri';

describe('hijri', () => {
    describe('writeIslamicDate', () => {
        it('should produce known Ramadan date for March 11, 2024', () => {
            const sample = new Date('2024-03-11T00:00:00Z');
            const written = writeIslamicDate(0, sample);

            expect(written).toEqual({ date: 2, day: 'al-ʾIthnayn', month: 'Ramaḍān', monthIndex: 8, year: 1445 });
        });

        it('should advance by one day when adjustment is +1', () => {
            const today = new Date('2024-03-11T00:00:00Z');
            const todayHijri = writeIslamicDate(0, today);
            const tomorrowHijri = writeIslamicDate(1, today);

            const advancedOneDay =
                tomorrowHijri.date === todayHijri.date + 1 || (todayHijri.date === 30 && tomorrowHijri.date === 1);

            expect(advancedOneDay).toBe(true);
        });

        it('should go back by one day when adjustment is -1', () => {
            const today = new Date('2024-03-11T00:00:00Z');
            const todayHijri = writeIslamicDate(0, today);
            const yesterdayHijri = writeIslamicDate(-1, today);

            const wentBackOneDay =
                yesterdayHijri.date === todayHijri.date - 1 || (todayHijri.date === 1 && yesterdayHijri.date === 30);

            expect(wentBackOneDay).toBe(true);
        });

        it.each([
            { gregorian: '2023-07-19', month: 'al-Muḥarram' },
            { gregorian: '2023-08-18', month: 'Ṣafar' },
            { gregorian: '2023-09-16', month: 'Rabīʿ al-ʾAwwal' },
            { gregorian: '2023-10-16', month: 'Rabīʿ al-ʾĀkhir' },
            { gregorian: '2023-11-14', month: 'Jumadā al-ʾŪlā' },
            { gregorian: '2023-12-14', month: 'Jumādā al-ʾĀkhirah' },
            { gregorian: '2024-01-12', month: 'Rajab' },
            { gregorian: '2024-02-11', month: 'Shaʿbān' },
            { gregorian: '2024-03-11', month: 'Ramaḍān' },
            { gregorian: '2024-04-10', month: 'Shawwāl' },
            { gregorian: '2024-05-09', month: 'Ḏū ʾl-Qaʿdah' },
            { gregorian: '2024-06-08', month: 'Ḏū ʾl-Ḥijjah' },
        ])('should correctly identify $month for $gregorian', ({ gregorian, month }) => {
            const date = new Date(`${gregorian}T00:00:00Z`);
            const hijri = writeIslamicDate(0, date);
            expect(hijri.month).toBe(month);
        });

        it.each([
            { date: '2024-03-10', day: 'al-ʾAḥad' },
            { date: '2024-03-11', day: 'al-ʾIthnayn' },
            { date: '2024-03-12', day: 'ath-Thulāthāʾ' },
            { date: '2024-03-13', day: 'al-ʾArbiʿāʾ' },
            { date: '2024-03-14', day: 'al-Khamīs' },
            { date: '2024-03-15', day: 'al-Jumuʿah' },
            { date: '2024-03-16', day: 'al-Sabt' },
        ])('should correctly identify $day for $date', ({ date, day }) => {
            const hijri = writeIslamicDate(0, new Date(`${date}T00:00:00Z`));
            expect(hijri.day).toBe(day);
        });

        it('should handle month transitions correctly', () => {
            const ramadan1 = new Date('2024-03-10T00:00:00Z');
            const ramadan2 = new Date('2024-03-11T00:00:00Z');

            const hijri1 = writeIslamicDate(0, ramadan1);
            const hijri2 = writeIslamicDate(0, ramadan2);

            expect(hijri1.month).toBe('Ramaḍān');
            expect(hijri1.date).toBe(1);
            expect(hijri2.month).toBe('Ramaḍān');
            expect(hijri2.date).toBe(2);

            const shaban = new Date('2024-03-09T00:00:00Z');
            const shabanHijri = writeIslamicDate(0, shaban);
            expect(shabanHijri.month).toBe('Shaʿbān');
        });

        it('should handle year transitions correctly', () => {
            const muharram1_1445 = new Date('2023-07-19T00:00:00Z');
            const dayBefore = new Date('2023-07-18T00:00:00Z');

            const muharramHijri = writeIslamicDate(0, muharram1_1445);
            const dayBeforeHijri = writeIslamicDate(0, dayBefore);

            expect(muharramHijri.year).toBe(1445);
            expect(muharramHijri.month).toBe('al-Muḥarram');

            expect(dayBeforeHijri.year).toBeGreaterThanOrEqual(1444);
            expect(dayBeforeHijri.year).toBeLessThanOrEqual(1445);
        });

        it('should handle large positive adjustments', () => {
            const base = new Date('2024-03-11T00:00:00Z');
            const adjusted = writeIslamicDate(30, base);

            expect(adjusted.year).toBeGreaterThanOrEqual(1445);
            expect(adjusted.date).toBeGreaterThan(0);
            expect(adjusted.date).toBeLessThanOrEqual(30);
        });

        it('should handle large negative adjustments', () => {
            const base = new Date('2024-03-11T00:00:00Z');
            const adjusted = writeIslamicDate(-30, base);

            expect(adjusted.year).toBeLessThanOrEqual(1445);
            expect(adjusted.date).toBeGreaterThan(0);
            expect(adjusted.date).toBeLessThanOrEqual(30);
        });
    });

    describe('edge cases', () => {
        it.each([
            '2024-03-10',
            '2024-04-09',
            '2024-04-10',
        ])('should handle month boundary date %s', (dateStr) => {
            const date = new Date(`${dateStr}T00:00:00Z`);
            const hijri = writeIslamicDate(0, date);

            expect(hijri.date).toBeGreaterThan(0);
            expect(hijri.date).toBeLessThanOrEqual(30);
            expect(hijri.month).toBeTruthy();
            expect(hijri.year).toBeGreaterThan(1400);
        });

        it('should handle very large adjustments consistently', () => {
            const base = new Date('2024-03-11T00:00:00Z');
            const largePositive = writeIslamicDate(365, base);
            const largeNegative = writeIslamicDate(-365, base);

            expect(largePositive.year - largeNegative.year).toBeCloseTo(2, 0);
        });
    });
});
