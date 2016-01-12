'use strict';

var React = require('react');
// qr.js doesn't handle error level of zero (M) so we need to do it right,
// thus the deep require.
var QRCodeImpl = require('qr.js/lib/QRCode');
var ErrorCorrectLevel = require('qr.js/lib/ErrorCorrectLevel');

function getBackingStorePixelRatio(ctx) {
  return (
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio ||
    1
  );
}

var getDOMNode;
if (/^0\.14/.test(React.version)) {
  getDOMNode = (ref) => ref;
} else {
  getDOMNode = (ref) => ref.getDOMNode();
}

var QRCode = React.createClass({
  propTypes: {
    value: React.PropTypes.string.isRequired,
    size: React.PropTypes.number,
    level: React.PropTypes.oneOf(['L', 'M', 'Q', 'H']),
    bgColor: React.PropTypes.string,
    fgColor: React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      size: 128,
      level: 'L',
      bgColor: '#FFFFFF',
      fgColor: '#000000',
    };
  },

  shouldComponentUpdate: function(nextProps) {
    return Object.keys(QRCode.propTypes).some((k) => this.props[k] !== nextProps[k]);
  },

  componentDidMount: function() {
    this.update();
  },

  componentDidUpdate: function() {
    this.update();
  },

  update: function() {
    var {value, size, level, bgColor, fgColor} = this.props;

    // We'll use type===-1 to force QRCode to automatically pick the best type
    var qrcode = new QRCodeImpl(-1, ErrorCorrectLevel[level]);
    qrcode.addData(value);
    qrcode.make();

    var canvas = getDOMNode(this.refs.canvas);

    var ctx = canvas.getContext('2d');
    var cells = qrcode.modules;
    var tileW = size / cells.length;
    var tileH = size / cells.length;
    var scale = (window.devicePixelRatio || 1) / getBackingStorePixelRatio(ctx);
    canvas.height = canvas.width = size * scale;
    ctx.scale(scale, scale);

    cells.forEach(function(row, rdx) {
      row.forEach(function(cell, cdx) {
        ctx.fillStyle = cell ? fgColor : bgColor;
        var w = (Math.ceil((cdx + 1) * tileW) - Math.floor(cdx * tileW));
        var h = (Math.ceil((rdx + 1) * tileH) - Math.floor(rdx * tileH));
        ctx.fillRect(Math.round(cdx * tileW), Math.round(rdx * tileH), w, h);
      });
    });
  },

  render: function() {
    return (
      <canvas
        style={{height: this.props.size, width: this.props.size}}
        height={this.props.size}
        width={this.props.size}
        ref="canvas"
      />
    );
  },
});

module.exports = QRCode;
