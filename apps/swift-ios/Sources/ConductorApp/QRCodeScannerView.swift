import SwiftUI
import AVFoundation

struct QRCodeScannerView: UIViewRepresentable {
    enum ScanningError: LocalizedError {
        case permissionDenied
        case cameraUnavailable

        var errorDescription: String? {
            switch self {
            case .permissionDenied:
                return "Camera access is required to scan QR codes. Enable camera permissions in Settings."
            case .cameraUnavailable:
                return "This device does not have a camera available for scanning."
            }
        }
    }

    let isActive: Bool
    let onResult: (Result<String, ScanningError>) -> Void

    func makeUIView(context: Context) -> ScannerPreviewView {
        let view = ScannerPreviewView(onResult: onResult)
        view.setScanning(isActive)
        return view
    }

    func updateUIView(_ uiView: ScannerPreviewView, context: Context) {
        uiView.setScanning(isActive)
    }
}

@MainActor
final class ScannerPreviewView: UIView, AVCaptureMetadataOutputObjectsDelegate {
    private let captureSession = AVCaptureSession()
    private let sessionQueue = DispatchQueue(label: "com.conductor.scanner.session")
    private let onResult: (Result<String, QRCodeScannerView.ScanningError>) -> Void

    private var isConfigured = false
    private var shouldScan = false
    private var isProcessingResult = false

    override class var layerClass: AnyClass {
        AVCaptureVideoPreviewLayer.self
    }

    private var previewLayer: AVCaptureVideoPreviewLayer {
        layer as! AVCaptureVideoPreviewLayer
    }

    init(onResult: @escaping (Result<String, QRCodeScannerView.ScanningError>) -> Void) {
        self.onResult = onResult
        super.init(frame: .zero)
        backgroundColor = .black
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        previewLayer.frame = bounds
    }

    func setScanning(_ active: Bool) {
        shouldScan = active

        if active {
            configureSessionIfNeeded()
        } else {
            stopSession()
        }
    }

    private func configureSessionIfNeeded() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            setupSessionIfNeeded()
            startSessionIfNeeded()
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                guard let self else { return }

                DispatchQueue.main.async {
                    if granted {
                        self.setupSessionIfNeeded()
                        self.startSessionIfNeeded()
                    } else {
                        self.shouldScan = false
                        self.onResult(.failure(.permissionDenied))
                    }
                }
            }
        case .denied, .restricted:
            shouldScan = false
            onResult(.failure(.permissionDenied))
        @unknown default:
            shouldScan = false
            onResult(.failure(.permissionDenied))
        }
    }

    private func setupSessionIfNeeded() {
        guard !isConfigured else { return }

        guard let videoDevice = AVCaptureDevice.default(for: .video) else {
            onResult(.failure(.cameraUnavailable))
            return
        }

        do {
            let videoInput = try AVCaptureDeviceInput(device: videoDevice)
            if captureSession.canAddInput(videoInput) {
                captureSession.addInput(videoInput)
            }

            let metadataOutput = AVCaptureMetadataOutput()
            if captureSession.canAddOutput(metadataOutput) {
                captureSession.addOutput(metadataOutput)
                metadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
                metadataOutput.metadataObjectTypes = [.qr]
            }
        } catch {
            onResult(.failure(.cameraUnavailable))
            return
        }

        previewLayer.session = captureSession
        previewLayer.videoGravity = .resizeAspectFill

        isConfigured = true
    }

    private func startSessionIfNeeded() {
        guard shouldScan, isConfigured else { return }

        sessionQueue.async { [weak self] in
            guard let self else { return }
            if !self.captureSession.isRunning {
                DispatchQueue.main.async {
                    self.isProcessingResult = false
                }
                self.captureSession.startRunning()
            }
        }
    }

    private func stopSession() {
        sessionQueue.async { [weak self] in
            guard let self else { return }
            if self.captureSession.isRunning {
                self.captureSession.stopRunning()
            }
            DispatchQueue.main.async {
                self.isProcessingResult = false
            }
        }
    }

    private func handleScannedValue(_ value: String) {
        guard shouldScan, !isProcessingResult else { return }

        isProcessingResult = true
        onResult(.success(value))
    }

    // MARK: - AVCaptureMetadataOutputObjectsDelegate

    nonisolated func metadataOutput(
        _ output: AVCaptureMetadataOutput,
        didOutput metadataObjects: [AVMetadataObject],
        from connection: AVCaptureConnection
    ) {
        guard
            let value = metadataObjects.compactMap({ ($0 as? AVMetadataMachineReadableCodeObject)?.stringValue }).first
        else {
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.handleScannedValue(value)
        }
    }
}
