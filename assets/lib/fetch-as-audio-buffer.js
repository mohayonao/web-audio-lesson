(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.fetchAsAudioBuffer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function fetchAsArrayBuffer(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";

    xhr.onload = function() {
      if (xhr.response) {
        resolve(xhr.response);
      }
    };
    xhr.onerror = reject;

    xhr.send();
  });
}

function decodeAudioData(audioContext, arrayBuffer) {
  return new Promise(function(resolve, reject) {
    audioContext.decodeAudioData(arrayBuffer, resolve, reject);
  });
}

function fetchAsAudioBuffer(audioContext, url) {
  if (Array.isArray(url)) {
    return Promise.all(url.map(function(url) {
      return fetchAsAudioBuffer(audioContext, url);
    }));
  }
  return fetchAsArrayBuffer(url).then(function(arrayBuffer) {
    return decodeAudioData(audioContext, arrayBuffer);
  });
}

module.exports = fetchAsAudioBuffer;

},{}]},{},[1])(1)
});