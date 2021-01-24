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
    var gutter = require("com.subnodal.codeslate.engine.gutter");

    exports.CodeslateEngine = class {
        constructor(rootElement, options = {}) {
            this.rootElement = rootElement;
            this.options = options;

            this.id = "";

            var randomIdDigits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

            for (var i = 0; i < 16; i++) {
                this.id += randomIdDigits.charAt(Math.floor(Math.random() * randomIdDigits.length));
            }

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
            var thisScope = this;

            var styleElement = document.createElement("style");

            styleElement.setAttribute("cse-part", "style");

            var editorSpaceElement = document.createElement("div");

            editorSpaceElement.setAttribute("cse-part", "editorSpace");

            var editorGutterElement = document.createElement("div");

            editorGutterElement.setAttribute("cse-part", "editorGutter");
            editorSpaceElement.appendChild(editorGutterElement);

            var editorInputElement = document.createElement("div");

            editorInputElement.setAttribute("cse-part", "editorInput");
            editorInputElement.setAttribute("contenteditable", "true");
            editorInputElement.setAttribute("spellcheck", "false");

            var editorMeasurerElement = document.createElement("div");

            editorMeasurerElement.setAttribute("cse-part", "editorMeasurer");
            editorMeasurerElement.setAttribute("aria-hidden", "true");

            editorSpaceElement.appendChild(editorInputElement);
            editorSpaceElement.appendChild(editorMeasurerElement);

            this.rootElement.appendChild(styleElement);
            this.rootElement.appendChild(editorSpaceElement);

            this.rootElement.setAttribute("dir", "ltr");
            this.rootElement.setAttribute("cse-id", this.id);

            input.register(this);

            this.render();

            setTimeout(function() {
                gutter.render(thisScope, true);                
            });
        }

        render(from = 0, to = null) {
            var thisScope = this;
            var hasUpdatedInput = false;
            
            if (to == null) {
                to = this.code.split("\n").length;
            }

            this.withPart("style", function(styleElement) {
                styleElement.innerHTML = design.createStyler(thisScope).generate(thisScope);
            });

            this.withPart("editorInput", function(editorInputElement) {
                hasUpdatedInput = formatter.format(thisScope, editorInputElement, from, to) || hasUpdatedInput;
            });

            return hasUpdatedInput;
        }

        withPart(partName, callback) {
            var parts = this.rootElement.querySelectorAll(`[cse-id="${this.id}"] [cse-part="${partName}"]`);

            for (var i = 0; i < parts.length; i++) {
                callback(parts[i], i);
            }
        }
    };
});