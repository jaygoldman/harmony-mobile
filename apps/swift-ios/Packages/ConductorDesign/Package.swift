// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "ConductorDesign",
    defaultLocalization: "en",
    platforms: [
        .iOS("17.4")
    ],
    products: [
        .library(name: "ConductorDesign", targets: ["ConductorDesign"])
    ],
    targets: [
        .target(
            name: "ConductorDesign"
        )
    ],
    swiftLanguageVersions: [
        .version("6")
    ]
)
