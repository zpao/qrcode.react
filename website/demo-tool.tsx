import type {ReactElement, ReactNode} from 'react';
import React from 'react';
import {useAppShellMobile} from '@astryxdesign/core/AppShell';
import {Card} from '@astryxdesign/core/Card';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Heading} from '@astryxdesign/core/Heading';
import {Layout, LayoutContent, LayoutPanel} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Theme} from '@astryxdesign/core/theme';
import {VStack} from '@astryxdesign/core/VStack';
import {neutralTheme} from './theme/neutralTheme';

type DemoToolProps = {
  readonly title: string;
  readonly description: string;
  readonly content: ReactNode;
  readonly panel: ReactNode;
};

type QrPreviewProps = {
  readonly title: string;
  readonly children: ReactNode;
  readonly code?: string;
};

function DemoHeading(props: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <VStack gap={1}>
      <Heading level={1}>{props.title}</Heading>
      <Text display="block" color="secondary">
        {props.description}
      </Text>
    </VStack>
  );
}

function DemoPage(props: {
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <VStack gap={6} padding={6}>
      <DemoHeading title={props.title} description={props.description} />
      {props.children}
    </VStack>
  );
}

function DemoTool(props: DemoToolProps): ReactElement {
  const {isMobile} = useAppShellMobile();

  if (isMobile) {
    return (
      <VStack gap={4} padding={4}>
        <DemoHeading title={props.title} description={props.description} />
        {props.panel}
        {props.content}
      </VStack>
    );
  }

  return (
    <Layout
      height="fill"
      start={
        <LayoutPanel
          label="Properties"
          hasDivider
          isScrollable
          width={380}
          padding={4}>
          {props.panel}
        </LayoutPanel>
      }
      content={
        <LayoutContent padding={4}>
          <VStack gap={4}>
            <DemoHeading title={props.title} description={props.description} />
            {props.content}
          </VStack>
        </LayoutContent>
      }
    />
  );
}

function QrPreview(props: QrPreviewProps): ReactElement {
  return (
    <Card>
      <VStack gap={3}>
        <Heading level={2}>{props.title}</Heading>
        <Theme theme={neutralTheme} mode="light">
          <VStack
            className="qr-preview-plate"
            padding={3}
            style={{
              background: 'var(--color-background-surface)',
              borderRadius: 'var(--radius-inner)',
              width: 'fit-content',
            }}>
            {props.children}
          </VStack>
        </Theme>
        {props.code != null ? (
          <CodeBlock code={props.code} language="tsx" />
        ) : null}
      </VStack>
    </Card>
  );
}

export {DemoTool, DemoPage, QrPreview};
