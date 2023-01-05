function Tooltip({ text, style, children }: { text?: React.ReactNode, style?: React.CSSProperties | undefined, children?: React.ReactNode }) {
  return (
    <span className="tooltip" style={style}>
      <span className="tooltiptext">{text}</span>
      <span>
        {children}
      </span>
    </span>
  );
}

export { Tooltip };
