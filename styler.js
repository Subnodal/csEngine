/*
    Codeslate Engine

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://codeslate.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.codeslate.engine.styler", function(exports) {
    exports.Styler = class {
        constructor(styleCollection = []) {
            this.styleCollection = styleCollection;
        }

        generate() {
            var css = "";

            for (var i = 0; i < this.styleCollection.length; i++) {
                css += `[cs-part="${this.styleCollection[i].part}"]${this.styleCollection[i].specification} {${this.styleCollection[i].rules}}`;
            }

            return css;
        }
    };

    exports.Style = class {
        constructor(part, rules, specification = "") {
            this.part = part;
            this.rules = rules;
            this.specification = specification;
        }
    };
});