import { useEffect, useState } from 'react';

const useStore = <T,>(key: string, initialState: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    (async () => {
      const s = await window.api.getStore(key);
      if (s !== undefined) setState(s as T);
    })();
  }, []);

  useEffect(() => {
    if (state !== undefined) window.api.setStore(key, state);
  }, [state]);

  return [state, setState];
};

export { useStore };
