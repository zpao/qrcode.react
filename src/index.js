var React = require('react');
var qr = require('qr.js');

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

var QRCode = React.createClass({
  propTypes: {
    value: React.PropTypes.string.isRequired,
    size: React.PropTypes.number,
    bgColor: React.PropTypes.string,
    fgColor: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      size: 128,
      bgColor: '#FFFFFF',
      fgColor: '#000000'
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
    var {value, size, bgColor, fgColor} = this.props;
    var qrcode = qr(value);
    var canvas = this.refs.canvas.getDOMNode();

    var ctx = canvas.getContext('2d');
    var cells = qrcode.modules;
    var tileW = size / cells.length;
    var tileH = size / cells.length;
    var scale = window.devicePixelRatio / getBackingStorePixelRatio(ctx);
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
  }
});

module.exports = QRCode;
