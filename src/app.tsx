import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
const IMAGE_TYPES = [
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
];

const IMAGE_FILES_REGEXP = new RegExp('^.+.(' + IMAGE_TYPES.join('|') + ')$', 'i');
const isImageFile = (path: string) => path.match(IMAGE_FILES_REGEXP);

// TODO: fancy usage
const USAGE = (
  <pre>
    Minimal Image Viewer<br />
    <br />
    Key bindings (similar as 'less' command)<br />
    <br />
    o, O                                       Open image files or directories.<br />
    r, R                                       Reload directories.<br />
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
);

const showDialog = async () => {
  const title = 'Select image files or directories';
  const paths = await window.api.dialog({
    title: title,
    message: title, // macOS
    filters: [
      { name: 'Images', extensions: IMAGE_TYPES },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile', 'openDirectory', 'multiSelections']
  });
  return paths ?? [];
};

const globImageFiles = async (paths: string[]) => {
  if (!(paths && paths.length > 0 && paths[0])) return [];
  const images = paths.filter(isImageFile);
  const dirs = paths.filter((path) => !images.includes(path));
  console.debug('images === ', images, ', dirs === ', dirs);
  if (!(dirs && dirs.length > 0 && dirs[0])) return images;
  // https://github.com/isaacs/node-glob#glob-primer
  const globs = (await Promise.all(dirs.map((dir) => window.api.glob(dir + '/**/*.@(' + IMAGE_TYPES.join('|') + ')')))).flat();
  console.debug('globs.length === ', globs.length);
  return [...images, ...globs];
};

function App() {
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useState(1);

  const open = () => {
    (async () => {
      const paths = await showDialog();
      setFilePaths(paths);
      const files = await globImageFiles(paths);
      setImageFiles(files);
      setIndex(0);
    })();
  };

  const reload = () => {
    (async () => {
      const files = await globImageFiles(filePaths);
      setImageFiles(files);
    })();
  };

  const restoreSteps = () => {
    (async () => setSteps((await window.api.storeGet('steps')) as number))();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    const isKey = (keys: string[]) => keys.includes(event.key);
    if (isKey(['o', 'O'])) {
      open();
    } else if (isKey(['r', 'R'])) {
      reload();
    } else if (isKey(['q', 'Q'])) {
      window.api.quit();
    } else if (isKey(['F12'])) {
      window.api.devtools();
    } else if (isKey(['f', 'j', 'PageDown', 'ArrowDown', ' ', 'Enter'])) {
      setIndex((index) => index + steps < imageFiles.length ? index + steps : index);
    } else if (isKey(['b', 'k', 'PageUp', 'ArrowUp'])) {
      setIndex((index) => index - steps > 0 ? index - steps : 0);
    } else if (isKey(['g', '<', 'Home'])) {
      setIndex(0);
    } else if (isKey(['G', '>', 'End'])) {
      setIndex(imageFiles.length - steps);
    } else if (isKey(['ArrowRight'])) {
      setSteps((steps) => steps + 1);
    } else if (isKey(['ArrowLeft'])) {
      setSteps((steps) => steps - 1 > 0 ? steps - 1 : 1);
    }
  };

  useEffect(() => {
    open();
    restoreSteps();
  }, []);

  useEffect(() => {
    window.api.storeSet('steps', steps);
  }, [steps]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [steps, imageFiles]);

  console.debug('index === ', index, ', steps === ', steps, 'imageFiles.length === ', imageFiles.length);

  const prevFiles = imageFiles.slice(index - steps, index); // pre fetch
  const currentFiles = imageFiles.slice(index, index + steps);
  const nextFiles = imageFiles.slice(index + steps, index + steps * 2); // pre fetch

  return (
    <div>
      {prevFiles.length > 0 ? prevFiles.map((f) => <img key={f} title={f} alt={f} src={'file://' + f} style={{display: 'none'}} />) : ''}
      {currentFiles.length > 0 ? currentFiles.map((f) => <img key={f} title={f} alt={f} src={'file://' + f} />) : USAGE}
      {nextFiles.length > 0 ? nextFiles.map((f) => <img key={f} title={f} alt={f} src={'file://' + f} style={{display: 'none'}} />) : ''}
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
