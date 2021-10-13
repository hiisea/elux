import {loadModel, exportView} from '@elux/core';
import {router} from '../../../utils';

export default exportView(function () {
  loadModel('moduleA', router.getCurrentStore());
  return 'moduleA_views_Main';
});
