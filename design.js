/*
    Codeslate Engine

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://codeslate.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.codeslate.engine.design", function(exports) {
    var styler = require("com.subnodal.codeslate.engine.styler");

    exports.defaultTheme = {
        codeFont: `"Overpass Mono", "Roboto Mono", monospace`,
        uiFont: `"Overpass", "Roboto", sans-serif`,
        background: "#072047",
        gutter: "#0b2f68",
        text: "white"
    };

    exports.createStyler = function(theme = exports.defaultTheme) {
        var newStyler = new styler.Styler();

        function addStyle(style) {
            newStyler.styleCollection.push(style);
        }
    
        addStyle(new styler.Style("editorSpace", `
            position: relative;
            width: 100%;
            height: 100%;
            background-color: ${theme.background};
            font-family: ${theme.uiFont};
        `));

        addStyle(new styler.Style("editorGutter", `
            position: absolute;
            top: 0;
            left: 0;
            width: 3em;
            height: 100%;
            background-color: ${theme.gutter};
            font-family: ${theme.codeFont};
        `));

        addStyle(new styler.Style("editorInput", `
            position: absolute;
            top: 0;
            left: 3em;
            width: calc(100% - 3.2em);
            height: 100%;
            padding-left: 0.2em;
            font-family: ${theme.codeFont};
            color: ${theme.text};
            overflow: auto;
            outline: none;
        `));

        return newStyler;
    };
});