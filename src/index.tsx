/**
 * @license qrcode.react
 * Copyright (c) Paul O'Shannessy
 * SPDX-License-Identifier: ISC
 */

import React from 'react';
import qrcodegen from './third-party/qrcodegen';

type Modules = ReturnType<qrcodegen.QrCode['getModules']>;
type Excavation = {x: number; y: number; w: number; h: number};
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type CrossOrigin = 'anonymous' | 'use-credentials' | '' | undefined;

type ERROR_LEVEL_MAPPED_TYPE = {
  [index in ErrorCorrectionLevel]: qrcodegen.QrCode.Ecc;
};

const ERROR_LEVEL_MAP: ERROR_LEVEL_MAPPED_TYPE = {
  L: qrcodegen.QrCode.Ecc.LOW,
  M: qrcodegen.QrCode.Ecc.MEDIUM,
  Q: qrcodegen.QrCode.Ecc.QUARTILE,
  H: qrcodegen.QrCode.Ecc.HIGH,
} as const;

type ImageSettings = {
  /**
   * The URI of the embedded image.
   */
  src: string;
  /**
   * The height, in pixels, of the image.
   */
  height: number;
  /**
   * The width, in pixels, of the image.
   */
  width: number;
  /**
   * Whether or not to "excavate" the modules around the embedded image. This
   * means that any modules the embedded image overlaps will use the background
   * color.
   */
  excavate: boolean;
  /**
   * The horiztonal offset of the embedded image, starting from the top left corner.
   * Will center if not specified.
   */
  x?: number;
  /**
   * The vertical offset of the embedded image, starting from the top left corner.
   * Will center if not specified.
   */
  y?: number;
  /**
   * The opacity of the embedded image in the range of 0-1.
   * @defaultValue 1
   */
  opacity?: number;
  /**
   * The cross-origin value to use when loading the image. This is used to
   * ensure compatibility with CORS, particularly when extracting image data
   * from QRCodeCanvas.
   * Note: `undefined` is treated differently than the seemingly equivalent
   * empty string. This is intended to align with HTML behavior where omitting
   * the attribute behaves differently than the empty string.
   */
  crossOrigin?: CrossOrigin;
};

type QRProps = {
  /**
   * The value to encode into the QR Code. An array of strings can be passed in
   * to represent multiple segments to further optimize the QR Code.
   */
  value: string | string[];
  /**
   * The size, in pixels, to render the QR Code.
   * @defaultValue 128
   */
  size?: number;
  /**
   * The Error Correction Level to use.
   * @see https://www.qrcode.com/en/about/error_correction.html
   * @defaultValue L
   */
  level?: ErrorCorrectionLevel;
  /**
   * The background color used to render the QR Code.
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
   * @defaultValue #FFFFFF
   */
  bgColor?: string;
  /**
   * The foreground color used to render the QR Code.
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
   * @defaultValue #000000
   */
  fgColor?: string;
  /**
   * Whether or not a margin of 4 modules should be rendered as a part of the
   * QR Code.
   * @deprecated Use `marginSize` instead.
   * @defaultValue false
   */
  includeMargin?: boolean;
  /**
   * The number of _modules_ to use for margin. The QR Code specification
   * requires `4`, however you can specify any number. Values will be turned to
   * integers with `Math.floor`. Overrides `includeMargin` when both are specified.
   * @defaultValue 0
   */
  marginSize?: number;
  /**
   * The title to assign to the QR Code. Used for accessibility reasons.
   */
  title?: string;
  /**
   * The minimum version used when encoding the QR Code. Valid values are 1-40
   * with higher values resulting in more complex QR Codes. The optimal
   * (lowest) version is determined for the `value` provided, using `minVersion`
   * as the lower bound.
   * @defaultValue 1
   */
  minVersion?: number;
  /**
   * If enabled, the Error Correction Level of the result may be higher than
   * the specified Error Correction Level option if it can be done without
   * increasing the version.
   * @defaultValue true
   */
  boostLevel?: boolean;
  /**
   * The settings for the embedded image.
   */
  imageSettings?: ImageSettings;
};
type QRPropsCanvas = QRProps & React.CanvasHTMLAttributes<HTMLCanvasElement>;
type QRPropsSVG = QRProps & React.SVGAttributes<SVGSVGElement>;

const DEFAULT_SIZE = 128;
const DEFAULT_LEVEL: ErrorCorrectionLevel = 'L';
const DEFAULT_BGCOLOR = '#FFFFFF';
const DEFAULT_FGCOLOR = '#000000';
const DEFAULT_INCLUDEMARGIN = false;
const DEFAULT_MINVERSION = 1;

const SPEC_MARGIN_SIZE = 4;
const DEFAULT_MARGIN_SIZE = 0;

// This is *very* rough estimate of max amount of QRCode allowed to be covered.
// It is "wrong" in a lot of ways (area is a terrible way to estimate, it
// really should be number of modules covered), but if for some reason we don't
// get an explicit height or width, I'd rather default to something than throw.
const DEFAULT_IMG_SCALE = 0.1;

function generatePath(modules: Modules, margin: number = 0): string {
  const ops: Array<string> = [];
  modules.forEach(function (row, y) {
    let start: number | null = null;
    row.forEach(function (cell, x) {
      if (!cell && start !== null) {
        // M0 0h7v1H0z injects the space with the move and drops the comma,
        // saving a char per operation
        ops.push(
          `M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`
        );
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
          ops.push(`M${x + margin},${y + margin} h1v1H${x + margin}z`);
        } else {
          // Otherwise finish the current line.
          ops.push(
            `M${start + margin},${y + margin} h${x + 1 - start}v1H${
              start + margin
            }z`
          );
        }
        return;
      }

      if (cell && start === null) {
        start = x;
      }
    });
  });
  return ops.join('');
}

// We could just do this in generatePath, except that we want to support
// non-Path2D canvas, so we need to keep it an explicit step.
function excavateModules(modules: Modules, excavation: Excavation): Modules {
  return modules.slice().map((row, y) => {
    if (y < excavation.y || y >= excavation.y + excavation.h) {
      return row;
    }
    return row.map((cell, x) => {
      if (x < excavation.x || x >= excavation.x + excavation.w) {
        return cell;
      }
      return false;
    });
  });
}

function getImageSettings(
  cells: Modules,
  size: number,
  margin: number,
  imageSettings?: ImageSettings
): null | {
  x: number;
  y: number;
  h: number;
  w: number;
  excavation: Excavation | null;
  opacity: number;
  crossOrigin: CrossOrigin;
} {
  if (imageSettings == null) {
    return null;
  }
  const numCells = cells.length + margin * 2;
  const defaultSize = Math.floor(size * DEFAULT_IMG_SCALE);
  const scale = numCells / size;
  const w = (imageSettings.width || defaultSize) * scale;
  const h = (imageSettings.height || defaultSize) * scale;
  const x =
    imageSettings.x == null
      ? cells.length / 2 - w / 2
      : imageSettings.x * scale;
  const y =
    imageSettings.y == null
      ? cells.length / 2 - h / 2
      : imageSettings.y * scale;
  const opacity = imageSettings.opacity == null ? 1 : imageSettings.opacity;

  let excavation = null;
  if (imageSettings.excavate) {
    let floorX = Math.floor(x);
    let floorY = Math.floor(y);
    let ceilW = Math.ceil(w + x - floorX);
    let ceilH = Math.ceil(h + y - floorY);
    excavation = {x: floorX, y: floorY, w: ceilW, h: ceilH};
  }

  const crossOrigin = imageSettings.crossOrigin;

  return {x, y, h, w, excavation, opacity, crossOrigin};
}

function getMarginSize(includeMargin: boolean, marginSize?: number): number {
  if (marginSize != null) {
    return Math.max(Math.floor(marginSize), 0);
  }
  return includeMargin ? SPEC_MARGIN_SIZE : DEFAULT_MARGIN_SIZE;
}

function useQRCode({
  value,
  level,
  minVersion,
  includeMargin,
  marginSize,
  imageSettings,
  size,
  boostLevel,
}: {
  value: string | string[];
  level: ErrorCorrectionLevel;
  minVersion: number;
  includeMargin: boolean;
  marginSize?: number;
  imageSettings?: ImageSettings;
  size: number;
  boostLevel?: boolean;
}) {
  let qrcode = React.useMemo(() => {
    const values = Array.isArray(value) ? value : [value];
    const segments = values.reduce<qrcodegen.QrSegment[]>((accum, v) => {
      accum.push(...qrcodegen.QrSegment.makeSegments(v));
      return accum;
    }, []);
    return qrcodegen.QrCode.encodeSegments(
      segments,
      ERROR_LEVEL_MAP[level],
      minVersion,
      undefined,
      undefined,
      boostLevel
    );
  }, [value, level, minVersion, boostLevel]);

  const {cells, margin, numCells, calculatedImageSettings} =
    React.useMemo(() => {
      let cells = qrcode.getModules();

      const margin = getMarginSize(includeMargin, marginSize);
      const numCells = cells.length + margin * 2;
      const calculatedImageSettings = getImageSettings(
        cells,
        size,
        margin,
        imageSettings
      );
      return {
        cells,
        margin,
        numCells,
        calculatedImageSettings,
      };
    }, [qrcode, size, imageSettings, includeMargin, marginSize]);

  return {
    qrcode,
    margin,
    cells,
    numCells,
    calculatedImageSettings,
  };
}

// For canvas we're going to switch our drawing mode based on whether or not
// the environment supports Path2D. We only need the constructor to be
// supported, but Edge doesn't actually support the path (string) type
// argument. Luckily it also doesn't support the addPath() method. We can
// treat that as the same thing.
const SUPPORTS_PATH2D = (function () {
  try {
    new Path2D().addPath(new Path2D());
  } catch (e) {
    return false;
  }
  return true;
})();

const QRCodeCanvas = React.forwardRef<HTMLCanvasElement, QRPropsCanvas>(
  function QRCodeCanvas(props, forwardedRef) {
    const {
      value,
      size = DEFAULT_SIZE,
      level = DEFAULT_LEVEL,
      bgColor = DEFAULT_BGCOLOR,
      fgColor = DEFAULT_FGCOLOR,
      includeMargin = DEFAULT_INCLUDEMARGIN,
      minVersion = DEFAULT_MINVERSION,
      boostLevel,
      marginSize,
      imageSettings,
      ...extraProps
    } = props;
    const {style, ...otherProps} = extraProps;
    const imgSrc = imageSettings?.src;
    const _canvas = React.useRef<HTMLCanvasElement | null>(null);
    const _image = React.useRef<HTMLImageElement>(null);

    // Set the local ref (_canvas) and also the forwarded ref from outside
    const setCanvasRef = React.useCallback(
      (node: HTMLCanvasElement | null) => {
        _canvas.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef]
    );

    // We're just using this state to trigger rerenders when images load. We
    // Don't actually read the value anywhere. A smarter use of React.useEffect would
    // depend on this value.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isImgLoaded, setIsImageLoaded] = React.useState(false);

    const {margin, cells, numCells, calculatedImageSettings} = useQRCode({
      value,
      level,
      minVersion,
      boostLevel,
      includeMargin,
      marginSize,
      imageSettings,
      size,
    });

    React.useEffect(() => {
      // Always update the canvas. It's cheap enough and we want to be correct
      // with the current state.
      if (_canvas.current != null) {
        const canvas = _canvas.current;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return;
        }

        let cellsToDraw = cells;
        const image = _image.current;
        const haveImageToRender =
          calculatedImageSettings != null &&
          image !== null &&
          image.complete &&
          image.naturalHeight !== 0 &&
          image.naturalWidth !== 0;

        if (haveImageToRender) {
          if (calculatedImageSettings.excavation != null) {
            cellsToDraw = excavateModules(
              cells,
              calculatedImageSettings.excavation
            );
          }
        }

        // We're going to scale this so that the number of drawable units
        // matches the number of cells. This avoids rounding issues, but does
        // result in some potentially unwanted single pixel issues between
        // blocks, only in environments that don't support Path2D.
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.height = canvas.width = size * pixelRatio;
        const scale = (size / numCells) * pixelRatio;
        ctx.scale(scale, scale);

        // Draw solid background, only paint dark modules.
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, numCells, numCells);

        ctx.fillStyle = fgColor;
        if (SUPPORTS_PATH2D) {
          // $FlowFixMe: Path2D c'tor doesn't support args yet.
          ctx.fill(new Path2D(generatePath(cellsToDraw, margin)));
        } else {
          cells.forEach(function (row, rdx) {
            row.forEach(function (cell, cdx) {
              if (cell) {
                ctx.fillRect(cdx + margin, rdx + margin, 1, 1);
              }
            });
          });
        }

        if (calculatedImageSettings) {
          ctx.globalAlpha = calculatedImageSettings.opacity;
        }

        if (haveImageToRender) {
          ctx.drawImage(
            image,
            calculatedImageSettings.x + margin,
            calculatedImageSettings.y + margin,
            calculatedImageSettings.w,
            calculatedImageSettings.h
          );
        }
      }
    });

    // Ensure we mark image loaded as false here so we trigger updating the
    // canvas in our other effect.
    React.useEffect(() => {
      setIsImageLoaded(false);
    }, [imgSrc]);

    const canvasStyle = {height: size, width: size, ...style};
    let img = null;
    if (imgSrc != null) {
      img = (
        <img
          src={imgSrc}
          key={imgSrc}
          style={{display: 'none'}}
          onLoad={() => {
            setIsImageLoaded(true);
          }}
          ref={_image}
          crossOrigin={calculatedImageSettings?.crossOrigin}
        />
      );
    }
    return (
      <>
        <canvas
          style={canvasStyle}
          height={size}
          width={size}
          ref={setCanvasRef}
          role="img"
          {...otherProps}
        />
        {img}
      </>
    );
  }
);
QRCodeCanvas.displayName = 'QRCodeCanvas';

const QRCodeSVG = React.forwardRef<SVGSVGElement, QRPropsSVG>(
  function QRCodeSVG(props, forwardedRef) {
    const {
      value,
      size = DEFAULT_SIZE,
      level = DEFAULT_LEVEL,
      bgColor = DEFAULT_BGCOLOR,
      fgColor = DEFAULT_FGCOLOR,
      includeMargin = DEFAULT_INCLUDEMARGIN,
      minVersion = DEFAULT_MINVERSION,
      boostLevel,
      title,
      marginSize,
      imageSettings,
      ...otherProps
    } = props;

    const {margin, cells, numCells, calculatedImageSettings} = useQRCode({
      value,
      level,
      minVersion,
      boostLevel,
      includeMargin,
      marginSize,
      imageSettings,
      size,
    });

    let cellsToDraw = cells;
    let image = null;
    if (imageSettings != null && calculatedImageSettings != null) {
      if (calculatedImageSettings.excavation != null) {
        cellsToDraw = excavateModules(
          cells,
          calculatedImageSettings.excavation
        );
      }

      image = (
        <image
          href={imageSettings.src}
          height={calculatedImageSettings.h}
          width={calculatedImageSettings.w}
          x={calculatedImageSettings.x + margin}
          y={calculatedImageSettings.y + margin}
          preserveAspectRatio="none"
          opacity={calculatedImageSettings.opacity}
          // Note: specified here always, but undefined will result in no attribute.
          crossOrigin={calculatedImageSettings.crossOrigin}
        />
      );
    }

    // Drawing strategy: instead of a rect per module, we're going to create a
    // single path for the dark modules and layer that on top of a light rect,
    // for a total of 2 DOM nodes. We pay a bit more in string concat but that's
    // way faster than DOM ops.
    // For level 1, 441 nodes -> 2
    // For level 40, 31329 -> 2
    const fgPath = generatePath(cellsToDraw, margin);

    return (
      <svg
        height={size}
        width={size}
        viewBox={`0 0 ${numCells} ${numCells}`}
        ref={forwardedRef}
        role="img"
        {...otherProps}>
        {!!title && <title>{title}</title>}
        <path
          fill={bgColor}
          d={`M0,0 h${numCells}v${numCells}H0z`}
          shapeRendering="crispEdges"
        />
        <path fill={fgColor} d={fgPath} shapeRendering="crispEdges" />
        {image}
      </svg>
    );
  }
);
QRCodeSVG.displayName = 'QRCodeSVG';

export {QRCodeCanvas, QRCodeSVG};
