# qrcode.react

A React component to generate [QR codes](http://en.wikipedia.org/wiki/QR_code) for rendering to the DOM.

## Installation

```sh
npm install qrcode.react
```

## Usage

`qrcode.react` exports three components, supporting rendering as SVG or Canvas. SVG is generally recommended as it is more flexible, but Canvas may be preferable.

All examples are shown using modern JavaScript modules and syntax. CommonJS `require('qrcode.react')` is also supported.

### `QRCodeSVG`

```js
import ReactDOM from 'react-dom';
import {QRCodeSVG} from 'qrcode.react';

ReactDOM.render(
  <QRCodeSVG value="https://reactjs.org/" />,
  document.getElementById('mountNode')
);
```

### `QRCodeCanvas`

```js
import ReactDOM from 'react-dom';
import {QRCodeCanvas} from 'qrcode.react';

ReactDOM.render(
  <QRCodeCanvas value="https://reactjs.org/" />,
  document.getElementById('mountNode')
);
```

### `QRCode` - **DEPRECATED**

**Note:** Usage of this is deprecated as of v3. It is available as the `default` export for compatiblity with previous versions. The `renderAs` prop is only supported with this component.

```js
import ReactDOM from 'react-dom';
import QRCode from 'qrcode.react';

ReactDOM.render(
  <QRCode value="https://reactjs.org/" renderAs="canvas" />,
  document.getElementById('mountNode')
);
```

## Available Props

| prop                         | type                         | default value |
| ---------------------------- | ---------------------------- | ------------- |
| `value`                      | `string`                     |               |
| `renderAs`                   | `string` (`'canvas' 'svg'`)  | `'canvas'`    |
| `size`                       | `number`                     | `128`         |
| `bgColor`                    | `string` (CSS color)         | `"#FFFFFF"`   |
| `fgColor`                    | `string` (CSS color)         | `"#000000"`   |
| `level`                      | `string` (`'L' 'M' 'Q' 'H'`) | `'L'`         |
| `includeMargin` (Deprecated) | `boolean`                    | `false`       |
| `marginSize`                 | `number`                     | `0`           |
| `imageSettings`              | `object`                     |               |

### `value`

The value to encode into a QR Code. See [Encoding Mode](#encoding-mode) below for more details.

### `size`

The size (in pixels) that the QR Code should be rendered, inclusive of any margin specified. QR Codes are square so this will be used for height and width.

> **Note**
> When using `QRCodeCanvas`, the actual `canvas` element is rendered at a higher number of pixels (depending on reported display density) and then scaled down with CSS.

### `bgColor`

The "background" color for the QR Code. In tranditional cases, this is white.

> **Note**
> This color will also be used for the margin.

### `fgColor`

The "foreground" color for the QR Code. In traditional cases, this is black.

### `level`

The error correction level to use. Information is encoded in QR Codes such that they can lose part of their visible areas and still be decodable. The amount of correction depends on this value. Higher error correction will result in more complex QR Codes.

- `L` = low (~7%)
- `M` = medium (~15%)
- `Q` = quartile (~25%)
- `H` = high (~30%)

See [Wikipedia](https://en.wikipedia.org/wiki/QR_code#Error_correction) or the [official QR Code documentation](https://www.qrcode.com/en/about/error_correction.html) for a more detailed explaination.

### `includeMargin`

Whether or not to render a margin around the modules. The margin will be `4` modules wide.

> **Warning**
> This has been deprecated as of v4 and will be removed in future versions. Use `marginSize` instead.

### `marginSize`

Specifies the number of _modules_ to use for margin around the symbol. The QR Code specification requires `4`, however you may use other values. Values will be turned to integers with `Math.floor`.

> **Note**
> Overrides `includeMargin` default value when specified.

### `imageSettings`

This object represents the settings available when adding another image on top of the QR Code.

| field      | type      | default value | note                                    |
| ---------- | --------- | ------------- | --------------------------------------- |
| `src`      | `string`  |               |                                         |
| `x`        | `number`  | none          | Will attempt to center if not specified |
| `y`        | `number`  | none          | Will attempt to center if not specified |
| `height`   | `number`  | 10% of `size` |                                         |
| `width`    | `number`  | 10% of `size` |                                         |
| `excavate` | `boolean` | `false`       |                                         |

#### `src`

The URI of the image to use.

> **Note**
> It is possible to use a data URI to prevent additional network requests.

#### `x`, `y`

The coordinates to place the image. `(0, 0)` represents the top-left corner.

#### `height`

The height to use for the image.

#### `width`

The width to use for the image.

#### `excavate`

This setting determines whether or not to "carve out" any modules that have been partially obscured by the image. When `true`, the partial modules that would be colored by `fgColor` will instead be colored by `bgColor`.

## Custom Styles

`qrcode.react` will pass through any additional props to the underlying DOM node (`<svg>` or `<canvas>`). This allows the use of inline `style` or custom `className` to customize the rendering. One common use would be to support a responsive layout.

> **Note:**
> In order to render QR Codes in `<canvas>` on high density displays, we scale the canvas element to contain an appropriate number of pixels and then use inline styles to scale back down. We will merge any additional styles, with custom `height` and `width` overriding our own values. This allows scaling to percentages _but_ if scaling beyond the `size`, you will encounter blurry images. I recommend detecting resizes with something like [react-measure](https://github.com/souporserious/react-measure) to detect and pass the appropriate size when rendering to `<canvas>`.

<img src="qrcode.png" height="256" width="256">

## Encoding Mode

`qrcode.react` supports encoding text only, in a single segment. The encoding library being used does minimal detection to determine if the text being encoded can follow an optimized path for Numeric or Alphanumeric modes, allowing for more data to be encoded. Otherwise, it will encode following Byte mode. This mode includes supports multi-byte Unicode characters such as Kanji, however it does not support the optimized Kanji encoding mode.

## LICENSE

`qrcode.react` is licensed under the [ISC license](LICENSE).

`qrcode.react` bundles [QR Code Generator](https://www.nayuki.io/page/qr-code-generator-library), which is available under the [MIT license](src/third-party/qrcodegen/LICENSE).
