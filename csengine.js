/*
    Codeslate Engine

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://codeslate.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.codeslate.engine", function(exports) {
    var design = require("com.subnodal.codeslate.engine.design");

    exports.CodeslateEngine = class {
        constructor(rootElement, options = {}) {
            this.rootElement = rootElement;
            this.options = options;

            this.code = rootElement.innerText;

            if (this.options.autoInject != false) {
                this.inject();
            }
        }

        inject() {
            var styleElement = document.createElement("style");

            styleElement.setAttribute("cs-part", "style");
            styleElement.innerHTML = design.createStyler().generate();

            var editorSpaceElement = document.createElement("div");

            editorSpaceElement.setAttribute("cs-part", "editorSpace");

            var editorGutterElement = document.createElement("div");

            editorGutterElement.setAttribute("cs-part", "editorGutter");
            editorSpaceElement.appendChild(editorGutterElement);

            var editorInputElement = document.createElement("div");

            editorInputElement.setAttribute("cs-part", "editorInput");
            editorInputElement.setAttribute("contenteditable", "true");
            editorSpaceElement.appendChild(editorInputElement);

            this.rootElement.appendChild(styleElement);
            this.rootElement.appendChild(editorSpaceElement);
        }

        withPart(partName, callback) {
            var parts = this.rootElement.querySelectorAll(`[cs-part="${partName}"]`);

            for (var i = 0; i < parts.length; i++) {
                callback(parts[i], i);
            }
        }
    };
});