const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;
let roomname;

function AddMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function HandleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    socket.emit("new_message", input.value,roomname, () => {
        AddMessage(`You: ${input.value}`);
        input.value = '';
    });
}

function HandleNicknameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room",input.value, () => {
        welcome.hidden = true;
        room.hidden = false;
        const h3 = room.querySelector("h3");
        h3.innerText = `Room : ${roomname}`;
        const msgForm = room.querySelector("#msg");
        const nameForm = room.querySelector("#name");
        nameForm.addEventListener("submit",HandleNicknameSubmit)
        msgForm.addEventListener("submit", HandleMessageSubmit)
    });
    roomname = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);


socket.on("Welcome", (user) => {
    AddMessage(`${user} Joined the room`);
})

socket.on("bye", (user) => {
    AddMessage(`${user} Leave the room`);
})

socket.on("new_message", AddMessage)

socket.on("room_change", rooms => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if (rooms.length === 0) {
        return;
    }
    rooms.forEach((room) =>{
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    })
})