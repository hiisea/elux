import build from '../../rollup.build';

const config = build(__dirname, 'ReactWeb', {
  react: 'React',
  'react-dom': 'ReactDOM',
});

export default config;
