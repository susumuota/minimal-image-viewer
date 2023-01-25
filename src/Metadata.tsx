import type { ImageMetadataType } from "./shared";

function Metadata({ file, metadata }: { file: string, metadata: ImageMetadataType | undefined }) {
  const text = metadata === undefined ? `File: ${file}` :
    (metadata.text ? metadata.text :
      `File: ${file}` + (metadata.width ? `\nSize: ${metadata.width}x${metadata.height}` : ''));
  return (
    <div>
      <div>{text.split('\n').map((t, j) => <span key={j}>{t}<br /></span>)}</div>
      <div className="button" onClick={() => {navigator.clipboard.writeText(text)}}>
        Copy to Clipboard
      </div>
    </div>
  );
}

export { Metadata };
