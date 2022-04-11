import { setCoreConfig } from '@elux/core';
import { UseRouter } from './base';
import { LoadComponent, LoadComponentOnError, LoadComponentOnLoading } from './LoadComponent';
import AppRender from './App';
setCoreConfig({
  UseRouter: UseRouter,
  AppRender: AppRender,
  LoadComponent: LoadComponent,
  LoadComponentOnError: LoadComponentOnError,
  LoadComponentOnLoading: LoadComponentOnLoading
});
export { DocumentHead } from './DocumentHead';
export { Else } from './Else';
export { Switch } from './Switch';
export { Link } from './Link';