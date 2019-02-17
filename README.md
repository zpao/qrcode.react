# qrcode.react

A React component to generate [QR codes](http://en.wikipedia.org/wiki/QR_code).

## Installation

```sh
npm install qrcode.react
```

## Usage

```js
var React = require('react');
var QRCode = require('qrcode.react');

React.render(
  <QRCode value="http://facebook.github.io/react/" />,
  mountNode
);
```

## Available Props

prop      | type                 | default value
----------|----------------------|--------------
`value`   | `string`             |
`renderAs`| `string` (`'canvas' 'svg'`) | `'canvas'`
`size`    | `number`             | `128`
`bgColor` | `string` (CSS color) | `"#FFFFFF"`
`fgColor` | `string` (CSS color) | `"#000000"`
`level`   | `string` (`'L' 'M' 'Q' 'H'`)            | `'L'`
`includeMargin` | `boolean`      | `false`
`ref`     | `function` [react's ref](https://reactjs.org/docs/refs-and-the-dom.html) |
`img`     | see below            | see below

### `img` Props

prop      | type                  | default value
----------|-----------------------|--------------
`src`     | `string`              |
`top`     | `number` (percentage) | `50`
`left`    | `number` (percentage) | `50`
`width`   | `number` (percentage) | `10`
`height`  | `number` (percentage) | `10`

## Custom Styles

`qrcode.react` will pass through any additional props to the underlying DOM node (`<svg>` or `<canvas>`). This allows the use of inline `style` or custom `className` to customize the rendering. One common use would be to support a responsive layout.

**Note:** In order to render QR Codes in `<canvas>` on high density displays, we scale the canvas element to contain an appropriate number of pixels and then use inline styles to scale back down. We will merge any additional styles, with custom `height` and `width` overriding our own values. This allows scaling to percentages *but* if scaling beyond the `size`, you will encounter blurry images. I recommend detecting resizes with something like [react-measure](https://github.com/souporserious/react-measure) to detect and pass the appropriate size when rendering to `<canvas>`.

<img src="qrcode.png" height="256" width="256">

## Download (or Export) as File

You need to set `ref={ref => this.qrcode = ref}` to get the component reference first, then call:

```javascript
this.qrcode.download('QR Code.png');
```

related methods:

* `genCanvas(overwritingProps): Promise<HTMLCanvasElement>`
* `genCanvasDataURL(type, overwritingProps): Promise<string>`
* `download(filename, type, overwritingProps)`

## LICENSE [ISC](LICENSE)
