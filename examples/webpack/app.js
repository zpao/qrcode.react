import {QRCodeSVG} from '../../';
import React from 'react';
import {render} from 'react-dom';

// const App = () => <QRCodeSVG value="hello world" />;
const App = () => React.createElement(QRCodeSVG, {value: 'hello world'});

// render(<App />, document.getElementById('root'));
render(React.createElement(App), document.getElementById('root'));
