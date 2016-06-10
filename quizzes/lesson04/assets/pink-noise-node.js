(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PinkNoiseNode = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var noiseData = new Float32Array(44100 * 5);
var noiseBuffer = null;

// http://noisehack.com/generate-noise-web-audio-api/
var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

for (var i = 0, imax = noiseData.length; i < imax; i++) {
  var white = Math.random() * 2 - 1;

  b0 = 0.99886 * b0 + white * 0.0555179;
  b1 = 0.99332 * b1 + white * 0.0750759;
  b2 = 0.96900 * b2 + white * 0.1538520;
  b3 = 0.86650 * b3 + white * 0.3104856;
  b4 = 0.55000 * b4 + white * 0.5329522;
  b5 = -0.7616 * b5 - white * 0.0168980;

  noiseData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
  noiseData[i] *= 0.11;
  b6 = white * 0.115926;
}

function PinkNoiseNode(audioContext) {
  if (noiseBuffer === null) {
    noiseBuffer = audioContext.createBuffer(1, noiseData.length, audioContext.sampleRate);
    noiseBuffer.getChannelData(0).set(noiseData);
  }
  var bufferSource = audioContext.createBufferSource();

  bufferSource.buffer = noiseBuffer;
  bufferSource.loop = true;

  return bufferSource;
}

PinkNoiseNode.install = function() {
  Object.defineProperty(AudioContext.prototype, "createPinkNoise", {
    value: function() {
      return new PinkNoiseNode(this);
    },
    enumerable: false, writable: false, configurable: true
  });
};

module.exports = PinkNoiseNode;

},{}]},{},[1])(1)
});