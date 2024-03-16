// 获取本地流媒体
async function getLocalMedia() {
  return await navigator.mediaDevices.getUserMedia({ video: true });
}
// 本地播放
async function playonLocal(playDom, stream) {
  // 可以使用这个流来预览本地视频
  playDom.srcObject = stream;
  return;
}
// 添加本地pc tack
async function addTrackToLocal(pc, stream) {
  stream.getTracks().forEach((track) => {
    pc.addTrack(track, stream);
    console.log('add-local-track-done')
  });
}


// 创建offer
async function _createOffer(pc) {
  // await pc.createDataChannel("room");
  const SDP = await pc.createOffer();
  console.log(SDP,'create-local-SDP')
  // local save sdp
  await pc.setLocalDescription(SDP);
  return SDP;
}

// 创建answer
async function _createAnswer(pc, offer) {
  // save offer info
  await pc.setRemoteDescription(offer);
  // create answer
  const SDP = await pc.createAnswer();
  // local save answer sdp
  await pc.setLocalDescription(SDP);
  return SDP;
}

export {
  getLocalMedia,
  playonLocal,
  addTrackToLocal,
  _createOffer,
  _createAnswer,
};
