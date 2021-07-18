# @raynorlin/qrcode-react
> This project is fork from [qrcode.react](https://github.com/zpao/qrcode.react)

A React component to generate [QR codes](http://en.wikipedia.org/wiki/QR_code).

## Features

* Support forwardRef
* Support download SVG and PNG file
* Remove componentWillReceiveProps
* Refactor componentWillReceiveProps with componentDidUpdate

## Installation

```sh
npm install @raynorlin/qrcode-react
```

## Usage

```js
import React from 'react';
import QRCode = from '@raynorlin/qrcode-react';

React.render(
  <QRCode value="http://facebook.github.io/react/" />,
  mountNode
);
```

## API
### downloadSvg

```js
downloadSvg(filename)
```

If you using `renderAs='svg'`, you can pass ref and use `downloadSvg`

```jsx
const Test = () => {
  const ref = useRef(null);

  const clickDownload = () => {
    const filename = 'QRCode.svg';
    ref.current.downloadSvg(filename);

    // then will download a SVG file
  }

  return (
    <div>
      <QRCode
        ref={ref}
        value="https://www.google.com"
        renderAs="svg"
      />
      <button onClick={clickDownload}>Download SVG</button>
    </div>
  );
}
```

### downloadPng

```js
downloadPng(filename)
```

If you using `renderAs='canvas'`, you can pass ref and use `downloadPng`

> Note: This function cannot use with passing imageSettings, will have some error with convert canvas to dataUrl.

```jsx
const Test = () => {
  const ref = useRef(null);

  const clickDownload = () => {
    const filename = 'QRCode.png';
    ref.current.downloadPng(filename);

    // then will download a PNG file
  }

  return (
    <div>
      <QRCode
        ref={ref}
        value="https://www.google.com"
        renderAs="canvas"
      />
      <button onClick={clickDownload}>Download PNG</button>
    </div>
  );
}
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
`imageSettings` | `object` (see below) |

### `imageSettings`

field      | type                 | default value
-----------|----------------------|--------------
`src`      | `string`             |
`x`        | `number`             | none, will center
`y`        | `number`             | none, will center
`height`   | `number`             | 10% of `size`
`width`    | `number`             | 10% of `size`
`excavate` | `boolean`            | `false`

## Custom Styles

`qrcode.react` will pass through any additional props to the underlying DOM node (`<svg>` or `<canvas>`). This allows the use of inline `style` or custom `className` to customize the rendering. One common use would be to support a responsive layout.

**Note:** In order to render QR Codes in `<canvas>` on high density displays, we scale the canvas element to contain an appropriate number of pixels and then use inline styles to scale back down. We will merge any additional styles, with custom `height` and `width` overriding our own values. This allows scaling to percentages *but* if scaling beyond the `size`, you will encounter blurry images. I recommend detecting resizes with something like [react-measure](https://github.com/souporserious/react-measure) to detect and pass the appropriate size when rendering to `<canvas>`.

<img src="qrcode.png" height="256" width="256">


## LICENSE [ISC](LICENSE)
