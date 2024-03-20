const Log = require("./log.js");

const A_LOG = new Log();
const WS_POOL = new Map();
const WS_SDP_POOL = new Map();
const WS_CANDIDATE_POOL = new Map();
function typecheck(parsedMsg, ws) {
  const { type = "none" } = parsedMsg;
  switch (type) {
    case "init":
      WS_POOL.set(parsedMsg.id, ws);
      A_LOG.customer("init-done");
      break;
    case "switch-answer-with-offer":
      WS_SDP_POOL.set(`${parsedMsg.id}-offer-sdp`, parsedMsg.SDP);
      A_LOG.customer("set-offer-sdp");
      break;
    case "fetch-offer":
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
      A_LOG.customer("send-offer-sdp-to-remote");
      break;
    case "reply-answer":
      {
        const { id, SDP: ANSWER_SDP } = parsedMsg;
        const TARGET_WS = WS_POOL.get(id);
        TARGET_WS.send(JSON.stringify({ type: "answer-sdp", SDP: ANSWER_SDP }));
        A_LOG.customer("answer-reply");
      }
      break;
    case "candidate-call":
      {
        const { id: TARGET_ID, candidate: CANDIDATE } = parsedMsg;
        WS_CANDIDATE_POOL.set(TARGET_ID, CANDIDATE);
      }
      break;
    case "candidate-remote":
      const { target: TARGET_ID, candidate: CANDIDATE } = parsedMsg;
      const TARGET_WS = WS_POOL.get(TARGET_ID);
      TARGET_WS.send(
        JSON.stringify({ type: "remote-candidate-reply", candidate: CANDIDATE })
      );
      break;
    case "check-room":
    default:
      A_LOG.customer("Unhandle-type");
  }
}

module.exports = { typecheck,A_LOG };
