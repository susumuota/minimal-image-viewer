import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
const IMAGE_EXTS = [
  'apng',
  'avif',
  'gif',
  'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp',
  'png',
  'svg',
  'webp',
  'bmp',
  'ico', 'cur',
  'tif', 'tiff',
]

// TODO: fancy usage
const USAGE = (
  <div>
    <pre>
      Minimal Image Viewer<br />
      <br />
      Key bindings (similar as 'less' command)<br />
      <br />
      o, O                                       Open image files or directories.<br />
      q, Q                                       Quit.<br />
      f, j, PageDown, ArrowDown, Space, Enter    Move forward one page.<br />
      b, k, PageUp, ArrowUp                      Move backward one page.<br />
      g, &lt;, Home                                 Go to first page.<br />
      G, &gt;, End                                  Go to last page.<br />
      ArrowRight                                 Increase the number of images per page.<br />
      ArrowLeft                                  Reduce the number of images per page.<br />
      ⌘+                                         Zoom in.<br />
      ⌘-                                         Zoom out.<br />
      ⌘0                                         Actual size.<br />
      F12                                        Open DevTools.<br />
    </pre>
  </div>
);

const getImageFiles = async () => {
  const title = 'Select image files or directories';
  const paths = await window.api.dialog({
    title: title,
    message: title, // macOS
    filters: [
      { name: 'Images', extensions: IMAGE_EXTS },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile', 'openDirectory', 'multiSelections']
  });
  if (!(paths && paths.length > 0 && paths[0])) return [];
  const images = paths.filter((path) => IMAGE_EXTS.find((ext: string) => path.toLowerCase().endsWith('.' + ext)));
  const dirs = paths.filter((path) => !images.includes(path));
  if (!(dirs && dirs.length > 0 && dirs[0])) return images;
  // https://github.com/isaacs/node-glob#glob-primer
  const globs = (await Promise.all(dirs.map((dir) => window.api.glob(dir + '/**/*.@(' + IMAGE_EXTS.join('|') + ')')))).flat();
  return [...images, ...globs];
};

function App() {
  const [files, setFiles] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useState(1);

  const openDialog = () => {
    (async () => {
      setFiles(await getImageFiles());
      setIndex(0);
    })();
  };

  const restoreSteps = () => {
    (async () => setSteps((await window.api.storeGet('steps')) as number))();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    const isKey = (keys: string[]) => keys.includes(event.key);
    if (isKey(['o', 'O'])) {
      openDialog();
    } else if (isKey(['q', 'Q'])) {
      window.api.quit();
    } else if (isKey(['F12'])) {
      window.api.devtools();
    } else if (isKey(['f', 'j', 'PageDown', 'ArrowDown', ' ', 'Enter'])) {
      setIndex((index) => index + steps < files.length ? index + steps : index);
    } else if (isKey(['b', 'k', 'PageUp', 'ArrowUp'])) {
      setIndex((index) => index - steps > 0 ? index - steps : 0);
    } else if (isKey(['g', '<', 'Home'])) {
      setIndex(0);
    } else if (isKey(['G', '>', 'End'])) {
      setIndex(files.length - steps);
    } else if (isKey(['ArrowRight'])) {
      setSteps((steps) => steps + 1);
    } else if (isKey(['ArrowLeft'])) {
      setSteps((steps) => steps - 1 > 0 ? steps - 1 : 1);
    }
  };

  useEffect(() => {
    openDialog();
    restoreSteps();
  }, []);

  useEffect(() => {
    window.api.storeSet('steps', steps);
  }, [steps]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [steps, files]);

  console.debug('index === ', index, ', steps === ', steps, 'files.length === ', files.length);

  const prevFiles = files.slice(index - steps, index); // pre fetch
  const currentFiles = files.slice(index, index + steps);
  const nextFiles = files.slice(index + steps, index + steps * 2); // pre fetch

  return (
    <div>
      { prevFiles.length > 0 ? prevFiles.map((file) => <img style={{display: 'none'}} key={file} src={'file://' + file} />) : '' }
      { currentFiles.length > 0 ? currentFiles.map((file) => <img key={file} src={'file://' + file} />) : USAGE }
      { nextFiles.length > 0 ? nextFiles.map((file) => <img style={{display: 'none'}} key={file} src={'file://' + file} />) : '' }
    </div>
  );
}

window.addEventListener('load', () => {
  const container = document.getElementById('app');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
});
