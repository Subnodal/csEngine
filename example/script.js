var csengine = require("com.subnodal.codeslate.engine");

var cseInstance;

window.onload = function() {
    cseInstance = new csengine.CodeslateEngine(document.getElementById("injectionParent"), {
        languageData: {
            syntax: [
                {mode: "keyword", regex: "function", match: 0}
            ]
        }
    });
};