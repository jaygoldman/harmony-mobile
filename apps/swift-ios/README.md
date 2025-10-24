# Conductor Native iOS Workspace

This directory hosts the Swift-first rewrite alongside the legacy React Native app. Open `Package.swift` in Xcode to generate a lightweight workspace and gain access to the SwiftUI targets without creating additional `.xcodeproj` files.

## Layout

- `Package.swift` – umbrella manifest that exposes the `ConductorApp` library and wires local packages as dependencies.
- `Sources/ConductorApp` – ships `ConductorShellView`, the SwiftUI tab scaffold with the Liquid Glass tab bar and demo feature screens.
- `Packages/ConductorDesign` – Liquid Glass design tokens, gradients, and container utilities.
- `Packages/ConductorData` – deterministic demo payloads that power the shell (Harmony briefs, activity feed, KPIs, tasks, podcasts, settings).
- `Packages/ConductorDemoFeatures` – metadata describing the top-level destinations and their iconography.

### Running the shell

1. Open the shared workspace at `apps/swift-ios/ConductorWorkspace.xcworkspace`. This workspace already lists the Swift package (`Package.swift`) and the `ConductorHost` app side by side so Xcode keeps the dependency graph in sync.
2. If Xcode shows stale package errors, remove any existing entries under **File ▸ Packages ▸ Reset Package Caches**, then choose **File ▸ Packages ▸ Resolve Package Dependencies**. You should now see `ConductorWorkspace` with the `ConductorApp` product available to link.
3. (If the `ConductorHost` project does not exist yet) use File → New → Project…, pick the iOS **App** template, name it `ConductorHost`, save it inside `apps/swift-ios/ConductorHost`, and make sure you add it to the open workspace when prompted.
4. In the `ConductorHost` target settings, link the shell library: **General ▸ Frameworks, Libraries, and Embedded Content** → “+” → **Add Other… ▸ Add Package Dependency…** → select `ConductorWorkspace` (the entry that points at `apps/swift-ios/Package.swift`) → tick the `ConductorApp` product for the `ConductorHost` target.
5. Replace the generated `ConductorHostApp.swift` body with:

   ```swift
   import SwiftUI
   import ConductorApp

   @main
   struct ConductorHostApp: App {
       var body: some Scene {
           WindowGroup {
               ConductorShellView()
           }
       }
   }
   ```

6. Select the `ConductorHost` scheme and run it on the simulator to explore the Liquid Glass tab shell.
