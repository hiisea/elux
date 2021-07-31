/* eslint-disable no-fallthrough, no-console */
import http from 'http';
import chalk from 'chalk';
import {networkInterfaces} from 'os';

function getLocalIP() {
  let result = 'localhost';
  const interfaces = networkInterfaces();
  for (const devName in interfaces) {
    const isEnd = interfaces[devName]?.some((item) => {
      // 取IPv4, 不为127.0.0.1的内网ip
      if (item.family === 'IPv4' && item.address !== '127.0.0.1' && !item.internal) {
        result = item.address;
        return true;
      }
      return false;
    });
    // 若获取到ip, 结束遍历
    if (isEnd) {
      break;
    }
  }
  return result;
}

const localIP = getLocalIP();

const port = process.env.PORT;
const src = process.env.SRC;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require(src!);
const server = http.createServer(app);
app.set('port', port);
server.listen(port);
server.on('error', (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
});
server.on('listening', () => {
  console.info(`\n.....${chalk.blue('MockServer')} running at ${chalk.blue.underline(`http://localhost:${port}/`)}`);
  console.info(`.....${chalk.blue('MockServer')} running at ${chalk.blue.underline(`http://${localIP}:${port}/`)}\n`);
});
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    process.exit(1);
  });
});
