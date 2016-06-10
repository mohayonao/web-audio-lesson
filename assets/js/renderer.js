(function() {
  "use strict";

  var codeId = 0;
  var renderer = new marked.Renderer();

  function editor(body) {
    codeId += 1;

    return [
      "<button class='btn btn-xs btn-default editor-btn' codeId='" + codeId + "' action='run'>RUN</button>",
      "<button class='btn btn-xs btn-default editor-btn' codeId='" + codeId + "' action='stop'>STOP</button>",
      "<button class='btn btn-xs btn-default editor-btn' codeId='" + codeId + "' action='revert'>REVERT</button>",
      "<textarea class='editor' codeId='" + codeId + "'>" + body + "</textarea>"
    ].join("");
  }

  function escapeHTML(code) {
    code = code.replace(/&/g, "&amp;");
    code = code.replace(/</g, "&lt;");
    code = code.replace(/>/g, "&gt;");
    code = code.replace(/"/g, "&quot;");
    return code;
  }

  renderer.image = function(href) {
    href = href.replace(/^\.\.\//, "./");

    return  "<img src='" + href + "'/>"
  };

  renderer.code = function(code, lang) {
    if (lang !== "js") {
      return "<pre>" + escapeHTML(code) + "</pre>";
    }

    if (/^\/\*\s*editor\s*\*\//.test(code)) {
      return editor(code.split("\n").slice(1).join("\n"));
    }

    return "<pre class='prettyprint'>" + code + "</pre>";
  };

  renderer.table = function(header, body) {
    return "<table class='table table-bordered'>" + header + body + "</table>";
  };

  marked.setOptions({ renderer: renderer });

  function render(markdown) {
    codeId = 0;
    return marked(markdown);
  }

  window.renderer = { render: render };
})();
