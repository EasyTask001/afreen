import { createServer } from 'node:http';
import { staticHandler } from './static-handler.mjs';

const port = Number(process.env.PORT || 4321);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Use a valid local port from 1024 to 65535.');
const server = createServer(staticHandler);
server.listen(port, '127.0.0.1', () => console.log(`Afreen local preview: http://127.0.0.1:${port}/`));
