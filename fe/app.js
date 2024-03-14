import { getLocalMedia, playonLocal } from "./utils.js";
// 发送
const creatRoom = async () => {
  const ws = new WebSocket("ws://localhost:2024");
  const localVideo = document.getElementById("localVideo");
  const pc = new RTCPeerConnection();
  const ROOM_ID = Math.floor(Math.random * 1000);
  ws.addEventListener("open", () => {
    ws.send(JSON.stringify({ type: "init", id: ROOM_ID }));
  });

  // 获取流媒体信息
  const stream = await getLocalMedia();
  // 本地播放
  await playonLocal(localVideo,stream)
};


creatRoom();