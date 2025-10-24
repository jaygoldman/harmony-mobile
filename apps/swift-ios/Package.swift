// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "ConductorWorkspace",
    defaultLocalization: "en",
    platforms: [
        .iOS("17.4")
    ],
    products: [
        .library(name: "ConductorApp", targets: ["ConductorApp"])
    ],
    dependencies: [
        .package(path: "Packages/ConductorDesign"),
        .package(path: "Packages/ConductorData"),
        .package(path: "Packages/ConductorDemoFeatures")
    ],
    targets: [
        .target(
            name: "ConductorApp",
            dependencies: [
                .product(name: "ConductorDesign", package: "ConductorDesign"),
                .product(name: "ConductorData", package: "ConductorData"),
                .product(name: "ConductorDemoFeatures", package: "ConductorDemoFeatures")
            ]
        )
    ],
    swiftLanguageVersions: [
        .version("6")
    ]
)
