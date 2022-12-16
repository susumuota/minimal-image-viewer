# minimal-image-viewer

A minimal image viewer.

## Initial log

### Create an Electron project with webpack and typescript

- https://www.electronforge.io/#using-templates
- https://www.electronforge.io/templates/typescript-+-webpack-template

```sh
node -v  # v18.12.1
npm -v   # 8.19.2
npm init electron-app@latest minimal-image-viewer -- --template=webpack-typescript
cd minimal-image-viewer
npm run start
npm run make
open out/minimal-image-viewer-darwin-x64/minimal-image-viewer.app
```

### Add React

- https://www.electronforge.io/guides/framework-integration/react-with-typescript
- https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis

```sh
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

```sh
npm run start
```

Commit. No need to run `git init`.

```sh
git status
git add [all of the files above]
git commit -m "initial commit."
```

Go to https://github.com/ and create a new repository `minimal-image-viewer`.

```sh
git remote add origin git@github.com:susumuota/minimal-image-viewer.git
git branch -M main
git push -u origin main
```

### Add GitHub publishers

- https://www.electronforge.io/config/publishers/github
- https://js.electronforge.io/interfaces/_electron_forge_publisher_github.PublisherGitHubConfig.html
- https://github.com/electron/forge/blob/main/packages/publisher/github/src/PublisherGithub.ts
- https://github.com/electron/forge/blob/main/packages/publisher/github/src/Config.ts

```sh
npm install --save-dev @electron-forge/publisher-github
```

- `force.config.ts`

Add this after `plugins`.

```ts
  publishers: [
    new PublisherGithub({
      repository: {
        name: 'minimal-image-viewer',
        owner: 'susumuota',
      },
    }),
  ],
```

## License

MIT License. See LICENSE file.

## Author

Susumu OTA
