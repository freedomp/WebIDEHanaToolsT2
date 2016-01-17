// Copyright (c) 2014 SAP SE, All Rights Reserved

define("rndrt/StringBuffer", [], function() {
  function StringBuffer(string) {
    this.buffer = [];
    if(string != null) {
      this.buffer.push(string)
    }
  }
  StringBuffer.prototype.substringLength = function(start, length) {
    var str = this.toString();
    var res = str.substring(start, start + length);
    return res
  };
  StringBuffer.prototype.append = function(string) {
    this.buffer.push(string);
    return this
  };
  StringBuffer.prototype.toString = function() {
    var result = this.buffer.join("");
    return result
  };
  StringBuffer.prototype.insert = function(idx, string) {
    this.buffer.splice(idx, 0, string)
  };
  StringBuffer.prototype.length = function() {
    var len = this.toString().length;
    return len
  };
  StringBuffer.prototype.replace = function(start, end, str) {
    var l = this.toString();
    var result = l.substring(0, start) + str + l.substring(end);
    this.buffer = [];
    this.append(result)
  };
  return StringBuffer
});
function assert(arg) {
  if(typeof console !== "undefined") {
    if(!arg) {
      jQuery.sap.log.error("assertion failed")
    }
    jQuery.sap.log.error("(Use rnd.Utils.assert() instead of global assert())")
  }
}
define("rndrt/Utils", ["./StringBuffer"], function(StringBuffer) {
  var Utils = {objectCreate:function(prototype) {
    if(typeof Object.create === "function") {
      return Object.create(prototype)
    }
    var o, BaseType = function() {
    };
    BaseType.prototype = prototype;
    o = new BaseType;
    o.__proto__ = prototype;
    return o
  }, urlencode:function(stringParam) {
    stringParam = encodeURIComponent(stringParam);
    stringParam = stringParam.replace(/!/g, "%21");
    stringParam = stringParam.replace(/'/g, "%27");
    stringParam = stringParam.replace(/\(/g, "%28");
    stringParam = stringParam.replace(/\)/g, "%29");
    stringParam = stringParam.replace(/\*/g, "%2A");
    stringParam = stringParam.replace(/%20/g, "+");
    return stringParam
  }, isLetter:function(stringParam) {
    if(stringParam.length === 1 && stringParam.match(/[a-z]/i) != null) {
      return true
    }
    return false
  }, isLetterOrDigit:function(stringParam) {
    if(stringParam.length === 1 && stringParam.match(/[a-z0-9]/i) != null) {
      return true
    }
    return false
  }, insertArrayAt:function(arrayParam, indexParam, arrayToInsertParam) {
    var p = [indexParam, 0].concat(arrayToInsertParam);
    Array.prototype.splice.apply(arrayParam, p);
    return arrayParam
  }, collect:function() {
    var ret = {};
    var len = arguments.length;
    for(var i = 0;i < len;i++) {
      for(var p in arguments[i]) {
        if(arguments[i].hasOwnProperty(p)) {
          ret[p] = arguments[i][p]
        }
      }
    }
    return ret
  }, stringEndsWith:function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1
  }, stringStartsWith:function(str, searchString, position) {
    if(position != null) {
      var tmp = str.substring(position);
      return tmp.indexOf(searchString) === 0
    }
    return str.indexOf(searchString) === 0
  }, stringEqualsIgnoreCase:function(str, another) {
    if(another == null) {
      return str.toUpperCase() === another
    }
    return str.toUpperCase() === another.toUpperCase()
  }, stringTrim:function(stringParam) {
    return stringParam.replace(/^\s+|\s+$/g, "")
  }, stringInsertAt:function(stringParam, position, insertString) {
    return stringParam.substr(0, position) + insertString + stringParam.substr(position)
  }, stringCompareTo:function(stringParam, another) {
    if(stringParam.length > 1 && another.length > 1 && this.stringEndsWith(stringParam, "(") && this.stringEndsWith(another, "(")) {
      stringParam = stringParam.substring(0, stringParam.lastIndexOf("("));
      another = another.substring(0, another.lastIndexOf("("))
    }
    var result = stringParam.localeCompare(another);
    return result
  }, stringCompareToIgnoreCase:function(stringParam, anotherStringParam) {
    var me = stringParam.toLowerCase();
    var a = anotherStringParam.toLowerCase();
    return Utils.stringCompareTo(me, a)
  }, stringContains:function(stringParam, anotherStringParam) {
    var idx = stringParam.indexOf(anotherStringParam);
    return idx >= 0
  }, stringReplaceAll:function(stringParam, existingSubstringParam, replacementSubstringParam) {
    var result = stringParam + "";
    if(typeof existingSubstringParam === "string") {
      return stringParam.split(existingSubstringParam).join(replacementSubstringParam)
    }
    return result
  }, arrayToString:function(array) {
    var res = array.toString();
    var buf = new StringBuffer(res);
    var inBracket = false;
    for(var i = res.length - 1;i >= 0;--i) {
      if(res[i] === ")" || res[i] === "]") {
        inBracket = true
      }
      if(res[i] === "(" || res[i] === "[") {
        inBracket = false
      }
      if(inBracket === false && res[i] === ",") {
        buf.replace(i, i + 1, ", ")
      }
    }
    res = "[" + buf.toString() + "]";
    return res
  }, arrayContains:function(array, obj) {
    var i = array.length;
    while(i--) {
      if(array[i] === obj) {
        return true
      }else {
        if(array[i].equals && obj.equals) {
          if(array[i].equals(obj)) {
            return true
          }
        }
      }
    }
    return false
  }, arrayContainsAll:function(array, array2) {
    var len2 = array2.length;
    for(var i = 0;i < len2;i++) {
      if(Utils.arrayContains(array, array2[i]) === false) {
        return false
      }
    }
    return true
  }, arrayIsEmpty:function(array) {
    return array.length === 0
  }, arrayRemove:function(array, idx) {
    if(typeof idx !== "number") {
      var i = array.indexOf(idx);
      if(i < 0) {
        i = array.length;
        while(i--) {
          if(array[i] === idx) {
            break
          }else {
            if(array[i].equals && idx.equals) {
              if(array[i].equals(idx)) {
                break
              }
            }
          }
        }
      }
      if(i >= 0) {
        Utils.arrayRemove(array, i)
      }
      return
    }
    array.splice(idx, 1)
  }, arraySubArray:function(array, startIndex, endIndex) {
    var resultArray = [];
    for(var i = startIndex;i < endIndex;i++) {
      resultArray.push(array[i])
    }
    return resultArray
  }, objectValues:function(obj) {
    var vals = [];
    for(var key in obj) {
      if(obj.hasOwnProperty(key)) {
        vals.push(obj[key])
      }
    }
    return vals
  }};
  if(typeof console === "undefined" && (!jQuery || !jQuery.sap)) {
    Utils.assert = function() {
    }
  }else {
    if(console.assert) {
      Utils.assert = function(arg) {
        console.assert(arg, "assertion failed")
      }
    }else {
      Utils.assert = function(arg) {
        if(!arg) {
          jQuery.sap.log.error("assertion failed")
        }
      }
    }
  }
  return Utils
});
define("rndrt/RuleInfo", [], function() {
  function RuleInfo(name, ruleProps, terminal_count, flag_count, rule_flags, role) {
    this.m_name = name;
    this.m_terminal_count = terminal_count;
    this.m_flag_count = flag_count;
    this.m_rule_flags = rule_flags;
    this.m_role = role;
    this.m_ruleProperties = ruleProps;
    this.m_follow_set = [];
    this.m_ruleStartEntryPoint = -1
  }
  RuleInfo.prototype.setRuleEntryStartEntryPoint = function(ruleStartEntryPoint) {
    this.m_ruleStartEntryPoint = ruleStartEntryPoint
  };
  RuleInfo.prototype.toString = function() {
    return this.m_name
  };
  RuleInfo.prototype.getRuleProperties = function() {
    return this.m_ruleProperties
  };
  RuleInfo.prototype.getRuleName = function() {
    return this.m_name
  };
  RuleInfo.prototype.getRuleStartEntryPoint = function() {
    return this.m_ruleStartEntryPoint
  };
  RuleInfo.prototype.setRuleEntryStartEntryPoint = function(ruleStartEntryPoint) {
    this.m_ruleStartEntryPoint = ruleStartEntryPoint
  };
  return RuleInfo
});
define("rndrt/LabelInfoRuleData", [], function() {
  function LabelInfoRuleData(info, is_pending) {
    this.m_info = info;
    if(info === null) {
      this.m_info = {left:0, right:0}
    }
    this.m_is_pending = is_pending;
    this.m_forwards = []
  }
  return LabelInfoRuleData
});
define("rndrt/Instruction", [], function() {
  function MatchInstruction(opCode) {
    this.m_opcode = opCode;
    this.m_is_strict = false;
    this.m_cat = 0;
    this.m_var_index = 0;
    this.m_la = 0
  }
  function GoToInstruction(opCode) {
    this.m_opcode = opCode;
    this.m_rel_offset = 0
  }
  function BranchInstruction(opCode) {
    this.m_opcode = opCode;
    this.m_has_non_strict_id = false;
    this.m_has_id = false;
    this.m_alt_count = 0
  }
  function PredInstruction(opCode) {
    this.m_opcode = opCode;
    this.m_is_strict = false;
    this.m_la = 0;
    this.m_rel_offset = 0
  }
  function CallInstruction(opCode) {
    this.m_opcode = opCode;
    this.m_entry_point = 0
  }
  function ReturnInstruction(opCode) {
    this.m_opcode = opCode
  }
  function ExecuteInstruction(opCode) {
    this.m_opcode = opCode;
    this.m_is_immediate = false;
    this.m_action_num = 0
  }
  function StopInstruction(opCode) {
    this.m_opcode = opCode
  }
  function SetFlagInstruction(opCode) {
    this.m_opcode = opCode;
    this.m_flag_index = 0;
    this.m_val = 0
  }
  function CheckFlagInstruction(opCode) {
    this.m_opcode = opCode;
    this.m_flag_index = 0;
    this.m_val = 0
  }
  function SysCallInstruction(opCode) {
    this.m_opcode = opCode;
    this.m_kind = 0;
    this.m_arg = 0
  }
  function PushFrameInstruction(opCode) {
    this.m_opcode = opCode;
    this.m_rule_num = 0;
    this.m_frame_num = 0
  }
  function PopFrameInstruction(opCode) {
    this.m_opcode = opCode
  }
  var Instruction = {OP_MATCH:0, OP_GOTO:1, OP_BRANCH:2, OP_PRED:3, OP_CALL:4, OP_RETURN:5, OP_EXECUTE:6, OP_STOP:7, OP_SET_FLAG:8, OP_CHECK_FLAG:9, OP_SYS_CALL:10, OP_PUSH_FRAME:11, OP_POP_FRAME:12, OP_NOP:13, OP_AST_ACTION:14, OP_MATCH_STR:"MTCH", OP_BRANCH_STR:"BRAN", OP_GOTO_STR:"GOTO", OP_RETURN_STR:"RETN", OP_EXECUTE_STR:"EXCT", OP_CALL_STR:"CALL", OP_PUSH_FRAME_STR:"PSHF", OP_POP_FRAME_STR:"POPF", OP_STOP_STR:"STOP", OP_SET_FLAG_STR:"SFLG", OP_CHECK_FLAG_STR:"CFLG", OP_SYS_CALL_STR:"SYSC", 
  OP_AST_ACTION_STR:"ASTA", createInstruction:function(opCode) {
    switch(opCode) {
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
        return null
    }
  }};
  return Instruction
});
define("rndrt/ByteCode", ["rndrt/Utils", "rndrt/RuleInfo", "rndrt/LabelInfoRuleData", "rndrt/Instruction"], function(Utils, RuleInfo, LabelInfoRuleData, Instruction) {
  function ByteCode() {
    this.m_token_map = {};
    this.RUNTIME_CREATED_STOP = -1;
    this.RUNTIME_CREATED_RETURN = -2;
    this.RETURN_INSTRUCTION = Instruction.createInstruction(Instruction.OP_RETURN);
    this.STOP_INSTRUCTION = Instruction.createInstruction(Instruction.OP_STOP)
  }
  ByteCode.prototype.getActualNUMID = function() {
    return this.m_num_id
  };
  ByteCode.prototype.containsLexem = function(lexem) {
    return this.m_token_map[lexem] && this.m_token_map.hasOwnProperty(lexem)
  };
  ByteCode.prototype.getTokenIndex = function(tok_str) {
    if(tok_str == null) {
      return-1
    }
    var value = this.m_token_map[tok_str];
    if(value != null) {
      return value
    }
    return-1
  };
  ByteCode.prototype.parse_section = function() {
    var section_name = this.consumeNextWord();
    var section_lines_left = parseInt(this.consumeNextWord(), 10);
    this.m_line_no += section_lines_left;
    if(section_name == "tokentext") {
      var tok_text;
      var tok_num;
      while(this.padFileContent.length > 0 && section_lines_left-- > 0) {
        tok_num = parseInt(this.consumeNextWord(), 10);
        tok_text = this.readNextQuotedWord();
        var stop = tok_text.length - 1;
        if(stop < 1) {
          throw"Empty token text value";
        }
        if(tok_text.charAt(0) != tok_text.charAt(stop) || tok_text.charAt(0) != '"') {
          throw"Token text value has bad quotes";
        }
        if(tok_num >= this.m_token_names.length) {
          throw"Invalid token number in 'tokentext' section";
        }
        this.m_externalizer[this.m_token_names[tok_num]] = tok_text.substring(1, stop)
      }
    }else {
      var next;
      var cur = this.padFileContent.charAt(0);
      for(var i = 1;i <= this.padFileContent.length;++i) {
        next = this.padFileContent.charAt(i);
        if(cur === "\n" || cur === "\r" && next !== "\n") {
          --section_lines_left;
          if(section_lines_left === 0) {
            this.padFileContent = this.padFileContent.substring(i);
            break
          }
        }
        cur = next
      }
    }
  };
  ByteCode.read = function(arg) {
    var u = new ByteCode;
    ByteCode.prototype.read.call(u, arg);
    return u
  };
  ByteCode.prototype.read = function(padFileContentParameter) {
    var i, it, str, label, rule, la, flag_index, val, labelInfo, data;
    if(padFileContentParameter.indexOf("\n") > 0) {
      this.padFileContent = padFileContentParameter
    }else {
      throw new Error;
    }
    var firstSevenCharacters = this.padFileContent.substring(0, 7);
    if(firstSevenCharacters !== "Release") {
      return
    }
    this.versionInfo = this.readVersionInfo();
    this.m_code = [];
    this.m_rule_infos = [];
    this.GEN_LREF = true;
    this.m_lref = [];
    if("MaxSuspiciousMachtes" != this.consumeNextWord()) {
      throw'PAD file error: did not find "MaxSuspiciousMachtes"';
    }
    this.m_max_suspicious_matches = parseInt(this.consumeNextWord(), 10);
    if("Token" != this.consumeNextWord()) {
      throw'PAD file error: did not find "Token"';
    }
    this.m_num_id = parseInt(this.consumeNextWord(), 10);
    var real_token_count = parseInt(this.consumeNextWord(), 10), total_token_count = parseInt(this.consumeNextWord(), 10), hasAST = false, line_no = 2;
    this.m_token_names = [];
    this.m_externalizer = {};
    this.m_token_map = {};
    for(i = 0;i < total_token_count;++i) {
      var tok_string;
      var tok_num;
      var first = this.consumeNextWord();
      if(Utils.stringEndsWith(first, ":") === false) {
        throw'PAD file error: expected "' + first + '" to end with colon';
      }
      tok_num = parseInt(first.substring(0, first.length - 1), 10);
      tok_string = this.consumeNextWord();
      tok_string = tok_string.substring(1, tok_string.length - 1);
      if(i === real_token_count) {
        hasAST = /^\^\.\[\d+,\d+\]$/.test(tok_string)
      }
      if(i < real_token_count || hasAST === false) {
        this.m_token_names.push(tok_string);
        this.m_token_map[tok_string] = tok_num
      }
      line_no++
    }
    if(this.m_num_id === -1) {
      throw"PAD file defines no ID token";
    }
    var label_map = {};
    var rule_map = {};
    while(true) {
      var s = this.consumeNextWord();
      if(s == null) {
        break
      }
      if(s.charAt(s.length - 1) === ":") {
        label = s.substring(0, s.length - 1);
        it = label_map[label];
        if(it == null) {
          var info = {m_info:this.m_code.length, m_is_pending:false, m_forwards:[]};
          info.m_is_pending = false;
          info.m_info = this.m_code.length;
          label_map[label] = info
        }else {
          it.m_is_pending = false;
          it.m_info = this.m_code.length;
          for(i = 0;i < it.m_forwards.length;++i) {
            var value = it.m_forwards[i];
            var rel_offset = this.m_code.length - value;
            switch(this.m_code[value].m_opcode) {
              case Instruction.OP_GOTO:
                this.m_code[value].m_rel_offset = rel_offset;
                break;
              case Instruction.OP_PRED:
                this.m_code[value].m_rel_offset = rel_offset;
                break;
              default:
                break
            }
          }
          it.m_forwards = []
        }
        line_no++
      }else {
        if(s === "rule") {
          rule = this.consumeNextWord();
          ++line_no;
          var s1;
          var terminal_count = 0;
          var flag_count = 0;
          var rule_flags = 0;
          var role = 0;
          var follow_count = 0;
          var ruleProps = {};
          while(true) {
            s1 = this.readNextQuotedWord();
            if(s1 === "rflags=") {
              rule_flags = parseInt(this.consumeNextWord(), 10);
              ++line_no
            }else {
              if(s1 === "role=") {
                role = parseInt(this.consumeNextWord(), 10);
                ++line_no
              }else {
                if(s1 === "tc=") {
                  terminal_count = parseInt(this.consumeNextWord(), 10);
                  ++line_no
                }else {
                  if(s1 === "flgc=") {
                    flag_count = parseInt(this.consumeNextWord(), 10);
                    ++line_no
                  }else {
                    if(s1 === "fllwc=") {
                      follow_count = parseInt(this.consumeNextWord(), 10);
                      ++line_no
                    }else {
                      if(s1 === "follow=") {
                        break
                      }else {
                        var s2 = this.readNextQuotedWord();
                        if(Utils.stringStartsWith(s2, '"')) {
                          s2 = s2.substring(1)
                        }
                        if(Utils.stringEndsWith(s2, '"')) {
                          s2 = s2.substring(0, s2.length - 1)
                        }
                        if(Utils.stringEndsWith(s1, "=")) {
                          s1 = s1.substring(0, s1.length - 1)
                        }
                        ruleProps[s1] = s2;
                        ++line_no
                      }
                    }
                  }
                }
              }
            }
          }
          var rule_num = this.m_rule_infos.length;
          var entry_point = this.m_code.length;
          var rule_info = new RuleInfo(rule, ruleProps, terminal_count, flag_count, rule_flags, role);
          for(i = 0;i < follow_count;++i) {
            var z;
            str = this.consumeNextWord();
            if(str.length === 0 || "!" === str) {
              str = this.consumeNextWord()
            }
            if(Utils.stringEndsWith(str, "!")) {
              str = str.substring(0, str.length - 1)
            }
            z = parseInt(str, 10);
            rule_info.m_follow_set.push(z)
          }
          ++line_no;
          this.m_rule_infos.push(rule_info);
          it = rule_map[rule];
          if(it == null) {
            var ruleData = {left:entry_point, right:rule_num};
            rule_map[rule] = new LabelInfoRuleData(ruleData, false)
          }else {
            it.m_is_pending = false;
            it.m_info.left = entry_point;
            it.m_info.right = rule_num;
            for(i = 0;i < it.m_forwards.length;++i) {
              var it_il = it.m_forwards[i];
              switch(this.m_code[it_il].m_opcode) {
                case Instruction.OP_CALL:
                  this.m_code[it_il].m_entry_point = entry_point;
                  break;
                case Instruction.OP_PUSH_FRAME:
                  this.m_code[it_il].m_rule_num = rule_num;
                  break;
                default:
                  Utils.assert(false);
                  break
              }
            }
            it.m_forwards = []
          }
        }else {
          if(s === "section") {
            this.parse_section()
          }else {
            if(s === Instruction.OP_MATCH_STR) {
              var var_index;
              var cat;
              var combine;
              var_index = parseInt(this.consumeNextWord(), 10);
              cat = parseInt(this.consumeNextWord(), 10);
              combine = parseInt(this.consumeNextWord(), 10);
              str = this.consumeNextWord();
              var isExclamationMark = false;
              if(Utils.stringEndsWith(str, "!")) {
                str = str.substring(0, str.length - 1);
                isExclamationMark = true
              }
              la = parseInt(str, 10);
              var match_instr = Instruction.createInstruction(Instruction.OP_MATCH);
              match_instr.m_is_strict = isExclamationMark;
              match_instr.m_var_index = var_index;
              match_instr.m_cat = cat;
              match_instr.m_la = la;
              if(this.GEN_LREF) {
                this.m_lref.push(line_no++)
              }
              this.m_code.push(match_instr)
            }else {
              if(s === Instruction.OP_BRANCH_STR) {
                var has_non_strict_id;
                var has_id;
                var alt_count;
                var branch_instr = Instruction.createInstruction(Instruction.OP_BRANCH);
                has_non_strict_id = parseInt(this.consumeNextWord(), 10);
                has_id = parseInt(this.consumeNextWord(), 10);
                alt_count = parseInt(this.consumeNextWord(), 10);
                branch_instr.m_has_non_strict_id = has_non_strict_id ? true : false;
                branch_instr.m_has_id = has_id ? true : false;
                branch_instr.m_alt_count = alt_count;
                if(this.GEN_LREF) {
                  this.m_lref.push(line_no++)
                }
                this.m_code.push(branch_instr);
                for(var j = 0;j < branch_instr.m_alt_count;j++) {
                  var is_strict = false;
                  str = this.consumeNextWord();
                  if(Utils.stringEndsWith(str, "!")) {
                    str = str.substring(0, str.length - 1);
                    is_strict = true
                  }
                  la = parseInt(str, 10);
                  label = this.consumeNextWord();
                  if(label === "!") {
                    is_strict = true;
                    label = this.consumeNextWord()
                  }
                  var pred_instr = Instruction.createInstruction(Instruction.OP_PRED);
                  pred_instr.m_la = la;
                  pred_instr.m_is_strict = is_strict;
                  pred_instr.m_rel_offset = 0;
                  it = label_map[label];
                  if(it != null && !it.m_is_pending) {
                    pred_instr.m_rel_offset = it.m_info - this.m_code.length
                  }else {
                    labelInfo = it;
                    if(labelInfo == null) {
                      labelInfo = {m_info:0, m_is_pending:true, m_forwards:[]}
                    }
                    labelInfo.m_is_pending = true;
                    labelInfo.m_forwards.push(this.m_code.length);
                    label_map[label] = labelInfo
                  }
                  if(this.GEN_LREF) {
                    this.m_lref.push(line_no++)
                  }
                  this.m_code.push(pred_instr)
                }
              }else {
                if(s === Instruction.OP_GOTO_STR) {
                  label = this.consumeNextWord();
                  var goto_instr = Instruction.createInstruction(Instruction.OP_GOTO);
                  goto_instr.m_rel_offset = 0;
                  it = label_map[label];
                  if(it != null && !it.m_is_pending) {
                    goto_instr.m_rel_offset = it.m_info - this.m_code.length
                  }else {
                    labelInfo = it;
                    if(labelInfo == null) {
                      labelInfo = {m_info:0, m_is_pending:true, m_forwards:[]}
                    }
                    labelInfo.m_is_pending = true;
                    labelInfo.m_forwards.push(this.m_code.length);
                    label_map[label] = labelInfo
                  }
                  if(this.GEN_LREF) {
                    this.m_lref.push(line_no++)
                  }
                  this.m_code.push(goto_instr)
                }else {
                  if(s === Instruction.OP_RETURN_STR) {
                    var return_instr = Instruction.createInstruction(Instruction.OP_RETURN);
                    if(this.GEN_LREF) {
                      this.m_lref.push(line_no++)
                    }
                    this.m_code.push(return_instr)
                  }else {
                    if(s === Instruction.OP_EXECUTE_STR) {
                      var action_num, is_immediate;
                      is_immediate = parseInt(this.consumeNextWord(), 10);
                      action_num = parseInt(this.consumeNextWord(), 10);
                      var exec_instr = Instruction.createInstruction(Instruction.OP_EXECUTE);
                      exec_instr.m_action_num = action_num;
                      exec_instr.m_is_immediate = is_immediate ? true : false;
                      if(this.GEN_LREF) {
                        this.m_lref.push(line_no++)
                      }
                      this.m_code.push(exec_instr)
                    }else {
                      if(s === Instruction.OP_CALL_STR) {
                        rule = this.consumeNextWord();
                        var call_instr = Instruction.createInstruction(Instruction.OP_CALL);
                        it = rule_map[rule];
                        if(it != null && !it.m_is_pending) {
                          call_instr.m_entry_point = it.m_info.left
                        }else {
                          data = it;
                          if(data == null) {
                            data = new LabelInfoRuleData(null, true)
                          }
                          data.m_forwards.push(this.m_code.length);
                          rule_map[rule] = data
                        }
                        if(this.GEN_LREF) {
                          this.m_lref.push(line_no++)
                        }
                        this.m_code.push(call_instr)
                      }else {
                        if(s === Instruction.OP_PUSH_FRAME_STR) {
                          var frame_num;
                          frame_num = parseInt(this.consumeNextWord(), 10);
                          rule = this.consumeNextWord();
                          var pushf_instr = Instruction.createInstruction(Instruction.OP_PUSH_FRAME);
                          pushf_instr.m_frame_num = frame_num;
                          it = rule_map[rule];
                          if(it != null && !it.m_is_pending) {
                            pushf_instr.m_rule_num = it.m_info.right
                          }else {
                            data = it;
                            if(data == null) {
                              data = new LabelInfoRuleData(null, true)
                            }
                            data.m_forwards.push(this.m_code.length);
                            rule_map[rule] = data
                          }
                          if(this.GEN_LREF) {
                            this.m_lref.push(line_no++)
                          }
                          this.m_code.push(pushf_instr)
                        }else {
                          if(s === Instruction.OP_POP_FRAME_STR) {
                            var popf_instr = Instruction.createInstruction(Instruction.OP_POP_FRAME);
                            if(this.GEN_LREF) {
                              this.m_lref.push(line_no++)
                            }
                            this.m_code.push(popf_instr)
                          }else {
                            if(s === Instruction.OP_STOP_STR) {
                              var stop_instr = Instruction.createInstruction(Instruction.OP_STOP);
                              if(this.GEN_LREF) {
                                this.m_lref.push(line_no++)
                              }
                              this.m_code.push(stop_instr)
                            }else {
                              if(s === Instruction.OP_SET_FLAG_STR) {
                                flag_index = parseInt(this.consumeNextWord(), 10);
                                val = parseInt(this.consumeNextWord(), 10);
                                var set_instr = Instruction.createInstruction(Instruction.OP_SET_FLAG);
                                set_instr.m_flag_index = flag_index;
                                set_instr.m_val = val;
                                if(this.GEN_LREF) {
                                  this.m_lref.push(line_no++)
                                }
                                this.m_code.push(set_instr)
                              }else {
                                if(s === Instruction.OP_CHECK_FLAG_STR) {
                                  flag_index = parseInt(this.consumeNextWord(), 10);
                                  val = parseInt(this.consumeNextWord(), 10);
                                  var check_instr = Instruction.createInstruction(Instruction.OP_CHECK_FLAG);
                                  check_instr.m_flag_index = flag_index;
                                  check_instr.m_val = val;
                                  if(this.GEN_LREF) {
                                    this.m_lref.push(line_no++)
                                  }
                                  this.m_code.push(check_instr)
                                }else {
                                  if(s === Instruction.OP_SYS_CALL_STR) {
                                    var kind_num, arg_num;
                                    kind_num = parseInt(this.consumeNextWord(), 10);
                                    arg_num = parseInt(this.consumeNextWord(), 10);
                                    var sys_instr = Instruction.createInstruction(Instruction.OP_SYS_CALL);
                                    sys_instr.m_kind = kind_num;
                                    sys_instr.m_arg = arg_num;
                                    if(this.GEN_LREF) {
                                      this.m_lref.push(line_no++)
                                    }
                                    this.m_code.push(sys_instr)
                                  }else {
                                    if(s === Instruction.OP_AST_ACTION_STR) {
                                      var has_param, kind, ast_id;
                                      has_param = parseInt(this.consumeNextWord(), 10);
                                      kind = parseInt(this.consumeNextWord(), 10);
                                      ast_id = parseInt(this.consumeNextWord(), 10);
                                      if(this.GEN_LREF) {
                                        this.m_lref.push(line_no++)
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    for(i = this.m_code.length - 1;i > 4;i -= 3) {
      if(this.m_code[i].m_opcode !== Instruction.OP_STOP || this.m_code[i - 1].m_opcode !== Instruction.OP_CALL || this.m_code[i - 2].m_opcode !== Instruction.OP_PUSH_FRAME) {
        break
      }
      var ruleNr = this.m_code[i - 2].m_rule_num;
      this.m_rule_infos[ruleNr].setRuleEntryStartEntryPoint(i - 2)
    }
    if(!this.m_externalizer.hasOwnProperty("#ID#")) {
      this.m_externalizer["#ID#"] = "identifier"
    }
  };
  ByteCode.prototype.readVersionInfo = function() {
    var s = this.consumeNextWord();
    if(s !== "Release") {
      throw'PAD file error: "Release" expected';
    }
    var release = this.consumeNextWord();
    s = this.consumeNextWord();
    if(s !== "Patchlevel") {
      throw'PAD file error: "Patchlevel" expected';
    }
    var patchlevel = this.consumeNextWord();
    return{"release":release, "patchlevel":patchlevel, getPatchLevelAsString:function() {
      return patchlevel
    }}
  };
  ByteCode.prototype.consumeNextWord = function() {
    if(this.padFileContent.length === 0) {
      return null
    }
    var i = 0;
    while(true) {
      var c = this.padFileContent.charAt(i);
      if(c === " " || c === "\r" || c === "\n" || c === "\t") {
        var result = this.padFileContent.substring(0, i);
        while(c === " " || c === "\r" || c === "\n" || c === "\t") {
          i++;
          c = this.padFileContent.charAt(i)
        }
        this.padFileContent = this.padFileContent.substring(i);
        return result
      }
      i++
    }
  };
  ByteCode.prototype.instruction = function(index) {
    if(index >= 0) {
      return this.m_code[index]
    }else {
      switch(index) {
        case this.RUNTIME_CREATED_STOP:
          return this.STOP_INSTRUCTION;
        case this.RUNTIME_CREATED_RETURN:
          return this.RETURN_INSTRUCTION;
        default:
          return this.STOP_INSTRUCTION
      }
    }
  };
  ByteCode.prototype.getStartIndex = function(startRuleName) {
    if(startRuleName == null || startRuleName.length === 0) {
      return this.size() - 3
    }
    for(var i = 0;i < this.m_rule_infos.length;++i) {
      var ri = this.m_rule_infos[i];
      if(this.m_rule_infos[i].getRuleName() === startRuleName && ri.getRuleStartEntryPoint() > 0) {
        return ri.getRuleStartEntryPoint()
      }
    }
    return this.size() - 3
  };
  ByteCode.prototype.size = function() {
    return this.m_code.length
  };
  ByteCode.prototype.ruleInfo = function(m_rule_num) {
    return this.m_rule_infos[m_rule_num]
  };
  ByteCode.prototype.getLref = function(idx) {
    if(idx < 0) {
      return idx
    }
    return this.m_lref[idx]
  };
  ByteCode.prototype.getTokenNameUS = function(index) {
    return this.m_token_names[index]
  };
  ByteCode.prototype.isPrefixOfToken2 = function(pref, index) {
    var tokenName = this.m_token_names[index];
    return tokenName.length >= pref.length && tokenName.substring(0, pref.length) === pref
  };
  ByteCode.prototype.isPrefixOfToken = function(pref, index, caseInsensitive) {
    if(caseInsensitive === undefined) {
      return this.isPrefixOfToken2(pref, index)
    }
    var tokenName = this.m_token_names[index];
    return tokenName.length >= pref.length && (tokenName.substring(0, pref.length) === pref || caseInsensitive === true && tokenName.substring(0, pref.length).toLowerCase() === pref.toLowerCase())
  };
  ByteCode.prototype.getRuleInfo = function(ruleName) {
    for(var i = 0;i < this.m_rule_infos.length;++i) {
      var ri = this.m_rule_infos[i];
      if(ri.getRuleName() === ruleName) {
        return ri
      }
    }
    return null
  };
  ByteCode.prototype.readNextQuotedWord = function() {
    var i = 0;
    var in_quote = false;
    while(true) {
      var c = this.padFileContent.charAt(i);
      var result = "";
      if(c === "\r" || c === "\n") {
        result = this.padFileContent.substring(0, i);
        while(c === " " || c === "\r" || c === "\n" || c === "\t") {
          i++;
          c = this.padFileContent.charAt(i)
        }
        this.padFileContent = this.padFileContent.substring(i);
        return result
      }
      if(in_quote === true && c === "\\") {
        c = i++;
        c = this.padFileContent.charAt(i);
        if(c === '"' || c === "\\") {
          throw'PAD file error: \\" and \\\\ currently not supported in quoted words';
        }
      }else {
        if(c === '"') {
          in_quote = !in_quote
        }
      }
      if(in_quote === false && (c === " " || c === "\r" || c === "\n" || c === "\t")) {
        result = this.padFileContent.substring(0, i);
        while(c === " " || c === "\r" || c === "\n" || c === "\t") {
          i++;
          c = this.padFileContent.charAt(i)
        }
        this.padFileContent = this.padFileContent.substring(i);
        return result
      }
      i++
    }
  };
  ByteCode.prototype.getVersionInfo = function() {
    return this.versionInfo
  };
  ByteCode.getTestByteCode = function(code) {
    var bc = new ByteCode("TEST_BC");
    bc.m_code = code;
    return bc
  };
  return ByteCode
});
define("rndrt/ByteCodeFactory", ["rndrt/ByteCode"], function(ByteCode) {
  function ByteCodeFactory() {
  }
  ByteCodeFactory.readByteCode = function(inputStream, release, with_version_info) {
    var res = new ByteCode(release);
    res.read(inputStream, with_version_info);
    return res
  };
  return ByteCodeFactory
});
define("rndrt/Category", [], function() {
  function Category(val) {
    this.value = val
  }
  Category.CAT_UNDEF = new Category(0);
  Category.CAT_IDENTIFIER = new Category(1);
  Category.CAT_OPERATOR = new Category(2);
  Category.CAT_TOKEN_OPERATOR = new Category(3);
  Category.CAT_WS = new Category(4);
  Category.CAT_COMMENT = new Category(5);
  Category.CAT_LITERAL = new Category(6);
  Category.CAT_MAYBE_KEYWORD = new Category(7);
  Category.CAT_KEYWORD = new Category(8);
  Category.CAT_STRICT_KEYWORD = new Category(9);
  Category.CAT_INCOMPLETE = new Category(10);
  Category.CAT_ANNOTATION = new Category(11);
  Category.CAT_NUMERICAL_LITERAL = new Category(12);
  Category.CAT_PRIMITIVE = new Category(13);
  for(var str in Category) {
    if(str.substr(0, 4) === "CAT_" && Category.hasOwnProperty(str)) {
      Category[Category[str].value] = {"str":str, "obj":Category[str]}
    }
  }
  Category.prototype.toString = function() {
    var entry = Category[this.value];
    return entry ? entry.str : "undefined"
  };
  Category.prototype.getValue = function() {
    return this.value
  };
  Category.forValue = function(i) {
    var entry = Category[i];
    return entry ? entry.obj : Category.CAT_UNDEF
  };
  return Category
});
define("rndrt/CompletionModes", [], function() {
  function CompletionModes(v) {
    this.value = v
  }
  CompletionModes.prototype.getValue = function() {
    return this.value
  };
  CompletionModes.COMPL_MODE_NONE = new CompletionModes(0);
  CompletionModes.COMPL_MODE_ALL = new CompletionModes(1);
  CompletionModes.COMPL_MODE_CLAUSES = new CompletionModes(2);
  CompletionModes.COMPL_MODE_UNIQUE = new CompletionModes(3);
  CompletionModes.COMPL_MODE_GEN = new CompletionModes(4);
  CompletionModes.parse = function(i) {
    switch(i) {
      case 0:
        return CompletionModes.COMPL_MODE_NONE;
      case 1:
        return CompletionModes.COMPL_MODE_ALL;
      case 2:
        return CompletionModes.COMPL_MODE_CLAUSES;
      case 3:
        return CompletionModes.COMPL_MODE_UNIQUE;
      case 4:
        return CompletionModes.COMPL_MODE_GEN
    }
    throw"Unknown completion mode";
  };
  return CompletionModes
});
define("rndrt/Constants", [], function() {
  var Constants = {NUM_UNDEF:-1, NUM_ANYKW:0, NUM_ANYNOTINUSE:1, NUM_EOF:2, NUM_NL:3, NUM_COMMENT1:4, NUM_COMMENT2:5, LAST_NUM:5, ParsingPhase:{TRY_PHASE:0, COMMIT_PHASE:1, EXPLORE_ON_ERROR:2}, ErrorQuality:{SIMPLE:0, COCO:1}};
  return Constants
});
define("rndrt/CursorPos", [], function() {
  function CursorPos(line, column) {
    this.m_line = line;
    this.m_column = column
  }
  return CursorPos
});
define("rndrt/ScannerState", [], function() {
  function ScannerState(state) {
    if(state == null) {
      this.m_input_pos = 0;
      this.m_colon_pos = -1;
      this.m_pos_to_proceed = -1;
      this.m_start_of_sentence = 0;
      this.m_no_chain_stmt = false;
      return
    }
    this.m_input_pos = state.m_input_pos;
    this.m_colon_pos = state.m_colon_pos;
    this.m_pos_to_proceed = state.m_pos_to_proceed;
    this.m_start_of_sentence = state.m_start_of_sentence;
    this.m_no_chain_stmt = state.m_no_chain_stmt
  }
  ScannerState.prototype.isGreaterOrEqual = function(state) {
    return this.m_input_pos >= state.m_input_pos
  };
  ScannerState.prototype.clone = function() {
    return new ScannerState(this)
  };
  return ScannerState
});
define("rndrt/Stackframe", ["require", "rndrt/FramePtr", "rndrt/RuleInfo"], function(require, FramePtr, RuleInfo) {
  function Stackframe(BP, rule_info, local_base) {
    if(local_base == null) {
      if(!(rule_info instanceof RuleInfo)) {
        this.secondConstructor(BP, rule_info);
        return
      }
    }
    this.m_frame_idx = Stackframe.prototype.getFrameNr.call(this);
    this.m_rule_info = rule_info;
    this.m_local_base = local_base;
    if(this.m_rule_info.m_terminal_count > 0) {
      this.m_tok_base = []
    }
    if(this.m_rule_info.m_flag_count > 0) {
      this.m_flag_base = []
    }
    FramePtr = require("./FramePtr");
    this.m_save_BP = new FramePtr(BP);
    this.m_ref_count_ = 0;
    this.m_save_PC = null;
    this.m_save_PC_index = 0;
    this.m_actual_ref_count = 0;
    this.m_frame_factory_id = -1;
    Stackframe.total_frames++;
    var i;
    for(i = 0;i < this.m_rule_info.m_terminal_count;++i) {
      this.m_tok_base[i] = -1
    }
    for(i = 0;i < this.m_rule_info.m_flag_count;++i) {
      this.m_flag_base[i] = false
    }
  }
  Stackframe.prototype.secondConstructor = function(other, local_base) {
    this.m_frame_idx = this.getFrameNr();
    if(other != null) {
      this.m_rule_info = other.m_rule_info
    }
    this.m_local_base = local_base == null && other != null ? other.m_local_base : local_base;
    if(other != null) {
      this.m_tok_base = [];
      this.m_flag_base = [];
      this.m_save_BP = other.m_save_BP;
      this.m_save_PC = other.m_save_PC;
      this.m_save_PC_index = other.m_save_PC_index;
      this.m_enteredForCompletion = other.m_enteredForCompletion;
      this.m_first_token_index = other.m_first_token_index;
      this.m_frame_factory_id = other.m_frame_factory_id;
      this.m_userContext = other.m_userContext
    }
    this.m_ref_count_ = 0;
    this.m_actual_ref_count = 0;
    Stackframe.total_frames++;
    var count = 0, i;
    if(other != null && other.m_tok_base != null) {
      if(this.m_tok_base.length < other.m_tok_base.length) {
        this.m_tok_base = []
      }
      for(i = 0;i < other.m_tok_base.length;++i) {
        this.m_tok_base[count] = other.m_tok_base[i];
        ++count
      }
    }
    count = 0;
    if(other != null && other.m_flag_base != null) {
      for(i = 0;i < other.m_flag_base.length;++i) {
        this.m_flag_base[count] = other.m_flag_base[i];
        ++count
      }
    }
  };
  Stackframe.total_frames = 0;
  Stackframe.s_total_frames = 0;
  Stackframe.prototype.cloneAttributes = function(other) {
    if(other != null) {
      this.m_tok_base = [];
      this.m_flag_base = [];
      this.m_save_BP = other.m_save_BP;
      this.m_save_PC = other.m_save_PC;
      this.m_save_PC_index = other.m_save_PC_index;
      this.m_enteredForCompletion = other.m_enteredForCompletion;
      this.m_first_token_index = other.m_first_token_index;
      this.m_frame_factory_id = other.m_frame_factory_id;
      this.m_userContext = other.m_userContext;
      var count = 0, i;
      if(other != null && other.m_tok_base != null) {
        if(this.m_tok_base.length < other.m_tok_base.length) {
          this.m_tok_base = []
        }
        for(i = 0;i < other.m_tok_base.length;++i) {
          this.m_tok_base[count] = other.m_tok_base[i];
          ++count
        }
      }
      count = 0;
      if(other != null && other.m_flag_base != null) {
        for(i = 0;i < other.m_flag_base.length;++i) {
          this.m_flag_base[count] = other.m_flag_base[i];
          ++count
        }
      }
    }
  };
  Stackframe.prototype.isUserFrame = function() {
    return false
  };
  Stackframe.prototype.setFactoryId = function(id) {
    this.m_frame_factory_id = id
  };
  Stackframe.prototype.getFactoryId = function() {
    return this.m_frame_factory_id
  };
  Stackframe.prototype.getFirstTokenIndex = function() {
    return this.m_first_token_index
  };
  Stackframe.prototype.performAction = function() {
  };
  Stackframe.prototype.getFrameNr = function() {
    return++Stackframe.s_total_frames
  };
  Stackframe.prototype.setLastTokenIndex = function(index) {
    this.m_last_token_index = index
  };
  Stackframe.prototype.setFirstTokenIndex = function(index) {
    this.m_first_token_index = index
  };
  Stackframe.prototype.getRuleInfo = function() {
    return this.m_rule_info
  };
  Stackframe.prototype.getParent = function() {
    if(this.m_save_BP != null) {
      return this.m_save_BP.getStackframe()
    }
    return null
  };
  Stackframe.prototype.m_enteredForCompletion = false;
  Stackframe.prototype.getLastMatchedTokenIndex = function() {
    return this.m_last_token_index
  };
  Stackframe.prototype.getEnteredForCompletion = function() {
    return this.m_enteredForCompletion
  };
  Stackframe.prototype.setEnteredForCompletion = function(val) {
    this.m_enteredForCompletion = val
  };
  Stackframe.prototype.getParentDepth = function() {
    var sf = this;
    var i = 0;
    while(sf != null && sf.m_save_BP != null) {
      ++i;
      sf = sf.m_save_BP.getStackframe()
    }
    return i
  };
  return Stackframe
});
define("rndrt/FramePtr", ["rndrt/Stackframe"], function(Stackframe) {
  function FramePtr(frame) {
    this.m_ptr = frame
  }
  FramePtr.prototype.dispose = function() {
    this.dec()
  };
  FramePtr.prototype.dec = function() {
    if(this.m_ptr != null) {
      this.m_ptr.m_ref_count_--;
      if(this.m_ptr.m_ref_count_ === 0) {
        this.m_ptr = null
      }
      this.m_ptr = null
    }
  };
  FramePtr.prototype.lock = function() {
    if(this.m_ptr != null) {
      if(this.m_ptr.m_ref_count_ > 1) {
        this.m_ptr.m_ref_count_--;
        this.m_ptr = new Stackframe(this.getStackframe(), this.m_ptr !== null ? this.m_ptr.m_local_base : null);
        this.inc()
      }
    }
  };
  FramePtr.prototype.inc = function() {
    if(this.m_ptr != null) {
      this.m_ptr.m_ref_count_++
    }
  };
  FramePtr.prototype.getStackframe = function() {
    return this.m_ptr
  };
  FramePtr.prototype.ptr = function() {
    return this.m_ptr
  };
  FramePtr.prototype.forceInc = function() {
    this.inc()
  };
  return FramePtr
});
define("rndrt/Path", ["rndrt/ScannerState", "rndrt/FramePtr"], function(ScannerState, FramePtr) {
  function Path(PC, PC_index, BP, scanner_state, la_index, la_num, last_known_keyword, last_proper_match, stack_depth, role_depth, active_role) {
    if(la_num instanceof Path) {
      this.secondConstructor(PC, PC_index, BP, scanner_state, la_index, la_num);
      return
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
    this.m_suspicious_matches = 0;
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
    this.m_instructions_indexes = [];
    this.m_instructions_hash = this.hashIt(this.m_instructions_indexes);
    this.m_instructionsMatchString = ""
  }
  Path.prototype.secondConstructor = function(PC, PC_index, BP, la_num, scanner_state, predecessor) {
    var r;
    this.m_PC = PC;
    this.m_PC_index = PC_index;
    this.m_PC_original = predecessor.m_PC_original;
    this.m_BP = new FramePtr(BP.getStackframe());
    this.m_BP_original = new FramePtr(predecessor.m_BP_original.getStackframe());
    this.m_scanner_state = new ScannerState(scanner_state);
    this.m_scanner_state_original = new ScannerState(predecessor.m_scanner_state_original);
    this.m_la_index = predecessor.m_la_index;
    this.m_la_index_original = predecessor.m_la_index_original;
    this.m_suspicious_matches = predecessor.m_suspicious_matches;
    this.m_err_count = 0;
    this.setPathLATokenNum(la_num);
    this.m_la_num_original = predecessor.m_la_num_original;
    this.m_disable_actions_for_this_path = predecessor.m_disable_actions_for_this_path;
    this.m_stack_depth = predecessor.m_stack_depth;
    this.setRoleDepth(predecessor.getRoleDepth());
    this.m_active_role = predecessor.m_active_role;
    this.m_completion = null;
    if(predecessor.m_completion !== null) {
      this.m_completion = predecessor.m_completion.clone()
    }
    this.m_last_known_keyword = predecessor.m_last_known_keyword;
    this.m_last_proper_match = predecessor.m_last_proper_match;
    this.m_penalty = predecessor.m_penalty;
    this.m_instructions_indexes = [];
    for(r = 0;r < predecessor.m_instructions_indexes.length;++r) {
      this.m_instructions_indexes.push(predecessor.m_instructions_indexes[r])
    }
    this.m_instructions_hash = predecessor.m_instructions_hash;
    this.m_instructionsMatchString = predecessor.m_instructionsMatchString
  };
  Path.prototype.restore = function() {
    this.m_BP = new FramePtr(this.m_BP_original.getStackframe());
    this.m_PC = this.m_PC_original;
    this.m_PC_index = this.m_PC_original_index;
    this.m_la_index = this.m_la_index_original;
    this.setPathLATokenNum(this.m_la_num_original);
    this.m_scanner_state = new ScannerState(this.m_scanner_state_original);
    this.m_BP_original.dispose()
  };
  Path.prototype.getRoleDepth = function() {
    return this.m_role_depth
  };
  Path.prototype.getStackframe = function() {
    if(this.m_BP == null) {
      return null
    }
    return this.m_BP.getStackframe()
  };
  Path.prototype.setCompletion = function(compl) {
    this.m_completion = compl
  };
  Path.prototype.getCompletion = function() {
    return this.m_completion
  };
  Path.prototype.addInstructionIndex = function(instructionIndex) {
    this.m_instructions_indexes.push(instructionIndex);
    if(this.m_instructions_indexes.length === 1) {
      this.m_instructions_hash = this.hashIt(this.m_instructions_indexes)
    }else {
      this.m_instructions_hash = this.m_instructions_hash << 4 ^ this.m_instructions_hash >> 28 ^ instructionIndex
    }
  };
  Path.prototype.addInstruction = function(instr, instructionIndex) {
    this.m_instructions_indexes.push(instructionIndex);
    if(this.m_instructions_indexes.length === 1) {
      this.m_instructions_hash = this.hashIt(this.m_instructions_indexes)
    }else {
      this.m_instructions_hash = this.m_instructions_hash << 4 ^ this.m_instructions_hash >> 28 ^ instructionIndex
    }
  };
  Path.prototype.getPathLATokenNum = function() {
    return this.m_la_num
  };
  Path.prototype.storeCurrentPositionAsOriginClearingInstructionsOnErrorRecovery = function(scanner_state) {
    this.m_PC_original = this.m_PC;
    this.m_PC_original_index = this.m_PC_index;
    this.m_scanner_state_original = new ScannerState(scanner_state);
    this.m_la_index_original = this.m_la_index;
    this.m_la_num_original = this.getPathLATokenNum();
    this.m_instructions_indexes = [];
    this.m_instructions_hash = 0;
    this.m_instructionsMatchString = ""
  };
  Path.prototype.storeCurrentPositionAsOriginClearingInstructions = function(scanner_state) {
    this.m_PC_original = this.m_PC;
    this.m_PC_original_index = this.m_PC_index;
    this.m_BP_original = new FramePtr(this.m_BP.getStackframe());
    this.m_scanner_state_original = new ScannerState(scanner_state);
    this.m_la_index_original = this.m_la_index;
    this.m_la_num_original = this.getPathLATokenNum();
    this.m_instructions_indexes = [];
    this.m_instructions_hash = 0;
    this.m_instructionsMatchString = ""
  };
  Path.prototype.resetMatchInfo = function() {
    this.m_last_known_keyword = -1;
    this.m_last_proper_match = -1;
    this.m_suspicious_matches = 0
  };
  Path.prototype.setRoleDepth = function(m_role_depth) {
    this.m_role_depth = m_role_depth
  };
  Path.prototype.setPathLATokenNum = function(m_la_num) {
    this.m_la_num = m_la_num
  };
  Path.prototype.getHashCode = function() {
    var hash = this.m_instructions_hash;
    hash = hash << 4 ^ hash >> 28 ^ this.m_PC_index ^ this.m_la_index;
    return hash
  };
  Path.prototype.hashIt = function(instructions_indexes) {
    var hash = instructions_indexes.length;
    for(var i = 0;i < instructions_indexes.length;++i) {
      hash = hash << 4 ^ hash >> 28 ^ instructions_indexes[i]
    }
    return hash
  };
  Path.prototype.toLongString = function() {
    return""
  };
  return Path
});
define("rndrt/StringWriter", [], function() {
  function StringWriter() {
    this.m_buffer = []
  }
  StringWriter.prototype.put = function(s) {
    this.m_buffer.push(s)
  };
  StringWriter.prototype.getBuffer = function() {
    return this
  };
  StringWriter.prototype.toString = function() {
    return this.m_buffer.join("")
  };
  return StringWriter
});
define("rndrt/PrintWriter", [], function() {
  function PrintWriter(sw) {
    this.sw = sw
  }
  PrintWriter.prototype.print = function(s) {
    this.sw.put(String(s));
    return this
  };
  PrintWriter.prototype.println = function(s) {
    this.sw.put(String(s) + "\n");
    return this
  };
  PrintWriter.prototype.endl = function() {
    this.sw.put("\n")
  };
  PrintWriter.prototype.printf = function(s, u) {
    this.sw.put(String(s));
    if(u !== undefined && u !== null) {
      this.sw.put(String(u))
    }
  };
  PrintWriter.prototype.append = function(s) {
    this.sw.put(String(s))
  };
  return PrintWriter
});
define("rndrt/VMStatus", [], function() {
  var VMStatus = {PROCEED:0, PATH_FAILED:1, GET_NEXT_PATH:2, STOPPED:3};
  return VMStatus
});
define("rndrt/ErrorState", [], function() {
  function ErrorState(val) {
    this.m_value = val
  }
  ErrorState.Correct = new ErrorState(0);
  ErrorState.Suspicious = new ErrorState(1);
  ErrorState.Reinterpretation = new ErrorState(2);
  ErrorState.Erroneous = new ErrorState(3);
  ErrorState.Unknown = new ErrorState(4);
  ErrorState.prototype.getValue = function() {
    return this.m_value
  };
  return ErrorState
});
define("rndrt/HookResult", [], function() {
  var HookResult = {STOP:0, PATHFAILED:1, DONE:2, NORMAL:3};
  return HookResult
});
define("rndrt/Syscodes", [], function() {
  function Syscodes() {
  }
  Syscodes.SYS_COMMIT = 0;
  Syscodes.SYS_CCQUERY = 1;
  Syscodes.SYS_INCLUDE = 2;
  Syscodes.SYS_CCIGNORE = 3;
  Syscodes.SYS_CCBLOCKEND = 4;
  Syscodes.SYS_NOCHAINSTMT = 5;
  return Syscodes
});
define("rndrt/RNDContext", [], function() {
  function RNDContext(path) {
    this.m_sf = path.m_BP.ptr();
    this.m_index = path.m_la_index
  }
  RNDContext.prototype.getStackframe = function() {
    return this.m_sf
  };
  RNDContext.prototype.getTokenIndex = function() {
    return this.m_index
  };
  return RNDContext
});
define("rndrt/Token", [], function() {
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
    this.m_suspicious_candidate = false;
    this.m_line_count = -1;
    this.m_relative_end_column = -1;
    this.m_relative_end_offset = -1
  }
  Token.prototype.setEndPosition = function(end_offset, end_line, end_column) {
    this.m_line_count = end_line - this.m_line + 1;
    this.m_relative_end_column = end_column - this.m_column;
    this.m_relative_end_offset = end_offset - this.m_offset
  };
  Token.prototype.setPayload = function(payload) {
    this.mPayLoad = payload
  };
  Token.prototype.getPayload = function() {
    return this.mPayLoad
  };
  Token.prototype.getM_lexem = function() {
    return this.m_lexem
  };
  Token.prototype.getOffset = function() {
    return this.m_offset
  };
  Token.prototype.getLength = function() {
    if(this.m_lexem) {
      return this.m_lexem.length
    }
    return 0
  };
  Token.prototype.getEndOffset = function() {
    return this.m_relative_end_offset !== -1 ? this.m_offset + this.m_relative_end_offset : this.m_offset + this.m_lexem.length
  };
  Token.prototype.getEndLineNumber = function() {
    return this.m_line_count !== -1 ? this.m_line + this.m_line_count - 1 : this.m_line + (this.m_lexem.match(/\n/g) || []).length
  };
  Token.prototype.getEndColumnNumber = function() {
    if(this.m_relative_end_column !== -1) {
      return this.m_column + this.m_relative_end_column
    }else {
      var ix = this.m_lexem.length.lastIndexOf("\n");
      if(ix === -1) {
        return this.m_column + this.m_lexem.length
      }else {
        return this.m_lexem.length - ix
      }
    }
  };
  return Token
});
define("rndrt/ParserTrace", ["rndrt/Token", "rndrt/Stackframe"], function(Token, Stackframe) {
  function ParserTrace(trace) {
    this.m_trace = trace
  }
  ParserTrace.prototype.print = function(tok) {
    if(tok instanceof Token) {
      this.m_trace.print("'" + tok.m_lexem + "'(" + tok.m_num + ")(" + tok.m_line + ":" + tok.m_column + ")");
      return
    }
    if(tok instanceof Stackframe) {
      this.m_trace.print("Sf:" + tok.m_frame_idx);
      return
    }
    this.m_trace.print(tok)
  };
  ParserTrace.prototype.println = function(o) {
    this.m_trace.print(o);
    this.m_trace.print("\n")
  };
  return ParserTrace
});
define("rndrt/TokenRecommendations", [], function() {
  function TokenRecommendations(trace, case_sensitive) {
    this.m_trace = trace;
    this.m_case_sensitive = case_sensitive;
    this.m_failed_matches = {}
  }
  TokenRecommendations.prototype.collectMismatch = function(expected_num, expected_val, externalizer) {
    if(expected_val.charAt(0) === "#") {
      var len = expected_val.length;
      if(len > 2 && expected_val.charAt(len - 1) === "#" && !externalizer.hasOwnProperty(expected_val)) {
        return
      }
    }
    this.m_failed_matches[expected_num] = expected_val
  };
  var RuntimeMessage = {UNEXPECTED_TOKEN:'Unexpected token "$P1$"', UNEXPECTED_TOKEN_DYM1:'Unexpected token "$P1$". Did you mean "$P2$"?', UNEXPECTED_TOKEN_DYM2:'Unexpected token "$P1$". Did you mean "$P2$" or "$P3$"?', UNEXPECTED_TOKEN_DYM3:'Unexpected token "$P1$". Did you mean "$P2$" or "$P3$" or "$P4$"?', UNEXPECTED_TOKEN_EXP1:'Unexpected token "$P1$". Expected was "$P2$"', UNEXPECTED_TOKEN_EXP2:'Unexpected token "$P1$". Expected was "$P2$" or "$P3$"', UNEXPECTED_TOKEN_EXP3:'Unexpected token "$P1$". Expected was "$P2$" or "$P3$" or "$P4$"'};
  function Message(messageType, parameter1, parameter2, parameter3, parameter4) {
    this.messageType = messageType;
    this.p1 = parameter1;
    this.p2 = parameter2;
    this.p3 = parameter3;
    this.p4 = parameter4
  }
  function evaluateParam(parameter_value, externalizer) {
    return externalizer && externalizer.hasOwnProperty(parameter_value) ? externalizer[parameter_value] : parameter_value
  }
  Message.prototype.toString = function(externalizer) {
    var eff = {"P1":evaluateParam(this.p1, externalizer), "P2":evaluateParam(this.p2, externalizer), "P3":evaluateParam(this.p3, externalizer), "P4":evaluateParam(this.p4, externalizer)};
    var msgSplit = this.messageType.split("$");
    var haveLeadingDollar = false;
    var last = msgSplit.length - 1;
    var result = "";
    for(var i = 0;i <= last;++i) {
      if(haveLeadingDollar && i < last && msgSplit[i] in eff) {
        result += eff[msgSplit[i]];
        haveLeadingDollar = false;
        continue
      }
      if(haveLeadingDollar) {
        result += "$" + msgSplit[i]
      }else {
        result += msgSplit[i]
      }
      haveLeadingDollar = true
    }
    return result
  };
  function WeighedMismatch(dist, val) {
    this.m_distance = dist;
    this.m_token_val = val
  }
  function compareWeighedMismatches(one, two) {
    return one.m_distance === two.m_distance ? one.m_token_val.localeCompare(two) : one.m_distance - two.m_distance
  }
  function WeighedMismatchIterator(weighedMismatchArray) {
    this.m_array = weighedMismatchArray;
    this.m_pos = 0;
    this.m_values_delivered = 0
  }
  WeighedMismatchIterator.prototype.nextTokenVal = function() {
    if(this.m_pos >= this.m_array.length) {
      return""
    }
    var result = this.m_array[this.m_pos];
    for(++this.m_pos;this.m_pos < this.m_array.length && result.m_distance === this.m_array[this.m_pos].m_distance && result.m_token_val === this.m_array[this.m_pos].m_token_val;) {
      ++this.m_pos
    }
    ++this.m_values_delivered;
    return result.m_token_val
  };
  function AlphaWeighedMismatchIterator(stringArray) {
    this.m_array = stringArray;
    this.m_pos = 0;
    this.m_values_delivered = 0
  }
  AlphaWeighedMismatchIterator.prototype.nextVal = function() {
    if(this.m_pos >= this.m_array.length) {
      return""
    }
    var result = this.m_array[this.m_pos];
    for(++this.m_pos;this.m_pos < this.m_array.length && result === this.m_array[this.m_pos];) {
      ++this.m_pos
    }
    ++this.m_values_delivered;
    return result
  };
  var CaseComparisonCost = {EQUAL:0, FIX_COST:10, SHORT_WORD_COST:10, CASE_ADOPTION:1, TRANSPOSITION:8, ALPHA_REPLACEMENT:10, ANY_REPLACEMENT:20, INSERT_DELETE:20};
  TokenRecommendations.SMALL_TEXT_DISTANCE = 30;
  TokenRecommendations.SHORT_WORD = 2;
  function getCharDistance(case_sensitive, c1, c2) {
    var C1 = c1.toUpperCase();
    var C2 = c2.toUpperCase();
    if(case_sensitive) {
      if(c1 === c2) {
        return CaseComparisonCost.EQUAL
      }
      if(C1 !== c1.toLowerCase() && C2 !== c2.toLowerCase()) {
        return C1 === C2 ? CaseComparisonCost.CASE_ADOPTION : CaseComparisonCost.ALPHA_REPLACEMENT
      }
    }else {
      if(C1 === C2) {
        return CaseComparisonCost.EQUAL
      }
      if(C1 !== c1.toLowerCase() && C2 !== c2.toLowerCase()) {
        return CaseComparisonCost.ALPHA_REPLACEMENT
      }
    }
    return CaseComparisonCost.ANY_REPLACEMENT
  }
  TokenRecommendations.rndDistance = function(val1, val2, case_sensitive, dist_max) {
    var i, j;
    var dist = 0, odist = 0;
    var prev = new Array(val2.length + 1), curr = new Array(val2.length + 1), temp;
    prev[0] = 0;
    for(i = 1;i <= val2.length;++i) {
      prev[i] = prev[i - 1] + CaseComparisonCost.INSERT_DELETE
    }
    for(i = 1;i <= val1.length;++i) {
      curr[0] = prev[0] + CaseComparisonCost.INSERT_DELETE;
      dist = curr[0];
      var s_i = val1.charAt(i - 1);
      for(j = 1;j <= val2.length;++j) {
        var t_j = val2.charAt(j - 1);
        var compare_cost = getCharDistance(case_sensitive, s_i, t_j);
        var insert_delete_cost = Math.min(prev[j], curr[j - 1]) + CaseComparisonCost.INSERT_DELETE;
        var cell = Math.min(insert_delete_cost, prev[j - 1] + compare_cost);
        if(i === j && i > 2) {
          var trans_cost = odist + CaseComparisonCost.TRANSPOSITION;
          trans_cost += getCharDistance(case_sensitive, val1.charAt(i - 2), t_j);
          trans_cost += getCharDistance(case_sensitive, s_i, val2.charAt(j - 2));
          if(cell > trans_cost) {
            cell = trans_cost
          }
        }
        curr[j] = cell;
        if(curr[j] < dist) {
          dist = curr[j]
        }
      }
      if(i <= val2.length) {
        odist = prev[i - 1]
      }
      temp = prev;
      prev = curr;
      curr = temp;
      if(dist >= dist_max) {
        return dist_max
      }
    }
    var cost = prev[val2.length];
    if(cost === 0) {
      return 0
    }
    cost += CaseComparisonCost.FIX_COST;
    var len_max = Math.max(val1.length, val2.length);
    if(len_max <= TokenRecommendations.SHORT_WORD) {
      cost += CaseComparisonCost.SHORT_WORD_COST
    }
    return cost
  };
  TokenRecommendations.prototype.buildMessage = function(actual_val) {
    var almost_matches = [];
    var mismatches = [];
    var iter;
    for(var ci in this.m_failed_matches) {
      if(!this.m_failed_matches.hasOwnProperty(ci)) {
        continue
      }
      var dist = TokenRecommendations.rndDistance(actual_val, this.m_failed_matches[ci], this.m_case_sensitive, 3 * TokenRecommendations.SMALL_TEXT_DISTANCE);
      if(this.m_trace !== null) {
        this.m_trace.println('Mismatch score for "' + this.m_failed_matches[ci] + '" is ' + dist.toString())
      }
      if(dist <= TokenRecommendations.SMALL_TEXT_DISTANCE) {
        almost_matches.push(new WeighedMismatch(dist, this.m_failed_matches[ci]))
      }else {
        mismatches.push(this.m_failed_matches[ci])
      }
    }
    if(almost_matches.length > 0) {
      almost_matches.sort(compareWeighedMismatches);
      iter = new WeighedMismatchIterator(almost_matches);
      var almost1 = iter.nextTokenVal();
      var almost2 = iter.nextTokenVal();
      var almost3 = iter.nextTokenVal();
      switch(iter.m_values_delivered) {
        case 1:
          return new Message(RuntimeMessage.UNEXPECTED_TOKEN_DYM1, actual_val, almost1);
        case 2:
          return new Message(RuntimeMessage.UNEXPECTED_TOKEN_DYM2, actual_val, almost1, almost2);
        default:
          return new Message(RuntimeMessage.UNEXPECTED_TOKEN_DYM3, actual_val, almost1, almost2, almost3)
      }
    }
    if(mismatches.length > 0) {
      mismatches.sort();
      iter = new AlphaWeighedMismatchIterator(mismatches);
      var mismatch1 = iter.nextVal();
      var mismatch2 = iter.nextVal();
      var mismatch3 = iter.nextVal();
      iter.nextVal();
      switch(iter.m_values_delivered) {
        case 1:
          return new Message(RuntimeMessage.UNEXPECTED_TOKEN_EXP1, actual_val, mismatch1);
        case 2:
          return new Message(RuntimeMessage.UNEXPECTED_TOKEN_EXP2, actual_val, mismatch1, mismatch2);
        case 3:
          return new Message(RuntimeMessage.UNEXPECTED_TOKEN_EXP3, actual_val, mismatch1, mismatch2, mismatch3)
      }
    }
    return new Message(RuntimeMessage.UNEXPECTED_TOKEN, actual_val)
  };
  TokenRecommendations.prototype.clear = function() {
    this.m_failed_matches = []
  };
  return TokenRecommendations
});
define("rndrt/Parser", ["rndrt/Constants", "rndrt/Path", "rndrt/FramePtr", "rndrt/StringWriter", "rndrt/PrintWriter", "rndrt/VMStatus", "rndrt/ErrorState", "rndrt/HookResult", "rndrt/Instruction", "rndrt/Stackframe", "rndrt/ScannerState", "rndrt/Category", "rndrt/Syscodes", "rndrt/RNDContext", "rndrt/ParserTrace", "rndrt/TokenRecommendations", "rndrt/ByteCode", "rndrt/Utils"], function(Constants, Path, FramePtr, StringWriter, PrintWriter, VMStatus, ErrorState, HookResult, Instruction, Stackframe, 
ScannerState, Category, Syscodes, RNDContext, ParserTrace, TokenRecommendations, ByteCode, Utils) {
  function Parser(byte_code, scanner) {
    this.MAX_PATHS_CHECKED = 1E3 * 1E3;
    this.MAX_SUSPICIOUS_MATCHES = byte_code !== undefined ? byte_code.m_max_suspicious_matches : 0;
    this.m_parsing_phase = Constants.ParsingPhase.TRY_PHASE;
    this.m_byte_code = byte_code;
    this.m_scanner = scanner;
    this.m_resync = false;
    this.m_paths_checked = 0;
    this.m_hit_completion_pos = false;
    this.m_flag_check_error = false;
    this.m_vm_status = VMStatus.PROCEED;
    this.m_coco_mode = false;
    this.m_skip_actions = true;
    this.setLastSyncPoint(-1);
    this.m_current = new Path(null, 0, new FramePtr(null), null, -1, -1, -1, -1, 0, -1, 0);
    this.m_global_counter = 0;
    this.m_non_det_pool = [];
    this.m_weak_det_pool = [];
    this.m_erroneous_pool = [];
    this.m_paths_checked = 0;
    this.m_instructions_processed = 0;
    this.m_la_index_max = 0;
    this.m_return_false_on_err = false;
    this.CANBETRUE = true;
    this.m_startRuleName = null;
    this.m_chachedStartIndex = 0;
    this.m_branchHook = null;
    this.m_pathsExhaustedHook = null;
    this.m_errorRecoveryHook = null;
    this.isActionDisabledDuringErrorReplay = true;
    this.m_recommendation = null;
    this.m_failure_la = -1;
    this.m_error_quality = Constants.ErrorQuality.SIMPLE;
    this.MAX_PATHS_CHECKED = 1E3 * 1E3;
    this.m_trace = null;
    this.m_infiniteSuspiciousMatches = false;
    if(byte_code !== undefined) {
      this.alignStartIndex()
    }
    this.traceResultSW = new StringWriter;
    this.traceResult = new PrintWriter(this.traceResultSW);
    this.NUM_EOF = byte_code ? byte_code.getTokenIndex("#EOF#") : Constants.NUM_EOF;
    this.NUM_ANYKW = byte_code ? byte_code.getTokenIndex("#ANYKW#") : Constants.NUM_ANYKW
  }
  Parser.prototype.getInstructionsProcessed = function() {
    return this.m_instructions_processed
  };
  Parser.prototype.getCompletionPaths = function() {
    return this.m_completionPaths
  };
  Parser.prototype.getTraceResult = function() {
    return this.traceResultSW.getBuffer().toString()
  };
  Parser.prototype.enableTracing = function() {
    this.TRACING_ENABLED = true;
    this.trace("")
  };
  Parser.prototype.activateTrace = function(trace) {
    if(!trace) {
      this.m_trace = null;
      return
    }
    this.m_trace = new ParserTrace(trace)
  };
  Parser.prototype.traceindent = function() {
  };
  Parser.prototype.dotrace = function() {
  };
  Parser.prototype.dumpCurrentAndOriginal = function() {
  };
  Parser.prototype.setInfiniteSuspiciousMatches = function(val) {
    this.m_infiniteSuspiciousMatches = val
  };
  Parser.prototype.setHashReject = function() {
  };
  Parser.prototype.run = function(completion_mode, halted, HALTED_INTERVAL) {
    this.m_completion_mode = completion_mode;
    this.m_coco_mode = false;
    this.m_skip_actions = true;
    this.halted_counter = 0;
    this.m_paths_checked = 0;
    this.halted = halted;
    if(HALTED_INTERVAL !== 0) {
      this.HALTED_INTERVAL = HALTED_INTERVAL
    }
    return this.runInternal()
  };
  Parser.prototype.onCommitMatch = function() {
    this.onCommitMatchContext(this.getContext())
  };
  Parser.prototype.onCommitMatchContext = function() {
  };
  Parser.prototype.getContext = function() {
    return new RNDContext(this.m_current)
  };
  Parser.prototype.storeOnEndofReplay = function(save_PC, save_PC_index, save_BP) {
    if(this.m_trace != null) {
      this.m_trace.println("</REPLAY>")
    }
    this.setParsingPhase(Constants.ParsingPhase.TRY_PHASE);
    if(this.m_trace != null) {
      this.dumpCurrentAndOriginal("prior Store Current to:")
    }
    this.m_current.storeCurrentPositionAsOriginClearingInstructions(this.m_scanner.getStateCopy());
    if(this.m_trace != null) {
      this.dumpCurrentAndOriginal("post Store Current to:")
    }
    this.m_current.m_PC = save_PC;
    this.m_current.m_PC_index = save_PC_index;
    this.m_current.m_BP = new FramePtr(save_BP.getStackframe());
    if(this.m_trace != null) {
      this.dumpCurrentAndOriginal("post replay, reset from saved:");
      this.dotrace(save_PC, save_PC_index, this.m_current.m_BP)
    }
  };
  Parser.prototype.onMatch = function(match_instr) {
    this.vmBindToken(match_instr);
    this.vmClassifyToken(match_instr);
    this.addCurrentInstructionToPath();
    this.setMatchPositionOnStackframe()
  };
  Parser.prototype.isOmitWeakAlt = function(is_strict) {
    if(typeof is_strict === "object") {
      return is_strict.m_is_strict
    }
    return is_strict
  };
  Parser.prototype.setMatchPositionOnStackframe = function() {
    var sf = this.m_current.m_BP.getStackframe();
    if(sf != null) {
      sf.setLastTokenIndex(this.m_current.m_la_index)
    }
  };
  Parser.prototype.checkForHalt = function() {
    if(this.halted != null) {
      if(this.halted_counter++ > this.HALTED_INTERVAL) {
        if(this.halted.run()) {
          this.clearPathAndCompletions();
          return true
        }
        this.halted_counter = 0
      }
    }
    return false
  };
  Parser.prototype.setHitCompletionPos = function(val) {
    this.m_hit_completion_pos = val
  };
  Parser.prototype.getFlagCheckError = function() {
    return this.m_flag_check_error
  };
  Parser.prototype.forcePathFailureInBranch = function() {
    return false
  };
  Parser.prototype.returnErrMatch = function() {
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.println("");
      this.traceindent();
      this.m_trace.println("<---------------------------")
    }
    this.setPathFailed()
  };
  Parser.prototype.recordCompletionPathOnFailure = function() {
  };
  Parser.prototype.pathFailed = function() {
    this.onPathFailed();
    if(this.isCoCoMode()) {
      this.recordCompletionPathOnFailure(this.m_current)
    }
    this.error()
  };
  Parser.prototype.onPathFailed = function() {
  };
  Parser.prototype.compareBetterErrorPath = function(p1, bk) {
    if(bk.m_last_known_keyword < p1.m_last_known_keyword) {
      return-1
    }
    if(bk.m_last_known_keyword > this.m_current.m_last_known_keyword) {
      return+1
    }
    if(bk.m_last_proper_match < this.m_current.m_last_proper_match) {
      return-1
    }
    if(bk.m_last_proper_match > this.m_current.m_last_proper_match) {
      return+1
    }
    if(bk.m_la_index < this.m_current.m_la_index) {
      return-1
    }
    if(bk.m_la_index > this.m_current.m_la_index) {
      return+1
    }
    return 0
  };
  Parser.prototype.error = function() {
    if(this.m_erroneous_pool.length !== 0) {
      var bk = this.m_erroneous_pool[this.m_erroneous_pool.length - 1];
      var res = this.compareBetterErrorPath(this.m_current, bk);
      if(res == -1) {
        this.m_erroneous_pool = []
      }else {
        if(res > 0) {
          return
        }
      }
    }
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.print("   replace errPath PC=");
      this.m_trace.print(this.m_byte_code.getLref(this.m_current.m_PC_index));
      this.m_trace.print("@");
      this.m_trace.println(this.m_current.m_la_index)
    }
    this.m_erroneous_pool.unshift(new Path(this.m_current.m_PC, this.m_current.m_PC_index, this.cloneCurrentFrameInternalSimple(), this.m_current.getPathLATokenNum(), this.m_scanner.getStateCopy(), this.m_current))
  };
  Parser.prototype.findMoreReplacementProposals = function() {
    if(this.m_trace) {
      this.m_trace.println("<EXPLORE_ALTERNATIVES>")
    }
    var op = this.m_parsing_phase;
    this.m_parsing_phase = Constants.ParsingPhase.EXPLORE_ON_ERROR;
    var best_path = this.m_erroneous_pool[this.m_erroneous_pool.length - 1];
    this.m_failure_la = best_path.m_la_index;
    var failed_paths = this.m_erroneous_pool;
    this.m_erroneous_pool = [];
    for(var path_no = 0;path_no < failed_paths.length;) {
      var ep = failed_paths[path_no];
      ++path_no;
      if(ep.m_la_index === this.m_failure_la) {
        this.discardPath(this.m_current);
        this.m_current = ep;
        this.m_vm_status = VMStatus.PROCEED;
        while(this.m_current.m_PC.m_opcode == Instruction.OP_PRED) {
          --this.m_current.m_PC_index;
          this.alignPCwithIndex()
        }
        if(this.m_trace) {
          this.traceindent();
          this.m_trace.print('<EXPLORE_ALTERNATIVE id="#');
          this.m_trace.print(path_no + '" PC="');
          this.m_trace.print(this.m_byte_code.getLref(this.m_current.m_PC_index));
          this.m_trace.println("@" + this.m_current.m_la_index + '">')
        }
        this.runLookingForReplacementProposals();
        if(this.m_trace) {
          this.m_trace.println("</EXPLORE_ALTERNATIVE>")
        }
      }
    }
    this.m_parsing_phase = op;
    this.m_failure_la = -1;
    this.m_erroneous_pool = [];
    this.m_erroneous_pool.push(best_path);
    if(this.m_trace) {
      this.m_trace.println("</EXPLORE_ALTERNATIVES>")
    }
  };
  Parser.prototype.runLookingForReplacementProposals = function() {
    while(this.m_vm_status != VMStatus.STOPPED) {
      switch(this.m_vm_status) {
        case VMStatus.PROCEED:
          switch(this.m_current.m_PC.m_opcode) {
            case Instruction.OP_MATCH:
              this.vmMatch(this.m_current.m_PC);
              break;
            case Instruction.OP_PUSH_FRAME:
              this.vmPushFrame(this.m_current.m_PC);
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
              break
          }
          break;
        case VMStatus.PATH_FAILED:
          this.pathFailed();
        case VMStatus.GET_NEXT_PATH:
          if(!this.getNextPath()) {
            return
          }
          break;
        case VMStatus.STOPPED:
          break
      }
    }
  };
  Parser.prototype.getNextTokenIndex = function() {
    return this.m_current.m_la_index
  };
  Parser.prototype.getCurrentStackFrameFirstTokenIndex = function() {
    if(this.m_current != null && this.m_current.getStackframe() != null) {
      return this.m_current.getStackframe().getFirstTokenIndex()
    }
    return-1
  };
  Parser.prototype.getLastMatchedTokenIndex = function() {
    if(this.m_current != null && this.m_current.getStackframe() != null) {
      return this.m_current.getStackframe().getLastMatchedTokenIndex()
    }
    return-1
  };
  Parser.prototype.previousTokIgnoringNL = function() {
    if(this.m_current.m_la_index >= 1) {
      var idx = this.m_current.m_la_index - 1;
      var tok = this.m_scanner.getToken(idx);
      while(tok.m_category === Category.CAT_WS || tok.m_category === Category.CAT_COMMENT) {
        idx--;
        if(idx < 0) {
          return null
        }
        tok = this.m_scanner.getToken(idx)
      }
      return tok
    }else {
      return null
    }
  };
  Parser.prototype.isDirtyMatch = function(match_instr, num) {
    return match_instr.m_la == this.m_scanner.getActualNUMID() && this.isDirty(num)
  };
  Parser.prototype.isDirtyMatchNone = function() {
    var tok = this.lTok();
    return this.isDirtyMatchOne(tok.m_num)
  };
  Parser.prototype.isDirtyMatchOne = function(terminal) {
    return terminal > this.getTokenIndexResolver().getActualNUMID()
  };
  Parser.prototype.vmMatch = function(match_instr) {
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.print("  vm_MATCH expect: ");
      this.m_trace.print("'" + this.getByteCode().getTokenNameUS(match_instr.m_la) + "'");
      this.m_trace.print("(" + match_instr.m_la + ")");
      this.m_trace.print("have: ");
      this.m_trace.print(this.lTok());
      this.m_trace.print("@");
      this.m_trace.print(this.m_current.m_la_index);
      this.m_trace.println(" " + this.getByteCode().getLref(this.m_current.m_PC_index))
    }
    if(this.m_matchHook != null) {
      var res = this.m_matchHook.invoke(this.m_processorDelegate);
      switch(res) {
        case HookResult.STOP:
          this.setVMStopped();
          return;
        case HookResult.PATHFAILED:
          this.setPathFailed();
          return;
        case HookResult.DONE:
          return;
        case HookResult.NORMAL:
          break;
        default:
          throw'A match hook may not return this value "' + res + '"';
      }
    }
    var tok;
    switch(this.m_parsing_phase) {
      case Constants.ParsingPhase.COMMIT_PHASE:
        this.onMatch(match_instr);
        this.onCommitMatch(match_instr);
        if(!this.isAnyToken(this.m_current.getPathLATokenNum())) {
          this.nextToken()
        }
        this.incrementPC();
        return;
      case Constants.ParsingPhase.EXPLORE_ON_ERROR:
        tok = this.lTok();
        if(this.m_trace != null) {
          this.m_trace.traceindent();
          this.m_trace.print("  collect mismatch ");
          this.m_trace.print("'" + this.m_byte_code.getTokenNameUS(match_instr.m_la) + "'");
          this.m_trace.print("(" + match_instr.m_la + ")");
          this.m_trace.println(this.m_current.m_la_index)
        }
        this.m_recommendation.collectMismatch(match_instr.m_la, this.m_byte_code.getTokenNameUS(match_instr.m_la), this.m_byte_code.m_externalizer);
        this.setGetNextPath();
        return;
      case Constants.ParsingPhase.TRY_PHASE:
        if(this.match(match_instr.m_la, match_instr.m_is_strict)) {
          tok = this.lTok();
          if(match_instr.m_la != tok.m_num && tok.m_suspicious_candidate && (match_instr.m_is_strict || this.maxSuspiciousMatchesExceeded())) {
            if(this.m_trace != null) {
              this.m_trace.println(match_instr.m_is_strict ? "Suspicious candidate may not match weak for a strict match" : "  vm_MATCH: Omitting path because suspicious matches reached maximum")
            }
            this.setPathFailed();
            return
          }
          this.vmBindToken(match_instr);
          this.vmClassifyToken(match_instr);
          this.addCurrentInstructionToPath();
          if(!this.isAnyToken(this.m_current.getPathLATokenNum())) {
            this.nextToken()
          }
          this.incrementPC();
          return
        }
        break
    }
    if(match_instr.m_la == this.m_scanner.getActualNUMID() && this.isDirtyMatchOne(this.m_current.getPathLATokenNum())) {
      if(this.isOmitWeakAlt(match_instr)) {
        if(this.m_trace != null) {
          this.m_trace.print("Omitting weak alt(match) on ");
          this.m_trace.print("'" + this.getByteCode().getTokenNameUS(match_instr.m_la) + "'");
          this.m_trace.print("(" + match_instr.m_la + ")");
          this.m_trace.print("have: ");
          this.m_trace.print(this.lTok());
          this.m_trace.print("@");
          this.m_trace.println(this.m_current.m_la_index)
        }
        this.returnErrMatch(match_instr);
        return
      }
      var path = new Path(this.m_current.m_PC, this.m_current.m_PC_index, this.m_current.m_BP, this.m_scanner.getActualNUMID(), this.m_scanner.getStateCopy(), this.m_current);
      this.addtoWeakDetPool(0, path);
      this.setGetNextPath();
      return
    }
    if(this.m_recommendation != null) {
      this.m_recommendation.collectMismatch(match_instr.m_la, this.m_byte_code.getTokenNameUS(match_instr.m_la), this.m_byte_code.m_externalizer)
    }
    this.returnErrMatch(match_instr)
  };
  Parser.prototype.setVMProceed = function() {
    this.m_vm_status = VMStatus.PROCEED
  };
  Parser.prototype.match = function(match_instruction_m_la, is_strict) {
    var res = match_instruction_m_la == this.m_current.getPathLATokenNum();
    if(res) {
      if(this.isStrictMatchViolation(is_strict)) {
        return false
      }
      return res
    }else {
      if(this.isCodeCompletionPosition()) {
        if(this.onMatchCollectCompletionSuggestionsOrAbort) {
          return this.onMatchCollectCompletionSuggestionsOrAbort(this.lTok(), match_instruction_m_la, this.m_current, new RNDContext(this.m_current))
        }
      }
    }
    return false
  };
  Parser.prototype.isCodeCompletionPosition = function() {
    return this.m_current.getPathLATokenNum() == this.NUM_ANYKW
  };
  Parser.prototype.isStrictMatchViolation = function(is_strict) {
    return is_strict && this.m_current.getPathLATokenNum() == this.m_scanner.getActualNUMID() && this.isDirtyMatchNone()
  };
  Parser.prototype.vmBindToken = function(match_instr) {
    var var_index = match_instr.m_var_index;
    if(this.m_current.m_BP.getStackframe() != null) {
      if(this.m_current.m_BP.getStackframe().m_tok_base == null || this.m_current.m_BP.getStackframe().m_tok_base.length <= var_index) {
        return
      }
      if(this.m_current.m_BP.getStackframe().m_tok_base == null || this.m_current.m_BP.getStackframe().m_tok_base.length === 0) {
        this.m_current.m_BP.getStackframe().m_tok_base = []
      }
      this.m_current.m_BP.getStackframe().m_tok_base[var_index] = this.m_current.m_la_index
    }
  };
  Parser.prototype.lTok = function() {
    return this.m_scanner.getToken(this.m_current.m_la_index)
  };
  Parser.prototype.isAnyToken = function(X) {
    return X == this.NUM_ANYKW
  };
  Parser.prototype.vmReturn = function() {
    this.addCurrentInstructionToPath();
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.print("<");
      this.m_trace.print(this.m_current.m_BP.getStackframe().m_rule_info.m_name + " ")
    }
    var s = this.m_current.m_BP;
    if(this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE && this.m_current.getRoleDepth() == this.m_current.m_stack_depth) {
      this.m_current.m_active_role = 0;
      this.m_current.setRoleDepth(-1)
    }
    this.m_current.m_stack_depth--;
    if(s.getStackframe() !== null) {
      s.getStackframe().m_save_BP.lock()
    }
    if(this.getParsingPhase() !== Constants.ParsingPhase.COMMIT_PHASE) {
      this.setCurrentPC(s.getStackframe().m_save_PC_index + 1)
    }else {
      this.incrementPC()
    }
    if(s.getStackframe() != null) {
      var last_token_index = s.getStackframe().getLastMatchedTokenIndex();
      this.m_current.m_BP = new FramePtr(s.getStackframe().m_save_BP.getStackframe());
      if(this.m_current.m_BP.getStackframe() != null && this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE) {
        this.m_current.m_BP.getStackframe().setLastTokenIndex(last_token_index)
      }
    }
    if(this.m_trace != null) {
      this.m_trace.print(" returned to ...");
      if(this.m_current.m_BP.getStackframe() != null && this.m_current.m_BP.getStackframe().m_rule_info != null) {
        this.m_trace.println(this.m_current.m_BP.getStackframe().m_rule_info.m_name)
      }
    }
  };
  Parser.prototype.onCommit = function() {
  };
  Parser.prototype.customOnSysCommit = function() {
    return false
  };
  Parser.prototype.addStopInstruction = function() {
    this.m_current.addInstructionIndex(ByteCode.RUNTIME_CREATED_STOP)
  };
  Parser.prototype.commitAndReplay = function() {
    this.m_non_det_pool = [];
    this.m_weak_det_pool = [];
    this.m_erroneous_pool = [];
    this.m_paths_checked = 0;
    this.replay();
    this.m_current.resetMatchInfo();
    this.m_current.m_disable_actions_for_this_path = false
  };
  Parser.prototype.replay = function() {
    this.setParsingPhase(Constants.ParsingPhase.COMMIT_PHASE);
    this.m_current.resetMatchInfo();
    var save_PC = this.m_current.m_PC;
    var save_PC_index = this.m_current.m_PC_index;
    var save_BP = new FramePtr(this.m_current.m_BP.getStackframe());
    if(this.m_trace != null) {
      this.m_trace.println("<REPLAY>");
      this.m_trace.println("Saving (SavedTripel): ");
      this.dotrace(save_PC, save_PC_index, save_BP);
      this.dumpCurrentAndOriginal("Prior restore:")
    }
    this.m_current.restore();
    if(this.m_trace != null) {
      this.dumpCurrentAndOriginal("Restore to:");
      this.dotrace(save_PC, save_PC_index, this.m_current.m_BP)
    }
    this.m_scanner.setState(new ScannerState(this.m_current.m_scanner_state));
    if(this.m_trace != null) {
      this.m_trace.println("<REPLAY>")
    }
    for(var ppp = 0;ppp < this.m_current.m_instructions_indexes.length;ppp++) {
      this.m_current.m_PC_index = this.m_current.m_instructions_indexes[ppp];
      this.m_current.m_PC = this.m_byte_code.instruction(this.m_current.m_PC_index);
      switch(this.m_current.m_PC.m_opcode) {
        case Instruction.OP_MATCH:
          this.vmMatch(this.m_current.m_PC);
          break;
        case Instruction.OP_PUSH_FRAME:
          this.vmPushFrame(this.m_current.m_PC);
          break;
        case Instruction.OP_EXECUTE:
          this.vmExecute(this.m_current.m_PC);
          break;
        case Instruction.OP_RETURN:
          this.vmReturn(this.m_current.m_PC);
          break;
        case Instruction.OP_GOTO:
        ;
        case Instruction.OP_CALL:
        ;
        case Instruction.OP_BRANCH:
        ;
        case Instruction.OP_SET_FLAG:
        ;
        case Instruction.OP_CHECK_FLAG:
          break;
        case Instruction.OP_SYS_CALL:
          this.vmSys();
          break;
        case Instruction.OP_STOP:
          this.storeOnEndofReplay(save_PC, save_PC_index, save_BP);
          this.setParsingPhase(Constants.ParsingPhase.TRY_PHASE);
          return;
        default:
          break
      }
    }
    this.storeOnEndofReplay(save_PC, save_PC_index, save_BP);
    this.doSomeMessedUpWeirdErrorRecovery()
  };
  Parser.prototype.vmSys = function() {
    var sys_instr = this.m_current.m_PC;
    var kind = sys_instr.m_kind;
    if(kind == Syscodes.SYS_COMMIT) {
      this.onCommit();
      if(this.m_parsing_phase === Constants.ParsingPhase.EXPLORE_ON_ERROR) {
        this.pathFailed();
        return
      }
      if(this.customOnSysCommit()) {
        return
      }
      if(this.getParsingPhase() != Constants.ParsingPhase.COMMIT_PHASE) {
        this.addStopInstruction()
      }
      if(this.customOnSysCommit()) {
        return
      }
      if(!this.m_coco_mode || !this.isCodeCompletionPosition() || this.m_non_det_pool.length === 0) {
        if(this.m_trace != null) {
          this.traceindent();
          this.m_trace.println("  vmSys %COMMIT")
        }
        this.commitAndReplay()
      }else {
        if(this.m_trace != null) {
          this.traceindent();
          this.m_trace.println("  vmSys ***SKIP %COMMIT on code completion ****")
        }
      }
    }else {
      if(kind == Syscodes.SYS_CCQUERY || kind == Syscodes.SYS_CCBLOCKEND || kind == Syscodes.SYS_CCIGNORE) {
        this.cocoActions(kind);
        if(this.m_parsing_phase === Constants.ParsingPhase.EXPLORE_ON_ERROR && this.m_failure_la == this.m_current.m_la_index) {
          if(this.m_trace != null) {
            this.traceindent();
            this.m_trace.print("  vm_SYS_CALL SYS_IGNORE PC=").print(this.m_byte_code.getLref(this.m_current.m_PC_index)).print("@").println(this.m_current.m_la_index)
          }
          this.pathFailed();
          return
        }
      }else {
        if(kind == Syscodes.SYS_NOCHAINSTMT) {
          this.addCurrentInstructionToPath();
          this.m_scanner.execScannerOpcode(Syscodes.SYS_NOCHAINSTMT)
        }
      }
    }
    this.incrementPC()
  };
  Parser.prototype.cocoActions = function() {
  };
  Parser.prototype.vmClassifyToken = function(match_instr) {
    if(this.m_parsing_phase === Constants.ParsingPhase.EXPLORE_ON_ERROR) {
      return
    }
    this.onVmClassifyToken(match_instr)
  };
  Parser.prototype.onVmClassifyToken = function(match_instr) {
    this.vmClassifyTokenStrictIsAlsoCut(match_instr)
  };
  Parser.prototype.vmClassifyTokenStrictIsAlsoCut = function(match_instr) {
    var tok = this.lTok();
    if(this.m_parsing_phase === Constants.ParsingPhase.COMMIT_PHASE && match_instr.m_cat !== 0) {
      tok.m_category = Category.forValue(match_instr.m_cat);
      return
    }
    switch(tok.m_category) {
      case Category.CAT_MAYBE_KEYWORD:
        if(match_instr.m_la == this.m_scanner.getActualNUMID()) {
          if(this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE) {
            tok.m_category = Category.CAT_IDENTIFIER
          }
        }else {
          if(match_instr.m_cat === 0) {
            this.m_current.m_last_known_keyword = this.m_current.m_la_index;
            this.m_current.m_last_proper_match = this.m_current.m_la_index;
            this.m_current.m_suspicious_matches = 0;
            tok.m_category = match_instr.m_is_strict ? Category.CAT_STRICT_KEYWORD : Category.CAT_KEYWORD;
            tok.m_suspicious_candidate = true
          }else {
            tok.m_suspicious_candidate = true
          }
        }
        break;
      case Category.CAT_KEYWORD:
        if(match_instr.m_la == this.m_scanner.getActualNUMID()) {
          if(this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE) {
            tok.m_err_state = ErrorState.Suspicious;
            tok.m_category = Category.CAT_IDENTIFIER;
            if(this.TRACING_ENABLED) {
              var line = tok.m_line + "." + tok.m_column + ":suspicious token '" + tok.m_lexem + "'.";
              this.trace(line)
            }
          }
          this.m_current.m_suspicious_matches++
        }else {
          this.m_current.m_last_known_keyword = this.m_current.m_la_index;
          this.m_current.m_last_proper_match = this.m_current.m_la_index;
          this.m_current.m_suspicious_matches = 0
        }
        break;
      case Category.CAT_LITERAL:
      ;
      case Category.CAT_OPERATOR:
      ;
      case Category.CAT_TOKEN_OPERATOR:
      ;
      case Category.CAT_STRICT_KEYWORD:
        this.m_current.m_last_known_keyword = this.m_current.m_la_index;
        this.m_current.m_last_proper_match = this.m_current.m_la_index;
        this.m_current.m_suspicious_matches = 0;
        break;
      case Category.CAT_IDENTIFIER:
        this.m_current.m_last_proper_match = this.m_current.m_la_index;
        break;
      default:
        break
    }
  };
  Parser.prototype.vmClassifyTokenStrictIsOnlyStrict = function(match_instr) {
    var tok = this.lTok();
    if(this.m_parsing_phase === Constants.ParsingPhase.COMMIT_PHASE && match_instr.m_cat !== 0) {
      tok.m_category = Category.forValue(match_instr.m_cat);
      return
    }
    switch(tok.m_category) {
      case Category.CAT_MAYBE_KEYWORD:
        if(match_instr.m_la == this.m_scanner.getActualNUMID()) {
          if(this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE) {
            tok.m_category = Category.CAT_IDENTIFIER;
            if(tok.m_suspicious_candidate === true) {
              tok.m_err_state = ErrorState.Suspicious;
              if(this.TRACING_ENABLED) {
                var line = tok.m_line + "." + tok.m_column + ":suspicious token '" + tok.m_lexem + "'.";
                this.trace(line)
              }
              this.m_current.m_suspicious_matches++
            }
          }
        }else {
          if(match_instr.m_cat === 0) {
            this.m_current.m_last_known_keyword = this.m_current.m_la_index;
            this.m_current.m_last_proper_match = this.m_current.m_la_index;
            this.m_current.m_suspicious_matches = 0;
            tok.m_suspicious_candidate = true;
            if(this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE) {
              tok.m_category = match_instr.m_is_strict ? Category.CAT_STRICT_KEYWORD : Category.CAT_KEYWORD
            }
          }
        }
        break;
      case Category.CAT_KEYWORD:
      ;
      case Category.CAT_LITERAL:
      ;
      case Category.CAT_OPERATOR:
      ;
      case Category.CAT_TOKEN_OPERATOR:
      ;
      case Category.CAT_STRICT_KEYWORD:
        this.m_current.m_last_known_keyword = this.m_current.m_la_index;
        this.m_current.m_last_proper_match = this.m_current.m_la_index;
        this.m_current.m_suspicious_matches = 0;
        break;
      case Category.CAT_IDENTIFIER:
        this.m_current.m_last_proper_match = this.m_current.m_la_index;
        break;
      default:
        break
    }
  };
  Parser.prototype.maxSuspiciousMatchesExceeded = function() {
    return!this.m_infiniteSuspiciousMatches && this.m_current.m_suspicious_matches >= this.MAX_SUSPICIOUS_MATCHES
  };
  Parser.prototype.trace = function(line) {
    this.traceResult.append(line + "\r\n")
  };
  Parser.prototype.addAllPathsOfBranch = function(branch_instr) {
    var alt_count = branch_instr.m_alt_count;
    var pos = 0;
    var prev_addrs = [];
    var viable_non_det_alts = 0;
    while(pos < alt_count) {
      var pred_instr = this.getByteCode().instruction(this.m_current.m_PC_index + pos);
      var new_addr = pos + pred_instr.m_rel_offset;
      if(Utils.arrayContains(prev_addrs, new_addr) === false) {
        viable_non_det_alts++;
        this.addNonDetPath(this.getByteCode().instruction(this.m_current.m_PC_index + new_addr), this.m_current.m_PC_index + new_addr, this.m_current.m_BP);
        prev_addrs.push(new_addr)
      }
      pos++
    }
    if(viable_non_det_alts <= 0) {
      return false
    }
    this.m_vm_status = VMStatus.GET_NEXT_PATH;
    return true
  };
  function PredIterator(index) {
    this.m_instrIndex = index
  }
  PredIterator.prototype.assign_iterator = function(rhs) {
    this.m_instrIndex = rhs.m_instrIndex
  };
  PredIterator.prototype.assign_index = function(rhsIndex) {
    this.m_instrIndex = rhsIndex
  };
  PredIterator.prototype.thisPredInstruction = function(bc) {
    return bc.instruction(this.m_instrIndex)
  };
  PredIterator.prototype.isLessThan = function(other) {
    return this.m_instrIndex < other.m_instrIndex
  };
  PredIterator.prototype.increment = function(relative_offset) {
    this.m_instrIndex += relative_offset
  };
  PredIterator.prototype.minus = function(other) {
    return this.m_instrIndex - other.m_instrIndex
  };
  PredIterator.prototype.targetIndex = function(bc) {
    return this.m_instrIndex + bc.instruction(this.m_instrIndex).m_rel_offset
  };
  PredIterator.prototype.target = function(bc) {
    return bc.instruction(this.m_instrIndex + bc.instruction(this.m_instrIndex).m_rel_offset)
  };
  Parser.prototype.getInterestingPredRange = function(first, last, branchInstrIndex, branch_instruction, la) {
    var firstIndex = branchInstrIndex + 1;
    var lastIndex = firstIndex + branch_instruction.m_alt_count;
    firstIndex = this.lowerBound(firstIndex, lastIndex, la);
    first.assign_index(firstIndex);
    firstIndex = this.upperBound(firstIndex, lastIndex, la);
    last.assign_index(firstIndex)
  };
  Parser.prototype.lowerBound = function(firstIndex, lastIndex, la) {
    var len = lastIndex - firstIndex;
    while(len > 0) {
      var half = Math.floor(len / 2);
      var middleIndex = firstIndex;
      middleIndex += half;
      if(this.compareLa(middleIndex, la)) {
        firstIndex = middleIndex;
        ++firstIndex;
        len = len - half - 1
      }else {
        len = half
      }
    }
    return firstIndex
  };
  Parser.prototype.upperBound = function(firstIndex, lastIndex, la) {
    var len = lastIndex - firstIndex;
    while(len > 0) {
      var half = Math.floor(len / 2);
      var middleIndex = firstIndex;
      middleIndex += half;
      if(this.compareLaUpper(middleIndex, la)) {
        len = half
      }else {
        firstIndex = middleIndex;
        ++firstIndex;
        len = len - half - 1
      }
    }
    return firstIndex
  };
  Parser.prototype.compareLa = function(instrIndex, la) {
    var instr = this.m_byte_code.instruction(instrIndex);
    if(instr.m_opcode != Instruction.OP_PRED) {
      return false
    }
    return instr.m_la < la
  };
  Parser.prototype.compareLaUpper = function(instrIndex, la) {
    var instr = this.m_byte_code.instruction(instrIndex);
    if(instr.m_opcode != Instruction.OP_PRED) {
      return false
    }
    return la < instr.m_la
  };
  function MutableBool() {
    this.m_value = false
  }
  MutableBool.prototype.setValue = function(value) {
    this.m_value = value
  };
  MutableBool.prototype.isTrue = function() {
    return this.m_value
  };
  Parser.prototype.cloneCurrentFrameInternalSimple = function() {
    if(this.m_current.m_BP == null) {
      return null
    }
    var sfToClone = this.m_current.m_BP.getStackframe();
    var localBase = sfToClone != null ? sfToClone.m_local_base : null;
    return new FramePtr(new Stackframe(sfToClone, localBase))
  };
  Parser.prototype.cloneCurrentFrameInternal = function(forced) {
    if(this.m_current.m_BP == null) {
      return null
    }
    var sfToClone = this.m_current.m_BP.getStackframe();
    var localBase = sfToClone != null ? sfToClone.m_local_base : null;
    if(forced && (sfToClone == null || sfToClone.isUserFrame() === false)) {
      forced = false
    }
    if(forced === false && this.m_errorRecoveryHook === null) {
      return new FramePtr(new Stackframe(this.m_current.m_BP.getStackframe(), localBase))
    }
    var clonedBP = null;
    var backupCurrentBP = this.m_current.m_BP;
    try {
      if(sfToClone == null) {
        return new FramePtr(new Stackframe(sfToClone, null))
      }
      if(this.m_trace != null) {
        this.traceindent();
        this.m_trace.println("Deep Cloning erroneous stack frame " + this.m_current.m_BP)
      }
      var rui = sfToClone.getRuleInfo();
      var idf = sfToClone.getFactoryId();
      this.m_current.m_BP = new FramePtr(sfToClone.getParent());
      clonedBP = this.createFrameInternal(idf, rui);
      clonedBP.ptr().cloneAttributes(sfToClone)
    }finally {
      this.m_current.m_BP = backupCurrentBP
    }
    return clonedBP
  };
  Parser.prototype.cloneStackframePriv = function(original) {
    var flag_count = original.ptr().m_rule_info.m_flag_count;
    if(flag_count === 0) {
      return original
    }
    return this.cloneCurrentFrameInternal(true)
  };
  Parser.prototype.branch = function(first, end, had_a_strict_match) {
    var branch_to_consider_count = end.minus(first);
    if(branch_to_consider_count === 0) {
      return 0
    }else {
      if(branch_to_consider_count === 1) {
        if(this.m_trace != null) {
          this.traceindent();
          this.m_trace.println("  continue at " + this.m_byte_code.getLref(first.targetIndex(this.m_byte_code)))
        }
        if(first.thisPredInstruction(this.m_byte_code).m_is_strict) {
          had_a_strict_match.setValue(true)
        }
        this.setCurrentPC(first.targetIndex(this.m_byte_code));
        return 1
      }
    }
    var addr_list = [];
    for(var i = first;i.isLessThan(end);i.increment(1)) {
      var targetIndexToAdd = i.targetIndex(this.m_byte_code);
      if(addr_list.indexOf(targetIndexToAdd) === -1) {
        if(i.thisPredInstruction(this.m_byte_code).m_is_strict) {
          had_a_strict_match.setValue(true)
        }
        addr_list.push(targetIndexToAdd)
      }
    }
    var branch_to_take_count = addr_list.length;
    if(branch_to_take_count === 0) {
      return 0
    }
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.println("  continue at " + this.m_byte_code.getLref(addr_list[branch_to_take_count - 1]))
    }
    this.setCurrentPC(addr_list.pop());
    for(var x = 0, xlen = addr_list.length;x < xlen;++x) {
      var addr = addr_list[x];
      this.addNonDetPath(this.m_byte_code.instruction(addr), addr, this.cloneStackframePriv(this.m_current.m_BP))
    }
    return branch_to_take_count
  };
  Parser.prototype.branchWeak = function(first, end, ignore_strict_matches) {
    var addr_stack = [];
    for(var i = first;i.isLessThan(end);i.increment(1)) {
      var targetX = i.targetIndex(this.m_byte_code);
      if(addr_stack.indexOf(targetX) === -1) {
        if(ignore_strict_matches && i.thisPredInstruction(this.m_byte_code).m_is_strict) {
          continue
        }
        addr_stack.push(targetX)
      }
    }
    var branch_count = addr_stack.length;
    if(branch_count === 0) {
      return 0
    }
    while(addr_stack.length !== 0) {
      var addr = addr_stack.pop();
      var pp = new Path(this.m_byte_code.instruction(addr), addr, this.cloneStackframePriv(this.m_current.m_BP), this.m_scanner.getActualNUMID(), this.m_scanner.getStateCopy(), this.m_current);
      this.m_weak_det_pool.push(pp);
      if(this.m_trace != null) {
        this.traceindent();
        this.m_trace.println("  add weakDetPath #" + pp + " PC=" + addr + "@" + this.m_current.m_la_index)
      }
    }
    return branch_count
  };
  Parser.prototype.vmBranch = function(branch_instr) {
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.print("  vm_BRANCH on ");
      this.m_trace.print(this.lTok());
      this.m_trace.print("@");
      this.m_trace.print(this.m_current.m_la_index);
      this.m_trace.println(" " + this.getByteCode().getLref(this.m_current.m_PC_index))
    }
    if(this.m_branchHook != null) {
      var res = this.m_branchHook.invoke(this.m_processorDelegate);
      switch(res) {
        case HookResult.STOP:
          this.setVMStopped();
          return;
        case HookResult.PATHFAILED:
          this.setPathFailed();
          return;
        case HookResult.DONE:
          return;
        case HookResult.NORMAL:
          break;
        default:
          throw"Error recovery may not return PATHFAILED!";
      }
    }
    if(this.forcePathFailureInBranch(this.m_current)) {
      this.setPathFailed();
      return
    }
    var branch_instrIndex = this.m_current.m_PC_index;
    var has_non_strict_id = branch_instr.m_has_non_strict_id;
    var has_id = branch_instr.m_has_id;
    var have_anykw = this.m_current.getPathLATokenNum() == this.NUM_ANYKW;
    var have_error_token = this.m_failure_la === this.m_current.m_la_index && this.m_parsing_phase === Constants.ParsingPhase.EXPLORE_ON_ERROR;
    var current_la_num = this.m_current.getPathLATokenNum();
    var viable_non_det_alts = 0;
    var viable_weak_det_alts = 0;
    if(have_anykw || have_error_token) {
      this.incrementPC();
      this.addAllPathsOfBranch(branch_instr)
    }else {
      var first = new PredIterator(0);
      var end = new PredIterator(0);
      this.getInterestingPredRange(first, end, branch_instrIndex, branch_instr, current_la_num);
      var had_a_strict_match = new MutableBool;
      viable_non_det_alts = this.branch(first, end, had_a_strict_match);
      if(current_la_num > this.m_scanner.getActualNUMID() && (has_non_strict_id || has_id && viable_non_det_alts === 0)) {
        if(had_a_strict_match.isTrue()) {
          if(this.m_trace != null) {
            this.traceindent();
            this.m_trace.print("  Omitting weak alt due to strict match");
            this.m_trace.print(this.getByteCode().getLref(this.m_current.m_PC_index));
            this.m_trace.print("@");
            this.m_trace.println(this.m_current.m_la_index)
          }
        }else {
          if(!this.maxSuspiciousMatchesExceeded() || viable_non_det_alts === 0) {
            this.getInterestingPredRange(first, end, branch_instrIndex, branch_instr, this.m_scanner.getActualNUMID());
            var ignore_strict_matches = viable_non_det_alts > 0;
            viable_weak_det_alts = this.branchWeak(first, end, ignore_strict_matches)
          }else {
            if(this.m_trace != null) {
              this.traceindent();
              this.m_trace.println("  Omitting path because suspicious matches reached maximum.\n")
            }
          }
        }
      }
      if(viable_non_det_alts + viable_weak_det_alts > 0) {
        if(viable_non_det_alts === 0) {
          this.setGetNextPath()
        }
        return
      }
      this.returnBranchErr()
    }
  };
  Parser.prototype.setBranchHook = function(hook) {
    this.m_branchHook = hook
  };
  Parser.prototype.setMatchHook = function(hook) {
    this.m_matchHook = hook
  };
  Parser.prototype.setPathsExhaustedHook = function(hook) {
    this.m_pathsExhaustedHook = hook
  };
  Parser.prototype.setErrorRecoveryHook = function(hook) {
    this.m_errorRecoveryHook = hook
  };
  Parser.prototype.createAst = function() {
  };
  Parser.prototype.addNonDetPath = function(new_PC, new_PC_index, new_BP) {
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.print("  add nonDetPath PC=");
      this.m_trace.print(this.getByteCode().getLref(new_PC_index));
      this.m_trace.print("@");
      this.m_trace.println(this.m_current.m_la_index)
    }
    var newPath = new Path(new_PC, new_PC_index, new_BP, this.m_current.getPathLATokenNum(), this.m_scanner.getStateDirect(), this.m_current);
    this.m_non_det_pool.push(newPath)
  };
  Parser.prototype.addtoWeakDetPool = function(insert_pos, pth) {
    this.m_weak_det_pool.push(pth);
    return
  };
  Parser.prototype.vmPush = function(frame_num, rule_info) {
    this.m_current.m_BP = this.createFrameInternal(frame_num, rule_info);
    this.m_current.m_BP.getStackframe().setFactoryId(frame_num);
    this.onRuleEntry()
  };
  Parser.prototype.createFrameInternal = function(frame_num, rule_info) {
    if(this.m_skip_actions || this.m_parsing_phase === Constants.ParsingPhase.EXPLORE_ON_ERROR) {
      return new FramePtr(new Stackframe(this.m_current.m_BP.getStackframe(), rule_info, {}))
    }else {
      return this.createFrame(frame_num, rule_info)
    }
  };
  Parser.prototype.createFrame = function(frame_num, rule_info) {
    return new FramePtr(new Stackframe(this.m_current.m_BP.getStackframe(), rule_info, {}))
  };
  Parser.prototype.vmCall = function(call_instr) {
    this.m_current.m_BP.getStackframe().m_save_PC = this.m_current.m_PC;
    this.m_current.m_BP.getStackframe().m_save_PC_index = this.m_current.m_PC_index;
    this.setCurrentPC(call_instr.m_entry_point)
  };
  Parser.prototype.incrementPCdelta = function(delta) {
    this.m_current.m_PC_index += delta;
    this.alignPCwithIndex()
  };
  Parser.prototype.incrementPC = function() {
    this.incrementPCdelta(1)
  };
  Parser.prototype.onRuleEntry = function() {
    if(this.isAnyToken(this.m_current.getPathLATokenNum())) {
      this.m_current.m_BP.getStackframe().setEnteredForCompletion(true)
    }
  };
  Parser.prototype.proceedDirect = function(instruction_index, new_BP) {
    this.m_current.m_BP = new_BP;
    this.setCurrentPC(instruction_index);
    this.m_current.m_scanner_state = new ScannerState(this.m_scanner.getStateDirect());
    this.m_current.m_err_count = 0;
    this.m_vm_status = VMStatus.PROCEED
  };
  Parser.prototype.vmExecute = function(exe_instr) {
    if(!this.m_current.m_disable_actions_for_this_path) {
      this.addCurrentInstructionToPath();
      if(!this.m_skip_actions) {
        if(this.m_trace != null) {
          this.traceindent();
          this.m_trace.print("  vm_EXECUTE on ");
          this.m_trace.print(this.lTok());
          this.m_trace.print("@");
          this.m_trace.print(this.m_current.m_la_index);
          this.m_trace.println(" " + this.getByteCode().getLref(this.m_current.m_PC_index))
        }
        var action_num = exe_instr.m_action_num;
        if(exe_instr.m_is_immediate !== false || this.m_parsing_phase == Constants.ParsingPhase.COMMIT_PHASE) {
          this.m_current.m_BP.getStackframe().performAction(action_num, this)
        }
      }
    }
    this.incrementPC()
  };
  Parser.prototype.vmGoto = function(goto_instr) {
    this.incrementPCdelta(goto_instr.m_rel_offset)
  };
  Parser.prototype.getParsingPhase = function() {
    return this.m_parsing_phase
  };
  Parser.prototype.addCurrentInstructionToPath = function() {
    if(this.getParsingPhase() != Constants.ParsingPhase.COMMIT_PHASE) {
      if(this.mExplicitMetricsCached) {
        this.m_current.addInstruction(this.m_current.m_PC, this.m_current.m_PC_index, this.m_current.m_PC.isMatchInstruction() && this.m_current.m_PC.m_la == this.getTokenIndexResolver().getActualNUMID())
      }else {
        this.m_current.addInstruction(this.m_current.m_PC, this.m_current.m_PC_index)
      }
    }
  };
  Parser.prototype.vmPushFrame = function(pushf_instr) {
    this.addCurrentInstructionToPath();
    var rule_info = this.m_byte_code.ruleInfo(pushf_instr.m_rule_num);
    var last_token_index = -1;
    if(this.m_current.m_BP != null && this.m_current.m_BP.ptr() != null) {
      last_token_index = this.m_current.m_BP.getStackframe().getLastMatchedTokenIndex()
    }
    this.vmPush(pushf_instr.m_frame_num, rule_info);
    this.m_current.m_stack_depth++;
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.println("Push " + rule_info.m_name)
    }
    if(this.getParsingPhase() == Constants.ParsingPhase.COMMIT_PHASE && this.m_current.m_active_role === 0 && rule_info.m_role !== 0) {
      this.m_current.m_active_role = rule_info.m_role;
      this.m_current.setRoleDepth(this.m_current.m_stack_depth)
    }
    this.incrementPC();
    if(this.m_current.m_BP.ptr() != null) {
      this.m_current.m_BP.ptr().setFirstTokenIndex(this.m_current.m_la_index);
      this.m_current.m_BP.ptr().setLastTokenIndex(last_token_index)
    }
  };
  Parser.prototype.runWithHalted = function(haltedParam, HALTED_INTERVALParam) {
    this.halted_counter = 0;
    this.m_paths_checked = 0;
    this.halted = haltedParam;
    if(HALTED_INTERVALParam !== 0) {
      this.HALTED_INTERVAL = HALTED_INTERVALParam
    }
    return this.runInternal()
  };
  Parser.prototype.runInternal = function() {
    this.m_instructions_processed = 0;
    this.m_la_index_max = 0;
    var run_completed = true;
    this.m_flag_check_error = false;
    this.m_failure_la = -1;
    this.m_recommendation = this.m_error_quality == Constants.ErrorQuality.COCO ? new TokenRecommendations(this.m_trace, true) : null;
    this.m_vm_status = VMStatus.PROCEED;
    while(this.m_vm_status != VMStatus.STOPPED) {
      if(this.checkForHalt()) {
        return false
      }
      this.m_global_counter++;
      this.m_instructions_processed++;
      switch(this.m_vm_status) {
        case VMStatus.PROCEED:
          switch(this.m_current.m_PC.m_opcode) {
            case Instruction.OP_MATCH:
              this.vmMatch(this.m_current.m_PC);
              break;
            case Instruction.OP_PUSH_FRAME:
              this.vmPushFrame(this.m_current.m_PC);
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
              break
          }
          break;
        case VMStatus.PATH_FAILED:
          this.pathFailed();
        case VMStatus.GET_NEXT_PATH:
          if(!this.getNextPath()) {
            run_completed = false
          }
          break;
        default:
          break
      }
    }
    this.m_current.m_BP.dispose();
    this.m_current.m_BP_original.dispose();
    this.clearPathRetainCompletions();
    return run_completed
  };
  Parser.prototype.vmCheck = function(check_instr) {
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.print("   check PC=");
      this.m_trace.print(this.m_byte_code.getLref(this.m_current.m_PC_index));
      this.m_trace.print(" ");
      this.m_trace.print(this.lTok());
      this.m_trace.print("@");
      this.m_trace.print(this.m_current.m_la_index);
      this.m_trace.print(this.m_current.m_BP.getStackframe());
      this.m_trace.print(" flagidx:");
      this.m_trace.print(check_instr.m_flag_index);
      this.m_trace.print(" val:");
      this.m_trace.print(check_instr.m_val)
    }
    if(this.m_current.m_BP.getStackframe().m_flag_base[check_instr.m_flag_index] != this.toBoolean(check_instr.m_val)) {
      if(this.m_trace != null) {
        this.m_trace.println("   failed!")
      }
      this.m_flag_check_error = true;
      this.setPathFailed();
      return
    }
    if(this.m_trace != null) {
      this.m_trace.println("  ok!")
    }
    this.incrementPC()
  };
  Parser.prototype.toBoolean = function(m_val) {
    return m_val !== 0
  };
  Parser.prototype.vmSet = function(set_instr) {
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.print("  set flag PC=");
      this.m_trace.print(this.m_byte_code.getLref(this.m_current.m_PC_index));
      this.m_trace.print(" ");
      this.m_trace.print(this.lTok());
      this.m_trace.print("@");
      this.m_trace.print(this.m_current.m_la_index);
      this.m_trace.print(this.m_current.m_BP.getStackframe());
      this.m_trace.print(" flagidx:");
      this.m_trace.print(set_instr.m_flag_index);
      this.m_trace.print(" val:");
      this.m_trace.println(set_instr.m_val)
    }
    this.m_current.m_BP.getStackframe().m_flag_base[set_instr.m_flag_index] = this.toBoolean(set_instr.m_val);
    this.incrementPC()
  };
  Parser.prototype.vmStop = function() {
    if(this.getParsingPhase() == Constants.ParsingPhase.TRY_PHASE) {
      this.addCurrentInstructionToPath()
    }
    switch(this.m_current.getPathLATokenNum()) {
      case this.NUM_EOF:
        this.commitAndReplay();
        this.m_vm_status = VMStatus.STOPPED;
        break;
      default:
        this.setPathFailed();
        break
    }
  };
  Parser.prototype.getNextPath = function() {
    this.m_flag_check_error = false;
    if(this.hasMorePaths()) {
      return this.setToNextPath()
    }else {
      if(this.m_hit_completion_pos) {
        this.discardPath(this.m_current);
        this.setVMStopped()
      }else {
        if(this.m_parsing_phase == Constants.ParsingPhase.EXPLORE_ON_ERROR) {
          this.setVMStopped();
          return false
        }else {
          if(this.m_pathsExhaustedHook != null) {
            var res = this.m_pathsExhaustedHook.invoke();
            switch(res) {
              case HookResult.DONE:
                return false;
              case HookResult.NORMAL:
                return this.pathsExhausted();
              case HookResult.PATHFAILED:
                throw"No PATHFAILED in pathsExhaustedHook";;
              case HookResult.STOP:
                return false;
              default:
                throw"Paths recovery may not return this result!";
            }
          }
          return this.pathsExhausted()
        }
      }
    }
    return true
  };
  Parser.prototype.hasMorePaths = function() {
    if(this.maxPathCheckedError()) {
      this.m_non_det_pool = [];
      this.m_weak_det_pool = [];
      this.m_paths_checked = 1;
      return false
    }
    return this.m_non_det_pool.length !== 0 || this.m_weak_det_pool.length !== 0
  };
  Parser.prototype.setToNextPath = function() {
    this.m_vm_status = VMStatus.STOPPED;
    if(this.maxPathCheckedError()) {
      return false
    }
    if(this.m_non_det_pool.length !== 0) {
      this.m_current = this.m_non_det_pool[this.m_non_det_pool.length - 1];
      this.m_non_det_pool.splice(this.m_non_det_pool.length - 1, 1);
      if(this.m_trace != null) {
        if(this.m_trace != null) {
          this.traceindent();
          this.m_trace.print("  get nonDetPath #" + this.m_non_det_pool.length + "/" + this.m_weak_det_pool.length + " PC=");
          this.m_trace.print(this.getByteCode().getLref(this.m_current.m_PC_index));
          this.m_trace.print("@");
          this.m_trace.println(this.m_current.m_la_index);
          this.m_trace.print(this.m_current.toLongString(this.m_byte_code))
        }
      }
    }else {
      this.m_current = this.m_weak_det_pool[0];
      this.m_weak_det_pool.splice(0, 1);
      if(this.m_trace != null) {
        this.traceindent();
        this.m_trace.print("  get weakDetPath #" + this.m_non_det_pool.length + "/" + this.m_weak_det_pool.length + " PC=");
        this.m_trace.print(this.m_byte_code.getLref(this.m_current.m_PC_index));
        this.m_trace.print("@");
        this.m_trace.println(this.m_current.m_la_index);
        this.m_trace.print(this.m_current.m_BP.getStackframe());
        this.m_trace.print(this.m_current.toLongString(this.m_byte_code))
      }
    }
    this.m_scanner.setState(this.m_current.m_scanner_state);
    if(this.isCoCoMode()) {
      this.m_current.m_BP.forceInc();
      this.m_current.m_BP.forceInc()
    }
    this.m_current.m_BP.lock();
    this.m_vm_status = VMStatus.PROCEED;
    return true
  };
  Parser.prototype.isCoCoMode = function() {
    return this.m_coco_mode
  };
  Parser.prototype.returnBranchErr = function() {
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.print("  branch failed at ");
      this.m_trace.print(this.lTok());
      this.m_trace.print("@");
      this.m_trace.print(this.m_current.m_la_index);
      this.m_trace.print("\n");
      this.traceindent();
      this.m_trace.println("<---------------------------")
    }
    this.setPathFailed()
  };
  Parser.prototype.maxPathCheckedError = function() {
    if(++this.m_paths_checked > this.MAX_PATHS_CHECKED) {
      if(this.m_trace != null) {
        this.traceindent();
        this.m_trace.print("  Abort due to max_path_checked");
        this.m_trace.println(this.MAX_PATHS_CHECKED)
      }
      return true
    }
    return false
  };
  Parser.prototype.pathsExhausted = function() {
    if(this.m_trace != null) {
      this.m_trace.println("<REPLAY_erroneous_path>")
    }
    this.replayBestInterpretation();
    if(this.m_trace != null) {
      this.m_trace.println("</REPLAY_erroneous_path>")
    }
    if(this.m_current.m_la_index > this.getLastSyncPoint()) {
      this.setLastSyncPoint(this.m_current.m_la_index);
      var tok = this.lTok();
      tok.m_err_state = ErrorState.Erroneous;
      this.recordTokenError(this.m_current, tok);
      this.trace("(" + tok.m_line + "." + tok.m_column + "): error: " + (this.m_recommendation ? this.m_recommendation.buildMessage(tok.m_lexem).toString(this.getByteCode().m_externalizer) : 'Unexpected token "' + tok.m_lexem + '"'))
    }
    var rc = this.recoverOnErrClearingStackAndCurrentPathAdjustingScannerPosition();
    if(this.m_recommendation) {
      this.m_recommendation.clear()
    }
    return rc
  };
  Parser.prototype.discardPath = function(p) {
    p.m_BP.dispose();
    p.m_BP_original.dispose()
  };
  Parser.prototype.replayBestInterpretation = function() {
    var path = this.m_current;
    if(this.m_erroneous_pool.length !== 0) {
      if(!this.m_coco_mode && this.m_recommendation && this.m_failure_la == -1) {
        this.findMoreReplacementProposals()
      }
      path = this.m_erroneous_pool.pop()
    }
    if(path != this.m_current) {
      this.discardPath(this.m_current);
      this.m_current = path;
      this.m_current.m_disable_actions_for_this_path = this.isActionDisabledDuringErrorReplay;
      this.m_scanner.setState(this.m_current.m_scanner_state.clone());
      this.m_erroneous_pool = []
    }
    this.replay();
    this.m_current.resetMatchInfo()
  };
  Parser.prototype.doSomeMessedUpWeirdErrorRecovery = function() {
  };
  Parser.prototype.getLastSyncPoint = function() {
    return this.m_last_syncpoint
  };
  Parser.prototype.recordTokenError = function() {
  };
  Parser.prototype.printInput = function(verbose) {
    var result = "<TOKENS>";
    var tokens = this.m_scanner.getInput();
    for(var i = 0;i < tokens.length;++i) {
      var tok = tokens[i];
      result += tok.m_lexem + "[";
      switch(tok.m_err_state) {
        case ErrorState.Erroneous:
          result += "!";
          break;
        case ErrorState.Suspicious:
          result += "%";
          break;
        case ErrorState.Unknown:
          result += "?";
          break;
        case ErrorState.Correct:
        ;
        case ErrorState.Reinterpretation:
          break
      }
      result += tok.m_category.toString() + "/";
      if(verbose) {
        result += String(tok.m_num) + "="
      }
      result += this.getByteCode().getTokenNameUS(tok.m_num);
      if(tok.m_role !== 0) {
        result += "/" + String(tok.m_role)
      }
      result += "] "
    }
    result += "</TOKENS>";
    return result
  };
  Parser.prototype.setErrorQuality = function(quality) {
    this.m_error_quality = quality
  };
  Parser.prototype.setRNDRunFlags = function(runFlags) {
    this.m_coco_mode = runFlags.isCoCoMode();
    this.m_skip_actions = runFlags.skipActions()
  };
  Parser.prototype.recoverOnErrClearingStackAndCurrentPathAdjustingScannerPosition = function() {
    if(this.m_errorRecoveryHook != null) {
      var res = this.m_errorRecoveryHook.invoke();
      switch(res) {
        case HookResult.DONE:
          return true;
        case HookResult.PATHFAILED:
          throw"Error recovery may not return PATHFAILED!";;
        case HookResult.STOP:
          this.setVMStopped();
          return!this.m_return_false_on_err;
        case HookResult.NORMAL:
          break;
        default:
          throw"Error recovery may not return PATHFAILED!";
      }
    }
    if(this.m_current.m_BP != null) {
      if(this.m_resync) {
        var level = 0;
        while(this.m_current.getPathLATokenNum() != this.NUM_EOF && (this.m_current.getPathLATokenNum() == this.m_scanner.getActualNUMID() || (level = this.determineStackLevelsToPopViaByFollowSet(this.m_current.m_BP.getStackframe(), this.m_current.getPathLATokenNum())) === 0)) {
          this.skipToken()
        }
        if(this.m_current.getPathLATokenNum() == this.NUM_EOF) {
          this.m_vm_status = VMStatus.STOPPED
        }else {
          this.m_vm_status = VMStatus.PROCEED;
          for(var i = 0;i < level;i++) {
            this.returnFromOneStackframe()
          }
        }
      }else {
        this.m_current.storeCurrentPositionAsOriginClearingInstructions(this.m_scanner.getStateCopy());
        this.setVMStopped();
        return!this.m_return_false_on_err
      }
    }else {
      if(this.m_resync) {
        var skipped_anything = false;
        while(this.m_current.getPathLATokenNum() != this.NUM_EOF && this.canSkipTokenOnErrRecovery()) {
          skipped_anything = true;
          this.skipToken()
        }
        this.m_vm_status = skipped_anything ? VMStatus.PROCEED : VMStatus.STOPPED
      }else {
        this.m_current.storeCurrentPositionAsOriginClearingInstructions(this.m_scanner.getStateCopy());
        this.setVMStopped();
        return!this.m_return_false_on_err
      }
    }
    this.m_current.storeCurrentPositionAsOriginClearingInstructions(this.m_scanner.getStateCopy());
    return true
  };
  Parser.prototype.returnFromOneStackframe = function() {
    this.m_vm_status = VMStatus.PROCEED;
    this.m_current.m_PC_index = ByteCode.RUNTIME_CREATED_RETURN;
    this.alignPCwithIndex();
    this.vmReturn(this.m_current.m_PC)
  };
  Parser.prototype.determineStackLevelsToPopViaByFollowSet = function(stackframe, num) {
    var level = 0;
    while(stackframe != null) {
      if(stackframe.getRuleInfo() == null) {
        return level
      }
      level++;
      if(stackframe.getRuleInfo().m_follow_set.indexOf(num) !== -1) {
        return level
      }
      stackframe = stackframe.getParent()
    }
    return 0
  };
  Parser.prototype.clearPathAndCompletions = function() {
    this.clearPathRetainCompletions();
    this.m_completionPaths = []
  };
  Parser.prototype.setInput = function(str, startPos, cursorPos, tag) {
    this.m_scanner.setInput(str + "\x00", startPos, cursorPos);
    this.resetInput();
    this.onResetInput();
    if(tag != null) {
      this.m_block_end_tag = tag.toUpperCase()
    }
  };
  Parser.prototype.nextToken = function() {
    if(!this.m_scanner.hasMoreToken()) {
      this.m_current.setPathLATokenNum(this.NUM_EOF);
      return false
    }
    var tok_index = this.m_scanner.getNextToken(0);
    var token = this.m_scanner.getToken(tok_index);
    if(token == null) {
      return false
    }
    this.m_current.m_la_index = tok_index;
    this.m_current.setPathLATokenNum(token.m_num);
    if(this.m_la_index_max < tok_index) {
      this.m_la_index_max = tok_index
    }
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.print("  next token ");
      this.m_trace.print(token);
      this.m_trace.print("@");
      this.m_trace.println(this.m_current.m_la_index)
    }
    return true
  };
  Parser.prototype.onResetInput = function() {
  };
  Parser.prototype.resetInput = function() {
    this.resetCurrentOnStartRule();
    this.m_hit_completion_pos = false;
    this.nextToken();
    this.m_current.storeCurrentPositionAsOriginClearingInstructions(this.m_scanner.getStateCopy());
    this.setLastSyncPoint(-1)
  };
  Parser.prototype.resetCurrentOnStartRule = function() {
    this.setCurrentPC(this.m_chachedStartIndex);
    this.m_current.m_BP.dispose();
    this.m_current.m_completion = null;
    this.m_current.m_disable_actions_for_this_path = false;
    this.m_current.resetMatchInfo();
    this.clearPathAndCompletions();
    this.setParsingPhase(Constants.ParsingPhase.TRY_PHASE)
  };
  Parser.prototype.setParsingPhase = function(m_parsing_phase) {
    this.m_parsing_phase = m_parsing_phase
  };
  Parser.prototype.clearPathRetainCompletions = function() {
    this.m_non_det_pool = [];
    this.m_weak_det_pool = [];
    this.m_erroneous_pool = []
  };
  Parser.prototype.setLastSyncPoint = function(m_last_syncpoint) {
    this.m_last_syncpoint = m_last_syncpoint
  };
  Parser.prototype.setCurrentPC = function(newPC) {
    this.m_current.m_PC_index = newPC;
    this.alignPCwithIndex()
  };
  Parser.prototype.alignPCwithIndex = function() {
    this.m_current.m_PC = this.m_byte_code.instruction(this.m_current.m_PC_index)
  };
  Parser.prototype.getByteCode = function() {
    return this.m_byte_code
  };
  Parser.prototype.getMaxPathsChecked = function() {
    return this.MAX_PATHS_CHECKED
  };
  Parser.prototype.setMaxPathsChecked = function(val) {
    this.MAX_PATHS_CHECKED = val
  };
  Parser.prototype.setPathFailed = function() {
    this.m_vm_status = VMStatus.PATH_FAILED
  };
  Parser.prototype.recordCompletionPath = function(path) {
    this.m_completionPaths.push(path)
  };
  Parser.prototype.setVMStopped = function() {
    this.m_vm_status = VMStatus.STOPPED
  };
  Parser.prototype.setGetNextPath = function() {
    this.m_vm_status = VMStatus.GET_NEXT_PATH
  };
  Parser.tokIndex = function(bp, off) {
    return bp.m_tok_base[off]
  };
  Parser.getTok = function(resolver, bp, offset) {
    var res = Parser.tokIndex(bp, offset);
    if(res !== -1) {
      return resolver.m_scanner.getToken(res)
    }
    return null
  };
  Parser.getTokenAt = function(resolver, bp, offset) {
    var res = offset;
    if(res !== -1) {
      return resolver.m_scanner.getToken(res)
    }
    return null
  };
  Parser.prototype.getTokenAt1 = function(idx) {
    if(idx < 0) {
      return null
    }
    return this.m_scanner.getToken(idx)
  };
  Parser.getFirstStackframeTokenIndex = function(resolver, bp) {
    return bp.getFirstTokenIndex()
  };
  Parser.getLastMatchedTokenIndex = function(resolver, bp) {
    return bp.getLastMatchedTokenIndex()
  };
  Parser.prototype.setStartRuleName = function(startRuleName) {
    this.m_startRuleName = startRuleName;
    this.alignStartIndex()
  };
  Parser.prototype.alignStartIndex = function() {
    this.m_chachedStartIndex = this.m_byte_code.getStartIndex(this.m_startRuleName);
    this.resetCurrentOnStartRule()
  };
  Parser.prototype.getTokenIndexResolver = function() {
    return this.m_byte_code
  };
  Parser.prototype.getByteCodeTokenInfo = function() {
    return this.m_byte_code
  };
  Parser.prototype.isReallyDirty = function(token_id) {
    return this.isDirty(token_id)
  };
  Parser.prototype.isDirty = function(idx) {
    return idx > this.m_scanner.getActualNUMID()
  };
  Parser.prototype.discardAllOtherPaths = function() {
    this.m_non_det_pool.clear();
    this.m_weak_det_pool.clear();
    this.m_weak_det_pool.clear()
  };
  Parser.prototype.isActionDisabledDuringErrorReplay = true;
  Parser.prototype.setisActionDisabledDuringErrorReplay = function(newValue) {
    this.isActionDisabledDuringErrorReplay = newValue
  };
  Parser.prototype.getCurrentToken = function() {
    return this.lTok()
  };
  Parser.prototype.getCurrentTokenIndex = function() {
    return this.m_current.m_la_index
  };
  Parser.prototype.getCurrentPath = function() {
    return this.m_current
  };
  Parser.prototype.skipToken = function() {
    var tok = this.lTok();
    if(tok.m_err_state != ErrorState.Erroneous) {
      tok.m_err_state = ErrorState.Unknown
    }
    return this.nextToken()
  };
  Parser.prototype.returnFromOneStackframeForErrorRecovery = function() {
    this.m_vm_status = VMStatus.PROCEED;
    this.m_current.m_PC_index = ByteCode.RUNTIME_CREATED_RETURN;
    this.alignPCwithIndex();
    this.vmReturn(this.m_current.m_PC);
    this.alignOriginalStackframeDepth()
  };
  Parser.prototype.alignOriginalStackframeDepth = function() {
    while(this.m_current.m_BP != null && this.m_current.m_BP.ptr() != null && this.m_current.m_BP_original != null && this.m_current.m_BP_original.ptr() != null && this.m_current.m_BP.getStackframe().getParentDepth() < this.m_current.m_BP_original.getStackframe().getParentDepth()) {
      this.returnOriginalSF()
    }
  };
  Parser.prototype.returnOriginalSF = function() {
    var s = this.m_current.m_BP_original;
    if(s == null) {
      return
    }
    if(s.getStackframe() != null) {
      s.getStackframe().m_save_BP.lock()
    }
    this.setCurrentOriginalPC(s.getStackframe().m_save_PC_index + 1);
    if(s.getStackframe() != null) {
      this.m_current.m_BP_original = new FramePtr(s.getStackframe().m_save_BP.getStackframe())
    }
    if(this.m_current.m_BP_original.getStackframe() != null) {
      this.setMatchPositionOnStackframe()
    }
  };
  Parser.prototype.setCurrentOriginalPC = function(newPC) {
    this.m_current.m_PC_original_index = newPC;
    this.alignOriginalPCwithIndex()
  };
  Parser.prototype.alignOriginalPCwithIndex = function() {
    this.m_current.m_PC_original = this.m_byte_code.instruction(this.m_current.m_PC_original_index)
  };
  Parser.prototype.getTokens = function() {
    return this.m_scanner.getInput()
  };
  return Parser
});
define("rndrt/RNDErrorInfo", [], function() {
  function RNDErrorInfo(tok, message) {
    this.m_token = tok;
    this.m_msg = message
  }
  RNDErrorInfo.prototype.getMessage = function() {
    return this.m_msg
  };
  RNDErrorInfo.prototype.getLength = function() {
    return this.m_token.getLength()
  };
  return RNDErrorInfo
});
define("rndrt/ErrorCollectingParser", ["rndrt/Utils", "rndrt/Parser", "rndrt/RNDErrorInfo"], function(Utils, Parser, RNDErrorInfo) {
  function ErrorCollectingParser(byte_code, scanner) {
    Parser.call(this, byte_code, scanner);
    this.m_error_infos = []
  }
  ErrorCollectingParser.prototype = Utils.objectCreate(Parser.prototype);
  ErrorCollectingParser.prototype.recordTokenError = function(path, tok) {
    var ctx = this.getContext();
    var rulename = "(unknown)";
    try {
      rulename = ctx.getStackframe().getRuleInfo().getRuleName()
    }catch(e) {
    }
    this.m_error_infos.push(new RNDErrorInfo(tok, '"' + tok.m_lexem + '" is not allowed in rule ' + rulename))
  };
  ErrorCollectingParser.prototype.onResetInput = function() {
    this.m_error_infos = [];
    Parser.prototype.onResetInput.call(this)
  };
  ErrorCollectingParser.prototype.getErrorInfos = function() {
    return this.m_error_infos
  };
  return ErrorCollectingParser
});
define("rndrt/NullFrame", [], function() {
  function NullFrame() {
  }
  return NullFrame
});
define("rndrt/Scanner", ["rndrt/ScannerState"], function(ScannerState) {
  function Scanner(byte_code) {
    if(!byte_code) {
      return
    }
    this.m_byte_code = byte_code;
    this.NUM_ID = byte_code.getActualNUMID();
    this.m_completion_prefix = 0;
    this.m_input = []
  }
  Scanner.prototype.resetInput = function() {
    this.m_input = [];
    this.m_state = new ScannerState
  };
  Scanner.prototype.getState = function() {
    return this.m_state
  };
  Scanner.prototype.getInput = function() {
    return this.m_input
  };
  Scanner.prototype.hasMoreToken = function() {
    if(this.endForParallel != null) {
      return this.m_state.m_input_pos < this.endForParallel
    }
    return this.m_state.m_input_pos < this.m_input.length
  };
  Scanner.prototype.getTokenIndex = function(tok_str) {
    return this.m_byte_code.getTokenIndex(tok_str)
  };
  Scanner.prototype.getNextToken = function() {
    return this.m_state.m_input_pos++
  };
  Scanner.prototype.getToken = function(index) {
    return this.m_input[index]
  };
  Scanner.prototype.getStateCopy = function() {
    return new ScannerState(this.m_state)
  };
  Scanner.prototype.getStateDirect = function() {
    return this.m_state
  };
  Scanner.prototype.setState = function(state) {
    this.m_state = new ScannerState(state)
  };
  Scanner.prototype.getActualNUMID = function() {
    return this.NUM_ID
  };
  Scanner.prototype.getTokenIndexResolver = function() {
    return this.m_byte_code
  };
  return Scanner
});
define("rndrt/ScannerCoCoInserter", ["rndrt/Category", "rndrt/Constants", "rndrt/CursorPos", "rndrt/ErrorState", "rndrt/Token"], function(Category, Constants, CursorPos, ErrorState, Token) {
  var ScannerCoCoInserter = function() {
    this.LINE_SEPARATOR_SIZE = 1;
    this.CommentClassification = {NOT_A_COMMENT:0, EOL_COMMENT:1, TERMINATED_COMMENT:2}
  };
  ScannerCoCoInserter.prototype.insertCodeCompletionPosition = function(mutatedInput, codeCompletionPos, relevantTokenLowerBound, tir) {
    return this.insertCodeCompletionPositionWithOffset(mutatedInput, codeCompletionPos, relevantTokenLowerBound, tir, -1)
  };
  ScannerCoCoInserter.prototype.insertCodeCompletionPositionWithOffset = function(mutatedInput, codeCompletionPos, relevantTokenLowerBound, tir, offset) {
    if(codeCompletionPos === null || codeCompletionPos.m_line < 0) {
      return null
    }
    if(codeCompletionPos.m_line === 0 && codeCompletionPos.m_column === 0) {
      return this.insertBeforeEOF(mutatedInput, offset)
    }
    if(mutatedInput.length > 2 && this.isBeforePos(codeCompletionPos, mutatedInput[0])) {
      return this.insertAtPos(mutatedInput, 0, codeCompletionPos, offset)
    }
    var i;
    for(i = 0;i < mutatedInput.length - 1;++i) {
      var tokenAtOffsetI = mutatedInput[i];
      if(tokenAtOffsetI.m_line > codeCompletionPos.m_line) {
        return null
      }
      if(this.isInToken(tokenAtOffsetI, codeCompletionPos)) {
        if(this.permitsCompletion(tokenAtOffsetI, codeCompletionPos, true) === false) {
          return null
        }
        return this.insertSplitToken(mutatedInput, i, codeCompletionPos, tir)
      }
      if(this.isDirectlyAfterToken(tokenAtOffsetI, codeCompletionPos)) {
        if(this.isComment(tokenAtOffsetI) === this.CommentClassification.TERMINATED_COMMENT) {
          return this.insertAtPos(mutatedInput, i + 1, codeCompletionPos, offset)
        }
        if(this.permitsCompletion(tokenAtOffsetI, codeCompletionPos, false) === false) {
          return null
        }
        return this.alterForDirectAfterToken(mutatedInput, i, codeCompletionPos, tir)
      }
      if(this.isBetweenToken(tokenAtOffsetI, mutatedInput[i + 1], codeCompletionPos)) {
        return this.insertAtPos(mutatedInput, i + 1, codeCompletionPos, offset)
      }
    }
    if(mutatedInput.length == 1 && mutatedInput[0].m_num == Constants.NUM_EOF) {
      return this.insertAtPos(mutatedInput, 0, codeCompletionPos, offset)
    }
    return this.insertAtPos(mutatedInput, mutatedInput.length - 1, codeCompletionPos, offset)
  };
  ScannerCoCoInserter.prototype.permitsCompletion = function(token, pos, posIsInToken) {
    if(Category.CAT_COMMENT === token.m_category) {
      return false
    }
    if(Category.CAT_WS === token.m_category) {
      return false
    }
    return true
  };
  ScannerCoCoInserter.prototype.isComment = function(token) {
    if(Category.CAT_COMMENT === token.m_category) {
      return this.CommentClassification.EOL_COMMENT
    }
    return this.CommentClassification.NOT_A_COMMENT
  };
  ScannerCoCoInserter.prototype.insertBeforeEOF = function(mutatedInput, offset) {
    var eofToken = mutatedInput[mutatedInput.length - 1];
    if(offset === -1) {
      offset = eofToken.m_offset
    }
    var eofPos = new CursorPos(eofToken.m_line, eofToken.m_column, "");
    return this.insertAtPos(mutatedInput, mutatedInput.length - 1, eofPos, offset)
  };
  ScannerCoCoInserter.prototype.isBeforePos = function(token, pos) {
    return this.isBeforePos(token.m_line, token.m_column, pos)
  };
  ScannerCoCoInserter.prototype.isBeforePos = function(line, column, pos) {
    return line < pos.m_line || line == pos.m_line && column < pos.m_column
  };
  ScannerCoCoInserter.prototype.isBeforePos = function(pos, token2) {
    return!this.isBeforeOrEqualPos(token2, pos)
  };
  ScannerCoCoInserter.prototype.isBeforeOrEqualPos = function(token, pos) {
    return token.m_line < pos.m_line || token.m_line == pos.m_line && token.m_column < pos.m_column || this.isEqualPos(token.m_line, token.m_column, pos)
  };
  ScannerCoCoInserter.prototype.isEqualPos = function(line, column, pos) {
    return line == pos.m_line && column == pos.m_column
  };
  ScannerCoCoInserter.prototype.insertAtPos = function(mutatedInput, i, codeCompletionPos, offset) {
    if(offset === -1) {
      offset = this.guessOffset(mutatedInput, i, codeCompletionPos)
    }
    var anykwtok = new Token(Constants.NUM_ANYKW, "", Category.CAT_UNDEF, offset, codeCompletionPos.m_line, codeCompletionPos.m_column, false, ErrorState.Correct, 0);
    mutatedInput.splice(i, 0, anykwtok);
    return null
  };
  ScannerCoCoInserter.prototype.guessOffset = function(mutatedInput, i, codeCompletionPos) {
    var offset = 0;
    var line = codeCompletionPos.m_line;
    var column = codeCompletionPos.m_column;
    if(line < 1) {
      line = 1
    }
    if(column < 1) {
      column = 1
    }
    if(i <= 0) {
      offset = column - 1 + (line - 1) * this.LINE_SEPARATOR_SIZE
    }else {
      var previousToken = mutatedInput[i - 1];
      if(previousToken.m_line == line) {
        offset = previousToken.m_offset + column - previousToken.m_column
      }else {
        offset = previousToken.m_offset + previousToken.getLength();
        offset += (line - previousToken.m_line) * this.LINE_SEPARATOR_SIZE;
        offset += column - 1
      }
    }
    return offset
  };
  ScannerCoCoInserter.prototype.insertSplitToken = function(mutatedInput, i, codeCompletionPos, tir) {
    var tokenToSplit = mutatedInput[i];
    var originalLexeme = tokenToSplit.m_lexem;
    var delta = codeCompletionPos.m_column - tokenToSplit.m_column;
    var headLexem = tokenToSplit.m_lexem.substring(0, delta);
    var tailLexem = tokenToSplit.m_lexem.substring(delta);
    var tailNum = tokenToSplit.m_num;
    var resolved = tir.getTokenIndex(tailLexem);
    if(resolved > 0) {
      tailNum = resolved
    }
    var tailToken = new Token(tailNum, tailLexem, Category.CAT_UNDEF, tokenToSplit.m_offset + delta, codeCompletionPos.m_line, codeCompletionPos.m_column, false, ErrorState.Correct, 0);
    tokenToSplit.m_num = Constants.NUM_ANYKW;
    tokenToSplit.m_lexem = headLexem;
    mutatedInput.splice(i + 1, 0, tailToken);
    return originalLexeme.substring(0, delta)
  };
  ScannerCoCoInserter.prototype.alterForDirectAfterToken = function(mutatedInput, i) {
    var tokenToAlter = mutatedInput[i];
    var originalLexeme = tokenToAlter.m_lexem;
    tokenToAlter.m_num = Constants.NUM_ANYKW;
    return originalLexeme
  };
  ScannerCoCoInserter.prototype.isInToken = function(token, pos) {
    return this.isBeforeOrEqual(token.m_line, token.m_column, pos) && !this.isBeforeOrEqual(token.m_line, token.m_column + token.m_lexem.length, pos)
  };
  ScannerCoCoInserter.prototype.isDirectlyAfterToken = function(token, pos) {
    return this.isEqualPos(token.m_line, token.m_column + token.m_lexem.length, pos)
  };
  ScannerCoCoInserter.prototype.isBeforeOrEqual = function(line, column, pos) {
    return line < pos.m_line || line == pos.m_line && column <= pos.m_column
  };
  ScannerCoCoInserter.prototype.isBetweenToken = function(token, token2, pos) {
    return this.isBeforeOrEqual(token.m_line, token.m_column + token.m_lexem.length, pos) && this.isBeforePos(pos, token2)
  };
  return ScannerCoCoInserter
});
define("rndrt/StringTokenizer", [], function() {
  function StringTokenizer(string, separator) {
    this.str = string;
    this.sep = separator;
    this.idx = 0
  }
  StringTokenizer.prototype.hasMoreTokens = function() {
    var n = this.str.indexOf(this.sep, this.idx);
    if(n > -1) {
      return true
    }
    if(this.idx === 0 || this.idx < this.str.length) {
      return true
    }
    return false
  };
  StringTokenizer.prototype.nextToken = function() {
    var before = this.idx;
    var n = this.str.indexOf(this.sep, this.idx);
    if(n < 0) {
      n = this.str.length;
      this.idx = n
    }else {
      this.idx = n + 1
    }
    var sub = this.str.substring(before, n);
    return sub
  };
  return StringTokenizer
});
define("rndrt/TokenCoCoCompletion", [], function() {
  function TokenCoCoCompletion(other) {
    if(!other) {
      this.m_next_tokens = null;
      this.m_tokens_completed = 0;
      this.m_clauses_completed = 0
    }else {
      this.m_next_tokens = other.m_next_tokens ? other.m_next_tokens.slice(0) : other.m_next_tokens;
      this.m_tokens_completed = other.m_tokens_completed;
      this.m_clauses_completed = other.m_clauses_completed
    }
  }
  TokenCoCoCompletion.prototype.clone = function() {
    return new TokenCoCoCompletion(this)
  };
  TokenCoCoCompletion.prototype.getNextTokens = function() {
    return this.m_next_tokens.slice(0)
  };
  TokenCoCoCompletion.prototype.assureCreated = function(current) {
    if(current.getCompletion() === null) {
      current.setCompletion(new TokenCoCoCompletion)
    }
    return current.getCompletion()
  };
  TokenCoCoCompletion.assureCreated = TokenCoCoCompletion.prototype.assureCreated;
  TokenCoCoCompletion.prototype.assureNextTokensPresent = function() {
    if(this.m_next_tokens === null) {
      this.m_next_tokens = []
    }
  };
  return TokenCoCoCompletion
});
define("rndrt/TokenCoCoParser", ["rndrt/Utils", "rndrt/Constants", "rndrt/Instruction", "rndrt/ErrorCollectingParser", "rndrt/CompletionModes", "rndrt/HookResult", "rndrt/Parser", "rndrt/Syscodes", "rndrt/TokenCoCoCompletion"], function(Utils, Constants, Instruction, ErrorCollectingParser, CompletionModes, HookResult, Parser, Syscodes, TokenCoCoCompletion) {
  function TokenCoCoParser(byte_code, scanner) {
    ErrorCollectingParser.call(this, byte_code, scanner);
    this.COMPL_MAX_KEYWORDS = 4;
    this.m_max_completions = this.COMPL_MAX_KEYWORDS;
    this.m_max_clauses = TokenCoCoParser.COMPL_MAX_CLAUSES;
    this.isCaseInsensitiveCompletion = true;
    this.m_completion_mode = CompletionModes.COMPL_MODE_NONE;
    this.newHook = false
  }
  TokenCoCoParser.prototype = Utils.objectCreate(ErrorCollectingParser.prototype);
  TokenCoCoParser.prototype.COMPL_MAX_CLAUSES = 1;
  TokenCoCoParser.COMPL_MAX_CLAUSES = 1;
  TokenCoCoParser.prototype.setIsCaseInsensitiveCompletion = function(newValue) {
    this.isCaseInsensitiveCompletion = newValue
  };
  TokenCoCoParser.prototype.getIsCaseInsensitiveCompletion = function() {
    return this.isCaseInsensitiveCompletion
  };
  function TokenCoCoRNDRunFlags(compl_mode) {
    this.m_completion_mode = compl_mode
  }
  TokenCoCoRNDRunFlags.prototype.isCoCoMode = function() {
    return this.m_completion_mode == CompletionModes.COMPL_MODE_ALL.getValue() || this.m_completion_mode == CompletionModes.COMPL_MODE_CLAUSES.getValue() || this.m_completion_mode == CompletionModes.COMPL_MODE_UNIQUE.getValue()
  };
  TokenCoCoRNDRunFlags.prototype.skipActions = function() {
    return!(this.m_completion_mode != CompletionModes.COMPL_MODE_NONE.getValue() && this.m_completion_mode != CompletionModes.COMPL_MODE_UNIQUE.getValue())
  };
  TokenCoCoParser.prototype.setComplMaxKeywords = function(val) {
    this.COMPL_MAX_KEYWORDS = val;
    this.m_max_completions = this.COMPL_MAX_KEYWORDS
  };
  TokenCoCoParser.prototype.onMatchCollectCompletionSuggestionsOrAbort = function(current_token, matched_terminal) {
    var lexem_input = current_token.m_lexem;
    var compl = this.m_current.getCompletion();
    if(compl != null && compl.m_tokens_completed >= this.m_max_completions) {
      return false
    }
    if(compl != null && compl.m_tokens_completed > 0 || this.getByteCodeTokenInfo().isPrefixOfToken(lexem_input, matched_terminal, this.isCaseInsensitiveCompletion)) {
      this.addCompletion(matched_terminal);
      return true
    }
    return false
  };
  TokenCoCoParser.prototype.addCompletion = function(terminal) {
    var compl = TokenCoCoCompletion.assureCreated(this.m_current);
    compl.m_tokens_completed++;
    if(this.m_trace != null) {
      this.traceindent();
      this.m_trace.print("  cc pushback token");
      this.m_trace.print("'" + this.getByteCodeTokenInfo().getTokenNameUS(terminal) + "'");
      this.m_trace.print(terminal);
      this.m_trace.print("@");
      this.m_trace.println(this.m_current.m_la_index)
    }
    compl.assureNextTokensPresent();
    compl.m_next_tokens.push(terminal);
    return true
  };
  TokenCoCoParser.prototype.onCommitMatch = function(match_instr) {
    if(match_instr.m_opcode === Instruction.OP_MATCH) {
      var tok = this.lTok();
      tok.m_role = this.m_current.m_active_role;
      this.onCommitMatchContext(this.getContext())
    }
  };
  TokenCoCoParser.prototype.forcePathFailureInBranch = function(current) {
    var compl = current.getCompletion();
    if(compl === null) {
      return false
    }
    if(this.m_completion_mode === CompletionModes.COMPL_MODE_CLAUSES.getValue()) {
      if(compl.m_tokens_completed > 0) {
        compl.m_clauses_completed++
      }
      if(compl.m_clauses_completed >= this.m_max_clauses) {
        return true
      }
    }else {
      if(this.m_completion_mode == CompletionModes.COMPL_MODE_UNIQUE.getValue() && compl.m_tokens_completed > 0) {
        return true
      }
    }
    return false
  };
  TokenCoCoParser.prototype.recordCompletionPathOnFailure = function(current) {
    if(this.isAnyToken(current.getPathLATokenNum()) && !this.getFlagCheckError()) {
      this.setHitCompletionPos(true);
      var compl = current.getCompletion();
      if(compl != null && compl.m_next_tokens.length > 0) {
        this.recordCompletionPath(current)
      }
    }
  };
  TokenCoCoParser.prototype.printCompletions = function() {
    var result = "";
    var completionPaths = this.getCompletionPaths();
    for(var i = 0;i < completionPaths.length;++i) {
      var completion = completionPaths[i];
      var np = "___ ";
      var tokens = [];
      if(completion.getCompletion() != null) {
        tokens = completion.getCompletion().m_next_tokens
      }
      for(var k = 0;k < tokens.length;++k) {
        var t = tokens[k];
        np += this.getByteCodeTokenInfo().getTokenNameUS(t) + " "
      }
      result = Utils.stringTrim(np) + "\n" + result
    }
    return result
  };
  TokenCoCoParser.prototype.cocoActions = function(kind) {
    if(kind == Syscodes.SYS_CCQUERY) {
      if(this.m_completion_mode != CompletionModes.COMPL_MODE_NONE.getValue() && this.isAnyToken(this.m_current.getPathLATokenNum())) {
        if(this.getParsingPhase() != Constants.ParsingPhase.COMMIT_PHASE) {
          this.addStopInstruction()
        }
        if(this.m_current.getCompletion() == null || this.m_current.getCompletion().m_tokens_completed === 0) {
          this.replay();
          this.collect(this.lTok().m_lexem)
        }
        this.setPathFailed();
        return
      }
    }else {
      if(kind == Syscodes.SYS_CCIGNORE) {
        if(this.m_completion_mode != CompletionModes.COMPL_MODE_NONE.getValue() && this.isAnyToken(this.m_current.getPathLATokenNum())) {
          this.setPathFailed();
          return
        }
      }else {
        if(kind == Syscodes.SYS_CCBLOCKEND) {
          var compl = this.m_current.getCompletion();
          if(this.m_completion_mode === CompletionModes.COMPL_MODE_UNIQUE.getValue() && this.m_current.getCompletion() != null && compl.m_tokens_completed > 0 && this.getByteCodeTokenInfo().getTokenNameUS(compl.m_next_tokens[compl.m_next_tokens.length - 1]) == this.m_block_end_tag) {
            this.m_current.setCompletion(null);
            this.setPathFailed();
            return
          }
        }
      }
    }
  };
  TokenCoCoParser.prototype.collect = function() {
    var compl = this.m_current.getCompletion();
    if(compl == null || compl.m_tokens_completed === 0) {
      compl = TokenCoCoCompletion.assureCreated(this.m_current);
      compl.assureNextTokensPresent();
      compl.m_next_tokens.push(this.getTokenIndexResolver().getActualNUMID())
    }
  };
  TokenCoCoParser.prototype.getCompletionTokens = function(path) {
    var res = path.getCompletion();
    return res.getNextTokens()
  };
  TokenCoCoParser.prototype.run = function(completion_mode, halted, HALTED_INTERVAL) {
    this.m_completion_mode = completion_mode;
    this.setRNDRunFlags(new TokenCoCoRNDRunFlags(completion_mode));
    var self = this;
    var tmpval = false;
    if(this.isCoCoMode() && tmpval) {
      var tmpHook = {};
      var invoke = function(processor) {
        var anykw = self.isAnyToken(processor.getCurrentPath().getPathLATokenNum());
        if(anykw) {
          processor.addAllPathsOfBranch();
          processor.setGetNextPath();
          return HookResult.DONE
        }
        return HookResult.NORMAL
      };
      tmpHook.invoke = invoke;
      this.setBranchHook(tmpHook)
    }else {
      this.setBranchHook(null)
    }
    return Parser.prototype.runWithHalted.call(this, halted, HALTED_INTERVAL)
  };
  return TokenCoCoParser
});
define("rndrt/UserStackframeT", ["rndrt/Utils", "rndrt/Stackframe"], function(Utils, Stackframe) {
  function UserStackframeT(BP, rule_info, a3, a4, a5, a6) {
    var a1 = BP, a2 = rule_info;
    if(arguments.length === 1) {
      this.copyCTor(a1);
      return
    }
    if(arguments.length === 4) {
      this.ctorRES_LOC_Stackframe_rule_info.call(this, a1, a2, a3, a4);
      return
    }
    if(arguments.length === 6) {
      this.prototype.ctorLOC_Object_Stackframe_RuleInfo_RES_ptrdiff_t.call(this, a1, a2, a3, a4, a5, a6);
      return
    }
    Stackframe.call(this, BP.getStackframe(), rule_info, {});
    this.m_locals = null;
    this.m_result = null;
    this.m_result_off = null
  }
  UserStackframeT.prototype = Utils.objectCreate(Stackframe.prototype);
  UserStackframeT.prototype.ctorLOC_Object_Stackframe_RuleInfo_RES_ptrdiff_t = function(locals, actiondeleg, BP, rule_info, result, result_off) {
    Stackframe.call(this, BP, rule_info, locals);
    this.m_locals = locals;
    this.m_result = result;
    this.m_result_off = result_off
  };
  UserStackframeT.prototype.ctorRES_LOC_Stackframe_rule_info = function(res, _locals, BP, rule_info) {
    Stackframe.call(this, BP, rule_info, _locals);
    this.m_locals = _locals;
    this.m_result = res;
    this.m_result_off = null
  };
  UserStackframeT.prototype.copyCTor = function(other) {
    Stackframe.call(this, other, {});
    this.m_result = other.m_result;
    this.m_result_off = other.m_result_off;
    this.m_locals = null;
    this.m_locals = other.m_locals.clone();
    Stackframe.setLocals.call(this, this.m_locals);
    Utils.assert(false)
  };
  UserStackframeT.prototype.performAction = function() {
  };
  UserStackframeT.prototype.updateResultResult = function() {
    if(this.m_result_off.offset()) {
      Utils.assert(false);
      this.m_result = null
    }
  };
  UserStackframeT.prototype.clone = function() {
    return new UserStackframeT(this)
  };
  UserStackframeT.prototype.cloneAttributes = function(other) {
    Stackframe.call(this, other, {});
    if(!other.isUserFrame()) {
      throw"Not a UserStackFrame!";
    }else {
      this.m_result = other.m_result;
      this.m_result_off = other.m_result_off;
      this.m_locals = other.m_locals
    }
  };
  UserStackframeT.prototype.isUserFrame = function() {
    return true
  };
  return UserStackframeT
});
define("rndrt/HashSet", ["rndrt/Utils"], function(Utils) {
  function HashSet() {
  }
  HashSet.prototype = Object.create(Array.prototype);
  HashSet.prototype.addAll = function(list) {
    for(var i = 0;i < list.length;i++) {
      var e = list[i];
      if(Utils.arrayContains(this, e) === false) {
        this.push(e)
      }
    }
    return this
  };
  return HashSet
});
define("rndrt/ace/AceEditorUtils", [], function() {
  return{getAceEditor:function() {
    var aceContent = document.getElementsByClassName("ace_content");
    var visibleAceContent = null;
    for(var qq = 0;qq < aceContent.length;qq++) {
      if(typeof $ === "undefined" || $(aceContent[qq]).is(":visible") === true) {
        visibleAceContent = aceContent[qq];
        break
      }
    }
    if(visibleAceContent === null) {
      return null
    }
    var par = visibleAceContent.parentElement.parentElement;
    var editor = ace.edit(par);
    return editor
  }}
});
define("rndrt/rnd", ["rndrt/ByteCode", "rndrt/ByteCodeFactory", "rndrt/Category", "rndrt/CompletionModes", "rndrt/Constants", "rndrt/CursorPos", "rndrt/ErrorCollectingParser", "rndrt/ErrorState", "rndrt/FramePtr", "rndrt/HookResult", "rndrt/Instruction", "rndrt/LabelInfoRuleData", "rndrt/NullFrame", "rndrt/Parser", "rndrt/ParserTrace", "rndrt/Path", "rndrt/PrintWriter", "rndrt/RNDContext", "rndrt/RNDErrorInfo", "rndrt/RuleInfo", "rndrt/Scanner", "rndrt/ScannerCoCoInserter", "rndrt/ScannerState", 
"rndrt/Stackframe", "rndrt/StringBuffer", "rndrt/StringTokenizer", "rndrt/StringWriter", "rndrt/Syscodes", "rndrt/Token", "rndrt/TokenCoCoCompletion", "rndrt/TokenCoCoParser", "rndrt/TokenRecommendations", "rndrt/UserStackframeT", "rndrt/Utils", "rndrt/VMStatus", "rndrt/HashSet", "rndrt/ace/AceEditorUtils"], function(ByteCode, ByteCodeFactory, Category, CompletionModes, Constants, CursorPos, ErrorCollectingParser, ErrorState, FramePtr, HookResult, Instruction, LabelInfoRuleData, NullFrame, Parser, 
ParserTrace, Path, PrintWriter, RNDContext, RNDErrorInfo, RuleInfo, Scanner, ScannerCoCoInserter, ScannerState, Stackframe, StringBuffer, StringTokenizer, StringWriter, Syscodes, Token, TokenCoCoCompletion, TokenCoCoParser, TokenRecommendations, UserStackframeT, Utils, VMStatus, HashSet, AceEditorUtils) {
  return{version:"0.4.0", ByteCode:ByteCode, ByteCodeFactory:ByteCodeFactory, Category:Category, CompletionModes:CompletionModes, Constants:Constants, CursorPos:CursorPos, ErrorCollectingParser:ErrorCollectingParser, ErrorState:ErrorState, FramePtr:FramePtr, HookResult:HookResult, Instruction:Instruction, LabelInfoRuleData:LabelInfoRuleData, NullFrame:NullFrame, Parser:Parser, ParserTrace:ParserTrace, Path:Path, PrintWriter:PrintWriter, RNDContext:RNDContext, RNDErrorInfo:RNDErrorInfo, RuleInfo:RuleInfo, 
  Scanner:Scanner, ScannerCoCoInserter:ScannerCoCoInserter, ScannerState:ScannerState, Stackframe:Stackframe, StringBuffer:StringBuffer, StringTokenizer:StringTokenizer, StringWriter:StringWriter, Syscodes:Syscodes, Token:Token, TokenCoCoCompletion:TokenCoCoCompletion, TokenCoCoParser:TokenCoCoParser, TokenRecommendations:TokenRecommendations, UserStackframeT:UserStackframeT, Utils:Utils, VMStatus:VMStatus, HashSet:HashSet, AceEditorUtils:AceEditorUtils}
});
