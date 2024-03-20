const fs = require("fs");
const { resolve } = require("path");
class Log {
  constructor() {}
  connect() {
    const state = `receive connect. Establish ${new Date(Date.now())}`;
    this.writeLog(state);
  }

  customer(state = "") {
    if (typeof state == "string") {
      this.writeLog(state);
    }
    return;
  }
  errorLog(options) {
    const { msg, data, type } = options;
    this.writeLog(
      `Error:\n${new Date(Date.now())}\n${msg}\n data is ${
        data.toString() || ""
      } \n Data type: ${type} \n `
    );
  }
  writeLog(state) {
    try {
      const content = fs.readFileSync(resolve(__dirname, "../log.txt"), "utf8");
      fs.writeFileSync(resolve(__dirname, "../log.txt"), `${content}\n${state}`);
    } catch {
      fs.writeFileSync(resolve(__dirname, "../log.txt"), state);
    }
  }
}

module.exports = Log;
