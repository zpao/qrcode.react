import {QRCodeCanvas, QRCodeSVG} from 'qrcode.react';
import React, {useRef} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Grid} from '@astryxdesign/core/Grid';
import {VStack} from '@astryxdesign/core/VStack';
import {DemoPage, QrPreview} from './demo-tool';

function downloadStringAsFile(data: string, filename: string) {
  let a = document.createElement('a');
  a.download = filename;
  a.href = data;
  a.click();
}

function DownloadDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  function onCanvasButtonClick() {
    const node = canvasRef.current;
    if (node == null) {
      return;
    }
    const dataURI = node.toDataURL('image/png');

    downloadStringAsFile(dataURI, 'qrcode-canvas.png');
  }

  function onSVGButtonClick() {
    const node = svgRef.current;
    if (node == null) {
      return;
    }

    const serializer = new XMLSerializer();
    const fileURI =
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        '<?xml version="1.0" standalone="no"?>' +
          serializer.serializeToString(node)
      );

    downloadStringAsFile(fileURI, 'qrcode-svg.svg');
  }

  return (
    <DemoPage
      title="Download"
      description="Use refs to reach the rendered canvas or SVG, then download the image data or serialized markup.">
      <Grid columns={{minWidth: 280}} gap={4}>
        <VStack gap={3}>
          <QrPreview title="Canvas">
            <QRCodeCanvas ref={canvasRef} value="hello world" />
          </QrPreview>
          <Button label="Download canvas" onClick={onCanvasButtonClick} />
        </VStack>
        <VStack gap={3}>
          <QrPreview title="SVG">
            <QRCodeSVG ref={svgRef} value="hello world" />
          </QrPreview>
          <Button label="Download svg" onClick={onSVGButtonClick} />
        </VStack>
      </Grid>
    </DemoPage>
  );
}

export {DownloadDemo};
