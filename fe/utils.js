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

export { getLocalMedia, playonLocal };
