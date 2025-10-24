import SwiftUI
import ConductorDesign
import ConductorData
import ConductorDemoFeatures

public struct ConductorAppRootView: View {
    private let theme: ConductorTheme
    private let catalog: FeatureCatalog

    @StateObject private var viewModel: ConductorAppViewModel

    public init(
        theme: ConductorTheme = .liquidGlassDemo,
        catalog: FeatureCatalog = .init(),
        dataStore: DemoDataStore = DemoDataStore()
    ) {
        self.theme = theme
        self.catalog = catalog
        _viewModel = StateObject(wrappedValue: ConductorAppViewModel(dataStore: dataStore))
    }

    public var body: some View {
        Group {
            switch viewModel.sessionState {
            case let .connected(profile):
                ConductorShellView(theme: theme, catalog: catalog, dataStore: viewModel.dataStore)
                    .environmentObject(viewModel)
                    .accessibilityLabel("Connected as \(profile.name)")
            case .connecting, .restoring:
                LoadingView(theme: theme)
            case .disconnected, .error:
                OnboardingView(viewModel: viewModel, theme: theme)
            }
        }
    }
}

private struct LoadingView: View {
    let theme: ConductorTheme

    var body: some View {
        GlassBackground(theme: theme) {
            VStack(spacing: 20) {
                ProgressView()
                    .progressViewStyle(.circular)
                    .tint(theme.accent)
                Text("Restoring your Conductor session…")
                    .font(.callout)
                    .foregroundStyle(.white.opacity(0.8))
            }
            .padding(32)
            .background(Color.black.opacity(0.35), in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        }
        .preferredColorScheme(.dark)
        .tint(theme.accent)
    }
}
