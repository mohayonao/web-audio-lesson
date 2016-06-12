window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.instruments = [];

window.addEventListener("DOMContentLoaded", function() {
  "use strict";

  // -- web audio api hack --
  var audioContext = new AudioContext();
  var originalDestination = audioContext.destination;

  StereoPannerNode.polyfill();

  fetchAsAudioBuffer(audioContext, [
    "assets/audio/piano.wav",
    "assets/audio/buzz.wav",
    "assets/audio/ch.wav",
    "assets/audio/sd.wav",
    "assets/audio/bd.wav",
  ]).then(function(items) {
    Array.prototype.push.apply(window.instruments, items);
  });

  Object.defineProperty(audioContext, "destination", {
    value: null, enumeratble: false, writable: true, configurable: true
  });

  function resetAudioContext() {
    var destination = audioContext.createGain();

    destination.fftSize = 256;

    if (audioContext.destination) {
      audioContext.destination.disconnect();
    }

    audioContext.destination = destination;
    audioContext.destination.connect(originalDestination);
  }
  resetAudioContext();

  // -- timer api hack --
  var setInterval = window.setInterval;
  var setTimeout = window.setTimeout;
  var timerIds = [];

  window.setInterval = function() {
    return timerIds[timerIds.push(setInterval.apply(window, arguments)) - 1];
  };
  window.setTimeout = function() {
    return timerIds[timerIds.push(setTimeout.apply(window, arguments)) - 1];
  };

  function resetTimerAPI() {
    timerIds.splice(0).forEach(function(timerId) {
      clearInterval(timerId);
      clearTimeout(timerId);
    });
  }

  function reset() {
    resetAudioContext();
    resetTimerAPI();
  }

  // -- lesson builder --
  function buildLesson(markdown) {
    var lines = markdown.split("\n");
    var title = lines.shift().replace(/^#\s+/, "");
    var body = lines.join("\n").trim();
    var content = document.getElementById("content");

    document.getElementById("title").textContent = title;

    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }

    content.innerHTML = renderer.render(body);
    editor.replace();

    prettyPrint();

    window.scrollTo(0, 0);
  }

  function onhashchange() {
    var hash = window.location.hash;
    var url = hash === "" ? "index.md" : "lessons/" + hash.substr(1) + ".md";

    fetch(url).then(function(res) {
      return res.text();
    }).then(buildLesson).catch(function(e) {
      console.error(e)
    });
  }
  onhashchange();

  window.addEventListener("hashchange", onhashchange);

  // -- exports --
  window.audioContext = audioContext;

  window.lesson = {
    run: function(code) {
      reset();
      window.eval(code);
    },
    stop: function() {
      reset();
    },
  };
});
