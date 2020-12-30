## [1.0.1] - 2020-12-30

### Added
- Added React v17 to allowed peer dependencies.

### Fixed
- Handle mounting server rendered content properly.
- Handle updates to embedded image properly.


## [1.0.0] - 2019-11-08

### Added
- Support for embedding image into QR Code.

### Changed
- Remove `PropTypes` in production environments.


## [0.9.3] - 2019-02-17

### Fixed
- Updated Path2D detection to exclude browsers which don't support string constructor (Edge).


## [0.9.2] - 2019-01-03

### Fixed
- Properly support new `includeMargin` prop in the canvas renderer.


## [0.9.1] - 2018-12-27

### Fixed
- Consume non-DOM prop in canvas renderer to prevent spurious warnings from React.


## [0.9.0] - 2018-12-22

### Added
- Support for `includeMargin` prop, to include the "quiet zone" in rendering

### Changed
- Updated canvas renderer to use Path2D (where available), and simplify the render. This fixes some rendering inconsistencies.
- Switched to using `React.PureComponent` instead of a custom `shouldComponentUpdate` method.


## [0.8.0] - 2018-02-19

### Added

- New `renderAs` prop, with support for rendering to SVG. This is a more versatile target for high quality visuals.
- Support for `style`, `className`, and any other DOM props that might be passed through (e.g. `data-*`).
- Support for proper encoding of multibyte strings (Chinese, Japanese, Emoji, etc.).


## [0.7.2] - 2017-10-01

### Added
- Added support for React v16


## [0.7.1] - 2017-04-27

### Fixed
- Removed `flow-bin` from `dependencies`


## [0.7.0] - 2017-04-25

### Removed
- Removed support for React < 15.5


## [0.6.1] - 2016-04-13

- Extended support to React v15


## [0.6.0] - 2016-02-02

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
