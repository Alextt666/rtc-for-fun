const PORT = 2024;

const DEV = "192.168.1.19";
const PROD = "rtc.classtalkedu.com/wss/";
export const BASE_URL =
  process.env.NODE_ENV == "development" ? `${DEV}:${PORT}` : `${PROD}`;
