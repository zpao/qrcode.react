import type {ComponentType, MouseEvent as ReactMouseEvent} from 'react';
import React, {useCallback, useEffect, useState} from 'react';
import {useAppShellMobile} from '@astryxdesign/core/AppShell';
import {TopNav, TopNavHeading, TopNavItem} from '@astryxdesign/core/TopNav';

export type DemoEntry = {
  readonly label: string;
  readonly description: string;
  readonly component: ComponentType;
  readonly file: `website/${string}.tsx`;
};

export type DemoRegistry = Record<string, DemoEntry> & {
  readonly full: DemoEntry;
};
export type DemoKey<T extends DemoRegistry = DemoRegistry> = keyof T & string;

export function parseDemoKey<T extends DemoRegistry>(
  search: string,
  demos: T
): DemoKey<T> {
  const demo = new URLSearchParams(search).get('demo');
  if (demo != null && demo in demos) {
    return demo as DemoKey<T>;
  }
  return 'full';
}

export function useDemoNavigation<T extends DemoRegistry>(
  demos: T
): readonly [DemoKey<T>, (next: DemoKey<T>) => void] {
  const [selectedKey, setSelectedKey] = useState(() =>
    parseDemoKey(window.location.search, demos)
  );

  useEffect(() => {
    function handlePopState() {
      setSelectedKey(parseDemoKey(window.location.search, demos));
    }
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [demos]);

  const navigate = useCallback((next: DemoKey<T>) => {
    setSelectedKey((current) => {
      if (current === next) {
        return current;
      }
      history.pushState(null, '', `?demo=${next}`);
      return next;
    });
  }, []);

  useEffect(() => {
    document.title = `QRCode.react Demo - ${demos[selectedKey].label}`;
  }, [demos, selectedKey]);

  return [selectedKey, navigate];
}

export function DemoTopNav<T extends DemoRegistry>(props: {
  readonly demos: T;
  readonly selectedKey: DemoKey<T>;
  readonly onSelect: (next: DemoKey<T>) => void;
}) {
  const {closeMobileNav} = useAppShellMobile();
  const keys = Object.keys(props.demos) as Array<DemoKey<T>>;

  return (
    <TopNav
      label="Demos"
      heading={<TopNavHeading heading="QRCode.react" />}
      endContent={
        <TopNavItem
          label={`v${__APP_VERSION__}`}
          href={`https://www.npmjs.com/package/qrcode.react/v/${__APP_VERSION__}`}
        />
      }>
      {keys.map((key) => (
        <TopNavItem
          key={key}
          label={props.demos[key].label}
          href={`?demo=${key}`}
          isSelected={key === props.selectedKey}
          onClick={(e: ReactMouseEvent) => {
            e.preventDefault();
            props.onSelect(key);
            closeMobileNav();
          }}
        />
      ))}
    </TopNav>
  );
}
