"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const cli_utils_1 = require("@elux/cli-utils");
const port = process.env.PORT;
const src = process.env.SRC;
const app = require(src);
const server = http_1.default.createServer(app);
app.set('port', port);
server.listen(port);
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
    switch (error.code) {
        case 'EACCES':
            cli_utils_1.err(`${bind} requires elevated privileges`);
            process.exit(1);
        case 'EADDRINUSE':
            cli_utils_1.err(`${bind} is already in use`);
            process.exit(1);
        default:
            throw error;
    }
});
server.on('listening', () => {
    cli_utils_1.log(`\n.....${cli_utils_1.chalk.blue('MockServer')} running at ${cli_utils_1.chalk.blue.underline(`http://localhost:${port}/`)}`);
    cli_utils_1.log(`.....${cli_utils_1.chalk.blue('MockServer')} running at ${cli_utils_1.chalk.blue.underline(`http://${cli_utils_1.localIP}:${port}/`)}\n`);
});
['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
        process.exit(1);
    });
});
