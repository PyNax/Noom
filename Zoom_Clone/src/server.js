import express from "express";
import { Server } from "socket.io";
import http from "http";
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => {console.log("Listening on http://localhost:3000")};

const httpserver = http.createServer(app);
const wsServer = new Server(httpserver);

function publicRooms(){
    const {
        sockets: {
            adapter:{sids, rooms},
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    })
    return publicRooms;
}

function countRoom(roomname){
    return wsServer.sockets.adapter.rooms.get(roomname)?.size;
}

wsServer.on("connection", (socket) => {
    socket.emit("room_change", publicRooms());
    socket["nickname"] = "Anonymous";
    socket.onAny(event => {
        console.log(`Event : ${event}`)
    });
    socket.on("enter_room", (room_Name,done) => {
        socket.join(room_Name);
        done(countRoom(room_Name));
        socket.to(room_Name).emit("Welcome", socket.nickname, countRoom(room_Name));
        wsServer.sockets.emit("room_change", publicRooms())
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room ) => {
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
        });
    })
    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room_change", publicRooms())
    });
    socket.on("new_message", (msg,room,done) => {
        socket.to(room).emit("new_message",`${socket.nickname}: ${msg}`);
        done();
    })
    socket.on("nickname", nickname => (socket["nickname"] = nickname))

})

/* const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "익명";
    console.log("Connected to BrowserSocket");
    socket.on("close" ,()=>console.log("Disconnected from BrowserSocket"))
    socket.on("message", msg => {
        const message = JSON.parse(msg);
        switch(message.type) {
            case "new_message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload}`));
                break;
            case "nickname":
                socket["nickname"] = message.payload.toString();
                break;
        }
    })
    socket.send("Hello!");
}); */



httpserver.listen(3000, handleListen);