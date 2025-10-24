import SwiftUI
import ConductorDesign

struct OnboardingView: View {
    @ObservedObject var viewModel: ConductorAppViewModel

    let theme: ConductorTheme

    @State private var scannerIsActive = true
    @State private var localErrorMessage: String?
    @State private var cameraMessage: String?
    @State private var manualEntryPresented = false
    @State private var manualCode = ""
    @State private var manualApiURL = "https://"
    @State private var manualEntryError: String?
    @State private var lastProcessedPayload: String?

    var body: some View {
        GlassBackground(theme: theme) {
            VStack(spacing: 28) {
                header
                scanner
                statusSection
                Button(action: { presentManualEntry() }) {
                    Label("Enter code manually", systemImage: "keyboard")
                        .font(.headline)
                        .padding(.vertical, 14)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(theme.accent)
                .controlSize(.large)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 36)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        }
        .preferredColorScheme(.dark)
        .tint(theme.accent)
        .sheet(isPresented: $manualEntryPresented, onDismiss: resetScannerState) {
            ManualEntrySheet(
                code: $manualCode,
                apiURL: $manualApiURL,
                errorMessage: manualEntryError,
                onCancel: cancelManualEntry,
                onSubmit: connectManually
            )
        }
        .onAppear(perform: resetScannerState)
        .onChange(of: viewModel.sessionState) { _ in
            updateScannerActivity()
            if case .disconnected = viewModel.sessionState {
                lastProcessedPayload = nil
            }
            if case .error = viewModel.sessionState {
                lastProcessedPayload = nil
            }
        }
        .onChange(of: manualEntryPresented) { _ in
            updateScannerActivity()
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Connect Conductor")
                .font(.largeTitle.bold())
                .foregroundStyle(.white)

            Text("Scan the desktop QR code to securely link your mobile app. You can also enter the 8-character code manually.")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.75))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var scanner: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(Color.black.opacity(0.35))
                .overlay {
                    LinearGradient(
                        colors: [
                            theme.accent.opacity(0.25),
                            Color.black.opacity(0.15)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                }

            QRCodeScannerView(isActive: scannerIsActive, onResult: handleScanResult)
                .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))

            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .strokeBorder(Color.white.opacity(0.25), lineWidth: 1.5)

            VStack {
                Rectangle()
                    .fill(Color.white.opacity(0.45))
                    .frame(height: 2)
                    .blur(radius: 1.2)
                    .padding(.horizontal, 24)
                    .padding(.top, 80)
                Spacer()
            }

            if !scannerIsActive {
                VStack(spacing: 12) {
                    ProgressView()
                        .progressViewStyle(.circular)
                    Text("Connecting…")
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.8))
                }
                .padding(24)
                .background(Color.black.opacity(0.45), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            }
        }
        .frame(height: 320)
        .shadow(color: .black.opacity(0.4), radius: 30, x: 0, y: 18)
    }

    @ViewBuilder
    private var statusSection: some View {
        VStack(spacing: 12) {
            if let message = combinedErrorMessage {
                Label {
                    Text(message)
                        .font(.footnote)
                } icon: {
                    Image(systemName: "exclamationmark.triangle.fill")
                }
                .padding()
                .background(Color.orange.opacity(0.25), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                .foregroundStyle(.white)
            }

            if let status = viewModel.statusMessage {
                Label {
                    Text(status)
                        .font(.footnote)
                } icon: {
                    Image(systemName: "link")
                }
                .padding()
                .background(Color.white.opacity(0.12), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                .foregroundStyle(.white)
            } else if combinedErrorMessage == nil {
                Label {
                    Text("Open the desktop app • Profile → Connect Mobile App")
                        .font(.footnote)
                } icon: {
                    Image(systemName: "wave.3.right")
                }
                .padding()
                .background(Color.white.opacity(0.12), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                .foregroundStyle(.white.opacity(0.85))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var combinedErrorMessage: String? {
        if let cameraMessage {
            return cameraMessage
        }

        if let message = localErrorMessage {
            return message
        }

        if case let .error(message) = viewModel.sessionState {
            return message
        }

        return nil
    }

    private func handleScanResult(_ result: Result<String, QRCodeScannerView.ScanningError>) {
        switch result {
        case let .success(payload):
            guard shouldProcess(payload: payload) else { return }
            processScannedPayload(payload)
        case let .failure(error):
            cameraMessage = error.localizedDescription
            localErrorMessage = nil
            updateScannerActivity()
        }
    }

    private func shouldProcess(payload: String) -> Bool {
        guard !payload.isEmpty else { return false }
        if let lastProcessedPayload, lastProcessedPayload == payload {
            return false
        }
        return true
    }

    private func processScannedPayload(_ payload: String) {
        print("[Onboarding] Scanned QR payload: \(payload)")
        localErrorMessage = nil
        cameraMessage = nil

        do {
            let connectionPayload = try viewModel.decodeConnectionPayload(from: payload)
            lastProcessedPayload = payload
            scannerIsActive = false

            Task {
                await viewModel.connect(using: connectionPayload)
            }
        } catch {
            localErrorMessage = "We couldn't read that QR code. Try again or use the manual code."
            scheduleScannerReset()
        }
    }

    private func presentManualEntry() {
        manualEntryError = nil
        manualEntryPresented = true
    }

    private func cancelManualEntry() {
        manualEntryPresented = false
    }

    private func connectManually() {
        manualEntryError = nil

        do {
            let payload = try viewModel.manualConnectionPayload(code: manualCode, apiUrlString: manualApiURL)
            print("[Onboarding] Manual connection payload: code=\(payload.code) url=\(payload.apiUrl)")
            manualEntryPresented = false
            lastProcessedPayload = "\(payload.code)|\(payload.apiUrl.absoluteString)"
            scannerIsActive = false

            Task {
                await viewModel.connect(using: payload)
            }
        } catch {
            manualEntryError = error.localizedDescription
        }
    }

    private func scheduleScannerReset() {
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 1_200_000_000)
            if allowsScanning && !manualEntryPresented {
                scannerIsActive = true
            }
        }
    }

    private func resetScannerState() {
        cameraMessage = nil
        localErrorMessage = nil
        updateScannerActivity()
    }

    private func updateScannerActivity() {
        scannerIsActive = allowsScanning && !manualEntryPresented
    }

    private var allowsScanning: Bool {
        switch viewModel.sessionState {
        case .disconnected, .error:
            return true
        default:
            return false
        }
    }
}

private struct ManualEntrySheet: View {
    @Binding var code: String
    @Binding var apiURL: String

    let errorMessage: String?
    let onCancel: () -> Void
    let onSubmit: () -> Void

    @Environment(\.dismiss) private var dismiss
    @FocusState private var focusedField: Field?

    enum Field {
        case code
        case url
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Desktop code") {
                    TextField("8-character code", text: $code)
                        .textInputAutocapitalization(.characters)
                        .keyboardType(.asciiCapable)
                        .autocorrectionDisabled()
                        .font(.system(.body, design: .monospaced))
                        .focused($focusedField, equals: .code)
                        .onChange(of: code) { newValue in
                            code = newValue.uppercased().replacingOccurrences(of: " ", with: "")
                        }
                }

                Section("Server URL") {
                    TextField("https://app.example.com", text: $apiURL)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .focused($focusedField, equals: .url)
                }

                if let errorMessage {
                    Section {
                        Label(errorMessage, systemImage: "exclamationmark.triangle.fill")
                            .foregroundStyle(.orange)
                            .font(.footnote)
                    }
                }
            }
            .navigationTitle("Manual Connection")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        onCancel()
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Connect", action: onSubmit)
                        .disabled(code.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear {
                focusedField = .code
            }
        }
    }
}
