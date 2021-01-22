/*
    Codeslate Engine

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://codeslate.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.codeslate.engine.input", function(exports) {
    var measurer = require("com.subnodal.codeslate.engine.measurer");
    var gutter = require("com.subnodal.codeslate.engine.gutter");

    var gutterRenderTimeout = null;
    var roughCurrentLinePosition = null;

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

    exports.getCurrentLinePosition = function(cseInstance) {
        var linePosition = 0;

        cseInstance.withPart("editorInput", function(editorInputElement) {
            if (window.getSelection().rangeCount == 0) {
                return;
            }

            var caretTop = window.getSelection().getRangeAt(0).getBoundingClientRect().top + editorInputElement.scrollTop;
            var lineTopDistances = measurer.getLineTopDistances(cseInstance, (roughCurrentLinePosition || 0) - 50, (roughCurrentLinePosition || 0) + 50);

            for (var i = 0; i < lineTopDistances.length; i++) {
                if (i == lineTopDistances.length - 1 || caretTop < lineTopDistances[i + 1]) {
                    linePosition = i;

                    break;
                }
            }
        });

        return linePosition;
    };

    exports.register = function(cseInstance) {
        cseInstance.withPart("editorInput", function(editorInputElement) {
            roughCurrentLinePosition = exports.getCurrentLinePosition(cseInstance);

            editorInputElement.addEventListener("keydown", function(event) {
                if (event.keyCode == 9) { // Tab
                    event.preventDefault();
                }

                if (event.keyCode == 13) { // Enter
                    document.execCommand("insertHTML", false, "\n");

                    event.preventDefault();
                }

                if (event.keyCode == 38 && roughCurrentLinePosition > 0) { // Up
                    roughCurrentLinePosition--;
                } else if ((event.keyCode == 40 || event.keyCode == 13) && roughCurrentLinePosition < editorInputElement.innerHTML.split("\n").length) { // Down, Enter
                    roughCurrentLinePosition++;
                }
            });

            editorInputElement.addEventListener("click", function(event) {
                roughCurrentLinePosition = exports.getCurrentLinePosition(cseInstance);
            });

            editorInputElement.addEventListener("keyup", function(event) {
                var selection = exports.saveSelection(editorInputElement);

                // TODO: Add tab size configurability
                // TODO: Add ability to select multiple lines to indent
                if (event.keyCode == 9) { // Tab
                    var lines = editorInputElement.innerHTML.split("\n");
                    var indentationLevel = Math.floor(lines[roughCurrentLinePosition].search(/\S|$/) / 4);
                    var spacesToNextIndentation = 4 - (lines[roughCurrentLinePosition].search(/\S|$/) % 4);

                    if (!event.shiftKey) {
                        lines[roughCurrentLinePosition] = " ".repeat(spacesToNextIndentation) + lines[roughCurrentLinePosition];
                        editorInputElement.innerHTML = lines.join("\n");

                        selection.start += spacesToNextIndentation;
                        selection.end += spacesToNextIndentation;
                    } else {
                        selection.start -= Math.max(spacesToNextIndentation, 0);
                        selection.end -= Math.max(spacesToNextIndentation, 0);

                        lines[roughCurrentLinePosition] = " ".repeat((indentationLevel - 1) * 4) + lines[roughCurrentLinePosition].trimStart();
                        editorInputElement.innerHTML = lines.join("\n");
                    }

                    event.preventDefault();

                    exports.restoreSelection(editorInputElement, selection);

                    roughCurrentLinePosition = exports.getCurrentLinePosition(cseInstance);
                }

                if (cseInstance.render(Math.max(roughCurrentLinePosition - 50, 0), roughCurrentLinePosition + 50)) {
                    exports.restoreSelection(editorInputElement, selection);
                }

                if (gutterRenderTimeout != null) {
                    clearTimeout(gutterRenderTimeout);
                }

                gutterRenderTimeout = setTimeout(function() {
                    gutter.render(cseInstance, true);
                }, 100);

                if (window.getSelection().getRangeAt(0).getBoundingClientRect().left < editorInputElement.getBoundingClientRect().left) {
                    editorInputElement.scrollLeft = 0;
                }

                if (window.getSelection().getRangeAt(0).getBoundingClientRect().top > editorInputElement.getBoundingClientRect().bottom - parseInt(getComputedStyle(editorInputElement).paddingBottom)) {
                    editorInputElement.scrollTop = editorInputElement.scrollHeight + (editorInputElement.offsetHeight - editorInputElement.clientHeight);
                }

                if (
                    event.keyCode == 37 ||
                    event.keyCode == 39 ||
                    event.keyCode == 8 ||
                    event.keyCode == 33 ||
                    event.keyCode == 34 ||
                    event.keyCode == 35 ||
                    event.keyCode == 36
                ) { // Left, Right, Backspace, PgUp, PgDn, Home, End
                    roughCurrentLinePosition = exports.getCurrentLinePosition(cseInstance);
                }
            });

            editorInputElement.addEventListener("paste", function(event) {
                setTimeout(function() {
                    for (var i = 0; i < editorInputElement.innerText.split("\n").length; i += 10) {
                        (function(i) {
                            setTimeout(function() {
                                var selection = exports.saveSelection(editorInputElement);
        
                                if (cseInstance.render(i, i + 10)) {
                                    exports.restoreSelection(editorInputElement, selection);
                                }

                                gutter.render(cseInstance, true);
                            }, i * 5);
                        })(i);
                    }
    
                    if (gutterRenderTimeout != null) {
                        clearTimeout(gutterRenderTimeout);
                    }
                    }, 1000);
            });

            editorInputElement.addEventListener("scroll", function(event) {
                gutter.render(cseInstance);
            });
        });
    };
});