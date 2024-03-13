const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 2024 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    // 广播消息到所有客户端
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});