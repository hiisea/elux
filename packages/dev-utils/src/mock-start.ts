/* eslint-disable no-fallthrough, no-console */
import http from 'http';
import chalk from 'chalk';

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
  console.info(`\n.....${chalk.magenta('MockServer')} running at ${chalk.magenta(`http://localhost:${port}/`)}\n`);
});
