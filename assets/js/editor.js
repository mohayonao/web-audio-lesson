(function() {
  "use strict";

  function forEach(elems, callback) {
    return Array.prototype.slice.call(elems).forEach(callback);
  }

  function getStorageKey(codeId) {
    return window.location.pathname + window.location.hash + ":" + codeId;
  }

  function saveCode(codeId, code) {
    var key = getStorageKey(codeId);

    localStorage.setItem(key, code);
  }

  function restoreCode(codeId) {
    var key = getStorageKey(codeId);

    return localStorage.getItem(key);
  }

  function removeCode(codeId) {
    var key = getStorageKey(codeId);

    return localStorage.removeItem(key);
  }

  function replace() {
    var editors = {};

    forEach(document.getElementsByClassName("editor"), function(textarea) {
      var content = textarea.value;
      var codeId = textarea.getAttribute("codeId");
      var editor = CodeMirror.fromTextArea(textarea, {
        lineNumbers: true, mode: "javascript", pollInterval: 1000
      });
      var rows = content.split("\n").length;

      rows = Math.max(10, rows);

      editor.setSize("100%", 25 + (rows * 20) + "px");

      editor.on("change", function() {
        saveCode(codeId, editor.getValue());
      });

      editor.$run = function() {
        window.lesson.run(editor.getValue());
      };
      editor.$stop = function() {
        window.lesson.stop();
      };
      editor.$revert = function() {
        editor.setValue(content);
        removeCode(codeId);
      };

      editors[codeId] = editor;

      var storedCode = restoreCode(codeId);

      if (storedCode) {
        editor.setValue(storedCode);
      }
    });

    forEach(document.getElementsByClassName("editor-btn"), function(button) {
      var codeId = button.getAttribute("codeId");
      var action = button.getAttribute("action");
      var editor = editors[codeId];

      if (editor && typeof editor["$" + action] === "function") {
        button.addEventListener("click", editor["$" + action]);
      }
    });
  }

  window.editor = { replace: replace };
})();
