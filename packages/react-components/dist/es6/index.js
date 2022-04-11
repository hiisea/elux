import { setCoreConfig } from '@elux/core';
import { UseRouter } from './base';
import { LoadComponent, LoadComponentOnError, LoadComponentOnLoading } from './LoadComponent';
import AppRender from './App';
setCoreConfig({
  UseRouter,
  AppRender,
  LoadComponent,
  LoadComponentOnError,
  LoadComponentOnLoading
});
export { DocumentHead } from './DocumentHead';
export { Else } from './Else';
export { Switch } from './Switch';
export { Link } from './Link';