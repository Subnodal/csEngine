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
        lineNumber: "#98b4e0",
        lineNumberIndent: "white",
        caret: "#dbe21e",
        selection: "#4688f2",
        text: "white",
        definition: "#1ee2ae; font-weight: bold;",
        keyword: "#1ee2ae",
        string: "#1faee2",
        number: "#a0c5ff",
        operator: "#448dff",
        atom: "#1faee2",
        comment: "#536889; font-style: italic;"
    };

    exports.createStyler = function(cseInstance) {
        var newStyler = new styler.Styler();

        function addStyle(style) {
            newStyler.styleCollection.push(style);
        }

        var options = cseInstance.options || {};
        var theme = {...exports.defaultTheme, ...(options.theme || {})};
    
        addStyle(new styler.Style("editorSpace", `
            position: relative;
            width: 100%;
            height: 100%;
            background-color: ${theme.background};
            font-size: 16px;
            font-family: ${theme.uiFont};
            overflow: hidden;
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

        addStyle(new styler.Style("editorGutterLine", `
            position: absolute;
            right: 0.5em;
            color: ${theme.lineNumber};
            user-select: none;
        `));

        addStyle(new styler.Style("editorGutterLine", `
            color: ${theme.lineNumberIndent};
            font-weight: bold;
        `, `[cse-indentmarker="true"]`));

        addStyle(new styler.Style("editorInput", `
            position: relative;
            display: inline-block;
            top: 0;
            left: 3em;
            width: calc(100% - 3.2em);
            height: calc(100% - 2em);
            padding-bottom: 2em;
            padding-left: 0.2em;
            font-family: ${theme.codeFont};
            line-height: 20px;
            color: ${theme.text};
            overflow: auto;
            white-space: ${options.wordWrap ? "pre-wrap" : "pre"};
            word-break: ${options.wordWrap ? "break-all" : "keep-all"};
            tab-size: ${options.tabWidth || 8};
            outline: none;
            caret-color: ${theme.caret};
        `));

        addStyle(new styler.Style("editorInput", `
            background: ${theme.selection};
        `, "::selection"));

        addStyle(new styler.Style("editorMeasurer", `
            position: absolute;
            top: 0;
            left: 3em;
            width: calc(100% - 3.2em);
            padding-left: 0.2em;
            font-family: ${theme.codeFont};
            line-height: 20px;
            color: ${theme.text};
            overflow: auto;
            white-space: ${options.wordWrap ? "pre-wrap" : "pre"};
            word-break: ${options.wordWrap ? "break-all" : "keep-all"};
            visibility: hidden;
        `));

        addStyle(new styler.Style("syntax", `
            background-color: ${theme.selection};
        `, "::selection"));

        addStyle(new styler.Style("syntax", `
            color: ${theme.definition};
        `, "[cse-syntax='definition']"));

        addStyle(new styler.Style("syntax", `
            color: ${theme.keyword};
        `, "[cse-syntax='keyword']"));

        addStyle(new styler.Style("syntax", `
            color: ${theme.string};
        `, "[cse-syntax='string']"));

        addStyle(new styler.Style("syntax", `
            color: ${theme.number};
        `, "[cse-syntax='number']"));

        addStyle(new styler.Style("syntax", `
            color: ${theme.operator};
        `, "[cse-syntax='operator']"));

        addStyle(new styler.Style("syntax", `
            color: ${theme.atom};
        `, "[cse-syntax='atom']"));

        addStyle(new styler.Style("syntax", `
            color: ${theme.comment};
        `, "[cse-syntax='comment']"));

        return newStyler;
    };
});