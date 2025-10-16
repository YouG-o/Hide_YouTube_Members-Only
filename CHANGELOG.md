# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.1] - 2025-10-16

### Fix
- Fixed missing observer initialization after full page reload by manually calling `handleUrlChange()` in `setupUrlObserver`. This ensures all observers and features are correctly set up whether the user navigates via SPA or refreshes the browser.

## [1.3.0] - 2025-09-22

### Feat
- Added suggested videos support.

## [1.2.0] - 2025-08-02

### Changed
- Updated extension icon.

### Added
- Added a log in the script showing the total number of members-only videos hidden from API responses.
- Added a warning message in the welcome page and a refresh button instead of auto-reloading on install.

### Removed
- Removed automatic page reload on extension install.

## [1.1.0] - 2025-07-14

### Added
- Add request interception method to filter members-only videos before DOM rendering.

## [1.0.0] - 2025-07-14



---

[Unreleased]: https://github.com/YouG-o/Hide_YouTube_Members-Only/compare/v1.3.0...HEAD
[1.2.0]: https://github.com/YouG-o/Hide_YouTube_Members-Only/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/YouG-o/Hide_YouTube_Members-Only/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/YouG-o/Hide_YouTube_Members-Only/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/YouG-o/Hide_YouTube_Members-Only/releases/tag/v1.0.0

