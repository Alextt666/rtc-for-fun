const https = require("http");
const fs = require("fs");
const { resolve } = require("path");
const server = https.createServer(
  {
    cert: fs.readFileSync(resolve(__dirname, "./certificate/localhost.crt")), // 你的证书路径
    key: fs.readFileSync(resolve(__dirname, "./certificate/localhost.key")), // 你的私钥路径
  },
  (req, res) => {
    res.end("back");
  }
);
server.listen(2024, () => {
  console.log("listening prot:", server.address().port);
});
