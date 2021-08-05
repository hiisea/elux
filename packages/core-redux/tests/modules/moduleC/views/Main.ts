import {loadModel, exportView} from '@elux/core';
import {router} from '../../../utils';

export default exportView(function () {
  loadModel('moduleC', router.getCurrentStore());
  return 'moduleC_views_Main';
});
