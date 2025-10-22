# Conductor Mobile Technology Overview

This document orients new contributors to the Conductor Mobile proof-of-concept. It assumes general software engineering experience but no prior exposure to React Native or iOS tooling.

## High-Level Architecture

- **Monorepo with Yarn workspaces.** `package.json` defines the mobile app in `apps/` and shared libraries in `packages/`. Tooling (TypeScript config, Babel, Jest) lives at the repository root so code can be shared across packages without relative import spaghetti.
- **React Native runtime.** The JS entry point (`apps/mobile/index.js`) registers the `App` component with the native host. `ios/` and `android/` contain the standard React Native platform scaffolding; you rarely touch them unless adding native modules.
- **Module aliases.** `babel.config.js` and `tsconfig.base.json` alias `@harmony/*` to the corresponding workspace source folders so imports stay stable across the monorepo.
- **Metro bundler setup.** `metro.config.js` extends the default configuration to treat SVGs as source files (transformed with `react-native-svg-transformer`) and watches shared packages for live reload.

```
apps/mobile/App.tsx
 └─ ThemeProvider (@harmony/theme)
    └─ SessionProvider (@harmony/session)
       └─ RootNavigator (react-navigation)
          ├─ Onboarding flow (session bootstrap)
          └─ Main tab flow (data-driven tabs)
```

## Toolchain & Supporting Libraries

- **Yarn 1 workspaces.** Provides monorepo dependency hoisting, per-package scripts (`yarn workspace @harmony/mobile ios`), and a single lockfile. Avoids duplicate installs of React Native and shared dependencies.
- **React Native CLI.** Generates and maintains the native iOS (`ios/`) and Android (`android/`) shells, wraps Metro, and exposes `react-native run-ios/run-android` commands invoked from the app workspace scripts.
- **Metro bundler.** React Native’s incremental bundler handles module resolution, fast refresh, asset packaging, and live reloading. Our config adds:
  - `watchFolders` so changes under `packages/` trigger reloads.
  - A custom transformer (`react-native-svg-transformer`) so SVG assets can be imported like components.
- **Babel.** Transpiles modern TypeScript/JSX into Metro-compatible JavaScript. `babel.config.js` uses:
  - `metro-react-native-babel-preset` for React Native syntax, class properties, optional chaining, etc.
  - `babel-plugin-module-resolver` to implement the `@harmony/*` import aliases that match the TypeScript path mapping.
- **TypeScript.** Provides static typing across apps and packages. `tsconfig.base.json` defines common compiler settings, JSX target (`react-native`), global types, and path aliases. `tsconfig.json` at the root enables project-wide type checking via `yarn typecheck`.
- **React Navigation.** (@react-navigation/native, /native-stack, /bottom-tabs) powers the onboarding stack navigator and tabbed main experience. It depends on:
  - `react-native-screens` for native-backed screen primitives.
  - `react-native-gesture-handler` for consistent cross-platform gestures.
  - `@react-navigation/bottom-tabs` for the tab bar.
- **UI runtime helpers.**
  - `react-native-safe-area-context` exposes device safe area insets so layouts avoid notches.
  - `react-native-svg` renders vector icons and illustrations (paired with the Metro transformer above).
- **Storage bridges.**
  - `@react-native-async-storage/async-storage` (pulled in as a peer of `@harmony/utils`) offers key/value persistence. When unavailable (tests), the wrapper falls back to an in-memory map.
  - `react-native-keychain` (also a peer dependency) stores sensitive data like session tokens securely; the wrapper likewise degrades to memory for non-device environments.
- **Testing stack.** Jest (`jest.config.js`) uses the React Native preset, while `jest.setup.js` polyfills timers, mocks Reanimated and gesture handler shims, and silences noisy warnings so component tests run in Node.
- **Linting & formatting.** ESLint (with React, React Native, TypeScript plugins) enforces code style; Prettier handles formatting. `lint-staged` plus `husky` run both on staged files before commits.
- **Quality scripts.** Root-level scripts (`lint`, `typecheck`, `test`, `ci`) orchestrate the checks above; the mobile workspace re-exports platform commands (`start`, `ios`, `android`).

## Runtime Composition

- **App shell (`apps/mobile/App.tsx`).** Wraps the app in `ThemeProvider`, `SafeAreaProvider`, and the session context before mounting `RootNavigator`.
- **Navigation.** `RootNavigator` (apps/mobile/src/navigation/RootNavigator.tsx) chooses between the onboarding stack (`OnboardingNavigator`) and the main tab navigator (`MainNavigator`) based on session status. Both navigators are built with `@react-navigation` (stack + bottom tabs).
- **Screen patterns.** Tab screens (Harmony, Activity, KPIs, Tasks, Podcasts) follow the same template: fetch data through `useAsyncList`, show a loading indicator (`LoadingState`) until the list resolves, render cards styled via the theme system, and surface recoverable errors with `StateMessage`.

## Session Lifecycle & Persistence

- **Session store (`@harmony/session`).** `createSessionStore` encapsulates connection logic. It talks to the backend via `fetch`, validates QR/code payloads, and persists the resulting session in secure storage.
  - Tokens and user details are kept in the platform keychain through the `secureStorage` wrapper.
  - Lightweight session status is duplicated into async storage (`AsyncStorage`) so the app can restore state quickly at launch.
- **SessionProvider.** A single instance is created in `apps/mobile/src/state/SessionProvider.tsx`, exposes the store through React context, and subscribes components to state changes. `RootNavigator` relies on this context to gate the navigation flow.
- **Onboarding screens.** `WelcomeScreen` embeds the QR scanner while `ManualEntryScreen` provides the fallback form. Both call `session.connect` and surface validation errors. The temporary `DeveloperToolsScreen` can inject mock credentials via the developer settings store (see below).

## Shared Packages (the `@harmony/*` namespace)

- **`@harmony/theme`.** Owns design tokens (`tokens.ts`), constructs light/dark themes (`theme.ts`), and exports `ThemeProvider` plus hooks (`useTheme`, `useHarmonyTheme`). React Native styles rely on these values for spacing, typography, and color consistency.
- **`@harmony/data`.** Supplies deterministic, in-memory data providers backed by JSON seeds (`packages/data/seeds/*.json`). Factories like `createActivityProvider` and `createChatStore` simulate latency, generate stable IDs, and expose a `HarmonyDataClient` composed in `createHarmonyDataClient`. UI code (via `dataClient` from `apps/mobile/src/state/stores.ts`) reads from this layer while real APIs are still under development.
- **`@harmony/session`.** Described above; includes TypeScript definitions for session payloads and the state machine that orchestrates connect/disconnect flows.
- **`@harmony/config`.** Houses the developer settings store and feature flag client.
  - `createFeatureFlagClient` persists boolean flags in async storage and notifies subscribers.
  - `createDeveloperSettingsStore` layers on extra fields (mock latency toggle, QR bypass, stored credentials) and synchronises overrides back into the feature flag client.
- **`@harmony/navigation`.** Provides centralized route constants so tab/stack names stay in sync.
- **`@harmony/utils`.** Wraps platform persistence primitives (`asyncStorage`, `secureStorage`). Both wrappers fall back to an in-memory implementation when native modules are unavailable (e.g., unit tests or Storybook), which keeps APIs consistent across environments.

## Data Flow in the Main Tabs

1. Each screen pulls the singleton `dataClient` from `apps/mobile/src/state/stores.ts`.
2. `useAsyncList` (apps/mobile/src/hooks/useAsyncList.ts) handles the async lifecycle: loading, pull-to-refresh, caching with `useState`, and error propagation.
3. The data client proxies to the relevant provider (`activity`, `kpis`, `tasks`, `podcasts`, `chat`). Providers read from frozen seed objects and return clones, which keeps the fake data immutable outside the package.
4. Screens transform the data into presentational cards and rely on the theme tokens for styling.

Because everything is in-memory today, fetching is effectively instant. The fake providers inject a small timeout so the loading states are still exercised.

## Developer Controls & Feature Flags

- **Hidden tap gesture.** On the welcome screen, tapping the header seven times toggles `qrBypassEnabled` through `developerSettingsStore`, revealing the Developer Tools entry.
- **Developer Tools screen.** Allows engineers to:
  - Inject a canned session (`MOCK_SESSION_DETAILS`) for end-to-end demos.
  - Re-apply stored QR bypass credentials from secure storage.
  - Clear the bypass and force a disconnect.
- **Feature flag metadata.** Flags such as `enableOfflinePodcasts` or `enableHarmonyVoiceMode` live entirely on-device today but mirror how remote configuration will behave later.

## Assets, Fonts, and Native Glue

- **Assets directory.** Brand imagery, fonts, and audio live under `assets/`; see `docs/asset-pipeline.md` for conventions.
- **Font linking.** `react-native.config.js` (at the repo root) points React Native CLI to `assets/fonts`. After adding fonts, run `npx react-native-asset` so iOS projects copy them.
- **Native projects.** Auto-generated `ios/` and `android/` folders are present because this app targets the vanilla React Native CLI, not Expo. You only edit them when adding native dependencies that require manual integration.

## Tooling & Quality Gates

- **TypeScript everywhere.** `tsconfig.json` pulls in `apps`, `packages`, and root configs so cross-package imports are type-checked. Screens/components compile with the `react-native` JSX target.
- **Linting & formatting.** `yarn lint` runs ESLint across apps and packages; Prettier handles formatting (configured via `lint-staged` for pre-commit checks).
- **Testing.** Jest uses the React Native preset (`jest.config.js`), plus setup in `jest.setup.js` to mock out gesture handlers, Reanimated, animation timers, and other native shims.
- **Scripts.** `apps/mobile/package.json` exposes the usual `react-native` CLI commands (`yarn ios`, `yarn android`, `yarn start`). Top-level `yarn ci` chains lint, type-check, and tests.

## Getting Oriented Quickly

1. Install dependencies: `yarn install` at the repository root.
2. Launch Metro: `yarn workspace @harmony/mobile start`.
3. In a second terminal, run `yarn workspace @harmony/mobile ios` (or `android`) to boot the native shell.
4. When the app loads:
   - Go through onboarding with the QR simulation or manual entry.
   - Explore the tab screens backed by the seeded data providers.
   - Use the hidden tap gesture on the welcome screen to unlock developer tools if you need to inject a mock session.

Refer back to this doc when you need to locate code, understand how data flows through the app, or reason about shared modules. The monorepo layout is intentionally shallow so you can move from JS/TS code to native projects and back without switching contexts.
