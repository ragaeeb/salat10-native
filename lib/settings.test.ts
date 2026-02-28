import { describe, expect, it } from 'bun:test';
import { createParameters, methodLabelMap, methodPresets } from './settings';

describe('settings', () => {
    describe('methodPresets', () => {
        it('should have Muslim World League preset', () => {
            expect(methodPresets.MuslimWorldLeague).toEqual({ fajrAngle: 18, ishaAngle: 17, ishaInterval: 0 });
        });

        it('should have North America preset', () => {
            expect(methodPresets.NorthAmerica).toEqual({ fajrAngle: 15, ishaAngle: 15, ishaInterval: 0 });
        });

        it('should have all method values', () => {
            const methods = Object.keys(methodPresets);
            expect(methods.length).toBeGreaterThan(0);
            expect(methods).toContain('MuslimWorldLeague');
            expect(methods).toContain('NorthAmerica');
        });
    });

    describe('methodLabelMap', () => {
        it('should map method values to labels', () => {
            expect(methodLabelMap.MuslimWorldLeague).toContain('Muslim World League');
            expect(methodLabelMap.NorthAmerica).toContain('North America - ISNA');
        });

        it('should have labels for all presets', () => {
            const presetKeys = Object.keys(methodPresets);
            const labelKeys = Object.keys(methodLabelMap);
            expect(labelKeys.length).toBe(presetKeys.length);
        });
    });

    describe('createParameters', () => {
        it('should create parameters with correct angle values', () => {
            const params = createParameters({ fajrAngle: 18, ishaAngle: 17, ishaInterval: 0, method: 'MuslimWorldLeague' });
            expect(params.fajrAngle).toBe(18);
            expect(params.ishaAngle).toBe(17);
            expect(params.ishaInterval).toBe(0);
        });

        it('should handle isha interval precedence over angle', () => {
            const params = createParameters({ fajrAngle: 18, ishaAngle: 0, ishaInterval: 90, method: 'Karachi' });
            expect(params.fajrAngle).toBe(18);
            expect(params.ishaInterval).toBe(90);
        });
    });
});
