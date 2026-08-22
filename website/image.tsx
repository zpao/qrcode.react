import {QRCodeCanvas} from 'qrcode.react';
import React, {useEffect, useRef, useState} from 'react';
import {Code} from '@astryxdesign/core/Code';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {DemoPage, QrPreview} from './demo-tool';

function ImageDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgDataURL, setImgDataURL] = useState<string | undefined>(undefined);

  useEffect(() => {
    const node = canvasRef.current;
    if (node == null) {
      return;
    }
    const dataURI = node.toDataURL('image/png');
    setImgDataURL(dataURI);
  }, [canvasRef]);

  return (
    <DemoPage
      title="<img>"
      description="Read the canvas through a ref and render the pixels as an HTML image.">
      <VStack gap={4}>
        <Text display="block">
          Browsers treat canvas like an image in most ways, but an{' '}
          <Code>&lt;img&gt;</Code> still wins in a few cases. On Mobile Safari,
          a long press on an eSIM QR in an img element offers a native install.
          That does not happen for canvas.
        </Text>
        <QrPreview title="Image output">
          <VStack
            aria-hidden={true}
            style={{position: 'absolute', left: -9999}}>
            <QRCodeCanvas ref={canvasRef} value="hello world" size={256} />
          </VStack>
          <img
            src={imgDataURL}
            height={256}
            width={256}
            alt="Generated QR code"
          />
        </QrPreview>
      </VStack>
    </DemoPage>
  );
}

export {ImageDemo};
