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
      const OFFER_SDP = WS_SDP_POOL.get(`${parsedMsg.target}-offer-sdp`);
      // 发送OFFER给远端
      ws.send(JSON.stringify({ type: "offer-sdp", SDP: OFFER_SDP }));
      // 发送REMOTE_ID给发送端
      const TARGET_WS = WS_POOL.get(parsedMsg.target);
      console.log(parsedMsg.target)
      TARGET_WS.send(JSON.stringify({ type: "remote-id", id: parsedMsg.id }));
    }
    // 远端回复ANSWER
    if (parsedMsg.type === "reply-answer") {
      const { id, SDP: ANSWER_SDP } = parsedMsg;
      const TARGET_WS = WS_POOL.get(id);
      TARGET_WS.send(JSON.stringify({ type: "answer-sdp", SDP: ANSWER_SDP }));
    }
    // 加入候选池
    if (parsedMsg.type === "candidate") {
      const { target: TARGET_ID, candidate: CANDIDATE } = parsedMsg;
      const TARGET_WS = WS_POOL.get(TARGET_ID);
      TARGET_WS.send(JSON.stringify({ type: "candidate", candidate: CANDIDATE }))
    }
    // 查看房间
    if (parsedMsg.type === "check-room") {
      // console.log(WS_POOL.has(parsedMsg.id));
    }
  });
});
