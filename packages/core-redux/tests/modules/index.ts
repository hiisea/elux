/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {getRootModuleAPI, RootModuleFacade} from '@elux/core';
import moduleA from './moduleA';
import moduleB from './moduleB';
import moduleC from './moduleC';

export const moduleGetter = {
  moduleA: () => moduleA,
  moduleB: () => moduleB,
  moduleC: () => moduleC,
};
type Facade = RootModuleFacade<typeof moduleGetter>;
export const App = getRootModuleAPI<Facade>();
