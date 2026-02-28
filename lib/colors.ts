import { FALLBACK_COLORS, SERIES_COLORS } from './constants';

export const getColorFor = (event: string, index: number) => {
    const fallbackColor = FALLBACK_COLORS[index % FALLBACK_COLORS.length] ?? FALLBACK_COLORS[0] ?? '#60a5fa';
    return SERIES_COLORS[event] ?? fallbackColor;
};
