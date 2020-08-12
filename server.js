const { Chat } = require("./RemoteProcedures");

var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

var chat = new Chat(io);

io.on("connection", (socket) => {
  const { name, id } = socket.handshake.query;
  chat.connect(id, socket, name);
  console.log(`К серверу подключился ${id}:${name}`);
  socket.on("rpc", (...params) => onRPC(id, ...params));
  socket.on("disconnect", () => chat.disconnect(id));
});

http.listen(3090, () => {
  console.log("listening on *:3090");
});

const onRPC = (sender_id, method, ...param) => {
  try {
    chat[method](sender_id, ...param);
  } catch (error) {
    chat.error(sender_id, "Нет такого метода");
  }
};
