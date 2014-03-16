# QRCode.react

A React component to generate [QR codes](http://en.wikipedia.org/wiki/QR_code).

```js
/** @jsx React.DOM */

var React = require('react');
var QRCode = require('QRCode.react');

React.renderComponent(
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

