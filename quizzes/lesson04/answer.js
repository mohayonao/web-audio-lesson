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
    var noiseFilter = audioContext.createBiquadFilter();
    var gain = audioContext.createGain();

    noise.start(t0);
    noise.stop(t1);
    noise.connect(noiseFilter);
    noise.onended = function() {
      gain.disconnect();
    };

    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 8000;
    noiseFilter.Q.value = 20;
    noiseFilter.connect(gain);

    gain.gain.value = amp;
    gain.connect(audioContext.destination);
  }

  function snare(t0, amp) {
    var t1 = t0 + 0.25;
    var t2 = t0 + 0.08;
    var headNoise = new PinkNoiseNode(audioContext);
    var headFilter = audioContext.createBiquadFilter();
    var headGain = audioContext.createGain();
    var snappyNoise = new PinkNoiseNode(audioContext);
    var snappyFilter = audioContext.createBiquadFilter();
    var snappyGain = audioContext.createGain();
    var snappyLFO = audioContext.createOscillator();
    var snappyLFOGain = audioContext.createGain();

    headNoise.start(t0);
    headNoise.stop(t1);
    headNoise.connect(headFilter);
    headNoise.onended = function() {
      headGain.disconnect();
    };

    headFilter.type = "lowpass";
    headFilter.frequency.value = 4200;
    headFilter.Q.value = 12;
    headFilter.connect(headGain);

    headGain.gain.setValueAtTime(amp, t0);
    headGain.gain.linearRampToValueAtTime(0, t1);
    headGain.connect(audioContext.destination);

    snappyNoise.start(t0);
    snappyNoise.stop(t2);
    snappyNoise.connect(snappyFilter);
    snappyNoise.onended = function() {
      snappyGain.disconnect();
    };

    snappyFilter.type = "highpass";
    snappyFilter.frequency.value = 8000;
    snappyFilter.Q.value = 12;
    snappyFilter.connect(snappyGain);

    snappyGain.gain.setValueAtTime(amp / 3, t0);
    snappyGain.gain.setValueAtTime(0, t2);
    snappyGain.connect(audioContext.destination);

    snappyLFO.frequency.value = 40;
    snappyLFO.start(t0);
    snappyLFO.stop(t1);
    snappyLFO.connect(snappyLFOGain);

    snappyLFOGain.gain.setValueAtTime(0.2, t0);
    snappyLFOGain.gain.linearRampToValueAtTime(0, t2);
    snappyLFOGain.connect(snappyGain.gain);
  }

  function kick(t0, amp) {
    var t1 = t0 + 0.25;
    var t2 = t0 + 0.08;
    var oscillator = audioContext.createOscillator();
    var noise = new PinkNoiseNode(audioContext);
    var noiseFilter = audioContext.createBiquadFilter();
    var noiseGain = audioContext.createGain();
    var waveShaper = audioContext.createWaveShaper();
    var gain = audioContext.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(40, t0);
    oscillator.frequency.linearRampToValueAtTime(10, t1);
    oscillator.start(t0);
    oscillator.stop(t1);
    oscillator.connect(waveShaper);
    oscillator.onended = function() {
      gain.disconnect();
    };

    noise.start(t0);
    noise.stop(t2);
    noise.connect(noiseFilter);

    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 1800;
    noiseFilter.Q.value = 6;
    noiseFilter.connect(noiseGain);

    noiseGain.gain.setValueAtTime(amp / 4, t0);
    noiseGain.gain.linearRampToValueAtTime(0, t2);
    noiseGain.connect(waveShaper);

    waveShaper.curve = distCurve;
    waveShaper.connect(gain);

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
    noiseFilter.frequency.value = mtof(midi) * 4;
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

    sched.insert(t0 + 0.0625, compose, { beat: beat });
  }

  // ここまで ---------------------------------------------------------------------------------------

  window.sketch.run();
});
