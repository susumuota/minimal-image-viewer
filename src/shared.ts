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

// eslint-disable-next-line no-useless-escape
const IMAGE_FILES_REGEXP = new RegExp('^.+\.(' + IMAGE_TYPES.join('|') + ')$', 'i');
const isImageFile = (path: string) => path.match(IMAGE_FILES_REGEXP);
// https://github.com/isaacs/node-glob#glob-primer
const IMAGE_FILES_GLOB_PATTERN = '/**/*.@(' + IMAGE_TYPES.join('|') + ')';

type ImageMetadataType = {
  width: number,
  height: number,
  keyword: string,
  text: string,
};

export { IMAGE_TYPES, isImageFile, IMAGE_FILES_GLOB_PATTERN, ImageMetadataType };
