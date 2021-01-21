var csengine = require("com.subnodal.codeslate.engine");

var cseInstance;

const SYNTAX_STRING_LOOKBEHIND = (
    `(?=(?:[^"\\\\]*(?:\\\\.|"(?:[^"\\\\]*\\\\.)*[^"\\\\]*"))*[^"]*$)` + // "
    `(?=(?:[^'\\\\]*(?:\\\\.|'(?:[^'\\\\]*\\\\.)*[^'\\\\]*'))*[^']*$)` + // '
    `(?=(?:[^\`\\\\]*(?:\\\\.|\`(?:[^\`\\\\]*\\\\.)*[^\`\\\\]*\`))*[^\`]*$)` // \`
);

window.onload = function() {
    // Some Regex syntax from https://github.com/atom/language-javascript/blob/master/grammars/javascript.cson
    cseInstance = new csengine.CodeslateEngine(document.getElementById("injectionParent"), {
        languageData: {
            syntax: [
                {type: "definition", regex: `${SYNTAX_STRING_LOOKBEHIND}\\b(function|var|const|let|async|await|=>)\\b`, match: 0},
                {type: "keyword", regex: `${SYNTAX_STRING_LOOKBEHIND}\\b(if|else|for|in|do|while|try|catch|finally|break|continue|return|with|yield|typeof|instanceof|delete|import|export)\\b`},
                {type: "string", regex: `"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\``, match: 0, spellcheck: true},
                {type: "number", regex: `\\b(?<!\\$)0(x|X)[0-9a-fA-F]+n?\\b(?!\\$)`, match: 0}, // Hex
                {type: "number", regex: `\\b(?<!\\$)0(b|B)[01]+n?\\b(?!\\$)`, match: 0}, // Bin
                {type: "number", regex: `\\b(?<!\\$)0(o|O)?[0-7]+n?\\b(?!\\$)`, match: 0}, // Oct
                {type: "number", regex: `${SYNTAX_STRING_LOOKBEHIND}(?<!\\$)(?:(?:\\b[0-9]+(\\.)[0-9]+[eE][+-]?[0-9]+\\b)|(?:\\b[0-9]+(\\.)[eE][+-]?[0-9]+\\b)|(?:\\B(\\.)[0-9]+[eE][+-]?[0-9]+\\b)|(?:\\b[0-9]+[eE][+-]?[0-9]+\\b)|(?:\\b[0-9]+(\\.)[0-9]+\\b)|(?:\\b[0-9]+(\\.)\\B)|(?:\\B(\\.)[0-9]+\\b)|(?:\\b[0-9]+n?\\b(?!\\.)))(?!\\$)`, match: 0},
                {type: "operator", regex: `${SYNTAX_STRING_LOOKBEHIND}(\\+\\+|--|\\+|-|\\*|\\/|%|===|==|!==|!=|\\+=|-=|\\*=|\\/=|%=|=|<<|>>|<=|>=|<|>|&&|\\|\\|!|&|\\|~|\\^)`},
                {type: "atom", regex: `${SYNTAX_STRING_LOOKBEHIND}\\b(true|false|null|undefined|NaN|Infinity)\\b`, match: 0},
                {type: "comment", regex: `${SYNTAX_STRING_LOOKBEHIND}\\/\\/(.*?)\n`, match: 1},
                {type: "comment", regex: `${SYNTAX_STRING_LOOKBEHIND}\\/\\*.*?\\*\\/`, match: 0},
            ]
        }
    });
};