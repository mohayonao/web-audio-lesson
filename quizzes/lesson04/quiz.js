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
    for (var i = 0; i < 16; i++) {
      items.push(sample([ 81, 79, 74, 72, 69 ]));
    }
    window.sketch.push({ type: "beam", x: x, y: y, dur: 4 });
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

  // シグモイド曲線を生成する
  function sigmoid(length, amount) {
    var values = new Float32Array(length);

    for (var i = 0; i < values.length; i++) {
      var x = ((i / values.length) - 0.5) * -amount * 2;
      var y = 1 / (1 + Math.pow(Math.E, x));

      values[i] = y;
    }

    return values;
  }

  // ここから ---------------------------------------------------------------------------------------
  var audioContext = new AudioContext();
  var sched = new WebAudioScheduler({ context: audioContext, timerAPI: WorkerTimer });
  var items = [];
  var distCurve = sigmoid(4096, 12);

  for (var i = 0; i < distCurve.length; i++) {
    distCurve[i] = distCurve[i] * 2 - 1;
  }

  startWebAudio(audioContext, true, function() {
    sched.start(compose, { beat: 0 });
  });

  var patterns = [
    "60204020 60204020 60204020 60204021",
    "00000000 60000000 00000000 60200000",
    "60000000 60000000 60000000 60000000"
  ].map(function(pattern) {
    return pattern = pattern.replace(/\s/g, "").split("").map(function(x) {
      return x / 10;
    });
  });

  // 課題
  // 1. index.html を編集して次の外部モジュールを読み込む
  //   "assets/web-audio-scheduler.js"
  //   "assets/worker-timer.js"
  //   "assets/pink-noise-node.js"
  // 2. compose() 関数を編集して 0.0625 秒間隔で compose() 関数を呼び出す
  // 3. ドラムの音を作る

  function hihat(t0, amp) {
    var t1 = t0 + 0.0125;
    var noise = new PinkNoiseNode(audioContext);
    var gain = audioContext.createGain();

    noise.start(t0);
    noise.stop(t1);
    noise.connect(gain);
    noise.onended = function() {
      gain.disconnect();
    };

    gain.gain.value = amp;
    gain.connect(audioContext.destination);
  }

  function snare(t0, amp) {
    var t1 = t0 + 0.25;
    var headNoise = new PinkNoiseNode(audioContext);
    var headGain = audioContext.createGain();

    headNoise.start(t0);
    headNoise.stop(t1);
    headNoise.connect(headGain);
    headNoise.onended = function() {
      headGain.disconnect();
    };

    headGain.gain.setValueAtTime(amp, t0);
    headGain.gain.linearRampToValueAtTime(0, t1);
    headGain.connect(audioContext.destination);
  }

  function kick(t0, amp) {
    var t1 = t0 + 0.25;
    var oscillator = audioContext.createOscillator();
    var gain = audioContext.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(40, t0);
    oscillator.frequency.linearRampToValueAtTime(10, t1);
    oscillator.start(t0);
    oscillator.stop(t1);
    oscillator.connect(gain);
    oscillator.onended = function() {
      gain.disconnect();
    };

    gain.gain.setValueAtTime(0.5, t0);
    gain.gain.linearRampToValueAtTime(0, t1);
    gain.connect(audioContext.destination);
  }

  function synth(t0, midi) {
    var t1 = t0 + 0.25;
    var noise = new PinkNoiseNode(audioContext);
    var noiseFilter = audioContext.createBiquadFilter();
    var gain = audioContext.createGain();

    noise.start(t0);
    noise.stop(t1);
    noise.connect(noiseFilter);
    noise.onended = function() {
      gain.disconnect();
    };

    noiseFilter.type = "bandpass";
    noiseFilter.Q.value = 40;
    noiseFilter.connect(gain);

    gain.gain.setValueAtTime(1, t0);
    gain.gain.linearRampToValueAtTime(0, t1);
    gain.connect(audioContext.destination);
  }

  function compose(e) {
    var t0 = e.playbackTime;
    var beat = e.args.beat % 32;

    if (items.length) {
      if (patterns[0][beat] !== 0) {
        hihat(t0, patterns[0][beat]);
        window.sketch.push({ type: "square", x: beat/32, y: 0.25, dur: 0.05 });
      }
      if (patterns[1][beat] !== 0) {
        snare(t0, patterns[1][beat]);
        window.sketch.push({ type: "ripple", x: beat/32, y: 0.5, dur: 0.15 });
      }
      if (patterns[2][beat] !== 0) {
        kick(t0, patterns[2][beat]);
      }
      if (items.length && beat % 2 === 0) {
        synth(t0, items.shift());
      }
      beat += 1;
    }
  }

  // ここまで ---------------------------------------------------------------------------------------

  window.sketch.run();
});
