(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.startWebAudio = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

function startWebAudio(audioContext) {
  var args = [].slice.call(arguments, 1);
  var elem = null;
  var requireUserAction = false;
  var callback = null;

  if (args[0] && typeof args[0].addEventListener === "function") {
    elem = args.shift();
  }
  if (typeof args[0] !== "undefined" && typeof args[0] !== "function") {
    requireUserAction = !!args.shift();
  }
  if (typeof args[0] === "function") {
    callback = args.shift();
  }
  if (typeof callback !== "function") {
    callback = function() { /* noop */ };
  }

  elem = elem || global;

  var ua = global.navigator ? global.navigator.userAgent : "";
  var touchEventIsEnabled = ("ontouchstart" in elem);

  if (!requireUserAction && !/iPhone|iPad|iPod/.test(ua)) {
    startWebAudio.done = true;
    setTimeout(callback, 0);
    return;
  }

  function chore(e) {
    if (!startWebAudio.done) {
      play(audioContext, function() {
        startWebAudio.done = true;
        if (touchEventIsEnabled) {
          elem.removeEventListener("touchstart", chore, true);
          elem.removeEventListener("touchend", chore, true);
        } else {
          elem.removeEventListener("mousedown", chore, true);
        }
        callback();
      });
    }
  }

  if (touchEventIsEnabled) {
    elem.addEventListener("touchstart", chore, true);
    elem.addEventListener("touchend", chore, true);
  } else {
    elem.addEventListener("mousedown", chore, true);
  }
};

var memo = [];

function play(audioContext, callback) {
  var bufSrc = audioContext.createBufferSource();

  bufSrc.buffer = audioContext.createBuffer(1, 2, audioContext.sampleRate);
  bufSrc.start(audioContext.currentTime);
  bufSrc.connect(audioContext.destination);

  // clean up audio graph
  bufSrc.onended = function() {
    memo.splice().forEach(function(bufSrc) {
      bufSrc.disconnect();
    });
    if (typeof callback === "function") {
      callback();
    }
  };
  memo.push(bufSrc);
}

startWebAudio.done = false;

module.exports = startWebAudio;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});