/*
    Codeslate Engine

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://codeslate.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.codeslate.engine.measurer", function(exports) {
    /*
        The measurer measures the height of each line in the `editorInput` part.
        This ensures that line numbers in the gutter are vertically aligned to
        their respective lines.
    */

    exports.getLineTopDistances = function(cseInstance, from = 0, to = null) {
        var editorMeasurerElement = null;

        from = Math.max(from, 0);

        var lineTopDistances = new Array(from).fill(0);

        cseInstance.withPart("editorMeasurer", function(element) {
            editorMeasurerElement = element;
        });

        cseInstance.withPart("editorInput", function(editorInputElement) {
            var linesToInsert = editorInputElement.innerHTML.split("\n");

            if (to == null) {
                to = linesToInsert.length;
            }

            editorMeasurerElement.innerHTML = linesToInsert.slice(0, from).join("\n");
            editorMeasurerElement.style.width = editorInputElement.clientWidth;

            for (var i = from; i < to; i++) {
                lineTopDistances.push(editorMeasurerElement.clientHeight);

                editorMeasurerElement.innerHTML += linesToInsert[i] + "\n";
            }

            lineTopDistances.pop();
        });

        return lineTopDistances;
    };
});