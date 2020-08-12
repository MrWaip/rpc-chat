const readline = require("readline");
const process = require("process");
const io = require("socket.io-client");
const { disconnect } = require("process");
const { rootCertificates } = require("tls");
var socket = null;

const user = {
  name: null,
  id: process.pid,
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askName = () => {
  rl.question("Ваше имя: ", (answer) => {
    if (!answer) return askName();

    user.name = answer;
    console.log(`Доброго времени суток ${answer} 🖖`);
    startClient();
  });
};

askName();

const startClient = () => {
  socket = io("http://localhost:3090", {
    query: user,
  });

  socket.on("rpc:error", (error) => {
    console.error("RPC ERROR:", error);
  });

  socket.on("rpc:answer", (from, message) => {
    if (from != user.id) console.info(message);
  });

  socket.on("rpc:system", (message) => {
    console.info(message);
  });

  console.log(
    "Поиграем в RPC. Ты говори мне что сделать, а я сделаю. Доступные команды: "
  );
  console.log(
    "send - отправить сообщение",
    "disconnect - отключиться",
    "list - список активных пользователей"
  );

  askWhatToDo();
};

const askWhatToDo = () => {
  rl.question("Что делаем? \n", (answer) => {
    if (!answer) return askWhatToDo();
    switch (answer) {
      case "send":
        askSend();
        break;
      case "disconnect":
        disconnectChat();
        break;
      case "list":
        showUserList();
        break;
      default:
        console.log(
          "Прости но ленивый разраб не сделал обработку такой команды, давай по новой"
        );
        askWhatToDo();
        break;
    }
  });
};

const askSend = () => {
  const params = [];
  rl.question("Кому отправить (id): ", (answer) => {
    if (!answer) console.log(-1);
    params.push(answer || -1);

    rl.question("Ваше сообщение: ", (answer) => {
      params.push(answer || "empty");
      callRpc("send", ...params);
      askWhatToDo();
    });
  });
};

const callRpc = (method, ...params) => {
  socket.emit("rpc", method, ...params);
};

const disconnectChat = () => {
  callRpc("disconnect", user.id);
  socket.close();
  rl.close();
};

const showUserList = () => {
  callRpc("list");
  askWhatToDo();
};
