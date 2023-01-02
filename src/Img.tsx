function Img({src, alt, tooltip, style}: {src?: string | undefined, alt?: string | undefined, tooltip?: string | JSX.Element | undefined, style?: React.CSSProperties | undefined}) {
  if (tooltip) {
    return (
      <span className="tooltip" style={style}>
        <img alt={alt} src={src} />
        <span className="tooltiptext">{tooltip}</span>
      </span>
    );
  } else {
    return <img alt={alt} src={src} style={style} />
  }
}

export { Img };
