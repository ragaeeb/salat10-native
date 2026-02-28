# AGENTS.md

This file provides operational context and conventions for AI agents working in this repository.

## Project Summary

`salat10-native` is an Expo + React Native Islamic prayer times app.

Core product features:
- Daily prayer times (on-device calculation via `adhan`)
- Monthly timetable
- Prayer trends graph (`victory-native` + Skia)
- Qibla finder (camera overlay + heading sensors)
- Hijri date and motivational quote display

No backend is required for core app behavior.

## Tech Stack

- Expo SDK 55
- React Native 0.83
- TypeScript (strict)
- Expo Router (file-based navigation)
- Zustand + AsyncStorage persistence
- Bun package manager
- EAS Build / EAS Update

## Repo Structure

- `app/`: Expo Router screens and layouts
  - `app/_layout.tsx`: root navigator + status/splash behavior
  - `app/(tabs)/`: tabbed screens (`index`, `timetable`, `qibla`)
  - `app/settings.tsx`: user settings form
  - `app/graph.tsx`: prayer trend chart
- `components/`: UI components (`prayer/*`, `qibla/*`, `calendar-picker`, error boundary)
- `hooks/`: native integration hooks (`use-native-location`, `use-native-compass`, quote hook)
- `store/usePrayerStore.ts`: persisted global app state
- `lib/`: pure business logic (calculation, formatting, qibla math, quote filtering)
- `types/`: app types
- `constants/theme.ts`: design tokens
- `assets/`: images, fonts, quotes data
- `scripts/build.sh`: interactive EAS build helper

## Commands

Use Bun for all workflows.

- Install deps: `bun install`
- Start app: `bun start`
- iOS dev: `bun ios`
- Android dev: `bun android`
- Typecheck: `bunx tsc --noEmit`
- Expo health checks: `bunx expo-doctor`
- Dependency alignment check: `bunx expo install --check`

Do not use `npm` scripts/installs in this repo unless explicitly requested.

## Coding Conventions

- TypeScript target/style: prefer modern ESNext features.
- Prefer `type` over `interface`.
- Prefer arrow functions over `function` declarations.
- Keep logic in `lib/*` pure where possible.
- Reuse centralized theme tokens from `constants/theme.ts`.
- Use `@/*` path aliases instead of deep relative imports.
- For React Native / Expo packages, use `bunx expo install <pkg>` to ensure SDK compatibility. Do not use `@latest` for Expo-managed packages.
- For non-Expo packages, use `bun add <pkg>` (latest by default).

## Testing Conventions

- Test framework: `bun:test`.
- Test naming convention: `it('should ...')`.
- **Test file placement**: Co-locate tests adjacent to the implementation file, NOT in a `__tests__` folder.
  - Example: `lib/calculator.ts` → `lib/calculator.test.ts`
  - Example: `lib/hijri.ts` → `lib/hijri.test.ts`
- Native modules (`react-native`, `expo-localization`) are mocked in `test/setup.ts` via `bunfig.toml` preload.
- Prioritize tests around:
  - prayer calculation and formatting
  - qibla math/smoothing
  - settings validation/sanitization
  - quote filtering behavior

## App Behavior Notes

- Prayer times and date-based behavior are sensitive to:
  - timezone validity
  - coordinate validity and range
  - method parameter parsing
- Qibla depends on heading + location permissions.
- Store hydration state gates initial UI rendering.

When changing these areas, validate both success and denied/invalid states.

## Release / Submission Expectations

Before release or store submission:

1. `bunx tsc --noEmit` passes.
2. `bunx expo-doctor` passes.
3. App assets and config in `app.json` pass schema checks.
4. Permission prompts and privacy behavior match actual runtime use.

## Agent Working Rules

- Make minimal, targeted changes.
- Do not revert unrelated user changes.
- Prefer non-destructive commands.
- If you discover unexpected workspace modifications, pause and confirm how to proceed.
- Update docs when behavior or setup changes.
