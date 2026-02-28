import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { defaultSettings } from "@/lib/constants";
import {
	computePrayerTimesForDate,
	getMillisecondsUntilNextUpdate,
	hasValidCoordinates,
} from "@/lib/store-utils";
import type { ComputedPrayerData } from "@/types/prayer";
import type { Settings } from "@/types/settings";

const STORAGE_KEY = "salat10-native";

const noopStorage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {},
};
const isSSR = Platform.OS === "web" && typeof window === "undefined";

type PrayerStore = {
	settings: Settings;
	currentData: ComputedPrayerData | null;
	hasHydrated: boolean;
	_timeoutId: ReturnType<typeof setTimeout> | null;

	updateSettings: (
		updates: Partial<Settings> | ((prev: Settings) => Settings),
	) => void;
	updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
	resetSettings: () => void;
	computePrayerTimes: (forDate?: Date) => void;

	_scheduleNextUpdate: () => void;
	_clearScheduledUpdate: () => void;
};

export const usePrayerStore = create<PrayerStore>()(
	persist(
		(set, get) => ({
			_clearScheduledUpdate: () => {
				const state = get();
				if (state._timeoutId) {
					clearTimeout(state._timeoutId);
					set({ _timeoutId: null });
				}
			},

			_scheduleNextUpdate: () => {
				if (isSSR) return;

				const state = get();

				if (state._timeoutId) {
					clearTimeout(state._timeoutId);
				}

				const msUntilNext = getMillisecondsUntilNextUpdate(state.currentData);

				if (msUntilNext > 0) {
					const timeoutId = setTimeout(() => {
						get().computePrayerTimes();
						get()._scheduleNextUpdate();
					}, msUntilNext);

					set({ _timeoutId: timeoutId });
				}
			},
			_timeoutId: null,

			computePrayerTimes: (forDate) => {
				const state = get();
				const targetDate = forDate ?? new Date();
				const newData = computePrayerTimesForDate(state.settings, targetDate);
				set({ currentData: newData });
			},
			currentData: null,
			hasHydrated: false,

			resetSettings: () => {
				set((state) => {
					if (state._timeoutId) {
						clearTimeout(state._timeoutId);
					}

					const newData = computePrayerTimesForDate(
						defaultSettings,
						new Date(),
					);

					return {
						_timeoutId: null,
						currentData: newData,
						settings: defaultSettings,
					};
				});

				get()._scheduleNextUpdate();
			},

			settings: defaultSettings,

			updateSetting: (key, value) => {
				get().updateSettings({ [key]: value });
			},

			updateSettings: (updates) => {
				set((state) => {
					const newSettings =
						typeof updates === "function"
							? updates(state.settings)
							: { ...state.settings, ...updates };
					const newData = computePrayerTimesForDate(newSettings, new Date());

					if (state._timeoutId) {
						clearTimeout(state._timeoutId);
					}

					return {
						_timeoutId: null,
						currentData: newData,
						settings: newSettings,
					};
				});

				get()._scheduleNextUpdate();
			},
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => (isSSR ? noopStorage : AsyncStorage)),
			onRehydrateStorage: () => {
				return (state, error) => {
					usePrayerStore.setState({ hasHydrated: true });
					if (error || !state) return;

					if (hasValidCoordinates(state.settings)) {
						state.computePrayerTimes();
						state._scheduleNextUpdate();
					}
				};
			},
			partialize: (state) => ({ settings: state.settings }),
		},
	),
);

export const useSettings = () => usePrayerStore((state) => state.settings);
export const useCurrentData = () =>
	usePrayerStore((state) => state.currentData);
export const useHasValidCoordinates = () =>
	usePrayerStore((state) => hasValidCoordinates(state.settings));
export const useHasHydrated = () =>
	usePrayerStore((state) => state.hasHydrated);

const safeParseFloat = (value: string, fallback = NaN): number => {
	const n = Number.parseFloat(value);
	return Number.isFinite(n) ? n : fallback;
};

export const useNumericSettings = () =>
	usePrayerStore(
		useShallow((state) => ({
			fajrAngle: safeParseFloat(state.settings.fajrAngle),
			ishaAngle: safeParseFloat(state.settings.ishaAngle),
			ishaInterval: safeParseFloat(state.settings.ishaInterval),
			latitude: safeParseFloat(state.settings.latitude),
			longitude: safeParseFloat(state.settings.longitude),
		})),
	);

export const useFajrAngle = () =>
	usePrayerStore((state) => safeParseFloat(state.settings.fajrAngle));
export const useIshaAngle = () =>
	usePrayerStore((state) => safeParseFloat(state.settings.ishaAngle));
export const useIshaInterval = () =>
	usePrayerStore((state) => safeParseFloat(state.settings.ishaInterval));
export const useLatitude = () =>
	usePrayerStore((state) => safeParseFloat(state.settings.latitude));
export const useLongitude = () =>
	usePrayerStore((state) => safeParseFloat(state.settings.longitude));
