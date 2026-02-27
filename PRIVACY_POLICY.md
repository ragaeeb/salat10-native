# Salat10 Privacy Policy

**Effective Date:** February 27, 2026
**Last Updated:** February 27, 2026

Salat10 ("the App") is an open-source Islamic prayer times application developed by Ragaeeb. This privacy policy explains what data the App collects, how it is used, and your choices.

## Data We Collect

### Location Data

The App requests access to your device's location **only when you tap "Use My Current Location"** in Settings. This location data is used to:

- Calculate accurate prayer times for your geographic position
- Determine compass bearing toward the Qibla (direction of the Kaaba in Makkah)
- Reverse-geocode your coordinates into a human-readable city/region name (using your device's built-in geocoding service)

**Your coordinates are stored locally on your device** in the App's settings and are never transmitted to any external server.

### Camera Data

The App requests camera access **only on the Qibla finder screen** to display a live camera preview behind the compass overlay. No images or video are captured, recorded, or transmitted.

### Motion & Compass Data

The App reads the device's magnetometer and orientation sensors to determine compass heading for the Qibla finder. This data is processed in real time on your device and is never stored or transmitted.

### Locally Stored Data

The App stores the following on your device using local storage (AsyncStorage):

- Prayer calculation settings (method, angles, timezone)
- Location coordinates and address label
- City, state, and country name (for display purposes)

This data never leaves your device unless you explicitly choose to share it.

## Data We Do NOT Collect

- **No account or registration required** — the App has no user accounts.
- **No personal information** — we do not collect names, email addresses, phone numbers, or any personally identifiable information.
- **No usage tracking** — the App does not currently track page views, button clicks, or usage patterns.
- **No advertising** — the App contains no ads and does not share data with advertising networks.
- **No third-party analytics** — the App does not currently integrate any analytics SDKs.

## Future Data Practices

We may introduce the following in future updates. This policy will be updated before any such features are enabled:

### Crash Reporting (Planned)

We plan to integrate a crash reporting service (such as Sentry) to help diagnose and fix bugs. If enabled, crash reports may include:

- Device type, OS version, and app version
- Stack traces and error messages
- Breadcrumbs of user interactions leading to the crash (no personal content)

Crash reports **will not** include your location coordinates, prayer settings, or any personally identifiable information.

### Lightweight Analytics (Planned)

We may integrate a privacy-focused analytics service (such as Umami) to understand general usage patterns. If enabled, analytics may include:

- Anonymous page/screen views
- General device and OS information
- Country-level geographic data (never precise coordinates)

Any analytics integration will be:

- **Privacy-first** — no cookies, no fingerprinting, no cross-site tracking
- **Aggregated** — individual users cannot be identified
- **Minimal** — only data necessary to improve the App

## Over-the-Air Updates

The App uses Expo Updates to deliver bug fixes and improvements without requiring a full App Store update. When checking for updates, the following is sent to Expo's servers:

- App version and runtime version
- Platform (iOS/Android)
- Update channel

No personal data or location information is included in update requests.

## Third-Party Services

### On-Device APIs

The App uses the following device-level APIs, which are processed entirely on your device:

- **Location Services** (Apple CoreLocation / Google Play Location) — for GPS coordinates
- **Reverse Geocoding** (device-provided) — to convert coordinates to a place name
- **Camera** (device-provided) — for Qibla AR overlay
- **Magnetometer/Compass** (device-provided) — for compass heading

### Expo Application Services (EAS)

The App is built and distributed via Expo Application Services. Expo's privacy policy applies to the build and update infrastructure: [https://expo.dev/privacy](https://expo.dev/privacy)

## Data Retention

All user data is stored locally on your device. You can delete all App data at any time by:

- Using the "Reset to Defaults" button in Settings
- Uninstalling the App

## Children's Privacy

The App does not knowingly collect any data from children under 13. Since the App collects no personal information, it is suitable for users of all ages.

## Your Rights

Since all data is stored locally on your device, you have full control over it. You can:

- View your settings at any time in the App
- Reset all data using "Reset to Defaults"
- Revoke location, camera, or motion permissions in your device's Settings
- Uninstall the App to remove all stored data

## Open Source

Salat10 is open-source software. You can review the complete source code to verify our data practices:

[https://github.com/ragaeeb/salat10-native](https://github.com/ragaeeb/salat10-native)

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last Updated" date above and will be available in the App and in the source repository.

## Contact

If you have questions about this privacy policy, please open an issue on our GitHub repository:

[https://github.com/ragaeeb/salat10-native/issues](https://github.com/ragaeeb/salat10-native/issues)
