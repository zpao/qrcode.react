/** @jsx React.DOM */

var React = require('react');
var qr = require('qr.js');

var QRCode = React.createClass({displayName: 'QRCode',
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

  componentDidMount: function() {
    this.update();
  },

  componentDidUpdate: function() {
    this.update();
  },

  update: function() {
    var qrcode = qr(this.props.value);
    var canvas = this.refs.canvas.getDOMNode();

    var ctx = canvas.getContext('2d');
    var cells = qrcode.modules;
    var tileW = this.props.size / cells.length;
    var tileH = this.props.size / cells.length;

    cells.forEach(function(row, rdx) {
      row.forEach(function(cell, cdx) {
        ctx.fillStyle = cell ? this.props.fgColor : this.props.bgColor;
        var w = (Math.ceil((cdx + 1) * tileW) - Math.floor(cdx * tileW));
        var h = (Math.ceil((rdx + 1) * tileH) - Math.floor(rdx * tileH));
        ctx.fillRect(Math.round(cdx * tileW), Math.round(rdx * tileH), w, h);
      }, this);
    }, this);
  },

  render: function() {
    return (
      React.createElement("canvas", {
        height: this.props.size, 
        width: this.props.size, 
        ref: "canvas"}
      )
    );
  }
});

module.exports = QRCode;
