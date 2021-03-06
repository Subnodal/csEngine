/*
    Codeslate Engine

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://codeslate.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.codeslate.engine.gutter", function(exports) {
    var measurer = require("com.subnodal.codeslate.engine.measurer");

    var lastMeasurement = null;
    var lastLineCount = null;

    exports.render = function(cseInstance, remeasureLines = false, from = 0, to = null) {
        var lineCountChanged = false;

        if (lastMeasurement == null || remeasureLines) {
            lastMeasurement = measurer.getLineTopDistances(cseInstance, from, to);

            if (lastLineCount != lastMeasurement.length) {
                lineCountChanged = true;
                lastLineCount = lastMeasurement.length;
            }
        }

        var editorInputElement = null;
        var editorMeasurerElement = null;

        cseInstance.withPart("editorInput", function(element) {
            editorInputElement = element;
        });

        cseInstance.withPart("editorMeasurer", function(element) {
            editorMeasurerElement = element;
        });

        cseInstance.withPart("editorGutter", function(editorGutterElement) {
            if (lineCountChanged) {
                editorGutterElement.innerHTML = "";
            }

            for (var i = 0; i < lastLineCount; i++) {
                var editorGutterLineElement = null;
                var isGutterLineNew = false;

                if (editorGutterElement.querySelectorAll(`[cse-part="editorGutterLine"][cse-line="${i}"]`).length > 0) {
                    editorGutterLineElement = editorGutterElement.querySelectorAll(`[cse-part="editorGutterLine"][cse-line="${i}"]`)[0];
                } else {
                    editorGutterLineElement = document.createElement("div");
                    
                    editorGutterLineElement.setAttribute("cse-part", "editorGutterLine");
                    editorGutterLineElement.setAttribute("cse-line", String(i));

                    isGutterLineNew = true;
                }

                editorGutterLineElement.innerText = String(i + 1);
                editorGutterLineElement.style.top = String(lastMeasurement[i] - editorInputElement.scrollTop) + "px";

                if (isGutterLineNew && lastMeasurement[i] - editorInputElement.scrollTop > -50) {
                    editorGutterElement.appendChild(editorGutterLineElement);
                }

                if (i == lastLineCount - 1) {
                    var gutterLineWidth = editorGutterLineElement.clientWidth + parseInt(getComputedStyle(editorGutterLineElement).fontSize);

                    gutterLineWidth = Math.max(gutterLineWidth, parseInt(getComputedStyle(editorGutterLineElement).fontSize) * 3);

                    editorGutterElement.style.width = gutterLineWidth + "px";
                    editorInputElement.style.left = gutterLineWidth + "px";

                    editorInputElement.style.width = `calc(100% - ${gutterLineWidth + 3}px)`;
                }
            }
        });
    };

    exports.setIndentMarkers = function(cseInstance, lines) {
        cseInstance.withPart("editorGutter", function(editorGutterElement) {
            var allEditorGutterElements = editorGutterElement.querySelectorAll(`[cse-part="editorGutterLine"]`);

            for (var i = 0; i < allEditorGutterElements.length; i++) {
                allEditorGutterElements[i].removeAttribute("cse-indentmarker");
            }

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var editorGutterLineElement = editorGutterElement.querySelectorAll(`[cse-part="editorGutterLine"][cse-line="${line}"]`)[0];

                editorGutterLineElement.setAttribute("cse-indentmarker", "true");
            }
        });
    };
});