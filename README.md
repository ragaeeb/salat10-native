# Salat10

An Islamic prayer times app built with React Native and Expo. Displays accurate prayer times, monthly timetables, prayer trend charts, and an AR Qibla compass -- all calculated on-device with no server required.

## Features

- **Daily Prayer Times** — Card view with active prayer highlighting, countdown to next prayer, and day-by-day navigation
- **Monthly Timetable** — Scrollable month view with today highlighted, navigate between months
- **Prayer Trends** — Interactive line chart showing how prayer times shift across a date range, powered by Victory Native + Skia
- **Qibla Finder** — AR compass overlay using the device camera and magnetometer to point toward the Kaaba
- **Hijri Calendar** — Displays the current Islamic date using the Kuwaiti algorithm
- **Motivational Quotes** — Context-aware Islamic quotes filtered by prayer time, Hijri date, and day of week
- **Multiple Calculation Methods** — Supports ISNA, MWL, Egyptian, Karachi, Umm Al-Qura, and more
- **Offline-First** — All calculations happen on-device using the [adhan](https://github.com/batoulapps/adhan-js) library. No API calls needed.
- **OTA Updates** — Bug fixes delivered instantly via Expo Updates without waiting for App Store review

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev/) SDK 55, React Native 0.83 |
| Language | TypeScript 5.9 (strict mode) |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| State | [Zustand](https://zustand.docs.pmnd.rs/) with AsyncStorage persistence |
| Animations | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) 4 |
| Charts | [Victory Native](https://commerce.nearform.com/open-source/victory-native/) + [@shopify/react-native-skia](https://shopify.github.io/react-native-skia/) |
| Prayer Math | [adhan](https://github.com/batoulapps/adhan-js) (astronomical calculations) |
| Package Manager | [Bun](https://bun.sh/) |
| Builds | [EAS Build](https://docs.expo.dev/build/introduction/) |

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Node.js](https://nodejs.org/) >= 18 (required by Expo CLI)
- [EAS CLI](https://docs.expo.dev/eas/) (`npm install -g eas-cli`) for native builds
- An [Expo](https://expo.dev/) account (free)
- Apple Developer Program membership (for iOS device builds)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/ragaeeb/salat10-native.git
cd salat10-native

# Install dependencies
bun install

# Start the development server
bun start
```

On first run, the app will prompt you to set your location. Tap "Use My Current Location" or enter coordinates manually in Settings.

### Running on a Physical Device

Physical devices require a native development build (not just Expo Go) because the app uses native modules (camera, compass, Skia).

```bash
# 1. Log in to EAS
eas login

# 2. Register your iOS device (one-time)
bun run device:register

# 3. Build for your iOS device
bun run build:dev

# 4. Install the build via the QR code / link EAS provides

# 5. Start the dev server
bun start
```

Or use the interactive build menu:

```bash
bun run deploy
```

## Scripts

| Script | Command | When to Use |
|---|---|---|
| `start` | `expo start` | Start the Metro dev server. Use after installing a dev build on your device. |
| `ios` | `expo start --ios` | Start dev server and open iOS simulator. |
| `android` | `expo start --android` | Start dev server and open Android emulator. |
| `web` | `expo start --web` | Start dev server in browser (experimental). |
| `build:dev` | `eas build --profile development --platform ios` | Build a development client for a physical iOS device. |
| `build:dev:android` | `eas build --profile development --platform android` | Build a development client for a physical Android device. |
| `build:dev:all` | `eas build --profile development --platform all` | Build dev clients for both platforms at once. |
| `build:dev:sim` | `eas build --profile development-simulator --platform ios` | Build a development client for the iOS Simulator. |
| `build:preview` | `eas build --profile preview --platform all` | Internal preview build for testing before production. |
| `build:production` | `eas build --profile production --platform all` | Store-ready production build (auto-increments version). |
| `device:register` | `eas device:create` | Register a new iOS device UDID for ad-hoc distribution. |
| `deploy` | `./scripts/build.sh` | Interactive menu that walks through all build options. |

### OTA Updates

After a production build is installed, you can push JavaScript-only changes without a new App Store submission:

```bash
eas update --channel production --message "Fix quote filtering bug"
```

## Project Structure

```
salat10-native/
├── app/                        # Screens (Expo Router file-based routing)
│   ├── (tabs)/                 # Tab navigator screens
│   │   ├── _layout.tsx         #   Tab bar configuration (Prayer Times, Timetable, Qibla)
│   │   ├── index.tsx           #   Home — daily prayer times card + quote
│   │   ├── timetable.tsx       #   Monthly prayer timetable
│   │   └── qibla.tsx           #   AR Qibla compass finder
│   ├── _layout.tsx             # Root stack navigator + error boundary
│   ├── graph.tsx               # Prayer time trends chart
│   ├── settings.tsx            # Location, calculation method, about section
│   └── +not-found.tsx          # 404 fallback
│
├── components/                 # Reusable UI components
│   ├── prayer/
│   │   ├── prayer-times-card.tsx   # Daily prayer times with countdown + navigation
│   │   └── quote-card.tsx          # Motivational quote display with copy + link
│   ├── qibla/
│   │   ├── arrow.tsx               # Animated compass arrow (Reanimated)
│   │   └── info-card.tsx           # Bearing, heading, accuracy readout
│   ├── calendar-picker.tsx     # Pure JS calendar date picker (no native module)
│   └── error-boundary.tsx      # Root error boundary with retry
│
├── hooks/                      # Custom React hooks
│   ├── use-motivational-quote.ts   # Filtered quote selection based on prayer context
│   ├── use-native-compass.ts       # Device heading (iOS: Location API, Android: Magnetometer)
│   └── use-native-location.ts      # GPS + reverse geocoding via expo-location
│
├── lib/                        # Pure business logic (no React imports)
│   ├── calculator.ts           # Prayer time calculation (daily/monthly/yearly)
│   ├── colors.ts               # Color interpolation for sky gradients
│   ├── constants.ts            # Default settings, labels, calculation method options
│   ├── formatting.ts           # Date/time formatting with timezone support
│   ├── hijri.ts                # Gregorian → Hijri calendar conversion
│   ├── prayer-utils.ts         # React hooks for active prayer, countdown, day navigation
│   ├── qibla.ts                # Qibla bearing calculation + compass smoothing
│   ├── quotes.ts               # Quote filtering by prayer, date, Hijri month, weekday
│   ├── settings.ts             # Calculation method presets and parameter creation
│   ├── store-utils.ts          # Pure functions extracted from Zustand store
│   ├── timeline.ts             # Normalize prayer times to [0..1] for animations
│   └── utils.ts                # Timing array helpers
│
├── store/                      # State management
│   └── usePrayerStore.ts       # Zustand store with AsyncStorage persistence
│
├── types/                      # TypeScript type definitions
│   ├── hijri.ts                # HijriDate type
│   ├── prayer.ts               # ComputedPrayerData type
│   ├── quote.ts                # Quote with filtering fields
│   ├── settings.ts             # Settings, MethodValue types
│   └── timeline.ts             # Timeline, DayData, Timing types
│
├── constants/
│   └── theme.ts                # Centralized design tokens (colors, spacing, radii, fonts)
│
├── assets/
│   ├── data/quotes.json        # Islamic quotes database
│   └── images/                 # App icons, splash screens
│
├── scripts/
│   └── build.sh                # Interactive EAS build menu
│
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build profiles (dev, preview, production)
├── tsconfig.json               # TypeScript config with path aliases
├── PRIVACY_POLICY.md           # Privacy policy
└── package.json                # Dependencies and scripts
```

### Architecture Notes

**Data flow**: Settings (Zustand + AsyncStorage) → `adhan` library computes prayer times → React hooks provide derived state to UI components.

**No API calls**: The original web app used a geocoding API. The native app uses `expo-location`'s built-in reverse geocoding instead, keeping everything on-device.

**Calculation auto-refresh**: The Zustand store schedules `setTimeout` at each prayer transition so the active prayer and countdown update automatically.

## Path Aliases

The project uses `@/` path aliases for clean imports:

```typescript
import { theme } from '@/constants/theme';
import { useSettings } from '@/store/usePrayerStore';
import { calculateQibla } from '@/lib/qibla';
```

This is configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**No Babel plugin required.** Since Expo SDK 49+, Metro natively resolves `tsconfig.json` `paths`. Older guides recommend `babel-plugin-module-resolver`, but that is no longer necessary with modern Expo.

## Theming

All colors, spacing, border radii, and font sizes are centralized in `constants/theme.ts`. This mirrors the CSS custom properties from the original web app's `globals.css`.

```typescript
import { theme } from '@/constants/theme';

// Use in StyleSheet
const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius['3xl'],
        padding: theme.spacing.md,
    },
});
```

The app does not use NativeWind or Tailwind CSS. Styles use standard `StyleSheet.create()` with theme tokens for consistency and type safety.

## Troubleshooting

### "No development servers found" after installing dev build

The development build is installed but the Metro dev server isn't running.

```bash
bun start
```

Make sure your phone and computer are on the same Wi-Fi network.

### "Skia prebuilt binaries not found" during EAS build

Bun requires explicit trust for packages with postinstall scripts. The fix is already in `package.json`:

```json
{
  "trustedDependencies": ["@shopify/react-native-skia"]
}
```

If you see this error after adding Skia, run:

```bash
bun add --trust @shopify/react-native-skia
```

### "Unimplemented component: \<RNDateTimePicker\>"

This happens when a native module isn't included in the current development build. The app uses a pure JavaScript `CalendarPicker` component instead of `@react-native-community/datetimepicker` specifically to avoid this -- no native rebuild needed for date picking.

If you add other native modules, you must create a new development build:

```bash
bun run build:dev
```

### Port 8081 already in use

Another Metro instance is running. Kill it first:

```bash
# Find and kill the process on port 8081
lsof -ti:8081 | xargs kill -9

# Then restart
bun start
```

### Qibla compass is jittery or inaccurate

- **iOS**: The app uses `expo-location`'s `watchHeadingAsync` for calibrated true-north heading. If the compass is erratic, open Apple's Compass app and do a figure-8 calibration, then return to Salat10.
- **Android**: Falls back to the raw `Magnetometer` from `expo-sensors`. Keep the device away from magnetic interference (cases with magnets, metal surfaces).
- **Both**: The compass requires location permissions to calculate the Qibla bearing. Make sure location is set in Settings.

### Quotes keep changing rapidly

This was a bug that has been fixed. If you see it, make sure `useMotivationalQuote` uses `useMemo` with `currentData` as the dependency so `getRandomQuote` only runs when the active prayer changes, not on every render tick.

### EAS build fails with "Which account should own this project?"

EAS needs a non-interactive owner. This is already set in `app.json`:

```json
{
  "expo": {
    "owner": "ragaeeb"
  }
}
```

If you fork the project, change this to your own Expo account name and run:

```bash
eas init --non-interactive --force
```

### Camera/compass not working on mobile

- The app must be served over **HTTPS** (camera and sensors are blocked on insecure origins, except localhost).
- Check browser/OS permissions: Settings > Privacy > Camera / Location / Motion.
- **Brave browser** has stricter defaults -- check Settings > Site permissions.
- **iOS Safari**: Check Settings > Safari > Camera / Motion & Orientation Access.

### "navigator is not defined" error during build

Any component that uses browser/device APIs (`navigator`, `window`, etc.) must be wrapped with dynamic import or guarded behind `useEffect`. The Qibla screen is the main example -- it accesses camera and compass APIs that don't exist during SSR/build.

## EAS Build Profiles

| Profile | Use Case | Distribution |
|---|---|---|
| `development` | Day-to-day development on physical devices | Internal (ad-hoc) |
| `development-simulator` | Development on iOS Simulator | Internal |
| `preview` | Testing before production (both platforms) | Internal |
| `production` | App Store / Google Play submission | Store |

Each profile has an associated **update channel** for OTA updates via `expo-updates`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run the dev server and test on a device (`bun start`)
5. Commit and push
6. Open a Pull Request

## Privacy

See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) for full details. In short:

- All prayer calculations happen on-device
- Location is only accessed when you explicitly request it
- No data is sent to any server
- No analytics, no ads, no tracking (analytics may be added in future updates -- see policy)

## License

This project is open source. See the repository for license details.
