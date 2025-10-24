import SwiftUI
import ConductorDesign
import ConductorData
import ConductorDemoFeatures

public struct ConductorShellView: View {
    @State private var selection: DemoDestination
    @StateObject private var dataStore: DemoDataStore

    private let theme: ConductorTheme
    private let catalog: FeatureCatalog

    public init(
        theme: ConductorTheme = .liquidGlassDemo,
        catalog: FeatureCatalog = .init(),
        dataStore: DemoDataStore = DemoDataStore()
    ) {
        self.theme = theme
        self.catalog = catalog
        _selection = State(initialValue: catalog.tabs.first ?? .harmony)
        _dataStore = StateObject(wrappedValue: dataStore)
    }

    public var body: some View {
        GlassBackground(theme: theme) {
            VStack(spacing: 0) {
                HStack {
                    UserMenuButton(initial: dataStore.userInitial)
                    Spacer()
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 8)

                TabView(selection: $selection) {
                ActivityTab(theme: theme)
                    .tag(DemoDestination.activity)
                    .tabItem {
                        Label(DemoDestination.activity.title, systemImage: DemoDestination.activity.iconSystemName)
                    }

                HarmonyTab(theme: theme)
                    .tag(DemoDestination.harmony)
                    .tabItem {
                        Label(DemoDestination.harmony.title, systemImage: DemoDestination.harmony.iconSystemName)
                    }

                KPITab(theme: theme)
                    .tag(DemoDestination.kpis)
                    .tabItem {
                        Label(DemoDestination.kpis.title, systemImage: DemoDestination.kpis.iconSystemName)
                    }

                TasksTab(theme: theme)
                    .tag(DemoDestination.tasks)
                    .tabItem {
                        Label(DemoDestination.tasks.title, systemImage: DemoDestination.tasks.iconSystemName)
                    }

                PodcastsTab(theme: theme)
                    .tag(DemoDestination.podcasts)
                    .tabItem {
                        Label(DemoDestination.podcasts.title, systemImage: DemoDestination.podcasts.iconSystemName)
                    }
                }
                .toolbarBackground(.visible, for: .tabBar)
                .toolbarBackground(theme.tabBarMaterial, for: .tabBar)
                .toolbarColorScheme(.dark, for: .tabBar)
                .environmentObject(dataStore)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .tint(theme.accent)
        .preferredColorScheme(.dark)
        .animation(.spring(response: 0.45, dampingFraction: 0.86, blendDuration: 0.25), value: selection)
    }
}

// MARK: - Individual Tab Views

private struct HarmonyTab: View {
    let theme: ConductorTheme
    @EnvironmentObject private var dataStore: DemoDataStore

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                if let featured = dataStore.featuredMessage {
                    GlassCard(gradient: DemoDestination.harmony.accentGradient) {
                        VStack(alignment: .leading, spacing: 16) {
                            Label("Harmony Briefing", systemImage: "sparkles")
                                .font(.subheadline.weight(.semibold))
                                .textCase(.uppercase)
                                .foregroundStyle(Color.white.opacity(0.8))
                                .padding(.bottom, 4)

                            Text(featured.preview)
                                .font(.title3.weight(.medium))
                                .foregroundStyle(.white)
                                .lineSpacing(4)

                            HStack(spacing: 10) {
                                Capsule()
                                    .fill(Color.white.opacity(0.18))
                                    .frame(width: 8, height: 8)
                                Text(featured.tone.uppercased())
                                    .font(.caption2.weight(.semibold))
                                    .foregroundStyle(Color.white.opacity(0.8))
                                Spacer()
                                Text(featured.timestamp, style: .time)
                                    .font(.caption)
                                    .foregroundStyle(Color.white.opacity(0.7))
                            }
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("Recent insights")
                        .font(.headline)
                        .foregroundStyle(.white.opacity(0.9))

                    ForEach(dataStore.payload.harmonyMessages.dropFirst()) { message in
                        InsightRow(icon: "sparkle", title: message.tone, detail: message.preview, timestamp: message.timestamp)
                    }
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 48)
            .padding(.bottom, 32)
        }
    }
}

private struct ActivityTab: View {
    let theme: ConductorTheme
    @EnvironmentObject private var dataStore: DemoDataStore

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                Text("Activity Feed")
                    .font(.largeTitle.bold())
                    .foregroundStyle(.white)
                    .padding(.top, 44)

                ForEach(dataStore.activityFeed) { event in
                    GlassCard(gradient: DemoDestination.activity.accentGradient) {
                        VStack(alignment: .leading, spacing: 10) {
                            Text(event.title)
                                .font(.headline)
                                .foregroundStyle(.white)
                            Text(event.subtitle)
                                .font(.subheadline)
                                .foregroundStyle(Color.white.opacity(0.75))
                            Text(event.timestamp, style: .time)
                                .font(.caption)
                                .foregroundStyle(Color.white.opacity(0.65))
                        }
                    }
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
    }
}

private struct KPITab: View {
    let theme: ConductorTheme
    @EnvironmentObject private var dataStore: DemoDataStore

    private let columns = [
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16)
    ]

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                Text("KPIs")
                    .font(.largeTitle.bold())
                    .foregroundStyle(.white)
                    .padding(.top, 44)

                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(dataStore.kpiHighlights) { kpi in
                        KPIBadge(kpi: kpi)
                    }
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
    }
}

private struct TasksTab: View {
    let theme: ConductorTheme
    @EnvironmentObject private var dataStore: DemoDataStore

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                Text("Tasks")
                    .font(.largeTitle.bold())
                    .foregroundStyle(.white)
                    .padding(.top, 44)

                ForEach(dataStore.tasks) { task in
                    GlassCard(gradient: DemoDestination.tasks.accentGradient) {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text(task.title)
                                    .font(.headline)
                                    .foregroundStyle(.white)
                                Spacer()
                                StatusTag(status: task.status)
                            }

                            Text(task.project.uppercased())
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Color.white.opacity(0.7))

                            Text(task.due, style: .date)
                                .font(.caption)
                                .foregroundStyle(Color.white.opacity(0.6))
                        }
                    }
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
    }
}

private struct PodcastsTab: View {
    let theme: ConductorTheme
    @EnvironmentObject private var dataStore: DemoDataStore

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                Text("Podcasts")
                    .font(.largeTitle.bold())
                    .foregroundStyle(.white)
                    .padding(.top, 44)

                ForEach(dataStore.podcasts) { episode in
                    GlassCard(gradient: DemoDestination.podcasts.accentGradient) {
                        VStack(alignment: .leading, spacing: 10) {
                            Text(episode.title)
                                .font(.headline)
                                .foregroundStyle(.white)
                            Text("Featuring \(episode.guest)")
                                .font(.subheadline)
                                .foregroundStyle(Color.white.opacity(0.75))
                            HStack(spacing: 12) {
                                Label(format(duration: episode.duration), systemImage: "waveform")
                                    .font(.caption)
                                    .labelStyle(.trailingIcon)
                                    .foregroundStyle(Color.white.opacity(0.75))
                                Text(episode.released, style: .date)
                                    .font(.caption)
                                    .foregroundStyle(Color.white.opacity(0.65))
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
    }

    private func format(duration: TimeInterval) -> String {
        let formatter = DateComponentsFormatter()
        formatter.allowedUnits = [.minute]
        formatter.unitsStyle = .short
        return formatter.string(from: duration) ?? "—"
    }
}

// MARK: - Components

private struct GlassCard<Content: View>: View {
    let gradient: LinearGradient
    let content: Content

    init(gradient: LinearGradient, @ViewBuilder content: () -> Content) {
        self.gradient = gradient
        self.content = content()
    }

    var body: some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(.ultraThinMaterial)
                .overlay(
                    gradient
                        .opacity(0.85)
                        .blendMode(.plusLighter)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .stroke(Color.white.opacity(0.18), lineWidth: 1)
                )

            content
                .padding(24)
                .foregroundStyle(.white)
        }
        .shadow(color: .black.opacity(0.35), radius: 24, x: 0, y: 18)
    }
}

private struct UserMenuButton: View {
    let initial: String

    var body: some View {
        let trimmedInitial = initial.trimmingCharacters(in: .whitespacesAndNewlines)
        let displayInitial = trimmedInitial.isEmpty ? "?" : String(trimmedInitial.prefix(1)).uppercased()

        Menu {
            Button("Settings", systemImage: "gearshape") {}
            Button(role: .destructive) {} label: {
                Label("Sign out", systemImage: "rectangle.portrait.and.arrow.right")
            }
        } label: {
            Circle()
                .fill(Color.white.opacity(0.18))
                .overlay(
                    Text(displayInitial)
                        .font(.headline.weight(.semibold))
                        .foregroundStyle(.white)
                )
                .frame(width: 42, height: 42)
                .shadow(color: .black.opacity(0.25), radius: 10, x: 0, y: 6)
        }
    }
}

private struct InsightRow: View {
    let icon: String
    let title: String
    let detail: String
    let timestamp: Date

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            Image(systemName: icon)
                .font(.title3.weight(.semibold))
                .frame(width: 32, height: 32)
                .foregroundStyle(.white)
                .background(Color.white.opacity(0.12), in: RoundedRectangle(cornerRadius: 10, style: .continuous))

            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.85))
                Text(detail)
                    .font(.footnote)
                    .foregroundStyle(.white.opacity(0.7))
                Text(timestamp, style: .time)
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.55))
            }
        }
    }
}

private struct KPIBadge: View {
    let kpi: KPIInsight

    var body: some View {
        GlassCard(gradient: DemoDestination.kpis.accentGradient) {
            VStack(alignment: .leading, spacing: 12) {
                Text(kpi.title.uppercased())
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(Color.white.opacity(0.75))

                Text(kpi.value)
                    .font(.title2.bold())

                HStack(spacing: 8) {
                    Image(systemName: symbolName)
                        .font(.caption.weight(.bold))
                    Text(kpi.delta)
                        .font(.caption.weight(.semibold))
                    Spacer()
                }
            }
        }
        .frame(minHeight: 140)
    }

    private var symbolName: String {
        switch kpi.direction {
        case .up: "arrow.up.right"
        case .flat: "arrow.left.and.right"
        case .down: "arrow.down.right"
        }
    }
}

private struct StatusTag: View {
    let status: TaskStatus

    var body: some View {
        Text(status.rawValue.uppercased())
            .font(.caption2.weight(.semibold))
            .foregroundStyle(.white)
            .padding(.vertical, 6)
            .padding(.horizontal, 12)
            .background(tagColor, in: Capsule(style: .continuous))
    }

    private var tagColor: Color {
        switch status {
        case .upcoming:
            Color.green.opacity(0.4)
        case .dueToday:
            Color.orange.opacity(0.55)
        case .blocked:
            Color.red.opacity(0.45)
        }
    }
}

// MARK: - Layout Helpers

private extension LabelStyle where Self == TrailingIconLabelStyle {
    static var trailingIcon: TrailingIconLabelStyle { TrailingIconLabelStyle() }
}

private struct TrailingIconLabelStyle: LabelStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 6) {
            configuration.title
            configuration.icon
        }
    }
}

#if DEBUG
#Preview {
    ConductorShellView()
}
#endif
