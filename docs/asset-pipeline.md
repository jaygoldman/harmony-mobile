# Harmony Mobile Asset Pipeline

This document outlines how brand assets flow into the React Native workspace and where to drop placeholders while design deliverables are in progress.

## Directory Layout

```
assets/
  audio/                # Podcast episode stubs and generated narration
  fonts/                # Conductor brand fonts (linked via react-native.config.js)
  images/
    brand/              # Logos, splash screens, marketing artwork
    icons/              # Tab icons, glyphs, contextual illustrations
```

- Keep raw source files (SVG/PSD/AI) in `assets/images/brand`. Optimised exports (PNG, WebP) for runtime use should stay alongside source with matching filenames.
- Podcasts and longer-form audio live in `assets/audio`. Use 128kbps AAC or MP3 for TestFlight builds.
- Fonts in `assets/fonts` are linked through `react-native.config.js`. Run `npx react-native-asset` after adding new font files so iOS picks them up.

## Adding New Assets

1. Drop new files into the appropriate directory above.
2. Update `packages/theme` theme tokens if colours or typography change.
3. Export React Native components that reference the assets from `packages/ui` (to be created in Phase 1) to keep resource imports centralised.
4. Document any new asset contract in Storybook stories once the UI kit is established.

## Placeholder Resources

- `assets/images/brand/logo-placeholder.svg`: Replace with final logomark once design hands off brand kit.
- `assets/images/icons/.keep`: Replace with actual icon exports. Use 32x32 logical size for tab icons, 24x24 for inline glyphs.
- `assets/audio/.keep`: Swap with generated Harmony podcasts or narration once voice model decisions are finalised.

All placeholder files are intentionally tracked so CI fails if a referenced asset is missing.
