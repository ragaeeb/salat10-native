import { describe, expect, it } from 'bun:test';
import { Coordinates, PrayerTimes, SunnahTimes } from 'adhan';
import type { ComputedPrayerData } from '@/types/prayer';
import type { Quote } from '@/types/quote';
import { filterQuotesByPresent, formatCitation, getRandomQuote } from './quotes';
import { createParameters } from './settings';

const createPrayerData = (date: Date): ComputedPrayerData => {
    const coords = new Coordinates(43.6532, -79.3832);
    const params = createParameters({ fajrAngle: 15, ishaAngle: 15, ishaInterval: 0, method: 'MuslimWorldLeague' });
    const prayerTimes = new PrayerTimes(coords, date, params);
    const sunnahTimes = new SunnahTimes(prayerTimes);

    return { computedAt: date.getTime(), date, prayerTimes, sunnahTimes };
};

describe('filterQuotesByPresent', () => {
    describe('hijri month filtering', () => {
        it('should match quotes with hijri_months when month matches', () => {
            const data = createPrayerData(new Date(2022, 3, 2, 12, 0, 0));

            const quotes: Quote[] = [
                { author: 'Test', body: 'Ramadan quote', hijri_months: [9], title: 'Test' },
                { author: 'Test', body: 'Other month quote', hijri_months: [8], title: 'Test' },
            ];

            const filtered = filterQuotesByPresent(data, quotes);
            expect(filtered).toHaveLength(1);
            expect(filtered[0]!.body).toBe('Ramadan quote');
        });

        it('should match quotes without hijri_months (generic)', () => {
            const data = createPrayerData(new Date(2022, 3, 2, 12, 0, 0));

            const quotes: Quote[] = [{ author: 'Test', body: 'Generic quote', title: 'Test' }];

            const filtered = filterQuotesByPresent(data, quotes);
            expect(filtered).toHaveLength(1);
        });
    });

    describe('weekday filtering', () => {
        it('should match quotes with days when weekday matches', () => {
            const data = createPrayerData(new Date(2022, 3, 1, 12, 0, 0)); // Friday

            const quotes: Quote[] = [
                { author: 'Test', body: 'Friday quote', days: [5], title: 'Test' },
                { author: 'Test', body: 'Monday quote', days: [1], title: 'Test' },
            ];

            const filtered = filterQuotesByPresent(data, quotes);
            expect(filtered).toHaveLength(1);
            expect(filtered[0]!.body).toBe('Friday quote');
        });
    });

    describe('after event filtering', () => {
        it('should match quotes with after.events when current prayer matches', () => {
            const data = createPrayerData(new Date(2022, 3, 1, 12, 0, 0));
            data.date = new Date(data.prayerTimes.isha.getTime() + 30 * 60 * 1000);

            const quotes: Quote[] = [
                { after: { events: ['isha'] }, author: 'Test', body: 'After Isha', title: 'Test' },
                { after: { events: ['fajr'] }, author: 'Test', body: 'After Fajr', title: 'Test' },
            ];

            const filtered = filterQuotesByPresent(data, quotes);
            expect(filtered).toHaveLength(1);
            expect(filtered[0]!.body).toBe('After Isha');
        });
    });

    describe('fallback behavior', () => {
        it('should return generic quotes when no matches found', () => {
            const data = createPrayerData(new Date(2022, 0, 1, 12, 0, 0));

            const quotes: Quote[] = [
                { author: 'Test', body: 'Ramadan only', hijri_months: [9], title: 'Test' },
                { author: 'Test', body: 'Generic quote', title: 'Test' },
            ];

            const filtered = filterQuotesByPresent(data, quotes);
            expect(filtered).toHaveLength(1);
            expect(filtered[0]!.body).toBe('Generic quote');
        });

        it('should return all quotes when no matches and no generic quotes', () => {
            const data = createPrayerData(new Date(2022, 0, 1, 12, 0, 0));

            const quotes: Quote[] = [
                { author: 'Test', body: 'Ramadan only', hijri_months: [9], title: 'Test' },
                { author: 'Test', body: 'Shaban only', hijri_months: [8], title: 'Test' },
            ];

            const filtered = filterQuotesByPresent(data, quotes);
            expect(filtered).toHaveLength(2);
        });
    });

    describe('edge cases', () => {
        it('should handle empty quotes array', () => {
            const data = createPrayerData(new Date(2022, 3, 1, 12, 0, 0));
            const filtered = filterQuotesByPresent(data, []);
            expect(filtered).toHaveLength(0);
        });
    });
});

describe('getRandomQuote', () => {
    it('should return a random quote from filtered results', () => {
        const data = createPrayerData(new Date(2022, 3, 1, 12, 0, 0));

        const quotes: Quote[] = [
            { author: 'Test', body: 'Quote 1', title: 'Test' },
            { author: 'Test', body: 'Quote 2', title: 'Test' },
        ];

        const quote = getRandomQuote(data, quotes);
        expect(quote).not.toBeNull();
        expect(['Quote 1', 'Quote 2']).toContain(quote!.body);
    });

    it('should return null for empty quotes', () => {
        const data = createPrayerData(new Date(2022, 3, 1, 12, 0, 0));
        const quote = getRandomQuote(data, []);
        expect(quote).toBeNull();
    });
});

describe('formatCitation', () => {
    it('should format citation with part number and page', () => {
        const quote: Quote = {
            author: 'al-Albānī',
            body: 'Test',
            part_number: 1,
            part_page: 176,
            title: 'Irwāʾ al-Ġalīl',
        };

        const citation = formatCitation(quote);
        expect(citation).toBe('Irwāʾ al-Ġalīl, 1/176, al-Albānī');
    });

    it('should format citation without part number and page', () => {
        const quote: Quote = { author: 'Test Author', body: 'Test', title: 'Test Title' };
        const citation = formatCitation(quote);
        expect(citation).toBe('Test Title, Test Author');
    });

    it('should handle citation with only part_number', () => {
        const quote: Quote = { author: 'Test Author', body: 'Test', part_number: 1, title: 'Test Title' };
        const citation = formatCitation(quote);
        expect(citation).toBe('Test Title, Test Author');
    });

    it('should handle citation with only part_page', () => {
        const quote: Quote = { author: 'Test Author', body: 'Test', part_page: 176, title: 'Test Title' };
        const citation = formatCitation(quote);
        expect(citation).toBe('Test Title, Test Author');
    });
});
