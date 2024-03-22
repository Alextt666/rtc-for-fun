const Log = require("./log.js");

const A_LOG = new Log();
const WS_POOL = new Map();
const WS_SDP_POOL = new Map();
const WS_CANDIDATE_POOL = { local: [], remote: [] };
function typecheck(parsedMsg, ws) {
  const { type = "none" } = parsedMsg;
  switch (type) {
    case "init":
      {
        // data: { target: ROOM_ID, id: REMOTE_ID }
        const { target = "", id } = parsedMsg;
        WS_POOL.set(parsedMsg.id, ws);
        console.log("device-online", target);
        if (target) {
          const WS_TARGET = WS_POOL.get(target);
          console.log("remote-online-send-msg");
          WS_TARGET.send(
            JSON.stringify({ type: "remote-online", remoteid: id })
          );
        }
        A_LOG.customer("init-done");
      }
      break;
    // call-sdp-send
    case "switch-answer-with-offer":
      const { target, SDP } = parsedMsg;
      WS_POOL.get(target).send(
        JSON.stringify({
          type: "offer-sdp",
          SDP,
        })
      );
      A_LOG.customer("set-offer-sdp");
      break;
    // remote-sdp-trans
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
    // candidate-trans
    case "candidate-call":
      {
        const { target: TARGET_ID, candidate: CANDIDATE } = parsedMsg;
        const WS_TARGET = WS_POOL.get(TARGET_ID); // 转发local - candidates
        console.log('localcandidate',CANDIDATE)
        WS_TARGET.send(JSON.stringify({ type: "remote-candidate", candidate:CANDIDATE }));
      }
      break;
    case "candidate-remote":
      {
        const { target, candidate: CANDIDATE } = parsedMsg;
        const WS_TARGET = WS_POOL.get(target);
        WS_TARGET.send(JSON.stringify({ type: "candidate", candidate:CANDIDATE })); // 转发remote - candidates
      }
      break;
    case "check-room":
    default:
      A_LOG.customer("Unhandle-type");
  }
}

module.exports = { typecheck, A_LOG };
