import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useNativeLocation } from '@/hooks/use-native-location';
import { CALCULATION_METHOD_OPTIONS } from '@/lib/constants';
import { methodLabelMap, methodPresets } from '@/lib/settings';
import { usePrayerStore, useSettings } from '@/store/usePrayerStore';
import type { MethodValue } from '@/types/settings';

const GITHUB_URL = 'https://github.com/ragaeeb/salat10-native';
const PRIVACY_POLICY_URL = `${GITHUB_URL}/blob/main/PRIVACY_POLICY.md`;
const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

const isValidLatitude = (v: string) => {
    const n = Number.parseFloat(v);
    return v !== '' && Number.isFinite(n) && n >= -90 && n <= 90;
};

const isValidLongitude = (v: string) => {
    const n = Number.parseFloat(v);
    return v !== '' && Number.isFinite(n) && n >= -180 && n <= 180;
};

const isValidTimezone = (tz: string) => {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
    } catch {
        return false;
    }
};

export default function SettingsScreen() {
    const router = useRouter();
    const settings = useSettings();
    const updateSettings = usePrayerStore((s) => s.updateSettings);
    const resetSettings = usePrayerStore((s) => s.resetSettings);
    const { loading: locationLoading, error: locationError, requestLocation } = useNativeLocation();
    const [methodPickerVisible, setMethodPickerVisible] = useState(false);

    const [localLat, setLocalLat] = useState(settings.latitude);
    const [localLon, setLocalLon] = useState(settings.longitude);
    const [localTz, setLocalTz] = useState(settings.timeZone);
    const [localFajr, setLocalFajr] = useState(settings.fajrAngle);
    const [localIsha, setLocalIsha] = useState(settings.ishaAngle);
    const [localIshaInt, setLocalIshaInt] = useState(settings.ishaInterval);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const commitField = (field: string, value: string) => {
        const errors = { ...validationErrors };
        delete errors[field];

        if (field === 'latitude' && value !== '' && !isValidLatitude(value)) {
            errors[field] = 'Must be between -90 and 90';
        } else if (field === 'longitude' && value !== '' && !isValidLongitude(value)) {
            errors[field] = 'Must be between -180 and 180';
        } else if (field === 'timeZone' && value !== '' && !isValidTimezone(value)) {
            errors[field] = 'Invalid timezone';
        }

        setValidationErrors(errors);

        if (!errors[field]) {
            updateSettings({ [field]: value });
        }
    };

    const handleUseMyLocation = async () => {
        const result = await requestLocation();
        if (result) {
            const lat = result.latitude.toFixed(4);
            const lon = result.longitude.toFixed(4);
            setLocalLat(lat);
            setLocalLon(lon);
            setValidationErrors({});
            const addressParts = [result.city, result.state, result.country].filter(Boolean);
            updateSettings({
                latitude: lat,
                longitude: lon,
                address: addressParts.join(', '),
                ...(result.city && { city: result.city }),
                ...(result.state && { state: result.state }),
                ...(result.country && { country: result.country }),
            });
        }
    };

    const handleMethodSelect = (value: MethodValue) => {
        const preset = methodPresets[value];
        if (preset) {
            const fajr = preset.fajrAngle.toString();
            const isha = preset.ishaAngle.toString();
            const interval = preset.ishaInterval.toString();
            setLocalFajr(fajr);
            setLocalIsha(isha);
            setLocalIshaInt(interval);
            updateSettings({
                method: value,
                fajrAngle: fajr,
                ishaAngle: isha,
                ishaInterval: interval,
            });
        }
        setMethodPickerVisible(false);
    };

    const handleReset = () => {
        Alert.alert('Reset Settings', 'Are you sure you want to reset all settings to defaults?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reset',
                style: 'destructive',
                onPress: () => {
                    resetSettings();
                    const defaults = usePrayerStore.getState().settings;
                    setLocalLat(defaults.latitude);
                    setLocalLon(defaults.longitude);
                    setLocalTz(defaults.timeZone);
                    setLocalFajr(defaults.fajrAngle);
                    setLocalIsha(defaults.ishaAngle);
                    setLocalIshaInt(defaults.ishaInterval);
                    setValidationErrors({});
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
                    <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
                </Pressable>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                {/* Location Section */}
                <Text style={styles.sectionTitle}>Location</Text>
                <View style={styles.card}>
                    <Pressable style={styles.locationButton} onPress={handleUseMyLocation} disabled={locationLoading} accessibilityRole="button" accessibilityLabel="Use my current location">
                        {locationLoading ? (
                            <ActivityIndicator color={theme.colors.primaryForeground} />
                        ) : (
                            <Ionicons name="navigate" size={18} color={theme.colors.primaryForeground} />
                        )}
                        <Text style={styles.locationButtonText}>
                            {locationLoading ? 'Getting location...' : 'Use My Current Location'}
                        </Text>
                    </Pressable>

                    {locationError && <Text style={styles.errorText}>{locationError}</Text>}

                    {settings.address ? (
                        <Text style={styles.addressText}>{settings.address}</Text>
                    ) : null}

                    <View style={styles.row}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Latitude</Text>
                            <TextInput
                                style={[styles.input, validationErrors.latitude && styles.inputError]}
                                value={localLat}
                                onChangeText={setLocalLat}
                                onBlur={() => commitField('latitude', localLat)}
                                keyboardType="numeric"
                                placeholder="e.g. 43.6532"
                                placeholderTextColor={theme.colors.mutedForeground}
                            />
                            {validationErrors.latitude && <Text style={styles.fieldError}>{validationErrors.latitude}</Text>}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Longitude</Text>
                            <TextInput
                                style={[styles.input, validationErrors.longitude && styles.inputError]}
                                value={localLon}
                                onChangeText={setLocalLon}
                                onBlur={() => commitField('longitude', localLon)}
                                keyboardType="numeric"
                                placeholder="e.g. -79.3832"
                                placeholderTextColor={theme.colors.mutedForeground}
                            />
                            {validationErrors.longitude && <Text style={styles.fieldError}>{validationErrors.longitude}</Text>}
                        </View>
                    </View>

                    <Text style={styles.label}>Timezone</Text>
                    <TextInput
                        style={[styles.input, validationErrors.timeZone && styles.inputError]}
                        value={localTz}
                        onChangeText={setLocalTz}
                        onBlur={() => commitField('timeZone', localTz)}
                        placeholder="e.g. America/Toronto"
                        placeholderTextColor={theme.colors.mutedForeground}
                    />
                    {validationErrors.timeZone && <Text style={styles.fieldError}>{validationErrors.timeZone}</Text>}
                </View>

                {/* Calculation Method Section */}
                <Text style={styles.sectionTitle}>Calculation Method</Text>
                <View style={styles.card}>
                    <Pressable style={styles.methodSelector} onPress={() => setMethodPickerVisible(true)} accessibilityRole="button" accessibilityLabel="Select calculation method">
                        <Text style={styles.methodText} numberOfLines={2}>
                            {methodLabelMap[settings.method] ?? settings.method}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={theme.colors.foreground} />
                    </Pressable>

                    <View style={styles.row}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Fajr Angle</Text>
                            <TextInput
                                style={styles.input}
                                value={localFajr}
                                onChangeText={setLocalFajr}
                                onBlur={() => commitField('fajrAngle', localFajr)}
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.mutedForeground}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Isha Angle</Text>
                            <TextInput
                                style={styles.input}
                                value={localIsha}
                                onChangeText={setLocalIsha}
                                onBlur={() => commitField('ishaAngle', localIsha)}
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.mutedForeground}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Isha Interval (minutes)</Text>
                    <TextInput
                        style={styles.input}
                        value={localIshaInt}
                        onChangeText={setLocalIshaInt}
                        onBlur={() => commitField('ishaInterval', localIshaInt)}
                        keyboardType="numeric"
                        placeholder="0 for angle-based"
                        placeholderTextColor={theme.colors.mutedForeground}
                    />
                    <Text style={styles.hint}>Set to 0 for angle-based Isha calculation</Text>
                </View>

                {/* About Section */}
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.card}>
                    <Pressable
                        style={styles.aboutRow}
                        onPress={() => Linking.openURL(GITHUB_URL)}
                        accessibilityRole="link"
                        accessibilityLabel="Open GitHub repository"
                    >
                        <Ionicons name="logo-github" size={20} color={theme.colors.foreground} />
                        <Text style={styles.aboutText}>Source Code on GitHub</Text>
                        <Ionicons name="open-outline" size={16} color={theme.colors.mutedForeground} />
                    </Pressable>

                    <View style={styles.aboutDivider} />

                    <Pressable
                        style={styles.aboutRow}
                        onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
                        accessibilityRole="link"
                        accessibilityLabel="Read privacy policy"
                    >
                        <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.foreground} />
                        <Text style={styles.aboutText}>Privacy Policy</Text>
                        <Ionicons name="open-outline" size={16} color={theme.colors.mutedForeground} />
                    </Pressable>

                    <View style={styles.aboutDivider} />

                    <View style={styles.aboutRow}>
                        <Ionicons name="information-circle-outline" size={20} color={theme.colors.foreground} />
                        <Text style={styles.aboutText}>Version</Text>
                        <Text style={styles.versionText}>{APP_VERSION}</Text>
                    </View>
                </View>

                {/* Reset */}
                <Pressable style={styles.resetButton} onPress={handleReset} accessibilityRole="button" accessibilityLabel="Reset all settings to defaults">
                    <Ionicons name="refresh" size={18} color={theme.colors.destructive} />
                    <Text style={styles.resetText}>Reset to Defaults</Text>
                </Pressable>
            </ScrollView>

            {/* Method Picker Modal */}
            <Modal visible={methodPickerVisible} animationType="slide" transparent onRequestClose={() => setMethodPickerVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Calculation Method</Text>
                            <Pressable onPress={() => setMethodPickerVisible(false)} accessibilityRole="button" accessibilityLabel="Close method picker">
                                <Ionicons name="close" size={24} color={theme.colors.foreground} />
                            </Pressable>
                        </View>
                        <FlatList
                            data={CALCULATION_METHOD_OPTIONS}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={[
                                        styles.methodItem,
                                        item.value === settings.method && styles.methodItemSelected,
                                    ]}
                                    onPress={() => handleMethodSelect(item.value as MethodValue)}
                                >
                                    <Text
                                        style={[
                                            styles.methodItemText,
                                            item.value === settings.method && styles.methodItemTextSelected,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {item.value === settings.method && (
                                        <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                    )}
                                </Pressable>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    headerSpacer: {
        width: 24,
    },
    headerTitle: {
        fontSize: theme.fontSize['xl'],
        fontWeight: '700',
        color: theme.colors.foreground,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.md,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: '600',
        color: theme.colors.foreground,
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius['3xl'],
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.white15,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.full,
        paddingVertical: 12,
        paddingHorizontal: theme.spacing.md,
        gap: 8,
        marginBottom: theme.spacing.md,
    },
    locationButtonText: {
        fontSize: theme.fontSize.base,
        fontWeight: '600',
        color: theme.colors.primaryForeground,
    },
    errorText: {
        color: theme.colors.destructive,
        fontSize: theme.fontSize.sm,
        marginBottom: theme.spacing.sm,
    },
    addressText: {
        color: theme.colors.secondaryForeground,
        fontSize: theme.fontSize.sm,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    inputGroup: {
        flex: 1,
    },
    label: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.mutedForeground,
        marginBottom: 4,
        marginTop: theme.spacing.sm,
    },
    input: {
        backgroundColor: theme.colors.accent,
        borderRadius: theme.radius.lg,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: theme.colors.foreground,
        fontSize: theme.fontSize.base,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    hint: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.mutedForeground,
        marginTop: 4,
    },
    inputError: {
        borderColor: theme.colors.destructive,
    },
    fieldError: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.destructive,
        marginTop: 2,
    },
    methodSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.accent,
        borderRadius: theme.radius.lg,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    methodText: {
        flex: 1,
        fontSize: theme.fontSize.base,
        color: theme.colors.foreground,
        marginRight: 8,
    },
    aboutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    aboutText: {
        flex: 1,
        fontSize: theme.fontSize.base,
        color: theme.colors.foreground,
    },
    aboutDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.border,
    },
    versionText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.mutedForeground,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: theme.spacing.xl,
        paddingVertical: 12,
    },
    resetText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.destructive,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.black70,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: theme.radius['3xl'],
        borderTopRightRadius: theme.radius['3xl'],
        maxHeight: '70%',
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: '600',
        color: theme.colors.foreground,
    },
    methodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
    },
    methodItemSelected: {
        backgroundColor: theme.colors.white10,
    },
    methodItemText: {
        flex: 1,
        fontSize: theme.fontSize.base,
        color: theme.colors.foreground,
    },
    methodItemTextSelected: {
        fontWeight: '600',
    },
});
