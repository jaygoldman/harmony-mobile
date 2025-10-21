# PRD Open Questions — Phase 0 Assumptions

This document captures the interim answers or assumptions required to progress with Phase 0. Each unresolved item has a follow-up reference in `docs/issues/phase-0-follow-ups.md`.

## 1. Azure Integration APIs

- **Status:** Unknown
- **Assumption:** Mobile PoC will integrate with a REST façade that mirrors the current Conductor web APIs. GraphQL support will be evaluated post-PoC.
- **Rationale:** Simplifies mock service parity with the existing deterministic data providers.
- **Follow-up:** See Issue `MOB-001`.

## 2. Harmony Voice Model

- **Status:** Unknown
- **Assumption:** Phase 1 will rely on on-device speech-to-text (Apple Speech) with mocked streaming responses. Cloud transcription backlog is deferred.
- **Rationale:** Keeps offline demos viable and avoids additional security review before TestFlight.
- **Follow-up:** See Issue `MOB-002`.

## 3. Podcast Generation Source

- **Status:** Unknown
- **Assumption:** Weekly podcasts will be pre-recorded MP3 uploads supplied by the program team. Harmony narrative synthesis is deferred to a later milestone.
- **Rationale:** Allows us to keep deterministic audio assets under `assets/audio`.
- **Follow-up:** See Issue `MOB-003`.

## 4. KPI Data Structure

- **Status:** Unknown
- **Assumption:** KPI tiles will ingest the same JSON contract currently used by the Excel add-in (ID, name, value, unit, trend, status). Any hierarchical drill-down data will be layered later.
- **Rationale:** Aligns with existing seed data while keeping room for hierarchy expansion.
- **Follow-up:** See Issue `MOB-004`.

## 5. Branding Assets

- **Status:** Pending from Design
- **Assumption:** Continue using placeholder gradients and typography from the Conductor marketing site until the finalized mobile brand kit is delivered.
- **Rationale:** Ensures theming tokens remain close to expected palette while allowing drop-in replacements.
- **Follow-up:** See Issue `MOB-005`.

## 6. Third-Party Integrations for Activity Feed

- **Status:** Unknown
- **Assumption:** Simulated feed will prioritise Conductor native events, Microsoft Teams messages, and Jira ticket summaries. Additional integrations logged as stretch items.
- **Rationale:** Matches stakeholder priorities mentioned during kickoff while staying within deterministic mock scope.
- **Follow-up:** See Issue `MOB-006`.
