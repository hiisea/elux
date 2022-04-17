import React, {memo} from 'react';

import {coreConfig, getEntryComponent, IStore} from '@elux/core';

/**
 * 虚拟窗口
 *
 * @public
 */
export const EWindow: React.FC<{store: IStore | undefined}> = memo(function ({store}) {
  const AppView: Elux.Component = getEntryComponent() as any;
  const StoreProvider = coreConfig.StoreProvider!;
  if (store) {
    return (
      <StoreProvider store={store}>
        <AppView />
      </StoreProvider>
    );
  } else {
    return <div className="g-page-loading">Loading...</div>;
  }
});
