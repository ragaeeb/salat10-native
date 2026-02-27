import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';

/**
 * Hook for accessing device compass heading.
 *
 * On iOS, uses expo-location's heading API (wraps CLLocationManager) which
 * returns a true-north heading already corrected for magnetic declination.
 * On Android, falls back to the Magnetometer with manual atan2 calculation.
 */
export const useNativeCompass = () => {
    const [heading, setHeading] = useState<number | null>(null);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const subscriptionRef = useRef<{ remove: () => void } | null>(null);

    useEffect(() => {
        let mounted = true;

        const startIOS = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (!mounted) return;

                if (status !== 'granted') {
                    setAvailable(false);
                    setError('Location permission required for compass on iOS');
                    return;
                }

                setAvailable(true);

                subscriptionRef.current = await Location.watchHeadingAsync((headingData) => {
                    if (!mounted) return;
                    if (headingData.trueHeading >= 0) {
                        setHeading(headingData.trueHeading);
                    } else {
                        setHeading(headingData.magHeading);
                    }
                });
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Failed to start compass');
            }
        };

        const startAndroid = async () => {
            try {
                const isAvailable = await Magnetometer.isAvailableAsync();
                if (!mounted) return;

                setAvailable(isAvailable);

                if (!isAvailable) {
                    setError('Magnetometer not available on this device');
                    return;
                }

                Magnetometer.setUpdateInterval(200);

                subscriptionRef.current = Magnetometer.addListener((data) => {
                    if (!mounted) return;
                    const { x, y } = data;
                    let angle = Math.atan2(y, x) * (180 / Math.PI);
                    angle = (angle + 360) % 360;
                    setHeading(angle);
                });
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Failed to start compass');
            }
        };

        if (Platform.OS === 'ios') {
            startIOS();
        } else {
            startAndroid();
        }

        return () => {
            mounted = false;
            subscriptionRef.current?.remove();
            subscriptionRef.current = null;
        };
    }, []);

    return { heading, available, error };
};
