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
    var lastLineTopDistances = null;
    var roughCurrentLinePosition = null;
    var lastScrollTop = 0;
    var lastScrollSegment = 0;
    var lastTabbedLines = [];
    var ignoreNextTab = false;

    exports.Selection = class {
        constructor(start, end) {
            this.start = start;
            this.end = end;
        }
    };

    // `saveSelection` and `restoreSelection` based off of https://stackoverflow.com/a/13950376

    exports.saveSelection = function(inputElement) {
        if (window.getSelection().rangeCount == 0) {
            return new exports.Selection(0, 0);
        }

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

                if (foundStart && selection.end >= index && selection.end <= index) {
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
            linePosition = editorInputElement.innerText.substring(0, exports.saveSelection(editorInputElement).start).split("\n").length - 1;
        });

        return linePosition;
    };

    exports.register = function(cseInstance) {
        cseInstance.withPart("editorInput", function(editorInputElement) {
            roughCurrentLinePosition = exports.getCurrentLinePosition(cseInstance);

            function renderScrollChange(scrollingUpwards = false) {
                var selection = exports.saveSelection(editorInputElement);

                gutter.render(cseInstance);

                if (lastLineTopDistances == null) {
                    lastLineTopDistances = measurer.getLineTopDistances(cseInstance);
                }

                var currentFirstLine = 0;
                var currentLastLine = 0;

                for (var i = 0; i < lastLineTopDistances.length; i++) {
                    if (lastLineTopDistances[currentFirstLine + 1] > editorInputElement.scrollTop) {
                        break;
                    }

                    currentFirstLine++;
                }

                for (var i = 0; i < lastLineTopDistances.length; i++) {
                    if (lastLineTopDistances[currentLastLine + 1] > editorInputElement.scrollBottom) {
                        break;
                    }

                    currentLastLine++;
                }

                if (Math.abs((scrollingUpwards ? currentFirstLine : currentLastLine) - lastScrollSegment) < 25) {
                    return;
                }

                lastScrollSegment = currentFirstLine;

                if (cseInstance.render(Math.max(currentFirstLine - 50, 0), currentFirstLine + 100)) {
                    exports.restoreSelection(editorInputElement, selection);
                }
            }

            editorInputElement.addEventListener("keydown", function(event) {
                if (event.keyCode == 9) { // Tab
                    if (ignoreNextTab) {
                        return;
                    }

                    event.preventDefault();
                }

                if (event.keyCode == 13) { // Enter
                    lastLineTopDistances = null;
                    roughCurrentLinePosition = exports.getCurrentLinePosition(cseInstance);
                    
                    var lastLine = editorInputElement.innerText.split("\n")[roughCurrentLinePosition];
                    var indentOpenChars = ((cseInstance.options.languageData || {}).indentOpenChars || []);
                    var indentationChange = 0;

                    for (var i = 0; i < indentOpenChars.length; i++) {
                        if (lastLine.match(new RegExp(indentOpenChars[i].length > 1 ? `${indentOpenChars[i]}$` : `\\${indentOpenChars[i]}$`))) {
                            indentationChange++;

                            break;
                        }
                    }

                    document.execCommand("insertHTML", false, "\n" + (
                        (cseInstance.options.indentWithTab ? "\t" : " ").repeat(lastLine.search(/\S|$/) + (indentationChange * (cseInstance.options.indentBy || 4)))
                    ));

                    event.preventDefault();
                }

                if (event.keyCode == 8 && editorInputElement.innerHTML == "\n") { // Backspace
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
                lastScrollSegment = 0;
                lastTabbedLines = [];

                renderScrollChange();
                gutter.setIndentMarkers(cseInstance, lastTabbedLines);
            });

            editorInputElement.addEventListener("keyup", function(event) {
                var selection = exports.saveSelection(editorInputElement);

                if (event.keyCode == 65 && event.ctrlKey || event.keyCode == 17) { // Ctrl + A, Ctrl
                    return; // Prevent Ctrl + A from being cancelled by render updates
                }

                if (event.keyCode == 27) { // Esc
                    ignoreNextTab = true;

                    return; // Enables keyboard users to unfocus the editor
                }

                if (event.keyCode == 9) { // Tab
                    if (ignoreNextTab) {
                        ignoreNextTab = false;
                        return;
                    }

                    lastLineTopDistances = null;
                    roughCurrentLinePosition = exports.getCurrentLinePosition(cseInstance);

                    selection.start = selection.end;

                    exports.restoreSelection(editorInputElement, selection);

                    lastLineTopDistances = null;

                    var lines = editorInputElement.innerHTML.split("\n");
                    var spacesToIncrement = 0;

                    if (lastTabbedLines.length == 0) {
                        for (var i = roughCurrentLinePosition; i <= exports.getCurrentLinePosition(cseInstance); i++) {
                            lastTabbedLines.push(i);
                        }
                    }

                    for (var i = 0; i < lastTabbedLines.length; i++) {
                        var line = lastTabbedLines[i];
                        var indentationLevel = Math.floor(lines[line].search(/\S|$/) / (cseInstance.options.indentBy || 4));
                        var spacesToNextIndentation = (cseInstance.options.indentBy || 4) - (lines[line].search(/\S|$/) % (cseInstance.options.indentBy || 4));

                        if (!event.shiftKey) {
                            lines[line] = (cseInstance.options.indentWithTab ? "\t" : " ").repeat(spacesToNextIndentation) + lines[line];
                            spacesToIncrement += spacesToNextIndentation;
                        } else {
                            if (lines[line].search(/\S|$/) > 0) {
                                spacesToIncrement -= spacesToNextIndentation;
                            }

                            if (indentationLevel * (cseInstance.options.indentBy || 4) > 0) {
                                lines[line] = (cseInstance.options.indentWithTab ? "\t" : " ").repeat((indentationLevel - 1) * (cseInstance.options.indentBy || 4)) + lines[line].trimStart();
                            }
                        }
                    }

                    editorInputElement.innerHTML = lines.join("\n");

                    selection.end += spacesToIncrement;
                    selection.start = selection.end;

                    exports.restoreSelection(editorInputElement, selection);

                    event.preventDefault();

                    gutter.setIndentMarkers(cseInstance, lastTabbedLines);
                } else if (event.keyCode != 16) { // Shift
                    lastTabbedLines = [];

                    gutter.setIndentMarkers(cseInstance, lastTabbedLines);
                }
                
                if (event.keyCode != 9 && event.keyCode != 16 && event.keyCode != 37 && event.keyCode != 38 && event.keyCode != 39 && event.keyCode != 40) { // Tab, Shift, Left, Up, Right, Down
                    var indentCloseChars = (cseInstance.options.languageData || {}).indentCloseChars || [];
                    var lines = editorInputElement.innerHTML.split("\n");
                    var textLines = editorInputElement.innerText.split("\n");
                    var unindentMade = false;
                    
                    for (var i = 0; i < indentCloseChars.length; i++) {
                        if (textLines[roughCurrentLinePosition].match(new RegExp(indentCloseChars[i].length > 1 ? `^\\s*?${indentCloseChars[i]}$` : `^\\s*?\\${indentCloseChars[i]}$`))) {
                            selection.start -= Math.min(lines[roughCurrentLinePosition].search(/\S|$/), cseInstance.options.indentBy || 4);
                            selection.end -= Math.min(lines[roughCurrentLinePosition].search(/\S|$/), cseInstance.options.indentBy || 4);

                            lines[roughCurrentLinePosition] = lines[roughCurrentLinePosition].replace(new RegExp(`^\\s{0,${cseInstance.options.indentBy || 4}}`), "");
                            unindentMade = true;

                            break;
                        }
                    }

                    if (unindentMade) {
                        editorInputElement.innerHTML = lines.join("\n");

                        exports.restoreSelection(editorInputElement, selection);
                    }
                }

                if (cseInstance.render(Math.max(roughCurrentLinePosition - 50, 0), roughCurrentLinePosition + 50)) {
                    exports.restoreSelection(editorInputElement, selection);

                    lastLineTopDistances = null;
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
                    event.keyCode == 33 ||
                    event.keyCode == 34
                ) { // PgUp, PgDn
                    roughCurrentLinePosition = exports.getCurrentLinePosition(cseInstance);
                }

                if (event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 8) { // Left, Right, Backspace
                    if (window.getSelection().getRangeAt(0).getBoundingClientRect().left - editorInputElement.offsetLeft < 10) {
                        roughCurrentLinePosition = exports.getCurrentLinePosition(cseInstance);
                    }
                }
            });

            editorInputElement.addEventListener("paste", function(event) {
                setTimeout(function() {
                    lastLineTopDistances = null;
                    lastScrollSegment = 0;
                    lastTabbedLines = [];

                    renderScrollChange();

                    gutter.setIndentMarkers(cseInstance, lastTabbedLines);
                }, 1000);
            });

            editorInputElement.addEventListener("scroll", function() {
                renderScrollChange(editorInputElement.scrollTop < lastScrollTop);

                lastScrollTop = editorInputElement.scrollTop;
            });
        });
    };
});