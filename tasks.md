# Harmony Mobile — iOS-First Execution Plan

This file translates the high-level delivery plan into actionable tasks for Codex agents. Execute work sequentially per phase unless a dependency allows parallelization. Target platform is iOS (iPhone + Watch) first; Android tasks are queued for after iOS TestFlight readiness.

---

## Global Guidelines
- Follow the connection-code authentication contract defined in `mobile-auth.md` for establishing and renewing desktop ↔ mobile sessions.
- Use React Native with shared TypeScript modules and Swift/SwiftUI for native iOS extensions (watch app, widgets, Siri shortcuts).
- Prefer mocked/simulated services until explicit integration tasks are defined.
- Maintain accessibility, dark mode readiness, and performance (60fps target) during implementation.
- Capture reusable UI primitives in a shared component library; avoid duplicating styles.
- Every feature should include snapshot/unit tests where practical and Storybook/demo stories when useful for rapid validation.
- Document developer-mode toggles, sample data contracts, and testing steps as you build.

---

## Phase 0 – Workspace & Foundations
1. Set up React Native monorepo structure, TypeScript configuration, linting, formatting, Husky hooks, and basic CI workflow.
2. Scaffold simulated backend/data providers for chat, activity feed, KPIs, tasks, and podcasts with deterministic seed data.
3. Establish theming system (typography, colors, spacing) and asset pipeline with placeholders for brand resources.
4. Resolve open questions captured in PRD (Azure APIs, voice model, podcast sources, KPI samples, integration priorities) by documenting assumptions and creating follow-up issues if answers are unknown.
5. Implement persistent storage utilities (Keychain wrapper, async storage abstraction) and feature flag/developer mode infrastructure.

---

## Phase 1 – Core iOS Application Shell
1. Implement connection-code onboarding flow:
   - Welcome screens guiding QR scan or manual entry of the 8-character code payload described in `mobile-auth.md`.
   - QR scanner that parses `{ code, apiUrl }`, manual entry fallback that captures both values, and validation/error states for missing or expired codes.
   - Invoke `/api/mobile/connect` with the provided code, handle success, timeout, and 401/expired responses, and surface retry guidance.
   - Persist the returned token, apiUrl, username, display name, and email via secure storage; bootstrap auto-login and connection health checks using stored credentials.
   - Hidden developer shortcut (7 taps) unlocking mock credential bypass and test-mode token injection.
2. Build bottom-tab navigation with Harmony, Activity, KPIs, Tasks, and Podcasts tabs using shared layout primitives and theming.
3. Create baseline UI component library (buttons, cards, inputs, pills, lists, chips) with light/dark mode support.
4. Integrate mock data adapters into each tab to surface placeholder content end-to-end.
5. Create authenticated networking utilities that read the stored token and apiUrl, attach `Authorization: Bearer` headers, detect 401 responses, and trigger the reconnect flow outlined in `mobile-auth.md`.

---

## Phase 2 – Feature Buildout (Tabs)
### Harmony Tab
1. Multi-session chat manager with session list, creation, search, delete, and favorite/star capabilities.
2. Agent mention system:
   - Agent catalog (including acronyms, duplicates where necessary).
   - Mention picker UI with pill insertion/removal logic.
   - Persistent pill formatting for sent messages.
3. Chat UX polish:
   - Message alignment (user right, Harmony/agents left).
   - Typing indicators, simulated latency, fallback responses.
   - Support for text, rich cards, action buttons, and contextual suggestions.
4. Voice mode shell:
   - Toggle, simultaneous input/output, waveform visualization, transcript integration.
   - Background audio handling and permissions.

### Activity Tab
1. Infinite feed with sections, filtering, unread indicators, and simulated update scheduler.
2. Inline actions and deep-link placeholders.
3. Push notification trigger hooks (no system notifications yet).

### KPIs Tab
1. Tile grid with detail views, management flows (add/remove/reorder), and state persistence.
2. KPI hierarchy navigation and saved presets.
3. Data contract alignment with widget requirements.

### Tasks Tab
1. Grouped lists with swipe actions, CRUD flows, reminders placeholder hooks.
2. Detail view with comments/history mock data.

### Podcasts Tab
1. Episode list, detail view, and player UI with background audio support.
2. Download/offline placeholder, new-episode notification hooks.

---

## Phase 3 – Advanced iOS Capabilities
1. Push notifications: local categories, actions, user controls, developer-mode simulator.
2. Widgets & Live Activities: home/lock screen widgets tied to KPI module outputs, data refresh strategies.
3. Harmony voice mode refinement with chosen speech APIs (mock or integrated) including streaming transcript pipeline.
4. Deep linking and Siri intents for key workflows.

---

## Phase 4 – Wearables & Extensions
1. Apple Watch companion app (SwiftUI): Harmony voice chat, KPI glances, task quick view, podcast controls, haptics.
2. Siri Shortcuts, Spotlight indexing, share extension, quick actions.
3. UI polish: motion design, accessibility audits, dark mode tweaks, developer-mode utilities enhancements.

---

## Phase 5 – Stabilization & Release Readiness
1. Comprehensive QA matrix covering voice, offline behavior, background audio, widgets, watch handoff.
2. Bug triage, stabilization, and instrumentation/logging improvements.
3. Prepare TestFlight build, release notes, onboarding instructions, developer-mode documentation, and demo scripts.

---

## Android Follow-On Strategy (Post-TestFlight)
1. Reuse shared React Native core; implement Android-specific storage, navigation, theming (Material You), and vibration feedback.
2. Build Android widgets, quick settings tiles, app shortcuts, and Wear OS experience.
3. Align release process for Android sideload builds once iOS parity baseline is validated.

