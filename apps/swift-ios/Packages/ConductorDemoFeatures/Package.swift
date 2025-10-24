// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "ConductorDemoFeatures",
    defaultLocalization: "en",
    platforms: [
        .iOS("17.4")
    ],
    products: [
        .library(name: "ConductorDemoFeatures", targets: ["ConductorDemoFeatures"])
    ],
    dependencies: [
        .package(path: "../ConductorDesign"),
        .package(path: "../ConductorData")
    ],
    targets: [
        .target(
            name: "ConductorDemoFeatures",
            dependencies: [
                .product(name: "ConductorDesign", package: "ConductorDesign"),
                .product(name: "ConductorData", package: "ConductorData")
            ]
        )
    ],
    swiftLanguageVersions: [
        .version("6")
    ]
)
