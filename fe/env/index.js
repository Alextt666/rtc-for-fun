const PORT = 2024;

const DEV = "192.168.1.19";
const PROD = "47.112.231.67";
export const BASE_URL =
  process.env.NODE_ENV == "development" ? `${DEV}:${PORT}` : `${PROD}:${PORT}`;
