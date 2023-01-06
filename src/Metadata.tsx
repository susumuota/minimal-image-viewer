import type { ImageMetadataType } from "./shared";

function Metadata({ file, metadata }: { file: string, metadata: ImageMetadataType | undefined }) {
  const text = metadata === undefined || !metadata.width ? `file: ${file}` :
    `file: ${file}\nwidth: ${metadata.width}, height: ${metadata.height}\n${metadata.keyword}: ${metadata.text}`;
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
