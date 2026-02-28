import quotesData from '@/assets/data/quotes.json';
import { getRandomQuote } from '@/lib/quotes';
import { useCurrentData } from '@/store/usePrayerStore';
import type { Quote } from '@/types/quote';

export type MotivationalQuoteState = { error: boolean; loading: boolean; quote: Quote | null };

export const useMotivationalQuote = (): MotivationalQuoteState => {
    const currentData = useCurrentData();
    const quote = currentData ? getRandomQuote(currentData, quotesData.quotes) : null;

    return { error: false, loading: false, quote };
};
