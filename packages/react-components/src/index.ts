import {setCoreConfig} from '@elux/core';
import {UseRouter} from './base';
import {LoadComponent, LoadComponentOnError, LoadComponentOnLoading} from './LoadComponent';
import AppRender from './App';

setCoreConfig({
  UseRouter,
  AppRender,
  LoadComponent,
  LoadComponentOnError,
  LoadComponentOnLoading,
});

export {DocumentHead} from './DocumentHead';
export {Else} from './Else';
export {Switch} from './Switch';
export {Link} from './Link';
export type {DocumentHeadProps} from './DocumentHead';
export type {ElseProps} from './Else';
export type {SwitchProps} from './Switch';
export type {LinkProps} from './Link';
