import { Platform } from 'react-native';

export const KAABA_COORDINATES = { lat: 21.4225241, lon: 39.8261818 };

export function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

export function toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
}

export function normalizeAngle(angle: number): number {
    return angle - 360 * Math.floor(angle / 360);
}

/**
 * Calculate the Qibla bearing from user's location to Kaaba
 * Uses great circle formula
 */
export function calculateQibla(userLat: number, userLon: number): number {
    const term1 = Math.sin(toRadians(KAABA_COORDINATES.lon) - toRadians(userLon));
    const term2 = Math.cos(toRadians(userLat)) * Math.tan(toRadians(KAABA_COORDINATES.lat));
    const term3 = Math.sin(toRadians(userLat)) * Math.cos(toRadians(KAABA_COORDINATES.lon) - toRadians(userLon));
    const angle = Math.atan2(term1, term2 - term3);
    return normalizeAngle(toDegrees(angle));
}

/**
 * Smooth heading transition using low-pass filter
 * Handles angle wrap-around at 0/360 boundary
 */
export function smoothHeading(current: number | null, target: number, smoothing = 0.3): number {
    if (current === null) {
        return target;
    }

    let diff = target - current;
    if (diff > 180) {
        diff -= 360;
    }
    if (diff < -180) {
        diff += 360;
    }

    return normalizeAngle(current + diff * smoothing);
}

export function calculateRelativeRotation(qiblaBearing: number, currentHeading: number): number {
    return normalizeAngle(qiblaBearing - currentHeading);
}

export function isPointingAtQibla(relativeRotation: number, tolerance = 5): boolean {
    return relativeRotation < tolerance || relativeRotation > 360 - tolerance;
}

export type CompassQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unstable';

/**
 * Calculate compass heading quality from recent readings
 */
export function calculateHeadingStability(headingHistory: number[]): { text: string; quality: CompassQuality } | null {
    if (headingHistory.length < 10) {
        return null;
    }

    const recent = headingHistory.slice(-10);
    const variance =
        recent.reduce((acc, val, i, arr) => {
            if (i === 0) {
                return 0;
            }
            let diff = Math.abs(val - (arr[i - 1] ?? 0));
            if (diff > 180) {
                diff = 360 - diff;
            }
            return acc + diff;
        }, 0) / (recent.length - 1);

    if (variance < 1.5) {
        return { quality: 'excellent', text: 'Excellent' };
    }
    if (variance < 4) {
        return { quality: 'good', text: 'Stable' };
    }
    if (variance < 8) {
        return { quality: 'good', text: 'Good' };
    }
    if (variance < 15) {
        return { quality: 'fair', text: 'Fair' };
    }
    return { quality: 'unstable', text: 'Unstable' };
}

/**
 * Interpret iOS compass accuracy value
 */
export function getIOSCompassQuality(accuracy: number): { text: string; quality: CompassQuality } {
    if (accuracy < 0) {
        return { quality: 'excellent', text: 'Excellent' };
    }
    if (accuracy < 15) {
        return { quality: 'good', text: 'Good' };
    }
    if (accuracy < 25) {
        return { quality: 'fair', text: 'Fair' };
    }
    return { quality: 'poor', text: 'Poor - Calibrate' };
}

export function isIOSDevice(): boolean {
    return Platform.OS === 'ios';
}

export function formatDirectionInstruction(relativeRotation: number): string {
    if (relativeRotation < 180) {
        return `${Math.round(relativeRotation)}° right`;
    }
    return `${Math.round(360 - relativeRotation)}° left`;
}

/**
 * Map compass quality to a color hex value for RN styles
 */
export function qualityColor(quality: CompassQuality): string {
    switch (quality) {
        case 'excellent':
        case 'good':
            return '#4ade80';
        case 'fair':
            return '#facc15';
        case 'poor':
        case 'unstable':
            return '#f87171';
    }
}
