import SwiftUI
import AVFoundation

struct QRCodeScannerView: UIViewControllerRepresentable {
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

    func makeUIViewController(context: Context) -> ScannerViewController {
        ScannerViewController(onResult: onResult)
    }

    func updateUIViewController(_ uiViewController: ScannerViewController, context: Context) {
        uiViewController.setScanning(isActive)
    }
}

@MainActor
final class ScannerViewController: UIViewController {
    private let captureSession = AVCaptureSession()
    private let onResult: (Result<String, QRCodeScannerView.ScanningError>) -> Void

    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var isConfigured = false
    private var shouldScan = false
    private var isProcessingResult = false

    init(onResult: @escaping (Result<String, QRCodeScannerView.ScanningError>) -> Void) {
        self.onResult = onResult
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.bounds
    }

    func setScanning(_ active: Bool) {
        shouldScan = active

        if active {
            configureSessionIfNeeded()
            startSessionIfNeeded()
        } else {
            stopSession()
        }
    }

    private func configureSessionIfNeeded() {
        guard !isConfigured else { return }

        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            setupSession()
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                guard let self else { return }

                DispatchQueue.main.async {
                    if granted {
                        self.setupSession()
                        if self.shouldScan {
                            self.startSessionIfNeeded()
                        }
                    } else {
                        self.onResult(.failure(.permissionDenied))
                    }
                }
            }
        case .denied, .restricted:
            onResult(.failure(.permissionDenied))
        @unknown default:
            onResult(.failure(.permissionDenied))
        }
    }

    private func setupSession() {
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

        let previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        previewLayer.videoGravity = .resizeAspectFill
        previewLayer.frame = view.layer.bounds

        view.layer.sublayers?.forEach { $0.removeFromSuperlayer() }
        view.layer.addSublayer(previewLayer)

        self.previewLayer = previewLayer
        isConfigured = true
    }

    private func startSessionIfNeeded() {
        guard shouldScan, isConfigured else { return }

        if !captureSession.isRunning {
            isProcessingResult = false
            captureSession.startRunning()
        }
    }

    private func stopSession() {
        if captureSession.isRunning {
            captureSession.stopRunning()
        }
        isProcessingResult = false
    }

    private func handleScannedValue(_ value: String) {
        guard shouldScan, !isProcessingResult else { return }

        isProcessingResult = true
        onResult(.success(value))
    }

}

extension ScannerViewController: AVCaptureMetadataOutputObjectsDelegate {
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
