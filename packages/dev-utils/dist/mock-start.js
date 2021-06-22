"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const chalk_1 = __importDefault(require("chalk"));
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
    console.info(`\n.....${chalk_1.default.magenta('MockServer')} running at ${chalk_1.default.magenta(`http://localhost:${port}/`)}\n`);
});
