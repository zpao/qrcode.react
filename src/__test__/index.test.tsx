import React from 'react';
import {QRCodeSVG, QRCodeCanvas} from '..';
import {describe, expect, test} from '@jest/globals';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom';

import type {ComponentPropsWithoutRef} from 'react';

// We're only using the explicit (non-DOM, non-ref) props for testing, but TS
// doesn't love us passing our test data as props without actually typing the
// object. So we'll make sure we give types that work. It's a little messy but
// gets the job done without being too fancy.
// Specifically, get the DOM-specific keys and omit them from the also-de-ref'ed
// component props. Then union together the two types since they may not always
// be the same.
type QRCodeCanvasProps = Omit<
  ComponentPropsWithoutRef<typeof QRCodeCanvas>,
  keyof React.CanvasHTMLAttributes<HTMLCanvasElement>
>;
type QRCodeSVGProps = Omit<
  ComponentPropsWithoutRef<typeof QRCodeSVG>,
  keyof React.SVGProps<SVGSVGElement>
>;
type QRProps = QRCodeCanvasProps | QRCodeSVGProps;
type PartialQRProps = Partial<QRCodeCanvasProps> | Partial<QRCodeSVGProps>;
type CrossOrigin = NonNullable<QRProps['imageSettings']>['crossOrigin'];

const BASIC_PROPS: QRProps = {
  value: 'http://picturesofpeoplescanningqrcodes.tumblr.com/',
  size: 128,
  bgColor: '#ffffff',
  fgColor: '#000000',
  level: 'L',
  includeMargin: false,
};

// Expect some or all of these to be overridden in the test configs.
const BASE_IMAGE_SETTINGS = {
  src: 'https://static.zpao.com/favicon.png',
  x: undefined,
  y: undefined,
  height: 24,
  width: 24,
  excavate: true,
};

const TEST_CONFIGS: PartialQRProps[] = [
  {includeMargin: true},
  {includeMargin: false},
  {level: 'L'},
  {level: 'M'},
  {level: 'Q'},
  {level: 'H'},
  {
    imageSettings: {
      ...BASE_IMAGE_SETTINGS,
      excavate: true,
    },
  },
  {
    imageSettings: {
      ...BASE_IMAGE_SETTINGS,
      excavate: false,
    },
  },
  {value: '1234567890'},
  {value: ['12345', '/ABC/DEF', 'abcDEF123']},
  {value: 'single byte emoji ✅'},
  {value: 'double byte emoji 👌'},
  {value: 'four byte emoji 👌🏽'},
  {value: '火と氷'},
  // The snapshots for these are only useful for SVG & looking at widths.
  {includeMargin: true, marginSize: 10},
  {includeMargin: true, marginSize: 0},
  {includeMargin: false, marginSize: 8},
  {includeMargin: false, marginSize: 6.5},
  {marginSize: -10},
  {title: 'some descriptive title'},
  // With our really small value, auto versioning would be really small. We
  // aren't encoding version anywhere testable, so this will be a proxy test
  // for ensuring minVersion is respected.
  {minVersion: 22},
  {level: 'L', boostLevel: false},
  {maskPattern: 1},
  // Test all crossOrigin values. Important in case we remove other image
  // settings tests and to ensure we do non-obvious things like map '' to
  // 'anonymous'.
  ...([undefined, '', 'anonymous', 'use-credentials'] as CrossOrigin[]).map(
    (crossOrigin) => {
      return {
        imageSettings: {
          ...BASE_IMAGE_SETTINGS,
          crossOrigin: crossOrigin,
        },
      };
    }
  ),
  // Data URI. Make sure it's possible. This will also be the only case where
  // the embedded image is in the snapshot.
  {
    imageSettings: {
      ...BASE_IMAGE_SETTINGS,
      // 24x24 red PNG
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAADVJREFUSEvt0rEJAAAMAkHdf+hkhK9S5a0F4bCTTA5TB0hXIhKKRBKhABZ8kUQogAVf9IBoAYUiL+kU3konAAAAAElFTkSuQmCC',
    },
  },
];

describe('SVG rendering', () => {
  test('renders basic SVG correctly', () => {
    const {container} = render(<QRCodeSVG {...BASIC_PROPS} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test.each(TEST_CONFIGS)('renders SVG variation (%o) correctly', (config) => {
    const {container} = render(<QRCodeSVG {...BASIC_PROPS} {...config} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('Canvas rendering', () => {
  test('renders basic Canvas correctly', () => {
    const {container} = render(<QRCodeCanvas {...BASIC_PROPS} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test.each(TEST_CONFIGS)(
    'renders Canvas variation (%o) correctly',
    (config) => {
      const {container} = render(<QRCodeCanvas {...BASIC_PROPS} {...config} />);
      // Some of these render an embedded image. Internally that results in
      // rendering an additional DOM node (<img>). We should make sure that's
      // there.
      expect(Array.from(container.children)).toMatchSnapshot();
    }
  );
});

describe('TypeScript Support', () => {
  test('QRCodeSVG', () => {
    <QRCodeSVG {...BASIC_PROPS} className="foo" clipRule="bar" />;
    expect(0).toBe(0);
  });

  test('QRCodeCanvas', () => {
    <QRCodeCanvas {...BASIC_PROPS} className="foo" />;
    expect(0).toBe(0);
  });
});

describe('Display Names set', () => {
  test('QRCodeSVG', () => {
    expect(QRCodeSVG.displayName).toBe('QRCodeSVG');
  });

  test('QRCodeCanvas', () => {
    expect(QRCodeCanvas.displayName).toBe('QRCodeCanvas');
  });
});

// `style` was previously declared explicitly as a prop. Ensure it works.
describe('`style` is passed to rendered nodes and merged correctly', () => {
  const style = {height: 100};
  test('QRCodeSVG', () => {
    const {container} = render(<QRCodeSVG {...BASIC_PROPS} style={style} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('QRCodeCanvas', () => {
    const {container} = render(<QRCodeCanvas {...BASIC_PROPS} style={style} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
