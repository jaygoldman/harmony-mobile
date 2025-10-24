import SwiftUI

/// Shared theming primitives for the Conductor SwiftUI experience.
public struct ConductorTheme: Sendable {
    public var accent: Color
    public var background: LinearGradient
    public var tabBarMaterial: Material
    public var tabBarStroke: LinearGradient

    public init(
        accent: Color,
        background: LinearGradient,
        tabBarMaterial: Material,
        tabBarStroke: LinearGradient
    ) {
        self.accent = accent
        self.background = background
        self.tabBarMaterial = tabBarMaterial
        self.tabBarStroke = tabBarStroke
    }
}

public extension ConductorTheme {
    /// Visual language inspired by the Liquid Glass treatments in the design comps.
    static var liquidGlassDemo: ConductorTheme {
        ConductorTheme(
            accent: Color(red: 0.56, green: 0.50, blue: 0.98),
            background: LinearGradient(
                colors: [
                    Color(red: 0.09, green: 0.09, blue: 0.15),
                    Color(red: 0.07, green: 0.14, blue: 0.20),
                    Color(red: 0.07, green: 0.05, blue: 0.14)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            tabBarMaterial: .ultraThinMaterial,
            tabBarStroke: LinearGradient(
                colors: [
                    Color.white.opacity(0.35),
                    Color.white.opacity(0.05)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

/// Convenience container for presenting the themed gradient background.
public struct GlassBackground<Content: View>: View {
    private let theme: ConductorTheme
    private let content: Content

    public init(theme: ConductorTheme = .liquidGlassDemo, @ViewBuilder content: () -> Content) {
        self.theme = theme
        self.content = content()
    }

    public var body: some View {
        ZStack {
            theme.background
                .ignoresSafeArea()
            content
        }
    }
}
