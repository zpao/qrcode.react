import React from 'react';
import renderer from 'react-test-renderer';
import QRCode, {QRCodeSVG, QRCodeCanvas} from '..';

const BASIC_PROPS = {
  value: 'http://picturesofpeoplescanningqrcodes.tumblr.com/',
  size: 128,
  bgColor: '#ffffff',
  fgColor: '#000000',
  level: 'L',
  includeMargin: false,
};

const TEST_CONFIGS = [
  {includeMargin: true},
  {includeMargin: false},
  {level: 'L'},
  {level: 'M'},
  {level: 'Q'},
  {level: 'H'},
  {
    imageSettings: {
      src: 'https://static.zpao.com/favicon.png',
      x: null,
      y: null,
      height: 24,
      width: 24,
      excavate: true,
    },
  },
  {
    imageSettings: {
      src: 'https://static.zpao.com/favicon.png',
      x: null,
      y: null,
      height: 24,
      width: 24,
      excavate: false,
    },
  },
  {value: '1234567890'},
  {value: 'single byte emoji ✅'},
  {value: 'double byte emoji 👌'},
  {value: 'four byte emoji 👌🏽'},
  {value: '火と氷'},
  // The snapshots for these are only useful for SVG & looking at widths.
  {includeMargin: true, marginSize: 10},
  {includeMargin: true, marginSize: 0},
  {includeMargin: false, marginSize: 8},
  {includeMargin: false, marginSize: 6.5},
];

describe('SVG rendering', () => {
  test('renders basic SVG correctly', () => {
    const tree = renderer.create(<QRCodeSVG {...BASIC_PROPS} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test.each(TEST_CONFIGS)('renders SVG variation (%o) correctly', (config) => {
    const tree = renderer
      .create(<QRCodeSVG {...BASIC_PROPS} {...config} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Canvas rendering', () => {
  test('renders basic Canvas correctly', () => {
    const tree = renderer.create(<QRCodeCanvas {...BASIC_PROPS} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test.each(TEST_CONFIGS)(
    'renders Canvas variation (%o) correctly',
    (config) => {
      const tree = renderer
        .create(<QRCodeCanvas {...BASIC_PROPS} {...config} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
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

  test('QRCode', () => {
    <QRCode {...BASIC_PROPS} renderAs="svg" className="foo" clipRule="bar" />;
    // To ensure this is properly discriminated, add clipRule as a prop and see
    // it fail to typecheck.
    <QRCode {...BASIC_PROPS} renderAs="canvas" className="foo" />;
    // Unfortunately this won't have the same typechecking because we have
    // defaultProps.
    <QRCode {...BASIC_PROPS} className="foo" />;

    expect(0).toBe(0);
  });
});
