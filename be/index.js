const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 2024 });
const WS_POOL = new Map();
const WS_SDP_POOL = new Map();

wss.on("connection", function connection(ws) {
  console.log("connection establish");

  ws.on("message", function message(message) {
    const parsedMsg = JSON.parse(message);
    console.log(`received: ${parsedMsg.type}`);
    if (parsedMsg.type === "init") {
      WS_POOL.set(parsedMsg.id, ws);
    }
    // 这里可以根据不同的type来处理不同的逻辑
    if (parsedMsg.type === "switch-answer-with-offer") {
      WS_SDP_POOL.set(`${parsedMsg.id}-offer-sdp`, parsedMsg.SDP);
    }
    // 查看房间
    if (parsedMsg.type === "check-room") {
      // console.log(WS_POOL.has(parsedMsg.id));
    }
  });
});
