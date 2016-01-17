(function() {
"use strict";

ace.define('ace/mode/xsjob', function(require, exports, module) {
var oop = require("ace/lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var XsjobHighlightRules = require("./xsjob_highlight_rules").XsjobHighlightRules;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new XsjobHighlightRules().getRules());
};
oop.inherits(Mode, TextMode);

(function() {
    // Extra logic goes here. (see below)
}).call(Mode.prototype);

exports.Mode = Mode;
});

ace.define('ace/mode/xsjob_highlight_rules', function(require, exports, module) {

var oop = require("ace/lib/oop");
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

var XsjobHighlightRules = function() {

    this.$rules = {
        "start" : [
            
            // Keywords for .xsjob
            
            {
                token : "keyword",
                regex : '"(?:action|schedules|description|xscron|parameter)"'
            },

            {
                token : "string", // single line
                regex : '"',
                next  : "string"
            }, 
            
            {
                token : "invalid.illegal", // single quoted strings are not allowed
                regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
            }, 
            {
                token : "invalid.illegal", // comments are not allowed
                regex : "\\/\\/.*$"
            }, 
            {
                token : "invalid.illegal", // comments are not allowed
                regex : "--.*$"
            }, 
            {
                token : "paren.lparen",
                regex : "[[({]"
            }, {
                token : "paren.rparen",
                regex : "[\\])}]"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ],
        
        "string" : [
            {
                token : "constant.language.escape",
                regex : /\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|["\\\/bfnrt])/
            }, {
                token : "string",
                regex : '[^"\\\\]+'
            }, {
                token : "string",
                regex : '"',
                next  : "start"
            }, {
                token : "string",
                regex : "",
                next  : "start"
            }
        ]

    };
    
};

oop.inherits(XsjobHighlightRules, TextHighlightRules);

exports.XsjobHighlightRules = XsjobHighlightRules;
});
}());
