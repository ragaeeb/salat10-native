import { useMemo } from 'react';
import quotesData from '@/assets/data/quotes.json';
import { getRandomQuote } from '@/lib/quotes';
import { useCurrentData } from '@/store/usePrayerStore';
import type { Quote } from '@/types/quote';

export type MotivationalQuoteState = { error: boolean; loading: boolean; quote: Quote | null };

export const useMotivationalQuote = (): MotivationalQuoteState => {
    const currentData = useCurrentData();

    const quote = useMemo(() => {
        return currentData ? getRandomQuote(currentData, quotesData.quotes) : null;
    }, [currentData]);

    return { error: false, loading: false, quote };
};
