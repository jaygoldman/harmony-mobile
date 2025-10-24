import Foundation
import Security

struct MobileSession: Codable, Equatable {
    let token: String
    let apiURL: URL
    let username: String
    let name: String
    let email: String
}

enum SecureSessionStoreError: Error {
    case encodingFailed
    case decodingFailed
    case keychainError(status: OSStatus)
}

@MainActor
final class SecureSessionStore {
    static let shared = SecureSessionStore()

    private let service = "com.conductor.mobile.session"
    private let account = "user-session"
    private let accessGroup: String? = nil

    private init() {}

    func load() -> MobileSession? {
        var query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        if let accessGroup {
            query[kSecAttrAccessGroup as String] = accessGroup
        }

        var item: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &item)

        guard status == errSecSuccess else {
            return nil
        }

        guard let data = item as? Data else {
            return nil
        }

        do {
            return try JSONDecoder().decode(MobileSession.self, from: data)
        } catch {
            return nil
        }
    }

    func save(_ session: MobileSession) throws {
        let encoder = JSONEncoder()
        guard let data = try? encoder.encode(session) else {
            throw SecureSessionStoreError.encodingFailed
        }

        try clear()

        var attributes: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]

        if let accessGroup {
            attributes[kSecAttrAccessGroup as String] = accessGroup
        }

        let status = SecItemAdd(attributes as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw SecureSessionStoreError.keychainError(status: status)
        }
    }

    func clear() throws {
        var query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]

        if let accessGroup {
            query[kSecAttrAccessGroup as String] = accessGroup
        }

        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw SecureSessionStoreError.keychainError(status: status)
        }
    }
}
