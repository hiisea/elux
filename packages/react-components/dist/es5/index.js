import { setCoreConfig } from '@elux/core';
import AppRender from './App';
import { UseRouter } from './base';
import { LoadComponent, LoadComponentOnError, LoadComponentOnLoading } from './LoadComponent';
setCoreConfig({
  UseRouter: UseRouter,
  AppRender: AppRender,
  LoadComponent: LoadComponent,
  LoadComponentOnError: LoadComponentOnError,
  LoadComponentOnLoading: LoadComponentOnLoading
});
export { setReactComponentsConfig } from './base';
export { EWindow } from './EWindow';
export { DocumentHead } from './DocumentHead';
export { Else } from './Else';
export { Switch } from './Switch';
export { Link } from './Link';