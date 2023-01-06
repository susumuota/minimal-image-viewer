# minimal-image-viewer

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/susumuota/minimal-image-viewer)](https://github.com/susumuota/minimal-image-viewer/releases)
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/susumuota/minimal-image-viewer)](https://github.com/susumuota/minimal-image-viewer)
[![GitHub](https://img.shields.io/github/license/susumuota/minimal-image-viewer)](https://github.com/susumuota/minimal-image-viewer/blob/main/LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/susumuota/minimal-image-viewer/build.yaml)](https://github.com/susumuota/minimal-image-viewer/actions/workflows/build.yaml)
[![GitHub last commit](https://img.shields.io/github/last-commit/susumuota/minimal-image-viewer)](https://github.com/susumuota/minimal-image-viewer/commits)

A minimal image viewer Desktop app for macOS, Windows and Linux.

- minimal and simple code based on [Electron Forge](https://www.electronforge.io/)
- pager-like key bindings (e.g. `space` key to move forward one page, `b` key to move backward one page)
- pre-loading images to improve performance
- macOS, Windows and Linux binaries are available

## Download

- https://github.com/susumuota/minimal-image-viewer/releases

## Usage

```
Key bindings (similar as 'less' command)

o, O                                       Open image files or directories.
r, R                                       Reload directories.
h, H                                       Toggle this help.
i, I                                       Toggle showing metadata as a tooltip.
q, Q                                       Quit.
f, j, PageDown, ArrowDown, Space, Enter    Move forward one page.
b, k, PageUp, ArrowUp                      Move backward one page.
g, <, Home                                 Go to first page.
G, >, End                                  Go to last page.
ArrowRight                                 Increase the number of images per page.
ArrowLeft                                  Reduce the number of images per page.
⌘+, Ctrl and +                             Zoom in.
⌘-, Ctrl and -                             Zoom out.
⌘0, Ctrl and 0                             Actual size.
F12                                        Open DevTools.
```

## Source code

- https://github.com/susumuota/minimal-image-viewer

## TODO

- [x] Windows binary
- [x] Linux binary
- [x] show PNG information (tEXt chunk)
- [ ] improve app startup time (V8 snapshots?)
- [ ] watch directory change (chokidar?)

## For developers

Here's an initial log to create an Electron app with Webpack, TypeScript, React and GitHub.

### Create a new Electron project with Webpack and Typescript

- https://www.electronforge.io/#using-templates
- https://www.electronforge.io/templates/typescript-+-webpack-template

```sh
node -v  # v18.12.1
npm -v   # 8.19.2
npm init electron-app@latest minimal-image-viewer -- --template=webpack-typescript
cd minimal-image-viewer
```

Test it.

```sh
npm run start
npm run make
open out/minimal-image-viewer-darwin-x64/minimal-image-viewer.app
```

OK.

### Update TypeScript

TypeScript is a bit outdated so renew it.

```sh
npm outdated
npm install --save-dev typescript@latest
```

Also, `tsconfig.json` looks a bit old so renew it.

Based on [Node LTS + ESM + Strictest](https://github.com/tsconfig/bases#node-lts--esm--strictest-tsconfigjson) settings,

```sh
npm install --save-dev @tsconfig/node-lts-strictest-esm
rm tsconfig.json
```

Create a new `tsconfig.json` file. Add `dom` (for `window`) and `react-jsx` (for `jsx`).

- `tsconfig.json`

```json
{
  "extends": "@tsconfig/node-lts-strictest-esm/tsconfig.json",
  "compilerOptions": {
    "lib": [
      "es2022",
      "dom",
    ],
    "module": "commonjs",
    "jsx": "react-jsx",
  },
}
```

Confirm settings.

```sh
npx tsc --showConfig
```

Test it again.

```sh
npm run start
```

OK.

### Add React

- https://www.electronforge.io/guides/framework-integration/react-with-typescript
- https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis

Install React.

```sh
npm install --save react react-dom
npm install --save-dev @types/react @types/react-dom
```

Add some template files.

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
  if (container) {
    const root = createRoot(container);
    root.render(<h2>Hello from React!</h2>);
  }
}

render();
```

- `src/renderer.ts`

Add this to the end of the existing file.

```ts
import './app';
```

Test it.

```sh
npm run start
```

OK.

### Choose License and create README.md

- https://choosealicense.com/

```sh
touch LICENSE     # create a file and copy license text from site. e.g. https://choosealicense.com/licenses/mit/
touch README.md   # also create a README file
```

Don't forget to change `license` field on `package.json`.

- `package.json`

```json
  "license": "MIT",
```

### Create a GitHub repository

Commit. No need to run `git init`.

```sh
git status
git add --all
git status
git commit -m "initial commit."
```

Go to https://github.com/ and create a new repository `minimal-image-viewer`.

```sh
git remote add origin git@github.com:susumuota/minimal-image-viewer.git
git branch -M main
git push -u origin main
```

### Add GitHub publisher

- https://www.electronforge.io/config/publishers/github
- https://js.electronforge.io/interfaces/_electron_forge_publisher_github.PublisherGitHubConfig.html
- https://github.com/electron/forge/blob/main/packages/publisher/github/src/PublisherGithub.ts
- https://github.com/electron/forge/blob/main/packages/publisher/github/src/Config.ts

```sh
npm install --save-dev @electron-forge/publisher-github
```

- `force.config.ts`

Add this import.

```ts
import { PublisherGithub } from '@electron-forge/publisher-github';
```

Add this after `plugins`.

```ts
  publishers: [
    new PublisherGithub({
      repository: {
        name: 'minimal-image-viewer',
        owner: 'susumuota',
      },
      prerelease: true,
      draft: true,
    }),
  ],
```

Create a github token.

**You can skip this token generation if you only use GitHub Actions to publish binaries**

- https://github.com/settings/personal-access-tokens/new
- https://docs.github.com/en/rest/overview/permissions-required-for-fine-grained-personal-access-tokens
- https://docs.github.com/en/rest/releases/releases#create-a-release

Go to https://github.com/settings/personal-access-tokens/new

- Token name: `publish minimal-image-viewer`
- Description: `A token to publish minimal-image-viewer.`
- Repository access
  - `Only select repositories`
    - `Select repositories`
      - `susumuota/minimal-image-viewer`
- Permissions
  - `Repository permissions`
    - Contents
      - `Read and write`
- `Generate token`

Copy the token to `~/.zshrc`.

```sh
export GITHUB_TOKEN="(secret info)"
```

Reopen terminal or `exec $SHELL`.

Publish.

```sh
npm run publish
```

It might take a few minutes.

Go to https://github.com/susumuota/minimal-image-viewer/releases

Click `Assets` and download `minimal-image-viewer-darwin-x64-1.0.0.zip`.

Unzip.

Right click `minimal-image-viewer.app` and `Open`.

OK.

### Setup GitHub Actions to build binaries for macOS, Windows and Linux

- https://dev.to/erikhofer/build-and-publish-a-multi-platform-electron-app-on-github-3lnd

Create a `build.yaml` to automatically build binaries on push to the main branch and pull requests.

- `.github/workflows/build.yaml`

```yaml
name: Build

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18.12.1
    - run: npm ci
    - run: npm run make
```

Test it.

```sh
git add ...
git commit ...
git push origin main
```

Create a `release.yaml` to automatically build binaries on push tags (e.g. `v1.0.0`).

- `.github/workflows/release.yaml`

```yaml
name: Release

on:
  push:
    tags:
      - v[0-9]+.[0-9]+.[0-9]+

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18.12.1
    - run: npm ci
    - run: npm run publish
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Test it.

```sh
git tag v1.0.0
git push origin v1.0.0
```

Go to https://github.com/susumuota/minimal-image-viewer/releases

Download and test packages.

Done.

## License

MIT License. See LICENSE file.

## Author

Susumu OTA
