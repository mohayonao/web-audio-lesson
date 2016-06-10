window.sketch = (function() {
  "use strict";

  var canvas;
  var context;
  var animations = {};
  var objects = [];

  function run() {
    setup();

    function loop() {
      render();
      requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop);
  }

  function setup() {
    canvas = document.getElementById("canvas");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context = canvas.getContext("2d");
  }

  function render() {
    var t = Date.now();

    context.fillStyle = "rgba(255, 255, 255, 0.5)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    objects = objects.filter(function(object) {
      object.draw(t);

      return t < object.endTime;
    });
  }

  function push(params) {
    if (animations.hasOwnProperty(params.type)) {
      objects.push({
        draw: animations[params.type], x: params.x, y: params.y, startTime: Date.now(), endTime: Date.now() + params.dur * 1000
      });
    }
  }

  function linlin(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
  }

  animations.ripple = function(t) {
    var radius = linlin(t, this.startTime, this.endTime, 0, 1000);
    var a = Math.max(0, linlin(t, this.startTime, this.endTime, 0.8, 0));
    var x = linlin(this.x, 0, 1, 0, window.innerWidth);
    var y = linlin(this.y, 0, 1, 0, window.innerHeight);

    context.fillStyle = "rgba(255, 255, 255, 0.5)";
    context.strokeStyle = "rgba(247, 223, 30, " + a.toFixed(6) + ")";
    context.lineWidth = 64;
    context.beginPath();

    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.stroke();
  };

  animations.beam = function(t) {
    var width = linlin(t, this.startTime, this.endTime, 0, 500);
    var a = Math.max(0, linlin(t, this.startTime, this.endTime, 0.8, 0));
    var x = linlin(this.x, 0, 1, 0, window.innerWidth);
    var y = linlin(this.y, 0, 1, 0, window.innerHeight);
    var height = canvas.height;

    x = x - width * 0.5;
    y = 0;

    context.fillStyle = "rgba(247, 223, 30, " + a.toFixed(6) + ")";
    context.fillRect(x, y, width, height);
  };

  animations.square = function(t) {
    var x = linlin(this.x, 0, 1, 0, window.innerWidth);
    var y = linlin(this.y, 0, 1, 0, window.innerHeight);
    var baseSize = Math.min(window.innerWidth, window.innerHeight) * 0.25;

    context.strokeStyle = "#f7df1e";
    context.lineWidth = 2;

    for (var i = 0; i < 4; i++) {
      context.beginPath();

      var size = linlin(Math.random(), 0, 1, 2, baseSize);
      var offsetX = linlin(Math.random(), 0, 1, -baseSize, baseSize);
      var offsetY = linlin(Math.random(), 0, 1, -baseSize, baseSize);
      var x1 = x + offsetX - size * 0.5;
      var y1 = y + offsetY - size * 0.5;
      var x2 = x1 + size;
      var y2 = y1 + size;

      context.rect(x1, y1, x2 - x1, y2 - y1);
      context.stroke();
    }
  };

  return { run: run, push: push };
})();
