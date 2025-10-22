# PRD Open Questions — Phase 0 Assumptions

This document captures the interim answers or assumptions required to progress with Phase 0. Each unresolved item has a follow-up reference in `docs/issues/phase-0-follow-ups.md`.

## 1. Azure Integration APIs

- **Status:** Unknown
- **Assumption:** Mobile PoC will integrate with a REST façade that mirrors the current Conductor web APIs. GraphQL support will be evaluated post-PoC.
- **Rationale:** Simplifies mock service parity with the existing deterministic data providers.
- **Follow-up:** See Issue `MOB-001`.
- **Resolution:** No API calls. This is a simple PoC. There will be no calls to a backend. Everything is faked in this app.

## 2. Harmony Voice Model

- **Status:** Unknown
- **Assumption:** Phase 1 will rely on on-device speech-to-text (Apple Speech) with mocked streaming responses. Cloud transcription backlog is deferred.
- **Rationale:** Keeps offline demos viable and avoids additional security review before TestFlight.
- **Follow-up:** See Issue `MOB-002`.
- **Resolution:** Keep it simple at all times. On-device is absolutely fine.

## 3. Podcast Generation Source

- **Status:** Unknown
- **Assumption:** Weekly podcasts will be pre-recorded MP3 uploads supplied by the program team. Harmony narrative synthesis is deferred to a later milestone.
- **Rationale:** Allows us to keep deterministic audio assets under `assets/audio`.
- **Follow-up:** See Issue `MOB-003`.
- **Resolution:** We're not building the full functionality. Fake a list of episodes (create the fake data). I will provide two mp3 files with episodes so that there can be one to play by default and a second to select from the list. They will be placed in the /assets/audio folder with date stamp file names. Provide the two dates that you want the files named with.

## 4. KPI Data Structure

- **Status:** Unknown
- **Assumption:** KPI tiles will ingest the same JSON contract currently used by the Excel add-in (ID, name, value, unit, trend, status). Any hierarchical drill-down data will be layered later.
- **Rationale:** Aligns with existing seed data while keeping room for hierarchy expansion.
- **Follow-up:** See Issue `MOB-004`.
- **Resolution:** Selecting Conductor data is a multi-step process. The program hierarchy follows the structure Workspace/Initiative/Workstream/Project, with KPIs available at the Initiative/Workstream/Project levels. KPIs can be at weekly/monthly/yearly frequencies. KPIs are also hierarchical, with Data Categories (e.g., Cost) containing Data Elements (e.g., OpEx, CapEx) containing Measures (e.g., Targets, Forecasts, Actuals), which contain the actual KPI values. An Excel format Playbook has been exported from Conductor and placed in repo as /docs/conductor-transformation-KPIs.xlsx, showing the full hierarchy of the program and all of the values. You can use that as sample data for the program as well.

## 5. Branding Assets

- **Status:** Pending from Design
- **Assumption:** Continue using placeholder gradients and typography from the Conductor marketing site until the finalized mobile brand kit is delivered.
- **Rationale:** Ensures theming tokens remain close to expected palette while allowing drop-in replacements.
- **Follow-up:** See Issue `MOB-005`.
- **Resolution:** These are fine. We'll adjust as we go.

## 6. Third-Party Integrations for Activity Feed

- **Status:** Unknown
- **Assumption:** Simulated feed will prioritise Conductor native events, Microsoft Teams messages, and Jira ticket summaries. Additional integrations logged as stretch items.
- **Rationale:** Matches stakeholder priorities mentioned during kickoff while staying within deterministic mock scope.
- **Follow-up:** See Issue `MOB-006`.
- **Resolution:** No real integrations or API calls. All of this will be faked. Include examples from Conductor, DealCloud, Jira, Microsoft Project, Microsoft Teams, Planview, Salesforce, Microsoft SharePoint, and Smartsheet.
