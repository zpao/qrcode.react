## [Unreleased]

### Added
- Added support for specifying the Error Correction level (e.g. `level="H"`)

### Changed
- Default Error Correction level is now `'L'` (was implicitly `'H'`)


## [0.5.2] - 2015-11-20

### Fixed
- Fixed bug preventing usage in IE < 11


## [0.5.1] - 2015-10-14

### Changed
- Extended support to React v0.14


## [0.5.0] - 2015-07-28

### Added
- Added support for HiDPI screens by scaling the `<canvas>`
- Added `shouldComponentUpdate` bailout to prevent unnecessary rendering
