"use strict";

const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const dgram = require("dgram");
const osc = require("osc-msg");
const ip = require("ip");
const values = require("object-values");

// サーバーの設定値
const PORT = process.env.PORT || 8000;
const HOSTNAME = "0.0.0.0";
const OSC_RECV_PORT = 7400;
const OSC_SEND_PORT = 7401;

// ウェブサーバー/OSC受信ポートの設定
const app = express();
const server = http.createServer(app);
const webSocket = socketIO(server);
const recvOSCSocket = dgram.createSocket("udp4");

app.use(express.static(__dirname));

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${ ip.address() }:${ PORT }`);
});

recvOSCSocket.bind(OSC_RECV_PORT, "127.0.0.1");

// OSCメッセージのルーティング用の変数
let oscMode = 0; // 0: random, 1:round robin, 2:all
let rotate  = 0;

// OSCメッセージを受信した時の処理
recvOSCSocket.on("message", (buffer) => {
  const msg = prettyOSC(osc.fromBuffer(buffer));

  console.log("recv: %s", JSON.stringify(msg));

  if (msg.address === "/server/mode") {
    oscMode = Math.floor(msg.args[0]);
  } else {
    const socket = selectTarget(oscMode);

    if (socket) {
      socket.emit("osc", msg);
    }
  }
});

// ブラウザからの接続があった時の処理
webSocket.on("connect", (socket) => {
  // ブラウザからOSCメッセージが送信された時
  socket.on("osc", (msg) => {
    // 外部アプリケーションへメッセージを転送する
    sendOSCMessage(msg);
  });
});

// OSCメッセージを送信するターゲットを選択する関数
function selectTarget(mode) {
  if (mode === 2) {
    // all
    return webSocket;
  }

  // すべての接続を配列として取得する
  const sockets = values(webSocket.clients().sockets);

  if (mode === 1) {
    // round robin
    return sockets[rotate++ % sockets.length];
  }

  // random
  return sockets[Math.floor(Math.random() * sockets.length)];
}

// 外部アプリケーションへOSCメッセージを送信する関数
function sendOSCMessage(msg) {
  const buffer = osc.toBuffer(msg);
  const socket = dgram.createSocket("udp4");

  socket.send(buffer, 0, buffer.length, OSC_SEND_PORT, "127.0.0.1");
}

// OSCメッセージをJavaScriptで扱いやすい形に変換する関数
function prettyOSC(msg) {
  if (msg.elements) {
    msg = msg.elements[0];
  }
  return { address: msg.address, args: msg.args.map(x => x.value) };
}
