import {loadModel, defineComponent} from '@elux/core';

export default defineComponent(function () {
  loadModel('moduleC');
  return 'moduleC_views_Main';
}, 'view');
