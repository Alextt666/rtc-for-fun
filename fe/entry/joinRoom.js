import {
  getLocalMedia,
  playonLocal,
  addTrackToLocal,
  _createAnswer,
} from "../utils.js";
import { iceConfig } from "./iceConfig.js";
import { BASE_URL } from "../env/index.js";
// 发送
const joinRoom = async () => {
  const localVideo = document.getElementById("localVideo");
  const joinIpt = document.querySelector("#join-ipt");
  const room = document.querySelector("#room");
  const pc = new RTCPeerConnection({
    iceServers: [
      {
        urls: "turn:106.55.93.132:3478",
        credential: "alex",
        username: "123456",
      },
      {
        urls: "stun:106.55.93.132:3478",
      },
    ],
  });
  const REMOTE_ID = Math.floor(Math.random() * 1000);
  //  get from input
  const ROOM_ID = joinIpt.value.toString();
  let resolveA;
  room.textContent = `Room: ${ROOM_ID}`;
  WebSocket.prototype.subscribe = ({ type, data }) => {
    ws.send(JSON.stringify({ type, ...data }));
  };
  const ws = new WebSocket(`wss://${BASE_URL}`);
  ws.addEventListener("open", async () => {
    ws.subscribe({ type: "init", data: { id: REMOTE_ID } });
    resolveA();
  });
  ws.addEventListener("message", async (e) => {
    const parsedReply = JSON.parse(e.data);
    if (parsedReply.type === "offer-sdp") {
      const OFFER = parsedReply.SDP;
      await pc.setRemoteDescription(OFFER);
      const ANSWER = await _createAnswer(pc, OFFER);
      // info-signal-server-with-answer
      ws.subscribe({
        type: "reply-answer",
        data: { id: ROOM_ID, SDP: ANSWER, remoteId: REMOTE_ID },
      });
    }
    if (parsedReply.type === "remote-candidate") {
      const CANDIDATE = parsedReply.candidate;
      pc.addIceCandidate(CANDIDATE);
    }
    if (parsedReply.type === "candidate-call-done") {
      console.log(parsedReply.candidates, "candidate-call-done");
      parsedReply.candidates.forEach((candidate) => {
        pc.addIceCandidate(candidate);
      });
    }
  });

  // 等待open
  await new Promise((resolve, reject) => {
    resolveA = resolve;
  });

  // 挂载ontrack cb
  pc.ontrack = async (e) => {
    console.log("join-on-track", e.streams);
    const remoteVideo = document.getElementById("remoteVideo");
    const streamFromRemote = await e.streams[0];
    remoteVideo.srcObject = streamFromRemote;
  };

  // 加入候选池
  pc.onicecandidate = async (event) => {
    const iceCandidate = event.candidate;
    if (iceCandidate) {
      console.log(iceCandidate, "remote-candidates");
      ws.subscribe({
        type: "candidate-remote",
        data: {
          target: ROOM_ID,
          candidate: iceCandidate,
        },
      });
    }
  };
  // 监控ice 状态
  pc.addEventListener("icegatheringstatechange", (ev) => {
    switch (pc.iceGatheringState) {
      case "new":
        /* gathering is either just starting or has been reset */
        console.log("new");
        break;
      case "gathering":
        /* gathering has begun or is ongoing */
        console.log("gathering");
        break;
      case "complete":
        /* gathering has ended */
        console.log("complete");
        ws.subscribe({ type: "candidate-remote-done", data: { id: ROOM_ID } });
        break;
    }
  });

  // 获取流媒体信息
  const stream = await getLocalMedia({ withAudio: true });
  // 没有音频媒体
  const streamWithoutAudio = await getLocalMedia({ withAudio: false });
  // 本地播放
  await playonLocal(localVideo, streamWithoutAudio);
  // 添加流到本地track
  await addTrackToLocal(pc, stream);
  // GET OFFER
  await ws.subscribe({
    type: "fetch-offer",
    data: { target: ROOM_ID, id: REMOTE_ID },
  });
};

export default joinRoom;
