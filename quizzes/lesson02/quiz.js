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
    var midi = rateAt([ 81, 79, 74, 72, 69 ], y);
    var freq = mtof(midi);
    var dur = linlin(x, 0, 1, 0.5, 12);

    synth(audioContext.currentTime, freq, dur);

    window.sketch.push({ type: "beam", x: x, y: y, dur: dur });
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

  // MIDIノート番号を周波数に変換する
  function mtof(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // ここから ---------------------------------------------------------------------------------------
  var audioContext = new AudioContext();

  function synth(t0, freq, dur) {
    var t1 = t0 + dur * 0.2;
    var t2 = t1 + dur * 0.8;
    var ratio = 3.5;
    var fmCarrier = audioContext.createOscillator();
    var fmMod = audioContext.createOscillator();
    var fmModGain = audioContext.createGain();
    var gain = audioContext.createGain();

    fmCarrier.frequency.value = freq;
    fmCarrier.start(t0);
    fmCarrier.stop(t2);
    fmCarrier.connect(gain);
    fmCarrier.onended = function() {
      gain.disconnect();
    };

    fmMod.frequency.value = freq * ratio;
    fmMod.start(t0);
    fmMod.stop(t2);
    fmMod.connect(fmModGain);

    // 課題
    // 1. オーディオノードをそれぞれ接続する
    // 2. modGain と gain にそれぞれエンベロープを設定する
    //   modGain は線形関数的変化、 gain は指数関数的変化させる

    gain.connect(audioContext.destination);
  }
  // ここまで ---------------------------------------------------------------------------------------

  window.sketch.run();
});
