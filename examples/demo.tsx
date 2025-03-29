import React, {
  useState,
  StrictMode,
  useCallback,
  useEffect,
  version as reactVersion,
} from 'react';
import {createRoot} from 'react-dom/client';
import {version as reactDOMVersion} from 'react-dom';
import {version} from '../package.json';
import {FullDemo} from './full';
import {DownloadDemo} from './download';
import {ImageDemo} from './image';

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
  image: {
    label: '<img>',
    description:
      'Demo showing how to use refs to access the underlying canvas element and extract the image data to render an HTML <img>.',
    component: ImageDemo,
    file: 'examples/image.tsx',
  },
};

type DemoComponentKeys = keyof typeof DEMOS;

function getInitialDemo(): DemoComponentKeys {
  const urlParams = new URLSearchParams(window.location.search);
  const demo = urlParams.get('demo');
  return demo && demo in DEMOS ? (demo as DemoComponentKeys) : 'full';
}

function Demo() {
  const [demo, setDemo] = useState<DemoComponentKeys>(getInitialDemo());

  const handleDemoChange = useCallback((nextDemo: DemoComponentKeys) => {
    setDemo(nextDemo);
    history.pushState({demo: nextDemo}, '', `?demo=${nextDemo}`);
  }, []);

  // handle back/forward navigation
  useEffect(() => {
    function handlePopState(e: PopStateEvent) {
      setDemo(e.state?.demo || 'full');
    }
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  });

  // update document title
  useEffect(() => {
    document.title = `QRCode.react Demo - ${DEMOS[demo].label}`;
  }, [demo]);

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
        <p>
          Using <code>react@{reactVersion}</code> &{' '}
          <code>react-dom@{reactDOMVersion}</code>
        </p>
      </div>
      <div className="container">
        <label>
          <select
            onChange={(e) =>
              handleDemoChange(e.target.value as DemoComponentKeys)
            }
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

const container = document.getElementById('demo');
const root = createRoot(container!);
root.render(
  <StrictMode>
    <Demo />
  </StrictMode>
);
