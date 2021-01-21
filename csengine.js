/*
    Codeslate Engine

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://codeslate.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.codeslate.engine", function(exports) {
    var input = require("com.subnodal.codeslate.engine.input");
    var design = require("com.subnodal.codeslate.engine.design");
    var formatter = require("com.subnodal.codeslate.engine.formatter");

    exports.CodeslateEngine = class {
        constructor(rootElement, options = {}) {
            this.rootElement = rootElement;
            this.options = options;

            var codeToInject = rootElement.innerHTML;

            this.rootElement.innerHTML = "";

            if (this.options.autoInject != false) {
                this.inject();
            }

            this.code = codeToInject;
        }

        get code() {
            var code = "";
            
            this.withPart("editorInput", function(editorInputElement) {
                code = editorInputElement.innerText.replace(/\n$/, "");
            });

            return code;
        }

        set code(code) {
            this.withPart("editorInput", function(editorInputElement) {
                if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
                    editorInputElement.innerText = code;
                } else {
                    editorInputElement.innerText = code + "\n";
                }
            });

            this.render();
        }

        inject() {
            var styleElement = document.createElement("style");

            styleElement.setAttribute("cs-part", "style");

            var editorSpaceElement = document.createElement("div");

            editorSpaceElement.setAttribute("cs-part", "editorSpace");

            var editorGutterElement = document.createElement("div");

            editorGutterElement.setAttribute("cs-part", "editorGutter");
            editorSpaceElement.appendChild(editorGutterElement);

            var editorInputElement = document.createElement("div");

            editorInputElement.setAttribute("cs-part", "editorInput");
            editorInputElement.setAttribute("contenteditable", "true");
            editorInputElement.setAttribute("spellcheck", "false");

            editorSpaceElement.appendChild(editorInputElement);

            this.rootElement.appendChild(styleElement);
            this.rootElement.appendChild(editorSpaceElement);

            input.register(this);

            this.render();
        }

        render() {
            var thisScope = this;
            var hasUpdatedInput = false;

            this.withPart("style", function(styleElement) {
                styleElement.innerHTML = design.createStyler(thisScope).generate();
            });

            this.withPart("editorInput", function(editorInputElement) {
                hasUpdatedInput = formatter.format(thisScope, editorInputElement) || hasUpdatedInput;
            });

            return hasUpdatedInput;
        }

        withPart(partName, callback) {
            var parts = this.rootElement.querySelectorAll(`[cs-part="${partName}"]`);

            for (var i = 0; i < parts.length; i++) {
                callback(parts[i], i);
            }
        }
    };
});