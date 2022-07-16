import {coreConfig, env, ILoadComponent, injectComponent, isPromise, VStore} from '@elux/core';
import {forwardRef, useEffect, useRef, useState} from 'react';

export const LoadComponentOnError: Elux.Component<{message: string}> = ({message}: {message: string}) => (
  <div className="g-component-error">{message}</div>
);
export const LoadComponentOnLoading: Elux.Component = () => <div className="g-component-loading">loading...</div>;

export const LoadComponent: ILoadComponent<any> = (moduleName, componentName, options = {}) => {
  const OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading!;
  const OnError = options.onError || coreConfig.LoadComponentOnError!;

  const Component = forwardRef((props, ref) => {
    const execute = (curStore?: VStore) => {
      let SyncView: Elux.Component<any> | string = OnLoading;
      try {
        const result = injectComponent(moduleName as string, componentName as string, curStore || store);
        if (isPromise(result)) {
          if (env.isServer) {
            throw 'can not use async component in SSR';
          }
          result.then(
            (view: any) => {
              activeRef.current && setView(view || 'not found!');
            },
            (e) => {
              env.console.error(e);
              activeRef.current && setView(e.message || `${e}` || 'error');
            }
          );
        } else {
          SyncView = result as any;
        }
      } catch (e: any) {
        env.console.error(e);
        SyncView = e.message || `${e}` || 'error';
      }
      return SyncView;
    };
    const activeRef = useRef(true);
    useEffect(() => {
      return () => {
        activeRef.current = false;
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
    } else if (View === OnLoading) {
      return <OnLoading />;
    } else {
      return <View ref={ref} {...props} />;
    }
  });

  Component.displayName = 'EluxComponentLoader';

  return Component;
};
