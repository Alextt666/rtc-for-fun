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
    // 远端加入获取OFFER
    if (parsedMsg.type === "fetch-offer") {
      const OFFER_SDP = WS_SDP_POOL.get(`${parsedMsg.id}-offer-sdp`);
      ws.send(JSON.stringify({ type: "offer-sdp", SDP: OFFER_SDP }));
    }
    // 远端回复ANSWER
    if (parsedMsg.type === "reply-answer") {
      const { id, SDP: ANSWER_SDP } = parsedMsg;
      const TARGET_WS = WS_POOL.get(id);
      TARGET_WS.send(JSON.stringify({ type: "answer-sdp", SDP: ANSWER_SDP }));
    }
    // 查看房间
    if (parsedMsg.type === "check-room") {
      // console.log(WS_POOL.has(parsedMsg.id));
    }
  });
});
