const iceConfig = {
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "negotiate",
  iceTransportPolicy: "all",
  iceServers: [
    {
      urls: [
        "turn:106.55.93.132:3478?transport=udp", // turn:106.55.93.132:3478?transport=udp
        "turn:106.55.93.132:3478?transport=tcp",
      ],
      credential: "alex",
      username: "123456",
    },
    {
      urls: ["stun:106.55.93.132:3478"],
    },
  ],
};
module.exports = { iceConfig };
