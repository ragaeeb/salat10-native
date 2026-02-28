import { describe, expect, it } from 'bun:test';
import { formatDate, formatHijriDate, formatMinutesLabel, formatTime } from './formatting';
import type { HijriDate } from '@/types/hijri';

describe('formatTime', () => {
    it('should format time in 12-hour format', () => {
        const date = new Date('2025-01-01T14:30:00Z');
        const result = formatTime(date, 'America/New_York');
        expect(result).toContain('9:30');
        expect(result).toContain('AM');
    });

    it('should handle morning times', () => {
        const date = new Date('2025-01-01T10:15:00Z');
        const result = formatTime(date, 'America/New_York');
        expect(result).toContain('5:15');
        expect(result).toContain('AM');
    });

    it('should handle midnight', () => {
        const date = new Date('2025-01-01T05:00:00Z');
        const result = formatTime(date, 'America/New_York');
        expect(result).toContain('12:00');
        expect(result).toContain('AM');
    });

    it('should handle noon', () => {
        const date = new Date('2025-01-01T17:00:00Z');
        const result = formatTime(date, 'America/New_York');
        expect(result).toContain('12:00');
        expect(result).toContain('PM');
    });
});

describe('formatDate', () => {
    it('should format date with full details', () => {
        const date = new Date('2025-01-15');
        const result = formatDate(date);
        expect(result).toContain('January');
        expect(result).toContain('15');
        expect(result).toContain('2025');
    });

    it('should include weekday', () => {
        const date = new Date('2025-01-01');
        const result = formatDate(date);
        expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
    });
});

describe('formatMinutesLabel', () => {
    it('should return empty string for non-finite values', () => {
        expect(formatMinutesLabel(NaN)).toBe('');
        expect(formatMinutesLabel(Number.POSITIVE_INFINITY)).toBe('');
        expect(formatMinutesLabel(Number.NEGATIVE_INFINITY)).toBe('');
    });

    it('should format midnight', () => {
        expect(formatMinutesLabel(0)).toBe('12:00 AM');
    });

    it('should format morning times', () => {
        expect(formatMinutesLabel(300)).toBe('5:00 AM');
        expect(formatMinutesLabel(315)).toBe('5:15 AM');
    });

    it('should format noon', () => {
        expect(formatMinutesLabel(720)).toBe('12:00 PM');
    });

    it('should format afternoon times', () => {
        expect(formatMinutesLabel(870)).toBe('2:30 PM');
    });

    it('should format evening times', () => {
        expect(formatMinutesLabel(1200)).toBe('8:00 PM');
    });

    it('should handle values over 24 hours', () => {
        expect(formatMinutesLabel(1500)).toBe('1:00 AM');
    });

    it('should handle negative values', () => {
        expect(formatMinutesLabel(-60)).toBe('11:00 PM');
    });

    it('should pad minutes with zero', () => {
        expect(formatMinutesLabel(305)).toBe('5:05 AM');
    });
});

describe('formatHijriDate', () => {
    it('should format Hijri date correctly', () => {
        const hijri: HijriDate = { date: 15, day: 'Monday', month: 'Ramadan', monthIndex: 8, year: 1446 };
        const result = formatHijriDate(hijri);
        expect(result).toBe('Monday, 15 Ramadan 1446 AH');
    });

    it('should handle single digit dates', () => {
        const hijri: HijriDate = { date: 1, day: 'Friday', month: 'Muharram', monthIndex: 0, year: 1446 };
        const result = formatHijriDate(hijri);
        expect(result).toBe('Friday, 1 Muharram 1446 AH');
    });
});
