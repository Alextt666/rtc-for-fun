import {
  getLocalMedia,
  playonLocal,
  addTrackToLocal,
  _createOffer,
} from "../utils.js";
import { BASE_URL } from "../env/index.js";
import { iceConfig } from "./iceConfig.js";
// 发送
const creatRoom = async () => {

  let resolveA;
  const localVideo = document.getElementById("localVideo");
  const remoteVideo = document.getElementById("remoteVideo");
  const localDiaplay = document.querySelector(".video-box-teacher");
  const localBtn = document.querySelector('#createRoom');
  localBtn.disabled = true;
  const ROOM_ID = Math.floor(Math.random() * 1000).toString();
  const room = document.querySelector("#room");
  let pc;
  let remote_id;
  let candi_;
  room.textContent = `Room: ${ROOM_ID}`;
  WebSocket.prototype.subscribe = ({ type, data }) => {
    try {
      ws.send(JSON.stringify({ type, ...data }));
    } catch (e) {
      console.warn(`WS_CONNECT_ERROR -- type --${type}-- ${e.message}`);
    }
  };
  const ws = new WebSocket(`wss://${BASE_URL}`);

  ws.addEventListener("open", async () => {
    console.log("on-open");
    await ws.subscribe({ type: "init", data: { id: ROOM_ID } });
    resolveA();
  });
  ws.addEventListener("message", async (e) => {
    const parsedReply = JSON.parse(e.data);
    const { type } = parsedReply;
    if (type === "answer-sdp") {
      await pc.setRemoteDescription(parsedReply.SDP);
      remote_id = parsedReply.remoteid;
      console.log("remote-sdp-set-done", parsedReply.SDP);
    }
    if (type === "candidate") {
      const CANDIDATE = parsedReply.candidate;
      pc.addIceCandidate(CANDIDATE);
      console.log("remote-candidate", parsedReply);
    }
    if (type === "remote-online") {
      remote_id = parsedReply.remoteid;
      console.log("online- init- peer");
      pc = new RTCPeerConnection({
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
      // 挂载ontrack cb
      pc.addEventListener("track", (e) => {
        console.log("create-on-track", e.streams);
        const streamFromRemote = e.streams[0];
        remoteVideo.srcObject = streamFromRemote;
      });
      // 加入候选池
      pc.onicecandidate = (event) => {
        const iceCandidate = event.candidate;
        if (iceCandidate) {
          candi_ = iceCandidate;
          ws.subscribe({
            type: "candidate-call",
            data: {
              target: remote_id,
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
            break;
        }
      });
      // 添加流到本地PC - track
      await addTrackToLocal(pc, stream);

      // 创建offer
      const OFFER = await _createOffer(pc);
      // fetch-to-signal-server-with-offer
      ws.subscribe({
        type: "switch-answer-with-offer",
        data: { SDP: OFFER, id: ROOM_ID, target: remote_id },
      });
      console.log("remote-online-send-sdp-message");
    }
  });
  // 等待open
  await new Promise((resolve, reject) => {
    resolveA = resolve;
  });

  // 获取流媒体信息
  const stream = await getLocalMedia({ withAudio: true });
  // 没有音频媒体
  const streamWithoutAudio = await getLocalMedia({ withAudio: false });
  // 本地播放
  await playonLocal(localVideo, streamWithoutAudio);
  // 本地画面
  localDiaplay.style.display = 'block';
  localBtn.disabled = false;
  // ws.subscribe({ type: "check-room", data: { id: ROOM_ID } });
};

export default creatRoom;
