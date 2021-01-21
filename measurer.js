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

    exports.getLineTopDistances = function(cseInstance) {
        var editorMeasurerElement = null;
        var lineTopDistances = [];

        cseInstance.withPart("editorMeasurer", function(element) {
            editorMeasurerElement = element;
        });

        cseInstance.withPart("editorInput", function(editorInputElement) {
            var linesToInsert = editorInputElement.innerHTML.split("\n");

            editorMeasurerElement.innerHTML = "";
            editorMeasurerElement.style.width = editorInputElement.clientWidth;

            for (var i = 0; i < linesToInsert.length; i++) {
                lineTopDistances.push(editorMeasurerElement.clientHeight);

                editorMeasurerElement.innerHTML += linesToInsert[i] + "\n";
            }

            lineTopDistances.pop();
        });

        return lineTopDistances;
    };
});