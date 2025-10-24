// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "ConductorData",
    defaultLocalization: "en",
    platforms: [
        .iOS("17.4")
    ],
    products: [
        .library(name: "ConductorData", targets: ["ConductorData"])
    ],
    targets: [
        .target(
            name: "ConductorData"
        )
    ],
    swiftLanguageVersions: [
        .version("6")
    ]
)
