# minimal-image-viewer

A minimal image viewer.

## Initial log

- https://www.electronforge.io/#using-templates
- https://www.electronforge.io/templates/typescript-+-webpack-template

```
node -v  # v18.12.1
npm -v   # 8.19.2
npm init electron-app@latest minimal-image-viewer -- --template=webpack-typescript
cd minimal-image-viewer
npm run start
npm run make
open out/minimal-image-viewer-darwin-x64/minimal-image-viewer.app
```

- https://www.electronforge.io/guides/framework-integration/react-with-typescript
- https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis

```
npm install --save react react-dom
npm install --save-dev @types/react @types/react-dom
```

- `tsconfig.json`

Add this to the "compilerOptions" section.

```json
    "jsx": "react-jsx"
```

- `src/index.html`

Add this to the inside of `body`.

```html
    <div id="app" />
```

- `src/app.tsx`

Create a new file `src/app.tsx`.

```tsx
import { createRoot } from 'react-dom/client';

function render() {
  const container = document.getElementById('app');
  const root = createRoot(container);
  root.render(<h2>Hello from React!</h2>);
}

render();
```

- `src/renderer.ts`

Add this to the end of the existing file.

```ts
import './app';
```

Run.

```
npm run start
```

## License

MIT License. See LICENSE file.

## Author

Susumu OTA
