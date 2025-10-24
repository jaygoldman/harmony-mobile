import Foundation
import SwiftUI

/// Canonical set of top-level demo destinations that drive the SwiftUI tab shell.
public enum DemoDestination: String, CaseIterable, Identifiable, Sendable {
    case activity
    case harmony
    case kpis
    case tasks
    case podcasts

    public var id: String { rawValue }

    public var title: String {
        switch self {
        case .activity: return "Activity"
        case .harmony: return "Harmony"
        case .kpis: return "KPIs"
        case .tasks: return "Tasks"
        case .podcasts: return "Podcasts"
        }
    }

    public var iconSystemName: String {
        switch self {
        case .activity: return "list.bullet.below.rectangle"
        case .harmony: return "bubble.left.and.text.bubble.right"
        case .kpis: return "chart.bar.xaxis"
        case .tasks: return "checklist"
        case .podcasts: return "apple.podcasts.pages"
        }
    }

    /// Accent gradients used to tint Liquid Glass cards per destination.
    public var accentGradient: LinearGradient {
        let colors: [Color]

        switch self {
        case .activity:
            colors = [.cyan.opacity(0.8), .blue.opacity(0.5)]
        case .harmony:
            colors = [.purple.opacity(0.8), .blue.opacity(0.6)]
        case .kpis:
            colors = [.mint.opacity(0.8), .teal.opacity(0.5)]
        case .tasks:
            colors = [.green.opacity(0.8), .blue.opacity(0.5)]
        case .podcasts:
            colors = [.pink.opacity(0.8), .orange.opacity(0.5)]
        }

        return LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
    }
}

public struct FeatureCatalog: Sendable {
    public var tabs: [DemoDestination]

    public init(tabs: [DemoDestination] = DemoDestination.allCases) {
        self.tabs = tabs
    }
}
