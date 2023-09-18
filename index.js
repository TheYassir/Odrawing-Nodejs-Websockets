require('dotenv').config();
const debugServer = require('debug')('app:server');
const http = require('http');
const { Server: WsServer } = require('socket.io');
const app = require('./app/app');
const wsAppInit = require('./app/ws');

const httpServer = http.createServer(app);
const wsServer = new WsServer(httpServer);
wsAppInit(wsServer);

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
  debugServer(`http://localhost:${port}`);
});
