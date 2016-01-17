/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/StringBuffer',[], //dependencies
    function () {
        

        function StringBuffer(string) {
            /**
             * @type {Array}
             */
            this.buffer = [];
            if (string!=null) {
                this.buffer.push(string);
            }
        }

        StringBuffer.prototype.substringLength = function(start,length) {
            var str = this.toString();
            var res = str.substring(start,start+length);
            return res;
        };

        StringBuffer.prototype.append = function(string) {
            this.buffer.push(string);
            return this;
        };

        StringBuffer.prototype.toString = function() {
            var result = this.buffer.join("");
            return result;
        };

        StringBuffer.prototype.insert=function(idx,string) {
            this.buffer.splice(idx,0,string);
        };

        StringBuffer.prototype.length=function() {
            var len = this.toString().length;
            return len;
        };

        StringBuffer.prototype.replace=function(start,end,str) {
            var l = this.toString();
            var result = l.substring(0,start) + str + l.substring(end);
            this.buffer=[];
            this.append(result);
        };


        return StringBuffer;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/Utils',["./StringBuffer"], //dependencies
    function (StringBuffer) {
        

        /**
         * A number of helper functions
         */
        var Utils = {
            objectCreate: function (prototype) {
                if (typeof Object.create === "function") {
                    //VM from this century
                    return Object.create(prototype);
                }
                //other VM, and VM that only support object.Create under certain situations
                var o,
                    BaseType = function () {};
                BaseType.prototype = prototype;
                o = new BaseType();
                /* jslint proto:true */
                o.__proto__ = prototype;
                return o;
            },

            /**
             * Get file from URL
             * @param url URL from which to load file
             * @returns File contents
             */
            get: function (url,acceptHeader) {
                /* global document:false, ActiveXObject:false, XMLHttpRequest:false */
                var http;

                if ((typeof document !== "undefined") && document.defaultView.navigator.appName == "Microsoft Internet Explorer") {
                    http = new ActiveXObject("Microsoft.XMLHTTP");
                } else if ((typeof document !== "undefined") && document.defaultView.navigator.appName == "Node.js jsDom") {
                    return require('fs').readFileSync(url,{encoding: 'utf8'} );
                } else {
                    http = new XMLHttpRequest();
                }
                http.open("GET", url, false);
                if (acceptHeader!=null) {
                    http.setRequestHeader("Accept", acceptHeader);
                }
                http.send(null);
                return http.responseText;
            },

            asyncGet: function (url,loaded,acceptHeader) {
                /* global document:false, ActiveXObject:false, XMLHttpRequest:false */
                var http;
                if (document.defaultView.navigator.appName == "Microsoft Internet Explorer") {
                    http = new ActiveXObject("Microsoft.XMLHTTP");
                } else if (document.defaultView.navigator.appName == "Node.js jsDom") {
                    return require('fs').readFileSync(url,{encoding: 'utf8'} );
                } else {
                    http = new XMLHttpRequest();
                }
                http.open("GET", url, true);
                if (acceptHeader!=null) {
                    http.setRequestHeader("Accept", acceptHeader);
                }
                http.onload = function () {
                    if (http.readyState === 4) {
                        if (http.status === 200) {
                            loaded(http.responseText);
                        } else {
                            assert(http.statusText);
                        }
                    }
                };
                http.send(null);
            },

            /**
             * Get file from URL and normalize line endings to \n
             * @param url URL from which to load file
             * @returns File contents, with line endings normalized to \n
             */
            getEolNormalized: function (url) {
                return Utils.get(url).replace(/\r\n/g, "\n").replace(/\n\r/g, "\n").replace("\r", "\n");
            },

            clone: function (obj) {
                var copy;

                // Handle the 3 simple types, and null or undefined
                if (null == obj || "object" != typeof obj) {
                    return obj;
                }

                // Handle Date
                if (obj instanceof Date) {
                    copy = new Date();
                    copy.setTime(obj.getTime());
                    return copy;
                }

                // Handle Array
                if (obj instanceof Array) {
                    copy = [];
                    for (var i = 0, len = obj.length; i < len; i++) {
                        copy[i] = this.clone(obj[i]);
                    }
                    return copy;
                }

                // Handle Object
                if (obj instanceof Object) {
                    copy = {};
                    for (var attr in obj) {
                        if (obj.hasOwnProperty(attr)) {
                            copy[attr] = this.clone(obj[attr]);
                        }
                    }
                    return copy;
                }

                throw new Error("Unable to copy obj! Its type is not supported.");
            },

            isLetter: function (str) {
                return str.length === 1 && str.match(/[a-z]/i);
            },


            insertArrayAt: function (array, index, arrayToInsert) {
                Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
                return array;
            },

            collect: function () {
                var ret = {};
                var len = arguments.length;
                for (var i=0; i<len; i++) {
                    for (var p in arguments[i]) {
                        if (arguments[i].hasOwnProperty(p)) {
                            ret[p] = arguments[i][p];
                        }
                    }
                }
                return ret;
            },
            
            stringEndsWith: function (str, suffix) {
                return str.indexOf(suffix, str.length - suffix.length) !== -1;
            },
            
            stringStartsWith: function (str, searchString, position) {
                if (position != null) {
                    var tmp = str.substring(position);
                    return tmp.indexOf(searchString) === 0;
                }
                return str.indexOf(searchString) === 0;
            },
            
            stringEqualsIgnoreCase: function (str, another) {
                if (another==null) {
                    return str.toUpperCase() == another;
                }
                return str.toUpperCase() == another.toUpperCase();
            },
            
            stringTrim: function (str) {
                return str.replace(/^\s+|\s+$/g, '');
            },
            
            stringInsertAt: function (str, position, insertString) {
                return str.substr(0, position) + insertString + str.substr(position);
            },
            
            stringCompareTo: function (str, another) {
                if (str.length>1 && another.length>1 && this.stringEndsWith(str,"(") && this.stringEndsWith(another,"(")) {
                    str = str.substring(0,str.lastIndexOf("("));
                    another = another.substring(0,another.lastIndexOf("("));
                }
                var result = str.localeCompare(another);
                return result;
            },
            
            stringCompareToIgnoreCase: function (str, another) {
                var me = str.toLowerCase();
                var a = another.toLowerCase();
                return Utils.stringCompareTo(me, a);
            },
            
            stringContains: function (str, another) {
                var idx = str.indexOf(another);
                return (idx >= 0);
            },
            
            stringReplaceAll: function (str, token, newToken, ignoreCase) {
                var _token;
                var resultString = str + "";
                var i = -1;

                if (typeof token === "string") {

                    if (ignoreCase) {

                        _token = token.toLowerCase();

                        while ((
                            i = resultString.toLowerCase().indexOf(
                                token, i >= 0 ? i + newToken.length : 0
                            ) ) !== -1
                            ) {
                            resultString = resultString.substring(0, i) +
                                newToken +
                                resultString.substring(i + token.length);
                        }

                    } else {
                        return str.split(token).join(newToken);
                    }

                }
                return resultString;
            },
            
            arrayToString: function (array) {
                var res = array.toString();
                var buf = new StringBuffer(res);
                var inBracket = false;
                for (var i = res.length - 1; i >= 0; --i) {
                    if (res[i] === ")" || res[i] === "]") {
                        inBracket = true;
                    }
                    if (res[i] === "(" || res[i] === "[") {
                        inBracket = false;
                    }
                    if (inBracket === false && res[i] === ",") {
                        buf.replace(i, i + 1, ", ");
                    }
                }
                res = "[" + buf.toString() + "]";
                return res;
            },
            
            arrayContains: function (array, obj) {
                var i = array.length;
                while (i--) {
                    if (array[i] === obj) {
                        return true;
                    } else if (array[i].equals && obj.equals) {
                        if (array[i].equals(obj)) {
                            return true;
                        }
                    }
                }
                return false;
            },
            
            arrayIsEmpty: function (array) {
                return (array.length === 0);
            },
            
            arrayRemove: function (array, idx) {
                if (typeof idx !== 'number') {
                    //not a number -> idx is an object
                    var i = array.indexOf(idx);
                    if ( i < 0 ) {
                        i = array.length;
                        while (i--) {
                            if (array[i] === idx) {
                                break;
                            } else if (array[i].equals && idx.equals) {
                                if (array[i].equals(idx)) {
                                    break;
                                }
                            }
                        }
                    }
                    if (i >= 0) {
                        Utils.arrayRemove(array, i);
                    }
                    return;
                }
                array.splice(idx,1);
            },
            
            objectValues: function(obj) {
                var vals = [];
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        vals.push(obj[key]);
                    }
                }
                return vals;
            }
        };
        return Utils;
    }
);

// -W098 "defined but not used"
/* exported assert */
function assert(arg) {
     /* global console:false */

    if (!arg) {
        console.log("error in assert");
    }
}


;
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/RuleInfo',[], //dependencies
    function () {
        

        function RuleInfo(name, ruleProps, terminal_count, flag_count, rule_flags, role) {

            this.m_name = name;
            this.m_terminal_count = terminal_count;
            this.m_flag_count = flag_count;
            this.m_rule_flags = rule_flags;
            this.m_role = role;
            //this.m_ruleProperties = clone(ruleProps);
            this.m_ruleProperties = (ruleProps);
            this.m_follow_set = [];//new ArrayList<Short>();
            this.m_ruleStartEntryPoint = -1;
        }

        RuleInfo.prototype.setRuleEntryStartEntryPoint = function (ruleStartEntryPoint) {
            this.m_ruleStartEntryPoint = ruleStartEntryPoint;
        };


        //@Override
        //public String
        RuleInfo.prototype.toString = function () {
            return this.m_name;
        };

        //@Override
        //public Map<String, String>
        RuleInfo.prototype.getRuleProperties = function () {
            return this.m_ruleProperties;
        };

        //@Override
        //public String
        RuleInfo.prototype.getRuleName = function () {
            return this.m_name;
        };

        //@Override
        //public int
        RuleInfo.prototype.getRuleStartEntryPoint = function () {
            return this.m_ruleStartEntryPoint;
        };

        //public void
        RuleInfo.prototype.setRuleEntryStartEntryPoint = function (/*int*/ ruleStartEntryPoint) {
            this.m_ruleStartEntryPoint = ruleStartEntryPoint;
        };

        return RuleInfo;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/LabelInfoRuleData',[], //dependencies
    function () {
        

        function LabelInfoRuleData(info, is_pending) {
            this.m_info = info;
            if (info === null) {
                this.m_info = {left: 0, right: 0};
            }
            this.m_is_pending = is_pending;
            this.m_forwards = [];//new ArrayList<Integer>();
        }

        return LabelInfoRuleData;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/Instruction',[], //dependencies
    function () {
        

// We use Instruction as:
//      singleton for the constants,
//      factory for Instructions
// but we do not use a base class
        function MatchInstruction(opCode) {
            this.m_opcode = opCode;
            this.m_is_strict = false;
            this.m_cat = 0;
            this.m_var_index = 0;
            this.m_la = 0;
        }

        function GoToInstruction(opCode) {
            this.m_opcode = opCode;
            this.m_rel_offset = 0;
        }

        function BranchInstruction(opCode) {
            this.m_opcode = opCode;
            this.m_has_non_strict_id = false;
            this.m_has_id = false;
            this.m_alt_count = 0;
        }

        function PredInstruction(opCode) {
            this.m_opcode = opCode;
            this.m_is_strict = false;
            this.m_la = 0;
            this.m_rel_offset = 0;
        }

        function CallInstruction(opCode) {
            this.m_opcode = opCode;
            this.m_entry_point = 0;
        }

        function ReturnInstruction(opCode) {
            this.m_opcode = opCode;
        }

        function ExecuteInstruction(opCode) {
            this.m_opcode = opCode;
            this.m_is_immediate = false;
            this.m_action_num = 0;
        }

        function StopInstruction(opCode) {
            this.m_opcode = opCode;
        }

        function SetFlagInstruction(opCode) {
            this.m_opcode = opCode;
            this.m_flag_index = 0;
            this.m_val = 0;
        }

        function CheckFlagInstruction(opCode) {
            this.m_opcode = opCode;
            this.m_flag_index = 0;
            this.m_val = 0;
        }

        function SysCallInstruction(opCode) {
            this.m_opcode = opCode;
            this.m_kind = 0;
            this.m_arg = 0;
        }

        function PushFrameInstruction(opCode) {
            this.m_opcode = opCode;
            this.m_rule_num = 0;
            this.m_frame_num = 0;
        }

        function PopFrameInstruction(opCode) {
            this.m_opcode = opCode;
        }

        var Instruction = {
            OP_MATCH: 0,
            OP_GOTO: 1,
            OP_BRANCH: 2,
            OP_PRED: 3,
            OP_CALL: 4,
            OP_RETURN: 5,
            OP_EXECUTE: 6,
            OP_STOP: 7,
            OP_SET_FLAG: 8,
            OP_CHECK_FLAG: 9,
            OP_SYS_CALL: 10,
            OP_PUSH_FRAME: 11,
            OP_POP_FRAME: 12,
            OP_NOP: 13,
            OP_AST_ACTION: 14,

            OP_MATCH_STR: "MTCH", //$NON-NLS-1$
            OP_BRANCH_STR: "BRAN", //$NON-NLS-1$
            OP_GOTO_STR: "GOTO", //$NON-NLS-1$
            OP_RETURN_STR: "RETN", //$NON-NLS-1$
            OP_EXECUTE_STR: "EXCT", //$NON-NLS-1$
            OP_CALL_STR: "CALL", //$NON-NLS-1$
            OP_PUSH_FRAME_STR: "PSHF", //$NON-NLS-1$
            OP_POP_FRAME_STR: "POPF", //$NON-NLS-1$
            OP_STOP_STR: "STOP", //$NON-NLS-1$
            OP_SET_FLAG_STR: "SFLG", //$NON-NLS-1$
            OP_CHECK_FLAG_STR: "CFLG", //$NON-NLS-1$
            OP_SYS_CALL_STR: "SYSC", //$NON-NLS-1$
            OP_AST_ACTION_STR: "ASTA", //$NON-NLS-1$

            createInstruction: function (opCode) {
                switch (opCode) {
                case Instruction.OP_MATCH:
                    return new MatchInstruction(opCode);
                case Instruction.OP_GOTO:
                    return new GoToInstruction(opCode);
                case Instruction.OP_BRANCH:
                    return new BranchInstruction(opCode);
                case Instruction.OP_PRED:
                    return new PredInstruction(opCode);
                case Instruction.OP_CALL:
                    return new CallInstruction(opCode);
                case Instruction.OP_RETURN:
                    return new ReturnInstruction(opCode);
                case Instruction.OP_EXECUTE:
                    return new ExecuteInstruction(opCode);
                case Instruction.OP_STOP:
                    return new StopInstruction(opCode);
                case Instruction.OP_SET_FLAG:
                    return new SetFlagInstruction(opCode);
                case Instruction.OP_CHECK_FLAG:
                    return new CheckFlagInstruction(opCode);
                case Instruction.OP_SYS_CALL:
                    return new SysCallInstruction(opCode);
                case Instruction.OP_PUSH_FRAME:
                    return new PushFrameInstruction(opCode);
                case Instruction.OP_POP_FRAME:
                    return new PopFrameInstruction(opCode);
                case Instruction.OP_NOP:
                    return null;
                default:
                    return null;
                }
            }
        };
        return Instruction;
    }
    // I we really miss those add them in a base class of the Instructions
//      Instruction.prototype.getOrCreateInstruction
//      Instruction.prototype.getAs = function(opCode) {
//      Instruction.prototype.getAsPREDInstruction = function() {
//      Instruction.prototype.getAsMATCHInstruction = function()
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/ByteCode',["rndrt/Utils", "rndrt/RuleInfo", "rndrt/LabelInfoRuleData", "rndrt/Instruction"], //dependencies
    function (Utils, RuleInfo, LabelInfoRuleData, Instruction) {
        

        /**
         * @class
         * The ByteCode class
         * Use @see ByteCode.read to get an instance
         * @public
         */
        function ByteCode() {
            this.m_token_map = {};
            this.RUNTIME_CREATED_STOP = -1;
            this.RUNTIME_CREATED_RETURN = -2;
            this.RETURN_INSTRUCTION = Instruction.createInstruction(Instruction.OP_RETURN);
            this.STOP_INSTRUCTION = Instruction.createInstruction(Instruction.OP_STOP);
        }

        /**
         * Get the value of #ID#
         * @returns {number} The token number of '#ID#'
         */
        ByteCode.prototype.getActualNUMID = function () {
            return this.m_num_id;
        };

        /**
         * Check the existence of a lexem in the token map
         * @param {string} lexem
         * @returns {boolean} it the Lexem known
         */
        ByteCode.prototype.containsLexem = function (lexem) {
            return (this.m_token_map[lexem] && this.m_token_map.hasOwnProperty(lexem));
        };

        /**
         * Get the token index or -1 if the token is unknown
         *
         * @param {string} tok_str
         * @returns {number}
         */
        ByteCode.prototype.getTokenIndex = function (tok_str) {
            if (tok_str == null) {
                return -1;
            }
            var value = this.m_token_map[tok_str];
            if (value != null) {
                return value;
            }
            return -1;
        };

        /**
         * Instantiate a ByteCode object
         * @param {String} arg the pad file name as an url
         * @returns {ByteCode}
         * @public
         */
        ByteCode.read = function (arg) {
            var u = new ByteCode();
            ByteCode.prototype.read.call(u, arg);
            return u;
        };

        /**
         * Instance method to read a padfile content into the instance
         * @param padFileName
         * @public
         */
        ByteCode.prototype.read = function (padFileName) {
            var i, it,
                str, label, rule, la,
                flag_index, val,
                labelInfo, data;

            // read the bytecode
            if (padFileName.indexOf("\n") > 0) { //padFileContent already passed as input
                this.padFileContent=padFileName;
            } else {
                this.padFileContent = Utils.get(padFileName);
            }
            this.versionInfo = this.readVersionInfo();
            this.m_code = [];// new ArrayList<Instruction>();
            this.m_rule_infos = [];// new ArrayList<RuleInfo>();
            this.GEN_LREF = true;
            this.m_lref = [];// new ArrayList<Integer>();

            if ("MaxSuspiciousMachtes" != this.consumeNextWord()) {
                throw "PAD file error: did not find \"MaxSuspiciousMachtes\"";
            }

            this.m_max_suspicious_matches = parseInt(this.consumeNextWord(), 10);

            if ("Token" != this.consumeNextWord()) {
                throw "PAD file error: did not find \"Token\"";
            }
            this.m_num_id = parseInt(this.consumeNextWord(), 10);
            var real_token_count = parseInt(this.consumeNextWord(), 10),
                total_token_count = parseInt(this.consumeNextWord(), 10),
                hasAST = false,
                line_no = 2;
            this.m_token_names = [];
            this.m_token_map = {}; // map - key String, value: Integer
            for (i = 0; i < total_token_count; ++i) {
                var tok_string;
                var tok_num;
                var first = this.consumeNextWord();
                if (Utils.stringEndsWith(first, ":") === false) {
                    throw "PAD file error: expected \"" + first + "\" to end with colon";
                }
                tok_num = parseInt(first.substring(0, first.length - 1), 10);
                tok_string = this.consumeNextWord();

                tok_string = tok_string.substring(1, tok_string.length - 1);
                if (i === real_token_count) {
                    hasAST = /^\^\.\[\d+,\d+\]$/.test(tok_string);
                }
                if (i < real_token_count || hasAST === false) {
                    this.m_token_names.push(tok_string);
                    this.m_token_map[tok_string] = tok_num;
                }
                line_no++;
            }

            if (this.m_num_id === -1) {
                throw "PAD file defines no ID token";
            }

            var label_map = {};// new HashMap<String, LabelInfoInt>();
            var rule_map = {};// new HashMap<String, LabelInfoRuleData>();
            while (true) {
                var s = this.consumeNextWord();
                if (s == null) {
                    break;
                }
                if (s.charAt(s.length - 1) === ':') {
                    label = s.substring(0, s.length - 1);
                    it = label_map[label];
                    if (it == null) {
                        // cout << _C("new Label definition: '") << label << _C("'\n");
                        var info = {
                            m_info: this.m_code.length,
                            m_is_pending: false,
                            m_forwards: []
                        }; // new LabelInfoInt
                        info.m_is_pending = false;
                        info.m_info = this.m_code.length;
                        label_map[label] = info;
                    } else {
                        // cout << _C("pending Label definition: '") << label <<
                        // _C("'\n");
                        // if (it.m_is_pending && it.m_forwards.length >
                        // 0)alert("error");
                        it.m_is_pending = false;
                        it.m_info = this.m_code.length;
                        for (i = 0; i < it.m_forwards.length; ++i) {
                            var value = it.m_forwards[i];

                            // cout << _C(" backpatching: '") << CONV(unsigned int,
                            // *it_il) << _C("'\n");
                            var rel_offset = this.m_code.length - value;
                            switch (this.m_code[value].m_opcode) {
                                case Instruction.OP_GOTO:
                                    this.m_code[value].m_rel_offset = rel_offset;
                                    break;
                                case Instruction.OP_PRED:
                                    this.m_code[value].m_rel_offset = rel_offset;
                                    break;
                                default:
                                    // alert ("error");
                                    break;
                            }
                        }
                        it.m_forwards = [];
                    }
                    line_no++;
                } else if (s === "rule") {
                    rule = this.consumeNextWord();
                    ++line_no;
                    var s1;
                    var terminal_count = 0;
                    var flag_count = 0;
                    var rule_flags = 0;
                    var role = 0;
                    var follow_count = 0;
                    var phrase = null;
                    var ruleProps = {}; // new HashMap<String, String>();
                    while (true) {
                        s1 = this.readNextQuotedWord();
                        // read rule attributes, follow= MUST be last item
                        if (s1 === "rflags=") {
                            rule_flags = parseInt(this.consumeNextWord(), 10);
                            ++line_no;
                        } else if (s1 === "role=") {
                            role = parseInt(this.consumeNextWord(), 10);
                            ++line_no;
                        } else if (s1 === "tc=") {
                            terminal_count = parseInt(this.consumeNextWord(), 10);
                            ++line_no;
                        } else if (s1 === "flgc=") {
                            flag_count = parseInt(this.consumeNextWord(), 10);
                            ++line_no;
                        } else if (s1 === "fllwc=") {
                            follow_count = parseInt(this.consumeNextWord(), 10);
                            ++line_no;
                        } else if (s1 === "phrase=") {
                            s1 = this.readNextQuotedWord();
                            phrase = s1.length > 2 ? s1.substring(1, s1.length - 2)
                                : rule;
                            ++line_no;
                        } else if (s1 === "follow=") {
                            break;
                        } else {/* EMPTY */
                            var s2 = this.readNextQuotedWord();
                            if (Utils.stringStartsWith(s2, "\"")) {
                                s2 = s2.substring(1);
                            }
                            if (Utils.stringEndsWith(s2, "\"")) {
                                s2 = s2.substring(0, s2.length - 1);
                            }
                            if (Utils.stringEndsWith(s1, "=")) {
                                s1 = s1.substring(0, s1.length - 1);
                            }
                            ruleProps[s1] = s2;
                            ++line_no;
                        } // ignore unknown items
                    }

                    // assert (s1 === "follow=");
                    // ++line_no;
                    var rule_num = this.m_rule_infos.length;
                    var entry_point = this.m_code.length;
                    var rule_info = new RuleInfo(phrase, ruleProps, terminal_count,
                        flag_count, rule_flags, role);
                    for (i = 0; i < follow_count; ++i) {
                        var z;
                        str = this.consumeNextWord();
                        if (str.length === 0 || "!" === str) {
                            // very special case <number>\r\n!
                            str = this.consumeNextWord();
                        }
                        if (Utils.stringEndsWith(str, "!")) { //$NON-NLS-1$
                            str = str.substring(0, str.length - 1);
                        }
                        z = parseInt(str, 10);

                        rule_info.m_follow_set.push(z);
                    }
                    ++line_no;
                    this.m_rule_infos.push(rule_info);

                    it = rule_map[rule];
                    if (it == null) {
                        // cout << _C("new Rule: '") << rule << _C("'\n");
                        var ruleData = {
                            left: entry_point,
                            right: rule_num
                        };
                        rule_map[rule] = new LabelInfoRuleData(ruleData, false);
                    } else {
                        // cout << _C("pending Rule: '") << rule << _C("'\n");
                        // assert (it.m_is_pending && it.m_forwards.length > 0);
                        it.m_is_pending = false;
                        it.m_info.left = entry_point;
                        it.m_info.right = rule_num;

                        for (i = 0; i < it.m_forwards.length; ++i) {
                            var it_il = it.m_forwards[i];
                            // cout << _C(" backpatching: '") << *it_il << _C("'\n");
                            switch (this.m_code[it_il].m_opcode) {
                                case Instruction.OP_CALL:
                                    this.m_code[it_il].m_entry_point = entry_point;
                                    break;
                                case Instruction.OP_PUSH_FRAME:
                                    this.m_code[it_il].m_rule_num = rule_num;
                                    break;
                                default:
                                    assert(false);
                                    break;
                            }
                        }
                        it.m_forwards = [];
                    }
                    // line_no += 8;
                } else if (s === Instruction.OP_MATCH_STR) {
                    var var_index;
                    var cat;
                    var combine;
                    var_index = parseInt(this.consumeNextWord(), 10);
                    cat = parseInt(this.consumeNextWord(), 10);
                    combine = parseInt(this.consumeNextWord(), 10);

                    str = this.consumeNextWord();
                    var isExclamationMark = false;
                    if (Utils.stringEndsWith(str, "!")) {
                        str = str.substring(0, str.length - 1);
                        isExclamationMark = true;
                    }
                    la = parseInt(str, 10);
                    var match_instr = Instruction.createInstruction(Instruction.OP_MATCH);
                    match_instr.m_is_strict = isExclamationMark;
                    match_instr.m_var_index = var_index;
                    match_instr.m_cat = cat;
                    match_instr.m_la = la;
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                    this.m_code.push(match_instr);
                } else if (s === Instruction.OP_BRANCH_STR) {
                    var has_non_strict_id;
                    var has_id;
                    var alt_count;
                    var branch_instr = Instruction.createInstruction(Instruction.OP_BRANCH);
                    has_non_strict_id = parseInt(this.consumeNextWord(), 10);
                    has_id = parseInt(this.consumeNextWord(), 10);
                    alt_count = parseInt(this.consumeNextWord(), 10);

                    branch_instr.m_has_non_strict_id = (has_non_strict_id ? true : false );
                    branch_instr.m_has_id = (has_id ? true : false);
                    branch_instr.m_alt_count = alt_count;
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                    this.m_code.push(branch_instr);
                    for (var j = 0; j < branch_instr.m_alt_count; j++) {
                        var is_strict = false;
                        str = this.consumeNextWord();
                        if (Utils.stringEndsWith(str, "!")) {
                            str = str.substring(0, str.length - 1);
                            is_strict = true;
                        }
                        la = parseInt(str, 10);
                        label = this.consumeNextWord();
                        if (label === "!") {
                            is_strict = true;
                            label = this.consumeNextWord();
                        }
                        var pred_instr = Instruction.createInstruction(Instruction.OP_PRED);
                        pred_instr.m_la = la;
                        pred_instr.m_is_strict = is_strict;
                        pred_instr.m_rel_offset = 0;
                        it = label_map[label];
                        if (it != null && !it.m_is_pending) {
                            // cout << _C("Label found: '") << label << _C("'\n");
                            pred_instr.m_rel_offset = it.m_info - this.m_code.length;
                        } else {
                            // cout << _C("Label missing: '") << label << _C("'\n");
                            labelInfo = it;
                            if (labelInfo == null) {
                                labelInfo = {
                                    m_info: 0,
                                    m_is_pending: true,
                                    m_forwards: []
                                }; // new LabelInfoInt
                            }
                            labelInfo.m_is_pending = true;
                            labelInfo.m_forwards.push(this.m_code.length);
                            label_map[label] = labelInfo;
                            // cout << _C(" registering: '")
                            // << CONV(unsigned int, m_code.size()) << _C("'\n");

                        }
                        if (this.GEN_LREF) {
                            this.m_lref.push(line_no++);
                        }
                        this.m_code.push(pred_instr);
                    }
                } else if (s === Instruction.OP_GOTO_STR) {
                    label = this.consumeNextWord();
                    var goto_instr = Instruction.createInstruction(Instruction.OP_GOTO);
                    goto_instr.m_rel_offset = 0;
                    it = label_map[label];
                    if (it != null && !it.m_is_pending) {
                        // cout << _C("Label found: '") << label << _C("'\n");
                        goto_instr.m_rel_offset = it.m_info - this.m_code.length;
                    } else {
                        // cout << _C("Label missing: '") << label << _C("'\n");
                        labelInfo = it;
                        if (labelInfo == null) {
                            labelInfo = {
                                m_info: 0,
                                m_is_pending: true,
                                m_forwards: []
                            }; // new LabelInfoInt
                        }
                        labelInfo.m_is_pending = true;
                        labelInfo.m_forwards.push(this.m_code.length);
                        label_map[label] = labelInfo;
                        // cout << _C(" registering: '")
                        // << CONV(unsigned int, m_code.size()) << _C("'\n");

                    }
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                    this.m_code.push(goto_instr);
                } else if (s === Instruction.OP_RETURN_STR) {
                    var return_instr = Instruction.createInstruction(Instruction.OP_RETURN);
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                    this.m_code.push(return_instr);
                } else if (s === Instruction.OP_EXECUTE_STR) {
                    var action_num, is_immediate;

                    is_immediate = parseInt(this.consumeNextWord(), 10);
                    action_num = parseInt(this.consumeNextWord(), 10);
                    var exec_instr = Instruction.createInstruction(Instruction.OP_EXECUTE);
                    exec_instr.m_action_num = action_num;
                    exec_instr.m_is_immediate = (is_immediate ? true : false);
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                    this.m_code.push(exec_instr);
                } else if (s === Instruction.OP_CALL_STR) {
                    rule = this.consumeNextWord();
                    var call_instr = Instruction.createInstruction(Instruction.OP_CALL);
                    it = rule_map[rule];
                    if (it != null && !it.m_is_pending) {
                        // cout << _C("Rule found: '") << rule << _C("'\n");
                        call_instr.m_entry_point = it.m_info.left;
                    } else {
                        // cout << _C("Rule missing: '") << rule << _C("'\n");
                        data = it;
                        if (data == null) {
                            data = new LabelInfoRuleData(null, true);
                        }
                        // cout << _C(" registering: '") << m_code.size() << _C("'\n");
                        data.m_forwards.push(this.m_code.length);
                        rule_map[rule] = data;
                    }
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                    this.m_code.push(call_instr);
                } else if (s === Instruction.OP_PUSH_FRAME_STR) {
                    var frame_num;
                    frame_num = parseInt(this.consumeNextWord(), 10);
                    rule = this.consumeNextWord();
                    var pushf_instr = Instruction.createInstruction(Instruction.OP_PUSH_FRAME);
                    pushf_instr.m_frame_num = frame_num;
                    it = rule_map[rule];
                    if (it != null && !it.m_is_pending) {
                        // cout << _C("Rule found: '") << rule << _C("'\n");
                        pushf_instr.m_rule_num = it.m_info.right;
                    } else {
                        // cout << _C("Rule missing: '") << rule << _C("'\n");
                        data = it;
                        if (data == null) {
                            data = new LabelInfoRuleData(null, true);
                        }
                        // cout << _C(" registering: '") << m_code.size() << _C("'\n");
                        data.m_forwards.push(this.m_code.length);
                        rule_map[rule] = data;
                    }
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                    this.m_code.push(pushf_instr);
                } else if (s === Instruction.OP_POP_FRAME_STR) {
                    var popf_instr = Instruction.createInstruction(Instruction.OP_POP_FRAME);
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                    this.m_code.push(popf_instr);
                } else if (s === Instruction.OP_STOP_STR) {
                    var stop_instr = Instruction.createInstruction(Instruction.OP_STOP);
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                    this.m_code.push(stop_instr);
                    // break; // Why this!? (BM)

                } else if (s === Instruction.OP_SET_FLAG_STR) {
                    flag_index = parseInt(this.consumeNextWord(), 10);
                    val = parseInt(this.consumeNextWord(), 10);

                    var set_instr = Instruction.createInstruction(Instruction.OP_SET_FLAG);
                    set_instr.m_flag_index = flag_index;
                    set_instr.m_val = val;
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                    this.m_code.push(set_instr);
                } else if (s === Instruction.OP_CHECK_FLAG_STR) {
                    flag_index = parseInt(this.consumeNextWord(), 10);
                    val = parseInt(this.consumeNextWord(), 10);

                    var check_instr = Instruction.createInstruction(Instruction.OP_CHECK_FLAG);
                    check_instr.m_flag_index = flag_index;
                    check_instr.m_val = val;
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                    this.m_code.push(check_instr);
                } else if (s === Instruction.OP_SYS_CALL_STR) {
                    var kind_num, arg_num;
                    kind_num = parseInt(this.consumeNextWord(), 10);
                    arg_num = parseInt(this.consumeNextWord(), 10);
                    var sys_instr = Instruction.createInstruction(Instruction.OP_SYS_CALL);
                    sys_instr.m_kind = kind_num;
                    sys_instr.m_arg = arg_num;
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                    this.m_code.push(sys_instr);
                } else if (s === Instruction.OP_AST_ACTION_STR) {
                    var has_param, kind, ast_id;
                    has_param = parseInt(this.consumeNextWord(), 10);
                    kind = parseInt(this.consumeNextWord(), 10);
                    ast_id = parseInt(this.consumeNextWord(), 10);
                    //just skip for the time being
                    if (this.GEN_LREF) {
                        this.m_lref.push(line_no++);
                    }
                } // else assert (false);

                // assert(is.eof() || is.peek() === _C('\n') || is.peek() === _C('\r'));
            }

            // rebase the alternative start rules by
            // analyzing the pad file from the back
            // we expect triples of
            //
            for (i = this.m_code.length - 1; i > 4; i -= 3) {
                if (this.m_code[i].m_opcode !== Instruction.OP_STOP ||
                        this.m_code[i - 1].m_opcode !== Instruction.OP_CALL ||
                        this.m_code[i - 2].m_opcode !== Instruction.OP_PUSH_FRAME) {
                    break;
                }
                //var functionEntryPoint = this.m_code[i - 1].m_entry_point;
                var ruleNr = this.m_code[i - 2].m_rule_num;
                this.m_rule_infos[ruleNr].setRuleEntryStartEntryPoint(i - 2);
            }

        };

        ByteCode.prototype.readVersionInfo = function () {
            var s = this.consumeNextWord();
            if (s !== "Release") {
                throw "PAD file error: \"Release\" expected";
            }
            var release = this.consumeNextWord();
            s = this.consumeNextWord();
            if (s !== "Patchlevel") {
                throw "PAD file error: \"Patchlevel\" expected";
            }
            var patchlevel = this.consumeNextWord();
            return {
                "release": release,
                "patchlevel": patchlevel,
                getPatchLevelAsString:function() {
                    return patchlevel;
                }
            };
        };

        ByteCode.prototype.consumeNextWord = function () {
            if (this.padFileContent.length === 0) {
                return null;
            }
            var i = 0;
            while (true) {
                var c = this.padFileContent.charAt(i);
                if (c === ' ' || c === '\r' || c === '\n' || c === '\t') {
                    var result = this.padFileContent.substring(0, i);

                    // consume all WS
                    while (c === ' ' || c === '\r' || c === '\n' || c === '\t') {
                        i++;
                        c = this.padFileContent.charAt(i);
                    }
                    this.padFileContent = this.padFileContent.substring(i);
                    return result;
                }
                i++;
            }
        };

        ByteCode.prototype.instruction = function (index) {
            if (index >= 0) {
                return this.m_code[index];
            } else {
                switch(index)
                {
                    case this.RUNTIME_CREATED_STOP:
                        return this.STOP_INSTRUCTION;
                    case this.RUNTIME_CREATED_RETURN:
                        return this.RETURN_INSTRUCTION;
                    default:
                        return this.STOP_INSTRUCTION;
                }
            }
        };

        ByteCode.prototype.getStartIndex = function (startRuleName) {
            if (startRuleName == null || startRuleName.length === 0) {
                return this.size() - 3;
            }
            for (var i = 0; i < this.m_rule_infos.length; ++i) {
                var ri = this.m_rule_infos[i];
                if (this.m_rule_infos[i].getRuleName() === startRuleName &&
                        ri.getRuleStartEntryPoint() > 0) {
                    return ri.getRuleStartEntryPoint();
                }
            }
            return this.size() - 3;
        };

        ByteCode.prototype.size = function () {
            return this.m_code.length;
        };

        ByteCode.prototype.ruleInfo = function (m_rule_num) {
            return this.m_rule_infos[m_rule_num];
        };

        ByteCode.prototype.getLref = function (idx) {
            if (idx  < 0) {
                /* we are on a virtual STOP or recovery RETURN.  just return -1 */
                return idx;
            }
            return this.m_lref[idx];
        };

// @Override
// public String
        ByteCode.prototype.getTokenNameUS = function (/* int */index) {
            return this.m_token_names[index];
        };

// @Override
// public boolean
        ByteCode.prototype.isPrefixOfToken2 = function (/* String */pref, /* short */index) {
            var /* String */tokenName = this.m_token_names[index];
            return (tokenName.length >= pref.length && tokenName.substring(0,
                pref.length) === pref);
        };

// @Override
// public boolean
        ByteCode.prototype.isPrefixOfToken = function (/* String */pref, /* short */index, /* boolean */
                                                       caseInsensitive) {
            if (caseInsensitive === undefined) {
                return this.isPrefixOfToken2(pref, index);
            }
            var tokenName = this.m_token_names[index];
            return tokenName.length >= pref.length &&
                (   (tokenName.substring(0, pref.length) === pref) ||
                    (caseInsensitive === true &&
                        tokenName.substring(0, pref.length).toLowerCase() === pref.toLowerCase()));
        };

// @Override
// public IRuleInfo
        ByteCode.prototype.getRuleInfo = function (/* String */ruleName) {
            for (var i = 0; i < this.m_rule_infos.length; ++i) {
                var ri = this.m_rule_infos[i];
                if (ri.getRuleName() === (ruleName)) {
                    return ri;
                }
            }
            return null;
        };

        ByteCode.prototype.readNextQuotedWord = function () {
            var i = 0;
            var in_quote = false;
            while (true) {
                var c = this.padFileContent.charAt(i);
                var result = '';
                if (c === '\r' || c === '\n') {
                    result = this.padFileContent.substring(0, i);
                    // consume all WS
                    while (c === ' ' || c === '\r' || c === '\n' || c === '\t') {
                        i++;
                        c = this.padFileContent.charAt(i);
                    }
                    this.padFileContent = this.padFileContent.substring(i);
                    return result;
                }
                if (in_quote === true && c === '\\') {
                    c = i++;
                    c = this.padFileContent.charAt(i);
                    if (c === '"' || c === '\\') {
                        // remove from string
                        // TODO:
                        throw "PAD file error: \\\" and \\\\ currently not supported in quoted words";
                    } // else result.append('\\');
                } else if (c === '"') {
                    in_quote = !in_quote;
                }
                if (in_quote === false && (c === ' ' || c === '\r' || c === '\n' || c === '\t')) {
                    result = this.padFileContent.substring(0, i);

                    // consume all WS
                    while (c === ' ' || c === '\r' || c === '\n' || c === '\t') {
                        i++;
                        c = this.padFileContent.charAt(i);
                    }
                    this.padFileContent = this.padFileContent.substring(i);
                    return result;
                }
                i++;
            }
        };

        ByteCode.prototype.getVersionInfo=function() {
            return this.versionInfo;
        };
        return ByteCode;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/ByteCodeFactory',["rndrt/ByteCode"], //dependencies
    function (ByteCode) {
        

        function ByteCodeFactory() {
        }

        ByteCodeFactory.readByteCode = function (inputStream, release, with_version_info) {
            var res = new ByteCode(release);
            res.read(inputStream, with_version_info);
            return res;
        };
        return ByteCodeFactory;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/Category',[], //dependencies
    function () {
        

        function Category(val) {
            this.value = val;
        }

        Category.CAT_UNDEF = new Category(0); ///< null value
        Category.CAT_IDENTIFIER = new Category(1); ///< token is identifier
        Category.CAT_OPERATOR = new Category(2); ///< token is operator
        Category.CAT_TOKEN_OPERATOR = new Category(3); ///< token is token-operator (e.g. ~)
        // categories 1-3 may be set by /( ... )/ clause
        Category.CAT_WS = new Category(4); ///< token is white space
        Category.CAT_COMMENT = new Category(5); ///< token is comment
        Category.CAT_LITERAL = new Category(6); ///< token is literal
        Category.CAT_MAYBE_KEYWORD = new Category(7); ///< token is identifier
        Category.CAT_KEYWORD = new Category(8); ///< token is keyword
        Category.CAT_STRICT_KEYWORD = new Category(9); ///< token is keyword
        Category.CAT_INCOMPLETE = new Category(10); ///< incomplete
        Category.CAT_ANNOTATION = new Category(11); ///< annotation
        Category.CAT_NUMERICAL_LITERAL = new Category(12); ///< Numerical literalL
        Category.CAT_PRIMITIVE = new Category(13); ///< primitive type


        Category.prototype.getValue = function () {
            return this.value;
        };

        Category.forValue = function (i) {
            if (i === 0) {
                return Category.CAT_UNDEF;
            }
            if (i === 1) {
                return Category.CAT_IDENTIFIER;
            }
            if (i === 2) {
                return Category.CAT_OPERATOR;
            }
            if (i === 3) {
                return Category.CAT_TOKEN_OPERATOR;
            }
            if (i === 4) {
                return Category.CAT_WS;
            }
            if (i === 5) {
                return Category.CAT_COMMENT;
            }
            if (i === 6) {
                return Category.CAT_LITERAL;
            }
            if (i === 7) {
                return Category.CAT_MAYBE_KEYWORD;
            }
            if (i === 8) {
                return Category.CAT_KEYWORD;
            }
            if (i === 9) {
                return Category.CAT_STRICT_KEYWORD;
            }
            if (i === 10) {
                return Category.CAT_INCOMPLETE;
            }
            if (i === Category.CAT_ANNOTATION.value) {
                return Category.CAT_ANNOTATION;
            }
            if (i === Category.CAT_NUMERICAL_LITERAL.value) {
                return Category.CAT_NUMERICAL_LITERAL;
            }
            if (i === Category.CAT_PRIMITIVE.value) {
                return Category.CAT_PRIMITIVE;
            }
            return Category.CAT_UNDEF;
        };

        return Category;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/CompletionModes',[], //dependencies
    function () {
        

// ENUM CompletionModes

        function CompletionModes(v) {
            this.value = v;
        }

        // public int
        CompletionModes.prototype.getValue = function () {
            return this.value;
        };

        CompletionModes.COMPL_MODE_NONE = new CompletionModes(0); // do not find any completions
        CompletionModes.COMPL_MODE_ALL = new CompletionModes(1); // find all completions (keywords)
        CompletionModes.COMPL_MODE_CLAUSES = new CompletionModes(2); // find all completions (clauses)
        CompletionModes.COMPL_MODE_UNIQUE = new CompletionModes(3); // find longest unique completion (code hints)
        CompletionModes.COMPL_MODE_GEN = new CompletionModes(4); // generate pad file / execute actions

        //public static CompletionModes
        CompletionModes.parse = function (i) {
            switch (i) {
            case 0:
                return CompletionModes.COMPL_MODE_NONE;
            case 1:
                return CompletionModes.COMPL_MODE_ALL;
            case 2:
                return CompletionModes.COMPL_MODE_CLAUSES;
            case 3:
                return CompletionModes.COMPL_MODE_UNIQUE;
            case 4:
                return CompletionModes.COMPL_MODE_GEN;
            }
            throw "Unknown completion mode"; //$NON-NLS-1$
        };

        return CompletionModes;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/Constants',[], //dependencies
    function () {
        

        var Constants = {

            //predefined token IDs
            NUM_UNDEF: -1,
            NUM_ANYKW: 0, // any keyword (code completion)
            NUM_ANYNOTINUSE: 1, // This token may not be used
            NUM_EOF: 2,
            NUM_NL: 3,
            NUM_COMMENT1: 4,
            NUM_COMMENT2: 5,
            LAST_NUM: 5, //NUM_COMMENT2

            //protected enum ParsingPhase
            ParsingPhase : {
                TRY_PHASE: 0,
                COMMIT_PHASE: 1
            }
        };

        return Constants;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/CursorPos',[], //dependencies
    function () {
        

        function CursorPos(line, column) {
            this.m_line = line;
            this.m_column = column;
        }

        return CursorPos;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/ScannerState',[], //dependencies
    function () {
        

        function ScannerState(state) {
            if (state == null) {
                this.m_input_pos = 0;
                this.m_colon_pos = -1;
                this.m_pos_to_proceed = -1;
                this.m_start_of_sentence = 0;
                this.m_no_chain_stmt = false;
                return;
            }
            this.m_input_pos = state.m_input_pos;
            this.m_colon_pos = state.m_colon_pos;
            this.m_pos_to_proceed = state.m_pos_to_proceed;
            this.m_start_of_sentence = state.m_start_of_sentence;
            this.m_no_chain_stmt = state.m_no_chain_stmt;
        }

        //public boolean
        ScannerState.prototype.isGreaterOrEqual = function (/*ScannerState*/ state) {
            return this.m_input_pos >= state.m_input_pos;
        };

        ScannerState.prototype.clone = function () {
            return new ScannerState(this);
        };

        return ScannerState;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/Stackframe',["require", "rndrt/FramePtr", "rndrt/RuleInfo"], //dependencies
    function (require, FramePtr, RuleInfo) {
        

        /*console.log("Stackframe Loaded");
        if (FramePtr === undefined)
            console.log("FramePtr is undefined");
        else
            console.log("FramePtr is defined");
        */

        function Stackframe(BP, rule_info, local_base) {

            if (local_base == null) {
                if (!(rule_info instanceof RuleInfo)) {
                    this.secondConstructor(BP, rule_info);
                    return;
                }
            }

            this.m_frame_idx = Stackframe.prototype.getFrameNr.call(this);
            this.m_rule_info = rule_info;
            this.m_local_base = local_base;
            if (this.m_rule_info.m_terminal_count > 0) {
                this.m_tok_base = [];
            }

            if (this.m_rule_info.m_flag_count > 0) {
                this.m_flag_base = [];
            }

            FramePtr = require("./FramePtr");
            this.m_save_BP = new FramePtr(BP);
            this.m_ref_count_ = 0;
            this.m_save_PC = null;
            this.m_save_PC_index = 0;
            this.m_actual_ref_count = 0;

            Stackframe.total_frames++; // diagnostic
            //assert (BP != this);
            var i;
            for (i = 0; i < this.m_rule_info.m_terminal_count; ++i) {
                // set to invalid index
                this.m_tok_base[i] = -1;
            }
            for (i = 0; i < this.m_rule_info.m_flag_count; ++i) {
                // set to invalid index
                this.m_flag_base[i] = false;
            }
        }


        Stackframe.prototype.secondConstructor = function (other, local_base) {

            this.m_frame_idx = this.getFrameNr();
            if (other != null) {
                this.m_rule_info = other.m_rule_info;
            }
            this.m_local_base = local_base;
            if (other != null) {
                this.m_tok_base = [];//new int[other.m_rule_info.m_terminal_count];
                this.m_flag_base = [];//new boolean[other.m_rule_info.m_flag_count];
                this.m_save_BP = other.m_save_BP;
                this.m_save_PC = other.m_save_PC;
                this.m_save_PC_index = other.m_save_PC_index;
                this.m_enteredForCompletion = other.m_enteredForCompletion;
                //remember also first token index
                this.m_first_token_index = other.m_first_token_index; // needed in coco scenarios
               
//			this.m_last_token_index = other.m_last_token_index;
                this.m_frame_factory_id = other.m_frame_factory_id;
                this.m_userContext = other.m_userContext;
            }
            this.m_ref_count_ = 0;
            this.m_actual_ref_count = 0;
            Stackframe.total_frames++;
            var count = 0, i;
            if (other != null && other.m_tok_base != null) {
                if (this.m_tok_base.length < other.m_tok_base.length) {
                    this.m_tok_base = [];//new int[other.m_tok_base.length];
                }
                for (i = 0; i < other.m_tok_base.length; ++i) {
                    this.m_tok_base[count] = other.m_tok_base[i];
                    ++count;
                }
            }
            count = 0;
            if (other != null && other.m_flag_base != null) {
                for (i = 0; i < other.m_flag_base.length; ++i) {
                    this.m_flag_base[count] = other.m_flag_base[i];
                    ++count;
                }
            }
        };

        Stackframe.total_frames = 0;
        Stackframe.s_total_frames = 0;


        Stackframe.prototype.getFirstTokenIndex = function () {
            return this.m_first_token_index;
        };

        Stackframe.prototype.performAction = function (/*action_num, parser*/) {
            /* some user stack frames override this method!*/
        };

        Stackframe.prototype.getFrameNr = function () {
            return ++Stackframe.s_total_frames;
        };

        Stackframe.prototype.setLastTokenIndex = function (index) {
            this.m_last_token_index = index;
        };

        Stackframe.prototype.setFirstTokenIndex = function (index) {
            this.m_first_token_index = index;
        };

        /**
         * @returns {RuleInfo}
         */
        Stackframe.prototype.getRuleInfo = function () {
            return this.m_rule_info;
        };
        /**
         * @returns {Stackframe}
         */
        Stackframe.prototype.getParent = function () {
            if (this.m_save_BP != null) {
                return this.m_save_BP.getStackframe();
            }
            return null;
        };

        Stackframe.prototype.m_enteredForCompletion=false;

        Stackframe.prototype.getLastMatchedTokenIndex = function () {
            return this.m_last_token_index;
        };

        Stackframe.prototype.getEnteredForCompletion = function () {
            return this.m_enteredForCompletion;
        };

        Stackframe.prototype.setEnteredForCompletion = function (val) {
            this.m_enteredForCompletion = val;
        };

        /**
         * @returns {number}
         */
        Stackframe.prototype.getParentDepth=function() {
            var sf = this;
            var i = 0;
            while (sf != null && sf.m_save_BP != null) {
                ++i;
                sf = sf.m_save_BP.getStackframe();
            }
            return i;
        };

        return Stackframe;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/FramePtr',["rndrt/Stackframe"], //dependencies
    function (Stackframe) {
        

        /* jslint eqeqeq: false */
        /* jshint eqeqeq: false */

        /*console.log("FramePtr Loaded");
        if (Stackframe === undefined)
            console.log("Stackframe is undefined");
        else
            console.log("Stackframe is defined");
        */

        function FramePtr(frame) {
            this.m_ptr = frame;
        }

        FramePtr.prototype.dispose = function () {
            this.dec();
        };

        FramePtr.prototype.dec = function () {
            /* jslint eqeqeq: false */
            /* jshint eqeqeq: false */
            if (this.m_ptr != null) {
                //assert (this.m_ptr.m_ref_count_ > 0);
                this.m_ptr.m_ref_count_--;
                if (this.m_ptr.m_ref_count_ === 0) {
                    this.m_ptr = null;
                }
                this.m_ptr = null;
            }
        };

        FramePtr.prototype.lock = function () {
            if (this.m_ptr != null) {
                if (this.m_ptr.m_ref_count_ > 1) {
                    this.m_ptr.m_ref_count_--;
                    this.m_ptr = new Stackframe(this.getStackframe(), null);//     m_ptr.clone();
                    this.inc();
                }
                //assert(this.m_ptr.m_ref_count_ == 1);
            }
        };

        FramePtr.prototype.inc = function () {
            if (this.m_ptr != null) {
                this.m_ptr.m_ref_count_++;
            }
        };

        FramePtr.prototype.getStackframe = function () {
            return this.m_ptr;
        };


        FramePtr.prototype.ptr = function () {
            return this.m_ptr;
        };

        //public void
        FramePtr.prototype.forceInc = function () {
            this.inc();
        };

        return FramePtr;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/Path',["rndrt/ScannerState", "rndrt/FramePtr"], //dependencies
    function (ScannerState, FramePtr) {
        

        function Path(PC, PC_index, BP, scanner_state, la_index, la_num, last_known_keyword, last_proper_match, stack_depth, role_depth, active_role) {

            if (la_num instanceof Path) {
                this.secondConstructor(PC, PC_index, BP, scanner_state, la_index, la_num);
                return;
            }
            this.m_PC = PC;
            this.m_PC_index = PC_index;
            this.m_PC_original = null;
            this.m_BP = BP;
            this.m_BP_original = null;
            this.m_scanner_state = new ScannerState(scanner_state);
            this.m_scanner_state_original = new ScannerState(scanner_state);
            this.m_la_index = la_index;
            this.m_la_index_original = -1;
            this.m_suspicous_matches = 0;
            this.m_err_count = 0;
            this.setPathLATokenNum(la_num);
            this.m_la_num_original = -1;
            this.m_disable_actions_for_this_path = false;
            this.m_stack_depth = stack_depth;
            this.setRoleDepth(role_depth);
            this.m_active_role = active_role;
            this.m_completion = null;
            this.m_last_known_keyword = last_known_keyword;
            this.m_last_proper_match = last_proper_match;
            this.m_penalty = 0;
            this.m_instructions_indexes = []; //new ArrayList<Integer>();
            this.m_instructions_hash = this.hashIt(this.m_instructions_indexes);
            this.m_instructionsMatchString = ""; //$NON-NLS-1$
        }

        Path.prototype.secondConstructor = function (PC, PC_index, BP, la_num, scanner_state, predecessor) {
            var r = 0;
            this.m_PC = PC;
            this.m_PC_index = PC_index;
            this.m_PC_original = predecessor.m_PC_original;
            this.m_BP = new FramePtr(BP.getStackframe());
            this.m_BP_original = new FramePtr(predecessor.m_BP_original.getStackframe());
            this.m_scanner_state = new ScannerState(scanner_state);
            this.m_scanner_state_original = new ScannerState(predecessor.m_scanner_state_original);
            this.m_la_index = predecessor.m_la_index;
            this.m_la_index_original = predecessor.m_la_index_original;
            this.m_suspicous_matches = predecessor.m_suspicous_matches;
            this.m_err_count = 0;
            this.setPathLATokenNum(la_num);
            this.m_la_num_original = predecessor.m_la_num_original;
            this.m_disable_actions_for_this_path = predecessor.m_disable_actions_for_this_path;
            this.m_stack_depth = predecessor.m_stack_depth;
            this.setRoleDepth(predecessor.getRoleDepth());
            this.m_active_role = predecessor.m_active_role;
            this.m_completion = null;
            if (predecessor.m_completion !== null) {
                this.m_completion = predecessor.m_completion.clone();
            }
            this.m_last_known_keyword = predecessor.m_last_known_keyword;
            this.m_last_proper_match = predecessor.m_last_proper_match;
            this.m_penalty = predecessor.m_penalty;

            this.m_instructions_indexes = []; //new ArrayList<Integer>(predecessor.m_instructions_indexes);
            for (r = 0; r < predecessor.m_instructions_indexes.length; ++r) {
                this.m_instructions_indexes.push(predecessor.m_instructions_indexes[r]);
            }

            this.m_instructions_hash = predecessor.m_instructions_hash;
            this.m_instructionsMatchString = predecessor.m_instructionsMatchString;

        };

        Path.prototype.restore = function () {
            this.m_BP = new FramePtr(this.m_BP_original.getStackframe());
            this.m_PC = this.m_PC_original;
            this.m_PC_index = this.m_PC_original_index;
            this.m_la_index = this.m_la_index_original;
            this.setPathLATokenNum(this.m_la_num_original);
            this.m_scanner_state = new ScannerState(this.m_scanner_state_original);
            this.m_BP_original.dispose();
        };

        Path.prototype.getRoleDepth = function () {
            return this.m_role_depth;
        };

        Path.prototype.getStackframe = function () {
            if (this.m_BP == null) {
                return null;
            }
            return this.m_BP.getStackframe();
        };

//@Override
//public void 
        Path.prototype.setCompletion = function (/*IPathCompletion*/ compl) {
            this.m_completion = compl;
        };

//@Override
//public IPathCompletion 
        Path.prototype.getCompletion = function () {
            return this.m_completion;
        };

        Path.prototype.addInstructionIndex = function (instructionIndex) {
            this.m_instructions_indexes.push(instructionIndex);
            if (this.m_instructions_indexes.length == 1) {
                this.m_instructions_hash = this.hashIt(this.m_instructions_indexes);
            } else {
                this.m_instructions_hash = (this.m_instructions_hash << 4) ^ (this.m_instructions_hash >> 28) ^ instructionIndex;
            }
        };

        Path.prototype.addInstruction = function (instr, instructionIndex) {
            this.m_instructions_indexes.push(instructionIndex);
            if (this.m_instructions_indexes.length == 1) {
                this.m_instructions_hash = this.hashIt(this.m_instructions_indexes);
            } else {
                this.m_instructions_hash = (this.m_instructions_hash << 4) ^ (this.m_instructions_hash >> 28) ^ instructionIndex;
            }
        };

        Path.prototype.getPathLATokenNum = function () {
            return this.m_la_num;
        };


        /**
         * This method is the recommended method to invoke at the end of a custom
         * error recovery hook which use
         *
         * @see Parser#returnFromOneStackframeForErrorRecovery(); ) during the
         *      recovery !
         *
         *      Using it allows to invoke actions afterwards, as the proper action
         *      variable carrying stack is used.
         */
        Path.prototype.storeCurrentPositionAsOriginClearingInstructionsOnErrorRecovery=function(scanner_state) {
            this.m_PC_original = this.m_PC;
            this.m_PC_original_index = this.m_PC_index;
            //	this.m_BP_original = new FramePtr(this.m_BP.getStackframe());
            this.m_scanner_state_original = new ScannerState(scanner_state);
            this.m_la_index_original = this.m_la_index;
            this.m_la_num_original = this.getPathLATokenNum();
            this.m_instructions_indexes = [];
            this.m_instructions_hash = 0;
            this.m_instructionsMatchString = ""; //$NON-NLS-1$
        };

        Path.prototype.storeCurrentPositionAsOriginClearingInstructions = function (scanner_state) {
            this.m_PC_original = this.m_PC;
            this.m_PC_original_index = this.m_PC_index;
            this.m_BP_original = new FramePtr(this.m_BP.getStackframe());
            this.m_scanner_state_original = new ScannerState(scanner_state);
            this.m_la_index_original = this.m_la_index;
            this.m_la_num_original = this.getPathLATokenNum();
            this.m_instructions_indexes = [];
            this.m_instructions_hash = 0;
            this.m_instructionsMatchString = ""; //$NON-NLS-1$
            // this is different, why !!! ????
            //this.m_scanner_state = this.m_scanner_state_original;
        };

        Path.prototype.resetMatchInfo = function () {
            this.m_last_known_keyword = -1;
            this.m_last_proper_match = -1;
            this.m_suspicous_matches = 0;
        };

        Path.prototype.setRoleDepth = function (m_role_depth) {
            this.m_role_depth = m_role_depth;
        };

        Path.prototype.setPathLATokenNum = function (m_la_num) {
            this.m_la_num = m_la_num;
        };

//int 
        Path.prototype.getHashCode = function () {
            var hash = this.m_instructions_hash;
            hash = (hash << 4) ^ (hash >> 28) ^ this.m_PC_index ^ this.m_la_index;
            return hash;
            //return (hash % prime);
        };

        Path.prototype.hashIt = function (instructions_indexes) {
            var hash = instructions_indexes.length;
            for (var i = 0; i < instructions_indexes.length; ++i) {
                hash = (hash << 4) ^ (hash >> 28) ^ instructions_indexes[i];
            }
            //hash = (hash << 4) ^ (hash >> 28) ^ this.m_PC_index;
            return hash;
        };

        Path.prototype.toLongString = function (/*bc*/) {
            return "";
        };

        return Path;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/StringWriter',[], //dependencies
    function () {
        

        function StringWriter() {
            this.m_buffer = [];
        }

        StringWriter.prototype.put = function (s) {
            this.m_buffer.push(s);
        };

        StringWriter.prototype.getBuffer = function () {
            return this;
        };

        StringWriter.prototype.toString = function () {
            return this.m_buffer.join("");
        };

        return StringWriter;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/PrintWriter',[], //dependencies
    function () {
        

        function PrintWriter(sw) {
            this.sw = sw;
        }

        PrintWriter.prototype.print = function (s) {
            //this.sw.put("" + s);
            this.sw.put(String(s));
        };

        PrintWriter.prototype.println = function (s) {
            this.sw.put(String(s));
        };

        /**
         * fake printf
         *
         * only used to ease test2 generation
         * behave as print(s); if (u) print(u);
         * @param s format
         * @param u unused
         */
        PrintWriter.prototype.printf = function (s, u) {
            //this.sw.put("" + s); // + u);
            this.sw.put(String(s));
            if (u !== undefined && u !== null) {
                this.sw.put(String(u));
            }
        };


        PrintWriter.prototype.append = function (s) {
            //this.sw.put("" + s);
            this.sw.put(String(s));
        };
        return PrintWriter;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/VMStatus',[], //dependencies
    function () {
        

        var VMStatus = {
            PROCEED: 0,  /// normal mode (perform instructions)
            PATH_FAILED: 1, /// current path failed
            GET_NEXT_PATH: 2, /// fetch new path
            STOPPED: 3
        };

        return VMStatus;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/ErrorState',[], //dependencies
    function () {
        

        function ErrorState(val) {
            this.m_value = val;
        }

        ErrorState.Correct = new ErrorState(0);
        ErrorState.Suspicious = new ErrorState(1);
        ErrorState.Reinterpretation = new ErrorState(2);
        ErrorState.Erroneous = new ErrorState(3);

        //public
        ErrorState.prototype.getValue = function () {
            return this.m_value;
        };
        return ErrorState;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/HookResult',[], //dependencies
    function () {
        

        var HookResult = {
            STOP: 0,
            PATHFAILED: 1,
            DONE: 2,
            NORMAL: 3
        };

        return HookResult;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/Syscodes',[], //dependencies
    function () {
        


        function Syscodes() {
        }

        Syscodes.SYS_COMMIT = 0; // discard all but current match branch
        Syscodes.SYS_CCQUERY = 1; // invoke code completion (formerly known as CCHALT)
        Syscodes.SYS_INCLUDE = 2; // include new source (OBSOLETE, don't use)
        Syscodes.SYS_CCIGNORE = 3; // prune unwanted code completion suggestions
        Syscodes.SYS_CCBLOCKEND = 4; // match only if inside corresponding open block
        Syscodes.SYS_NOCHAINSTMT = 5;// scanner returns ':' and ',' as simple tokens

        return Syscodes;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/RNDContext',[], //dependencies
    function () {
        

        function RNDContext(path) {
            this.m_sf = path.m_BP.ptr();
            this.m_index = path.m_la_index;
        }

        RNDContext.prototype.getStackframe = function () {
            return this.m_sf;
        };

        RNDContext.prototype.getTokenIndex = function () {
            return this.m_index;
        };

        return RNDContext;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/Token',[], //dependencies
    function () {
        

        function Token(num, lexem, category, offset, line, column, start_of_line, err_state, role) {
            this.m_category = category;
            this.m_role = role;
            this.m_err_state = err_state;
            this.m_num = num;
            this.m_lexem = lexem;
            this.m_line = line;
            this.m_column = column;
            this.m_start_of_line = start_of_line;
            this.m_offset = offset;
            this.m_suspicous_candidate = false;
        }

        Token.prototype.setPayload = function (payload) {
            this.mPayLoad = payload;
        };

        Token.prototype.getPayload = function () {
            return this.mPayLoad;
        };

        Token.prototype.getM_lexem = function () { //NOPMD please keep the method name like this so that XML Serialization with JAXB is working fine
            return this.m_lexem;
        };

        Token.prototype.getOffset = function () {
            return this.m_offset;
        };

        Token.prototype.getLength = function () {
            if(this.m_lexem) {
                return this.m_lexem.length;
            }
            return 0;
        };
        return Token;
    }
);


// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/ParserTrace',["rndrt/Token", "rndrt/Stackframe"], //dependencies
    function (Token, Stackframe) {
        


        function ParserTrace(/*PrintStream*/ trace) {
            this.m_trace = trace;
        }

        /*void*/
        ParserTrace.prototype.print = function (tok) {
            if (tok instanceof Token) {
                this.m_trace.print("'" + tok.m_lexem + "'(" + tok.m_num + ")(" + tok.m_line + ":" + tok.m_column + ")"); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$ //$NON-NLS-5$
                return;
            }
            if (tok instanceof Stackframe) {
                this.m_trace.print("Sf:" + tok.m_frame_idx); //$NON-NLS-1$
                return;
            }
            this.m_trace.print(tok);
        };

        /*public void*/
        ParserTrace.prototype.println = function (o) {
            this.m_trace.print(o);
            this.m_trace.print("\n");
        };

// public void print(Stackframe stackframe) {
//  this.m_trace.print("Sf:" + stackframe.m_frame_idx); //$NON-NLS-1$
// ...
// }

        return ParserTrace;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/Parser',["rndrt/Constants",
        "rndrt/Path",
        "rndrt/FramePtr",
        "rndrt/StringWriter",
        "rndrt/PrintWriter",
        "rndrt/VMStatus",
        "rndrt/ErrorState",
        "rndrt/HookResult",
        "rndrt/Instruction",
        "rndrt/Stackframe",
        "rndrt/ScannerState",
        "rndrt/Category",
        "rndrt/Syscodes",
        "rndrt/RNDContext",
        "rndrt/ParserTrace",
        "rndrt/ByteCode",
        "rndrt/Utils"], //dependencies
    function (Constants,
              Path,
              FramePtr,
              StringWriter,
              PrintWriter,
              VMStatus,
              ErrorState,
              HookResult,
              Instruction,
              Stackframe,
              ScannerState,
              Category,
              Syscodes,
              RNDContext,
              ParserTrace,
              ByteCode,
              Utils) {
        


        /**
         * The main Parser runtime class
         * @class
         * Use this class or an extension (TokenCoCoParser / ErrorCollectingParser) as base class of 
         * your parser 
         * @param {Object} byte_code byte dode  ByteCode 
         * @param {Object} scanner
         * @public
         */
        function Parser(byte_code, scanner) {
            this.MAX_PATHS_CHECKED = 1000 * 1000; // 1000*1000;//10000;
            this.MAX_SUSPICIOUS_MATCHES = (byte_code !== undefined ? byte_code.m_max_suspicious_matches : 0);
            this.m_parsing_phase = Constants.ParsingPhase.TRY_PHASE;
            this.m_byte_code = byte_code;
            this.m_scanner = scanner;
            this.m_resync = false;
            this.m_paths_checked = 0;
            this.m_hit_completion_pos = false;
            this.m_flag_check_error = false;
            this.m_vm_status = VMStatus.PROCEED;
            this.m_coco_mode = false;
            this.m_skip_actions = true;//false;
            this.setLastSyncPoint(-1);
            this.m_current = new Path(null, 0, new FramePtr(null), null, -1, -1, -1, -1, 0, -1,  0);
            this.m_global_counter = 0;
            //Assert.isTrue(scanner.getTokenIndexResolver() == byte_code, "ByteCode of Scanner and Parser do not match!"); //$NON-NLS-1$

            this.m_non_det_pool = [];
            this.m_weak_det_pool = [];
            this.m_seenThis = [];
            this.m_erroneous_pool = [];
            this.m_paths_checked = 0; // reset counter for next statement

            this.m_instructions_processed = 0;
            /// Index of the farthermost token ever touched
            this.m_la_index_max = 0;

            /// whether the parser run method should return false on an error (instead of just stopping)
            this.m_return_false_on_err = false;
            this.CANBETRUE = true;
            this.m_startRuleName = null;
            this.m_chachedStartIndex = 0;

            this.m_branchHook = null;

            this.m_pathesExhaustedHook = null;

            this.m_errorRecoveryHook = null;
            this.isActionDisabledDuringErrorReplay = true;

            this.MAX_PATHS_CHECKED = 1000 * 1000; // 1000*1000;//10000;
            this.m_trace = null;
            this.m_inifiniteSuspiciousMatches = false;
            this.m_hashReject = false;
            if (byte_code !== undefined) {
                this.alignStartIndex();
            }

            this.traceResultSW = new StringWriter();
            this.traceResult = new PrintWriter(this.traceResultSW);
        }

        Parser.prototype.getInstructionsProcessed = function () {
            return this.m_instructions_processed;
        };

        //public List<IRNDPath> 
        /**
         * Code Completion paths
         * @public 
         */
        Parser.prototype.getCompletionPaths = function () {
            return this.m_completionPaths; // TODO CLONE ! 
        };

        //public String
        /**
         * Use this method to access the resource bundle of the App
         * @returns the trace result as a String
         */
        Parser.prototype.getTraceResult = function () {
            return this.traceResultSW.getBuffer().toString();
        };

        //public void 
        Parser.prototype.enableTracing = function () {
            this.TRACING_ENABLED = true;
            this.trace(""); //$NON-NLS-1$
        };

        //public void 
        Parser.prototype.activateTrace = function (/*PrintStream*/ trace) {
            if (!trace) {
                this.m_trace = null;
                return;
            }
            this.m_trace = new ParserTrace(trace);
        };

        Parser.prototype.traceindent = function () {
        };
        Parser.prototype.dotrace = function (/*save_PC, sap_PC_index, save_BP*/) {
        };
        Parser.prototype.dumpCurrentAndOriginal = function (/*strStep*/) {
        };

        //public void 
        Parser.prototype.setInfiniteSuspiciousMatches = function (/*boolean*/ val) {
            this.m_inifiniteSuspiciousMatches = val;
        };

        //public void 
        Parser.prototype.setHashReject = function () {
            this.m_hashReject = true;
        };


        Parser.LINEAR_TRESHOLD = 8;
  
        /**
         * Run method 
         * @public 
         */
        Parser.prototype.run = function (completion_mode, halted, HALTED_INTERVAL) {
            this.m_completion_mode = completion_mode; //  should not be passed by run()
            this.m_coco_mode = false;
            this.m_skip_actions = true;

            this.halted_counter = 0; // for front end
            this.m_paths_checked = 0;
            this.halted = halted;
            if (HALTED_INTERVAL !== 0) {
                this.HALTED_INTERVAL = HALTED_INTERVAL;
            }
            return this.runInternal();
        };

        Parser.prototype.onCommitMatch = function (/*match_instr*/) {
            this.onCommitMatchContext(this.getContext());
        };

        Parser.prototype.onCommitMatchContext = function (/*context*/) {
        };

        Parser.prototype.getContext = function () {
            return new RNDContext(this.m_current);
        };


        Parser.prototype.storeOnEndofReplay = function (save_PC, save_PC_index, save_BP) {
            ///  how about initializing last_kwon_keyword and suspicious_matches
            if (this.m_trace != null) {
                this.m_trace.println("</REPLAY>"); //$NON-NLS-1$
            }
            this.setParsingPhase(Constants.ParsingPhase.TRY_PHASE);
            if (this.m_trace != null) {
                this.dumpCurrentAndOriginal("prior Store Current to:"); //$NON-NLS-1$
            }
            this.m_current.storeCurrentPositionAsOriginClearingInstructions(this.m_scanner.getStateCopy());
            if (this.m_trace != null) {
                this.dumpCurrentAndOriginal("post Store Current to:"); //$NON-NLS-1$
            }

            this.m_current.m_PC = save_PC;
            this.m_current.m_PC_index = save_PC_index;
            this.m_current.m_BP = new FramePtr(save_BP.getStackframe());

            if (this.m_trace != null) {
                this.dumpCurrentAndOriginal("post replay, reset from saved:"); //$NON-NLS-1$
                this.dotrace(save_PC, save_PC_index, this.m_current.m_BP);
            }
        };

        Parser.prototype.onMatch = function (match_instr) {
            this.vmBindToken(match_instr);
            //vmClassifyTokenForCut(match_instr);
            this.vmClassifyToken(match_instr);
            this.addCurrentInstructionToPath();
            this.setMatchPositionOnStackframe(); // this will not be set
            // do your parser specific match stuff here
        };



        //boolean 
        Parser.prototype.isOmitWeakAlt = function (is_strict) {
            if (typeof is_strict === "object") {
                return is_strict.m_is_strict;
            }
            return is_strict;
        };

        Parser.prototype.setMatchPositionOnStackframe = function () {
            var sf = this.m_current.m_BP.getStackframe();
            if (sf != null) {
                sf.setLastTokenIndex(this.m_current.m_la_index);
            }
        };

        Parser.prototype.checkForHalt = function () {
            if (this.halted != null) {
                if (this.halted_counter++ > this.HALTED_INTERVAL) {
                    if (this.halted.run()) {
                        this.clearPathAndCompletions();
                        return true;
                    }
                    this.halted_counter = 0;
                }
            }
            return false;
        };


        //  private boolean m_hit_completion_pos; // attempted to complete at least once

        //protected void 
        Parser.prototype.setHitCompletionPos = function (/*boolean*/ val) {
            this.m_hit_completion_pos = val;
        };

        // private boolean m_flag_check_error;

        //protected boolean 
        Parser.prototype.getFlagCheckError = function () {
            return this.m_flag_check_error;
        };


        //public void 
        Parser.prototype.setHashReject = function () {
            this.m_hashReject = true;
        };

        Parser.prototype.forcePathFailureInBranch = function (/*current*/) {
            return false;
        };

        Parser.prototype.returnErrMatch = function (/*match_instr*/) {
            if (this.m_trace != null) {
                this.traceindent();
                this.m_trace.println(""); //$NON-NLS-1$
                this.traceindent();
                this.m_trace.println("<---------------------------"); //$NON-NLS-1$
            }

            //Assert.isTrue(this.getParsingPhase() == Constants.ParsingPhase.TRY_PHASE);
            //    RNDRT_TRACE4("failed %i.%i: no match for '%s' expected: '%s'\n"+
            //LTOK().m_line+" "+ LTOK().m_column+" "+ LTOK().m_lexem+" "+
            //m_byte_code.get_token_name_US(match_instr.m_la));
            this.setPathFailed();
        };

        /**
         * This method *must* be overridden to enable code completion
         *
         * @param current
         * @return
         */
        //protected void 
        Parser.prototype.recordCompletionPathOnFailure = function (/*current*/) {
        };

        Parser.prototype.pathFailed = function () {
            this.onPathFailed();
            //System.out.println("Path failed: " + this.m_current.m_la_num + " flagerr" + this.m_flag_check_error + " size : "
            //      + this.m_current.m_next_tokens.toString());
            if (this.isCoCoMode()) {
                this.recordCompletionPathOnFailure(this.m_current);
            }
            this.error();
        };

        Parser.prototype.onPathFailed = function () {
        };

        Parser.prototype.compareBetterErrorPath = function (p1, bk) {
            // ... check if current resolution is better ...
            if (bk.m_last_known_keyword < p1.m_last_known_keyword) {
                // ... and clear all found resolutions
                return -1;
            }
            if (bk.m_last_known_keyword > this.m_current.m_last_known_keyword) {
                // ... return if better one was already found
                return +1;
            }
            if (bk.m_last_proper_match < this.m_current.m_last_proper_match) {
                // ... and clear all found resolutions
                return -1; //this.m_erroneous_pool.clear();
            }
            if (bk.m_last_proper_match > this.m_current.m_last_proper_match) {
                // ... return if better one was already found
                return +1;
            } //  find more precise criteria (e.g. count of matched keywords etc.)
            if (bk.m_la_index < this.m_current.m_la_index) {
                // ... and clear all found resolutions
                return -1; //this.m_erroneous_pool.clear();
            }
            if (bk.m_la_index > this.m_current.m_la_index) {
                // ... return if better one was already found
                return +1;
            } //  find more precise criteria (e.g. count of matched keywords etc.)
            return 0;
        };

        Parser.prototype.error = function () {
            // if we found some errors ...
            if (this.m_erroneous_pool.length !== 0) {
                var bk = this.m_erroneous_pool[this.m_erroneous_pool.length - 1];
                // ... check if current resolution is better ...
                var res = this.compareBetterErrorPath(this.m_current, bk);

                if (res == -1) {
                    this.m_erroneous_pool=[];//.clear();
                } else if (res > 0) {
                    return;
                }
                //  if (bk.m_last_known_keyword < this.m_current.m_last_known_keyword) {
                //      // ... and clear all found resolutions
                //      this.m_erroneous_pool.clear();
                //  } else if (bk.m_last_known_keyword > this.m_current.m_last_known_keyword) {
                //      // ... return if better one was already found
                //      return;
                //  } else if (bk.m_last_proper_match < this.m_current.m_last_proper_match) {
                //      // ... and clear all found resolutions
                //      this.m_erroneous_pool.clear();
                //  } else if (bk.m_last_proper_match > this.m_current.m_last_proper_match) {
                //      // ... return if better one was already found
                //      return;
                //  } //  find more precise criteria (e.g. count of matched keywords etc.)
                //  else if (bk.m_la_index < this.m_current.m_la_index) {
                //      // ... and clear all found resolutions
                //      this.m_erroneous_pool.clear();
                //  } else if (bk.m_la_index > this.m_current.m_la_index) {
                //      // ... return if better one was already found
                //      return;
                //  } //  find more precise criteria (e.g. count of matched keywords etc.)
            }
            // current one is better or equal to the resolutions we found so far.
            //Assert.isTrue(this.m_erroneous_pool.isEmpty()
            //      || (this.m_erroneous_pool.get(this.m_erroneous_pool.size() - 1).m_last_known_keyword == this.m_current.m_last_known_keyword && this.m_erroneous_pool
            //      .get(this.m_erroneous_pool.size() - 1).m_last_proper_match == this.m_current.m_last_proper_match));

            // add current solution to at the end
            // we are passing a clone because we might perform some
            // cleanup on this frame

            if (this.m_trace != null) {
                this.traceindent();
                this.m_trace.print("   replace errPath PC="); //$NON-NLS-1$
                this.m_trace.print(this.m_byte_code.getLref(this.m_current.m_PC_index));
                this.m_trace.print("@"); //$NON-NLS-1$
                this.m_trace.println(this.m_current.m_la_index);
            }

            /**
             * TODO check this out with actions
             */

            var clone_BP = this.m_current.m_BP != null ? new FramePtr(new Stackframe(this.m_current.m_BP.getStackframe(), null)) : null;
            this.m_erroneous_pool.unshift(new Path(this.m_current.m_PC, this.m_current.m_PC_index, clone_BP, this.m_current.getPathLATokenNum(),
                    this.m_scanner.getStateCopy(), this.m_current));
        };

        /**
         * Beware, the index of the next token to be matched when parsing A B
         *  *comment* C with respective indices A=0, B=1, C=3 after B has been
         * matched the index is 3 (!) as the scanner producer typically increments
         * to 3
         *
         * @return the next matched token index
         */
        //public int 
        Parser.prototype.getNextTokenIndex = function () {
            return this.m_current.m_la_index;
        };

        /**
         * Returns the first matched token index of the current stackframe. if no
         * token has been matched, this is already set to the next token
         *
         * @return
         */
        //public int 
        Parser.prototype.getCurrentStackFrameFirstTokenIndex = function () {
            if (this.m_current != null && this.m_current.getStackframe() != null) {
                return this.m_current.getStackframe().getFirstTokenIndex();
            }
            return -1;
        };


        /**
         * Returns the last matched token index of the current stackframe overriding
         * is not recommended
         *
         * @return
         */
        //public int 
        Parser.prototype.getLastMatchedTokenIndex = function () {
            if (this.m_current != null && this.m_current.getStackframe() != null) {
                return this.m_current.getStackframe().getLastMatchedTokenIndex();
            }
            return -1;
        };

        //protected Token 
        Parser.prototype.previousTokIgnoringNL = function () {
            if (this.m_current.m_la_index >= 1) {
                var /*int*/ idx = this.m_current.m_la_index - 1;
                var /*Token*/ tok = this.m_scanner.getToken(idx);
                while ((tok.m_category === Category.CAT_WS) || (tok.m_category === Category.CAT_COMMENT)) {
                    idx--;
                    if (idx < 0) {
                        return null;
                    }
                    tok = this.m_scanner.getToken(idx);
                }
                return tok;
            } else {
                return null;
            }
        };

        Parser.prototype.setPathFailed = function () {
            this.m_vm_status = VMStatus.PATH_FAILED; // be done for this path
        };

        Parser.prototype.isDirtyMatch = function (match_instr, num) {
            return match_instr.m_la == this.m_scanner.getActualNUMID() && this.isDirty(num);
        };

        Parser.prototype.isDirtyMatchNone = function () {
            var tok = this.lTok();
            return this.isDirtyMatchOne(tok.m_num);
        };

        Parser.prototype.isDirtyMatchOne = function (terminal) {
            return terminal > this.getTokenIndexResolver().getActualNUMID();
        };

        Parser.prototype.vmMatch = function (match_instr) {

            if (this.m_trace != null) {
                this.traceindent();
                this.m_trace.print("  vm_MATCH expect: "); //$NON-NLS-1$
                this.m_trace.print("'" + this.getByteCode().getTokenNameUS(match_instr.m_la) + "'"); //$NON-NLS-1$ //$NON-NLS-2$
                this.m_trace.print("(" + match_instr.m_la + ")"); //$NON-NLS-1$ //$NON-NLS-2$
                this.m_trace.print("have: "); //$NON-NLS-1$
                this.m_trace.print(this.lTok());
                this.m_trace.print("@"); //$NON-NLS-1$
                this.m_trace.print(this.m_current.m_la_index);
                this.m_trace.println(" " + this.getByteCode().getLref(this.m_current.m_PC_index)); //$NON-NLS-1$
            }

            //console.log("match "+match_instr.m_la);
            if (this.m_matchHook != null) {
                var res = this.m_matchHook.invoke(this.m_processorDelegate);
                switch (res) {
                case HookResult.STOP:
                    this.setVMStopped();
                    return;
                case HookResult.PATHFAILED:
                    this.setPathFailed();
                    return;
                case HookResult.DONE:
                    return;
                case HookResult.NORMAL:
                    /* continue*/
                    break;
                default:
                    throw "A match hook may not return this value \"" + res + "\""; //$NON-NLS-1$ //$NON-NLS-2$
                }
            }

            if (this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE) {
                this.onMatch(match_instr);
                this.onCommitMatch(match_instr);
                if (!this.isAnyToken(this.m_current.getPathLATokenNum())) {
                    this.nextToken();
                // } else {
                    // we get here, as we do commit in completion modes
                    //Assert.isTrue(false);
                }
                this.incrementPC();
                return;
            }
            //Assert.isTrue(!(this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE));
            if (this.match( match_instr.m_la, match_instr.m_is_strict)) {
                this.vmBindToken(match_instr);
                this.vmClassifyToken(match_instr);
                this.addCurrentInstructionToPath();
                if (!this.isAnyToken(this.m_current.getPathLATokenNum())) {
                    this.nextToken(); // we do not increment once we have reached the completion position
                }
                this.incrementPC();
            } else if (match_instr.m_la == this.m_scanner.getActualNUMID() && this.isDirtyMatchOne(this.m_current.getPathLATokenNum())) {
                if (this.isOmitWeakAlt(match_instr)) {
                    if (this.m_trace != null) {
                        this.m_trace.print("Omitting weak alt(match) on "); //$NON-NLS-1$
                        this.m_trace.print("'" + this.getByteCode().getTokenNameUS(match_instr.m_la) + "'"); //$NON-NLS-1$ //$NON-NLS-2$
                        this.m_trace.print("(" + match_instr.m_la + ")"); //$NON-NLS-1$ //$NON-NLS-2$
                        this.m_trace.print("have: "); //$NON-NLS-1$
                        this.m_trace.print(this.lTok());
                        this.m_trace.print("@"); //$NON-NLS-1$
                        this.m_trace.println(this.m_current.m_la_index);
                    }
                    //	RNDRT_TRACE2("Omitting weak alt (match) on: '%s'@%i\n", LTOK().m_lexem, m_current.m_la_index);
                    this.returnErrMatch(match_instr);
                    return;
                }
                // RNDRT_TRACE3(_C("Weak non-determinism (match) on: '%s'[%i]@%i\n"), _U2C(LTOK().m_lexem).c_str(), m_current.m_la_num, m_current.m_la_index);
                if (this.maxSuspiciousMatchesNotExceeded()) {
                    var insert_pos = this.findInsertionPos();
                    var path = new Path(this.m_current.m_PC, this.m_current.m_PC_index, this.m_current.m_BP,
                            this.m_scanner.getActualNUMID(), this.m_scanner.getStateCopy(), this.m_current);
                    this.addtoWeakDetPool(insert_pos, path);
                } else {
                    if (this.m_trace != null) {
                        this.traceindent();
                        this.m_trace.print(" Omitting path (match) because suspicous matches reached maximium. "); //$NON-NLS-1$
                        this.m_trace.print("'" + this.getByteCode().getTokenNameUS(match_instr.m_la) + "'"); //$NON-NLS-1$ //$NON-NLS-2$
                        this.m_trace.print("(" + match_instr.m_la + ")"); //$NON-NLS-1$ //$NON-NLS-2$
                        this.m_trace.print("have: "); //$NON-NLS-1$
                        this.m_trace.print(this.lTok());
                        this.m_trace.print("@"); //$NON-NLS-1$
                        this.m_trace.println(this.m_current.m_la_index);
                        //RNDRT_TRACE0("Omitting path (match) because suspicous matches reached maximium.\n");
                    }

                    this.returnErrMatch(match_instr);
                    return;
                }
                this.setGetNextPath();
                return;
            } else {
                this.returnErrMatch(match_instr);
            }
        };

        Parser.prototype.setVMProceed = function () {
            this.m_vm_status = VMStatus.PROCEED;
        };

        Parser.prototype.match = function (match_instruction_number, is_strict) {

            var res = (match_instruction_number == this.m_current.getPathLATokenNum());
            var terminal = match_instruction_number;
            if (res) {
                if (this.isStrictMatchViolation(is_strict)) {
                    return false;
                }
                // a perfect match
                return res;
            } else if (this.isCodeCompletionPosition()) {
                if (this.onMatchCollectCompletionSuggestionsOrAbort) { // call this method only when it is available; this works only when Parser inherits from TokenCoCoParser
                    return this.onMatchCollectCompletionSuggestionsOrAbort(this.lTok(), terminal, this.m_current, new RNDContext(this.m_current));
                }
            }
            return false;
        };

        Parser.prototype.isCodeCompletionPosition = function () {
            return this.m_current.getPathLATokenNum() == Constants.NUM_ANYKW;
        };

        Parser.prototype.isStrictMatchViolation = function (is_strict) {
            if (is_strict && (this.m_current.getPathLATokenNum() == this.m_scanner.getActualNUMID()) && this.isDirtyMatchNone()) {
                return true;
            }
            return false;
        };

        Parser.prototype.vmBindToken = function (match_instr) {
            var var_index = match_instr.m_var_index;
            //Assert.isTrue(var_index == 0 || var_index < this.m_current.m_BP.getStackframe().m_rule_info.m_terminal_count);
            if (this.m_current.m_BP.getStackframe() != null) {
                if (this.m_current.m_BP.getStackframe().m_tok_base == null ||
                        this.m_current.m_BP.getStackframe().m_tok_base.length <= var_index) {
                    return;
                }
                if (this.m_current.m_BP.getStackframe().m_tok_base == null || this.m_current.m_BP.getStackframe().m_tok_base.length === 0) {
                    this.m_current.m_BP.getStackframe().m_tok_base = [];//new int[1];
                }

                this.m_current.m_BP.getStackframe().m_tok_base[var_index] = this.m_current.m_la_index;
            }
        };

        Parser.prototype.lTok = function () {
            return this.m_scanner.getToken(this.m_current.m_la_index);
        };

        Parser.prototype.isAnyToken = function (X) {
            if (X == Constants.NUM_ANYKW) {
                return true;
            }
            return false;
        };

        Parser.prototype.vmReturn = function (/*return_instr*/) {
            this.addCurrentInstructionToPath();

            //Assert.isTrue(this.m_current.m_BP != null);

            if (this.m_trace != null) {
                this.traceindent();
                this.m_trace.print("<"); //$NON-NLS-1$
                this.m_trace.print(this.m_current.m_BP.getStackframe().m_rule_info.m_name + " "); //$NON-NLS-1$
            }

            var s = this.m_current.m_BP;
            //	RNDRT_TRACE1(_C("Leaving Rule: %s\n"), s->m_rule_info->m_name.c_str());

            if (this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE && this.m_current.getRoleDepth() == this.m_current.m_stack_depth) {
                this.m_current.m_active_role = 0;
                this.m_current.setRoleDepth(-1);
            }
            this.m_current.m_stack_depth--;

            if (s.getStackframe() !== null) {
                s.getStackframe().m_save_BP.lock();
            }

            if (this.getParsingPhase() !== Constants.ParsingPhase.COMMIT_PHASE) {
                this.setCurrentPC(s.getStackframe().m_save_PC_index + 1);
            } else {
                this.incrementPC();
            }
            if (s.getStackframe() != null) {
                var last_token_index = s.getStackframe().getLastMatchedTokenIndex();
                this.m_current.m_BP = new FramePtr(s.getStackframe().m_save_BP.getStackframe());
                if (this.m_current.m_BP.getStackframe() != null && this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE) {
                    this.m_current.m_BP.getStackframe().setLastTokenIndex(last_token_index);
                }
            }
            if (this.m_trace != null) {
                this.m_trace.print(" returned to ..."); //$NON-NLS-1$
                if (this.m_current.m_BP.getStackframe() != null && this.m_current.m_BP.getStackframe().m_rule_info != null) {
                    this.m_trace.println(this.m_current.m_BP.getStackframe().m_rule_info.m_name);
                }
            }
        };

        Parser.prototype.onCommit = function () {
        };

        Parser.prototype.customOnSysCommit = function () {
            return false;
        };

        Parser.prototype.addStopInstruction = function () {
            //in JS we only need to queue the index, we do not yet need the instruction itself
            this.m_current.addInstructionIndex(ByteCode.RUNTIME_CREATED_STOP);
        };

        Parser.prototype.commitAndReplay = function () {
            //Assert.isTrue(this.getParsingPhase() != Constants.ParsingPhase.COMMIT_PHASE);
            this.m_non_det_pool=[];
            this.m_weak_det_pool=[];
            this.m_seenThis=[];
            this.m_erroneous_pool=[];
            this.m_paths_checked = 0; // reset counter for next statement
            //?? this does not hold see QL Test Assert.isTrue(this.m_completionPaths.isEmpty());
            this.replay();
            this.m_current.resetMatchInfo();
            this.m_current.m_disable_actions_for_this_path = false; // reached stable state, re-enable actions
        };


        Parser.prototype.replay = function () {
            this.setParsingPhase(Constants.ParsingPhase.COMMIT_PHASE);
            this.m_current.resetMatchInfo();

            var save_PC = this.m_current.m_PC;
            var save_PC_index = this.m_current.m_PC_index;
            // copy m_BP including stackframe
            var save_BP = new FramePtr(this.m_current.m_BP.getStackframe());
            if (this.m_trace != null) {
                this.m_trace.println("<REPLAY>"); //$NON-NLS-1$
                this.m_trace.println("Saving (SavedTripel): "); //$NON-NLS-1$
                this.dotrace(save_PC, save_PC_index, save_BP);
                this.dumpCurrentAndOriginal("Prior restore:"); //$NON-NLS-1$
            }
            this.m_current.restore();
            if (this.m_trace != null) {
                this.dumpCurrentAndOriginal("Restore to:"); //$NON-NLS-1$
                this.dotrace(save_PC, save_PC_index, this.m_current.m_BP);
            }
            this.m_scanner.setState(new ScannerState(this.m_current.m_scanner_state));

            if (this.m_trace != null) {
                this.m_trace.println("<REPLAY>"); //$NON-NLS-1$
            }

            for (var ppp = 0; ppp < this.m_current.m_instructions_indexes.length; ppp++) {
                // beware, these are different from the bytecode, e.g. artificial STOPs may have been inserted
                this.m_current.m_PC_index = this.m_current.m_instructions_indexes[ppp];
                this.m_current.m_PC = this.m_byte_code.instruction(this.m_current.m_PC_index);
                //console.log("replay "+this.m_current.m_PC.m_opcode);
                switch (this.m_current.m_PC.m_opcode) {
                case Instruction.OP_MATCH:
                    this.vmMatch(this.m_current.m_PC);
                    break;
                case Instruction.OP_PUSH_FRAME:
                    this.vmPushFrame(this.m_current.m_PC);
                    break;
                case Instruction.OP_EXECUTE:
                    this.vmExecute(this.m_current.m_PC);
                    break;
                case Instruction.OP_POP_FRAME:
                    this.vmPopFrame(this.m_current.m_PC);
                    /* falls through */
                case Instruction.OP_RETURN:
                    this.vmReturn(this.m_current.m_PC);
                    break;
                case Instruction.OP_GOTO:
                case Instruction.OP_CALL:
                case Instruction.OP_BRANCH:
                case Instruction.OP_SET_FLAG:
                case Instruction.OP_CHECK_FLAG:
                    //Assert.isTrue(false);
                    break;
                case Instruction.OP_SYS_CALL:
                    this.vmSys();
                    break;
                case Instruction.OP_STOP:
                    this.storeOnEndofReplay(save_PC, save_PC_index, save_BP);
                    this.setParsingPhase(Constants.ParsingPhase.TRY_PHASE);
                    //  this.m_current.storeCurrentPositionAsOriginClearingInstructions(this.m_scanner.getStateCopy());
                    //  this.m_current.m_PC = save_PC;
                    //  this.m_current.m_PC_index = save_PC_index;
                    //  this.m_current.m_BP = new FramePtr(save_BP.getStackframe());
                    //  // RNDRT_TRACE0(_C("Finishing replay: switching to TRY_PHASE\n"));
                    //  if (this.m_trace != null) {
                    //      this.m_trace.println("</REPLAY>"); //$NON-NLS-1$
                    //  }
                    /*NOTREACHED*/
                    return;
                default:
                    break;
                //			DEFAULT_CASE1(_C("Unknown opcode %d\n"), m_current.m_PC->m_opcode)
                }
            }
            //  RNDRT_TRACE0(_C("Finishing replay: switching to TRY_PHASE\n"));
            //console.log("replay done");
            this.storeOnEndofReplay(save_PC, save_PC_index, save_BP);

            this.doSomeMessedUpWeirdErrorRecovery();
        };


        Parser.prototype.vmSys = function () {
            var sys_instr = this.m_current.m_PC;

            var kind =  sys_instr.m_kind;
            //Instruction STOP_INSTRUCTION = new Instruction();
            //STOP_INSTRUCTION.m_opcode = Instruction.OP_STOP;

            if (kind == Syscodes.SYS_COMMIT) {
                this.onCommit();
                //Assert.isTrue(this.getParsingPhase() != COMMIT_PHASE);
                if (this.customOnSysCommit()) {
                    return;
                }
                if (this.getParsingPhase() != Constants.ParsingPhase.COMMIT_PHASE) {
                    this.addStopInstruction();
                }
                if (this.customOnSysCommit()) {
                    return;
                }
                if (!this.m_coco_mode || !this.isCodeCompletionPosition() || this.m_non_det_pool.length === 0 /*|| this.m_current.m_BP.getStackframe().getParentDepth() > 1*/ ) {
                    if (this.m_trace != null) {
                        this.traceindent();
                        this.m_trace.println("  vmSys %COMMIT"); //$NON-NLS-1$
                    }
                    this.commitAndReplay(); // discard all other pending alternative paths
                } else {
                    if (this.m_trace != null) {
                        this.traceindent();
                        this.m_trace.println("  vmSys ***SKIP %COMMIT on code completion ****"); //$NON-NLS-1$
                    }
                }
            } else if (kind == Syscodes.SYS_CCQUERY ||
                    kind == Syscodes.SYS_CCBLOCKEND ||
                    kind == Syscodes.SYS_CCIGNORE) {
                this.cocoActions(kind);
            } else if (kind == Syscodes.SYS_NOCHAINSTMT) {
                this.addCurrentInstructionToPath();
                this.m_scanner.execScannerOpcode(Syscodes.SYS_NOCHAINSTMT);
            }
            //DEFAULT_CASE1(_C("ERROR: unknown op code %d\n"), kind)
            this.incrementPC();
        };


        Parser.prototype.cocoActions = function (/*kind*/) {
            // debugger;
        };


        Parser.prototype.vmClassifyToken = function(match_instr) {
            this.onVmClassifyToken(match_instr);
        };

        //@Override
        Parser.prototype.onVmClassifyToken = function(match_instr) {
            this.vmClassifyTokenStrictIsAlsoCut(match_instr);
        };

        // classic implementation
        Parser.prototype.vmClassifyTokenStrictIsAlsoCut = function(match_instr) {
            var tok = this.lTok();
            if (this.m_parsing_phase === Constants.ParsingPhase.COMMIT_PHASE && match_instr.m_cat !== 0) {
                tok.m_category = Category.forValue(match_instr.m_cat);
                //			System.out.println(tok.m_category + " " + tok.m_lexem + " " + tok.m_offset);
                return;
            }
            //assert(tok.m_err_state == Interpretation::Correct);
            //tok.m_err_state = Interpretation::Correct;
            switch (tok.m_category) {
            case Category.CAT_MAYBE_KEYWORD:
                if (match_instr.m_la == this.m_scanner.getActualNUMID()) {
                    if (this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE) {
                        tok.m_category = Category.CAT_IDENTIFIER;
                        //  System.out.println(tok.m_category+" "+tok.m_lexem+" "+tok.m_offset);
                    }
                } else if (match_instr.m_cat === 0)
                    // do not change token cat for terminals with /( ... /) re-categorization -- doing
                    // so would make all of these tokens suspicious (this side effect was noticed while
                    // adding support for typed literals)
                {
                    //ASSERTEX(terminal > m_scanner->NUM_ID);  //  centralize ASSERTEX
                    this.m_current.m_last_known_keyword = this.m_current.m_la_index;
                    this.m_current.m_last_proper_match = this.m_current.m_la_index;
                    this.m_current.m_suspicous_matches = 0;
                    tok.m_category = match_instr.m_is_strict ? Category.CAT_STRICT_KEYWORD : Category.CAT_KEYWORD;
                    //  System.out.println(tok.m_category+" "+tok.m_lexem+" "+tok.m_offset);
                }
                break;
            case Category.CAT_KEYWORD:
                if (match_instr.m_la == this.m_scanner.getActualNUMID()) {
                    //assert(m_current.m_suspicous_matches <= MAX_SUSPICIOUS_MATCHES);
                    if (this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE) {
                        tok.m_err_state = ErrorState.Suspicious;
                        tok.m_category = Category.CAT_IDENTIFIER;
                        //rememberInvalidTokenInCommitPhase(tok);
                        //  System.out.println(tok.m_category+" "+tok.m_lexem+" "+tok.m_offset);

                        if (this.TRACING_ENABLED) {
                            var line = tok.m_line + "." + tok.m_column + ":" + "suspicious token '" + tok.m_lexem + "'."; //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$
                            this.trace(line);
                        }
                    }
                    this.m_current.m_suspicous_matches++;
                } else {
                    this.m_current.m_last_known_keyword = this.m_current.m_la_index;
                    this.m_current.m_last_proper_match = this.m_current.m_la_index;
                    this.m_current.m_suspicous_matches = 0;
                }
                break;
            case Category.CAT_LITERAL:
            case Category.CAT_OPERATOR:
            case Category.CAT_TOKEN_OPERATOR:
            case Category.CAT_STRICT_KEYWORD:
                this.m_current.m_last_known_keyword = this.m_current.m_la_index;
                this.m_current.m_last_proper_match = this.m_current.m_la_index;
                this.m_current.m_suspicous_matches = 0;
                //have to remove this assertion because this raised an error in code completion scenario for sql script editor
                // Assert.isTrue(match_instr.m_la != this.m_scanner.getActualNUMID());
                break;
            case Category.CAT_IDENTIFIER:
                //assert(m_current.m_la_num == m_scanner->NUM_ID);
                this.m_current.m_last_proper_match = this.m_current.m_la_index;
                //m_current.m_suspicous_matches = 0;
                break;
            default:
                break;
            }
            //Assert.isTrue(this.m_current.m_last_proper_match >= this.m_current.m_last_known_keyword);
        };

        //new implementation
        Parser.prototype.vmClassifyTokenStrictIsOnlyStrict = function(match_instr) {
            var tok = this.lTok();
            if (this.m_parsing_phase === Constants.ParsingPhase.COMMIT_PHASE && match_instr.m_cat !== 0) {
                tok.m_category = Category.forValue(match_instr.m_cat);
                //			System.out.println(tok.m_category + " " + tok.m_lexem + " " + tok.m_offset);
                return;
            }
            //assert(tok.m_err_state == Interpretation::Correct);
            //tok.m_err_state = Interpretation::Correct;
            switch (tok.m_category) {
                case Category.CAT_MAYBE_KEYWORD:
                    if (match_instr.m_la == this.m_scanner.getActualNUMID()) {
                        if (this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE) {
                            tok.m_category = Category.CAT_IDENTIFIER;
                            if (tok.m_suspicous_candidate === true) {
                                tok.m_err_state = ErrorState.Suspicious;

                                //token diagnostic
                                if (this.TRACING_ENABLED) {
                                    var  line = tok.m_line + "." + tok.m_column + ":" + "suspicious token '" + tok.m_lexem + "'."; //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$
                                    this.trace(line);
                                }
                                this.m_current.m_suspicous_matches++;
                            }
                        }
                    } else if (match_instr.m_cat === 0)
                    // do not change token cat for terminals with /( ... /) re-categorization -- doing
                    // so would make all of these tokens suspicious (this side effect was noticed while
                    // adding support for typed literals)
                    {
                        //ASSERTEX(terminal > m_scanner->NUM_ID);  //  centralize ASSERTEX
                        this.m_current.m_last_known_keyword = this.m_current.m_la_index;
                        this.m_current.m_last_proper_match = this.m_current.m_la_index;
                        this.m_current.m_suspicous_matches = 0;

                        tok.m_suspicous_candidate = true;

                        if (this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE) {
                            tok.m_category = match_instr.m_is_strict ? Category.CAT_STRICT_KEYWORD : Category.CAT_KEYWORD;
                        }
                    }
                    break;
                case Category.CAT_KEYWORD:
                case Category.CAT_LITERAL:
                case Category.CAT_OPERATOR:
                case Category.CAT_TOKEN_OPERATOR:
                case Category.CAT_STRICT_KEYWORD:
                    this.m_current.m_last_known_keyword = this.m_current.m_la_index;
                    this.m_current.m_last_proper_match = this.m_current.m_la_index;
                    this.m_current.m_suspicous_matches = 0;
                    //have to remove this assertion because this raised an error in code completion scenario for sql script editor
                    // Assert.isTrue(match_instr.m_la != this.m_scanner.getActualNUMID());
                    break;
                case Category.CAT_IDENTIFIER:
                    //assert(m_current.m_la_num == m_scanner->NUM_ID);
                    this.m_current.m_last_proper_match = this.m_current.m_la_index;
                    //m_current.m_suspicous_matches = 0;
                    break;
                default:
                    break;
            }
            //Assert.isTrue(this.m_current.m_last_proper_match >= this.m_current.m_last_known_keyword);
        };

        Parser.prototype.getCurrentStackFrameFirstTokenIndex = function () {
            if (this.m_current != null && this.m_current.getStackframe() != null) {
                return this.m_current.getStackframe().getFirstTokenIndex();
            }
            return -1;
        };

        Parser.prototype.maxSuspiciousMatchesNotExceeded = function () {
            return this.m_inifiniteSuspiciousMatches || (this.m_current.m_suspicous_matches < this.MAX_SUSPICIOUS_MATCHES);
        };

        Parser.prototype.trace = function (line) {
            //Assert.isTrue(this.traceResult != null);
            this.traceResult.append(line + "\r\n"); //$NON-NLS-1$ //NOPMD
        };


        // protected boolean 
        Parser.prototype.addAllPathesOfBranch = function (/*BRANCHInstruction*/ branch_instr) {
            var /*int*/ alt_count = branch_instr.m_alt_count;
            //      boolean have_anykw = (this.m_current.getPathLATokenNum() == Constants.NUM_ANYKW); // NUM_ANYKW serves as Code completion indicator
            //Assert.isTrue(alt_count > 0);
            //incrementPC();
            var /*int*/ pos = 0;
            var /*List<Integer>*/ prev_addrs = []; //new ArrayList<Integer>(); // add unique addresses only
            // ANYKW matches anything
            var /*int*/ viable_non_det_alts = 0;
            while (pos < alt_count) {
                var /*PREDInstruction*/ pred_instr = /*(PREDInstruction)*/
                    this.getByteCode().instruction(this.m_current.m_PC_index + pos)
                    /*.getOrCreateInstruction(Instruction.OP_PRED)*/;
                var /*int*/ new_addr = pos + pred_instr.m_rel_offset;
                if (Utils.arrayContains(prev_addrs, new_addr) === false) {
                    // not found, so add
                    viable_non_det_alts++;
                    this.addNonDetPath(this.getByteCode().instruction(this.m_current.m_PC_index + new_addr), this.m_current.m_PC_index + new_addr,
                        this.m_current.m_BP);
                    prev_addrs.push(new_addr);
                }
                pos++;
            }
            if (viable_non_det_alts <= 0) {
                return false;
            }
            //Assert.isTrue(viable_non_det_alts > 0);
            this.m_vm_status = VMStatus.GET_NEXT_PATH;
            return true;
        };

        Parser.prototype.vmBranch = function (branch_instr) {

            if (this.m_trace != null) {
                this.traceindent();
                this.m_trace.print("  vm_BRANCH on "); //$NON-NLS-1$
                this.m_trace.print(this.lTok());
                this.m_trace.print("@"); //$NON-NLS-1$
                this.m_trace.print(this.m_current.m_la_index);
                this.m_trace.println(" " + this.getByteCode().getLref(this.m_current.m_PC_index)); //$NON-NLS-1$
            }

            if (this.m_branchHook != null) {
                var res = this.m_branchHook.invoke(this.m_processorDelegate);
                switch (res) {
                case HookResult.STOP:
                    this.setVMStopped();
                    return;
                case HookResult.PATHFAILED:
                    this.setPathFailed();
                    return;
                case HookResult.DONE:
                    return;
                case HookResult.NORMAL:
                    /* continue*/
                    break;
                default:
                    throw "Error recovery may not return PATHFAILED!"; //$NON-NLS-1$
                }
            }
            //Assert.isTrue(this.getParsingPhase() != ParsingPhase.COMMIT_PHASE);
            if (this.forcePathFailureInBranch(this.m_current)) {
                this.setPathFailed();
                return;
            }

            /*  NOTE: Never stop here, since this may prevent actions from being
                  executed.  The proper check is in ABAPParser::match()!
             if (m_current.m_tokens_completed >= m_max_completions)
                 { m_vm_status = VMStatus.PATH_FAILED; return; }
             */

            var has_non_strict_id = (branch_instr.m_has_non_strict_id);
            var has_id = (branch_instr.m_has_id);
            var alt_count = branch_instr.m_alt_count;
            var have_anykw = (this.m_current.getPathLATokenNum() == Constants.NUM_ANYKW); // NUM_ANYKW serves as Code completion indicator
            //Assert.isTrue(alt_count > 0);
            this.incrementPC();

            var pos = 0;
            var current_la_num = this.m_current.getPathLATokenNum();
            var viable_non_det_alts = 0;
            var viable_weak_det_alts = 0;
            var prev_addrs = [];//new ArrayList<Integer>(); // add unique addresses only
            var pred_instr;
            var new_addr;

            // first check for identifier because they are located at the beginning
            // of the prediction table
            if (have_anykw) {
                pos = 0; // match anything
                //  check for optimization in frontend
                this.addAllPathesOfBranch(branch_instr);
                return;
            } else {
                var left = 0;
                var right = alt_count;
                // handle #ANY_KW# token in prediction
                while (left < right) {
                    // PREDInstruction pred_instr = INSTR_AS(PRED, *(m_current.m_PC + left));
                    var newind = this.m_current.m_PC_index + left;
                    pred_instr = this.m_byte_code.instruction(newind);
                    //PREDInstruction pred_instr = (PREDInstruction) instruction.getOrCreateInstruction(Instruction.OP_PRED);
                    //var pred_instr = instruction.getAsPREDInstruction();
                    if (pred_instr.m_la != Constants.NUM_ANYKW) {
                        break;
                    }
                    new_addr = left + pred_instr.m_rel_offset;
                    if (Utils.arrayContains(prev_addrs, new_addr) === false) { //TODO: contains - is this working?
                        viable_non_det_alts++;
                        var ind = this.m_current.m_PC_index + new_addr;
                        var instr = this.m_byte_code.instruction(ind);
                        this.addNonDetPath(instr, ind, this.m_current.m_BP);
                        // process each target only once, even if we have additional
                        // non-ANYKW, non-ID predictions with identical target
                        prev_addrs.push(new_addr);
                        left++;
                    }
                }
                // handle all other tokens
                for (;;) {
                    var interval_size = right - left;
                    // for small ranges do a linear search
                    if (interval_size < Parser.LINEAR_TRESHOLD) {
                        pos = left;
                        while (pos < right && // ((PREDInstruction) this.m_byte_code.instruction(this.m_current.m_PC_index + pos).getOrCreateInstruction(
                                              //Instruction.OP_PRED)).m_la < current_la_num) {
                                this.getByteCode().instruction(this.m_current.m_PC_index + pos).m_la < current_la_num) {
                            pos++;
                        }
                        break; // for
                    }
                    // for larger ones we do a binary search
                    else {
                        var pivot = parseInt(left + interval_size / 2);
                        var predI = this.getByteCode().instruction(this.m_current.m_PC_index + pivot);
                        var la = predI.m_la;
                        if (la > current_la_num) {
                            right = pivot - 1;
                        } else if (la < current_la_num) {
                            left = pivot + 1;
                        } else {
                            //Assert.isTrue(la == current_la_num);
                            pos = pivot;
                            // because we might have some duplicates we do a linear search
                            // backwards to the first element with the specific lookahead
                            //  should continue binary
                            while (pos > left &&
                                    (this.getByteCode().instruction(this.m_current.m_PC_index + pos - 1).m_la >= current_la_num)) {
                                pos--;
                            }

                            //Assert.isTrue(this.getByteCode().instruction(this.m_current.m_PC_index + pos).getAsPREDInstruction().m_la >= current_la_num
                            //    && ((PREDInstruction) this.getByteCode().instruction(this.m_current.m_PC_index + pos)
                            //       .getOrCreateInstruction(Instruction.OP_PRED)).m_la <= current_la_num && pos >= left);
                            break; // for
                        }
                    }
                }
            }
            var is_strict = false;

            // now we can iterate over the elements we found
            if (have_anykw) {
                throw "ANY_KW not expected";
                //addAllPathesOfBranch(branch_instr);
                //return;
            } else {
                /// for deterministic grammars with a *single* matching target address,
                /// we avoid to record a *single* path  via add_non_det_path, which is
                /// subsequently popped, instead we directly append to the current path
                ///
                if (!has_non_strict_id && prev_addrs.length === 0 && (this.CANBETRUE || this.m_non_det_pool.length === 0) && true) {
                    var NEW_ADDR_INITIAL = 0x7FFFFFFF;
                    var NEW_ADDR_NONUNIQUE = 0x7FFFFFFE;
                    var first_new_addr = NEW_ADDR_INITIAL;
                    var ipos = pos;
                    while (ipos < alt_count) {
                        pred_instr = this.getByteCode().instruction(this.m_current.m_PC_index + ipos);
                        if (pred_instr.m_la != current_la_num) {
                            break;
                        }
                        // check for strict lookahead
                        if (pred_instr.m_is_strict === true && pred_instr.m_la == this.m_scanner.getActualNUMID()) {
                            is_strict = true;
                        }

                        // Add prediction only if the target hasn't been added before.
                        // If it weren't for ANY_KW, this shouldn't happen anyway!
                        new_addr = ipos + pred_instr.m_rel_offset;
                        if (first_new_addr == NEW_ADDR_INITIAL) {
                            first_new_addr = new_addr;
                        } else if (first_new_addr != new_addr) {
                            first_new_addr = NEW_ADDR_NONUNIQUE;
                        }
                        ipos++;
                    }
                    if (first_new_addr != NEW_ADDR_INITIAL && first_new_addr != NEW_ADDR_NONUNIQUE) { // found the *sole* target adress !
                        this.proceedDirect(this.m_current.m_PC_index + first_new_addr, this.m_current.m_BP);
                        return;
                    }
                }
                var is_first_token = this.getCurrentStackFrameFirstTokenIndex() == this.m_current.m_la_index;
                while (pos < alt_count) {
                    pred_instr = this.getByteCode().instruction(this.m_current.m_PC_index + pos);
                    if (pred_instr.m_la != current_la_num) {
                        // intriguingly, we NEED the check against lower_la for performance...
                        break; // while
                    }
                    // check for strict lookahead
                    if (pred_instr.m_is_strict === true) {
                        is_strict = true;
                        if (pred_instr.m_la == this.m_scanner.getActualNUMID()) {
                            if (is_first_token) {
                                if (this.isReallyDirty(this.lTok().m_num)) {
                                    ++pos; // skip dirty matches on STRICT ID's
                                    continue;
                                }
                            } else if (this.isDirty(this.lTok().m_num)) {
                                ++pos; // skip dirty matches on STRICT ID's
                                continue;
                            }
                        }
                    }
                    // Add prediction only if the target hasn't been added before.
                    // If it weren't for ANY_KW, this shouldn't happen anyway!
                    new_addr = pos + pred_instr.m_rel_offset;
                    if (Utils.arrayContains(prev_addrs, new_addr) === false) {
                        viable_non_det_alts++;
                        this.addNonDetPath(this.getByteCode().instruction(this.m_current.m_PC_index + new_addr),
                                this.m_current.m_PC_index + new_addr, this.m_current.m_BP);
                        prev_addrs.push(new_addr);
                    }
                    pos++;
                }
            }

            // if we have a keyword we should try again as ID if there are any alts for ID
            if ((has_non_strict_id || (false && has_id && (viable_non_det_alts === 0))) &&
                    this.m_current.getPathLATokenNum() > this.m_scanner.getActualNUMID()) {
                if (is_strict || (has_non_strict_id === false)) {
                    //		RNDRT_TRACE2(_C("Omitting weak alt on: '%s'@%i\n"), _U2C(LTOK().m_lexem).c_str(), m_current.m_la_index);

                    if (this.m_trace != null) {
                        this.traceindent();
                        this.m_trace.print("  Omitting weak alt due to strict " + is_strict + "/" + has_non_strict_id); //$NON-NLS-1$ //$NON-NLS-2$
                        this.m_trace.print(this.getByteCode().getLref(this.m_current.m_PC_index));
                        this.m_trace.print("@"); //$NON-NLS-1$
                        this.m_trace.println(this.m_current.m_la_index);
                    }

                    this.returnBranchErr();
                    return;
                } else {
                    viable_weak_det_alts = 1;
                        //		RNDRT_TRACE3(_C("Weak non-determinism (branch) on: '%s'[%i]@%i\n"), _U2C(LTOK().m_lexem).c_str(), m_current.m_la_num, m_current.m_la_index);
                    if (this.maxSuspiciousMatchesNotExceeded() || viable_non_det_alts === 0) {

                        if (this.m_trace != null) {
                            this.traceindent();
                            this.m_trace.print("  add weakDetPath PC="); //$NON-NLS-1$
                            this.m_trace.print(this.getByteCode().getLref(this.m_current.m_PC_index - 1));
                            this.m_trace.print("@"); //$NON-NLS-1$
                            this.m_trace.println(this.m_current.m_la_index);
                        }
                        var insert_pos = this.findInsertionPos();
                        var pth = new Path(this.getByteCode().instruction(this.m_current.m_PC_index - 1), this.m_current.m_PC_index - 1,
                                this.m_current.m_BP, this.m_scanner.getActualNUMID(), this.m_scanner.getStateCopy(), this.m_current);
                        this.addtoWeakDetPool(insert_pos, pth);
                    } else {
                        if (this.m_trace != null) {
                            this.traceindent();
                            this.m_trace.print("  Omitting path because suspicious matches reached maximum.\n"); //$NON-NLS-1$
                            this.m_trace.print(this.getByteCode().getLref(this.m_current.m_PC_index - 1));
                            this.m_trace.print("@"); //$NON-NLS-1$
                            this.m_trace.println(this.m_current.m_la_index);
                        }
                        this.returnBranchErr();
                        return;
                    }
                }
            }
            this.incrementPCdelta(alt_count); // check whether this is necessary
            if (viable_non_det_alts + viable_weak_det_alts > 0) {
                this.setGetNextPath();
                return;
            } else {
                this.returnBranchErr();
                return;
            }
        };

        /// whether the parser run method should return false on an error (instead of just stopping)
        //  public boolean m_return_false_on_err = false;
        //  protected final boolean CANBETRUE = true;
        //  private String m_startRuleName = null;
        //  private int m_chachedStartIndex;

        //  private IRNDBranchHook m_branchHook;

        Parser.prototype.setBranchHook = function (/*IRNDBranchHook*/ hook) {
            this.m_branchHook = hook;
        };

        //public void 
        Parser.prototype.setMatchHook = function (/*IRNDMatchHook*/ hook) {
            this.m_matchHook = hook;
        };

        //private IRNDPathesExhaustedHook m_pathesExhaustedHook;

        //public void 
        Parser.prototype.setPathesExhaustedHook = function (/*IRNDPathesExhaustedHook*/ hook) {
            this.m_pathesExhaustedHook = hook;
        };

        // private IRNDErrorRecoveryHook m_errorRecoveryHook;
        // private boolean isActionDisabledDuringErrorReplay = true;



        //public void 
        Parser.prototype.setErrorRecoveryHook = function (/*IRNDErrorRecoveryHook*/ hook) {
            this.m_errorRecoveryHook = hook;
        };

        //protected void 
        Parser.prototype.createAst = function () {
        };


        Parser.prototype.addNonDetPath = function (new_PC, new_PC_index, new_BP) {
            //Assert.isTrue(new_PC != null);
            //Assert.isTrue(new_BP != null);
            //Assert.isTrue(new_BP == this.m_current.m_BP);

            if (this.m_trace != null) {
                this.traceindent();
                this.m_trace.print("  add nonDetPath PC="); //$NON-NLS-1$
                this.m_trace.print(this.getByteCode().getLref(new_PC_index));
                this.m_trace.print("@"); //$NON-NLS-1$
                this.m_trace.println(this.m_current.m_la_index);
            }

            //int pos = this.m_non_det_pool.size() - 1;
            //  while (pos != this.m_non_det_pool.size() - 1 && this.m_non_det_pool.get(pos).m_penalty < this.m_current.m_penalty) {
            //      Assert.isTrue(this.getParsingPhase() == ParsingPhase.SYNC_PHASE);
            //      pos--;
            //  if (pos == -1) {
            //      pos = 0;
            //  } else {
            //      pos++;
            //  }
            var newPath = new Path(new_PC, new_PC_index, new_BP, this.m_current.getPathLATokenNum(), this.m_scanner.getStateDirect(),
                    this.m_current);
            this.m_non_det_pool.push(newPath);

            // m_non_det_pool.insert(pos.base(), new Path(new_PC, new_BP,
            //      m_current.m_la_num,
            //      m_scanner.getState(),
            //      m_current));
        };


        Parser.prototype.setGetNextPath = function () {
            this.m_vm_status = VMStatus.GET_NEXT_PATH;
        };

        Parser.prototype.addtoWeakDetPool = function (insert_pos, pth) {
            if (!this.m_hashReject) {
                this.m_weak_det_pool.splice(insert_pos, 0,pth);
                return;
            }
            var hsh = pth.getHashCode();
            if (!Utils.arrayContains(this.m_seenThis, hsh)) {
                this.m_weak_det_pool.splice(insert_pos,0,pth);
                this.m_seenThis.push(hsh);
            }
        };

        Parser.prototype.findInsertionPos = function() {
            return 0; //Java/Java Script version of CL 1503886
            /*<CL 1503886>
            // find the correct position regarding to the input position
            var index = this.m_weak_det_pool.length;
            while (index >= 1) {
                var next = this.m_weak_det_pool[index - 1];
                if (!(this.comparePathMoreSpecificOrEqual(next, this.m_scanner.getStateDirect(), this.m_current, this.getTokenIndexResolver()
                        .getActualNUMID(),this.m_byte_code))) {
                    return index;
                }
                index--;
            }
            return index;
            </CL 1503886>*/
//          // NOTE (rb): above line disabled due to pathological cases:
//       // RULE EXPR1 . PROD SUB1 | SUB2 .                  // degenerates
//          // RULE EXPR2 . PROD ( SUB1 "A" ) | ( SUB2 "B" ) .  // works OK
//      // RULE SUB1 .  PROD #ID# .
//      // RULE SUB2 .  PROD #ID# .
//      // RULE START . PROD *( EXPR1 ) | "X" "." .
//      // NOTE (rb): Apparently, this pattern no longer occurs in ABAP.xbnf
//      //            thanks to rewritten expression rule
        };

        Parser.prototype.comparePathMoreSpecificOrEqual = function (path,  state,  current,  num_id, bc) {
            // weak determinism are recorded when:
            // a) an dirty branch is possible in a branch
            // b) an dirty match   is encountered
            //
            // historically, a plain position comparison was used: path.token_index >= state.token_index
            // which leads to weak-indeterminism of a higher position being treated first
            //
            // The basic evaluation order is to pursue paths first which lead to more specific results
            // as soon as one encounters a dirty match, we switch path to pursue other alternatives with a (potentially)
            // more specific match first.
            //
            // A B ?
            // A ?
            // A #ID# ?         // " fewer tokens read are moved to front! (if expanding this path yields A #ID# #ID# ? next it will be added ( *below* (4) ), leading to a switch retaining grammar order!
            // A #ID# #ID# ?
            // A #ID# B C D E
            // A #ID# B C D #ID#
            // A #ID# B C D #ID# E
            // A #ID# ?
            // A #ID# B #ID# D
            // A #ID# B #ID# D
            // A #ID# B #ID#
            //
            // when rhs is identical, false *must* be returned to process items in GRAMMAR order!
            //
            var ord_more_specific = this.orderMoreIdSpecificOrShorter(path, current, num_id,bc);
            if (ord_more_specific !== 0) {
                return (ord_more_specific === -1);
            }
            //Assert.isTrue(ord_more_specific === 0); // identical!
            return path.m_scanner_state.isGreaterOrEqual(state);
        };


        // this is modeled after Boost filter_iterator but does not read to well in Java,
        // an adapter would be more appropriate
        function FilterIteratorInstruction(lst,bc) {
            this.list = lst;
            this.bc = bc;
            this.it_end = lst.length;
            this.it_current = 0;
            this.findNextMatch();
        }

        FilterIteratorInstruction.prototype.findNextMatch = function () {
            for (; this.it_current < this.it_end; ++this.it_current) {
                var idx = this.list[this.it_current];
                if (idx >= 0 && this.bc.instruction(idx).m_opcode == Instruction.OP_MATCH) {
                    return;
                }
            }
        };

        //public 
        FilterIteratorInstruction.prototype.inc = function () {
            if (this.it_end != this.it_current) {
                ++this.it_current;
            }
            this.findNextMatch();
            return this;
        };

        //public int 
        FilterIteratorInstruction.prototype.base = function () {
            return this.it_current;
        };

        //public int 
        FilterIteratorInstruction.prototype.end = function () {
            return this.it_end;
        };

        //public Instruction 
        FilterIteratorInstruction.prototype.element = function () {
            return this.bc.instruction(this.list[this.it_current]);
        };
 
        //    typedef filter_iterator<is_match_instruction,rndrt::Path::InstructionList::const_iterator> MatchInstructionIterator;
        // NOTE java implementaion redefines  FilterIteratorInstruction to MatchInstructionIterator
        //      This could be done like this:
        //function MatchInstructionIterator(lst, bc) {
        //    FilterIteratorInstruction.call(this, lst, bc);
        //}
        //MatchInstructionIterator.prototype = Object.create(FilterIteratorInstruction.prototype);
        // But we can also replace all usages of MatchInstructionIterator by FilterIteratorInstruction

        Parser.prototype.orderMoreIdSpecificOrShorter = function (p1,  p2,  num_id, bc) {
            if (p1.m_instructionsMatchString != null && p1.m_instructionsMatchString.length > 0) {
                var r2 = Utils.stringCompareTo(p1.m_instructionsMatchString + "I", p2.m_instructionsMatchString + "I"); //$NON-NLS-1$//$NON-NLS-2$
                return r2 > 0 ? 1 : ((r2 === 0) ? 0 : -1);
            }
            // iterate over all MATCH positions in the path, comparing #ID# positions
            var p1_it = new FilterIteratorInstruction(p1.m_instructions_indexes,bc);
            var p2_it = new FilterIteratorInstruction(p2.m_instructions_indexes,bc);
            var p1_m_la;
            var p2_m_la;

            // return std::lexicographical_compare(p1_it,p1.end, p2_it,p2.end(),compByLaId); // this should work as the shorter is the proper one

            for (; p1_it.base() != p1_it.end() && p2_it.base() != p2_it.end(); p1_it.inc(), p2_it.inc()) {
                //index_t p1_m_la = p1_it->m_MATCH.m_la;
                //index_t p2_m_la = p2_it->m_MATCH.m_la;
                p1_m_la = p1_it.element().m_la;
                p2_m_la = p2_it.element().m_la;
                if (p1_m_la != p2_m_la && (p1_m_la == num_id || p2_m_la == num_id)) {
                    return (p1_m_la != num_id) ? -1 : +1; // => p1 more specific!
                }
            }
            if (p1_it.base() == p1_it.end() && p2_it.base() == p2_it.end()) {
                return 0;
            }
            // the chains are terminated by a "virtual #id#"
            // thus A B ?   is less specific than A B C #ID# ?
            p1_m_la = (p1_it.base() == p1_it.end()) ? num_id : p1_it.element().m_la;
            p2_m_la = (p2_it.base() == p2_it.end()) ? num_id : p2_it.element().m_la;

            if ((p1_m_la == num_id || p2_m_la == num_id) && p1_m_la != p2_m_la) {
                return (p1_m_la != num_id) ? -1 : +1; // => p1 more specific!
            }
            return (p1_it.base() == p1_it.end()) ? -1 : +1; // p1 is shorter
        };


        Parser.prototype.vmPush = function (frame_num, rule_info) {
            this.m_current.m_BP = this.createFrame(frame_num, rule_info);
            // RNDRT_TRACE1(_C("Entering Rule: %s\n"), rule_info.m_name.c_str());
            this.onRuleEntry();
        };

        Parser.prototype.createFrame = function (frame_num, rule_info) {
            return new FramePtr(new Stackframe(this.m_current.m_BP.getStackframe(), rule_info, {}));
        };

        Parser.prototype.vmCall = function (call_instr) {
            //Assert.isTrue(this.m_current.m_BP.getStackframe().m_save_PC == null);
            this.m_current.m_BP.getStackframe().m_save_PC = this.m_current.m_PC;
            this.m_current.m_BP.getStackframe().m_save_PC_index = this.m_current.m_PC_index;
            this.setCurrentPC(call_instr.m_entry_point);
        };


        Parser.prototype.incrementPCdelta = function (delta) {
            this.m_current.m_PC_index += delta;
            this.alignPCwithIndex();
        };

        Parser.prototype.incrementPC = function () {
            this.incrementPCdelta(1);
        };

        Parser.prototype.onRuleEntry = function () {
            if (this.isAnyToken(this.m_current.getPathLATokenNum())) {
                this.m_current.m_BP.getStackframe().setEnteredForCompletion(true);
            }
        };

        Parser.prototype.proceedDirect = function (instruction_index, new_BP) {
            //assert new_BP != null;
            //assert new_BP == this.m_current.m_BP;
            //assert new_BP.getStackframe() == this.m_current.m_BP.getStackframe();
            this.m_current.m_BP = new_BP;
            this.setCurrentPC(instruction_index);
            this.m_current.m_scanner_state = new ScannerState(this.m_scanner.getStateDirect());
            this.m_current.m_err_count = 0;
            // we do not need a lock
            this.m_vm_status = VMStatus.PROCEED;
        };


        Parser.prototype.vmExecute = function (exe_instr) {
            if (!this.m_current.m_disable_actions_for_this_path) // no actions if path has been raised from the dead (= erroneous)
            {
                this.addCurrentInstructionToPath();
                // executing an action is quite simple: we just call the corresponding
                // action routine with the current frame number)
                if (!this.m_skip_actions) {
                    //@SuppressWarnings("unused")
                    if (this.m_trace != null) {
                        this.traceindent();
                        this.m_trace.print("  vm_EXECUTE on "); //$NON-NLS-1$
                        this.m_trace.print(this.lTok());
                        this.m_trace.print("@"); //$NON-NLS-1$
                        this.m_trace.print(this.m_current.m_la_index);
                        this.m_trace.println(" " + this.getByteCode().getLref(this.m_current.m_PC_index)); //$NON-NLS-1$
                    }

                    var action_num =  exe_instr.m_action_num;
                    //console.log("execute "+action_num);
                    if (exe_instr.m_is_immediate !== false || this.m_parsing_phase == Constants.ParsingPhase.COMMIT_PHASE) {
                        this.m_current.m_BP.getStackframe().performAction(action_num, this);
                    }
                }
            }
            this.incrementPC();
        };

        Parser.prototype.vmGoto = function (goto_instr) {
            //Assert.isTrue(this.getParsingPhase() != COMMIT_PHASE);
            this.incrementPCdelta(goto_instr.m_rel_offset);
        };

        Parser.prototype.getParsingPhase = function () {
            return this.m_parsing_phase;
        };

        Parser.prototype.addCurrentInstructionToPath = function () {
            if (this.getParsingPhase() != Constants.ParsingPhase.COMMIT_PHASE) {
                if (this.mExplicitMetricsCached) {
                    this.m_current.addInstruction(
                            this.m_current.m_PC,
                            this.m_current.m_PC_index,
                            this.m_current.m_PC.isMatchInstruction() &&
                                this.m_current.m_PC.m_la == this.getTokenIndexResolver().getActualNUMID());
                } else {
                    this.m_current.addInstruction(this.m_current.m_PC, this.m_current.m_PC_index);
                }
            }
        };

        Parser.prototype.vmPushFrame = function (pushf_instr) {
            this.addCurrentInstructionToPath();
            var rule_info = this.m_byte_code.ruleInfo(pushf_instr.m_rule_num);
            var last_token_index = -1;
            if (this.m_current.m_BP != null && this.m_current.m_BP.ptr() != null) {
                last_token_index = this.m_current.m_BP.getStackframe().getLastMatchedTokenIndex();
            }
            this.vmPush(pushf_instr.m_frame_num, rule_info);
            this.m_current.m_stack_depth++;
            if (this.m_trace != null) {
                this.traceindent();
                this.m_trace.println("Push " + rule_info.m_name); //$NON-NLS-1$
            }
            if (this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE && this.m_current.m_active_role === 0 && rule_info.m_role !== 0) {
                this.m_current.m_active_role = rule_info.m_role;
                this.m_current.setRoleDepth(this.m_current.m_stack_depth);
            }
            this.incrementPC();
            if (this.m_current.m_BP.ptr() != null) {
                this.m_current.m_BP.ptr().setFirstTokenIndex(this.m_current.m_la_index);
                this.m_current.m_BP.ptr().setLastTokenIndex(last_token_index);
            }
        };

        Parser.prototype.runWithHalted = function (haltedParam, HALTED_INTERVALParam) {
            //this.m_completion_mode = completion_mode; //  should not be passed by run()
            this.halted_counter = 0; // for front end
            this.m_paths_checked = 0;
            this.halted = haltedParam;
            if (HALTED_INTERVALParam !== 0) {
                this.HALTED_INTERVAL = HALTED_INTERVALParam;
            }
            return this.runInternal();
        };

        Parser.prototype.runInternal = function() {
            this.m_instructions_processed = 0;
            this.m_la_index_max = 0;
            var run_completed = true; // for parser
            this.m_flag_check_error = false;
            this.m_vm_status = VMStatus.PROCEED;
            while (this.m_vm_status != VMStatus.STOPPED) {
                // check if we need to stop parsing
                if (this.checkForHalt()) {
                    return false;
                }
                this.m_global_counter++;
                this.m_instructions_processed++;
                switch (this.m_vm_status) {
                case VMStatus.PROCEED:
//System.out.println("?> "+ INSTR(m_current.m_PC)+" "+ intruction_string(m_current.m_PC));
//console.log("run"+this.m_current.m_PC.m_opcode);

                    switch (this.m_current.m_PC.m_opcode) {
                    case Instruction.OP_MATCH:
                        this.vmMatch(this.m_current.m_PC);
                        break;

                    case Instruction.OP_PUSH_FRAME:
                        this.vmPushFrame(this.m_current.m_PC);
                        /* falls through */
                    case Instruction.OP_CALL:
                        this.vmCall(this.m_current.m_PC);
                        break;

                    case Instruction.OP_BRANCH:
                        this.vmBranch(this.m_current.m_PC);
                        break;

                    case Instruction.OP_EXECUTE:
                        this.vmExecute(this.m_current.m_PC);
                        break;

                    case Instruction.OP_RETURN:
                        this.vmReturn(this.m_current.m_PC);
                        break;

                    case Instruction.OP_GOTO:
                        this.vmGoto(this.m_current.m_PC);
                        break;

                    case Instruction.OP_STOP:
                        this.vmStop(this.m_current.m_PC);
                        break;

                    case Instruction.OP_SET_FLAG:
                        this.vmSet(this.m_current.m_PC);
                        break;

                    case Instruction.OP_CHECK_FLAG:
                        this.vmCheck(this.m_current.m_PC);
                        break;

                    case Instruction.OP_SYS_CALL:
                        this.vmSys();
                        break;

                    default:
                        break;
//                  DEFAULT_CASE1(_C("Unkown opcode %d\n"), m_current.m_PC.m_opcode)
                    }
                    break;
                case VMStatus.PATH_FAILED:
                    this.pathFailed();
                    /* falls through */
                case VMStatus.GET_NEXT_PATH:
                    // see if there are more pathes to be investigated ...

                    if (!this.getNextPath()) {
                        run_completed = false;
                    }
                    break;
//                  DEFAULT_CASE1(_C("Unkown parser status %d\n"), m_vm_status)
                default:
                    break;
                }
            }
            this.m_current.m_BP.dispose();
            this.m_current.m_BP_original.dispose();
            this.clearPathRetainCompletions();
            return run_completed;
        };

        //void 
        Parser.prototype.vmCheck = function (/*CHECK_FLAGInstruction*/ check_instr) {
//          Assert.isTrue(this.getParsingPhase() != ParsingPhase.COMMIT_PHASE);
//          Assert.isTrue(check_instr.m_flag_index < this.m_current.m_BP.getStackframe().m_rule_info.m_flag_count);
            if (this.m_trace != null) {
                this.traceindent();
                this.m_trace.print("   check PC="); //$NON-NLS-1$
                this.m_trace.print(this.m_byte_code.getLref(this.m_current.m_PC_index));
                this.m_trace.print(" "); //$NON-NLS-1$
                this.m_trace.print(this.lTok());
                this.m_trace.print("@"); //$NON-NLS-1$
                this.m_trace.print(this.m_current.m_la_index);
                this.m_trace.print(this.m_current.m_BP.getStackframe());
                this.m_trace.print(" flagidx:"); //$NON-NLS-1$
                this.m_trace.print(check_instr.m_flag_index);
                this.m_trace.print(" val:"); //$NON-NLS-1$
                this.m_trace.print(check_instr.m_val);
            }
            if (this.m_current.m_BP.getStackframe().m_flag_base[check_instr.m_flag_index] != this.toBoolean(check_instr.m_val)) {

                if (this.m_trace != null) {
                    this.m_trace.println("   failed!"); //$NON-NLS-1$
                }
                this.m_flag_check_error = true; // discard even for completions
                this.setPathFailed();
                return;
            }
            if (this.m_trace != null) {
                this.m_trace.println("  ok!"); //$NON-NLS-1$
            }
            this.incrementPC();
        };

        //private boolean 
        Parser.prototype.toBoolean = function (/*int*/ m_val) {
            return (m_val !== 0);
        };

        //void 
        Parser.prototype.vmSet = function (/*SET_FLAGInstruction*/ set_instr) {
//          Assert.isTrue(this.getParsingPhase() != ParsingPhase.COMMIT_PHASE);
//          Assert.isTrue(set_instr.m_flag_index < this.m_current.m_BP.getStackframe().m_rule_info.m_flag_count);
            if (this.m_trace != null) {
                this.traceindent();
                this.m_trace.print("  set flag PC="); //$NON-NLS-1$
                this.m_trace.print(this.m_byte_code.getLref(this.m_current.m_PC_index));
                this.m_trace.print(" "); //$NON-NLS-1$
                this.m_trace.print(this.lTok());
                this.m_trace.print("@"); //$NON-NLS-1$
                this.m_trace.print(this.m_current.m_la_index);
                this.m_trace.print(this.m_current.m_BP.getStackframe());
                this.m_trace.print(" flagidx:"); //$NON-NLS-1$
                this.m_trace.print(set_instr.m_flag_index);
                this.m_trace.print(" val:"); //$NON-NLS-1$
                this.m_trace.println(set_instr.m_val);
            }
            this.m_current.m_BP.getStackframe().m_flag_base[set_instr.m_flag_index] = this.toBoolean(set_instr.m_val);
            this.incrementPC();
        };

        Parser.prototype.vmStop = function (/*stop_instr*/) {
            //Assert.isTrue(this.m_current.m_BP == null);
            if (this.getParsingPhase() == Constants.ParsingPhase.TRY_PHASE) {
                this.addCurrentInstructionToPath();
            }
            // ... we need to check for the current lookahead symbol ...
            switch (this.m_current.getPathLATokenNum()) {
            // ... if we found EOF we can successfully finish
            case Constants.NUM_EOF:
                // cout << _C("finished successfully.\n");
                this.commitAndReplay();
                this.m_vm_status = VMStatus.STOPPED;
                break;
                // ... we have not been able to consume all tokens
            default:
                this.setPathFailed();
                break;
            }
        };

        Parser.prototype.getNextPath = function () {
            this.m_flag_check_error = false;
            if (this.hasMorePathes()) {
                return this.setToNextPath();
            } else if (this.m_hit_completion_pos) {
                // if completion position had been reached at some point,
                // do not resync after exhausting branches
                this.discardPath(this.m_current);
                this.setVMStopped();
            } else {
                if (this.m_pathesExhaustedHook != null) {
                    var res = this.m_pathesExhaustedHook.invoke();
                    switch (res) {
                    case HookResult.DONE:
                        return false;
                    case HookResult.NORMAL:
                        return this.pathesExhausted();
                    case HookResult.PATHFAILED:
                        throw "No PATHFAILED in pathesExhaustedHook"; //$NON-NLS-1$
                    case HookResult.STOP:
                        return false;
                    default:
                        throw "Pathes recovery may not return this result!"; //$NON-NLS-1$
                    }
                }
                return this.pathesExhausted();
            }
            return true;
        };

        Parser.prototype.hasMorePathes = function () {
            if (true === this.maxPathCheckedError()) {
                this.m_non_det_pool=[];
                this.m_weak_det_pool=[];
                this.m_paths_checked = 1;
                return false;
            }
            return (this.m_non_det_pool.length !==0) || (this.m_weak_det_pool.length !==0);
        };

        Parser.prototype.setToNextPath = function () {
            this.m_vm_status = VMStatus.STOPPED;
            // disable once the grammar has been cleaned up
            // limit number of paths to prevent being stuck in seemingly endless loop
            if (this.maxPathCheckedError()) {
                return false;
            }
            if (this.m_non_det_pool.length !== 0) {
                this.m_current = this.m_non_det_pool[this.m_non_det_pool.length - 1];
                this.m_non_det_pool.splice(this.m_non_det_pool.length - 1,1);
                if (this.m_trace != null) {
                    if (this.m_trace != null) {
                        this.traceindent();
                        this.m_trace.print("  get nonDetPath #" + this.m_non_det_pool.length + "/" + this.m_weak_det_pool.length + " PC="); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
                        this.m_trace.print(this.getByteCode().getLref(this.m_current.m_PC_index));
                        this.m_trace.print("@"); //$NON-NLS-1$
                        this.m_trace.println(this.m_current.m_la_index);
                        this.m_trace.print(this.m_current.toLongString(this.m_byte_code));
                    }
                }
            } else {
                this.m_current = this.m_weak_det_pool[this.m_weak_det_pool.length - 1];
                this.m_weak_det_pool.splice(this.m_weak_det_pool.length - 1,1);
                if (this.m_trace != null) {
                    this.traceindent();
                    this.m_trace.print("  get weakDetPath #" + this.m_non_det_pool.length + "/" + this.m_weak_det_pool.length + " PC="); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
                    this.m_trace.print(this.m_byte_code.getLref(this.m_current.m_PC_index));
                    this.m_trace.print("@"); //$NON-NLS-1$
                    this.m_trace.println(this.m_current.m_la_index);
                    this.m_trace.print(this.m_current.m_BP.getStackframe());
                    this.m_trace.print(this.m_current.toLongString(this.m_byte_code));
                }
            }
            this.m_scanner.setState(this.m_current.m_scanner_state);

            // due to the copy construction behaviour, the refcount in java  is broken
            // for code completion, this does not behave as expected,
            // as stackframes are shared and not cloned
            if (this.isCoCoMode()) {
                this.m_current.m_BP.forceInc();
                this.m_current.m_BP.forceInc();
            }
            if (this.m_trace != null) {
                var i = this.m_current.getHashCode();
                if (Utils.arrayContains(this.m_seenThis, i)) {
                    this.m_trace.println("!!!!!!!!SAW THIS ALREADY!!!!!!!!"); //$NON-NLS-1$
                }
            }
            this.m_current.m_BP.lock();
            this.m_vm_status = VMStatus.PROCEED;
            return true;
        };

        Parser.prototype.isCoCoMode = function () {
            return this.m_coco_mode;
        };

        Parser.prototype.returnBranchErr = function () {
            if (this.m_trace != null) {
                this.traceindent();
                this.m_trace.print("  branch failed at "); //$NON-NLS-1$
                this.m_trace.print(this.lTok());
                this.m_trace.print("@"); //$NON-NLS-1$
                this.m_trace.print(this.m_current.m_la_index);
                this.m_trace.print("\n"); //$NON-NLS-1$
                this.traceindent();
                this.m_trace.println("<---------------------------"); //$NON-NLS-1$
            }
            this.setPathFailed();
            return;
        };

        Parser.prototype.maxPathCheckedError = function () {
            if (++this.m_paths_checked > this.MAX_PATHS_CHECKED) {
                if (this.m_trace != null) {
                    this.traceindent();
                    this.m_trace.print("  Abort due to max_path_checked"); //$NON-NLS-1$
                    this.m_trace.println(this.MAX_PATHS_CHECKED);
                }
                return true;
            }
            return false;
        };

        Parser.prototype.pathesExhausted = function () {
            // of all the attempted pathes, pick one and decide on it
            if (this.m_trace != null) {
                this.m_trace.println("<REPLAY_erroneous_path>"); //$NON-NLS-1$
            }

            this.findBestInterpretationAndReplayIt();
            if (this.m_trace != null) {
                this.m_trace.println("</REPLAY_erroneous_path>"); //$NON-NLS-1$
            }
            if (this.m_current.m_la_index > this.getLastSyncPoint()) {
                this.setLastSyncPoint(this.m_current.m_la_index);
                var tok = this.lTok();
                tok.m_err_state = ErrorState.Erroneous;
                this.recordTokenError(this.m_current, tok);
                if (this.TRACING_ENABLED) {
                    var line = tok.m_line + "." + tok.m_column + ":" + "erroneous token '" + tok.m_lexem + "'."; //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$
                    this.trace(line);
                }
            }
            return this.recoverOnErrClearingStackAndCurrentPathAdjustingScannerPosition();
        };

        Parser.prototype.findBestInterpretation = function () {
            if (this.m_erroneous_pool.length !== 0) {
                var path = this.m_erroneous_pool[this.m_erroneous_pool.length - 1];
                return path;
            }
            return this.m_current;
        };

        Parser.prototype.discardPath = function (p) {
            p.m_BP.dispose();
            p.m_BP_original.dispose();
        };

        Parser.prototype.findBestInterpretationAndReplayIt = function () {
            //Assert.isTrue(this.m_non_det_pool.isEmpty() && this.m_weak_det_pool.isEmpty());
            var path = this.findBestInterpretation();
            if (path != this.m_current) {
                this.discardPath(this.m_current);
                this.m_current = path;
                this.m_current.m_disable_actions_for_this_path = this.isActionDisabledDuringErrorReplay; // disable actions until next commit is reached
                this.m_scanner.setState(this.m_current.m_scanner_state.clone());
                this.m_erroneous_pool=[];//.clear();
            } else {
                this.m_current = path; // NOOP
            }
            this.replay();
            this.m_current.resetMatchInfo();
            //Assert.isTrue(this.m_erroneous_pool.isEmpty());
        };

        Parser.prototype.doSomeMessedUpWeirdErrorRecovery = function () {
            // overridden only for ABAP
        };

        Parser.prototype.getLastSyncPoint = function () {
            return this.m_last_syncpoint;
        };

        Parser.prototype.recordTokenError = function (/*path,  tok*/) {
        };

        //public void 
        Parser.prototype.setRNDRunFlags = function (/*IRNDRunFlags*/ runFlags) {
            this.m_coco_mode = runFlags.isCoCoMode();
            this.m_skip_actions = runFlags.skipActions();
        };

        Parser.prototype.recoverOnErrClearingStackAndCurrentPathAdjustingScannerPosition = function () {
            if (this.m_errorRecoveryHook != null) {
                var res = this.m_errorRecoveryHook.invoke();
                switch (res) {
                case HookResult.DONE:
                    return true;
                case HookResult.PATHFAILED:
                    throw "Error recovery may not return PATHFAILED!"; //$NON-NLS-1$
                case HookResult.STOP:
                    this.setVMStopped();
                    return !this.m_return_false_on_err;
                case HookResult.NORMAL:
                    break;
                default:
                    throw "Error recovery may not return PATHFAILED!"; //$NON-NLS-1$
                }
            }

            if (this.m_current.m_BP != null) {
                if (this.m_resync) {
                    var level = 0;
                    // this strategy appears is flawed and risky if the follow sets do not lead to consumption,
                    // is also reacts specific on NUM_ID which is senseless.
                    //
                    // it lacks an appropriate KISS design
                    // for the ABAP Language which is: Recover on a *DOT* at the STMT rule.
                    //
                    //
                    // for a 732 grammar, 71 (?=) is in follow(STMT), but not consumed, subsequently ending in start rule
                    // a) just because a token appears in a follow set bears no correlation of whether it can be actually consumed in the invocation
                    // once beeing kicked above the stmt rule, we are idling away until EOF :-(, not catching a dot.
                    // -> we have to be careful not go go above "recover" rule
                    //
                    while ( this.m_current.getPathLATokenNum() != Constants.NUM_EOF &&
                            (this.m_current.getPathLATokenNum() == this.m_scanner.getActualNUMID() ||
                                (level = this.determineStackLevelsToPopViaByFollowSet(
                                    this.m_current.m_BP.getStackframe(),
                                    this.m_current.getPathLATokenNum())) === 0)) {
                        //         RNDRT_TRACE1(_C("skipping %s\n"), _U2C(LTOK().m_lexem).c_str());
                        this.nextToken();
                    }
                    if (this.m_current.getPathLATokenNum() == Constants.NUM_EOF) {
                        this.m_vm_status = VMStatus.STOPPED;
                    } else {
                        this.m_vm_status = VMStatus.PROCEED;
                        for (var i = 0; i < level; i++) {
                            this.returnFromOneStackframe();
                        }
                    }
                } else {
                    this.m_current.storeCurrentPositionAsOriginClearingInstructions(this.m_scanner.getStateCopy());
                    this.setVMStopped();
                    return !this.m_return_false_on_err;
                }
            } else {
                if (this.m_resync) { // according to lcov not used
                    //assert false;
                    //Assert.isNotNull(null);
                    var skipped_anything = false;
                    while (this.m_current.getPathLATokenNum() != Constants.NUM_EOF && this.canSkipTokenOnErrRecovery()) {
                        skipped_anything = true;
                        this.nextToken();
                    }
                    this.m_vm_status = skipped_anything ? VMStatus.PROCEED : VMStatus.STOPPED;
                } else {
                    this.m_current.storeCurrentPositionAsOriginClearingInstructions(this.m_scanner.getStateCopy());
                    this.setVMStopped();
                    return !this.m_return_false_on_err;
                }
            }
            this.m_current.storeCurrentPositionAsOriginClearingInstructions(this.m_scanner.getStateCopy());
            return true;
        };

        Parser.prototype.returnFromOneStackframe = function () {
            this.m_vm_status = VMStatus.PROCEED;
            this.m_current.m_PC_index = ByteCode.RUNTIME_CREATED_RETURN;
            this.alignPCwithIndex();
            this.vmReturn( this.m_current.m_PC);
        };

        Parser.prototype.determineStackLevelsToPopViaByFollowSet = function (stackframe, num) {
            var level = 0;
            while (stackframe != null) {
                if (stackframe.getRuleInfo() == null) {
                    return level;
                }
                level++;
                if (( (stackframe.getRuleInfo())).m_follow_set.indexOf(num) != -1) { //BP.m_rule_info.m_follow_set.size() - 1) {
                    return level;
                }
                stackframe = stackframe.getParent();
            }
            return 0;
        };

        Parser.prototype.clearPathAndCompletions = function () {
            this.clearPathRetainCompletions();
            this.m_completionPaths=[];
        };

        Parser.prototype.setInput = function (str, startPos, cursorPos,  tag) {
            this.m_scanner.setInput(str + "\0", startPos, cursorPos); //$NON-NLS-1$
            this.resetInput();
            this.onResetInput();
            if (tag != null) {
                this.m_block_end_tag = tag.toUpperCase();
            }
        };

        Parser.prototype.nextToken = function () {
            if (!this.m_scanner.hasMoreToken()) {
                this.m_current.setPathLATokenNum(Constants.NUM_EOF);
                return false;
            }
            var tok_index = this.m_scanner.getNextToken(0);
            var token = this.m_scanner.getToken(tok_index);
            if (token==null) {
                return false;
            }

            this.m_current.m_la_index = tok_index;
            this.m_current.setPathLATokenNum(token.m_num);
            if (this.m_la_index_max < tok_index)
            {
                this.m_la_index_max = tok_index;
            }
            if (this.m_trace != null) {
                this.traceindent();
                this.m_trace.print("  next token "); //$NON-NLS-1$
                this.m_trace.print(token);
                this.m_trace.print("@"); //$NON-NLS-1$
                this.m_trace.println(this.m_current.m_la_index);
            }
            return true;
        };

        Parser.prototype.onResetInput = function () {
        };

        Parser.prototype.resetInput = function () {
            this.resetCurrentOnStartRule();
            this.m_hit_completion_pos = false;
            this.nextToken();
            this.m_current.storeCurrentPositionAsOriginClearingInstructions(this.m_scanner.getStateCopy());
            this.setLastSyncPoint(-1);
        };

        Parser.prototype.resetCurrentOnStartRule = function () {
            this.setCurrentPC(this.m_chachedStartIndex);// this.m_byte_code.size() - 3);
            //Assert.isTrue(this.m_current.m_PC.m_opcode == Instruction.OP_PUSH_FRAME);
            this.m_current.m_BP.dispose();
            this.m_current.m_completion = null;
            this.m_current.m_disable_actions_for_this_path = false;
            this.m_current.resetMatchInfo();
            this.clearPathAndCompletions();
            this.setParsingPhase(Constants.ParsingPhase.TRY_PHASE);
        };

        Parser.prototype.setParsingPhase = function (m_parsing_phase) {
            this.m_parsing_phase = m_parsing_phase;
        };

        Parser.prototype.clearPathRetainCompletions = function () {
            this.m_non_det_pool=[];
            this.m_weak_det_pool=[];
            this.m_erroneous_pool=[];
        };
 
        Parser.prototype.alignStartIndex = function () {
            this.m_chachedStartIndex = this.m_byte_code.getStartIndex(this.m_startRuleName);
            this.resetCurrentOnStartRule();
        };

        Parser.prototype.resetCurrentOnStartRule = function () {
            this.setCurrentPC(this.m_chachedStartIndex);// this.m_byte_code.size() - 3);
            //Assert.isTrue(this.m_current.m_PC.m_opcode == Instruction.OP_PUSH_FRAME);
            this.m_current.m_BP.dispose();
            this.m_current.m_completion = null;
            this.m_current.m_disable_actions_for_this_path = false;
            this.m_current.resetMatchInfo();
            this.clearPathAndCompletions();
            this.setParsingPhase(Constants.ParsingPhase.TRY_PHASE);
        };

        Parser.prototype.setLastSyncPoint = function (m_last_syncpoint) {
            this.m_last_syncpoint = m_last_syncpoint;
        };

        Parser.prototype.setCurrentPC = function (newPC) {
            this.m_current.m_PC_index = newPC;
            this.alignPCwithIndex();
        };

        Parser.prototype.alignPCwithIndex = function() {
            this.m_current.m_PC = this.m_byte_code.instruction(this.m_current.m_PC_index);
        };

        Parser.prototype.getByteCode = function () {
            return this.m_byte_code;
        };


        //?private static int MAX_PATHS_CHECKED = 1000 * 1000; // 1000*1000;//10000;

        //public int 
        Parser.prototype.getMaxPathsChecked = function () {
            return this.MAX_PATHS_CHECKED;
        };

        //public void 
        Parser.prototype.setMaxPathsChecked = function (val) {
            this.MAX_PATHS_CHECKED = val;
        };
	
        // controlling the engine

        /**
         * this method should not be called by clients directly unless explicitly
         * warranted
         */
        //public final void 
        Parser.prototype.setPathFailed = function () {
            this.m_vm_status = VMStatus.PATH_FAILED; // be done for this path
        };

        //public final void 
        Parser.prototype.recordCompletionPath = function (/*IRNDPath*/ path) {
            this.m_completionPaths.push(path);
        };

        //protected final void 
        Parser.prototype.setVMStopped = function () {
            this.m_vm_status = VMStatus.STOPPED;
        };

        //public void 
        Parser.prototype.setGetNextPath = function () {
            this.m_vm_status = VMStatus.GET_NEXT_PATH;
        };

        //protected static int 
        Parser.tokIndex = function (/*Stackframe*/ bp,/*int*/ off) {
            return bp.m_tok_base[off];
        };

        /**
         * Generated resolvers use this to determine a fitting token
         *
         * @param resolver
         * @param bp
         * @param offset
         *            offset of the token in the stack frame
         * @return
         */
        //protected static Token 
        Parser.getTok = function (/*Parser*/ resolver, /*Stackframe*/ bp, /*int*/ offset) {
            var /*int*/ res = Parser.tokIndex(bp, offset);
            if (res != -1) {
                return resolver.m_scanner.getToken(res);
            }
            return null;
        };

        /**
         * Generated resolvers use this to determine a token at a given index
         *
         * @param resolver
         * @param bp
         * @param offset
         *            offset of the token in the stack frame
         * @return
         */
        //protected static Token 
        Parser.getTokenAt = function (/*Parser*/ resolver, /*Stackframe*/ bp, /*int*/ offset) {
            var /*int*/ res = offset;
            if (res != -1) {
                return resolver.m_scanner.getToken(res);
            }
            return null;
        };

        Parser.prototype.getTokenAt1=function(idx) {
            if (idx < 0) {
                return null;
            }
            return this.m_scanner.getToken(idx);
        };

        // protected static int 
        Parser.getFirstStackframeTokenIndex = function (/*Parser*/ resolver, /*Stackframe*/ bp) {
            return bp.getFirstTokenIndex();
        };

        //protected static int 
        Parser.getLastMatchedTokenIndex = function (/*Parser*/ resolver, /*Stackframe*/ bp) {
            return bp.getLastMatchedTokenIndex();
        };

        //public void 
        Parser.prototype.setStartRuleName = function (/*String*/ startRuleName) {
            this.m_startRuleName = startRuleName;
            this.alignStartIndex();
        };

        //private void 
        Parser.prototype.alignStartIndex = function () {
            this.m_chachedStartIndex = this.m_byte_code.getStartIndex(this.m_startRuleName);
            this.resetCurrentOnStartRule();
        };

        //public ITokenIndexResolver 
        Parser.prototype.getTokenIndexResolver = function () {
            return this.m_byte_code;
        };

        //public IByteCodeTokenInfo 
        Parser.prototype.getByteCodeTokenInfo = function () {
            return this.m_byte_code;
        };

        Parser.prototype.isReallyDirty = function (token_id) {
            return this.isDirty(token_id);
        };

        Parser.prototype.isDirty = function (idx) {
            return idx > this.m_scanner.getActualNUMID();
        };

        Parser.prototype.discardAllOtherPaths = function () {
            this.m_non_det_pool.clear();
            this.m_weak_det_pool.clear();
            this.m_weak_det_pool.clear();
        };

        Parser.prototype.isActionDisabledDuringErrorReplay = true;

        /**
         * Enable action execution during error replay, The default is true, which
         * means Action execution during replay of erroneous statements is disabled;
         * Setting this to false allows to execute action for the "longest path"
         */
        Parser.prototype.setisActionDisabledDuringErrorReplay = function (newValue) {
            this.isActionDisabledDuringErrorReplay = newValue;
        };

        Parser.prototype.getCurrentToken=function() {
            return this.lTok();
        };

        Parser.prototype.getCurrentTokenIndex = function () {
            return this.m_current.m_la_index;
        };

        Parser.prototype.getCurrentPath=function() {
            return this.m_current;
        };

        Parser.prototype.skipToken=function() {
            return this.nextToken();
        };

        /**
         * this method is to be invoked from error recovery hooks, the error
         * recovery hook operates on the TRY stack During error recovery, both the
         * TRY and the Execution stack have to be popped in lock step
         *
         */
        Parser.prototype.returnFromOneStackframeForErrorRecovery=function() {
            this.m_vm_status = VMStatus.PROCEED;
            this.m_current.m_PC_index = ByteCode.RUNTIME_CREATED_RETURN;
            this.alignPCwithIndex();
            this.vmReturn(this.m_current.m_PC);
            this.alignOriginalStackframeDepth();
        };

        Parser.prototype.alignOriginalStackframeDepth=function() {
            while (this.m_current.m_BP != null && this.m_current.m_BP.ptr() != null &&
                    this.m_current.m_BP_original != null && this.m_current.m_BP_original.ptr() != null &&
                    this.m_current.m_BP.getStackframe().getParentDepth() < this.m_current.m_BP_original.getStackframe().getParentDepth()) {
                this.returnOriginalSF();
            }
        };

        Parser.prototype.returnOriginalSF=function() {
            var s = this.m_current.m_BP_original;
            if (s == null) {
                return;
            }
            if (s.getStackframe() != null) {
                s.getStackframe().m_save_BP.lock();
            }
//		if (this.getParsingPhase() != ParsingPhase.COMMIT_PHASE) {
            this.setCurrentOriginalPC(s.getStackframe().m_save_PC_index + 1);
            if (s.getStackframe() != null) {
                this.m_current.m_BP_original = new FramePtr(s.getStackframe().m_save_BP.getStackframe());
            }
            if (this.m_current.m_BP_original.getStackframe() != null) {
                this.setMatchPositionOnStackframe(); // this is not correct, but better than nothing
            }
//            if (this.m_trace != null) {
//                this.m_trace.print(" returned Original to ..."); //$NON-NLS-1$
//                if (this.m_current.m_BP_original.getStackframe() != null && this.m_current.m_BP_original.getStackframe().m_rule_info != null) {
//                    this.m_trace.println(this.m_current.m_BP_original.getStackframe().m_rule_info.m_name);
//                }
//            }
        };

        /**
         * @param {Number} newPC
         */
        Parser.prototype.setCurrentOriginalPC=function(newPC) {
            this.m_current.m_PC_original_index = newPC;
            this.alignOriginalPCwithIndex();
        };

        Parser.prototype.alignOriginalPCwithIndex=function() {
            this.m_current.m_PC_original = this.m_byte_code.instruction(this.m_current.m_PC_original_index);
        };

        /**
         * @returns {Array}
         */
        Parser.prototype.getTokens = function() {
            return this.m_scanner.getInput();
        };

        return Parser;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/RNDErrorInfo',[], //dependencies
    function () {
        

        function RNDErrorInfo(/*Token*/ tok, /*String*/ message) {
            this.m_token = tok;
            this.m_msg = message;
        }

        //warning; m_token attribute is accessed via reflection in com.sap.adt.tools.abapsource.parser.ABAPRndParser. Don't modify it.

        //String
        RNDErrorInfo.prototype.getMessage = function () {
            return this.m_msg;
        };

        //int
        RNDErrorInfo.prototype.getLength = function () {
            return this.m_token.getLength();
        };

        return RNDErrorInfo;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/ErrorCollectingParser',["rndrt/Utils", "rndrt/Parser", "rndrt/RNDErrorInfo"], //dependencies
    function (Utils, Parser, RNDErrorInfo) {
        

        /**
         * A "dumb" error collecting parser which produces a simple error message
         * containing the current rule
         *
         * One would typically override the method recordTokenError to obtain a more
         * detailed language specific error message
         *
         */
        //public abstract class ErrorCollectingParser extends Parser {
        //  public ErrorCollectingParser(IByteCode byte_code, IParserScanner scanner) {
        function ErrorCollectingParser(byte_code, scanner) {
            Parser.call(this, byte_code, scanner);//super(byte_code, scanner);
            /*private final List<RNDErrorInfo>*/
            this.m_error_infos = []; //new ArrayList<RNDErrorInfo>();
        }

        //ErrorCollectingParser.prototype = Object.create(Parser.prototype);
        ErrorCollectingParser.prototype = Utils.objectCreate(Parser.prototype);


        //@Override
        //protected void recordTokenError(IRNDPath path, Token tok) {
        ErrorCollectingParser.prototype.recordTokenError = function (path, tok) {
            var /*IRNDContext*/ ctx = this.getContext();
            var /*String*/ rulename = "(unknown)"; //$NON-NLS-1$
            try {
                rulename = ctx.getStackframe().getRuleInfo().getRuleName();
            } catch (e) { //NOPMD
                // deliberately empty
            }
            this.m_error_infos.push(new RNDErrorInfo(tok, "\"" + tok.m_lexem + "\" is not allowed in rule " + rulename)); //$NON-NLS-1$ //$NON-NLS-2$
        };


        //@Override
        //public void
        ErrorCollectingParser.prototype.onResetInput = function () {
            this.m_error_infos = []; //this.m_error_infos.clear();
            Parser.prototype.onResetInput.call(this); // super.onResetInput();
        };

        //public List<RNDErrorInfo>
        ErrorCollectingParser.prototype.getErrorInfos = function () {
            return /*java.util.Collections.unmodifiableList(*/(this.m_error_infos);
        };
        return ErrorCollectingParser;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/NullFrame',[], //dependencies
    function () {
        

        function NullFrame() {
        }
        return NullFrame;
    }
);


// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/Scanner',["rndrt/ScannerState"], //dependencies
    function (ScannerState) {
        

        function Scanner(byte_code) {
            if (!byte_code) {
                return;
            }
            this.m_byte_code = byte_code;
            this.NUM_ID = byte_code.getActualNUMID();
            this.m_completion_prefix = 0;
            this.m_input = [];
        }

        Scanner.prototype.resetInput = function () {
            this.m_input = [];
            this.m_state = new ScannerState();
        };

        Scanner.prototype.getState = function () {
            return this.m_state;
        };

        Scanner.prototype.getInput = function () {
            return this.m_input;
        };

        Scanner.prototype.hasMoreToken = function () {
            if (this.endForParallel != null) {
                return this.m_state.m_input_pos < this.endForParallel;
            }
            return this.m_state.m_input_pos < this.m_input.length;
        };

//public short 
        Scanner.prototype.getTokenIndex = function (/*String*/ tok_str) {
            return this.m_byte_code.getTokenIndex(tok_str);
        };


        Scanner.prototype.getNextToken = function (/*nestingLevel*/) {
            //assert (hasMoreToken());
            return this.m_state.m_input_pos++;
        };


        Scanner.prototype.getToken = function (index) {
            //assert (index < this.m_input.size());
            return this.m_input[index];
        };

        Scanner.prototype.getStateCopy = function () {
            return new ScannerState(this.m_state);
        };

        Scanner.prototype.getStateDirect = function () {
            return this.m_state;
        };

        Scanner.prototype.setState = function (state) {
            this.m_state = new ScannerState(state);
        };

        Scanner.prototype.getActualNUMID = function () {
            return this.NUM_ID;
        };

        Scanner.prototype.getTokenIndexResolver = function () {
            return this.m_byte_code;
        };

        return Scanner;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/ScannerCoCoInserter',['rndrt/Category', 'rndrt/Constants', 'rndrt/CursorPos', 'rndrt/ErrorState', 'rndrt/Token'],
    function (Category, Constants, CursorPos, ErrorState, Token) {
        

        /**
         * Modify a raw scanner input to insert the code completion result by either
         * inserting ANYKW Tokens at corresponding locations xor Altering token numbers
         * of present tokens to Constants.NUM_ANYKW
         *
         * Note that this may involve splitting of an existing tokens. The returned
         * string is code completion prefix
         *
         *
         * This Class factors out the functionality hard-coded in an rather obscure
         * manner in the old ABAP RND scanner
         *
         *
         *
         * 
         *
         */
        var ScannerCoCoInserter = function () {
            this.LINE_SEPARATOR_SIZE = 1; // on could use System.getProperty("line.separator").length() but even on Windows a simple \n is commonly used, and we are just guessing
            this.CommentClassification = {
                NOT_A_COMMENT:0,
                EOL_COMMENT:1,
                TERMINATED_COMMENT:2
            };
        };

        /**
         * Code completion works via replacing or inserting token with token num
         * ANYKW at specific positions. <br/>
         * <br/>
         * <ol>
         * <li>
         * Insertion of a token, potentially splitting lexemes of present tokens</li>
         * <li>
         * Replacing the token number of a token</li>
         * <li>No Alteration</li>
         * </ol>
         * <br/>
         * The ABAP Scanner historically for unfathomable reasons inserted ANYKW
         * tokens only in (some) LITERALS and in ID and Keyword positions, but not
         * in operator positions. This simplified implementation inserts ANYKW
         * anywhere. <br/>
         *
         * <pre>
         *
         *   ABERTO        ... (ID, "ABERTO") ...
         *       ^ (1,5)
         * result token
         *                 ... (ANKW,"ABER") (ABAP_NUM_KEYWORD_TO, "TO) ...
         * </pre>
         *
         * <pre>
         *
         *   ABER=>TO      ... (ID, "ABER") (NUM_DARROW, "=>" )...
         *        ^  (1,5)
         * result token
         *                 ... (ANKW,"ABER") (NUM_DARROW, "=>") ...
         * </pre>
         *
         *
         * @param mutatedInput
         * @param codeCompletionPos
         *            the code completion Position
         * @param relevantTokenLowerBound
         *            index of tokens which should be considered for token
         *            completion in ABAP, with keywords above ID, this is typically
         *            ID, as (for a Keyword rich and separator/operator weak
         *            language, we only suggest KEywords)
         * @param tir
         * @return a code completion prefix if present
         */
        ScannerCoCoInserter.prototype.insertCodeCompletionPosition = function (mutatedInput,
                                                                               codeCompletionPos, relevantTokenLowerBound, tir) {
            return this.insertCodeCompletionPositionWithOffset(mutatedInput, codeCompletionPos, relevantTokenLowerBound, tir, -1);
        } ;

        ScannerCoCoInserter.prototype.insertCodeCompletionPositionWithOffset = function (mutatedInput,
                                                                               codeCompletionPos, relevantTokenLowerBound, tir, offset) {
            if (codeCompletionPos === null || codeCompletionPos.m_line < 0) {
                return null; // no code completion
            }
//            assert(mutatedInput.length == 0
//                || mutatedInput[mutatedInput.length - 1].m_num === Constants.NUM_EOF);
            if (codeCompletionPos.m_line === 0 && codeCompletionPos.m_column === 0) {
                // 0,0 implies before eof !
                return this.insertBeforeEOF(mutatedInput, offset);
            }
            if (mutatedInput.length > 2 && this.isBeforePos(codeCompletionPos, mutatedInput[0])) {
                return this.insertAtPos(mutatedInput, 0, codeCompletionPos, offset);
            }
            var i;
            for (i = 0; i < mutatedInput.length - 1; ++i) {
                var tokenAtOffsetI = mutatedInput[i];
                if (tokenAtOffsetI.m_line > codeCompletionPos.m_line) {
                    return null;
                }
                if (this.isInToken(tokenAtOffsetI, codeCompletionPos)) {
                    if (this.permitsCompletion(tokenAtOffsetI, codeCompletionPos, true) === false) {
                        //Code completion within a comment
                        return null;
                    }
                    return this.insertSplitToken(mutatedInput, i, codeCompletionPos, tir);
                }
                if (this.isDirectlyAfterToken(tokenAtOffsetI, codeCompletionPos)) {
                    if (this.isComment(tokenAtOffsetI) === this.CommentClassification.TERMINATED_COMMENT) {
                        return this.insertAtPos(mutatedInput, i + 1, codeCompletionPos, offset);
                    }
                    if (this.permitsCompletion(tokenAtOffsetI, codeCompletionPos, false) === false) {
                        //Code completion at end of a simple operator or comment
                        return null;
                    }
                    return this.alterForDirectAfterToken(mutatedInput, i, codeCompletionPos,
                        tir);
                }
                if (this.isBetweenToken(tokenAtOffsetI, mutatedInput[i + 1],
                    codeCompletionPos)) {
                    return this.insertAtPos(mutatedInput, i + 1, codeCompletionPos, offset);
                }
            }

            //boundary condition - only on EOF token
            if (mutatedInput.length == 1 && mutatedInput[0].m_num == Constants.NUM_EOF) {
                return this.insertAtPos(mutatedInput, 0, codeCompletionPos, offset);
            }

            return this.insertAtPos(mutatedInput, mutatedInput.length - 1, codeCompletionPos, offset);
        };

        /** Can be overloaded to control code completion */
        /*jshint unused: false */
        ScannerCoCoInserter.prototype.permitsCompletion = function (token, pos,  posIsInToken) {
            if (Category.CAT_COMMENT === token.m_category) {
                return false;
            }
            if (Category.CAT_WS === token.m_category) {
                return false;
            }
            return true;
        };
        /*jshint unused: true */

        /** Can be overloaded to control code completion */
        ScannerCoCoInserter.prototype.isComment = function (token) {
            if (Category.CAT_COMMENT === token.m_category) {
                return this.CommentClassification.EOL_COMMENT;
            }
            return this.CommentClassification.NOT_A_COMMENT;
        };

        ScannerCoCoInserter.prototype.insertBeforeEOF = function (mutatedInput, offset) {
            var eofToken = mutatedInput[mutatedInput.length - 1];
            if (offset === -1) {
                offset = eofToken.m_offset;
            }
            var eofPos = new CursorPos(eofToken.m_line, eofToken.m_column, "");
            return this.insertAtPos(mutatedInput, mutatedInput.length - 1,
                eofPos, offset);
        };

        ScannerCoCoInserter.prototype.isBeforePos = function (token, pos) {
            return this.isBeforePos(token.m_line, token.m_column, pos);
        };

        ScannerCoCoInserter.prototype.isBeforePos = function (line, column, pos) {
            return line < pos.m_line || (line == pos.m_line && column < pos.m_column);
        };

        ScannerCoCoInserter.prototype.isBeforePos = function (pos, token2) {
            return !this.isBeforeOrEqualPos(token2, pos);
        };

        ScannerCoCoInserter.prototype.isBeforeOrEqualPos = function (token, pos) {
            return token.m_line < pos.m_line ||
                (token.m_line == pos.m_line && token.m_column < pos.m_column) ||
                this.isEqualPos(token.m_line, token.m_column, pos);
        };

        ScannerCoCoInserter.prototype.isEqualPos = function (line, column, pos) {
            return (line == pos.m_line && column == pos.m_column);
        };


        ScannerCoCoInserter.prototype.insertAtPos = function (mutatedInput, i, codeCompletionPos, offset) {
            if (offset === -1 ) {
                offset = this.guessOffset(mutatedInput, i , codeCompletionPos);
            }
            var anykwtok = new Token(Constants.NUM_ANYKW, "", Category.CAT_UNDEF, offset, codeCompletionPos.m_line, codeCompletionPos.m_column, false, ErrorState.Correct, 0);
            //mutatedInput.add(i, anykwtok);
            mutatedInput.splice(i,0,anykwtok);

            return null;
        };

        ScannerCoCoInserter.prototype.guessOffset = function (mutatedInput, i, codeCompletionPos) {
            var offset = 0;
            var line = codeCompletionPos.m_line;
            var column = codeCompletionPos.m_column;
            if (line < 1) {
                line = 1;
            }
            if (column < 1) {
                column = 1;
            }
            if (i <= 0) {
                //first token
                offset = column - 1 + ((line - 1) * this.LINE_SEPARATOR_SIZE);
            } else {
                var previousToken = mutatedInput[i - 1];
                if (previousToken.m_line == line) {
                    //previous is on same line
                    offset = previousToken.m_offset + column - previousToken.m_column;
                } else {
                    //previous is not on the same line
                    offset = previousToken.m_offset + previousToken.getLength();
                    offset += (line - previousToken.m_line) * this.LINE_SEPARATOR_SIZE;
                    offset += column - 1;
                }
            }

            return offset;
        };

        ScannerCoCoInserter.prototype.insertSplitToken = function (mutatedInput, i,
                                                                   codeCompletionPos, tir) {
            // split the token at i
            var tokenToSplit = mutatedInput[i];
            var originalLexeme = tokenToSplit.m_lexem;
            var delta = codeCompletionPos.m_column - tokenToSplit.m_column;
            var headLexem = tokenToSplit.m_lexem.substring(0, delta);
            var tailLexem = tokenToSplit.m_lexem.substring(delta);
            var tailNum = tokenToSplit.m_num;
            // if the 2nd part is a known token, we use it's ID
            var resolved = tir.getTokenIndex(tailLexem);
            if (resolved > 0) {
                tailNum = resolved;
            }

            var tailToken = new Token(tailNum, tailLexem, Category.CAT_UNDEF,
                    tokenToSplit.m_offset + delta, codeCompletionPos.m_line,
                codeCompletionPos.m_column, false, ErrorState.Correct, 0);
            // modify the original Token
            tokenToSplit.m_num = Constants.NUM_ANYKW;
            tokenToSplit.m_lexem = headLexem;
            // mutatedInput.add(i + 1, tailToken);
            mutatedInput.splice(i + 1,0,tailToken);
            return originalLexeme.substring(0, delta);
        };

        ScannerCoCoInserter.prototype.alterForDirectAfterToken = function (mutatedInput, i/*,
                                                                           codeCompletionPos, tir*/) {
            // split the token at i
            var tokenToAlter = mutatedInput[i];
            var originalLexeme = tokenToAlter.m_lexem;
            // modify the original Token
            tokenToAlter.m_num = Constants.NUM_ANYKW;
            return originalLexeme;
        };

        ScannerCoCoInserter.prototype.isInToken = function (token, pos) {
            return (this.isBeforeOrEqual(token.m_line, token.m_column, pos) &&
                    !this.isBeforeOrEqual(token.m_line, token.m_column + token.m_lexem.length, pos));
        };

        ScannerCoCoInserter.prototype.isDirectlyAfterToken = function (token, pos) {
            return this.isEqualPos(token.m_line, token.m_column + token.m_lexem.length, pos);
        };

        ScannerCoCoInserter.prototype.isBeforeOrEqual = function (line, column, pos) {
            return (line < pos.m_line) || (line == pos.m_line && column <= pos.m_column);
        };

        ScannerCoCoInserter.prototype.isBetweenToken = function (token, token2, pos) {
            return this.isBeforeOrEqual(token.m_line, token.m_column + token.m_lexem.length, pos) &&
                    this.isBeforePos(pos, token2);
        };

        return ScannerCoCoInserter;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/StringTokenizer',[], //dependencies
    function () {
        

        function StringTokenizer(string, separator) {
            this.str = string;
            this.sep = separator;
            this.idx = 0;
        }

        StringTokenizer.prototype.hasMoreTokens = function () {
            var n = this.str.indexOf(this.sep, this.idx);
            if (n > -1) {
                return true;
            }
            if (this.idx === 0 || this.idx < this.str.length) {
                return true;
            }
            return false;
        };

        StringTokenizer.prototype.nextToken = function () {
            var before = this.idx;
            var n = this.str.indexOf(this.sep, this.idx);
            if (n < 0) {
                n = this.str.length;
                this.idx = n;
            } else {
                this.idx = n + 1;
            }
            var sub = this.str.substring(before, n);
            return sub;
        };

        return StringTokenizer;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/TokenCoCoCompletion',[], //dependencies
    function () {
        

        /**
         * This class is an example IPathCompletion implementation which can be used for
         * Syntactic code completion
         *
         * It records a list of token numbers ArrayList<short>
         *
         * In addition is has some obscure counters
         *
         * 
         *
         */
        //public class TokenCoCoCompletion implements IPathCompletion {
        function TokenCoCoCompletion(other) {
            if (!other) {
                // Constructor
                /*public ArrayList<Short>*/
                this.m_next_tokens = null; //new ArrayDeque<Short>();
                /*public int*/
                this.m_tokens_completed = 0;
                /*public int*/
                this.m_clauses_completed = 0;
            } else {
                // Copy Constructor
                this.m_next_tokens = other.m_next_tokens ? other.m_next_tokens.slice(0) : other.m_next_tokens; // clone ! []; // new ArrayList<Short>(other.m_next_tokens);
                this.m_tokens_completed = other.m_tokens_completed;
                this.m_clauses_completed = other.m_clauses_completed;
            }
        }

        //public TokenCoCoCompletion
        TokenCoCoCompletion.prototype.clone = function () { //NOPMD
            return new TokenCoCoCompletion(this);
        };

        //public List<Short>
        TokenCoCoCompletion.prototype.getNextTokens = function () {
            return this.m_next_tokens.slice(0);
        };

        //public static TokenCoCoCompletion
        TokenCoCoCompletion.prototype.assureCreated = function (current) {
            if (current.getCompletion() === null) {
                current.setCompletion(new TokenCoCoCompletion());
            }
            return current.getCompletion();
        };
        TokenCoCoCompletion.assureCreated = TokenCoCoCompletion.prototype.assureCreated; // static!


        //public void
        TokenCoCoCompletion.prototype.assureNextTokensPresent = function () {
            if (this.m_next_tokens === null) {
                this.m_next_tokens = []; // new ArrayList<Short>();
            }
        };

        return TokenCoCoCompletion;
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/TokenCoCoParser',["rndrt/Utils", "rndrt/Constants", "rndrt/Instruction", "rndrt/ErrorCollectingParser", "rndrt/CompletionModes", "rndrt/HookResult", "rndrt/Parser", "rndrt/Syscodes", "rndrt/TokenCoCoCompletion"], //dependencies
    function (Utils, Constants, Instruction, ErrorCollectingParser, CompletionModes, HookResult, Parser, Syscodes, TokenCoCoCompletion) {
        

        /**
         * This Parser implements the "legacy" code completion modes used in the ABAP
         * Parser
         *
         * The ABAP Parser uses "only" syntactic token completion ( in the Java part).
         * Completions consist of a ArrayList<Short>
         *
         * There are several more or less obscure modes on how to terminate the
         * completion and how many answers to produce
         *
         *
         * These are controlled by the COMPLETION_MODE arguments
         *
         * 
         *
         */

        //public TokenCoCoParser(IByteCode byte_code, IParserScanner scanner)
        function TokenCoCoParser(byte_code, scanner) {
            ErrorCollectingParser.call(this, byte_code, scanner);

            this.COMPL_MAX_KEYWORDS = 4;
            this.m_max_completions = this.COMPL_MAX_KEYWORDS;
            this.m_max_clauses = TokenCoCoParser.COMPL_MAX_CLAUSES;
            //private boolean
            this.isCaseInsensitiveCompletion = true;

            /*protected int*/
            this.m_completion_mode = CompletionModes.COMPL_MODE_NONE;


            /*public boolean*/
            this.newHook = false;
        }

        //TokenCoCoParser.prototype = Object.create(ErrorCollectingParser.prototype);
        TokenCoCoParser.prototype = Utils.objectCreate(ErrorCollectingParser.prototype);


        TokenCoCoParser.prototype.COMPL_MAX_CLAUSES = 1; // max number of clauses to complete
        TokenCoCoParser.COMPL_MAX_CLAUSES = 1; // max number of clauses to complete


        /**
         * use case insensitive comparison when considering a present token prefix
         * underneath the cursor position, e.g. "crea" /"CREA" will match Create,
         * CREATE create from the grammar,
         * grammartoken.tolowercase().startswith(prefix.toLowerCase() set to true if
         * you want a precise match
         *
         * @param newValue
         */
        //protected void setIsCaseInsensitiveCompletion(boolean newValue)
        TokenCoCoParser.prototype.setIsCaseInsensitiveCompletion = function (newValue) {
            this.isCaseInsensitiveCompletion = newValue;
        };

        //protected boolean getIsCaseInsensitiveCompletion()
        TokenCoCoParser.prototype.getIsCaseInsensitiveCompletion = function () {
            return this.isCaseInsensitiveCompletion;
        };

        //public static class TokenCoCoRNDRunFlags implements IRNDRunFlags {
        //private final int m_completion_mode;

        function TokenCoCoRNDRunFlags(compl_mode) {
            this.m_completion_mode = compl_mode;
        }

        //public boolean
        TokenCoCoRNDRunFlags.prototype.isCoCoMode = function () {
            return this.m_completion_mode == CompletionModes.COMPL_MODE_ALL.getValue() ||
                this.m_completion_mode == CompletionModes.COMPL_MODE_CLAUSES.getValue() ||
                this.m_completion_mode == CompletionModes.COMPL_MODE_UNIQUE.getValue();
        };

        //public boolean
        TokenCoCoRNDRunFlags.prototype.skipActions = function () {
            return !(this.m_completion_mode != CompletionModes.COMPL_MODE_NONE.getValue() && this.m_completion_mode != CompletionModes.COMPL_MODE_UNIQUE
                .getValue());
        };
        //} TokenCoCoRNDRunFlags


        //public void
        TokenCoCoParser.prototype.setComplMaxKeywords = function (val) {
            this.COMPL_MAX_KEYWORDS = val;
            this.m_max_completions = this.COMPL_MAX_KEYWORDS;
        };


        //@Override
        //protected boolean onMatchCollectCompletionSuggestionsOrAbort(Token current_token, short matched_terminal, IRNDPath current, IRNDContext context)
        TokenCoCoParser.prototype.onMatchCollectCompletionSuggestionsOrAbort = function (current_token, matched_terminal/*, current, context*/) {
            // collection of keywords during completion
            var /*String*/ lexem_input = current_token.m_lexem;
//      String proposal = getByteCodeTokenInfo().getTokenNameUS(matched_terminal);
//      System.out.println(proposal);
            var /*TokenCoCoCompletion*/ compl = /*(TokenCoCoCompletion)*/ this.m_current.getCompletion();
            if (compl != null && compl.m_tokens_completed >= this.m_max_completions) {
                return false;
            }
            if (((compl != null && compl.m_tokens_completed > 0) || this.getByteCodeTokenInfo().isPrefixOfToken(lexem_input, matched_terminal,
                    this.isCaseInsensitiveCompletion))) {
                this.addCompletion(matched_terminal);
                return true;
            }
            return false;
        };

        /*protected boolean addCompletion(short terminal)*/
        TokenCoCoParser.prototype.addCompletion = function (terminal) {

//          var tmp = this.getByteCodeTokenInfo().getTokenNameUS(terminal);
            var /*TokenCoCoCompletion*/ compl = TokenCoCoCompletion.assureCreated(this.m_current);
            compl.m_tokens_completed++;
            if (this.m_trace != null) {
                this.traceindent();
                this.m_trace.print("  cc pushback token"); //$NON-NLS-1$
                this.m_trace.print("'" + this.getByteCodeTokenInfo().getTokenNameUS(terminal) + "'"); //$NON-NLS-1$ //$NON-NLS-2$
                this.m_trace.print(terminal);
                this.m_trace.print("@"); //$NON-NLS-1$
                this.m_trace.println(this.m_current.m_la_index);
            }
            compl.assureNextTokensPresent();
            compl.m_next_tokens.push(terminal); // offerLast(terminal);
            return true;
        };

        //void onCommitMatch(MATCHInstruction match_instr)
        TokenCoCoParser.prototype.onCommitMatch = function (match_instr) {
            if (match_instr.m_op_code === Instruction.OP_MATCH) {
                //implememt void onCommitMatch(MATCHInstruction match_instr)

                //override to do your parser specific match stuff here
                //token qualification may move down , as other parsers are not interested in this
                var /*Token*/ tok = this.lTok();
                tok.m_role = this.m_current.m_active_role;
// if (this.m_current.getCompletion() != null
//   && ((TokenCoCoCompletion) this.m_current.getCompletion()).m_tokens_completed > this.m_max_completions) {
//   //System.out.println("Holla!");
// }
                this.onCommitMatch(this.getContext());
            // } else {
                // implement void onCommitMatch(IRNDContext context)
            }
        };


        /**
         * This method is invoked during a BRANCH operation, it may be used e.g.
         * used to terminate decisions if a single completion is desired
         */
        //@Override
        //protected boolean forcePathFailureInBranch(IRNDPath current)
        TokenCoCoParser.prototype.forcePathFailureInBranch = function (current) {
//          assert (this.getParsingPhase() != Constants.ParsingPhase.COMMIT_PHASE);
            var /*TokenCoCoCompletion*/ compl = /*(TokenCoCoCompletion)*/ current.getCompletion();
            if (compl === null) {
                return false;
            }
            if (this.m_completion_mode === CompletionModes.COMPL_MODE_CLAUSES.getValue()) {

                // proactively increase counter if we have
                // already completed some tokens
                //  since this code is identical to MODE_UNIQUE,
                //        we may remove either mode eventually
                if (compl.m_tokens_completed > 0) {
                    compl.m_clauses_completed++;
                }
                //  we could reset token count here
                //        for m_max_clauses > 1 -> would that
                //        make sense?
                // process only m_max_clauses branches in a row
                // (NOTE: clause count equals #OP_BRANCHES - 1)
                if (compl.m_clauses_completed >= this.m_max_clauses) {
                    //  RNDRT_TRACE0(_C("* clause completion halted at BRAN"));
                    return true;
                }
                // for unique code completion, stop at branches if at least
                // one keyword has been found
            } else if (this.m_completion_mode == CompletionModes.COMPL_MODE_UNIQUE.getValue() && compl.m_tokens_completed > 0) {
                //  RNDRT_TRACE0(_C("* unique completion halted at BRAN"));
                return true;
            }
            return false;
        };

        //@Override
        //protected void recordCompletionPathOnFailure(IRNDPath current)
        TokenCoCoParser.prototype.recordCompletionPathOnFailure = function (current) {
            if (this.isAnyToken((/*(Path)*/ current).getPathLATokenNum()) && !this.getFlagCheckError()) { // make sure that this is not simply a non-matching path
                this.setHitCompletionPos(true);
                var /*TokenCoCoCompletion*/ compl = /*(TokenCoCoCompletion)*/ current.getCompletion();
                if (compl != null && compl.m_next_tokens.length > 0) {
                    this.recordCompletionPath(current);
                }
            }
        };

        /**
         * unit test serialization of completions
         *
         * @return
         */
        /*public String printCompletions()*/
        TokenCoCoParser.prototype.printCompletions = function () {
            var /*String*/ result = ""; //$NON-NLS-1$
            var /*List<IRNDPath>*/ completionPaths = this.getCompletionPaths();
            for (var i = 0; i < completionPaths.length; ++i) {
                var completion = completionPaths[i];
                var /*String*/ np = "___ "; //$NON-NLS-1$
                var /*Short[]*/ tokens = [];
                if (completion.getCompletion() != null) {
                    tokens = (/*(TokenCoCoCompletion)*/ completion.getCompletion()).m_next_tokens;
                }
                for (var k = 0; k < tokens.length; ++k) {
                    var t = tokens[k];
                    np += this.getByteCodeTokenInfo().getTokenNameUS(t) + " "; //$NON-NLS-1$
//            FOR_EACH(Path::NextTokens, tok, completion.m_next_tokens)
//            {
//                RNDRT_ASSERT(_U("Parser::print_completions"), 0 <= tok &&
//                    RND_CONV(unsigned short, tok) < m_byte_code->num_token_names());
//                cout << _U2C(m_byte_code->get_token_name_US(tok)) << _C(" ");
//            }
                }
                result = Utils.stringTrim(np) + "\n" + result; //$NON-NLS-1$
            }
            return result;
        };

        //***************************************************************************************************************************
        // Weird  code completion via actions

        //@Override
        //protected void cocoActions(int kind
        TokenCoCoParser.prototype.cocoActions = function (kind) {
            if (kind == Syscodes.SYS_CCQUERY) {
//              assert (this.getParsingPhase() != Constants.ParsingPhase.COMMIT_PHASE);
                /// NOTE: %CCQUERY will terminate the current completion
                /// (rb)  path; it will NOT return from the current
                ///       rule and continue with the caller!
                if (this.m_completion_mode != CompletionModes.COMPL_MODE_NONE.getValue() && this.isAnyToken(this.m_current.getPathLATokenNum())) {
                    if (this.getParsingPhase() != Constants.ParsingPhase.COMMIT_PHASE) {
                        this.addStopInstruction();
                    }
                    if (this.m_current.getCompletion() == null ||
                        (/*(TokenCoCoCompletion)*/ this.m_current.getCompletion()).m_tokens_completed === 0)
                    // compute semantical completion for current cursor position
                    // only; otherwise, we'd suggest identifiers for some source
                    // code position further down the statement
                    {
                        this.replay(); // execute pending actions of current path
                        this.collect(this.lTok().m_lexem); // invoke semantic code completion
                    }
                    this.setPathFailed();
                    //this.m_vm_status = VMStatus.PATH_FAILED; // be done for this path
                    return;
                }
            }
//else if (kind == Syscodes.SYS_INCLUDE.getValue()) {
//RNDRT_TRACE0(_C("WARNING: ignoring obsolete SYS_INCLUDE directive\n"));
//}
            else if (kind == Syscodes.SYS_CCIGNORE) {
//              assert (this.getParsingPhase() != Constants.ParsingPhase.COMMIT_PHASE);
                // terminate the current completion path, but return tokens found so far
                if (this.m_completion_mode != CompletionModes.COMPL_MODE_NONE.getValue() && this.isAnyToken(this.m_current.getPathLATokenNum())) {
                    //this.m_vm_status = VMStatus.PATH_FAILED;
                    this.setPathFailed();
                    return;
                }
            } else if (kind == Syscodes.SYS_CCBLOCKEND) {
//               assert (this.getParsingPhase() != Constants.ParsingPhase.COMMIT_PHASE);
                // discard entire completion if not in corresponding open block
//#ifdef SAPwithKERNEL
//    // backend coding:
//    if (m_completion_mode == COMPL_MODE_CLAUSES &&
//        m_current.m_tokens_completed > 0 &&
//        !check_block(m_byte_code->get_token_name_US(m_current.m_next_tokens.back())))
//#else
//frontend coding:
                var /*TokenCoCoCompletion*/ compl = (/*(TokenCoCoCompletion)*/ this.m_current.getCompletion());

                if (this.m_completion_mode === CompletionModes.COMPL_MODE_UNIQUE.getValue() &&
                    this.m_current.getCompletion() != null && compl.m_tokens_completed > 0  &&
                    this.getByteCodeTokenInfo().getTokenNameUS(compl.m_next_tokens[compl.m_next_tokens.length - 1]) ==
                        this.m_block_end_tag)
//#endif
                {
                    this.m_current.setCompletion(null);
//                  this.m_current.m_tokens_completed = 0;
//                  this.m_current.m_next_tokens.clear();
                    this.setPathFailed();
                    //this.m_vm_status = VMStatus.PATH_FAILED;
                    return;
                }
            }
        };

        //protected void
        TokenCoCoParser.prototype.collect = function (/*name*/) {
            // frontend: insert #ID# token to signal need for backend call
            var compl = this.m_current.getCompletion();
            if (compl == null || compl.m_tokens_completed === 0) {
                compl = TokenCoCoCompletion.assureCreated(this.m_current);
                compl.assureNextTokensPresent();
                compl.m_next_tokens.push(this.getTokenIndexResolver().getActualNUMID());
            }
        };

        /**
         * helper function to obtain only the token completions w.o. exposing the
         * hidden TokenCoCompletion
         *
         * @param path
         * @return
         */
            //protected static List<Short>
        TokenCoCoParser.prototype.getCompletionTokens = function (/*IRNDPath*/ path) {
            var /*TokenCoCoCompletion*/ res = /*(TokenCoCoCompletion)*/ path.getCompletion();
            return res.getNextTokens();
        };


        //public boolean
        TokenCoCoParser.prototype.run = function (/*int*/completion_mode, /*IHaltedCallback*/ halted, /*int*/ HALTED_INTERVAL) {
            this.m_completion_mode = completion_mode; //  should not be passed by run()
            this.setRNDRunFlags(new TokenCoCoRNDRunFlags(completion_mode));
            var self = this;
            var /*boolean*/ tmpval = false;
            if (this.isCoCoMode() && tmpval) {

                // prepare anonymous class
                var tmpHook = {};
                //public HookResult
                var invoke = function (/*IRNDBranchHookProcessingOptions*/ processor) {
                    //
                    var /*boolean*/ anykw = self.isAnyToken(processor.getCurrentPath().getPathLATokenNum());
                    if (anykw) {
                        processor.addAllPathesOfBranch();
                        processor.setGetNextPath();
                        return HookResult.DONE;
                    }
                    return HookResult.NORMAL;
                };
                tmpHook.invoke = invoke;


                this.setBranchHook(tmpHook);
                //ErrorCollectingParser.prototype.setBranchHook.call(this, /* new "IRNDBranchHook"*/ tmpHook  );
            } else {
                this.setBranchHook(null);
                //ErrorCollectingParser.prototype.setBranchHook.call(this,null);
            }
            return Parser.prototype.runWithHalted.call(this, halted, HALTED_INTERVAL); // ErrorCollectingParser.prototype.run.call(this,halted, HALTED_INTERVAL); // super.run
        };
        return TokenCoCoParser;
    }
);

// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/UserStackframeT',["rndrt/Utils", "rndrt/Stackframe"], //dependencies
    function (Utils, Stackframe) {
        

        // dispatch accross impls:
        //public UserStackframeT(LOC locals, Object actiondeleg, Stackframe BP, RuleInfo rule_info, RES result, ptrdiff_t result_off) {
        //public UserStackframeT(RES res, LOC _locals, Stackframe BP, IRuleInfo rule_info)
        //public UserStackframeT(FramePtr BP, RuleInfo rule_info) {
        //public UserStackframeT(FramePtr BP) {
        function UserStackframeT(BP, rule_info, a3, a4, a5, a6) {
            var a1 = BP,
                a2 = rule_info;
            if (arguments.length === 1) {
                //public UserStackframeT(FramePtr BP) {
                this.copyCTor(a1);
                return;
            }
            if (arguments.length === 4) {
                this.ctorRES_LOC_Stackframe_rule_info.call(this, a1, a2, a3, a4);
                return;
            }
            if (arguments.length === 6) {
                this.prototype.ctorLOC_Object_Stackframe_RuleInfo_RES_ptrdiff_t.call(this, a1, a2, a3, a4, a5, a6);
                return;
            }
            Stackframe.call(this, BP.getStackframe(), rule_info, {});
            this.m_locals = null; // LOC
            this.m_result = null; // RES;
            /*ptrdiff_t*/
            this.m_result_off = null;
        }

        //UserStackframeT.prototype = Object.create(Stackframe.prototype);
        UserStackframeT.prototype = Utils.objectCreate(Stackframe.prototype);
//public UserStackframeT(FramePtr BP) {
//  Stackframe.call(this,BP.getStackframe(), {});
//}

//public class UserStackframeT<RES, LOC> extends Stackframe implements Cloneable {


        //public ptrdiff_t(String cn, String member)
        //function ptrdiff_t(cn, member) {
        //    this.className = cn;
        //    this.member = member;
        //}

        //ptrdiff_t.prototype.offset = function () {
        //    return this.member != null;
        //};

        //template<typename R, typename L>
        //    class UserStackframe extends  Stackframe
        //{
        // typedef void (*A_T)(R*, L&, int const, Parser&, Stackframe*);
        // A_T const A;
        //protected LOC m_locals;
        //protected RES m_result;

        //implements //public UserStackframeT(LOC locals, Object actiondeleg, Stackframe BP, RuleInfo rule_info, RES result, ptrdiff_t result_off) {
        UserStackframeT.prototype.ctorLOC_Object_Stackframe_RuleInfo_RES_ptrdiff_t = function (locals, actiondeleg, BP, rule_info, result, result_off) {
            Stackframe.call(this, BP, rule_info, locals); // important to pass local base
            this.m_locals = locals;
            this.m_result = result;
            this.m_result_off = result_off;
        };

        //implements //public UserStackframeT(RES res, LOC _locals, Stackframe BP, IRuleInfo rule_info)
        UserStackframeT.prototype.ctorRES_LOC_Stackframe_rule_info = function (res, _locals, BP, rule_info) {
            Stackframe.call(this, BP, rule_info, _locals);
            this.m_locals = _locals;
            this.m_result = res;
            this.m_result_off = null;
        };

        //Copy constructor
        UserStackframeT.prototype.copyCTor = function (other) {
            Stackframe.call(this, other, {});
            this.m_result = other.m_result;
            this.m_result_off = other.m_result_off;
            this.m_locals = null; // TODO other.m_locals.clone();
            //try {
            //Method m = other.m_locals.getClass().getMethod("clone", (Class<?>[]) null); //$NON-NLS-1$
            this.m_locals = other.m_locals.clone(); // /*(LOC)*/ m.invoke(other.m_locals, /*(Object[])*/ null);
            //} catch (e) {
            //  console.log(e);
            //}
            Stackframe.setLocals.call(this, this.m_locals);
            assert(false);
        };

        //@Override (overridden!)
        UserStackframeT.prototype.performAction = function (/*action_num, parser*/) {
        };

        UserStackframeT.prototype.updateResultResult = function (/*caller*/) {
            if (this.m_result_off.offset()) { // offset -1 indicates "no result specified"
                assert(false);
                this.m_result = null; // TODO !! (R*) ((char*)caller->this.m_local_base + this.m_result_off);
            }
        };

        /*public Stackframe*/
        UserStackframeT.prototype.clone = function () {
            return new UserStackframeT(this);
        };
        return UserStackframeT;
    }
);

define(
    'rndrt/HashSet',["rndrt/Utils"], //dependencies
    function (Utils) {
        

        function HashSet() {
        }
        HashSet.prototype = Object.create(Array.prototype);

        HashSet.prototype.addAll = function(list) {
            for (var i=0;i<list.length;i++) {
                var e = list[i];
                if (Utils.arrayContains(this, e)===false) {
                    this.push(e);
                }
            }
            return this;
        };

        return HashSet;
    }
);
define(
    'rndrt/ace/AceEditorUtils',[],
    function () {
        
        return {
            getAceEditor: function () {
                /* global document:false, ace:false, $:false */
                // following lines work also in the WATT web IDE
                var aceContent = document.getElementsByClassName('ace_content');
                // find the current visible ace editor content
                // problem with .calculationview which has multiple ace editors via tabs
                var visibleAceContent = null;
                for (var qq = 0; qq < aceContent.length; qq++) {
                    if (typeof $ === 'undefined' || $(aceContent[qq]).is(":visible") === true) {
                        // the right one found
                        visibleAceContent = aceContent[qq];
                        break;
                    }
                }
                var par = visibleAceContent.parentElement.parentElement;
                var editor = ace.edit(par);
                return editor;
            }
        };
    }
);
// Copyright (c) 2014 SAP SE, All Rights Reserved
define(
    'rndrt/rnd',[   "rndrt/ByteCode",
        "rndrt/ByteCodeFactory",
        "rndrt/Category",
        "rndrt/CompletionModes",
        "rndrt/Constants",
        "rndrt/CursorPos",
        "rndrt/ErrorCollectingParser",
        "rndrt/ErrorState",
        "rndrt/FramePtr",
        "rndrt/HookResult",
        "rndrt/Instruction",
        "rndrt/LabelInfoRuleData",
        "rndrt/NullFrame",
        "rndrt/Parser",
        "rndrt/ParserTrace",
        "rndrt/Path",
        "rndrt/PrintWriter",
        "rndrt/RNDContext",
        "rndrt/RNDErrorInfo",
        "rndrt/RuleInfo",
        "rndrt/Scanner",
        "rndrt/ScannerCoCoInserter",
        "rndrt/ScannerState",
        "rndrt/Stackframe",
        "rndrt/StringBuffer",
        "rndrt/StringTokenizer",
        "rndrt/StringWriter",
        "rndrt/Syscodes",
        "rndrt/Token",
        "rndrt/TokenCoCoCompletion",
        "rndrt/TokenCoCoParser",
        "rndrt/UserStackframeT",
        "rndrt/Utils",
        "rndrt/VMStatus",
        "rndrt/HashSet",
        "rndrt/ace/AceEditorUtils"], //dependencies
    function (ByteCode,
              ByteCodeFactory,
              Category,
              CompletionModes,
              Constants,
              CursorPos,
              ErrorCollectingParser,
              ErrorState,
              FramePtr,
              HookResult,
              Instruction,
              LabelInfoRuleData,
              NullFrame,
              Parser,
              ParserTrace,
              Path,
              PrintWriter,
              RNDContext,
              RNDErrorInfo,
              RuleInfo,
              Scanner,
              ScannerCoCoInserter,
              ScannerState,
              Stackframe,
              StringBuffer,
              StringTokenizer,
              StringWriter,
              Syscodes,
              Token,
              TokenCoCoCompletion,
              TokenCoCoParser,
              UserStackframeT,
              Utils,
              VMStatus,
              HashSet,
              AceEditorUtils) {
        

        return {
            version: '@PROJECT_VERSION@',

            ByteCode: ByteCode,
            ByteCodeFactory: ByteCodeFactory,
            Category: Category,
            CompletionModes: CompletionModes,
            Constants: Constants,
            CursorPos: CursorPos,
            ErrorCollectingParser: ErrorCollectingParser,
            ErrorState: ErrorState,
            FramePtr: FramePtr,
            HookResult: HookResult,
            Instruction: Instruction,
            LabelInfoRuleData: LabelInfoRuleData,
            NullFrame: NullFrame,
            Parser: Parser,
            ParserTrace: ParserTrace,
            Path: Path,
            PrintWriter: PrintWriter,
            RNDContext: RNDContext,
            RNDErrorInfo: RNDErrorInfo,
            RuleInfo: RuleInfo,
            Scanner: Scanner,
            ScannerCoCoInserter: ScannerCoCoInserter,
            ScannerState: ScannerState,
            Stackframe: Stackframe,
            StringBuffer: StringBuffer,
            StringTokenizer: StringTokenizer,
            StringWriter: StringWriter,
            Syscodes: Syscodes,
            Token: Token,
            TokenCoCoCompletion: TokenCoCoCompletion,
            TokenCoCoParser: TokenCoCoParser,
            UserStackframeT: UserStackframeT,
            Utils: Utils,
            VMStatus: VMStatus,
            HashSet: HashSet,
            AceEditorUtils: AceEditorUtils
        };
    }
);

