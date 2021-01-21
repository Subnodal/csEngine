var csengine = require("com.subnodal.codeslate.engine");

var cseInstance;

window.onload = function() {
    cseInstance = new csengine.CodeslateEngine(document.getElementById("injectionParent"), {
        languageData: {
            syntax: [
                {type: "keyword", regex: "\\bfunction\\b", match: 0},
                {type: "string", regex: "\"(.*?)\"", match: 0},
                {type: "number", regex: "\\b[0-9\.]+\\b", match: 0}
            ]
        }
    });
};