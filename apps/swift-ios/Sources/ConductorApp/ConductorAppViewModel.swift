import Foundation
import SwiftUI
import ConductorData

@MainActor
final class ConductorAppViewModel: ObservableObject {
    enum SessionState: Equatable {
        case disconnected
        case restoring
        case connecting
        case connected(UserProfile)
        case error(message: String)
    }

    struct UserProfile: Equatable {
        let name: String
        let email: String
        let username: String
    }

    struct ConnectionPayload: Decodable {
        let code: String
        let apiUrl: URL
    }

    @Published private(set) var sessionState: SessionState = .disconnected
    @Published private(set) var statusMessage: String?

    let dataStore: DemoDataStore

    private let sessionStore: SecureSessionStore
    private var apiClient: MobileAPIClient?

    init(
        dataStore: DemoDataStore = DemoDataStore(),
        sessionStore: SecureSessionStore = .shared
    ) {
        self.dataStore = dataStore
        self.sessionStore = sessionStore

        if let storedSession = sessionStore.load() {
            sessionState = .restoring
            Task {
                await restore(using: storedSession)
            }
        }
    }

    func decodeConnectionPayload(from rawValue: String) throws -> ConnectionPayload {
        let data = Data(rawValue.utf8)
        return try JSONDecoder().decode(ConnectionPayload.self, from: data)
    }

    func manualConnectionPayload(code: String, apiUrlString: String) throws -> ConnectionPayload {
        let trimmedCode = code.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        guard !trimmedCode.isEmpty else {
            throw ConnectionError.invalidCode
        }

        guard let url = URL(string: apiUrlString.trimmingCharacters(in: .whitespacesAndNewlines)), url.scheme != nil else {
            throw ConnectionError.invalidURL
        }

        return ConnectionPayload(code: trimmedCode, apiUrl: url)
    }

    func connect(using payload: ConnectionPayload) async {
        sessionState = .connecting
        statusMessage = "Pairing with Conductor…"

        let client = MobileAPIClient(baseURL: payload.apiUrl)
        apiClient = client

        do {
            let connectResponse = try await client.connect(using: payload.code)
            let token = connectResponse.token

            let remoteData = try await loadRemoteData(with: client, token: token)
            let session = MobileSession(
                token: token,
                apiURL: connectResponse.apiUrl,
                username: connectResponse.username,
                name: connectResponse.name,
                email: connectResponse.email
            )

            apply(remoteData: remoteData, session: session)
            try sessionStore.save(session)

            let profile = UserProfile(name: session.name, email: session.email, username: session.username)
            sessionState = .connected(profile)
            statusMessage = nil
        } catch {
            await handleConnectionFailure(error)
        }
    }

    func disconnect() {
        try? sessionStore.clear()
        apiClient = nil
        sessionState = .disconnected
        statusMessage = nil
    }

    private func restore(using session: MobileSession) async {
        let client = MobileAPIClient(baseURL: session.apiURL)
        apiClient = client

        do {
            let remoteData = try await loadRemoteData(with: client, token: session.token)
            apply(remoteData: remoteData, session: session)
            let profile = UserProfile(name: session.name, email: session.email, username: session.username)
            sessionState = .connected(profile)
            statusMessage = nil
        } catch {
            try? sessionStore.clear()
            apiClient = nil
            sessionState = .error(message: error.readableDescription)
        }
    }

    private func loadRemoteData(with client: MobileAPIClient, token: String) async throws -> RemoteDataBundle {
        async let sampleTask = client.fetchSampleData(token: token)
        async let chatsTask = client.fetchHarmonyChats(token: token)
        async let kpiTask = client.fetchKPIData(token: token)

        let sample = try await sampleTask
        let chats = try await chatsTask
        let kpis = try await kpiTask
        return RemoteDataBundle(sample: sample, chats: chats, kpis: kpis)
    }

    private func apply(remoteData: RemoteDataBundle, session: MobileSession) {
        let existing = dataStore.payload
        let now = Date()

        let harmonyMessages: [HarmonyMessage] = {
            let messages = remoteData.chats.chatList.prefix(3).compactMap { (chat: HarmonyChatsResponse.ChatListItem) -> HarmonyMessage? in
                guard let message = remoteData.chats.chatMessages[chat.name]?.first else {
                    return nil
                }

                let timestamp = parseTimestamp(message.timestamp)
                let toneSource = chat.conductorEntityType ?? "Chat"

                return HarmonyMessage(
                    author: chat.name,
                    preview: message.content,
                    timestamp: timestamp ?? now,
                    tone: toneSource.isEmpty ? "Chat" : toneSource.capitalized
                )
            }

            return messages.isEmpty ? existing.harmonyMessages : messages
        }()

        let activityFeed: [ActivityEvent] = {
            let events = remoteData.sample.activityPool.prefix(5).enumerated().map { index, item in
                let title = item.action ?? item.activityType?.replacingOccurrences(of: "-", with: " ").capitalized ?? "Update"
                let subtitle: String
                if let details = item.details, !details.isEmpty {
                    subtitle = details
                } else if let user = item.user, !user.isEmpty {
                    subtitle = user
                } else if let platform = item.platform, !platform.isEmpty {
                    subtitle = platform.capitalized
                } else {
                    subtitle = "Latest activity"
                }

                return ActivityEvent(
                    title: title,
                    subtitle: subtitle,
                    timestamp: Calendar.current.date(byAdding: .minute, value: -index * 12, to: now) ?? now
                )
            }

            return events.isEmpty ? existing.activity : events
        }()

        let kpiHighlights: [KPIInsight] = {
            let workstreams = remoteData.kpis.workstreams
            let totalProjects = workstreams.reduce(into: 0) { count, stream in
                count += stream.projects.count
            }
            let totalMetrics = workstreams.reduce(into: 0) { count, stream in
                count += stream.projects.reduce(0) { $0 + $1.metrics.count }
            }
            let latestMonth = remoteData.kpis.months.last ?? "Most recent"

            return [
                KPIInsight(
                    title: "Workstreams",
                    value: "\(workstreams.count)",
                    delta: "\(totalProjects) projects",
                    direction: .up
                ),
                KPIInsight(
                    title: "Projects",
                    value: "\(totalProjects)",
                    delta: "\(totalMetrics) metrics tracked",
                    direction: .flat
                ),
                KPIInsight(
                    title: "Reporting Span",
                    value: "\(remoteData.kpis.months.count)",
                    delta: "Latest \(latestMonth)",
                    direction: .up
                ),
                KPIInsight(
                    title: "Generated",
                    value: formattedTimestamp(),
                    delta: "Demo data",
                    direction: .flat
                )
            ]
        }()

        let taskItems: [TaskItem] = {
            let formatter = DateFormatter()
            formatter.calendar = Calendar(identifier: .gregorian)
            formatter.dateFormat = "yyyy-MM-dd"
            formatter.timeZone = TimeZone(secondsFromGMT: 0)

            let tasks = remoteData.sample.tasks.prefix(5).compactMap { task -> TaskItem? in
                let dueDate = task.dueDate.flatMap { formatter.date(from: $0) } ?? now
                let status = taskStatus(for: task.status, dueDate: dueDate)

                return TaskItem(
                    title: task.title ?? "Unnamed task",
                    project: task.project ?? "Conductor",
                    due: dueDate,
                    status: status
                )
            }

            return tasks.isEmpty ? existing.tasks : tasks
        }()

        let podcasts: [PodcastEpisode] = {
            let formatter = DateFormatter()
            formatter.calendar = Calendar(identifier: .gregorian)
            formatter.dateFormat = "yyyy-MM-dd"
            formatter.timeZone = TimeZone(secondsFromGMT: 0)

            let episodes = remoteData.sample.podcasts.prefix(3).compactMap { podcast -> PodcastEpisode? in
                guard let title = podcast.title else { return nil }
                let released = podcast.date.flatMap { formatter.date(from: $0) } ?? now
                let duration = podcast.durationSeconds ?? duration(from: podcast.duration) ?? 0

                return PodcastEpisode(
                    title: title,
                    guest: podcast.description ?? "Harmony Daily Brief",
                    duration: duration,
                    released: released
                )
            }

            return episodes.isEmpty ? existing.podcasts : episodes
        }()

        let newPayload = DemoPayload(
            harmonyMessages: harmonyMessages,
            activity: activityFeed,
            kpis: kpiHighlights,
            tasks: taskItems,
            podcasts: podcasts,
            settings: existing.settings
        )

        let initial = displayInitial(for: session)
        dataStore.replace(payload: newPayload, userInitial: initial)
    }

    private func displayInitial(for session: MobileSession) -> String {
        let nameInitial = session.name
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .first
            .map { String($0).uppercased() }

        if let nameInitial {
            return nameInitial
        }

        if let usernameInitial = session.username.first {
            return String(usernameInitial).uppercased()
        }

        return "?"
    }

    private func formattedTimestamp() -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        formatter.locale = Locale.current
        return formatter.string(from: Date())
    }

    private func taskStatus(for status: String?, dueDate: Date) -> TaskStatus {
        if let status, status.lowercased().contains("block") {
            return .blocked
        }

        if Calendar.current.isDateInToday(dueDate) || dueDate < Date() {
            return .dueToday
        }

        return .upcoming
    }

    private func duration(from durationString: String?) -> TimeInterval? {
        guard let durationString, !durationString.isEmpty else { return nil }
        let components = durationString.split(separator: ":").compactMap { Double($0) }
        guard !components.isEmpty else { return nil }

        switch components.count {
        case 3:
            return components[0] * 3600 + components[1] * 60 + components[2]
        case 2:
            return components[0] * 60 + components[1]
        case 1:
            return components[0]
        default:
            return nil
        }
    }

    private func parseTimestamp(_ string: String?) -> Date? {
        guard let string, !string.isEmpty else { return nil }

        let primary = ISO8601DateFormatter()
        primary.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = primary.date(from: string) {
            return date
        }

        let fallback = ISO8601DateFormatter()
        fallback.formatOptions = [.withInternetDateTime]
        return fallback.date(from: string)
    }

    private func handleConnectionFailure(_ error: Error) async {
        apiClient = nil
        try? sessionStore.clear()
        statusMessage = nil

        if let apiError = error as? APIError {
            sessionState = .error(message: apiError.errorDescription ?? "Connection failed.")
        } else if let connectionError = error as? ConnectionError {
            sessionState = .error(message: connectionError.localizedDescription)
        } else {
            sessionState = .error(message: error.localizedDescription)
        }
    }
}

// MARK: - Helpers

private struct RemoteDataBundle {
    let sample: SampleDataResponse
    let chats: HarmonyChatsResponse
    let kpis: KPIDataResponse
}

enum ConnectionError: LocalizedError {
    case invalidCode
    case invalidURL

    var errorDescription: String? {
        switch self {
        case .invalidCode:
            return "Enter a valid connection code."
        case .invalidURL:
            return "Enter a valid server URL."
        }
    }
}

private extension Error {
    var readableDescription: String {
        if let localized = (self as NSError?)?.localizedDescription, localized != "The operation couldn’t be completed. ( error 0.)" {
            return localized
        }

        if let apiError = self as? APIError {
            return apiError.errorDescription ?? "An unknown error occurred."
        }

        return "An unknown error occurred."
    }
}
