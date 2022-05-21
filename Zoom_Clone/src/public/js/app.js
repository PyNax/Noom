const MessageForm = document.querySelector("#message");
const NickForm = document.querySelector("#nick");
const MessageList = document.querySelector("ul");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
    const msg = {type, payload};
    return JSON.stringify(msg);
}

socket.addEventListener("open", () =>{
    console.log("Connected to Server");
})

socket.addEventListener("message", message =>{
    const li = document.createElement("li");
    li.innerText = message.data;
    MessageList.append(li);
})

socket.addEventListener("close", ()=>{
    console.log("Closed");
})

function handleSubmit() {
    event.preventDefault();
    const input = MessageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value = "";
}

function handleNicknameChange() {
    event.preventDefault();
    const input = NickForm.querySelector("input");
    socket.send(makeMessage("nickname",input.value));
    input.value = "";
}

MessageForm.addEventListener("submit" ,handleSubmit)
NickForm.addEventListener("submit" ,handleNicknameChange)