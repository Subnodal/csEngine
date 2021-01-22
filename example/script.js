var csengine = require("com.subnodal.codeslate.engine");

var cseInstance;

window.onload = function() {
    // Some Regex syntax from https://github.com/atom/language-javascript/blob/master/grammars/javascript.cson
    cseInstance = new csengine.CodeslateEngine(document.getElementById("injectionParent"), {
        languageData: {
            syntax: [
                {type: "comment", regex: `(?<=^(?:[\x03\x05].*?\x04)*[^\x03\x04\x05\n]*)(\\/\\/.*?)\\n`, flags: "m"},
                {type: "string", regex: `(?<!\\/\\*)"(?![^\\/]*\\*\\/)(?:[^"\\\\\x04]|\\\\.)*?"`, spellcheck: true},
                {type: "string", regex: `(?<!\\/\\*)'(?![^\\/]*\\*\\/)(?:[^'\\\\]|\\\\.)*'`, spellcheck: true},
                {type: "string", regex: `(?<!\\/\\*)\`(?![^\\/]*\\*\\/)(?:[^\`\\\\]|\\\\.)*\``, spellcheck: true, flags: "s", subSyntax: [
                    {type: "keyword", regex: `\\\${.*?}`}
                ]},
                {type: "comment", regex: `\\/\\*.*?\\*\\/`, flags: "s"},
                {type: "definition", regex: `\\b(function|var|const|let|class|async|await|=>)\\b`},
                {type: "keyword", regex: `\\b(if|else|for|in|do|while|try|catch|finally|break|continue|return|with|yield|new|typeof|instanceof|delete|import|export)\\b`},
                {type: "number", regex: `\\b(?<!\\$)0(x|X)[0-9a-fA-F]+n?\\b(?!\\$)`}, // Hex
                {type: "number", regex: `\\b(?<!\\$)0(b|B)[01]+n?\\b(?!\\$)`}, // Bin
                {type: "number", regex: `\\b(?<!\\$)0(o|O)?[0-7]+n?\\b(?!\\$)`}, // Oct
                {type: "number", regex: `\\b(?<!\\$)(?:(?:\\b[0-9]+(\\.)[0-9]+[eE][+-]?[0-9]+\\b)(?:\\b[0-9]+(\\.)[eE][+-]?[0-9]+\\b)|(?:\\B(\\.)[0-9]+[eE][+-]?[0-9]+\\b)|(?:\\b[0-9]+[eE][+-]?[0-9]+\\b)|(?:\\b[0-9]+(\\.)[0-9]+\\b)|(?:\\b[0-9]+(\\.)\\B)|(?:\\B(\\.)[0-9]+\\b)|(?:\\b[0-9]+n?\\b(?!\\.)))(?!\\$)`},
                {type: "atom", regex: `\\b(true|false|null|undefined|NaN|Infinity)\\b`},
                {type: "operator", regex: `(\\+\\+|--|\\+|-|\\*|\\/|%|===|==|!==|!=|\\+=|-=|\\*=|\\/=|%=|=|<<|>>|<=|>=|<|>|&&|\\|\\||!|&|\\||~|\\^)`}
            ],
            indentOpenChars: ["(", "{"]
        }
    });
};