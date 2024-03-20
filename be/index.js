const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");
const { resolve } = require("path");
const Log = require("./log.js");
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

const WS_POOL = new Map();
const WS_SDP_POOL = new Map();
const WS_CANDIDATE_POOL = new Map();

wss.on("connection", function connection(ws) {
  console.log("connection establish");
  A_LOG.connect();
  ws.on("message", function message(message) {
    const parsedMsg = JSON.parse(message);
    console.log(`received: ${parsedMsg.type}`);
    if (parsedMsg.type === "init") {
      WS_POOL.set(parsedMsg.id, ws);
      A_LOG.customer('init-done')
    }
    // 这里可以根据不同的type来处理不同的逻辑
    if (parsedMsg.type === "switch-answer-with-offer") {
      WS_SDP_POOL.set(`${parsedMsg.id}-offer-sdp`, parsedMsg.SDP);
      A_LOG.customer('set-offer-sdp')
    }
    // 远端加入获取OFFER
    if (parsedMsg.type === "fetch-offer") {
      const OFFER_SDP = WS_SDP_POOL.get(`${parsedMsg.target}-offer-sdp`);
      const CANDIDATE_SDP = WS_CANDIDATE_POOL.get(`${parsedMsg.target}`);
      // 发送OFFER给远端
      ws.send(
        JSON.stringify({
          type: "offer-sdp",
          SDP: OFFER_SDP,
          candidate: CANDIDATE_SDP,
        })
      );
      A_LOG.customer('send-offer-sdp-to-remote')
    }
    // 远端回复ANSWER
    if (parsedMsg.type === "reply-answer") {
      const { id, SDP: ANSWER_SDP } = parsedMsg;
      const TARGET_WS = WS_POOL.get(id);
      TARGET_WS.send(JSON.stringify({ type: "answer-sdp", SDP: ANSWER_SDP }));
      A_LOG.customer('answer-reply')
    }
    // 发送加入候选池
    if (parsedMsg.type === "candidate-call") {
      const { id: TARGET_ID, candidate: CANDIDATE } = parsedMsg;
      WS_CANDIDATE_POOL.set(TARGET_ID, CANDIDATE);
    }
    // 远端候选池
    if (parsedMsg.type === "candidate-remote") {
      const { target: TARGET_ID, candidate: CANDIDATE } = parsedMsg;
      const TARGET_WS = WS_POOL.get(TARGET_ID);
      TARGET_WS.send(
        JSON.stringify({ type: "remote-candidate-reply", candidate: CANDIDATE })
      );
    }
    // 查看房间
    if (parsedMsg.type === "check-room") {
      // console.log(WS_POOL.has(parsedMsg.id));
    }
  });
});
// 监听指定的端口 2024
server.listen(2024, function listening() {
  console.log("Listening on %d", server.address().port);
});
