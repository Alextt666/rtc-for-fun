const LOCAL_PC = new RTCPeerConnection(); // 发起
const REMOTE_PC = new RTCPeerConnection(); // 接收
const openBtn = document.querySelector("#openButton");
const closeBtn = document.querySelector("#closeButton");
const remoteVideo = document.getElementById("remoteVideo");
// 挂载ontrack cb
REMOTE_PC.ontrack = async (e) => {
  const streamFromRemote = e.streams[0];
  remoteVideo.srcObject = streamFromRemote;
};
// 获取本地流媒体
async function getLocalMedia() {
  return await navigator.mediaDevices.getUserMedia({ video: true });
}
// 本地播放
async function playonLocal(stream) {
  // 可以使用这个流来预览本地视频
  const localVideo = document.getElementById("localVideo");
  localVideo.srcObject = stream;
  return;
}
// 加入localtrack
async function addTrackToLocal(stream) {
  stream.getTracks().forEach((track) => {
    LOCAL_PC.addTrack(track, stream);
  });
}

// 加入候选池
LOCAL_PC.onicecandidate = async (event) => {
  const iceCandidate = event.candidate;
  if (iceCandidate) {
    // LOCAL - to REMOTE
    REMOTE_PC.addIceCandidate(iceCandidate);
  }
};
REMOTE_PC.onicecandidate = async (event) => {
  const iceCandidate = event.candidate;
  if (iceCandidate) {
    // LOCAL - to REMOTE
    LOCAL_PC.addIceCandidate(iceCandidate);
  }
};

async function _createOffer() {
  LOCAL_PC.createDataChannel("room");
  const SDP = await LOCAL_PC.createOffer();
  // local save sdp
  await LOCAL_PC.setLocalDescription(SDP);
  _createAnswer(SDP);
}
async function _createAnswer(offer) {
  // save offer info
  await REMOTE_PC.setRemoteDescription(offer);
  // create answer
  const SDP = await REMOTE_PC.createAnswer();
  // local save answer sdp
  await REMOTE_PC.setLocalDescription(SDP);
  await LOCAL_PC.setRemoteDescription(SDP);
}

async function establishContect() {
  let strem = await getLocalMedia();
  await playonLocal(strem);
  await addTrackToLocal(strem);
  await _createOffer();
}

establishContect();

openBtn.addEventListener('click',()=>{
  remoteVideo.style.display = 'block';
})
closeBtn.addEventListener('click',(e)=>{
  remoteVideo.style.display = 'none';
})