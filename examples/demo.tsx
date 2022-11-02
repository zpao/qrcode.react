import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {version} from '../package.json';
import {FullDemo} from './full';
import {DownloadDemo} from './download';

const DEMOS = {
  full: {
    label: 'Full',
    description: 'Fully configurable demo with ability to set all props.',
    component: FullDemo,
    file: 'examples/full.tsx',
  },
  download: {
    label: 'Download',
    description:
      'Demo showing how to trigger a client-side download of the rendered QR Code.',
    component: DownloadDemo,
    file: 'examples/download.tsx',
  },
};

type DemoComponentKeys = keyof typeof DEMOS;

function Demo() {
  const [demo, setDemo] = useState<DemoComponentKeys>('full');

  const demoData = DEMOS[demo];

  const Component = demoData.component;
  return (
    <>
      <div className="container">
        <h1>
          QRCode.react Demo -{' '}
          <a href={`https://www.npmjs.com/package/qrcode.react/v/${version}`}>
            v{version}
          </a>
        </h1>
      </div>
      <div className="container">
        <label>
          <select
            onChange={(e) => setDemo(e.target.value as DemoComponentKeys)}
            value={demo}>
            {Object.keys(DEMOS).map((key) => {
              const data = DEMOS[key as DemoComponentKeys];
              return (
                <option key={key} value={key} title={data.description}>
                  {data.label} - {data.description}
                </option>
              );
            })}
          </select>
        </label>
      </div>
      <hr />
      <Component />
    </>
  );
}

ReactDOM.render(<Demo />, document.getElementById('demo'));
