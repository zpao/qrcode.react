// @flow

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
// qr.js doesn't handle error level of zero (M) so we need to do it right,
// thus the deep require.
const QRCodeImpl = require('qr.js/lib/QRCode');
const ErrorCorrectLevel = require('qr.js/lib/ErrorCorrectLevel');

function getBackingStorePixelRatio(ctx: CanvasRenderingContext2D): number {
  return (
    // $FlowFixMe
    ctx.webkitBackingStorePixelRatio ||
    // $FlowFixMe
    ctx.mozBackingStorePixelRatio ||
    // $FlowFixMe
    ctx.msBackingStorePixelRatio ||
    // $FlowFixMe
    ctx.oBackingStorePixelRatio ||
    // $FlowFixMe
    ctx.backingStorePixelRatio ||
    1
  );
}

// Convert from UTF-16, forcing the use of byte-mode encoding in our QR Code.
// This allows us to encode Hanji, Kanji, emoji, etc. Ideally we'd do more
// detection and not resort to byte-mode if possible, but we're trading off
// a smaller library for a smaller amount of data we can potentially encode.
// Based on http://jonisalonen.com/2012/from-utf-16-to-utf-8-in-javascript/
function convertStr(str: string): string {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x0080) {
      out += String.fromCharCode(charcode);
    } else if (charcode < 0x0800) {
      out += String.fromCharCode(0xc0 | (charcode >> 6));
      out += String.fromCharCode(0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      out += String.fromCharCode(0xe0 | (charcode >> 12));
      out += String.fromCharCode(0x80 | ((charcode >> 6) & 0x3f));
      out += String.fromCharCode(0x80 | (charcode & 0x3f));
    } else {
      // This is a surrogate pair, so we'll reconsitute the pieces and work
      // from that
      i++;
      charcode =
        0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      out += String.fromCharCode(0xf0 | (charcode >> 18));
      out += String.fromCharCode(0x80 | ((charcode >> 12) & 0x3f));
      out += String.fromCharCode(0x80 | ((charcode >> 6) & 0x3f));
      out += String.fromCharCode(0x80 | (charcode & 0x3f));
    }
  }
  return out;
}

type QRProps = {
  value: string,
  size: number,
  level: $Keys<typeof ErrorCorrectLevel>,
  bgColor: string,
  fgColor: string,
  style?: ?Object,
};

const DEFAULT_PROPS = {
  size: 128,
  level: 'L',
  bgColor: '#FFFFFF',
  fgColor: '#000000',
};

const PROP_TYPES = {
  value: PropTypes.string.isRequired,
  size: PropTypes.number,
  level: PropTypes.oneOf(['L', 'M', 'Q', 'H']),
  bgColor: PropTypes.string,
  fgColor: PropTypes.string,
};

class QRCodeCanvas extends React.Component<QRProps> {
  _canvas: ?HTMLCanvasElement;

  static defaultProps = DEFAULT_PROPS;
  static propTypes = PROP_TYPES;

  shouldComponentUpdate(nextProps: QRProps) {
    return Object.keys(QRCodeCanvas.propTypes).some(
      (k) => this.props[k] !== nextProps[k]
    );
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  update() {
    const {value, size, level, bgColor, fgColor} = this.props;

    // We'll use type===-1 to force QRCode to automatically pick the best type
    const qrcode = new QRCodeImpl(-1, ErrorCorrectLevel[level]);
    qrcode.addData(convertStr(value));
    qrcode.make();

    if (this._canvas != null) {
      const canvas = this._canvas;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      const cells = qrcode.modules;
      if (cells === null) {
        return;
      }
      const tileW = size / cells.length;
      const tileH = size / cells.length;
      const scale =
        (window.devicePixelRatio || 1) / getBackingStorePixelRatio(ctx);
      canvas.height = canvas.width = size * scale;
      ctx.scale(scale, scale);

      cells.forEach(function(row, rdx) {
        row.forEach(function(cell, cdx) {
          ctx && (ctx.fillStyle = cell ? fgColor : bgColor);
          const w = Math.ceil((cdx + 1) * tileW) - Math.floor(cdx * tileW);
          const h = Math.ceil((rdx + 1) * tileH) - Math.floor(rdx * tileH);
          ctx &&
            ctx.fillRect(
              Math.round(cdx * tileW),
              Math.round(rdx * tileH),
              w,
              h
            );
        });
      });
    }
  }

  render() {
    const {
      value,
      size,
      level,
      bgColor,
      fgColor,
      style,
      ...otherProps
    } = this.props;
    const canvasStyle = {height: size, width: size, ...style};
    return (
      <canvas
        style={canvasStyle}
        height={size}
        width={size}
        ref={(ref: ?HTMLCanvasElement): ?HTMLCanvasElement =>
          (this._canvas = ref)
        }
        {...otherProps}
      />
    );
  }
}

class QRCodeSVG extends React.Component<QRProps> {
  static defaultProps = DEFAULT_PROPS;
  static propTypes = PROP_TYPES;

  shouldComponentUpdate(nextProps: QRProps) {
    return Object.keys(QRCodeCanvas.propTypes).some(
      (k) => this.props[k] !== nextProps[k]
    );
  }

  render() {
    const {value, size, level, bgColor, fgColor, ...otherProps} = this.props;

    // We'll use type===-1 to force QRCode to automatically pick the best type
    const qrcode = new QRCodeImpl(-1, ErrorCorrectLevel[level]);
    qrcode.addData(convertStr(value));
    qrcode.make();

    const cells = qrcode.modules;
    if (cells === null) {
      return;
    }

    // Drawing strategy: instead of a rect per module, we're going to create a
    // single path for the dark modules and layer that on top of a light rect,
    // for a total of 2 DOM nodes. We pay a bit more in string concat but that's
    // way faster than DOM ops.
    // For level 1, 441 nodes -> 2
    // For level 40, 31329 -> 2
    const ops = [];
    cells.forEach(function(row, y) {
      let lastIsDark = false;
      let start = null;
      row.forEach(function(cell, x) {
        if (!cell && start !== null) {
          // M0 0h7v1H0z injects the space with the move and dropd the comma,
          // saving a char per operation
          ops.push(`M${start} ${y}h${x - start}v1H${start}z`);
          start = null;
          return;
        }

        // end of row, clean up or skip
        if (x === row.length - 1) {
          if (!cell) {
            // We would have closed the op above already so this can only mean
            // 2+ light modules in a row.
            return;
          }
          if (start === null) {
            // Just a single dark module.
            ops.push(`M${x},${y} h1v1H${x}z`);
          } else {
            // Otherwise finish the current line.
            ops.push(`M${start},${y} h${x + 1 - start}v1H${start}z`);
          }
          return;
        }

        if (cell && start === null) {
          start = x;
        }
      });
    });

    return (
      <svg
        shapeRendering="crispEdges"
        height={size}
        width={size}
        viewBox={`0 0 ${cells.length} ${cells.length}`}
        {...otherProps}>
        <path fill={bgColor} d={`M0,0 h${cells.length}v${cells.length}H0z`} />
        <path fill={fgColor} d={ops.join('')} />
      </svg>
    );
  }
}

type RootProps = QRProps & {renderAs: 'svg' | 'canvas'};
const QRCode = (props: RootProps): React.Node => {
  const {renderAs, ...otherProps} = props;
  const Component = renderAs === 'svg' ? QRCodeSVG : QRCodeCanvas;
  return <Component {...otherProps} />;
};

QRCode.defaultProps = {renderAs: 'canvas', ...DEFAULT_PROPS};

module.exports = QRCode;
