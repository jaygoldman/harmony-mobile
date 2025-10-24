# Conductor Native iOS Port Plan

## iOS, XCode, and Swift versions

Your information about iOS is out of date. The current release of iOS is 26.0.1. The current release of XCode is Version 26.0.1 (17A400). The current version of Swift is 6.2. The installed version of Swift is Apple Swift version 6.2 (swiftlang-6.2.0.19.9 clang-1700.3.19.1). We're targeting iOS 26 for the release and can leverage all the latest iOS features in the build. Read this page if you require more information on current releases: https://developer.apple.com/documentation/ios-ipados-release-notes.

The deploy target is iOS26 and the Swift Language Target = 6.0.

## Naming note

Earlier versions of the app were called Harmony. The app is correctly called "Conductor". Make sure all references to names refer to Conductor. Harmony is the AI in Conductor and the name of the first tab in the app.

## Objectives & Principles

- Deliver a best-in-class, Swift-native Conductor demo that showcases the Liquid Glass interface introduced with iOS 26 while adhering to Apple’s latest Human Interface Guidelines.
- Focus on polished UX for the existing feature set (Harmony chat, activity feed, KPIs, tasks, podcasts, onboarding, settings) without engineering production-scale backend flows.
- Keep the architecture lightweight so designers can iterate quickly—privilege design fidelity, deterministic data, and demo stability over extensibility.
- Rely on native system controls (e.g., `TabView`, `NavigationStack`, `Toolbar`) and layer styling on top—no custom reimplementations of standard UIKit/SwiftUI chrome.
- Maintain essential privacy and accessibility behaviours, deferring complex offline or real-time systems unless they directly support the demo narrative.

## Current React Native Snapshot

- Bottom tab shell with nested stack navigation and a custom glass tab bar (`apps/react-native/src/navigation/MainNavigator.tsx:1`) hosting Harmony, Activity, KPIs, Tasks, Podcasts, and Settings.
- QR-code driven onboarding with developer bypass, secure session persistence, and manual entry flows (`apps/react-native/src/screens/onboarding/WelcomeScreen.tsx:1`, `packages/session/src/sessionStore.ts:1`).
- Chat surface with message bubble rendering, composer expansion, entity metadata, and offline caching (`apps/react-native/src/screens/harmony/HarmonyChatScreen.tsx:1`, `apps/react-native/src/state/mobileDataService.ts:1`).
- Sample data providers and deterministic seeds for activity, tasks, KPIs, and podcasts (`packages/data/seeds/`, `packages/data/src/provider.ts`), surfaced through `loadSampleData`/`loadKpiData`.
- Shared design tokens, typography, and theming exported from `@harmony/theme` (`packages/theme/src/tokens.ts:1`) with custom fonts residing in `assets/fonts/`.
- Support services for async storage, Keychain, developer toggles, and feature flags (`packages/utils/src/storage/`, `packages/config/src/`).
- Documentation, assets, and scripts co-located in the repo; the React Native app already lives inside a workspace-friendly monorepo structure.

## Repository Strategy

- Remain in this repository to retain shared assets, documentation, and issue history. The legacy React Native app now lives under `apps/react-native` (formerly `apps/mobile`) so it can sit alongside the Swift rewrite.
  - Keep `apps/react-native` in maintenance-only mode while the Swift port advances.
  - Stand up `apps/swift-ios` as the new Xcode workspace root. House modular Swift packages under `apps/swift-ios/Packages/` (e.g., `ConductorDesign`, `ConductorData`, `ConductorDemoFeatures`).
  - Keep cross-platform artifacts (docs, seeds, icons) at the repository root; add platform-specific asset catalogs and build scripts inside the Swift workspace.
- This approach avoids repository churn, keeps the legacy app available for QA reference, and enables incremental PRs while the Swift target matures.

## Native Architecture

### Target stack

- Swift 6.2 targeting iOS 26+ to unlock Liquid Glass materials, SwiftUI Observation, and SwiftData.
- SwiftUI-first UI layer with minimal UIKit interop (VisionKit scanning, blur effects) to stay aligned with Apple components.
- Demo content backed by SwiftData or local JSON while retaining the ability to fetch the shared API endpoints.
- Workspace kept intentionally small: one Xcode project with a few Swift packages housing design tokens and feature code.

### Module map

- `ConductorApp`: entry point, navigation shell, and dependency wiring.
- `ConductorDesign`: Liquid Glass palette, typography, spacing, reusable SwiftUI components, SF Symbol mapping, and custom fonts.
- `ConductorDemoFeatures`: Feature folders (Chat, Activity, KPIs, Tasks, Podcasts, Settings, Onboarding) with view models powered by demo data/API responses.

### Navigation & state

- Use the system `TabView`/`UITabBar` for primary navigation, layering Liquid Glass styling via toolbar backgrounds rather than rebuilding the control.
- Drive feature flows with `NavigationStack`/`NavigationPath`, limiting deep-linking to scripted demo journeys.
- Manage state with lightweight `@Observable` view models resolved via a simple dependency container—no heavy singleton graph.

### Data & networking

- Mirror `packages/data/src/types.ts` with Swift `Codable` models mapped directly into view models.
- Back the experience with a `DemoDataStore` that loads curated JSON seeds and delayed responses to simulate production.
- Slim API client that handles bearer tokens, retries once on refresh, and falls back to cached demo payloads when offline.

### Testing & tooling

- Unit tests sit within each Swift package; end-to-end smoke tests live in a mini harness that exercises top-level flows.
- Keep fast iteration with `swift build`/`swift test`, Xcode previews for feature slices, and manual simulator runs for polish.
- Use TestFlight ad-hoc builds (via fastlane or direct archives) for stakeholder reviews; no full CI/CD farm required.

## Migration Phasing

- **Phase 0 – Discovery (1 sprint)**: Confirm Liquid Glass comps, finalise demo journeys, audit API/data needs, freeze RN feature work.
- **Phase 1 – Build (3–4 sprints)**: Scaffold Swift project, port each surface with seeded data + filters/search, implement onboarding/session/token refresh, and align navigation/theming.
- **Phase 2 – Polish & Demo Prep (2 sprints)**: Refine motion/visual polish, run accessibility sweeps, rehearse scripted demos, capture media, and stabilise the RN branch as legacy reference.

## React Native Decommissioning

- Relocate the current React Native app to `apps/react-native` in maintenance mode for reference during the port.
- Freeze RN enhancements once the Swift demo covers required journeys; keep the branch available for fallback demos until leadership retires it.
- Update docs/readme to steer contributors toward the Swift workspace while noting the RN archive status.

## Risks & Mitigations

- **Design ambiguity**: Secure final Liquid Glass comps, typography, and motion specs early to avoid rework.
- **Liquid Glass performance costs**: Profile effects on intended demo hardware; prepare simplified materials if frame rates drop.
- **Sample data gaps**: Audit required storylines and extend JSON seeds before UI work begins.
- **SwiftUI ramp-up**: Pair on initial feature ports and document patterns to keep implementation consistent.
- **Demo stability**: Rehearse scripted flows frequently and lock branches ahead of stakeholder sessions.

## Open Questions (Answered)

- **Design assets**: Extrapolate from the React build while following Apple standards; confirm any motion specifics that need input.
- **Demo journeys**: Cover onboarding, Harmony chat (index/filter/search/@ mentions/new message), activity feed filtering, KPI add/filter, tasks filtering/search/detail, podcasts play/search by entity.
- **Data sources**: All data served from the web app API; keep a local copy only for QR bypass fallback; persist last retrieved data if the web app is unavailable.
- **Hardware & orientation**: Optimise for all current iPhones in portrait; landscape is nice-to-have only.
- **iPad/Mac Catalyst**: Not required for this proof-of-concept.
- **Podcast interactions**: Play/pause support satisfies demo requirements.
- **Developer options**: Unlock QR bypass via seven taps on the onboarding logo; fallback to local seeds if no data retrieved; sign-out (top-left menu) returns to onboarding and resets data on next pairing.

## Task List

1. Confirm the legacy React Native app resides in `apps/react-native`, update workspace references, and scaffold the Swift project under `apps/swift-ios`.
2. Establish the Swift workspace baseline: configure Swift 6.2 target, SwiftUI app shell, Liquid Glass tokens, fonts, and shared glass components.
3. Implement the authentication/onboarding flow: VisionKit QR scan, manual fallback, Keychain persistence for access/refresh tokens + expiries, silent refresh scheduling, and reconnect handling.
4. Build the `ConductorAPIClient` wrapper to inject bearer tokens, pre-emptively refresh via `/api/mobile/token/refresh`, retry once on `401`, and fall back to cached demo data when calls fail.
5. Port navigation: glass `TabView`, feature stacks, developer unlock (7-tap logo) for QR bypass, and sign-out flow that resets cached data on the next pairing.
6. Deliver Harmony Chat: entity filters/search, seeded conversations, @-mention selector between `+` and composer, local message send/response, and Liquid Glass styling.
7. Deliver Activity Feed: scrollable list, top-right filter menu (type/platform/insight), and motion polish that matches the demo narrative.
8. Deliver KPI Dashboard: adaptive grid, tile detail sheet, add-tile flow (+ button with KPI/format/widget flags), and project/workstream filter menu.
9. Deliver Tasks: list with due/project filters, search, inline status indicators, and task detail sheet powered by API data.
10. Deliver Podcasts: list with entity mention search and lightweight in-app mini-player supporting play/pause.
11. Handle data persistence: cache last successful API payloads, load bundled seeds only when QR bypass is used, and reset cached data on first successful pairing after sign-out.
12. Produce a demo checklist/readme outlining user journeys, required data setup, device/orientation guidance, and rehearsal steps for stakeholders.
