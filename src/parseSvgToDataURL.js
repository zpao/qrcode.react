const parseSvgToDataURL = (svg) => {
  const IMSvgAsXML = new XMLSerializer().serializeToString(svg);
  return `data:image/svg+xml,${encodeURIComponent(IMSvgAsXML)}`;
};

export default parseSvgToDataURL;
