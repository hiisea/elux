import build from '../../rollup.build';
const config = build(__dirname, undefined, {'regenerator-runtime': require.resolve('regenerator-runtime')});
export default config;
