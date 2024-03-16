import joinRoom from "./joinRoom.js";
import creatRoom from "./createRoom.js";
const createButton = document.querySelector("#createRoom");
const joinButton = document.querySelector("#joinRoom");
createButton.addEventListener("click", async () => {
  await creatRoom();
});
joinButton.addEventListener("click", async () => {
  await joinRoom();
});
