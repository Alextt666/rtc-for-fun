import {
  getLocalMedia,
  playonLocal,
  addTrackToLocal,
  _createOffer,
} from "./utils.js";
// 发送
const creatRoom = async () => {
  const ws = new WebSocket("ws://localhost:2024");
  const localVideo = document.getElementById("localVideo");
  const room = document.querySelector("#room");
  const pc = new RTCPeerConnection();
  const ROOM_ID = Math.floor(Math.random() * 1000);
  room.textContent = `Room: ${ROOM_ID}`;
  WebSocket.prototype.subscribe = ({ type, data }) => {
    ws.send(JSON.stringify({ type, ...data }));
  };
  ws.addEventListener("open", () => {
    ws.subscribe({ type: "init", data: { id: ROOM_ID } });
  });
  ws.addEventListener("message", (e) => {
    console.log(e);
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

creatRoom();
