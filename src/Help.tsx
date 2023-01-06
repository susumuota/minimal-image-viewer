// TODO: fancy usage
function Help({ platform }: { platform: string }) {
  return (
    <pre>
      Minimal Image Viewer<br />
      <br />
      Key bindings (similar as 'less' command)<br />
      <br />
      o, O                                       Open image files or directories.<br />
      r, R                                       Reload directories.<br />
      h, H                                       Toggle this help.<br />
      i, I                                       Toggle showing metadata as a tooltip.<br />
      q, Q                                       Quit.<br />
      f, j, PageDown, ArrowDown, Space, Enter    Move forward one page.<br />
      b, k, PageUp, ArrowUp                      Move backward one page.<br />
      g, &lt;, Home                                 Go to first page.<br />
      G, &gt;, End                                  Go to last page.<br />
      ArrowRight                                 Increase the number of images per page.<br />
      ArrowLeft                                  Reduce the number of images per page.<br />
      {platform === 'darwin' ? '⌘+       ' : 'Ctrl and +'}                                 Zoom in.<br />
      {platform === 'darwin' ? '⌘-       ' : 'Ctrl and -'}                                 Zoom out.<br />
      {platform === 'darwin' ? '⌘0       ' : 'Ctrl and 0'}                                 Actual size.<br />
      F12                                        Open DevTools.<br />
    </pre>
  );
}

export { Help };
