/**
 * @license qrcode.react
 * Copyright (c) Paul O'Shannessy
 * SPDX-License-Identifier: ISC
 */

import React, {useRef, useEffect} from 'react';
import qrcodegen from './third-party/qrcodegen';
import {
  QRProps,
  DEFAULT_PROPS,
  MARGIN_SIZE,
  ERROR_LEVEL_MAP,
  generatePath,
  excavateModules,
  getImageSettings,
} from './helpers';

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

export default function QRCodeCanvas(props: QRProps) {
  const _canvas = useRef<HTMLCanvasElement>(null);
  const _image = useRef<HTMLImageElement>(null);

  function update() {
    const {value, size, level, bgColor, fgColor, includeMargin} = props;

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

      const margin = includeMargin ? MARGIN_SIZE : 0;
      const numCells = cells.length + margin * 2;
      const calculatedImageSettings = getImageSettings(props, cells);

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
        ctx.fill(new Path2D(generatePath(cells, margin)));
      } else {
        cells.forEach(function (row, rdx) {
          row.forEach(function (cell, cdx) {
            if (cell) {
              ctx.fillRect(cdx + margin, rdx + margin, 1, 1);
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
  }

  useEffect(() => {
    // Always update the canvas. It's cheap enough and we want to be correct
    // with the current state.
    update();
  });

  const {
    value,
    size,
    level,
    bgColor,
    fgColor,
    style,
    includeMargin,
    imageSettings,
    ...otherProps
  } = props;
  const canvasStyle = {height: size, width: size, ...style};
  let img = null;
  let imgSrc = imageSettings?.src;
  if (imgSrc != null) {
    img = (
      <img
        src={imgSrc}
        key={imgSrc}
        style={{display: 'none'}}
        onLoad={() => {
          update();
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
        ref={_canvas}
        {...otherProps}
      />
      {img}
    </>
  );
}

QRCodeCanvas.defaultProps = DEFAULT_PROPS;

