(function() {
"use strict";

ace.define('ace/mode/xshttpdest', function(require, exports, module) {
var oop = require("ace/lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var xshttpdestHighlightRules = require("./xshttpdest_highlight_rules").xshttpdestHighlightRules;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new xshttpdestHighlightRules().getRules());
};
oop.inherits(Mode, TextMode);

(function() {
    // Extra logic goes here. (see below)
}).call(Mode.prototype);

exports.Mode = Mode;
});

ace.define('ace/mode/xshttpdest_highlight_rules', function(require, exports, module) {

var oop = require("ace/lib/oop");
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

var xshttpdestHighlightRules = function() {

    this.$rules = {
        "start" : [
            
            // Keywords for .xshttpdest
            
            {
                token : "keyword",
                regex : '\\b(?:host|port|description|useSSL|pathPrefix|authType|useProxy|proxyHost|proxyPort|timeout)\\b'
            },
            
            // Taken from JSON Highlight Rules
            {
                token : "variable", // single line
                regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]\\s*(?=:)'
            }, 
            {
                token : "string", // single line
                regex : '"',
                next  : "string"
            }, 
            {
                token : "comment", // multi line comment
                regex : "\\/\\*",
                next : "comment"
            }, 
            
            
            {
                token : "constant.numeric", // hex
                regex : "0[xX][0-9a-fA-F]+\\b"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token : "constant.language.boolean",
                regex : "(?:true|false)\\b"
            }, {
                token : "invalid.illegal", // single quoted strings are not allowed
                regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
            }, {
                token : "comment", 
                regex : "\\/\\/.*$"
            }, {
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
        ],
        
        "comment" : [
            {
                token : "comment", // closing comment
                regex : ".*?\\*\\/",
                next : "start"
            }, {
                token : "comment", // comment spanning whole line
                regex : ".+"
            }
        ]
        

    };
    
};

oop.inherits(xshttpdestHighlightRules, TextHighlightRules);

exports.xshttpdestHighlightRules = xshttpdestHighlightRules;
});
}());
