# qrcode.react

A React component to generate [QR codes](http://en.wikipedia.org/wiki/QR_code).

Works with React v15+

## Installation

```sh
npm install qrcode.react.v15
```

## Usage

```js
var React = require('react');
var QRCode = require('qrcode.react.v15');

React.render(
  <QRCode value="http://facebook.github.io/react/" />,
  mountNode
);
```

## Available Props

prop      | type                 | default value
----------|----------------------|--------------
`value`   | `string`             |
`size`    | `number`             | `128`
`bgColor` | `string` (CSS color) | `"#FFFFFF"`
`fgColor` | `string` (CSS color) | `"#000000"`
`level`   | `string` (`'L' 'M' 'Q' 'H'`)            | `'L'`

<img src="qrcode.png" height="256" width="256">
