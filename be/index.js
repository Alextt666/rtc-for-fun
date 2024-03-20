const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");
const { resolve } = require("path");
const { typecheck, A_LOG } = require("./utils/typecheck.js");

// 加载 SSL 证书
const server = https.createServer(
  {
    cert: fs.readFileSync(resolve(__dirname, "./certificate/localhost.crt")), // 你的证书路径
    key: fs.readFileSync(resolve(__dirname, "./certificate/localhost.key")), // 你的私钥路径
  },
  (req, res) => {
    res.end("Hello");
  }
);
// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws) {
  console.log("connection establish");
  A_LOG.connect();
  ws.on("message", function message(message) {
    try {
      const parsedMsg = JSON.parse(message);
      console.log(`received: ${parsedMsg.type}`);
      typecheck(parsedMsg, ws);
    } catch (e) {
      A_LOG.customer("Unhandle-message-can-not-parse-in-json");
    }
  });
});
// 监听指定的端口 2024
server.listen(2024, function listening() {
  console.log("Listening on %d", server.address().port);
});
