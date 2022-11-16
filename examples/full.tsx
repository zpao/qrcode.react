import {QRCodeSVG, QRCodeCanvas} from '..';
import React, {useState} from 'react';

function FullDemo() {
  const [value, setValue] = useState(
    'https://picturesofpeoplescanningqrcodes.tumblr.com/'
  );
  const [size, setSize] = useState(128);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [level, setLevel] = useState('L');
  const [marginSize, setMarginSize] = useState(0);
  const [includeImage, setIncludeImage] = useState(true);
  const [imageH, setImageH] = useState(24);
  const [imageW, setImageW] = useState(24);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [imageSrc, setImageSrc] = useState(
    'https://static.zpao.com/favicon.png'
  );
  const [imageExcavate, setImageExcavate] = useState(true);
  const [centerImage, setCenterImage] = useState(true);

  function makeExampleCode(componentName: string) {
    const imageSettingsCode = includeImage
      ? `
  imageSettings={{
    src: "${imageSrc}",
    x: ${centerImage ? 'undefined' : imageX},
    y: ${centerImage ? 'undefined' : imageY},
    height: ${imageH},
    width: ${imageW},
    excavate: ${imageExcavate},
  }}`
      : '';
    return `import {${componentName}} from 'qrcode.react';
<${componentName}
  value={"${value}"}
  size={${size}}
  bgColor={"${bgColor}"}
  fgColor={"${fgColor}"}
  level={"${level}"}
  marginSize={${marginSize}}${imageSettingsCode}
/>`;
  }
  const svgCode = makeExampleCode('QRCodeSVG');
  const canvasCode = makeExampleCode('QRCodeCanvas');

  const renderProps = {
    value,
    size,
    fgColor,
    bgColor,
    level,
    marginSize,
    imageSettings: includeImage
      ? {
          src: imageSrc,
          height: imageH,
          width: imageW,
          x: centerImage ? undefined : imageX,
          y: centerImage ? undefined : imageY,
          excavate: imageExcavate,
        }
      : undefined,
  };

  return (
    <div className="container">
      <div className="form">
        <div>
          <label>
            Size(px):
            <br />
            <input
              type="number"
              onChange={(e) => setSize(parseInt(e.target.value, 10) || 0)}
              value={size}
            />
          </label>
        </div>
        <div>
          <label>
            Background Color:
            <br />
            <input
              type="color"
              onChange={(e) => setBgColor(e.target.value)}
              value={bgColor}
            />
          </label>
        </div>
        <div>
          <label>
            Foreground Color:
            <br />
            <input
              type="color"
              onChange={(e) => setFgColor(e.target.value)}
              value={fgColor}
            />
          </label>
        </div>
        <div>
          <label>
            Error Level:
            <br />
            <select onChange={(e) => setLevel(e.target.value)} value={level}>
              <option value="L">L</option>
              <option value="M">M</option>
              <option value="Q">Q</option>
              <option value="H">H</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Margin Size:
            <br />
            <input
              type="number"
              step={1}
              value={marginSize}
              onChange={(e) =>
                setMarginSize(Math.floor(e.target.valueAsNumber))
              }
            />
          </label>
        </div>
        <div>
          <label>
            Value:
            <br />
            <textarea
              rows={6}
              cols={80}
              onChange={(e) => setValue(e.target.value)}
              value={value}
            />
          </label>
        </div>

        <div>
          <label>
            Include Image:
            <br />
            <input
              type="checkbox"
              checked={includeImage}
              onChange={(e) => setIncludeImage(e.target.checked)}
            />
          </label>
        </div>

        <fieldset disabled={!includeImage}>
          <legend>Image Settings</legend>

          <div>
            <label>
              Source:
              <br />
              <input
                type="text"
                onChange={(e) => setImageSrc(e.target.value)}
                value={imageSrc}
              />
            </label>
          </div>
          <div>
            <label>
              Image Width: {imageW}
              <br />
              <input
                type="number"
                value={imageW}
                onChange={(e) => setImageW(parseInt(e.target.value, 10))}
              />
            </label>
          </div>
          <div>
            <label>
              Image Height: {imageH}
              <br />
              <input
                type="number"
                value={imageH}
                onChange={(e) => setImageH(parseInt(e.target.value, 10))}
              />
            </label>
          </div>

          <div>
            <label>
              Center Image:
              <br />
              <input
                type="checkbox"
                checked={centerImage}
                onChange={(e) => setCenterImage(e.target.checked)}
              />
            </label>
          </div>
          <fieldset disabled={centerImage}>
            <legend>Image Settings</legend>
            <div>
              <label>
                Image X: {imageX}
                <br />
                <input
                  type="range"
                  min={0}
                  max={size - imageW}
                  value={imageX}
                  onChange={(e) => setImageX(parseInt(e.target.value, 10))}
                />
              </label>
            </div>
            <div>
              <label>
                Image Y: {imageY}
                <br />
                <input
                  type="range"
                  min={0}
                  max={size - imageH}
                  value={imageY}
                  onChange={(e) => setImageY(parseInt(e.target.value, 10))}
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
                checked={imageExcavate}
                onChange={(e) => setImageExcavate(e.target.checked)}
              />
            </label>
          </div>
        </fieldset>
      </div>

      <div className="output">
        <div>
          <h2>
            <pre>QRCodeSVG</pre>
          </h2>
          <div>
            <textarea
              rows={svgCode.split('\n').length}
              cols={80}
              readOnly={true}
              value={svgCode}
            />
          </div>

          <QRCodeSVG {...renderProps} />
        </div>

        <div>
          <h2>
            <pre>QRCodeCanvas</pre>
          </h2>
          <div>
            <textarea
              rows={canvasCode.split('\n').length}
              cols={80}
              readOnly={true}
              value={canvasCode}
            />
          </div>

          <QRCodeCanvas {...renderProps} />
        </div>
      </div>
    </div>
  );
}

export {FullDemo};
