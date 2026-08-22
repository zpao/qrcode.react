import {QRCodeSVG, QRCodeCanvas} from 'qrcode.react';
import React, {useState} from 'react';
import type {ComponentProps} from 'react';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Grid} from '@astryxdesign/core/Grid';
import {Heading} from '@astryxdesign/core/Heading';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {DemoTool, QrPreview} from './demo-tool';
import {ColorField} from './fields';

type ErrorCorrectionLevel = NonNullable<
  ComponentProps<typeof QRCodeSVG>['level']
>;

const ERROR_LEVELS: readonly ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];

function FullDemo() {
  const [value, setValue] = useState(
    'https://picturesofpeoplescanningqrcodes.tumblr.com/'
  );
  const [size, setSize] = useState(128);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [level, setLevel] = useState<ErrorCorrectionLevel>('L');
  const [boostLevel, setBoostLevel] = useState<boolean>(true);
  const [minVersion, setMinVersion] = useState(1);
  const [marginSize, setMarginSize] = useState(0);
  const [title, setTitle] = useState('Title for my QR Code');
  const [includeImage, setIncludeImage] = useState(true);
  const [imageH, setImageH] = useState(24);
  const [imageW, setImageW] = useState(24);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [imageOpacity, setImageOpacity] = useState(1);
  const [imageSrc, setImageSrc] = useState(
    'https://static.zpao.com/favicon.png'
  );
  const [imageExcavate, setImageExcavate] = useState(true);
  const [centerImage, setCenterImage] = useState(true);

  function makeExampleCode(componentName: string) {
    const imageSettingsCode = includeImage
      ? `imageSettings={{
    src: "${imageSrc}",
    x: ${centerImage ? 'undefined' : imageX},
    y: ${centerImage ? 'undefined' : imageY},
    height: ${imageH},
    width: ${imageW},
    opacity: ${imageOpacity},
    excavate: ${imageExcavate},
  }}`
      : undefined;
    const propLines = [
      `value={"${value}"}`,
      `title={"${title}"}`,
      `size={${size}}`,
      `bgColor={"${bgColor}"}`,
      `fgColor={"${fgColor}"}`,
      `level={"${level}"}`,
      minVersion > 1 ? `minVersion={${minVersion}}` : undefined,
      !boostLevel ? `boostLevel={${boostLevel}}` : undefined,
      marginSize !== 0 ? `marginSize={${marginSize}}` : undefined,
      imageSettingsCode,
    ]
      .filter(Boolean)
      .join('\n  ');
    return `import {${componentName}} from 'qrcode.react';
<${componentName}
  ${propLines}
/>`;
  }
  const svgCode = makeExampleCode('QRCodeSVG');
  const canvasCode = makeExampleCode('QRCodeCanvas');

  const renderProps = {
    value,
    title,
    size,
    fgColor,
    bgColor,
    level,
    marginSize: marginSize > 0 ? marginSize : undefined,
    minVersion: minVersion > 1 ? minVersion : undefined,
    boostLevel: boostLevel ? undefined : false,
    imageSettings: includeImage
      ? {
          src: imageSrc,
          height: imageH,
          width: imageW,
          x: centerImage ? undefined : imageX,
          y: centerImage ? undefined : imageY,
          excavate: imageExcavate,
          opacity: imageOpacity,
        }
      : undefined,
  };

  const imageControlsDisabled = !includeImage;
  const imagePositionDisabled = !includeImage || centerImage;

  return (
    <DemoTool
      title="Full"
      description="Fully configurable demo with ability to set all props."
      panel={
        <FormLayout>
          <NumberInput
            label="Size (px)"
            value={size}
            onChange={setSize}
            min={0}
            isIntegerOnly
            isWheelEnabled={false}
          />
          <ColorField
            label="Background Color"
            value={bgColor}
            onChange={setBgColor}
          />
          <ColorField
            label="Foreground Color"
            value={fgColor}
            onChange={setFgColor}
          />
          <Selector
            label="Error Level"
            options={[...ERROR_LEVELS]}
            value={level}
            onChange={(next) => setLevel(next as ErrorCorrectionLevel)}
          />
          <Slider
            label="Minimum Version"
            value={minVersion}
            onChange={setMinVersion}
            min={1}
            max={40}
            valueDisplay="text"
          />
          <Switch
            label="Boost Level"
            value={boostLevel}
            onChange={setBoostLevel}
          />
          <NumberInput
            label="Margin Size"
            value={marginSize}
            onChange={setMarginSize}
            min={0}
            isIntegerOnly
            isWheelEnabled={false}
          />
          <TextArea label="Value" value={value} onChange={setValue} rows={6} />
          <TextInput label="Title" value={title} onChange={setTitle} />
          <Switch
            label="Include Image"
            value={includeImage}
            onChange={setIncludeImage}
          />
          <Heading level={3}>Image Settings</Heading>
          <TextInput
            label="Image source"
            value={imageSrc}
            onChange={setImageSrc}
            isDisabled={imageControlsDisabled}
          />
          <NumberInput
            label="Image Width"
            value={imageW}
            onChange={setImageW}
            isIntegerOnly
            isDisabled={imageControlsDisabled}
            isWheelEnabled={false}
          />
          <NumberInput
            label="Image Height"
            value={imageH}
            onChange={setImageH}
            isIntegerOnly
            isDisabled={imageControlsDisabled}
            isWheelEnabled={false}
          />
          <NumberInput
            label="Image Opacity"
            value={imageOpacity}
            onChange={setImageOpacity}
            min={0}
            max={1}
            step={0.1}
            isDisabled={imageControlsDisabled}
            isWheelEnabled={false}
          />
          <Switch
            label="Center Image"
            value={centerImage}
            onChange={setCenterImage}
            isDisabled={imageControlsDisabled}
          />
          <Slider
            label="Image X"
            value={imageX}
            onChange={setImageX}
            min={0}
            max={Math.max(0, size - imageW)}
            isDisabled={imagePositionDisabled}
            valueDisplay="text"
          />
          <Slider
            label="Image Y"
            value={imageY}
            onChange={setImageY}
            min={0}
            max={Math.max(0, size - imageH)}
            isDisabled={imagePositionDisabled}
            valueDisplay="text"
          />
          <Switch
            label="Excavate"
            description="Dig foreground to nearest whole module"
            value={imageExcavate}
            onChange={setImageExcavate}
            isDisabled={imageControlsDisabled}
          />
        </FormLayout>
      }
      content={
        <Grid columns={{minWidth: 280}} gap={4}>
          <QrPreview title="QRCodeSVG" code={svgCode}>
            <QRCodeSVG {...renderProps} />
          </QrPreview>
          <QrPreview title="QRCodeCanvas" code={canvasCode}>
            <QRCodeCanvas {...renderProps} />
          </QrPreview>
        </Grid>
      }
    />
  );
}

export {FullDemo};
