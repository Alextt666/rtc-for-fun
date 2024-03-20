import joinRoom from "./entry/joinRoom.js";
import creatRoom from "./entry/createRoom.js";
const createButton = document.querySelector("#createRoom");
const joinButton = document.querySelector("#joinRoom");
createButton.addEventListener("click", async () => {
  await creatRoom();
});
joinButton.addEventListener("click", async () => {
  await joinRoom();
});
