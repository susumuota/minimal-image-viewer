import { useEffect, useState } from 'react';

import { IMAGE_TYPES, isImageFile, IMAGE_FILES_GLOB_PATTERN, ImageMetadataType } from './shared';
import { useStore } from './useStore';
import { Help } from './Help';
import { Metadata } from './Metadata';
import { Tooltip } from './Tooltip';

const showDialog = () => {
  const title = 'Select image directories';
  return window.api.dialog({
    title: title,
    message: title, // macOS
    filters: [
      { name: 'Images', extensions: IMAGE_TYPES },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile', 'openDirectory', 'multiSelections']
  });
};

const globImageFiles = async (paths: string[]) => {
  if (!(paths && paths.length > 0 && paths[0])) return [];
  const images = paths.filter(isImageFile);
  const dirs = paths.filter(path => !images.includes(path));
  console.debug('images === ', images, ', dirs === ', dirs);
  if (!(dirs && dirs.length > 0 && dirs[0])) return images;
  const globs = (await Promise.all(dirs.map(dir => window.api.glob(dir + IMAGE_FILES_GLOB_PATTERN)))).flat();
  console.debug('globs.length === ', globs.length);
  return [...images, ...globs];
};

const safeSlice = <T,>(array: Array<T>, start: number, end: number) => {
  const s = start !== undefined && start < 0 ? 0 : start;
  const e = end !== undefined && end > array.length ? array.length : end;
  return array.slice(s, e);
};

const updateMetadata = async (imageFiles: string[], imageMetadata: Map<string, ImageMetadataType>, index: number, steps: number) => {
  const files = safeSlice(imageFiles, index - steps, index + steps * 2).filter(file => !imageMetadata.has(file));
  if (!(files && files.length > 0 && files[0])) return imageMetadata;
  const metadata = await Promise.all(files.map(file => window.api.getImageMetadata(file)))
  console.debug('metadata.length === ', metadata.length);
  // needs to copy Map, see https://medium.com/swlh/using-es6-map-with-react-state-hooks-800b91eedd5f
  const copy = new Map(imageMetadata);
  files.forEach((f, i) => copy.set(f, metadata[i] ?? { width: 0, height: 0, keyword: '', text: '' }));
  // TODO: limit the Map size?
  return copy;
};

function App({ platform }: { platform: string }) {
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [imageMetadata, setImageMetadata] = useState<Map<string, ImageMetadataType>>(new Map());
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useStore('steps', 1);
  const [isHelp, setIsHelp] = useState(false);
  const [isTooltip, setIsTooltip] = useStore('isTooltip', false);

  // show dialog just after startup
  useEffect(() => {
    (async () => {
      const paths = await showDialog();
      if (paths && paths.length > 0 && paths[0]) setFilePaths(paths);
    })();
  }, []);

  // glob files after user choose directories
  useEffect(() => {
    (async () => setImageFiles(await globImageFiles(filePaths)))();
  }, [filePaths]);

  // get image metadata every time user move the page
  useEffect(() => {
    if (isTooltip) (async () => setImageMetadata(await updateMetadata(imageFiles, imageMetadata, index, steps)))();
  }, [imageFiles, index, steps, isTooltip]);

  // update key event listener every time user change settings
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const isKey = (keys: string[]) => keys.includes(event.key);
      if (isKey(['o', 'O'])) {
        (async () => {
          const paths = await showDialog();
          if (paths && paths.length > 0 && paths[0]) {
            setIndex(0);
            setIsHelp(false);
            setImageMetadata(new Map());
            setFilePaths(paths);
          }
        })();
      } else if (isKey(['r', 'R'])) {
        setIsHelp(false);
        setImageMetadata(new Map());
        (async () => setImageFiles(await globImageFiles(filePaths)))();
      } else if (isKey(['h', 'H'])) {
        setIsHelp((isHelp) => !isHelp);
      } else if (isKey(['i', 'I'])) {
        setIsTooltip((isTooltip) => !isTooltip);
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
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [filePaths, imageFiles, steps]);

  if (isHelp) return <Help platform={platform} />;

  const prevFiles = safeSlice(imageFiles, index - steps, index);
  const currentFiles = safeSlice(imageFiles, index, index + steps);
  const nextFiles = safeSlice(imageFiles, index + steps, index + steps * 2);

  if (!(currentFiles && currentFiles.length > 0 && currentFiles[0])) {
    return <Help platform={platform} />;
  }

  return (
    <div>
      {prevFiles.map(file => <img key={file} src={'file://' + file} alt={file} style={{ display: 'none' }} />)}
      {currentFiles.map(file => (
        !isTooltip ? (
          <img key={file} src={'file://' + file} alt={file} />
        ) : (
          <Tooltip key={file} text={imageMetadata.has(file) ? <Metadata metadata={imageMetadata.get(file)} /> : file}>
            <img key={file} src={'file://' + file} alt={file} />
          </Tooltip>
        )))}
      {nextFiles.map(file => <img key={file} src={'file://' + file} alt={file} style={{ display: 'none' }} />)}
    </div>
  );
}

export { App };
