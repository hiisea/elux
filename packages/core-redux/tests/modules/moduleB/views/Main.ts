import {loadModel, defineComponent} from '@elux/core';

export default defineComponent(function () {
  loadModel('moduleB');
  return 'moduleB_views_Main';
}, 'view');
