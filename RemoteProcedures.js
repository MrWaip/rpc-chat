class Chat {
  users = [];
  socket = null;
  constructor(socket) {
    this.socket = socket;
  }
  send(sender_id, reciver_id, message) {
    const sender = this.users.find((i) => i.id == sender_id) || {
      name: "DISCONNECTED",
    };
    const fm_message = `${sender.name}:${sender_id}: ${message}`;
    if (reciver_id == -1) {
      this.socket.sockets.emit("rpc:answer", sender_id, fm_message);
    } else {
      const user = this.users.find((i) => i.id == reciver_id);
      if (!user) return;
      user.socket.emit("rpc:answer", sender_id, fm_message);
    }
  }
  disconnect(id) {
    const { name } = this.users.find((i) => i.id == id) || {
      name: "DISCONNECTED",
    };
    this.users = this.users.filter((i) => i.id != id);
    console.log(`${name}:${id} отключился от сервера`);
    this.socket.sockets.emit("rpc:answer", id, `${name}:${id}: вышел из чата`);
  }
  connect(id, socket, name) {
    this.users.push({ socket, id, name });
  }
  error(sender_id, message) {
    const user = this.users.find((i) => i.id == sender_id);
    if (!user) return;
    user.socket.emit("rpc:error", message);
  }
  list(id) {
    const user = this.users.find((i) => i.id == id);
    if (!user) return;

    const { socket } = user;
    socket.emit(
      "rpc:system",
      this.users.map(({ name, id }) => `Имя: ${name}; ID: ${id}`).join("\n")
    );
  }
}

module.exports = {
  Chat,
};
