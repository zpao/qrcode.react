/**
 * @license qrcode.react
 * Copyright (c) Paul O'Shannessy
 * SPDX-License-Identifier: ISC
 */

import React from 'react';
import { QRProps, DEFAULT_PROPS } from './helpers';
import QRCodeCanvas from './canvas';
import QRCodeSVG from './svg';


type RenderAs = 'svg' | 'canvas';
type RootProps = QRProps & {renderAs: string};
const QRCode = (props: RootProps) => {
  const {renderAs, ...otherProps} = props;
  const Component = (renderAs as RenderAs) === 'svg' ? QRCodeSVG : QRCodeCanvas;
  return <Component {...otherProps} />;
};

QRCode.defaultProps = {renderAs: 'canvas', ...DEFAULT_PROPS};

export {QRCode as default, QRCodeCanvas, QRCodeSVG};
