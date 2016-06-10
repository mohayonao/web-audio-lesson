(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.BrownNoiseNode = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var noiseData = new Float32Array(44100 * 5);
var noiseBuffer = null;

// http://noisehack.com/generate-noise-web-audio-api/
var lastOut = 0;

for (var i = 0, imax = noiseData.length; i < imax; i++) {
  var white = Math.random() * 2 - 1;

  noiseData[i] = (lastOut + (0.02 * white)) / 1.02;
  lastOut = noiseData[i];
  noiseData[i] *= 3.5; // (roughly) compensate for gain
}

function BrownNoiseNode(audioContext) {
  if (noiseBuffer === null) {
    noiseBuffer = audioContext.createBuffer(1, noiseData.length, audioContext.sampleRate);
    noiseBuffer.getChannelData(0).set(noiseData);
  }
  var bufferSource = audioContext.createBufferSource();

  bufferSource.buffer = noiseBuffer;
  bufferSource.loop = true;

  return bufferSource;
}

BrownNoiseNode.install = function() {
  Object.defineProperty(AudioContext.prototype, "createBrownNoise", {
    value: function() {
      return new BrownNoiseNode(this);
    },
    enumerable: false, writable: false, configurable: true
  });
};

module.exports = BrownNoiseNode;

},{}]},{},[1])(1)
});