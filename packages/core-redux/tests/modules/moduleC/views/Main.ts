import {loadModel, exportView} from '@elux/core';

export default exportView(function () {
  loadModel('moduleC');
  return 'moduleC_views_Main';
});
