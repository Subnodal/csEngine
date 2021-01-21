/*
    Codeslate Engine

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://codeslate.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.codeslate.engine.formatter", function(exports) {
    function escapeCode(code) {
        return code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
        ;
    }

    function parseSyntaxTree(code, syntax) {
        for (var i = 0; i < syntax.length; i++) {
            var syntaxProperties = syntax[i];

            code = code.replace(
                new RegExp(escapeCode(syntaxProperties.regex || ""), "g"),
                function() {
                    return `<span cs-part="syntax" cs-syntax="${syntaxProperties.type || ""}">${parseSyntaxTree(arguments[Number(syntaxProperties.match || 0)], syntaxProperties.subSyntax || {})}</span>`;
                }
            );
        }

        return code;
    }

    function normaliseHtml(code) {
        return code.trim()
            .replace(/&nbsp;/g, "\xA0")
            .replace(/<div>/g, "")
            .replace(/<\/div>/g, "")
            .replace(/<br>/g, "")
            .replace(/\n/g, "")
            .trim()
        ;
    }

    exports.format = function(cseInstance, target) {
        var options = cseInstance.options || {};
        var languageData = options.languageData || {};

        var formattedLines = parseSyntaxTree(escapeCode(target.innerText), languageData.syntax || {}).split("\n");

        var newContents = "";

        for (var i = 0; i < formattedLines.length; i++) {
            newContents += `${formattedLines[i]}\n`;
        }

        if (normaliseHtml(target.innerHTML) != normaliseHtml(newContents)) {
            target.innerHTML = newContents.replace(/\n$/, "");

            return true;
        }

        return false;
    };
});