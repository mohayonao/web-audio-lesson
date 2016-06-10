window.AudioContext = window.AudioContext || window.webkitAudioContext;

window.addEventListener("DOMContentLoaded", function() {
  "use strict";

  var audioContext = new AudioContext();
  var webSocket = io();

  // PCの場合、マウスのボタン押下をトリガーにする
  window.addEventListener("mousedown", function(e) {
    var x = e.pageX / window.innerWidth;
    var y = e.pageY / window.innerHeight;

    tap(x, y);

    e.preventDefault();
  });
  // スマホ/タブレットの場合、タッチをトリガーにする
  window.addEventListener("touchstart", function(e) {
    var touches = e.changedTouches;

    for (var i = 0; i < touches.length; i++) {
      var x = touches[i].pageX / window.innerWidth;
      var y = touches[i].pageY / window.innerHeight;

      tap(x, y);
    }

    e.preventDefault();
  });

  // ユーザーの操作があったとき
  // x, y は操作座標が [0..1) の範囲で渡される
  function tap(x, y) {
    var midi = sample([ 81, 79, 74, 72, 69 ]);
    var amp = 1;

    synth(audioContext.currentTime, midi, amp);
    sendTapMessage(midi, amp, x, y);

    window.sketch.push({ type: "ripple", x: x, y: y, dur: 0.1 });
  }

  // ユーティリティ関数

  // 配列からランダムに要素を取得する
  function sample(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // MIDIノート番号を周波数に変換する
  function mtof(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // ここから ---------------------------------------------------------------------------------------
  var audioContext = new AudioContext();

  webSocket.on("osc", function(msg) {
    console.log(msg);

    if (msg.address === "/tap") {
      var midi = msg.args[0];
      var amp = msg.args[1];
      var x = msg.args[2];
      var y = msg.args[3];

      synth(audioContext.currentTime, midi, amp);

      window.sketch.push({ type: "ripple", x: x, y: y, dur: 0.1 });
    }
  });

  function sendTapMessage(midi, amp, x, y) {
    webSocket.emit("osc", {
      address: "/tap",
      args: [ midi, amp, x, y ]
    });
  }

  function synth(t0, midi, amp) {
    var t1 = t0 + 0.1;
    var oscillator = audioContext.createOscillator();
    var gain = audioContext.createGain();

    oscillator.frequency.value = mtof(midi);
    oscillator.start(t0);
    oscillator.stop(t1);
    oscillator.connect(gain);

    gain.gain.setValueAtTime(amp * 0.25, t0);
    gain.gain.linearRampToValueAtTime(0, t1);
    gain.connect(audioContext.destination);
  }
  // ここまで ---------------------------------------------------------------------------------------

  window.sketch.run();
});
