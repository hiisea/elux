import {loadModel, exportView} from '@elux/core';

export default exportView(function () {
  loadModel('moduleB');
  return 'moduleB_views_Main';
});
