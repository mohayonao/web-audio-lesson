(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.StereoPannerNode = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var AudioContext = global.AudioContext || global.webkitAudioContext;

var WS_CURVE_SIZE = 4096;
var curveL = new Float32Array(WS_CURVE_SIZE);
var curveR = new Float32Array(WS_CURVE_SIZE);
var curveDC = new Float32Array([ 1, 1 ]);

for (var i = 0; i < WS_CURVE_SIZE; i++) {
  curveL[i] = Math.cos((i / WS_CURVE_SIZE) * Math.PI * 0.5);
  curveR[i] = Math.sin((i / WS_CURVE_SIZE) * Math.PI * 0.5);
}

function StereoPannerNode(audioContext) {
  var splitter = audioContext.createChannelSplitter(2);
  var ws1 = audioContext.createWaveShaper();
  var paramGain = audioContext.createGain();
  var wsL = audioContext.createWaveShaper();
  var wsR = audioContext.createWaveShaper();
  var gainL = audioContext.createGain();
  var gainR = audioContext.createGain();
  var merger = audioContext.createChannelMerger(2);

  splitter.channelCount = 2;
  splitter.channelCountMode = "explicit";
  splitter.channelInterpretation = "speakers";
  splitter.connect(gainL, 0);
  splitter.connect(gainR, 1);
  splitter.connect(ws1, 1);

  ws1.channelCount = 1;
  ws1.channelCountMode = "explicit";
  ws1.channelInterpretation = "discrete";
  ws1.curve = curveDC;
  ws1.connect(paramGain);

  paramGain.channelCount = 1;
  paramGain.ChannelMergerNode = "explicit";
  paramGain.channelInterpretation = "discrete";
  paramGain.gain.value = 0;
  paramGain.connect(wsL);
  paramGain.connect(wsR);

  wsL.channelCount = 1;
  wsL.channelCountMode = "explicit";
  wsL.channelInterpretation = "discrete";
  wsL.curve = curveL;
  wsL.connect(gainL.gain);

  wsR.channelCount = 1;
  wsR.channelCountMode = "explicit";
  wsR.channelInterpretation = "discrete";
  wsR.curve = curveR;
  wsR.connect(gainR.gain);

  gainL.channelCount = 1;
  gainL.channelCountMode = "explicit";
  gainL.channelInterpretation = "discrete";
  gainL.gain.value = 0;
  gainL.connect(merger, 0, 0);

  gainR.channelCount = 1;
  gainR.channelCountMode = "explicit";
  gainR.channelInterpretation = "discrete";
  gainR.gain.value = 0;
  gainR.connect(merger, 0, 1);

  merger.channelCount = 1;
  merger.channelCountMode = "explicit";
  merger.channelInterpretation = "discrete";

  Object.defineProperties(splitter, {
    pan: {
      value: paramGain.gain,
      enumerable: true, writable: false, configurable: true
    },
    connect: {
      value: AudioNode.prototype.connect.bind(merger),
      enumerable: false, writable: false, configurable: true
    },
    disconnect: {
      value: AudioNode.prototype.disconnect.bind(merger),
      enumerable: false, writable: false, configurable: true
    }
  });

  return splitter;
}

StereoPannerNode.polyfill = function() {
  if (AudioContext && !AudioContext.prototype.hasOwnProperty("createStereoPanner")) {
    StereoPannerNode.install();
  }
};

StereoPannerNode.install = function() {
  Object.defineProperty(AudioContext.prototype, "createStereoPanner", {
    value: function() {
      return new StereoPannerNode(this);
    },
    enumerable: false, writable: false, configurable: true
  });
};

module.exports = StereoPannerNode;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});