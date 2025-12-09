/**
 * @license qrcode.react
 * Copyright (c) Paul O'Shannessy
 * SPDX-License-Identifier: ISC
 */

import type { CSSProperties } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import qrcodegen from './third-party/qrcodegen';

type Modules = ReturnType<qrcodegen.QrCode['getModules']>;
type Excavation = {x: number; y: number; w: number; h: number};

const ERROR_LEVEL_MAP: {[index: string]: qrcodegen.QrCode.Ecc} = {
  L: qrcodegen.QrCode.Ecc.LOW,
  M: qrcodegen.QrCode.Ecc.MEDIUM,
  Q: qrcodegen.QrCode.Ecc.QUARTILE,
  H: qrcodegen.QrCode.Ecc.HIGH,
};

type ImageSettings = {
  src: string;
  height: number;
  width: number;
  excavate: boolean;
  x?: number;
  y?: number;
};

type QRProps = {
  value: string;
  size?: number;
  // Should be a real enum, but doesn't seem to be compatible with real code.
  level?: string;
  bgColor?: string;
  fgColor?: string;
  style?: CSSProperties;
  includeMargin?: boolean;
  marginSize?: number;
  imageSettings?: ImageSettings;
  title?: string;
  // Should be a real enum, but doesn't seem to be compatible with real code.
  bgShape?: string;
  // Should be a real enum, but doesn't seem to be compatible with real code.
  fgShape?: string;
  borderSize?: number;
};
type QRPropsCanvas = QRProps & React.CanvasHTMLAttributes<HTMLCanvasElement>;
type QRPropsSVG = QRProps & React.SVGAttributes<SVGSVGElement>;

type Pos = {
  x: number;
  y: number;
};

type Rect = Pos & {
  w: number;
  h: number;
};

type Circle = Pos & {
  r: number;
};

type Star = Pos & {
  n: number;
  r: number;
  R: number;
};

const DEFAULT_SIZE = 128;
const DEFAULT_LEVEL = 'L';
const DEFAULT_BGCOLOR = '#FFFFFF';
const DEFAULT_FGCOLOR = '#000000';
const DEFAULT_INCLUDEMARGIN = false;
const DEFAULT_BGSHAPE = 'rect';
const DEFAULT_FGSHAPE = 'rect';
const DEFAULT_BORDER_SIZE = 0;

const SPEC_MARGIN_SIZE = 4;
const DEFAULT_MARGIN_SIZE = 0;

// This is *very* rough estimate of max amount of QRCode allowed to be covered.
// It is "wrong" in a lot of ways (area is a terrible way to estimate, it
// really should be number of modules covered), but if for some reason we don't
// get an explicit height or width, I'd rather default to something than throw.
const DEFAULT_IMG_SCALE = 0.1;

function isCorner(cellCount: number, cdx: number, rdx: number) {
  const end = [cellCount - 7, cellCount - 1];
  const start = [0, 6];
  return ![
    {x: start, y: start},
    {x: end, y: start},
    {x: start, y: end},
  ].every(
    ({x, y}) => !(cdx >= x[0] && cdx <= x[1] && rdx >= y[0] && rdx <= y[1])
  );
}

function rect(ctx: CanvasRenderingContext2D, {x, y, w, h}: Rect) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fill();
}

function circle(ctx: CanvasRenderingContext2D, {x, y, r}: Circle) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx.fill();
}

function star(ctx: CanvasRenderingContext2D, {x, y, n, r, R}: Star) {
  // Reference: https://jsfiddle.net/m1erickson/8j6kdf4o/
  let rot = (Math.PI / 2) * 3;
  let dx = x;
  let dy = y;

  const step = Math.PI / n;
  ctx.beginPath();
  ctx.moveTo(x, y - R);
  for (let i = 0; i < n; i++) {
    dx = x + Math.cos(rot) * R;
    dy = y + Math.sin(rot) * R;
    ctx.lineTo(dx, dy);
    rot += step;

    dx = x + Math.cos(rot) * r;
    dy = y + Math.sin(rot) * r;
    ctx.lineTo(dx, dy);
    rot += step;
  }
  ctx.lineTo(x, y - R);
  ctx.closePath();
  ctx.fill();
}

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

  let excavation = null;
  if (imageSettings.excavate) {
    let floorX = Math.floor(x);
    let floorY = Math.floor(y);
    let ceilW = Math.ceil(w + x - floorX);
    let ceilH = Math.ceil(h + y - floorY);
    excavation = {x: floorX, y: floorY, w: ceilW, h: ceilH};
  }

  return {x, y, h, w, excavation};
}

function getMarginSize(includeMargin: boolean, marginSize?: number): number {
  if (marginSize != null) {
    return Math.floor(marginSize);
  }
  return includeMargin ? SPEC_MARGIN_SIZE : DEFAULT_MARGIN_SIZE;
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

const QRCodeCanvas = React.forwardRef(function QRCodeCanvas(
  props: QRPropsCanvas,
  forwardedRef: React.ForwardedRef<HTMLCanvasElement>
) {
  const {
    value,
    size = DEFAULT_SIZE,
    level = DEFAULT_LEVEL,
    bgColor = DEFAULT_BGCOLOR,
    fgColor = DEFAULT_FGCOLOR,
    includeMargin = DEFAULT_INCLUDEMARGIN,
    bgShape = DEFAULT_BGSHAPE,
    fgShape = DEFAULT_FGSHAPE,
    borderSize = DEFAULT_BORDER_SIZE,
    marginSize,
    style,
    imageSettings,
    ...otherProps
  } = props;
  const imgSrc = imageSettings?.src;
  const _canvas = useRef<HTMLCanvasElement | null>(null);
  const _image = useRef<HTMLImageElement>(null);

  // Set the local ref (_canvas) and also the forwarded ref from outside
  const setCanvasRef = useCallback(
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
  // Don't actually read the value anywhere. A smarter use of useEffect would
  // depend on this value.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isImgLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    // Always update the canvas. It's cheap enough and we want to be correct
    // with the current state.
    if (_canvas.current != null) {
      const canvas = _canvas.current;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      let cells = qrcodegen.QrCode.encodeText(
        value,
        ERROR_LEVEL_MAP[level]
      ).getModules();

      const circleOffset = 6 + ['L', 'M', 'Q', 'H'].indexOf(level);
      const bgPadding =
        bgShape === 'circle' ? circleOffset + borderSize : borderSize / 2;
      const rawMargin = getMarginSize(includeMargin, marginSize);
      const margin = rawMargin + bgPadding;
      const numCells = cells.length + margin * 2;
      const calculatedImageSettings = getImageSettings(
        cells,
        size,
        margin,
        imageSettings
      );

      // We're going to scale this so that the number of drawable units
      // matches the number of cells. This avoids rounding issues, but does
      // result in some potentially unwanted single pixel issues between
      // blocks, only in environments that don't support Path2D.
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.height = canvas.width = size * pixelRatio;
      const scale = (size / numCells) * pixelRatio;
      ctx.scale(scale, scale);

      ctx.fillStyle = bgColor;
      ctx.strokeStyle = fgColor;

      // Draw solid background, only paint dark modules.
      if (bgShape === 'circle') {
        circle(ctx, {
          x: numCells / 2,
          y: numCells / 2,
          r: numCells / 2 - borderSize / 2,
        });
      } else {
        rect(ctx, {x: 0, y: 0, w: numCells, h: numCells});
      }

      // Draw border with custom width.
      if (borderSize > 0) {
        ctx.lineWidth = borderSize;
        ctx.stroke();
      }

      const draw = (x: number, y: number) => {
        if (fgShape === 'circle') {
          circle(ctx, {x: x + 0.5, y: y + 0.5, r: 0.5});
        } else if (fgShape === 'star') {
          star(ctx, {x: x + 0.5, y: y + 0.5, n: 5, r: 0.25, R: 0.5});
        } else {
          rect(ctx, {x, y, w: 1, h: 1});
        }
      };

      const insideCircle = (x: number, y: number): boolean => {
        const c = numCells / 2;
        const r = c - borderSize - 1;
        return (
          Math.sqrt(Math.pow(c - x - 0.5, 2) + Math.pow(c - y - 0.5, 2)) < r
        );
      };

      ctx.fillStyle = fgColor;

      // Draw filler modules for circle bgShape.
      if (bgShape === 'circle') {
        for (let buff = 1; buff < rawMargin + 2; buff++) {
          for (let row = 0; row < 10; row++) {
            for (let col = 0; col < cells.length; col++) {
              const start = {
                i: row + 10,
                y: row + borderSize + circleOffset - 10,
              };
              const end = {
                i: row + cells.length - 18,
                y: row + cells.length + borderSize + circleOffset + rawMargin * 2,
              };
              const j = col;
              const x = (col + 10) * buff;
              [start, end].forEach(({i, y}) => {
                // top and bottom
                if (cells[i][j] && insideCircle(x, y)) {
                  draw(x, y);
                }
                // left and right
                if (cells[j][i] && insideCircle(y, x)) {
                  draw(y, x);
                }
              });
            }
          }
        }
      }

      const image = _image.current;
      const haveImageToRender =
        calculatedImageSettings != null &&
        image !== null &&
        image.complete &&
        image.naturalHeight !== 0 &&
        image.naturalWidth !== 0;

      if (haveImageToRender) {
        if (calculatedImageSettings.excavation != null) {
          cells = excavateModules(cells, calculatedImageSettings.excavation);
        }
      }

      if (fgShape === 'rect' && SUPPORTS_PATH2D) {
        // $FlowFixMe: Path2D c'tor doesn't support args yet.
        ctx.fill(new Path2D(generatePath(cells, margin)));
      } else {
        cells.forEach(function (row, rdx) {
          const y = rdx + margin;
          row.forEach(function (cell, cdx) {
            const x = cdx + margin;
            if (cell) {
              if (isCorner(cells.length, cdx, rdx)) {
                rect(ctx, {x, y, w: 1, h: 1});
              } else {
                draw(x, y);
              }
            }
          });
        });
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
  useEffect(() => {
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
        {...otherProps}
      />
      {img}
    </>
  );
});
type shapeOptions = 'star'|'circle'|'heart'
const shapeMapping:any = {
  star:{
    fontSize:'1.3pt',
    cb:({x,y,unitSize}:{x:number,y:number,unitSize:number})=>`<text class="react-qrcode-svg" x="${(x+0.5) * unitSize}" y="${(y+1) * unitSize}" text-anchor="middle">★</text>`
  },
  heart:{
    fontSize:'.6pt',
    cb:({x,y,unitSize}:{x:number,y:number,unitSize:number})=>`<text class="react-qrcode-svg" x="${(x+0.5) * unitSize}" y="${(y+1) * unitSize}" text-anchor="middle">❤️</text>`
  },
  circle:{
    cb:({x,y,unitSize}:{x:number,y:number,unitSize:number})=>`<circle class="react-qrcode-svg" r="0.5" cx="${(x+0.5) * unitSize}" cy="${(y+0.5) * unitSize}" />`
  },
  rect:{
    cb:({x,y,unitSize}:{x:number,y:number,unitSize:number})=>`<rect class="react-qrcode-svg" x="${x * unitSize}" y="${y * unitSize}" width="${unitSize}" height="${unitSize}"/>`
  },
}
function createShapeQRCodeSVG(data:any,shape:shapeOptions,fgColor?:string, offsetX:number=0,offsetY:number=0) {
  const matrix = data;
  const unitSize = 1;
  const cornerBoxSize = 7;

  let svgContent = `<style>
    circle.react-qrcode-svg.transparent{
      fill:transparent;
    }
    text.react-qrcode-svg, rect.react-qrcode-svg, circle.react-qrcode-svg {
      font-family: "Courier New";
      fill:${fgColor??'#000000'};
      ${!!shapeMapping[shape]?.fontSize ? `font-size:${shapeMapping[shape].fontSize};`:''}
    }
  </style>`;

  const isCornerBox = (x:number, y:number) => {
      const cornerPositions = [
          { x: 0, y: 0 },
          { x: matrix.length - cornerBoxSize, y: 0 },
          { x: 0, y: matrix.length - cornerBoxSize }
      ];
      return cornerPositions.some(pos => x >= pos.x && x < pos.x + cornerBoxSize && y >= pos.y && y < pos.y + cornerBoxSize);
  };

  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (isCornerBox(x, y) && matrix[y][x]) {
        svgContent += shapeMapping.rect.cb({x:(x+offsetX),y:(y+offsetY),unitSize})
      } else if (matrix[y][x]) {
        svgContent += shapeMapping[shape].cb({x:(x+offsetX),y:(y+offsetY),unitSize});
      }
    }
  }

  return svgContent;
}

const QRCodeSVG = React.forwardRef(function QRCodeSVG(
  props: QRPropsSVG,
  forwardedRef: React.ForwardedRef<SVGSVGElement>
) {
  const {
    value,
    size = DEFAULT_SIZE,
    level = DEFAULT_LEVEL,
    bgShape = DEFAULT_BGSHAPE,
    bgColor = DEFAULT_BGCOLOR,
    fgColor = DEFAULT_FGCOLOR,
    includeMargin = DEFAULT_INCLUDEMARGIN,
    borderSize = DEFAULT_BORDER_SIZE,
    title,
    marginSize,
    imageSettings,
    ...otherProps
  } = props;

  let cells = qrcodegen.QrCode.encodeText(
    value,
    ERROR_LEVEL_MAP[level]
  ).getModules();

  const circleOffset = 6 + ['L', 'M', 'Q', 'H'].indexOf(level);
  const bgPadding =
    bgShape === 'circle' ? circleOffset + borderSize : borderSize / 2;
  const rawMargin = getMarginSize(includeMargin, marginSize);
  const margin = rawMargin + bgPadding;
  const numCells = cells.length + margin * 2;
  const calculatedImageSettings = getImageSettings(
    cells,
    size,
    margin,
    imageSettings
  );

  const insideCircle = (x: number, y: number): boolean => {
    const c = numCells / 2;
    const r = c - borderSize - 1;
    return (
      Math.sqrt(Math.pow(c - x - 0.5, 2) + Math.pow(c - y - 0.5, 2)) < r
    );
  };

  // Draw solid background, only paint dark modules.
  let bgShapeSVG = ''
  if (bgShape === 'circle') {
    bgShapeSVG += `<circle class="react-qrcode-svg bg" cx="${numCells/2}" cy="${numCells/2}" r="${numCells/2 - borderSize / 2}" stroke="${fgColor}" stroke-width="${borderSize}"/>`

    for (let buff = 1; buff < rawMargin + 2; buff++) {
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < cells.length; col++) {
          const start = {
            i: row + 10,
            y: row + borderSize + circleOffset - 10,
          };
          const end = {
            i: row + cells.length - 18,
            y: row + cells.length + borderSize + circleOffset + rawMargin * 2,
          };
          const j = col;
          const x = (col + 10) * buff;
          [start, end].forEach(({i, y}) => {
            // top and bottom
            if (cells[i][j] && insideCircle(x, y)) {
              bgShapeSVG += shapeMapping[otherProps.fgShape??'rect'].cb({x,y,unitSize:1});
            }
            // left and right
            if (cells[j][i] && insideCircle(y, x)) {
              bgShapeSVG += shapeMapping[otherProps.fgShape??'rect'].cb({x:y,y:x,unitSize:1});
            }
          });
        }
      }
    }
  }

  let image = null;
  if (imageSettings != null && calculatedImageSettings != null) {
    if (calculatedImageSettings.excavation != null) {
      cells = excavateModules(cells, calculatedImageSettings.excavation);
    }

    image = (
      <image
        xlinkHref={imageSettings.src}
        height={calculatedImageSettings.h}
        width={calculatedImageSettings.w}
        x={calculatedImageSettings.x + margin}
        y={calculatedImageSettings.y + margin}
      />
    );
  }

  // Drawing strategy: instead of a rect per module, we're going to create a
  // single path for the dark modules and layer that on top of a light rect,
  // for a total of 2 DOM nodes. We pay a bit more in string concat but that's
  // way faster than DOM ops.
  // For level 1, 441 nodes -> 2
  // For level 40, 31329 -> 2
  let fgPath = '';
  if(['rect'].includes(otherProps.fgShape??'')){
    fgPath = generatePath(cells, margin);
  }

  //build the svg data with a shape instead of a rectangle / single path
  let shapeQRCodeSVG = '';
  if(['heart','star','circle'].includes(otherProps.fgShape??'')){
    shapeQRCodeSVG = createShapeQRCodeSVG(cells,otherProps.fgShape as shapeOptions,fgColor,margin,margin)
  }

  return (
    <svg
      height={size}
      width={size}
      viewBox={`0 0 ${numCells} ${numCells}`}
      ref={forwardedRef}
      {...otherProps}>
      {!!title && <title>{title}</title>}
      <style>{`
        .react-qrcode-svg.bg{fill:${bgColor??'#ffffff'};}
        text.react-qrcode-svg, rect.react-qrcode-svg, circle.react-qrcode-svg {
          font-family: "Courier New";
          fill:${fgColor??'#000000'};
          ${!!shapeMapping[otherProps.fgShape??'rect']?.fontSize ? `font-size:${shapeMapping[otherProps.fgShape??'rect'].fontSize};`:''}
        }
      `}</style>
      {bgShape == 'rect' && (
        <rect
          className="react-qrcode-svg bg"
          width={numCells}
          height={numCells}
          stroke={fgColor}
          strokeWidth={borderSize}
        />
      )}
      {bgShape == 'circle' && <g dangerouslySetInnerHTML={{ __html: bgShapeSVG }} />}
      {['rect'].includes(otherProps.fgShape??'') && <path fill={fgColor} d={fgPath} shapeRendering="crispEdges" />}
      {['star','circle','heart'].includes(otherProps.fgShape??'') && <g dangerouslySetInnerHTML={{ __html: shapeQRCodeSVG }} />}
      {image}
    </svg>
  );
});

type RootProps =
  | (QRPropsSVG & {renderAs: 'svg'})
  | (QRPropsCanvas & {renderAs?: 'canvas'});
const QRCode = React.forwardRef(function QRCode(
  props: RootProps,
  forwardedRef: React.ForwardedRef<HTMLCanvasElement | SVGSVGElement>
) {
  const {renderAs, ...otherProps} = props;
  if (renderAs === 'svg') {
    return (
      <QRCodeSVG
        ref={forwardedRef as React.ForwardedRef<SVGSVGElement>}
        {...(otherProps as QRPropsSVG)}
      />
    );
  }
  return (
    <QRCodeCanvas
      ref={forwardedRef as React.ForwardedRef<HTMLCanvasElement>}
      {...(otherProps as QRPropsCanvas)}
    />
  );
});

export { QRCodeCanvas, QRCodeSVG, QRCode as default };

