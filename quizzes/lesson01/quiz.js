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
    var midi   = rateAt([ 81, 79, 74, 72, 69 ], y);
    var freq   = mtof(midi);
    var detune = sample([ -8, -3, 0, +3, +8 ]);
    var dur    = linlin(x, 0, 1, 0.05, 0.25);

    synth(audioContext.currentTime, freq, detune, dur);

    window.sketch.push({ type: "ripple", x: x, y: y, dur: dur });
  }

  // ユーティリティ関数

  // 配列の要素を割合で取得
  // list の (長さ * rate) の位置の要素を取得する
  function rateAt(list, rate) {
    return list[Math.floor(list.length * Math.max(0, Math.min(rate, 1)))];
  }

  // 値の線形変換
  // [inMin..inMax] の範囲の value を [outMin..outMax] の範囲にスケールする
  function linlin(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
  }

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

  function synth(t0, freq, detune, dur) {
    var t1 = t0 + dur;
    var oscillator1 = audioContext.createOscillator();
    var oscillator2 = audioContext.createOscillator();
    var gain1 = audioContext.createGain();
    var gain2 = audioContext.createGain();

    oscillator1.frequency.value = freq;
    oscillator1.detune.value = detune;
    oscillator1.start(t0);
    oscillator1.stop(t1);
    oscillator1.onended = function() {
      gain1.disconnect();
      gain2.disconnect();
    };

    oscillator2.frequency.value = freq * 4;
    oscillator2.start(t0);
    oscillator2.stop(t0 + 0.05);

    gain1.gain.value = 0.25;

    gain2.gain.value = 0.1;

    // 課題
    // 1. オーディオノードをそれぞれ接続する

  }
  // ここまで ---------------------------------------------------------------------------------------

  window.sketch.run();
});
