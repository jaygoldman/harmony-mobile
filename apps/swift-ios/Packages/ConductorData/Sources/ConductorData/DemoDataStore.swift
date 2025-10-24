import Foundation
import Combine

// MARK: - Domain Models

public struct HarmonyMessage: Identifiable, Sendable, Equatable {
    public let id: UUID
    public let author: String
    public let preview: String
    public let timestamp: Date
    public let tone: String

    public init(
        id: UUID = UUID(),
        author: String,
        preview: String,
        timestamp: Date,
        tone: String
    ) {
        self.id = id
        self.author = author
        self.preview = preview
        self.timestamp = timestamp
        self.tone = tone
    }
}

public struct ActivityEvent: Identifiable, Sendable, Equatable {
    public let id: UUID
    public let title: String
    public let subtitle: String
    public let timestamp: Date

    public init(
        id: UUID = UUID(),
        title: String,
        subtitle: String,
        timestamp: Date
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.timestamp = timestamp
    }
}

public enum KPITrendDirection: Sendable {
    case up
    case flat
    case down
}

public struct KPIInsight: Identifiable, Sendable, Equatable {
    public let id: UUID
    public let title: String
    public let value: String
    public let delta: String
    public let direction: KPITrendDirection

    public init(
        id: UUID = UUID(),
        title: String,
        value: String,
        delta: String,
        direction: KPITrendDirection
    ) {
        self.id = id
        self.title = title
        self.value = value
        self.delta = delta
        self.direction = direction
    }
}

public enum TaskStatus: String, Sendable {
    case upcoming = "Upcoming"
    case dueToday = "Due Today"
    case blocked = "Blocked"
}

public struct TaskItem: Identifiable, Sendable, Equatable {
    public let id: UUID
    public let title: String
    public let project: String
    public let due: Date
    public let status: TaskStatus

    public init(
        id: UUID = UUID(),
        title: String,
        project: String,
        due: Date,
        status: TaskStatus
    ) {
        self.id = id
        self.title = title
        self.project = project
        self.due = due
        self.status = status
    }
}

public struct PodcastEpisode: Identifiable, Sendable, Equatable {
    public let id: UUID
    public let title: String
    public let guest: String
    public let duration: TimeInterval
    public let released: Date

    public init(
        id: UUID = UUID(),
        title: String,
        guest: String,
        duration: TimeInterval,
        released: Date
    ) {
        self.id = id
        self.title = title
        self.guest = guest
        self.duration = duration
        self.released = released
    }
}

public struct SettingOption: Identifiable, Sendable, Equatable {
    public let id: UUID
    public let title: String
    public let iconSystemName: String
    public let description: String
    public let isDestructive: Bool

    public init(
        id: UUID = UUID(),
        title: String,
        iconSystemName: String,
        description: String,
        isDestructive: Bool = false
    ) {
        self.id = id
        self.title = title
        self.iconSystemName = iconSystemName
        self.description = description
        self.isDestructive = isDestructive
    }
}

public struct DemoPayload: Sendable, Equatable {
    public var harmonyMessages: [HarmonyMessage]
    public var activity: [ActivityEvent]
    public var kpis: [KPIInsight]
    public var tasks: [TaskItem]
    public var podcasts: [PodcastEpisode]
    public var settings: [SettingOption]

    public init(
        harmonyMessages: [HarmonyMessage],
        activity: [ActivityEvent],
        kpis: [KPIInsight],
        tasks: [TaskItem],
        podcasts: [PodcastEpisode],
        settings: [SettingOption]
    ) {
        self.harmonyMessages = harmonyMessages
        self.activity = activity
        self.kpis = kpis
        self.tasks = tasks
        self.podcasts = podcasts
        self.settings = settings
    }
}

public extension DemoPayload {
    static let demo = DemoPayload(
        harmonyMessages: [
            HarmonyMessage(
                author: "Harmony",
                preview: "Your KPI momentum is peaking in EMEA. Marketing attributed 68 new conversations to the \"Glass Launch\" webinar and ARR is pacing 9% above target.",
                timestamp: Calendar.current.date(byAdding: .minute, value: -12, to: .now) ?? .now,
                tone: "Insight"
            ),
            HarmonyMessage(
                author: "Harmony",
                preview: "Product asked if we can ship the revenue dashboard beta a week early. You have enough coverage once Sam wraps the KPI filters.",
                timestamp: Calendar.current.date(byAdding: .hour, value: -2, to: .now) ?? .now,
                tone: "Heads-up"
            ),
            HarmonyMessage(
                author: "Harmony",
                preview: "The Paris onboarding session still looks light. Want me to ping the partner team to invite the new pods?",
                timestamp: Calendar.current.date(byAdding: .hour, value: -6, to: .now) ?? .now,
                tone: "Suggestion"
            )
        ],
        activity: [
            ActivityEvent(
                title: "Design studio locked for Nova launch",
                subtitle: "Celine confirmed the Liquid Glass motion deck — ready for Wednesday's stakeholder run-through.",
                timestamp: Calendar.current.date(byAdding: .minute, value: -35, to: .now) ?? .now
            ),
            ActivityEvent(
                title: "Harmony mentions @Aria in chat",
                subtitle: "Escalated the multiplayer bug report for the transcript view. QA will verify in build 142.",
                timestamp: Calendar.current.date(byAdding: .hour, value: -1, to: .now) ?? .now
            ),
            ActivityEvent(
                title: "Ops unblocked the Q4 pipeline sync",
                subtitle: "Contracts tagged to Glass Launch are now visible in the ARR dashboard filters.",
                timestamp: Calendar.current.date(byAdding: .hour, value: -4, to: .now) ?? .now
            )
        ],
        kpis: [
            KPIInsight(title: "Net ARR", value: "$842K", delta: "+9.1%", direction: .up),
            KPIInsight(title: "Launch NPS", value: "72", delta: "+4.2", direction: .up),
            KPIInsight(title: "Live Podcasts", value: "18", delta: "+3", direction: .flat),
            KPIInsight(title: "Active Tasks", value: "42", delta: "-6", direction: .down)
        ],
        tasks: [
            TaskItem(
                title: "Rehearse Liquid Glass motion cues",
                project: "Glass Launch",
                due: Calendar.current.date(byAdding: .day, value: 0, to: .now) ?? .now,
                status: .dueToday
            ),
            TaskItem(
                title: "Approve KPI dashboard copy",
                project: "Executive Reviews",
                due: Calendar.current.date(byAdding: .day, value: 1, to: .now) ?? .now,
                status: .upcoming
            ),
            TaskItem(
                title: "Resolve podcast transcript sync bug",
                project: "Story Threads",
                due: Calendar.current.date(byAdding: .day, value: -1, to: .now) ?? .now,
                status: .blocked
            )
        ],
        podcasts: [
            PodcastEpisode(
                title: "Amplifying Harmony with AI-native rituals",
                guest: "Riya Patel",
                duration: 24 * 60,
                released: Calendar.current.date(byAdding: .day, value: -3, to: .now) ?? .now
            ),
            PodcastEpisode(
                title: "Designing Liquid Glass for iOS 26",
                guest: "Jules Laurent",
                duration: 32 * 60,
                released: Calendar.current.date(byAdding: .day, value: -10, to: .now) ?? .now
            ),
            PodcastEpisode(
                title: "Playbooks for distributed pods",
                guest: "Jordan Lee",
                duration: 28 * 60,
                released: Calendar.current.date(byAdding: .day, value: -18, to: .now) ?? .now
            )
        ],
        settings: [
            SettingOption(
                title: "Switch workspace",
                iconSystemName: "arrow.triangle.2.circlepath",
                description: "Jump between demo environments and saved walkthroughs."
            ),
            SettingOption(
                title: "Developer options",
                iconSystemName: "hammer.fill",
                description: "Toggle QR bypass, mock data sources, and reset app state."
            ),
            SettingOption(
                title: "Sign out",
                iconSystemName: "rectangle.portrait.and.arrow.right",
                description: "Remove the paired device and clear secure tokens.",
                isDestructive: true
            )
        ]
    )
}

// MARK: - Store

@available(macOS 10.15, iOS 13, *)
@MainActor
public final class DemoDataStore: ObservableObject {
    @Published public private(set) var payload: DemoPayload
    @Published public private(set) var userInitial: String

    public init(payload: DemoPayload = .demo, userInitial: String = "J") {
        self.payload = payload
        self.userInitial = userInitial
    }

    public var featuredMessage: HarmonyMessage? {
        payload.harmonyMessages.first
    }

    public var activityFeed: [ActivityEvent] {
        payload.activity
    }

    public var kpiHighlights: [KPIInsight] {
        payload.kpis
    }

    public var tasks: [TaskItem] {
        payload.tasks
    }

    public var podcasts: [PodcastEpisode] {
        payload.podcasts
    }

    public var settings: [SettingOption] {
        payload.settings
    }

    /// Simulates new insights arriving by rotating the featured arrays.
    public func advanceDemoState() {
        payload.harmonyMessages.rotate()
        payload.activity.rotate()
        payload.tasks.rotate()
    }

    public func updateUserInitial(_ newInitial: String) {
        userInitial = newInitial
    }

    public func replace(payload newPayload: DemoPayload, userInitial: String? = nil) {
        self.payload = newPayload

        if let userInitial {
            self.userInitial = userInitial
        }
    }
}

private extension Array {
    mutating func rotate() {
        guard let firstElement = first else { return }
        removeFirst()
        append(firstElement)
    }
}
