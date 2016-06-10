function mtof(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function loadAudioBuffer(url, callback) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";

  xhr.onload = function() {
    if (xhr.response) {
      window.audioContext.decodeAudioData(xhr.response, callback);
    }
  };

  xhr.send();
}
