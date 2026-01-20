# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-01-20

### Added

- **Accidental Data Loss Prevention**: Added safety check (tab close confirmation) when processing is active.
- **Screen Wake Lock**: Implemented `useWakeLock` hook to prevent device sleep during long PDF processing tasks.

### Fixed

- **Build Error**: Fixed a typo in `useBackgroundNotifications` hook usage.

## [0.1.0] - 2026-01-01

### Added

- Initial release of **1PDF**.
- Core PDF Combining functionality (2, 3, 4, 6 pages per sheet).
- Client-side PDF processing using `pdf-lib` and `pdfjs-dist` via Web Workers.
- Drag & drop file support.
- Custom settings (Page count, DPI, Grayscale, Invert Colors).
- PWA support (offline capable, installable).
