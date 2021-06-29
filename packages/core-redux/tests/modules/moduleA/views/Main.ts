import {loadModel, exportView} from '@elux/core';

export default exportView(function () {
  loadModel('moduleA');
  return 'moduleA_views_Main';
});
