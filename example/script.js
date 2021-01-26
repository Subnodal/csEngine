var csengine = require("com.subnodal.codeslate.engine");

var cseInstance;

window.onload = function() {
    // Some Regex syntax from https://github.com/atom/language-javascript/blob/master/grammars/javascript.cson
    cseInstance = new csengine.CodeslateEngine(document.getElementById("injectionParent"), {
        languageData: {
            syntax: [
                {type: "comment", regex: `(?<=^.*)(\\/\\/.*?)\\n`},
                {type: "string", regex: `(?<!\\/\\*)"(?![^\\/]*\\*\\/)(?:[^"\\\\\x04\\n]|\\\\.)*?"`, spellcheck: true},
                {type: "string", regex: `(?<!\\/\\*)'(?![^\\/]*\\*\\/)(?:[^'\\\\\x04\\n]|\\\\.)*'`, spellcheck: true},
                {type: "string", regex: `(?<!\\/\\*)\`(?![^\\/]*\\*\\/)(?:[^\`\\\\\x04]|\\\\.)*\``, spellcheck: true},
                {type: "comment", regex: `\\/\\*.*\\*\\/`},
                {type: "regex", regex: `(?<!\\/\\*)(?<=[\\(\\[\\n\\!\\?\\:\\|\\=])\\s*\\/(?![^\\/]*\\*\\/)(?:[^\\/\\\\\x04\\n]|\\\\.)+?\\/`},
                {type: "definition", regex: `\\b(function|var|const|let|class|async|await|=>)\\b`},
                {type: "keyword", regex: `\\b(if|else|for|in|do|while|try|catch|finally|break|continue|return|with|yield|new|typeof|instanceof|delete|import|export)\\b`},
                {type: "number", regex: `\\b(?<!\\$)0(x|X)[0-9a-fA-F]+n?\\b(?!\\$)`}, // Hex
                {type: "number", regex: `\\b(?<!\\$)0(b|B)[01]+n?\\b(?!\\$)`}, // Bin
                {type: "number", regex: `\\b(?<!\\$)0(o|O)?[0-7]+n?\\b(?!\\$)`}, // Oct
                {type: "number", regex: `\\b(?<!\\$)(?:(?:\\b[0-9]+(\\.)[0-9]+[eE][+-]?[0-9]+\\b)(?:\\b[0-9]+(\\.)[eE][+-]?[0-9]+\\b)|(?:\\B(\\.)[0-9]+[eE][+-]?[0-9]+\\b)|(?:\\b[0-9]+[eE][+-]?[0-9]+\\b)|(?:\\b[0-9]+(\\.)[0-9]+\\b)|(?:\\b[0-9]+(\\.)\\B)|(?:\\B(\\.)[0-9]+\\b)|(?:\\b[0-9]+n?\\b(?!\\.)))(?!\\$)`},
                {type: "atom", regex: `\\b(true|false|null|undefined|NaN|Infinity)\\b`},
                {type: "operator", regex: `(\\+\\+|--|\\+|-|\\*|\\/|%|===|==|!==|!=|\\+=|-=|\\*=|\\/=|%=|=|<<|>>|<=|>=|<|>|&&|\\|\\||!|&|\\||~|\\^|\\?|:)`}
            ],
            indentOpenChars: ["(", "{", "["],
            indentCloseChars: [")", "}", "]"]
        }
    });
};