'use strict';

import QRCode from '..';
import React from 'react';
import ReactDOM from 'react-dom';

// TODO: live update demo
class Demo extends React.Component {
  state = {
    value: 'http://picturesofpeoplescanningqrcodes.tumblr.com/',
    size: 128,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'L',
    renderAs: 'svg',
    includeMargin: false,
    includeImage: true,
    imageH: 24,
    imageW: 24,
    imageX: 0,
    imageY: 0,
    imageSrc: 'https://static.zpao.com/favicon.png',
    imageExcavate: true,
    centerImage: true,
  };

  render() {
    const imageSettingsCode = this.state.includeImage
      ? `
  imageSettings={{
    src: "${this.state.imageSrc}",
    x: ${this.state.centerImage ? 'null' : this.state.imageX},
    y: ${this.state.centerImage ? 'null' : this.state.imageY},
    height: ${this.state.imageH},
    width: ${this.state.imageW},
    excavate: ${this.state.imageExcavate},
  }}`
      : '';
    const code = `<QRCode
  value={"${this.state.value}"}
  size={${this.state.size}}
  bgColor={"${this.state.bgColor}"}
  fgColor={"${this.state.fgColor}"}
  level={"${this.state.level}"}
  includeMargin={${this.state.includeMargin}}
  renderAs={"${this.state.renderAs}"}${imageSettingsCode}
/>`;
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
            Value:
            <br />
            <textarea
              rows={6}
              cols={80}
              onChange={(e) => this.setState({value: e.target.value})}
              value={this.state.value}
            />
          </label>
        </div>

        <div>
          <label>
            Include Image:
            <br />
            <input
              type="checkbox"
              checked={this.state.includeImage}
              onChange={(e) => this.setState({includeImage: e.target.checked})}
            />
          </label>
        </div>

        <fieldset disabled={!this.state.includeImage}>
          <legend>Image Settings</legend>

          <div>
            <label>
              Source:
              <br />
              <input
                type="text"
                onChange={(e) => this.setState({imageSrc: e.target.value})}
                value={this.state.imageSrc}
              />
            </label>
          </div>
          <div>
            <label>
              Image Width: {this.state.imageW}
              <br />
              <input
                type="number"
                value={this.state.imageW}
                onChange={(e) =>
                  this.setState({imageW: parseInt(e.target.value, 10)})
                }
              />
            </label>
          </div>
          <div>
            <label>
              Image Height: {this.state.imageH}
              <br />
              <input
                type="number"
                value={this.state.imageH}
                onChange={(e) =>
                  this.setState({imageH: parseInt(e.target.value, 10)})
                }
              />
            </label>
          </div>

          <div>
            <label>
              Center Image:
              <br />
              <input
                type="checkbox"
                checked={this.state.centerImage}
                onChange={(e) => this.setState({centerImage: e.target.checked})}
              />
            </label>
          </div>
          <fieldset disabled={this.state.centerImage}>
            <legend>Image Settings</legend>
            <div>
              <label>
                Image X: {this.state.imageX}
                <br />
                <input
                  type="range"
                  min={0}
                  max={this.state.size - this.state.imageW}
                  value={this.state.imageX}
                  onChange={(e) =>
                    this.setState({imageX: parseInt(e.target.value, 10)})
                  }
                />
              </label>
            </div>
            <div>
              <label>
                Image Y: {this.state.imageY}
                <br />
                <input
                  type="range"
                  min={0}
                  max={this.state.size - this.state.imageH}
                  value={this.state.imageY}
                  onChange={(e) =>
                    this.setState({imageY: parseInt(e.target.value, 10)})
                  }
                />
              </label>
            </div>
          </fieldset>
          <div>
            <label>
              Excavate ("dig" foreground to nearest whole module):
              <br />
              <input
                type="checkbox"
                checked={this.state.imageExcavate}
                onChange={(e) =>
                  this.setState({imageExcavate: e.target.checked})
                }
              />
            </label>
          </div>
        </fieldset>

        <div>
          <label>
            Use it:
            <br />
            <textarea
              rows={code.split('\n').length}
              cols={80}
              readOnly={true}
              value={code}
            />
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
          imageSettings={
            this.state.includeImage
              ? {
                  src: this.state.imageSrc,
                  height: this.state.imageH,
                  width: this.state.imageW,
                  x: this.state.centerImage ? null : this.state.imageX,
                  y: this.state.centerImage ? null : this.state.imageY,
                  excavate: this.state.imageExcavate,
                }
              : null
          }
        />
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('demo'));
