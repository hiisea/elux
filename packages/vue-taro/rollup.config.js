import build from '../../rollup.build';
//const config = build(__dirname, undefined, {'regenerator-runtime': require.resolve('./libs/regenerator-runtime')});
const config = build(__dirname);
export default config;
