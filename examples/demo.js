'use strict';

var QRCode = require('..');
var React = require('react');
var ReactDOM = require('react-dom');

class Demo extends React.Component {
  state = {
    value: 'http://picturesofpeoplescanningqrcodes.tumblr.com/',
    size: 128,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'L',
    renderAs: 'svg',
    includeMargin: false,
    withImg: false,
    img: {
      src: './logo.png',
      top: 50,
      left: 50,
      width: 10,
      height: 10,
    }
  };

  downloadQRCode = () => {
    this.qrcode.download('QR Code.png');
  }

  setImgState(state) {
    this.setState({img: {...this.state.img, ...state}});
  }

  render() {
    var imgCode = this.state.withImg ?
      `  img={${JSON.stringify(this.state.img)}}\n` : ''
    var code = `<QRCode
  value={"${this.state.value}"}
  size={${this.state.size}}
  bgColor={"${this.state.bgColor}"}
  fgColor={"${this.state.fgColor}"}
  level={"${this.state.level}"}
  includeMargin={${this.state.includeMargin}}
  renderAs={"${this.state.renderAs}"}
  ref={ref => this.qrcode = ref}
${imgCode}/>`
    return (
      <div>
        <div>
          <label>
            Size(px):
            <br />
            <input
              type="number"
              onChange={(e) =>
                this.setState({size: parseInt(e.target.value, 10) || 0})
              }
              value={this.state.size}
            />
          </label>
        </div>
        <div>
          <label>
            Background Color:
            <br />
            <input
              type="color"
              onChange={(e) => this.setState({bgColor: e.target.value})}
              value={this.state.bgColor}
            />
          </label>
        </div>
        <div>
          <label>
            Foreground Color:
            <br />
            <input
              type="color"
              onChange={(e) => this.setState({fgColor: e.target.value})}
              value={this.state.fgColor}
            />
          </label>
        </div>
        <div>
          <label>
            Error Level:
            <br />
            <select
              onChange={(e) => this.setState({level: e.target.value})}
              value={this.state.level}>
              <option value="L">L</option>
              <option value="M">M</option>
              <option value="Q">Q</option>
              <option value="H">H</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Include Margin:
            <br />
            <input
              type="checkbox"
              checked={this.state.includeMargin}
              onChange={(e) => this.setState({includeMargin: e.target.checked})}
            />
          </label>
        </div>
        <div>
          <label>
            Render As:
            <br />
            <select
              onChange={(e) => this.setState({renderAs: e.target.value})}
              value={this.state.renderAs}>
              <option value="svg">SVG</option>
              <option value="canvas">Canvas</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            With Img:
            <br />
            <input
              type="checkbox"
              checked={this.state.withImg}
              onChange={(e) => this.setState({withImg: e.target.checked})}
            />
          </label>
        </div>
        <div style={this.state.withImg ? {} : {display: 'none'}}>
          <div>
            <label>
              Img src:
              <br />
              <input
                onChange={(e) => this.setImgState({src: e.target.value})}
                value={this.state.img.src}
              />
            </label>
          </div>
          <div>
            <label>
              Img Coordinate:
            </label>
            <br />
            <div style={{marginLeft: '20px'}}>
              <label>top (percent):
                <input
                  type="number"
                  onChange={(e) =>
                    this.setImgState({top: parseInt(e.target.value, 10) || 50})
                  }
                  value={this.state.img.top}
                />
              </label>
              <label>, left (percent):
                <input
                  type="number"
                  onChange={(e) =>
                    this.setImgState({left: parseInt(e.target.value, 10) || 50})
                  }
                  value={this.state.img.left}
                />
              </label>
              <br />
              <label>width (percent):
                <input
                  type="number"
                  onChange={(e) =>
                    this.setImgState({width: parseInt(e.target.value, 10) || 10})
                  }
                  value={this.state.img.width}
                />
              </label>
              <label>height (percent):
                <input
                  type="number"
                  onChange={(e) =>
                    this.setImgState({height: parseInt(e.target.value, 10) || 10})
                  }
                  value={this.state.img.height}
                />
              </label>
            </div>
          </div>
        </div>
        <div>
          <label>
            Value:
            <br />
            <textarea
              rows="6"
              cols="80"
              onChange={(e) => this.setState({value: e.target.value})}
              value={this.state.value}
            />
          </label>
        </div>

        <div>
          <label>
            Use it:
            <br />
            <textarea rows="11" cols="80" disabled={true} value={code} />
          </label>
        </div>

        <QRCode
          value={this.state.value}
          size={this.state.size}
          fgColor={this.state.fgColor}
          bgColor={this.state.bgColor}
          level={this.state.level}
          renderAs={this.state.renderAs}
          includeMargin={this.state.includeMargin}
          {...(this.state.withImg ? {img: this.state.img} : {})}
          ref={ref => this.qrcode = ref}
        />

        <br />
        <button onClick={this.downloadQRCode} style={{fontFamily: 'monospace'}}>
          this.qrcode.download('QR Code.png');
        </button>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('demo'));
