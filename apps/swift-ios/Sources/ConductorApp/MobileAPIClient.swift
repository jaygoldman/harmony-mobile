import Foundation

struct MobileAPIClient {
    private enum HTTPMethod: String {
        case get = "GET"
        case post = "POST"
    }

    private let baseURL: URL
    private let urlSession: URLSession
    private let decoder: JSONDecoder

    init(baseURL: URL, urlSession: URLSession = .shared) {
        self.baseURL = baseURL
        self.urlSession = urlSession

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        self.decoder = decoder
    }

    func connect(using code: String) async throws -> ConnectResponse {
        let payload = ConnectRequest(code: code)
        let body = try JSONEncoder().encode(payload)
        return try await request(
            path: "/api/mobile/connect",
            method: .post,
            body: body,
            token: nil,
            decode: ConnectResponse.self
        )
    }

    func fetchSampleData(token: String) async throws -> SampleDataResponse {
        try await request(
            path: "/api/mobile/data/sample",
            method: .get,
            body: nil,
            token: token,
            decode: SampleDataResponse.self
        )
    }

    func fetchHarmonyChats(token: String) async throws -> HarmonyChatsResponse {
        try await request(
            path: "/api/mobile/data/harmony-chats",
            method: .get,
            body: nil,
            token: token,
            decode: HarmonyChatsResponse.self
        )
    }

    func fetchKPIData(token: String) async throws -> KPIDataResponse {
        try await request(
            path: "/api/mobile/data/kpis",
            method: .get,
            body: nil,
            token: token,
            decode: KPIDataResponse.self
        )
    }

    private func request<T: Decodable>(
        path: String,
        method: HTTPMethod,
        body: Data?,
        token: String?,
        decode type: T.Type
    ) async throws -> T {
        let url = url(for: path)
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            request.httpBody = body
        }

        do {
            let (data, response) = try await urlSession.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }

            switch httpResponse.statusCode {
            case 200...299:
                return try decoder.decode(T.self, from: data)
            default:
                if let apiError = try? decoder.decode(ErrorResponse.self, from: data),
                   let message = apiError.error {
                    throw APIError.server(message: message, statusCode: httpResponse.statusCode)
                }
                throw APIError.server(message: nil, statusCode: httpResponse.statusCode)
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.transport(error)
        }
    }

    private func url(for path: String) -> URL {
        let trimmed = path.hasPrefix("/") ? String(path.dropFirst()) : path
        return baseURL.appendingPathComponent(trimmed)
    }
}

// MARK: - Models

private struct ConnectRequest: Encodable {
    let code: String
}

struct ConnectResponse: Decodable {
    let success: Bool
    let token: String
    let username: String
    let name: String
    let email: String
    let apiUrl: URL
}

struct SampleDataResponse: Decodable {
    struct ActivityItem: Decodable {
        let activityType: String?
        let platform: String?
        let action: String?
        let details: String?
        let user: String?
    }

    struct TaskItem: Decodable {
        let id: String?
        let title: String?
        let description: String?
        let dueDate: String?
        let project: String?
        let status: String?
        let priority: String?
    }

    struct PodcastItem: Decodable {
        let date: String?
        let episodeId: String?
        let title: String?
        let description: String?
        let duration: String?
        let durationSeconds: Double?
    }

    let activityPool: [ActivityItem]
    let tasks: [TaskItem]
    let podcasts: [PodcastItem]

    private enum CodingKeys: String, CodingKey {
        case activityPool
        case tasks
        case podcasts
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        activityPool = try container.decodeIfPresent([ActivityItem].self, forKey: .activityPool) ?? []
        tasks = try container.decodeIfPresent([TaskItem].self, forKey: .tasks) ?? []
        podcasts = try container.decodeIfPresent([PodcastItem].self, forKey: .podcasts) ?? []
    }
}

struct HarmonyChatsResponse: Decodable {
    struct ChatListItem: Decodable {
        let name: String
        let date: String?
        let conductorEntityId: String?
        let conductorEntityName: String?
        let conductorEntityType: String?
    }

    struct ChatMessage: Decodable {
        let id: String?
        let type: String?
        let content: String
        let timestamp: String?
    }

    let chatList: [ChatListItem]
    let chatMessages: [String: [ChatMessage]]

    private enum CodingKeys: String, CodingKey {
        case chatList
        case chatMessages
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        chatList = try container.decodeIfPresent([ChatListItem].self, forKey: .chatList) ?? []
        chatMessages = try container.decodeIfPresent([String: [ChatMessage]].self, forKey: .chatMessages) ?? [:]
    }
}

struct KPIDataResponse: Decodable {
    struct Workstream: Decodable {
        struct Project: Decodable {
            struct Metric: Decodable {
                let name: String
            }

            let name: String
            let metrics: [Metric]
        }

        let name: String
        let projects: [Project]
    }

    let months: [String]
    let workstreams: [Workstream]

    private enum CodingKeys: String, CodingKey {
        case months
        case workstreams
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        months = try container.decodeIfPresent([String].self, forKey: .months) ?? []
        workstreams = try container.decodeIfPresent([Workstream].self, forKey: .workstreams) ?? []
    }
}

private struct ErrorResponse: Decodable {
    let error: String?
}

enum APIError: Error, LocalizedError {
    case invalidResponse
    case server(message: String?, statusCode: Int)
    case transport(Error)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "The server response was invalid."
        case let .server(message, statusCode):
            if let message, !message.isEmpty {
                return message
            }
            return "The server returned an error (\(statusCode))."
        case let .transport(error):
            return error.localizedDescription
        }
    }
}

// MARK: - Helpers

private enum ISO8601DateTransformer {
    static func date(from string: String) -> Date? {
        let primary = ISO8601DateFormatter()
        primary.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        if let parsed = primary.date(from: string) {
            return parsed
        }

        let fallback = ISO8601DateFormatter()
        fallback.formatOptions = [.withInternetDateTime]
        return fallback.date(from: string)
    }
}
