/* eslint-disable no-fallthrough */
import http from 'http';

import {chalk, localIP, log, err} from '@elux/cli-utils';

const port = process.env.PORT;
const src = process.env.SRC;
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
      err(`${bind} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE':
      err(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
});
server.on('listening', () => {
  log(`\n.....${chalk.blue('MockServer')} running at ${chalk.blue.underline(`http://localhost:${port}/`)}`);
  log(`.....${chalk.blue('MockServer')} running at ${chalk.blue.underline(`http://${localIP}:${port}/`)}\n`);
});
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    process.exit(1);
  });
});
