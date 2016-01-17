/* ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2015 SAP SE or an SAP affiliate company. 
 * All rights reserved.
 *
 * This file is based on code coming from Ace
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRAherve.mischler@sap.comCT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

ace.define('ace/mode/i18n_properties', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text', 'ace/tokenizer', 'ace/mode/i18n_properties_highlight_rules'], function(require, exports, module) {


var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var I18nPropertiesHighlightRules = require("./i18n_properties_highlight_rules").I18nPropertiesHighlightRules;

var Mode = function() {
    this.HighlightRules = I18nPropertiesHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/i18n_properties";
}).call(Mode.prototype);

exports.Mode = Mode;
});

ace.define('ace/mode/i18n_properties_highlight_rules', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function(require, exports, module) {


var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var I18nPropertiesHighlightRules = function() {

   //var escapeRe = /\\u[0-9a-fA-F]{4}|\\/;

      this.$rules = {
        // key or comment  
        "start" : [ 
            {
                regex : /\s*$/,
                token : "string",
                next : "start"
            },
            {
                token : "comment",
                regex : /\s*#[A-Z]{4}[:]?.*$/
            },
            {
                token : "variable",
                regex : /#.*/
            }, 
            {
                token : "variable",
                regex : /[^=]+/,
                next: "equal"
            }
           
        ],
        "equal" : [
            {
                token : "keyword.operator",
                regex : /=/,
                next: "value"
            }
        ],
        "value" : [
            {
                token : "string",
                regex : /[^={}]+$/,
                next: "start"
            },
            {
                token : "string",
                regex : /[^={}]+/
            },
            {
                token : "keyword",
                regex : /{\d}/
            }
        ]
    };
    
};

oop.inherits(I18nPropertiesHighlightRules, TextHighlightRules);

exports.I18nPropertiesHighlightRules = I18nPropertiesHighlightRules;
});

