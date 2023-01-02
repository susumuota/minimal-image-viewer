import { createRoot } from 'react-dom/client';

import './index.css';
import { App } from './App';

window.addEventListener('load', async () => {
  const container = document.getElementById('app');
  if (container) {
    const root = createRoot(container);
    root.render(<App platform={await window.api.platform()} />);
  }
});
