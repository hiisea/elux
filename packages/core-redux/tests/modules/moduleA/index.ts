import {exportModule} from '@elux/core';
import {ModuleHandlers} from './model';

import Main from './views/Main';

export default exportModule('moduleA', ModuleHandlers, {}, {Main});
