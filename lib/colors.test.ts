import { describe, expect, it } from 'bun:test';
import { getColorFor } from './colors';

describe('getColorFor', () => {
    it('should return series color for known events', () => {
        const color = getColorFor('fajr', 0);
        expect(typeof color).toBe('string');
        expect(color).toMatch(/^#/);
    });

    it('should return fallback color for unknown events', () => {
        const color = getColorFor('unknown_event', 0);
        expect(typeof color).toBe('string');
        expect(color).toMatch(/^#/);
    });

    it('should cycle through fallback colors', () => {
        const color1 = getColorFor('unknown1', 0);
        const color2 = getColorFor('unknown2', 1);
        expect(color1).not.toBe(color2);
    });

    it('should return correct colors for all standard events', () => {
        const events = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
        for (const event of events) {
            const color = getColorFor(event, 0);
            expect(color).toMatch(/^#/);
        }
    });
});
