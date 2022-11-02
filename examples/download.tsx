import {QRCodeCanvas, QRCodeSVG} from '..';
import React, {useRef} from 'react';

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
    // For canvas, we just extract the image data and send that directly.
    const dataURI = node.toDataURL('image/png');

    downloadStringAsFile(dataURI, 'qrcode-canvas.png');
  }

  function onSVGButtonClick() {
    const node = svgRef.current;
    if (node == null) {
      return;
    }

    // For SVG, we need to get the markup and turn it into XML.
    // Using XMLSerializer is the easiest way to ensure the markup
    // contains the xmlns. Then we make sure it gets the right DOCTYPE,
    // encode all of that to be safe to be encoded as a URI (which we
    // need to stuff into href).
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
    <>
      <p>
        This demo shows how you can use <code>ref</code>s to access the
        underlying DOM nodes. This allows you to then get the raw image data (in
        the case of <code>QRCodeCanvas</code>) or the serialized markup (in the
        case of <code>QRQCodeSVG</code>). With this you can trigger downloading
        a file directly.
      </p>

      <div className="container">
        <div>
          <QRCodeCanvas ref={canvasRef} value="hello world" />
          <button onClick={onCanvasButtonClick} style={{display: 'block'}}>
            download canvas
          </button>
        </div>
        <div>
          <QRCodeSVG ref={svgRef} value="hello world" />
          <button onClick={onSVGButtonClick} style={{display: 'block'}}>
            download svg
          </button>
        </div>
      </div>
    </>
  );
}

export {DownloadDemo};
