import {QRCodeCanvas} from '..';
import React, {useEffect, useRef, useState} from 'react';

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
    <>
      <p>
        Similar to the Download demo, this demo shows how you can use{' '}
        <code>ref</code>s to access the underlying DOM nodes. In this case it
        will be used to render a proper <code>&lt;img&gt;</code> element. This
        is done by getting the raw image data from the rendered QRCodeCanvas.
      </p>
      <p>
        While browsers typically treat canvas elements as images in most ways,
        there are some advantages to img elements. For example, on in Mobile
        Safari, long pressing on eSIM QR Codes in img elements enables a native
        install method. This does not happen for canvas elements.
      </p>

      <div className="container">
        <div>
          <div style={{display: 'none'}}>
            <QRCodeCanvas ref={canvasRef} value="hello world" size={256} />
          </div>
          <img src={imgDataURL} height={256} width={256} />
        </div>
      </div>
    </>
  );
}

export {ImageDemo};
