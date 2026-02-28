import { useState } from 'react';
import * as Location from 'expo-location';

type LocationState = {
    loading: boolean;
    error: string | null;
};

/**
 * Hook for getting the device's GPS coordinates
 * Uses expo-location for native GPS access
 */
export const useNativeLocation = () => {
    const [state, setState] = useState<LocationState>({ loading: false, error: null });

    const requestLocation = async (): Promise<{
        latitude: number;
        longitude: number;
        city?: string;
        state?: string;
        country?: string;
    } | null> => {
        setState({ loading: true, error: null });

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setState({ loading: false, error: 'Location permission denied' });
                return null;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            let city: string | undefined;
            let region: string | undefined;
            let country: string | undefined;

            try {
                const [geocode] = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });

                if (geocode) {
                    city = geocode.city ?? undefined;
                    region = geocode.region ?? undefined;
                    country = geocode.country ?? undefined;
                }
            } catch {
                // Reverse geocoding is optional
            }

            setState({ loading: false, error: null });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                city,
                state: region,
                country,
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to get location';
            setState({ loading: false, error: message });
            return null;
        }
    };

    return { ...state, requestLocation };
};
