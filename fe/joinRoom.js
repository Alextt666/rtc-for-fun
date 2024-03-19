import {
  getLocalMedia,
  playonLocal,
  addTrackToLocal,
  _createAnswer,
} from "./utils.js";
import { BASE_URL } from "./env/index.js";
// 发送
const joinRoom = async () => {
  const ws = new WebSocket(`wss://${BASE_URL}`);
  const localVideo = document.getElementById("localVideo");
  const joinIpt = document.querySelector("#join-ipt");
  const room = document.querySelector("#room");
  const pc = new RTCPeerConnection();
  const REMOTE_ID = Math.floor(Math.random() * 1000);
  //  get from input
  const ROOM_ID = joinIpt.value.toString();
  room.textContent = `Room: ${ROOM_ID}`;
  WebSocket.prototype.subscribe = ({ type, data }) => {
    ws.send(JSON.stringify({ type, ...data }));
  };
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
      ws.subscribe({
        type: "candidate-remote",
        data: {
          target: ROOM_ID,
          candidate: iceCandidate,
        },
      });
    }
  };

  ws.addEventListener("open", () => {
    ws.subscribe({ type: "init", data: { id: REMOTE_ID } });
  });
  ws.addEventListener("message", async (e) => {
    const parsedReply = JSON.parse(e.data);
    if (parsedReply.type === "offer-sdp") {
      const OFFER = parsedReply.SDP;
      const CANDIDATE = parsedReply.candidate;

      await pc.setRemoteDescription(OFFER);
      await pc.addIceCandidate(CANDIDATE);

      const ANSWER = await _createAnswer(pc, OFFER);
      // info-signal-server-with-answer
      ws.subscribe({
        type: "reply-answer",
        data: { id: ROOM_ID, SDP: ANSWER },
      });
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
