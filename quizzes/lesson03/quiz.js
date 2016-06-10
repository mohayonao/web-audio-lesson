window.AudioContext = window.AudioContext || window.webkitAudioContext;

window.addEventListener("DOMContentLoaded", function() {
  "use strict";

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
    var pos = x;
    var buffer = rateAt(instruments, y);

    synth(buffer, pos);

    window.sketch.push({ type: "square", x: x, y: y, dur: 0.5 });
  }

  // ユーティリティ関数

  // 配列の要素を割合で取得
  // list の (長さ * rate) の位置の要素を取得する
  function rateAt(list, rate) {
    return list[Math.floor(list.length * Math.max(0, Math.min(rate, 1)))];
  }

  // ここから ---------------------------------------------------------------------------------------
  var audioContext = new AudioContext();
  var instruments = [];

  // 課題
  // 1. ファイルを読み込んでデコードする ferchAsAudioBuffer() 関数を実装する
  // 2. ferchAsAudioBuffer() 関数を使って次のオーディオサンプルを読み込んで、 instruments[] 配列に代入する
  //   "assets/piano-high.wav"
  //   "assets/piano-mid.wav"
  //   "assets/piano-low.wav"


  function synth(audioBuffer, pos) {
    if (!audioBuffer) {
      return;
    }
    var dur = audioBuffer.duration / 48;
    var startTime = dur * Math.floor(pos * 48);
    var t0 = audioContext.currentTime;
    var bufSrc = audioContext.createBufferSource();
    var gain = audioContext.createGain();

    bufSrc.buffer = audioBuffer;
    bufSrc.start(t0, startTime, dur);
    bufSrc.connect(gain);
    bufSrc.onended = function() {
      gain.disconnect();
    };

    gain.gain.value = 0.5;
    gain.connect(audioContext.destination);
  }
  // ここまで ---------------------------------------------------------------------------------------

  window.sketch.run();
});
