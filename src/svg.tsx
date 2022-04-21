/**
 * @license qrcode.react
 * Copyright (c) Paul O'Shannessy
 * SPDX-License-Identifier: ISC
 */

import React from 'react';
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

export default function QRCodeSVG(props: QRProps) {
  const {
    value,
    size,
    level,
    bgColor,
    fgColor,
    includeMargin,
    imageSettings,
    ...otherProps
  } = props;

  let cells = qrcodegen.QrCode.encodeText(
    value,
    ERROR_LEVEL_MAP[level]
  ).getModules();

  const margin = includeMargin ? MARGIN_SIZE : 0;
  const numCells = cells.length + margin * 2;
  const calculatedImageSettings = getImageSettings(props, cells);

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
        preserveAspectRatio="none"
      />
    );
  }

  // Drawing strategy: instead of a rect per module, we're going to create a
  // single path for the dark modules and layer that on top of a light rect,
  // for a total of 2 DOM nodes. We pay a bit more in string concat but that's
  // way faster than DOM ops.
  // For level 1, 441 nodes -> 2
  // For level 40, 31329 -> 2
  const fgPath = generatePath(cells, margin);

  return (
    <svg
      shapeRendering="crispEdges"
      height={size}
      width={size}
      viewBox={`0 0 ${numCells} ${numCells}`}
      {...otherProps}>
      <path fill={bgColor} d={`M0,0 h${numCells}v${numCells}H0z`} />
      <path fill={fgColor} d={fgPath} />
      {image}
    </svg>
  );
}
QRCodeSVG.defaultProps = DEFAULT_PROPS;
