import { describe, expect, it } from 'bun:test';
import {
    calculateHeadingStability,
    calculateQibla,
    calculateRelativeRotation,
    formatDirectionInstruction,
    isPointingAtQibla,
    KAABA_COORDINATES,
    normalizeAngle,
    smoothHeading,
    toDegrees,
    toRadians,
} from './qibla';

describe('qibla', () => {
    describe('toRadians', () => {
        it('should convert 0 degrees to 0 radians', () => {
            expect(toRadians(0)).toBe(0);
        });

        it('should convert 180 degrees to PI radians', () => {
            expect(toRadians(180)).toBeCloseTo(Math.PI, 10);
        });

        it('should convert 90 degrees to PI/2 radians', () => {
            expect(toRadians(90)).toBeCloseTo(Math.PI / 2, 10);
        });

        it('should handle negative degrees', () => {
            expect(toRadians(-90)).toBeCloseTo(-Math.PI / 2, 10);
        });
    });

    describe('toDegrees', () => {
        it('should convert 0 radians to 0 degrees', () => {
            expect(toDegrees(0)).toBe(0);
        });

        it('should convert PI radians to 180 degrees', () => {
            expect(toDegrees(Math.PI)).toBeCloseTo(180, 10);
        });

        it('should convert PI/2 radians to 90 degrees', () => {
            expect(toDegrees(Math.PI / 2)).toBeCloseTo(90, 10);
        });

        it('should handle negative radians', () => {
            expect(toDegrees(-Math.PI / 2)).toBeCloseTo(-90, 10);
        });
    });

    describe('normalizeAngle', () => {
        it('should keep angle within 0-360 unchanged', () => {
            expect(normalizeAngle(45)).toBe(45);
            expect(normalizeAngle(180)).toBe(180);
            expect(normalizeAngle(359)).toBe(359);
        });

        it('should normalize 360 to 0', () => {
            expect(normalizeAngle(360)).toBe(0);
        });

        it('should normalize angles above 360', () => {
            expect(normalizeAngle(370)).toBe(10);
            expect(normalizeAngle(720)).toBe(0);
        });

        it('should normalize negative angles', () => {
            expect(normalizeAngle(-10)).toBe(350);
            expect(normalizeAngle(-90)).toBe(270);
            expect(normalizeAngle(-360)).toBe(0);
        });
    });

    describe('calculateQibla', () => {
        it('should calculate Qibla for New York City (approximately 58° NE)', () => {
            const bearing = calculateQibla(40.7128, -74.006);
            expect(bearing).toBeGreaterThan(50);
            expect(bearing).toBeLessThan(65);
        });

        it('should calculate Qibla for London (approximately 118° ESE)', () => {
            const bearing = calculateQibla(51.5074, -0.1278);
            expect(bearing).toBeGreaterThan(110);
            expect(bearing).toBeLessThan(125);
        });

        it('should calculate Qibla for Sydney (approximately 277° W)', () => {
            const bearing = calculateQibla(-33.8688, 151.2093);
            expect(bearing).toBeGreaterThan(270);
            expect(bearing).toBeLessThan(285);
        });

        it('should calculate Qibla for Tokyo (approximately 293° WNW)', () => {
            const bearing = calculateQibla(35.6762, 139.6503);
            expect(bearing).toBeGreaterThan(285);
            expect(bearing).toBeLessThan(300);
        });

        it('should return value between 0 and 360', () => {
            const bearing = calculateQibla(0, 0);
            expect(bearing).toBeGreaterThanOrEqual(0);
            expect(bearing).toBeLessThan(360);
        });

        it('should calculate for location at Kaaba itself', () => {
            const bearing = calculateQibla(KAABA_COORDINATES.lat, KAABA_COORDINATES.lon);
            expect(bearing).toBeGreaterThanOrEqual(0);
            expect(bearing).toBeLessThan(360);
        });
    });

    describe('smoothHeading', () => {
        it('should return target when current is null', () => {
            expect(smoothHeading(null, 100)).toBe(100);
            expect(smoothHeading(null, 0)).toBe(0);
        });

        it('should smooth heading with custom smoothing factor', () => {
            const result = smoothHeading(100, 110, 0.5);
            expect(result).toBeCloseTo(105, 0);
        });

        it('should handle wrap-around from 359 to 1', () => {
            const result = smoothHeading(359, 1, 0.5);
            expect(result).toBeCloseTo(0, 0);
        });

        it('should handle wrap-around from 1 to 359', () => {
            const result = smoothHeading(1, 359, 0.5);
            expect(result).toBeCloseTo(0, 0);
        });

        it('should normalize result to 0-360 range', () => {
            const result = smoothHeading(350, 10, 0.5);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(360);
        });

        it('should not change value when target equals current', () => {
            expect(smoothHeading(180, 180, 0.3)).toBeCloseTo(180, 0);
        });
    });

    describe('calculateRelativeRotation', () => {
        it('should return 0 when heading equals Qibla bearing', () => {
            expect(calculateRelativeRotation(90, 90)).toBe(0);
        });

        it('should calculate clockwise rotation', () => {
            expect(calculateRelativeRotation(90, 80)).toBe(10);
        });

        it('should calculate counter-clockwise rotation', () => {
            expect(calculateRelativeRotation(80, 90)).toBe(350);
        });

        it('should handle wrap-around at 0/360', () => {
            expect(calculateRelativeRotation(10, 350)).toBe(20);
        });

        it('should handle 180-degree difference', () => {
            expect(calculateRelativeRotation(0, 180)).toBe(180);
            expect(calculateRelativeRotation(180, 0)).toBe(180);
        });
    });

    describe('isPointingAtQibla', () => {
        it('should return true when rotation is 0', () => {
            expect(isPointingAtQibla(0)).toBe(true);
        });

        it('should return true when within default tolerance (5°)', () => {
            expect(isPointingAtQibla(4)).toBe(true);
            expect(isPointingAtQibla(356)).toBe(true);
        });

        it('should return false when outside default tolerance', () => {
            expect(isPointingAtQibla(6)).toBe(false);
            expect(isPointingAtQibla(354)).toBe(false);
            expect(isPointingAtQibla(180)).toBe(false);
        });

        it('should respect custom tolerance', () => {
            expect(isPointingAtQibla(8, 10)).toBe(true);
            expect(isPointingAtQibla(352, 10)).toBe(true);
            expect(isPointingAtQibla(11, 10)).toBe(false);
        });
    });

    describe('calculateHeadingStability', () => {
        it('should return null when history has fewer than 10 readings', () => {
            expect(calculateHeadingStability([])).toBeNull();
            expect(calculateHeadingStability([10, 11, 12])).toBeNull();
            expect(calculateHeadingStability([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBeNull();
        });

        it('should return Excellent for very small variance', () => {
            const history = [100, 100.2, 100.4, 100.1, 100.3, 100.5, 100.2, 100.4, 100.1, 100.3];
            const result = calculateHeadingStability(history);
            expect(result?.quality).toBe('excellent');
        });

        it('should return a valid quality for stable readings', () => {
            const history = [100, 101, 102, 103, 102, 101, 102, 103, 101, 102];
            const result = calculateHeadingStability(history);
            expect(result).not.toBeNull();
            expect(['excellent', 'good']).toContain(result!.quality);
        });

        it('should return unstable for large variance', () => {
            const history = [100, 120, 80, 130, 70, 125, 75, 110, 90, 140];
            const result = calculateHeadingStability(history);
            expect(result?.quality).toBe('unstable');
        });
    });

    describe('formatDirectionInstruction', () => {
        it('should format clockwise rotations (< 180°) as "right"', () => {
            expect(formatDirectionInstruction(0)).toBe('0° right');
            expect(formatDirectionInstruction(45)).toBe('45° right');
            expect(formatDirectionInstruction(90)).toBe('90° right');
            expect(formatDirectionInstruction(179)).toBe('179° right');
        });

        it('should format counter-clockwise rotations (>= 180°) as "left"', () => {
            expect(formatDirectionInstruction(180)).toBe('180° left');
            expect(formatDirectionInstruction(270)).toBe('90° left');
            expect(formatDirectionInstruction(315)).toBe('45° left');
            expect(formatDirectionInstruction(359)).toBe('1° left');
        });

        it('should round to nearest integer', () => {
            expect(formatDirectionInstruction(45.6)).toBe('46° right');
            expect(formatDirectionInstruction(45.4)).toBe('45° right');
        });
    });
});
