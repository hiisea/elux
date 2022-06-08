import {coreConfig, getEntryComponent, IStore} from '@elux/core';
import {FC, memo} from 'react';

const Component: FC<{store: IStore}> = function ({store}) {
  const AppView: Elux.Component = getEntryComponent() as any;
  const StoreProvider = coreConfig.StoreProvider!;
  return (
    <StoreProvider store={store}>
      <AppView />
    </StoreProvider>
  );
};

Component.displayName = 'EluxWindow';

export const EWindow = memo(Component);
