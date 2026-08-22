import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';

import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Theme} from '@astryxdesign/core/theme';
import {DemoTopNav, useDemoNavigation} from './demo-nav';
import type {DemoEntry} from './demo-nav';
import {DownloadDemo} from './download';
import {FullDemo} from './full';
import {ImageDemo} from './image';
import {PayloadsDemo} from './payloads';
import {neutralTheme} from './theme/neutralTheme';

const DEMOS = {
  full: {
    label: 'Full',
    description: 'Fully configurable demo with ability to set all props.',
    component: FullDemo,
    file: 'website/full.tsx',
  },
  download: {
    label: 'Download',
    description:
      'Demo showing how to trigger a client-side download of the rendered QR Code.',
    component: DownloadDemo,
    file: 'website/download.tsx',
  },
  image: {
    label: '<img>',
    description:
      'Demo showing how to use refs to access the underlying canvas element and extract the image data to render an HTML <img>.',
    component: ImageDemo,
    file: 'website/image.tsx',
  },
  payloads: {
    label: 'Payloads',
    description:
      'Real-world QR contents: Wi-Fi, contact, calendar, SMS, email, TOTP, geo.',
    component: PayloadsDemo,
    file: 'website/payloads.tsx',
  },
} satisfies Record<string, DemoEntry> & {readonly full: DemoEntry};

function Demo() {
  const [demo, navigateToDemo] = useDemoNavigation(DEMOS);
  const ActiveDemo = DEMOS[demo].component;

  return (
    <AppShell
      height={demo === 'full' ? 'fill' : 'auto'}
      contentPadding={0}
      variant="section"
      topNav={
        <DemoTopNav
          demos={DEMOS}
          selectedKey={demo}
          onSelect={navigateToDemo}
        />
      }>
      <ActiveDemo />
    </AppShell>
  );
}

const container = document.getElementById('demo');
const root = createRoot(container!);
root.render(
  <StrictMode>
    <Theme theme={neutralTheme} mode="system">
      <Demo />
    </Theme>
  </StrictMode>
);
