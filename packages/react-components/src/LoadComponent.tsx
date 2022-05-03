import React, {useEffect, useState} from 'react';

import {coreConfig, env, ILoadComponent, injectComponent, isPromise, IStore} from '@elux/core';

export const LoadComponentOnError: Elux.Component<{message: string}> = ({message}: {message: string}) => (
  <div className="g-component-error">{message}</div>
);
export const LoadComponentOnLoading: Elux.Component = () => <div className="g-component-loading">loading...</div>;

export const LoadComponent: ILoadComponent<any> = (moduleName, componentName, options = {}) => {
  const OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading!;
  const OnError = options.onError || coreConfig.LoadComponentOnError!;

  return React.forwardRef((props, ref) => {
    const execute = (curStore?: IStore) => {
      let View: Elux.Component<any> | string = OnLoading;
      try {
        const result = injectComponent(moduleName as string, componentName as string, curStore || store);
        if (isPromise(result)) {
          if (env.isServer) {
            throw 'can not use async component in SSR';
          }
          result.then(
            (view: any) => {
              active && setView(view || 'not found!');
            },
            (e) => {
              env.console.error(e);
              active && setView(e.message || `${e}` || 'error');
            }
          );
        } else {
          View = result as any;
        }
      } catch (e: any) {
        env.console.error(e);
        View = e.message || `${e}` || 'error';
      }
      return View;
    };
    const [active, setActive] = useState(true);
    useEffect(() => {
      return () => {
        setActive(false);
      };
    }, []);
    const newStore = coreConfig.UseStore!();
    const [store, setStore] = useState(newStore);
    const [View, setView] = useState(execute);
    if (store !== newStore) {
      setStore(newStore);
      setView(execute(newStore));
    }
    if (typeof View === 'string') {
      return <OnError message={View} />;
    } else {
      return <View ref={ref} {...props} />;
    }
  }) as any;
};
