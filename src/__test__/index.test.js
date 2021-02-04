import React from 'react';
import renderer from 'react-test-renderer';
const QRCode = require('qrcode.react');

it('renders correctly', () => {
  const tree = renderer
    .create(
      <QRCode
        value={'http://picturesofpeoplescanningqrcodes.tumblr.com/'}
        size={128}
        bgColor={'#ffffff'}
        fgColor={'#000000'}
        level={'L'}
        includeMargin={false}
        renderAs={'svg'}
        imageSettings={{
          src: 'https://static.zpao.com/favicon.png',
          x: null,
          y: null,
          height: 24,
          width: 24,
          excavate: true,
        }}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
