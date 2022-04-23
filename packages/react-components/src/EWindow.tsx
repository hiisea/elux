import React, {memo} from 'react';

import {coreConfig, getEntryComponent, IStore} from '@elux/core';

export const EWindow: React.FC<{store: IStore}> = memo(function ({store}) {
  const AppView: Elux.Component = getEntryComponent() as any;
  const StoreProvider = coreConfig.StoreProvider!;
  return (
    <StoreProvider store={store}>
      <AppView />
    </StoreProvider>
  );
});
