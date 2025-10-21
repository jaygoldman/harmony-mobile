# Harmony Mobile - Product Requirements Document (PoC)

**Version:** 1.0  
**Date:** January 21, 2025  
**Platform:** iOS (iPhone 15 Pro Max) and Android  
**Deployment:** TestFlight (iOS) and Sideloading (Android)

---

## Executive Summary

Harmony Mobile is a proof-of-concept mobile application for Conductor by Sensei Labs. The app provides on-the-go access to AI-powered insights, KPI tracking, activity monitoring, task management, and AI-generated program updates via podcast format. This PoC aims to validate the mobile experience and gather feedback before full production development.

---

## 1. Project Scope & Goals

### Goals
- Validate mobile UX patterns for Conductor's core workflows
- Demonstrate AI integration (Harmony) in a mobile context
- Prove feasibility of real-time notifications and widget support
- Test cross-platform (iOS/Android) feature parity
- Explore wearable (Apple Watch/Android Wear) integration opportunities

### Non-Goals (for PoC)
- Production-grade backend integration
- Full authentication/authorization system
- Complete feature parity with Conductor web platform
- App Store public release

### Success Metrics
- Successfully deploy to TestFlight and Android sideload
- Demonstrate all 5 core tabs with simulated data
- Functioning QR code authentication flow
- Working home screen widgets and notifications
- Basic wearable app functionality

---

## 2. Authentication & Onboarding

### QR Code Authentication Specification

#### Web App Requirements (Azure Single Page App)
The Conductor web app will include an "Add Conductor Mobile" feature with the following specifications:

**QR Code Generation:**
- Generate new QR code every 3 minutes for security
- QR code encodes a JSON payload with the following structure:
```json
{
  "version": "1.0",
  "instanceUrl": "https://customer.getconductor.com",
  "authToken": "temporary-jwt-token-here",
  "userId": "user-uuid",
  "workspaceId": "workspace-uuid",
  "expiresAt": "2025-01-21T17:30:00Z",
  "deviceId": "generated-device-uuid"
}
```

**Security Requirements:**
- authToken is a temporary JWT valid for 10 minutes
- Once scanned and authenticated, the token becomes invalid
- Device registration completes the handshake and issues long-term credentials
- Support for multiple device registrations per user

**Display Requirements:**
- Show QR code prominently in desktop browser
- Display countdown timer showing time until next QR refresh
- Instructions: "Scan this code with the Harmony Mobile app"
- Status indicator when successfully scanned

#### Mobile App Requirements

**First Launch Experience:**
1. Welcome screen with Conductor/Harmony branding
2. Instructions:
   - "To get started, open Conductor in your browser"
   - "Navigate to Settings → Mobile Devices → Add Conductor Mobile"
   - "Scan the QR code displayed on your screen"
3. "Scan QR Code" button → Opens camera with QR scanner overlay
4. Visual feedback when QR detected
5. Loading state during authentication
6. Success animation → Navigate to main app
7. **Hidden Developer Shortcut:** Tap logo/title 7 times rapidly to reveal "Skip Authentication" button that bypasses QR flow with mock credentials (for PoC testing/demos)

**QR Scanner Technical Requirements:**
- Use device camera with real-time QR detection
- Haptic feedback on successful scan (iOS) / vibration (Android)
- Error handling for invalid/expired codes
- Timeout after 30 seconds of no detection
- Manual retry option

**Persistent Authentication:**
- Store long-term credentials securely (Keychain on iOS, KeyStore on Android)
- Auto-login on subsequent app launches
- Support for re-authentication/device re-linking
- "Sign Out" option in settings

---

## 3. Core Features

### 3.1 Harmony Tab (AI Chat)

**Primary Function:** AI-powered conversational interface for Conductor insights

**Features:**
- **Multiple Chat Sessions**
  - Create new chat
  - List previous chats with titles (auto-generated from first message)
  - Search across chat history
  - Delete individual chats
  - Star/favorite important chats

- **Agent System**
  - Pre-defined expert agents accessible via @ mentions:
    - @CFOAgent: financial oversight, benefits realization, budget vs. plan, Return on Investment (ROI) analysis.
    - @ChiefRiskOfficerAgent: enterprise risk management, dependency failure scenarios, mitigation planning.
    - @ChiefComplianceOfficerAgent: regulatory alignment, audit preparedness, compliance horizon scanning.
    - @ChiefTechnicalOfficerAgent: technical feasibility, integration architecture, technical debt implications.
    - @ChiefTransformationOfficerAgent: strategic alignment, prioritization, benefits tracking.
    - @ChiefProcurementOfficerAgent: vendor dependencies, contract risks, savings alignment.
    - @PMODirectorAgent: delivery assurance, governance orchestration, team performance.
    - @ResourcingAgent: determine whether sufficient resourcing is available, workloads, and burnout
    - @ChangeManagementAgent: workforce readiness, change fatigue signals, capacity modeling, adoption modeling, training gaps, stakeholder sentiment.
    - @LegalAgent: contract exposure, regulatory obligations.
  - Include an @ icon in the chat that will show a list of these agents with their name and description
  - Show the name in bold and larger and the description below and smaller
  - Support accronyms for each, like CRO, CTO, CPO. Show multiple entries if they share the same accronym.
  - Display agent name in a pill in the chat text box with the ability to backspace remove it or tap an x in the pill
  - Keep pill formatting without the ability to remove when a message has been posted to chat
  - User messages should be on the right, right-aligned, while Harmony and agent messages are left, left-aligned like a standard messaging app.

- **Voice Mode**
  - Toggle voice input/output
  - Once in voice mode, user should be able to talk and listen at the same time without switching modes, like ChatGPT's voice mode
  - Visual waveform during speech
  - Text transcript of voice interactions added into a chat, with the user as though they had typed and Harmony responding
  - Background audio support

- **Message Types**
  - Text messages (user and Harmony)
  - Rich cards with data visualizations
  - Action buttons (e.g., "Create Task", "View in Conductor")
  - Contextual suggestions

**Simulated Behavior:**
- Local LLM-style responses with realistic latency (1-3s)
- Pre-scripted responses for common queries
- Fallback responses for unrecognized input
- Simulated "thinking" indicators

---

### 3.2 Activity Tab

**Primary Function:** Real-time feed of updates from Conductor, integrations, and Harmony insights

**Entry Types:**
- **Conductor Events**
  - Approval Requests
  - Deal Updates
  - File Changes
  - Harmony Briefings
  - Industry News
  - KPI Changes
  - Market Signals
  - Meeting Scheduled
  - Messages
  - Milestone Updates
  - Project Changes
  - Regulatory Updates
  - Story Updates
  - Task Updates

- **Third-Party Platform Updates**
  - Conductor
  - DealCloud
  - Harmony Insights
  - Jira
  - Microsoft Project
  - Microsoft Teams
  - Planview
  - Salesforce
  - SharePoint
  - Smartsheet

- **Harmony Insights**
  - Competitor Activity
  - Customer Behavior
  - Harmony Briefings
  - Market Trends
  - Opportunities
  - Risk Alerts

**Features:**
- **Feed Display**
  - Infinite scroll with pull-to-refresh
  - Entry cards with icon, title, description, timestamp
  - Unread indicators
  - Grouped by date (Today, Yesterday, This Week, etc.)
  - Tap to expand full details

- **Filtering**
  - Filter by Activity Type (Tasks, Budget, Risks, etc.)
  - Filter by Platform (Conductor, M365, Jira, etc.)
  - Filter by Harmony Insight Type (Risk, Optimization, Anomaly)
  - Multi-select filters with badge count
  - Save filter presets

- **Simulated Updates**
  - Random interval generation (every 2-10 minutes)
  - Variety of entry types
  - Push notification on new high-priority items

- **Actions**
  - Mark as read/unread
  - Quick actions (e.g., "View Task", "Acknowledge Risk")
  - Share entry externally

---

### 3.3 KPIs Tab

**Primary Function:** Dashboard of key performance indicators with widget support

**Dashboard Features:**
- **Tile Grid Layout**
  - Responsive grid (2 columns on phone, 3+ on tablet)
  - Drag-to-reorder tiles
  - Tap to view full KPI details
  - Visual indicators (trend arrows, sparklines, status colors)

- **Tile Types**
  - Numeric KPI (single value with trend)
  - Progress bar (% complete)
  - RAG status (Red/Amber/Green)
  - Mini chart (line/bar sparkline)
  - Summary tile (multiple related KPIs)

- **Add/Manage Tiles**
  - "+" button to add new tiles
  - Navigate Conductor hierarchy:
    - Workspace → Initiative → Workstream → Project
  - Select from available KPIs at each level
  - Remove tiles with swipe-to-delete or edit mode
  - Save configurations per user

**Home Screen Widget Support:**

**iOS Widgets:**
- Small widget: 1-2 KPIs
- Medium widget: 2-4 KPIs
- Large widget: 4-6 KPIs
- Support for widget stacks
- Live Activity for real-time critical KPIs
- Lock Screen widgets (iOS 16+)

**Android Widgets:**
- Small (2x2): 1 KPI
- Medium (4x2): 2-3 KPIs
- Large (4x4): 4-6 KPIs
- Resizable widgets
- Material You theming support

**Widget Technical Requirements:**
- Update frequency: Every 15 minutes or on-demand
- Tap widget → Deep link to KPI detail in app
- Low battery impact (efficient refresh strategy)
- Offline fallback with last known values

**KPI Detail View:**
- Full chart history
- Breakdown by sub-components
- Historical trend analysis
- Export/share options
- Related tasks/risks

---

### 3.4 Tasks Tab

**Primary Function:** Personal task list from Conductor

**Features:**
- **Task List Display**
  - All outstanding tasks assigned to user
  - Grouped by: Due Date, Workspace, Initiative, Workstream, Project, Priority
  - Swipe actions (Complete, Snooze, Reassign)
  - Visual priority indicators
  - Due date badges with color coding

- **Task Details**
  - Title, description, assignee
  - Due date with calendar integration
  - Associated project/workstream
  - Attachments/links
  - Comments/activity log
  - Subtasks checklist

- **Actions**
  - Mark complete (with completion animation)
  - Add new task (quick entry)
  - Edit task details
  - Set reminders
  - Share task

- **Filters & Sorting**
  - Filter: All, Today, This Week, Overdue
  - Sort: Due Date, Priority, Project, Recently Added
  - Search tasks

- **Notifications**
  - Due date reminders
  - New task assignments
  - Task updates from collaborators

---

### 3.5 Podcasts Tab

**Primary Function:** Daily Harmony AI-generated program update podcasts

**Features:**
- **Now Playing Section (Top Pane)**
  - Episode artwork
  - Episode title and date
  - Description (2-3 sentences)
  - Duration
  - Playback controls:
    - Play/Pause
    - 15s forward/backward
    - Playback speed (0.5x, 1x, 1.25x, 1.5x, 2x)
    - Progress bar with scrubbing
  - AirPlay/Bluetooth device selector

- **Episode List (Below)**
  - Reverse chronological order
  - Episode card with:
    - Thumbnail
    - Title (e.g., "Program Update - January 21, 2025")
    - Short description
    - Duration (e.g., "4:23")
    - Date
    - Play button
  - Tap any episode → Moves to "Now Playing"
  - Downloaded indicator (offline playback)

- **Episode Generation**
  - Daily at 6am user's local time
  - Simulated: 2 pre-recorded episodes for demo
  - Notification on new episode

- **Player Features**
  - Background playback (continues when app backgrounded)
  - Lock screen controls with artwork
  - CarPlay integration (iOS)
  - Android Auto integration
  - Sleep timer
  - Chapter markers (optional)

- **Content**
  - AI-narrated updates about:
    - Key accomplishments
    - Upcoming milestones
    - Budget highlights
    - Risk alerts
    - Strategic insights
  - <5 minutes per episode
  - Professional voiceover quality

**Sample Episodes for PoC:**
1. "Program Update - January 21, 2025" (4:23)
2. "Program Update - January 20, 2025" (3:47)

---

## 3.6 Settings

**Primary Function:** App configuration and account management (simplified for PoC)

**Platform-Specific Location:**

**iOS:**
- Profile icon in top-right corner of any tab
- Follows iOS Settings app patterns with grouped lists

**Android:**
- Three-dot menu (⋮) in top-right corner accessible from any tab
- Follows Material Design settings patterns

**Settings Sections:**

1. **Account**
   - User profile info (name, email, workspace)
   - Connected Conductor instance URL
   - Sign Out button (with confirmation)
   - Reconnect to Conductor (restart QR flow)

2. **Notifications**
   - Master toggle (Enable/Disable All)
   - Per-category toggles:
     - Activity Feed notifications
     - KPI Alerts
     - Task Reminders
     - Podcast Episodes

3. **Appearance**
   - Theme: Light, Dark, System Default

4. **Developer Mode** (PoC Testing)
   - Toggle Developer Mode on/off
   - When enabled, shows:
     - **Simulate Notifications** - Trigger test notifications instantly
     - **Force Activity Updates** - Add random activity feed items on demand
     - **Reset App State** - Clear all data and restart app
     - **Time Travel** - Fast-forward time for scheduled features (6am podcasts, reminders, etc.)
     - **Force Widget Refresh** - Update all widgets immediately

5. **About**
   - App version
   - Build number
   - Send feedback

**Settings UI Patterns:**
- iOS: Use native Settings UI components (grouped lists, switches)
- Android: Material Design preferences with proper hierarchy
- Settings persist across app restarts
- Developer Mode changes take effect immediately

---

## 4. Notifications

### Notification Types

**Activity Feed Notifications:**
- High-priority Conductor updates
- @mentions in comments
- Approval requests
- Risk escalations

**KPI Notifications:**
- KPI threshold breaches
- Significant trend changes
- Target achievement

**Task Notifications:**
- New task assignments
- Due date reminders
- Task updates

**Podcast Notifications:**
- New episode available

### Platform-Specific Implementation

**iOS:**
- Rich notifications with images/actions
- Notification grouping by app section
- Critical alerts for urgent items (requires permission)
- Notification summary (scheduled summary)
- Interactive actions (e.g., "Mark Complete", "View")

**Android:**
- Notification channels per category
- Expanded notification layouts
- Action buttons
- Heads-up notifications for high priority
- Notification dots

### User Controls
- Per-category notification settings
- Quiet hours/Do Not Disturb respect
- Notification preview on/off
- Sound/vibration customization

---

## 5. Wearable Apps (Apple Watch & Android Wear)

### Recommended Scope for PoC

**Apple Watch App:**

**Included Features:**
1. **Harmony Voice Chat**
   - Raise to speak or tap-to-talk
   - Transcription on watch face
   - Haptic feedback for responses
   - Quick replies with suggested actions
   - Complications showing last interaction

2. **KPI Glances**
   - Up to 6 user-selected KPIs
   - Complications for watch face (modular, infographic, circular)
   - Swipeable KPI cards
   - Color-coded status indicators
   - Tap for simple trend chart

3. **Task Quick View**
   - Today's tasks only
   - Swipe to complete
   - Voice entry for new tasks
   - Due date indicators
   - Task count complication

4. **Podcast Playback**
   - Now Playing controls
   - Episode selection (recent 5 episodes)
   - Playback speed control
   - Auto-play latest on morning commute (via Shortcuts)

**Not Included (for PoC):**
- Activity Feed (too much content for watch UX)
- Full task management
- Complex KPI navigation

**Android Wear App:**

**Included Features:**
1. **Harmony Voice Chat**
   - Voice-first interaction
   - Text responses on watch
   - Tiles showing recent chats

2. **KPI Tiles**
   - Swipeable tiles for key KPIs
   - Watch face complications
   - Status indicators

3. **Task Glances**
   - Today's tasks
   - Voice completion
   - Task count tile

4. **Podcast Controls**
   - Media controls tile
   - Episode selection

### Technical Considerations
- **Apple Watch:** watchOS 9+ required, SwiftUI for watch app
- **Android Wear:** Wear OS 3+ required, Jetpack Compose for Wear
- Efficient data sync (minimize battery drain)
- Offline capability for critical features
- Handoff between phone and watch

---

## 6. Platform Extensions (iOS & Android)

### Recommended Extensions

#### iOS Extensions

1. **Home Screen Widgets** ✅ (Already planned)
   - Quick KPI access without opening app
   - Live Activity for critical updates

2. **Lock Screen Widgets (iOS 16+)** ✅
   - Key KPI at-a-glance
   - Task count
   - Unread activity badge

3. **Siri Shortcuts**
   - "Hey Siri, check my Conductor KPIs"
   - "Hey Siri, show my tasks for today"
   - "Hey Siri, play my Conductor podcast"
   - Create custom automations (e.g., "Morning briefing")

4. **Spotlight Search**
   - Search tasks, KPIs, chats from system search
   - Quick actions (e.g., "Complete task X")

5. **Share Extension**
   - Share content from other apps → Create Conductor task
   - Attach to existing projects

6. **iMessage Extension**
   - Share KPIs/tasks with team members
   - Quick status updates

#### Android Extensions

1. **Home Screen Widgets** ✅ (Already planned)
   - Material You theming
   - Resizable widgets

2. **Quick Settings Tiles**
   - Quick access to voice Harmony chat
   - Task count with tap to open

3. **App Shortcuts**
   - Long-press app icon → Quick actions
   - "New Task", "Voice Chat", "Today's Podcast"

4. **Share Targets**
   - Share from any app → Create Conductor task
   - Attach files/links to projects

5. **Assistant Integration (Google Assistant)**
   - "Hey Google, ask Harmony about Q1 budget"
   - "Hey Google, show my Conductor tasks"

**Nice-to-Have:**
6. **Lock Screen Shortcuts**
   - Quick access without unlocking

7. **Notification Actions**
   - Rich notification interactions
   - Complete tasks from notification


---

## 6.7 Design System & Branding

### Brand Overview
**To be provided:** Please share brand guidelines, logos, and fonts through one of these methods:
1. Create a `/design` folder in this repo with:
   - `brand-guidelines.pdf` or `brand-guidelines.md`
   - Logo files (SVG, PNG) in `/design/logos/`
   - Font files in `/design/fonts/`
   - Color swatches/palette file
   - Icon library if available
2. Share a link to Figma design system
3. Share a Dropbox/Google Drive folder
4. Share existing web app style guide URL

### Design Principles (Placeholder)

**Conductor Brand Identity:**
- Professional, enterprise-grade aesthetic
- Clean, data-focused interfaces
- Trustworthy and authoritative
- Modern but not trendy
- Accessible and inclusive

**Harmony Sub-Brand:**
- Friendly, conversational AI personality
- Intelligent and insightful
- Approachable yet professional
- Distinct from Conductor but complementary

### Color Palette (To Be Provided)

Please provide:
```
Primary Brand Colors:
- Primary: #XXXXXX (name)
- Secondary: #XXXXXX (name)
- Accent: #XXXXXX (name)

Semantic Colors:
- Success/Green: #XXXXXX
- Warning/Amber: #XXXXXX
- Error/Red: #XXXXXX
- Info/Blue: #XXXXXX

Neutral/Grays:
- Gray 50-900 scale

Harmony Colors:
- Harmony primary: #XXXXXX
- Harmony accent: #XXXXXX

Background Colors:
- Light mode background
- Dark mode background
- Card/surface colors
```

### Typography (To Be Provided)

Please provide:
```
Primary Font Family:
- Name: (e.g., "Inter", "SF Pro", "Roboto")
- Weights needed: 400, 500, 600, 700
- License type: Open source / Commercial
- File format: TTF, OTF, or system font

Secondary/Monospace Font (if applicable):
- For code/data display

Type Scale:
- Heading 1: XXpt / weight
- Heading 2: XXpt / weight
- Heading 3: XXpt / weight
- Body: XXpt / weight
- Caption: XXpt / weight
- Button: XXpt / weight
```

### Logo Assets Needed

**Conductor Logo:**
- Full color horizontal logo (SVG + PNG @1x, @2x, @3x)
- White/knockout version for dark backgrounds
- Icon/mark only (square format for app icon)
- Minimum clear space specifications

**Harmony Logo/Icon:**
- Harmony wordmark or logo
- Harmony icon (for chat interface, notifications)
- Animated version if available (for loading states)

**App Icons:**
- iOS app icon (1024x1024px)
- Android app icon (adaptive icon with foreground + background)
- Watch app icons (various sizes)
- Notification icons (simplified, monochrome)

### Iconography

Please specify:
- Icon library in use (e.g., SF Symbols, Material Icons, custom set)
- Icon style: Outline, filled, rounded, sharp
- Icon stroke weight
- If custom icons, provide as SVG set

**Required Icons (minimum):**
- Tab bar icons (5): Harmony, Activity, KPIs, Tasks, Podcasts
- Agent avatars (10 agents)
- Activity type icons (14 types)
- Platform icons (10 platforms)
- KPI status indicators (red/amber/green)
- Action icons (play, pause, forward, back, add, delete, filter, search, etc.)

### Agent Avatars/Icons

For the 10 Harmony agents, please provide:
- Visual identity for each agent (avatar, icon, or illustrated character)
- Color coding if applicable
- Consistent style across all agents
- Size: 48x48pt minimum, vector preferred

**Agents requiring visuals:**
1. CFO Agent
2. Chief Risk Officer Agent
3. Chief Compliance Officer Agent
4. Chief Technical Officer Agent
5. Chief Transformation Officer Agent
6. Chief Procurement Officer Agent
7. PMO Director Agent
8. Resourcing Agent
9. Change Management Agent
10. Legal Agent

### UI Components

**Cards:**
- Border radius: XXpx
- Shadow/elevation style
- Padding standards

**Buttons:**
- Primary button style
- Secondary button style
- Text button style
- Button height and padding
- Border radius

**Input Fields:**
- Text input styling
- Focus states
- Error states
- Label positioning

**Navigation:**
- Tab bar styling (iOS/Android differences)
- Header/app bar styling
- Back button treatment

**Status Indicators:**
- RAG (Red/Amber/Green) visualization
- Progress bars
- Trend indicators (arrows, sparklines)

### Motion & Animation

Please specify:
- Transition duration standards (fast: XXms, medium: XXms, slow: XXms)
- Easing curves preferred
- Loading animation style
- Success/completion animations
- Microinteractions (e.g., button press, swipe feedback)

### Accessibility Requirements

- WCAG 2.1 Level AA compliance minimum
- Color contrast ratios: 4.5:1 for text, 3:1 for UI elements
- Support for Dynamic Type (iOS) and Font Scaling (Android)
- VoiceOver/TalkBack optimized
- Keyboard navigation support
- Reduce motion support

### Platform-Specific Considerations

**iOS:**
- Follow iOS Human Interface Guidelines where applicable
- Use native iOS UI elements where possible (tab bar, navigation bar, alerts)
- Support Safe Area insets
- Haptic feedback patterns

**Android:**
- Follow Material Design 3 guidelines
- Support Material You dynamic theming (Android 12+)
- Use Material components where possible
- Proper elevation and surface styling

### Dark Mode

- Full dark mode support required
- Provide dark mode color palette
- Adjust logo/icons for dark backgrounds
- Test for OLED burn-in considerations

---

## 7. Technical Architecture (PoC)

### Tech Stack Recommendations

**Cross-Platform Framework:**
- **Option 1: React Native** (Recommended for PoC speed)
  - Pros: Fast development, single codebase, good library ecosystem
  - Cons: Some native features require bridges
  
- **Option 2: Flutter**
  - Pros: Excellent performance, beautiful UI, single codebase
  - Cons: Slightly steeper learning curve for widgets/wearables

**Native Development:**
- **iOS:** Swift + SwiftUI (for watch app and extensions)
- **Android:** Kotlin + Jetpack Compose (for Wear OS and widgets)

**For PoC, recommend React Native with native modules for:**
- Watch apps (native)
- Widgets (native)
- Complex platform extensions (native)

### Simulated Backend

**Local Data Storage:**
- SQLite or Realm for structured data
- AsyncStorage for settings/preferences
- Secure storage for auth tokens

**Simulated API Responses:**
- Mock JSON responses with realistic latency
- Local generators for:
  - Activity feed items
  - Chat responses
  - KPI updates
  - Task data

**Future Backend Connection:**
- API layer designed with Azure endpoint structure
- Easy swap from mock to real endpoints
- GraphQL or REST (match Conductor web app)

### Data Models

```typescript
// Key data structures

interface User {
  id: string;
  name: string;
  email: string;
  workspaceId: string;
  preferences: UserPreferences;
}

interface ActivityItem {
  id: string;
  type: 'task' | 'budget' | 'risk' | 'milestone' | 'integration' | 'insight';
  platform: 'conductor' | 'm365' | 'jira' | 'harmony';
  insightType?: 'risk' | 'optimization' | 'anomaly';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  actions?: Action[];
}

interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  status: 'red' | 'amber' | 'green';
  hierarchy: {
    workspace: string;
    initiative?: string;
    workstream?: string;
    project?: string;
  };
  chartData?: ChartDataPoint[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'complete';
  projectId: string;
  projectName: string;
  assignee: User;
  subtasks?: Subtask[];
}

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration: number; // seconds
  audioUrl: string;
  artworkUrl: string;
  isDownloaded: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessageAt: Date;
  messages: ChatMessage[];
  isStarred: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'harmony' | 'agent';
  agentType?: string;
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}
```

---

## 8. Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (React Native)
- [ ] Navigation structure (5 tabs)
- [ ] QR code authentication flow
- [ ] Basic UI components library
- [ ] Mock data layer

### Phase 2: Core Features (Week 3-5)
- [ ] Harmony chat UI with mock responses
- [ ] Activity feed with filtering
- [ ] KPI dashboard with tile management
- [ ] Task list with basic actions
- [ ] Podcast player with 2 episodes

### Phase 3: Advanced Features (Week 6-7)
- [ ] Push notifications setup
- [ ] Home screen widgets (iOS & Android)
- [ ] Lock screen widgets
- [ ] Voice mode for Harmony
- [ ] KPI hierarchy navigation

### Phase 4: Wearables (Week 8-9)
- [ ] Apple Watch app
- [ ] Android Wear app
- [ ] Watch complications
- [ ] Handoff functionality

### Phase 5: Extensions & Polish (Week 10-11)
- [ ] Siri Shortcuts / Google Assistant
- [ ] Share extensions
- [ ] App shortcuts
- [ ] UI polish and animations
- [ ] Dark mode support

### Phase 6: Testing & Deployment (Week 12)
- [ ] TestFlight setup and distribution
- [ ] Android APK generation and sideloading instructions
- [ ] User testing feedback collection
- [ ] Bug fixes and refinements

---

## 9. Testing Strategy

### Devices
- **iOS:** iPhone 15 Pro Max (primary), iPhone SE (testing), iPad Air (tablet UI)
- **iOS Simulators:** iOS 16, 17, 18
- **Android Emulators:** Pixel 7, Samsung Galaxy S23, Tablet
- **Watches:** Apple Watch Series 9 simulator, Wear OS emulator

### Test Scenarios
1. QR code scanning in various lighting conditions
2. Background audio playback (podcasts)
3. Notification delivery and interaction
4. Widget updates and deep linking
5. Offline functionality
6. Battery impact monitoring
7. Watch app handoff
8. Voice input accuracy

### Beta Testing
- Internal team: 5-10 users
- TestFlight: 25-50 external users
- Android: 10-20 sideload users
- Feedback via in-app form + Slack channel

---

## 10. Success Criteria

### Functional Requirements
✅ All 5 tabs fully functional with simulated data  
✅ QR code authentication working end-to-end  
✅ Notifications delivered and actionable  
✅ Home screen widgets updating correctly  
✅ Podcast playback with background audio  
✅ Watch apps with core features  
✅ TestFlight and Android deployment successful  

### User Experience Goals
- Onboarding completion in <2 minutes
- Chat response time <3 seconds
- Smooth animations (60fps)
- Widget update latency <1 minute
- Intuitive navigation (minimal user guidance needed)

### Technical Goals
- App size <100MB
- Cold start time <2 seconds
- Battery drain <5% per hour of active use
- Zero critical bugs in beta period

---

## 11. Out of Scope (Post-PoC)

- Real backend integration with Conductor Azure instance
- Full production authentication/authorization
- Offline sync architecture
- Multi-language support
- iPad-optimized layouts
- Tablet-specific features
- Advanced analytics/tracking
- Comprehensive error logging
- App Store submission and review
- GDPR/compliance features
- Advanced security hardening
- Automated CI/CD pipelines

---

## 12. Open Questions

1. **Azure Integration:** What APIs will be available from the Conductor web app? GraphQL, REST, or both?
2. **Voice Model:** For Harmony voice mode, use device speech-to-text or plan for server-side processing?
3. **Podcast Generation:** Will real episodes be AI-generated server-side or pre-recorded for PoC?
4. **KPI Data Structure:** Can you provide sample Excel Add-in flow for KPI selection?
5. **Branding:** Conductor color palette, logos, and design system assets?
6. **Third-Party Integrations:** Which integrations are priority for Activity feed simulation?

---

## 13. Next Steps

1. Review and approve this PRD
2. Receive sample data structures from Excel Add-in
3. Set up development environments
4. Create design mockups (Figma?)
5. Begin Phase 1 development
6. Weekly demos/check-ins

---

**Document Owner:** Jay Goldman  
**Last Updated:** January 21, 2025  
**Status:** Draft for Review
