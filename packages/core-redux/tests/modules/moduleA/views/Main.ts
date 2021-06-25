import {loadModel, defineComponent} from '@elux/core';

export default defineComponent(function () {
  loadModel('moduleA');
  return 'moduleA_views_Main';
}, 'view');
