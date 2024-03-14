import {
  getLocalMedia,
  playonLocal,
  addTrackToLocal,
  _createAnswer,
} from "./utils.js";

// 发送
const joinRoom = async () => {
  const ws = new WebSocket("ws://localhost:2024");
  const localVideo = document.getElementById("localVideo");
  const remoteVideo = document.getElementById("remoteVideo");
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
    const streamFromRemote = e.streams[0];
    remoteVideo.srcObject = streamFromRemote;
  };
  // 加入候选池
  pc.onicecandidate = async (event) => {
    const iceCandidate = event.candidate;
    if (iceCandidate) {
      // LOCAL - to REMOTE
      //   REMOTE_PC.addIceCandidate(iceCandidate);
      ws.subscribe({
        type: "candidate",
        data: {
          target: ROOM_ID,
          //   id: REMOTE_ID,
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
      pc.setRemoteDescription(OFFER);
      const ANSWER = await _createAnswer(pc, OFFER);
      // info-signal-server-with-answer
      ws.subscribe({
        type: "reply-answer",
        data: { id: ROOM_ID, SDP: ANSWER },
      });
    }
  });

  // 获取流媒体信息
  const stream = await getLocalMedia();
  // 本地播放
  await playonLocal(localVideo, stream);
  // 添加流到本地track
  await addTrackToLocal(pc, stream);
  // GET OFFER
  await ws.subscribe({
    type: "fetch-offer",
    data: { target: ROOM_ID, id: REMOTE_ID },
  });
};

export default joinRoom;
