/*
    Codeslate Engine

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://codeslate.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.codeslate.engine.formatter", function(exports) {
    const HTML_ESCAPE_SYNTAX_OPEN = "\x02"; // STX
    const HTML_ESCAPE_SYNTAX_CLOSE = "\x03"; // ETX
    const HTML_ESCAPE_SYNTAX_END = "\x04"; // EOT
    const HTML_ESCAPE_SYNTAX_OPEN_SPELLCHECK = "\x05"; // ENQ

    function escapeHtml(code) {
        return code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
        ;
    }

    function replaceMarks(code) {
        return code
            .replace(new RegExp(HTML_ESCAPE_SYNTAX_OPEN, "g"), `<span cs-part="syntax" cs-syntax="`)
            .replace(new RegExp(HTML_ESCAPE_SYNTAX_CLOSE, "g"), `">`)
            .replace(new RegExp(HTML_ESCAPE_SYNTAX_END, "g"), `</span>`)
            .replace(new RegExp(HTML_ESCAPE_SYNTAX_OPEN_SPELLCHECK, "g"), `<span spellcheck="true" cs-part="syntax" cs-syntax="`)
        ;
    }

    function parseSyntaxTree(code, syntax) {
        for (var i = 0; i < syntax.length; i++) {
            var syntaxProperties = syntax[i];

            try {
                code = code.replace(
                    new RegExp(syntaxProperties.regex || "", "g" + (syntaxProperties.flags || "")),
                    function() {
                        return (
                            (syntaxProperties.spellcheck ? HTML_ESCAPE_SYNTAX_OPEN_SPELLCHECK : HTML_ESCAPE_SYNTAX_OPEN) +
                            (syntaxProperties.type || "") +
                            HTML_ESCAPE_SYNTAX_CLOSE +
                            parseSyntaxTree(arguments[Number(syntaxProperties.match || 0)], syntaxProperties.subSyntax || {}) +
                            HTML_ESCAPE_SYNTAX_END
                        );
                    }
                );
            } catch (e) {
                console.error(e);
                console.log(syntaxProperties.regex);
            }
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

    exports.format = function(cseInstance, target, from, to) {
        var options = cseInstance.options || {};
        var languageData = options.languageData || {};

        var formattedLines = escapeHtml(target.innerText).split("\n");
        var formattedLineRange = replaceMarks(escapeHtml(parseSyntaxTree(target.innerText.split("\n").slice(from, to).join("\n"), languageData.syntax || {}))).split("\n");

        for (var i = 0; i < formattedLineRange.length; i++) {
            if (from + i < formattedLines.length) {
                formattedLines[from + i] = formattedLineRange[i];
            }
        }

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