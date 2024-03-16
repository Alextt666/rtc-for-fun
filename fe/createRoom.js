import {
  getLocalMedia,
  playonLocal,
  addTrackToLocal,
  _createOffer,
} from "./utils.js";

// 发送
const creatRoom = async () => {
  const ws = new WebSocket("wss://192.168.1.19:2024");
  const localVideo = document.getElementById("localVideo");
  const remoteVideo = document.getElementById("remoteVideo");
  const room = document.querySelector("#room");
  const pc = new RTCPeerConnection();
  let remote_id;
  let candi_;
  const ROOM_ID = Math.floor(Math.random() * 1000).toString();
  room.textContent = `Room: ${ROOM_ID}`;
  WebSocket.prototype.subscribe = ({ type, data }) => {
    ws.send(JSON.stringify({ type, ...data }));
  };

  // 挂载ontrack cb
  pc.ontrack = async (e) => {
    console.log("create-on-track", e.streams);
    const streamFromRemote = e.streams[0];
    remoteVideo.srcObject = streamFromRemote;
  };
  // 加入候选池
  pc.onicecandidate = async (event) => {
    const iceCandidate = event.candidate;
    if (iceCandidate && !candi_) {
      candi_ = iceCandidate;
      console.log(iceCandidate, "fetch-ice-candidate");
      ws.subscribe({
        type: "candidate-call",
        data: {
          id: ROOM_ID,
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

  ws.addEventListener("open", () => {
    ws.subscribe({ type: "init", data: { id: ROOM_ID } });
  });
  ws.addEventListener("message", async (e) => {
    const parsedReply = JSON.parse(e.data);
    const { type } = parsedReply;
    if (type === "answer-sdp") {
      await pc.setRemoteDescription(parsedReply.SDP);
      console.log('remote-sdp-set-done',parsedReply.SDP)
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
