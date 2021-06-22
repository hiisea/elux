import {getRootModuleAPI, RootModuleFacade} from '@elux/core';
import * as moduleA from './moduleA';
import * as moduleB from './moduleB';
import * as moduleC from './moduleC';

export const moduleGetter = {
  moduleA() {
    return moduleA;
  },
  moduleB() {
    return moduleB;
  },
  moduleC() {
    return moduleC;
  },
};
type Facade = RootModuleFacade<typeof moduleGetter>;
export const App = getRootModuleAPI<Facade>();
