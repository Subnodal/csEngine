var csengine = require("com.subnodal.codeslate.engine");

var cseInstance;

const SYNTAX_STRING_LOOKBEHIND = (
    `(?=(?:[^"\\\\]*(?:\\\\.|"(?:[^"\\\\]*\\\\.)*[^"\\\\]*"))*[^"]*$)` + // "
    `(?=(?:[^'\\\\]*(?:\\\\.|'(?:[^'\\\\]*\\\\.)*[^'\\\\]*'))*[^']*$)` + // '
    `(?=(?:[^\`\\\\]*(?:\\\\.|\`(?:[^\`\\\\]*\\\\.)*[^\`\\\\]*\`))*[^\`]*$)` // \`
);

const SYNTAX_STRING_LOOKAHEAD = ``; // No lookaheads

const SYNTAX_COMMENT_LOOKBEHIND = (
    `(?<!\\/\\*)` // /*
);

const SYNTAX_COMMENT_LOOKAHEAD = (
    `(?![^\\/]*\\*\\/)` // */
);

const SYNTAX_NON_CODE_LOOKBEHIND = SYNTAX_COMMENT_LOOKBEHIND + SYNTAX_STRING_LOOKBEHIND;
const SYNTAX_NON_CODE_LOOKAHEAD = SYNTAX_STRING_LOOKAHEAD + SYNTAX_COMMENT_LOOKAHEAD;

window.onload = function() {
    // Some Regex syntax from https://github.com/atom/language-javascript/blob/master/grammars/javascript.cson
    cseInstance = new csengine.CodeslateEngine(document.getElementById("injectionParent"), {
        languageData: {
            syntax: [
                {type: "definition", regex: `${SYNTAX_NON_CODE_LOOKBEHIND}\\b(function|var|const|let|class|async|await|=>)\\b${SYNTAX_NON_CODE_LOOKAHEAD}`, match: 0},
                {type: "keyword", regex: `${SYNTAX_NON_CODE_LOOKBEHIND}\\b(if|else|for|in|do|while|try|catch|finally|break|continue|return|with|yield|new|typeof|instanceof|delete|import|export)\\b${SYNTAX_NON_CODE_LOOKAHEAD}`},
                {type: "string", regex: `"${SYNTAX_COMMENT_LOOKBEHIND}((?:[^"\\\\\\/]|\\\\.)*"|'(?:[^'\\\\\\/]|\\\\.)*'|\`(?:[^\`\\\\\\/]|\\\\.)*\`)${SYNTAX_COMMENT_LOOKAHEAD}`, match: 0, spellcheck: true},
                {type: "number", regex: `${SYNTAX_NON_CODE_LOOKBEHIND}\\b(?<!\\$)0(x|X)[0-9a-fA-F]+n?\\b(?!\\$)${SYNTAX_NON_CODE_LOOKAHEAD}`, match: 0}, // Hex
                {type: "number", regex: `${SYNTAX_NON_CODE_LOOKBEHIND}\\b(?<!\\$)0(b|B)[01]+n?\\b(?!\\$)${SYNTAX_NON_CODE_LOOKAHEAD}`, match: 0}, // Bin
                {type: "number", regex: `${SYNTAX_NON_CODE_LOOKBEHIND}\\b(?<!\\$)0(o|O)?[0-7]+n?\\b(?!\\$)${SYNTAX_NON_CODE_LOOKAHEAD}`, match: 0}, // Oct
                {type: "number", regex: `${SYNTAX_NON_CODE_LOOKBEHIND}(?<!\\$)(?:(?:\\b[0-9]+(\\.)[0-9]+[eE][+-]?[0-9]+\\b)|(?:\\b[0-9]+(\\.)[eE][+-]?[0-9]+\\b)|(?:\\B(\\.)[0-9]+[eE][+-]?[0-9]+\\b)|(?:\\b[0-9]+[eE][+-]?[0-9]+\\b)|(?:\\b[0-9]+(\\.)[0-9]+\\b)|(?:\\b[0-9]+(\\.)\\B)|(?:\\B(\\.)[0-9]+\\b)|(?:\\b[0-9]+n?\\b(?!\\.)))(?!\\$)${SYNTAX_NON_CODE_LOOKAHEAD}`, match: 0},
                {type: "atom", regex: `${SYNTAX_NON_CODE_LOOKBEHIND}\\b(true|false|null|undefined|NaN|Infinity)\\b${SYNTAX_NON_CODE_LOOKAHEAD}`, match: 0},
                {type: "comment", regex: `${SYNTAX_NON_CODE_LOOKBEHIND}\\/\\/(.*?)\n${SYNTAX_NON_CODE_LOOKAHEAD}`, match: 0, flags: "s"},
                {type: "comment", regex: `${SYNTAX_NON_CODE_LOOKBEHIND}\\/\\*.*?\\*\\/${SYNTAX_NON_CODE_LOOKAHEAD}`, match: 0, flags: "s"},
                {type: "operator", regex: `${SYNTAX_NON_CODE_LOOKBEHIND}(?<=[^\\/\\*])(\\+\\+|--|\\+|-|\\*|\\/|%|===|==|!==|!=|\\+=|-=|\\*=|\\/=|%=|=|<<|>>|<=|>=|<|>|&&|\\|\\||!|&|\\||~|\\^)(?=[^\\/\\*])${SYNTAX_NON_CODE_LOOKAHEAD}`}
            ]
        }
    });
};