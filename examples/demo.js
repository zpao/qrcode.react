/** @jsx React.DOM */

var QRCode = require('../index');
var React = require('react');

// TODO: live update demo
var Demo = React.createClass({displayName: 'Demo',
  getInitialState: function() {
    return {
      value: 'http://picturesofpeoplescanningqrcodes.tumblr.com/',
      size: 128,
      fgColor: '#000000',
      bgColor: '#ffffff'
    }
  },

  update: function() {
    this.setState({
      value: this.refs.value.getDOMNode().value || '',
      size: parseInt(this.refs.size.getDOMNode().value) || 0,
      bgColor: this.refs.bgColor.getDOMNode().value,
      fgColor: this.refs.fgColor.getDOMNode().value
    });
  },

  render: function() {
    var code = ("\n<QRCode\n  value={\"" + 

this.state.value + "\"}\n  size={" + 
this.state.size + "}\n  bgColor={\"" + 
this.state.bgColor + "\"}\n  fgColor={\"" + 
this.state.fgColor + "\"}\n/>\n"

);
    return (
      React.createElement("div", null, 
        React.createElement("div", null, 
          React.createElement("label", null, 
            "Size(px):", 
            React.createElement("br", null), 
            React.createElement("input", {
              ref: "size", 
              type: "number", 
              onChange: this.update, 
              value: this.state.size}
            )
          )
        ), 
        React.createElement("div", null, 
          React.createElement("label", null, 
            "Background Color:", 
            React.createElement("br", null), 
            React.createElement("input", {
              ref: "bgColor", 
              type: "color", 
              onChange: this.update, 
              value: this.state.bgColor}
            )
          )
        ), 
        React.createElement("div", null, 
          React.createElement("label", null, 
            "Foreground Color:", 
            React.createElement("br", null), 
            React.createElement("input", {
              ref: "fgColor", 
              type: "color", 
              onChange: this.update, 
              value: this.state.fgColor}
            )
          )
        ), 
        React.createElement("div", null, 
          React.createElement("label", null, 
            "Value:", 
            React.createElement("br", null), 
            React.createElement("textarea", {
              rows: "6", 
              cols: "80", 
              ref: "value", 
              onChange: this.update, 
              value: this.state.value}
            )
          )
        ), 

        React.createElement("div", null, 
          React.createElement("label", null, 
            "Use it:", 
            React.createElement("br", null), 
            React.createElement("textarea", {rows: "6", cols: "80", disabled: true, value: code})
          )
        ), 

        React.createElement(QRCode, {
          value: this.state.value, 
          size: this.state.size, 
          fgColor: this.state.fgColor, 
          bgColor: this.state.bgColor}
        )
      )
    );
  }
});

React.renderComponent(
  React.createElement(Demo, null),
  document.getElementById('demo')
);
