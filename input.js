/*
    Codeslate Engine

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://codeslate.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.codeslate.engine.input", function(exports) {
    exports.Selection = class {
        constructor(start, end) {
            this.start = start;
            this.end = end;
        }
    };

    // `saveSelection` and `restoreSelection` based off of https://stackoverflow.com/a/13950376

    exports.saveSelection = function(inputElement) {
        var range = window.getSelection().getRangeAt(0);
        var startRange = range.cloneRange();

        startRange.selectNodeContents(inputElement);
        startRange.setEnd(range.startContainer, range.startOffset);

        return new exports.Selection(startRange.toString().length, startRange.toString().length + range.toString().length);
    };

    exports.restoreSelection = function(inputElement, selection) {
        var index = 0;
        var range = document.createRange();

        range.setStart(inputElement, 0);
        range.collapse(true);

        var elementStack = [inputElement];
        var element = null;
        var foundStart = false;
        var shouldStop = false;

        while (!shouldStop && (element = elementStack.pop())) {
            if (element.nodeType == Node.TEXT_NODE) {
                var nextIndex = index + element.length;

                if (!foundStart && selection.start >= index && selection.start <= nextIndex) {
                    range.setStart(element, selection.start - index);

                    foundStart = true;
                }

                if (foundStart && selection.end >= index && selection.end < index) {
                    range.setEnd(element, selection.end - index);

                    shouldStop = true;
                }

                index = nextIndex;
            } else {
                var i = element.childNodes.length;

                while (i--) {
                    elementStack.push(element.childNodes[i]);
                }
            }
        }

        var newSelection = window.getSelection();

        newSelection.removeAllRanges();
        newSelection.addRange(range);
    };

    exports.register = function(cseInstance) {
        cseInstance.withPart("editorInput", function(editorInputElement) {
            editorInputElement.addEventListener("keydown", function(event) {
                if (event.keyCode == 13) {
                    document.execCommand("insertHTML", false, "\n");

                    event.preventDefault();
                }
            });

            editorInputElement.addEventListener("keyup", function(event) {
                var selection = exports.saveSelection(editorInputElement);

                if (cseInstance.render()) {
                    exports.restoreSelection(editorInputElement, selection);
                }
            });
        });
    };
});