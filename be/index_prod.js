const WebSocket = require("ws");
const { typecheck,A_LOG } = require("./utils/typecheck.js");

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ port: 2024 });

wss.on("connection", function connection(ws) {
  console.log("connection establish");
  A_LOG.connect();
  ws.on("message", function message(message) {
    try {
      const parsedMsg = JSON.parse(message);
      console.log(`received: ${parsedMsg.type}`);
      typecheck(parsedMsg, ws);
    } catch (e) {
      const logFormat = `Error:\nUnhandle-message-can-not-parse-in-json\n${typeof message}`
      A_LOG.customer(logFormat);
    }
  });
});
