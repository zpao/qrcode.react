## [4.2.0] - 2024-12-11

### Added
- Added React v19 to `peerDependencies` (#381)


## [4.1.0] - 2024-10-21

### Added
- Added support for new `boostLevel` prop, allowing the disabling of the underlying encoder's default of automatically boosting the ECL. (#374)
- Added support for accepting an array of strings for `value`, which enables encoding of each part into independent segments. (#374)


## [3.2.0] - 2024-08-31

### Fixed
- Improved support for dual publishing of ESM/CJS modules for better compatibility with tools. (#301, #368)
- Mitigated warnings when using QRCodeSVG in server components (#352)

### Changed
- Added `@deprecated` JSDoc to default export for additional visibility in editors to TypeScript users.


## [4.0.1] - 2024-08-28

### Fixed
- Corrected issue with loading types in Typescript when configured with `"moduleResolution": "Bundler"` or `"module": "ESNext"`. (#368)


## [4.0.0] - 2024-08-27

### Added

- Added proper support for `ref`, enabling direct access for underlying `canvas` or `svg` nodes. This also resulted in much more accurate type defitions. (#202)
- Added support for `marginSize` prop, replacing the now deprecated `includeMargin`. This enables margins of any value, not just `0` or `4`. (#281)
- Added Support for Setting Image Opacity via `imageSettings.opacity` (#292)
- Added `minVersion` prop to give better control over QR Code generated (#323)
- Added support for specifying `cross-origin` for embedded images via `imageSettings.crossOrigin`. (#324)

### Changed

- Improved accessibility for `QRCodeSVG` by rendering a `<title>` node instead of setting a `title` attribute. (#284)
- Improved accessibility with explicit `role` set on rendered SVG and Canvas. (#321)
- Improved documentation (#358)
- Used better types in TypeScript for ErrorCorrectionLevel, resulting in better developer experience. (#291)

### Deprecated

- The `includeMargin` prop has been deprecated in favor of `marginSize`. (#281)

### Removed

- Removed default export which was deprecated in v3. (#208)
- Remove explicit `style` prop. This still works identically as it was passed through and the type definitions are unaffected as they were improved via the `ref` changes (#357)

### Fixed

- Improved support for dual publishing of ESM/CJS modules for better compatibility with tools. (#301)
- Set explicit display names for improved debugging experience. (#304)
- Improved SVG compatibility by using `href` in place of `xlink:href` for embedded images. (#336)
- Mitigated warnings when using QRCodeSVG in server components (#352)


## [3.1.0] - 2022-06-25

### Fixed
- Made optional props optional, removing use of `defaultProps`. This may be a slight behavior change with TypeScript if previously passing `null`.
- Fixed used of `shapeRendering="crispEdges"` in SVG component.


## [3.0.2] - 2022-05-15

### Fixed
- Fixed TypeScript types to reflect pass through of DOM props.

### Changed
- Updated qr-code-generator to <https://github.com/nayuki/QR-Code-generator/commit/d524de615364fe630040b208b4caa14b6cd8e526>


## [3.0.1] - 2022-03-30

### Added
- Added React v18 to allowed peer dependencies.


## [3.0.0] - 2022-03-26

### Added
- Added support for named exports for `QRCodeSVG` and `QRCodeCanvas`.
- Added support for ES Modules.
- Added embedded type definitions.

### Changed
- Swapped out `qr.js` dependency for vendored version of <https://www.nayuki.io/page/qr-code-generator-library>.
- Rewrote using hooks.

### Deprecated
- Deprecated support for default export. This will be removed in v4.

### Removed
- Removed support for React < 16.8.


## [2.0.0] - 2022-03-05

### Fixed
- Switched to using `unsafe_*` lifecycle methods, eliminating a warning from non-production environments.

### Removed
- Removed support for React < 16.3.


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
