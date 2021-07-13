import fs from 'fs-extra';
import path from 'path';
import deepExtend from 'deep-extend';

interface MockServerPreset {
  port: number;
}
interface EluxConfig {
  dir: {
    mockPath: string;
    envPath: string;
  };
  mockServerPreset: MockServerPreset;
}
export = function (rootPath: string, projEnv: string, port?: number, mockPath?: string) {
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
    mockServerPreset: {
      port: 3003,
    },
  };
  const eluxConfig: EluxConfig = deepExtend(defaultBaseConfig, baseEluxConfig, envEluxConfig);
  return {port: port || eluxConfig.mockServerPreset.port, dir: path.resolve(rootPath, mockPath || eluxConfig.dir.mockPath)};
};
