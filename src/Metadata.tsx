import type { ImageMetadataType } from "./shared";

function Metadata({ metadata }: { metadata: ImageMetadataType | undefined }) {
  if (!metadata) return null;
  const text = `width: ${metadata.width}, height: ${metadata.height}\n${metadata.keyword}: ${metadata.text}`;
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
