import {loadModel, exportView} from '@elux/core';
import {router} from '../../../utils';
export default exportView(function () {
  loadModel('moduleB', router.getCurrentStore());
  return 'moduleB_views_Main';
});
