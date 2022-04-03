import {reactive} from 'vue';
import {setCoreConfig} from '@elux/core';
import {UseRouter, UseStore} from './base';
import {LoadComponent, LoadComponentOnError, LoadComponentOnLoading} from './LoadComponent';
import AppRender from './App';

setCoreConfig({
  MutableData: true,
  StoreInitState: () => reactive({}),
  UseStore,
  UseRouter,
  AppRender,
  LoadComponent,
  LoadComponentOnError,
  LoadComponentOnLoading,
});

export {RouterComponent} from './Router';
export {DocumentHead} from './DocumentHead';
export {Switch} from './Switch';
export {Else} from './Else';
export {Link} from './Link';
export type {DocumentHeadProps} from './DocumentHead';
export type {ElseProps} from './Else';
export type {SwitchProps} from './Switch';
export type {LinkProps} from './Link';
