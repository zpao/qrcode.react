'use strict';

var QRCode = require('..');
var React = require('react');
var ReactDOM = require('react-dom');

// TODO: live update demo
var Demo = React.createClass({
  getInitialState: function() {
    return {
      value: 'http://picturesofpeoplescanningqrcodes.tumblr.com/',
      size: 128,
      fgColor: '#000000',
      bgColor: '#ffffff',
    }
  },

  update: function() {
    this.setState({
      value: this.refs.value.value || '',
      size: parseInt(this.refs.size.value) || 0,
      bgColor: this.refs.bgColor.value,
      fgColor: this.refs.fgColor.value,
    });
  },

  render: function() {
    var code = `<QRCode
  value={"${this.state.value}"}
  size={${this.state.size}}
  bgColor={"${this.state.bgColor}"}
  fgColor={"${this.state.fgColor}"}
/>`;
    return (
      <div>
        <div>
          <label>
            Size(px):
            <br/>
            <input
              ref="size"
              type="number"
              onChange={this.update}
              value={this.state.size}
            />
          </label>
        </div>
        <div>
          <label>
            Background Color:
            <br/>
            <input
              ref="bgColor"
              type="color"
              onChange={this.update}
              value={this.state.bgColor}
            />
          </label>
        </div>
        <div>
          <label>
            Foreground Color:
            <br/>
            <input
              ref="fgColor"
              type="color"
              onChange={this.update}
              value={this.state.fgColor}
            />
          </label>
        </div>
        <div>
          <label>
            Value:
            <br/>
            <textarea
              rows="6"
              cols="80"
              ref="value"
              onChange={this.update}
              value={this.state.value}
            />
          </label>
        </div>

        <div>
          <label>
            Use it:
            <br/>
            <textarea rows="6" cols="80" disabled={true} value={code} />
          </label>
        </div>

        <QRCode
          value={this.state.value}
          size={this.state.size}
          fgColor={this.state.fgColor}
          bgColor={this.state.bgColor}
        />
      </div>
    );
  },
});

ReactDOM.render(
  <Demo />,
  document.getElementById('demo')
);
