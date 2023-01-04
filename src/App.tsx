import { useEffect, useState } from 'react';

import { IMAGE_TYPES, isImageFile, IMAGE_FILES_GLOB_PATTERN, ImageMetadataType } from './shared';
import { useStore } from './useStore';
import { Help } from './Help';
import { Img } from './Img';

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
  const dirs = paths.filter((path) => !images.includes(path));
  console.debug('images === ', images, ', dirs === ', dirs);
  if (!(dirs && dirs.length > 0 && dirs[0])) return images;
  // https://github.com/isaacs/node-glob#glob-primer
  const globs = (await Promise.all(dirs.map((dir) => window.api.glob(dir + IMAGE_FILES_GLOB_PATTERN)))).flat();
  console.debug('globs.length === ', globs.length);
  return [...images, ...globs];
};

function App({platform}: {platform: string}) {
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadataType[]>([]);
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useStore('steps', 1);
  const [isHelp, setIsHelp] = useState(false);
  const [isTooltip, setIsTooltip] = useStore('isTooltip', false);

  const open = () => {
    (async () => {
      setIndex(0);
      setIsHelp(false);
      const paths = await showDialog();
      setFilePaths(paths);
      const files = await globImageFiles(paths);
      setImageFiles(files);
      const metadata = await window.api.getImageMetadata(files);
      console.debug('metadata.length === ', metadata.length);
      setImageMetadata(metadata);
    })();
  };

  useEffect(() => {
    open();
  }, []);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const isKey = (keys: string[]) => keys.includes(event.key);
      if (isKey(['o', 'O'])) {
        open();
      } else if (isKey(['r', 'R'])) {
        (async () => {
          setIsHelp(false);
          const files = await globImageFiles(filePaths);
          setImageFiles(files);
          const metadata = await window.api.getImageMetadata(files);
          console.debug('metadata.length === ', metadata.length);
          setImageMetadata(metadata);
        })();
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
  }, [filePaths, imageFiles, steps, isHelp, isTooltip]);

  if (isHelp) return <Help platform={platform} />;

  const prevFiles = imageFiles.slice(index - steps, index); // preload
  const currentFiles = imageFiles.slice(index, index + steps);
  const nextFiles = imageFiles.slice(index + steps, index + steps * 2); // preload
  const metadata = imageMetadata.slice(index, index + steps);

  if (!(currentFiles && currentFiles.length > 0 && currentFiles[0])) {
    return <Help platform={platform} />;
  }

  // TODO: make a component?
  const tooltips = metadata.map(m => (
    <div>
      <div>width: {m.width}, height: {m.height}</div>
      <div>{m.keyword}:</div>
      <div>
        {m.text.split('\n').map((t, j) => <span key={j}>{t}<br /></span>)}
      </div>
    </div>
  ));

  return (
    <div>
      {prevFiles.map((f) => <Img key={f} src={'file://' + f} alt={f} style={{display: 'none'}} />)}
      {currentFiles.map((f, i) => <Img key={f} src={'file://' + f} alt={f} tooltip={isTooltip ? (tooltips[i] ?? f) : undefined} />)}
      {nextFiles.map((f) => <Img key={f} src={'file://' + f} alt={f} style={{display: 'none'}} />)}
    </div>
  );
}

export { App };
