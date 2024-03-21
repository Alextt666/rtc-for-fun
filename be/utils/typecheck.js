const Log = require("./log.js");

const A_LOG = new Log();
const WS_POOL = new Map();
const WS_SDP_POOL = new Map();
const WS_CANDIDATE_POOL = { local: [], remote: [] };
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
      // 发送OFFER给远端
      ws.send(
        JSON.stringify({
          type: "offer-sdp",
          SDP: OFFER_SDP,
        })
      );
      A_LOG.customer("send-offer-sdp-to-remote");
      break;
    case "reply-answer":
      {
        const { id, SDP: ANSWER_SDP, remoteId: remoteid } = parsedMsg;
        const TARGET_WS = WS_POOL.get(id);
        TARGET_WS.send(
          JSON.stringify({ type: "answer-sdp", SDP: ANSWER_SDP, remoteid })
        );
        A_LOG.customer("answer-reply");
      }
      break;
    case "candidate-call":
      {
        const { id: TARGET_ID, candidate: CANDIDATE } = parsedMsg;
        WS_CANDIDATE_POOL.local.push(CANDIDATE); // 存进local - candidates
      }
      break;
    case "candidate-remote":
      {
        const { candidate: CANDIDATE } = parsedMsg;
        WS_CANDIDATE_POOL.remote.push(CANDIDATE); // 存进remote - candidates
      }
      break;
    case "candidate-call-done":
      {
        const { id } = parsedMsg;
        const WS_TARGET = WS_POOL.get(id);
        WS_TARGET.send(
          JSON.stringify({
            type: "candidate-call-done",
            candidates: WS_CANDIDATE_POOL.local,
          })
        );
        A_LOG.customer("send-candidate-call-done");
      }
      break;
    case "candidate-remote-done":
      {
        const { id } = parsedMsg;
        const WS_TARGET = WS_POOL.get(id);
        WS_TARGET.send(
          JSON.stringify({
            type: "candidate-remote-done",
            candidates: WS_CANDIDATE_POOL.remote,
          })
        );
        A_LOG.customer("send-candidate-remote-done");
      }
      break;
    case "check-room":
    default:
      A_LOG.customer("Unhandle-type");
  }
}

module.exports = { typecheck, A_LOG };
