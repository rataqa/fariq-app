import { createContext, FC, PropsWithChildren } from 'react';

import { IApi, makeApi } from '../api';

const api = makeApi();
export const ApiContext = createContext<IApi>(api);

export const ApiProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};
