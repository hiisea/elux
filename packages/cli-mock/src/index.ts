import path from 'path';
import {spawn} from 'child_process';
import {fs, deepExtend} from '@elux/cli-utils';

interface MockServerPreset {
  port: number;
}
interface EluxConfig {
  dir: {
    mockPath: string;
    envPath: string;
  };
  mockServer: MockServerPreset;
}

function genMockConfig(
  rootPath: string,
  projEnv: string,
  port?: number,
  mockPath?: string
): {
  port: number;
  dir: string;
} {
  const baseEluxConfig: Partial<EluxConfig> = fs.existsSync(path.join(rootPath, 'elux.config.js'))
    ? require(path.join(rootPath, 'elux.config.js'))
    : {};
  const envPath = baseEluxConfig.dir?.envPath || './env';
  const projEnvPath = path.resolve(rootPath, envPath, `./${projEnv}`);
  fs.ensureDirSync(projEnvPath);
  const envEluxConfig: Partial<EluxConfig> = fs.existsSync(path.join(projEnvPath, `elux.config.js`))
    ? require(path.join(projEnvPath, `elux.config.js`))
    : {};

  const defaultBaseConfig: EluxConfig = {
    dir: {
      mockPath: './mock',
      envPath: './env',
    },
    mockServer: {
      port: 3003,
    },
  };
  const eluxConfig: EluxConfig = deepExtend(defaultBaseConfig, baseEluxConfig, envEluxConfig);
  return {port: port || eluxConfig.mockServer.port, dir: path.resolve(rootPath, mockPath || eluxConfig.dir.mockPath)};
}

export = function (projectPath: string, env: string, options: {port?: number; dir?: string; watch?: boolean}): void {
  const {port, dir} = genMockConfig(projectPath, env, options.port, options.dir);
  const src = path.join(dir, './src');
  const tsconfig = path.join(dir, './tsconfig.json');
  const start = path.join(__dirname, './mock.js');
  let cmd = '';
  if (options.watch) {
    cmd = `nodemon -e ts,js,json -w ${src} --exec ts-node --project ${tsconfig} -r tsconfig-paths/register ${start}`;
  } else {
    cmd = `ts-node --project ${tsconfig} -r tsconfig-paths/register ${start}`;
  }
  process.env.SRC = src;
  process.env.PORT = port + '';
  spawn(cmd, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
};
