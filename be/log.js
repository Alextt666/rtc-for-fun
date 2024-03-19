const fs = require("fs");
const { resolve } = require("path");

function writeLog(state) {
  try {
    const content = fs.readFileSync(resolve(__dirname, "./log.txt"), "utf8");
    fs.writeFileSync(resolve(__dirname, "./log.txt"), `${content}\n${state}`);
  } catch {
    fs.writeFileSync(resolve(__dirname, "./log.txt"), state);
  }
}
function handleLog(options = {}) {
  const { type = "connect" } = options;
  const state =
    type == "connect"
      ? `receive connect. Establish ${new Date(Date.now())}`
      : `close connect ${new Date(Date.now())}`;
  writeLog(state);
}
function errorLog(options) {
  const { msg, data, type } = options;
  writeLog(
    `Error:\n${new Date(Date.now())}\n${msg}\n data is ${
      data.toString() || ""
    } \n Data type: ${type} \n `
  );
}
module.exports = {
  handleLog,
  errorLog,
};
