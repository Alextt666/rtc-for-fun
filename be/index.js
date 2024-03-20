const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");
const { resolve } = require("path");
const { typecheck } = require("./utils/typecheck.js");
const Log = require("./utils/log.js");
const A_LOG = new Log();
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
    const parsedMsg = JSON.parse(message);
    console.log(`received: ${parsedMsg.type}`);
    typecheck(parsedMsg, ws);
  });
});
// 监听指定的端口 2024
server.listen(2024, function listening() {
  console.log("Listening on %d", server.address().port);
});
