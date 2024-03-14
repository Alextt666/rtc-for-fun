import {
  getLocalMedia,
  playonLocal,
  addTrackToLocal,
  _createOffer,
} from "./utils.js";

// 发送
const creatRoom = async () => {
  const ws = new WebSocket("ws://192.168.1.19:2024");
  const localVideo = document.getElementById("localVideo");
  const remoteVideo = document.getElementById("remoteVideo");
  const room = document.querySelector("#room");
  const pc = new RTCPeerConnection();
  let remote_id;
  const ROOM_ID = Math.floor(Math.random() * 1000).toString();
  room.textContent = `Room: ${ROOM_ID}`;
  WebSocket.prototype.subscribe = ({ type, data }) => {
    ws.send(JSON.stringify({ type, ...data }));
  };

  // 挂载ontrack cb
  pc.ontrack = async (e) => {
    const streamFromRemote = e.streams[0];
    remoteVideo.srcObject = streamFromRemote;
  };
  // 加入候选池
  pc.onicecandidate = async (event) => {
    const iceCandidate = event.candidate;
    if (iceCandidate) {
      ws.subscribe({
        type: "candidate-call",
        data: {
          id: ROOM_ID,
          candidate: iceCandidate,
        },
      });
    }
  };
  ws.addEventListener("open", () => {
    ws.subscribe({ type: "init", data: { id: ROOM_ID } });
  });
  ws.addEventListener("message", async (e) => {
    const parsedReply = JSON.parse(e.data);
    const { type } = parsedReply;
    if (type === "answer-sdp") {
      await pc.setRemoteDescription(parsedReply.SDP);
    }
    if (type === "remote-id") {
      remote_id = parsedReply.id;
    }
    if (type === "candidate") {
      pc.addIceCandidate(parsedReply.candidate);
    }
    if (type === "remote-candidate-reply") {
      pc.addIceCandidate(parsedReply.candidate);
    }
  });

  // 获取流媒体信息
  const stream = await getLocalMedia();
  // 本地播放
  await playonLocal(localVideo, stream);
  // 添加流到本地track
  await addTrackToLocal(pc, stream);
  // 创建offer
  const OFFER = await _createOffer(pc);
  // fetch-to-signal-server-with-offer
  ws.subscribe({
    type: "switch-answer-with-offer",
    data: { SDP: OFFER, id: ROOM_ID },
  });
  // ws.subscribe({ type: "check-room", data: { id: ROOM_ID } });
};

export default creatRoom;
