import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

/**
 * Hook for accessing device compass heading via expo-location's heading API.
 * Uses `watchHeadingAsync` on both iOS and Android for tilt-compensated headings.
 */
export const useNativeCompass = () => {
    const [heading, setHeading] = useState<number | null>(null);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const subscriptionRef = useRef<{ remove: () => void } | null>(null);

    useEffect(() => {
        let mounted = true;

        const start = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (!mounted) return;

                if (status !== 'granted') {
                    setAvailable(false);
                    setError('Location permission required for compass');
                    return;
                }

                setAvailable(true);

                const sub = await Location.watchHeadingAsync((headingData) => {
                    if (!mounted) return;
                    if (headingData.trueHeading >= 0) {
                        setHeading(headingData.trueHeading);
                    } else {
                        setHeading(headingData.magHeading);
                    }
                });

                if (!mounted) {
                    sub.remove();
                    return;
                }

                subscriptionRef.current = sub;
            } catch (err) {
                if (!mounted) return;
                setAvailable(false);
                setError(err instanceof Error ? err.message : 'Failed to start compass');
            }
        };

        start();

        return () => {
            mounted = false;
            subscriptionRef.current?.remove();
            subscriptionRef.current = null;
        };
    }, []);

    return { heading, available, error };
};
