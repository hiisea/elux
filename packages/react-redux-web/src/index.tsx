import React, {ComponentType, ReactElement} from 'react';
import {Provider} from '@elux/react-redux';
import {IStore, setConfig} from '@elux/react-web';

const appViewBuilder: (View: ComponentType<any>, store: IStore) => ReactElement = (View, store) => {
  return (
    <Provider store={store as any}>
      <View />
    </Provider>
  );
};

setConfig({appViewBuilder});

export * from '@elux/react-web';
export * from '@elux/react-redux';
