!function(e){"use strict";function t(e){var n;if(null===e||void 0===e)return!1;if(r.isArray(e))return e.length>0;if("string"==typeof e||"number"==typeof e||"boolean"==typeof e)return!0;for(n in e)if(e.hasOwnProperty(n)&&t(e[n]))return!0;return!1}var n=function(){function e(e){this.options=e}return e.prototype.toString=function(){return JSON&&JSON.stringify?JSON.stringify(this.options):this.options},e}(),r=function(){function e(e){return"[object Array]"===Object.prototype.toString.apply(e)}function t(e){return"[object String]"===Object.prototype.toString.apply(e)}function n(e){return"[object Number]"===Object.prototype.toString.apply(e)}function r(e){return"[object Boolean]"===Object.prototype.toString.apply(e)}function i(e,t){var n,r="",i=!0;for(n=0;n<e.length;n+=1)i?i=!1:r+=t,r+=e[n];return r}function o(e,t){for(var n=[],r=0;r<e.length;r+=1)n.push(t(e[r]));return n}function s(e,t){for(var n=[],r=0;r<e.length;r+=1)t(e[r])&&n.push(e[r]);return n}function a(e){if("object"!=typeof e||null===e)return e;Object.freeze(e);var t,n;for(n in e)e.hasOwnProperty(n)&&(t=e[n],"object"==typeof t&&u(t));return e}function u(e){return"function"==typeof Object.freeze?a(e):e}return{isArray:e,isString:t,isNumber:n,isBoolean:r,join:i,map:o,filter:s,deepFreeze:u}}(),i=function(){function e(e){return e>="a"&&"z">=e||e>="A"&&"Z">=e}function t(e){return e>="0"&&"9">=e}function n(e){return t(e)||e>="a"&&"f">=e||e>="A"&&"F">=e}return{isAlpha:e,isDigit:t,isHexDigit:n}}(),o=function(){function e(e){var t,n,r="",i=s.encode(e);for(n=0;n<i.length;n+=1)t=i.charCodeAt(n),r+="%"+(16>t?"0":"")+t.toString(16).toUpperCase();return r}function t(e,t){return"%"===e.charAt(t)&&i.isHexDigit(e.charAt(t+1))&&i.isHexDigit(e.charAt(t+2))}function n(e,t){return parseInt(e.substr(t,2),16)}function r(e){if(!t(e,0))return!1;var r=n(e,1),i=s.numBytes(r);if(0===i)return!1;for(var o=1;i>o;o+=1)if(!t(e,3*o)||!s.isValidFollowingCharCode(n(e,3*o+1)))return!1;return!0}function o(e,r){var i=e.charAt(r);if(!t(e,r))return i;var o=n(e,r+1),a=s.numBytes(o);if(0===a)return i;for(var u=1;a>u;u+=1)if(!t(e,r+3*u)||!s.isValidFollowingCharCode(n(e,r+3*u+1)))return i;return e.substr(r,3*a)}var s={encode:function(e){return unescape(encodeURIComponent(e))},numBytes:function(e){return 127>=e?1:e>=194&&223>=e?2:e>=224&&239>=e?3:e>=240&&244>=e?4:0},isValidFollowingCharCode:function(e){return e>=128&&191>=e}};return{encodeCharacter:e,isPctEncoded:r,pctCharAt:o}}(),s=function(){function e(e){return i.isAlpha(e)||i.isDigit(e)||"_"===e||o.isPctEncoded(e)}function t(e){return i.isAlpha(e)||i.isDigit(e)||"-"===e||"."===e||"_"===e||"~"===e}function n(e){return":"===e||"/"===e||"?"===e||"#"===e||"["===e||"]"===e||"@"===e||"!"===e||"$"===e||"&"===e||"("===e||")"===e||"*"===e||"+"===e||","===e||";"===e||"="===e||"'"===e}return{isVarchar:e,isUnreserved:t,isReserved:n}}(),a=function(){function e(e,t){var n,r="",i="";for(("number"==typeof e||"boolean"==typeof e)&&(e=e.toString()),n=0;n<e.length;n+=i.length)i=e.charAt(n),r+=s.isUnreserved(i)||t&&s.isReserved(i)?i:o.encodeCharacter(i);return r}function t(t){return e(t,!0)}function n(e,t){var n=o.pctCharAt(e,t);return n.length>1?n:s.isReserved(n)||s.isUnreserved(n)?n:o.encodeCharacter(n)}function r(e){var t,n="",r="";for(t=0;t<e.length;t+=r.length)r=o.pctCharAt(e,t),n+=r.length>1?r:s.isReserved(r)||s.isUnreserved(r)?r:o.encodeCharacter(r);return n}return{encode:e,encodePassReserved:t,encodeLiteral:r,encodeLiteralCharacter:n}}(),u=function(){function e(e){t[e]={symbol:e,separator:"?"===e?"&":""===e||"+"===e||"#"===e?",":e,named:";"===e||"&"===e||"?"===e,ifEmpty:"&"===e||"?"===e?"=":"",first:"+"===e?"":e,encode:"+"===e||"#"===e?a.encodePassReserved:a.encode,toString:function(){return this.symbol}}}var t={};return e(""),e("+"),e("#"),e("."),e("/"),e(";"),e("?"),e("&"),{valueOf:function(e){return t[e]?t[e]:"=,!@|".indexOf(e)>=0?null:t[""]}}}(),f=function(){function e(e){this.literal=a.encodeLiteral(e)}return e.prototype.expand=function(){return this.literal},e.prototype.toString=e.prototype.expand,e}(),p=function(){function e(e){function t(){var t=e.substring(h,f);if(0===t.length)throw new n({expressionText:e,message:"a varname must be specified",position:f});c={varname:t,exploded:!1,maxLength:null},h=null}function r(){if(d===f)throw new n({expressionText:e,message:"after a ':' you have to specify the length",position:f});c.maxLength=parseInt(e.substring(d,f),10),d=null}var a,f,p=[],c=null,h=null,d=null,g="";for(a=function(t){var r=u.valueOf(t);if(null===r)throw new n({expressionText:e,message:"illegal use of reserved operator",position:f,operator:t});return r}(e.charAt(0)),f=a.symbol.length,h=f;f<e.length;f+=g.length){if(g=o.pctCharAt(e,f),null!==h){if("."===g){if(h===f)throw new n({expressionText:e,message:"a varname MUST NOT start with a dot",position:f});continue}if(s.isVarchar(g))continue;t()}if(null!==d){if(f===d&&"0"===g)throw new n({expressionText:e,message:"A :prefix must not start with digit 0",position:f});if(i.isDigit(g)){if(f-d>=4)throw new n({expressionText:e,message:"A :prefix must have max 4 digits",position:f});continue}r()}if(":"!==g)if("*"!==g){if(","!==g)throw new n({expressionText:e,message:"illegal character",character:g,position:f});p.push(c),c=null,h=f+1}else{if(null===c)throw new n({expressionText:e,message:"exploded without varspec",position:f});if(c.exploded)throw new n({expressionText:e,message:"exploded twice",position:f});if(c.maxLength)throw new n({expressionText:e,message:"an explode (*) MUST NOT follow to a prefix",position:f});c.exploded=!0}else{if(null!==c.maxLength)throw new n({expressionText:e,message:"only one :maxLength is allowed per varspec",position:f});if(c.exploded)throw new n({expressionText:e,message:"an exploeded varspec MUST NOT be varspeced",position:f});d=f+1}}return null!==h&&t(),null!==d&&r(),p.push(c),new l(e,a,p)}function t(t){var r,i,o=[],s=null,a=0;for(r=0;r<t.length;r+=1)if(i=t.charAt(r),null===a){if(null===s)throw new Error("reached unreachable code");if("{"===i)throw new n({templateText:t,message:"brace already opened",position:r});if("}"===i){if(s+1===r)throw new n({templateText:t,message:"empty braces",position:s});try{o.push(e(t.substring(s+1,r)))}catch(u){if(u.prototype===n.prototype)throw new n({templateText:t,message:u.options.message,position:s+u.options.position,details:u.options});throw u}s=null,a=r+1}}else{if("}"===i)throw new n({templateText:t,message:"unopened brace closed",position:r});"{"===i&&(r>a&&o.push(new f(t.substring(a,r))),a=null,s=r)}if(null!==s)throw new n({templateText:t,message:"unclosed brace",position:s});return a<t.length&&o.push(new f(t.substr(a))),new c(t,o)}return t}(),l=function(){function e(e){return JSON&&JSON.stringify?JSON.stringify(e):e}function n(e){if(!t(e))return!0;if(r.isString(e))return""===e;if(r.isNumber(e)||r.isBoolean(e))return!1;if(r.isArray(e))return 0===e.length;for(var n in e)if(e.hasOwnProperty(n))return!1;return!0}function i(e){var t,n=[];for(t in e)e.hasOwnProperty(t)&&n.push({name:t,value:e[t]});return n}function o(e,t,n){this.templateText=e,this.operator=t,this.varspecs=n}function s(e,t,n){var r="";if(n=n.toString(),t.named){if(r+=a.encodeLiteral(e.varname),""===n)return r+=t.ifEmpty;r+="="}return null!==e.maxLength&&(n=n.substr(0,e.maxLength)),r+=t.encode(n)}function u(e){return t(e.value)}function f(e,o,s){var f=[],p="";if(o.named){if(p+=a.encodeLiteral(e.varname),n(s))return p+=o.ifEmpty;p+="="}return r.isArray(s)?(f=s,f=r.filter(f,t),f=r.map(f,o.encode),p+=r.join(f,",")):(f=i(s),f=r.filter(f,u),f=r.map(f,function(e){return o.encode(e.name)+","+o.encode(e.value)}),p+=r.join(f,",")),p}function p(e,o,s){var f=r.isArray(s),p=[];return f?(p=s,p=r.filter(p,t),p=r.map(p,function(t){var r=a.encodeLiteral(e.varname);return r+=n(t)?o.ifEmpty:"="+o.encode(t)})):(p=i(s),p=r.filter(p,u),p=r.map(p,function(e){var t=a.encodeLiteral(e.name);return t+=n(e.value)?o.ifEmpty:"="+o.encode(e.value)})),r.join(p,o.separator)}function l(e,n){var o=[],s="";return r.isArray(n)?(o=n,o=r.filter(o,t),o=r.map(o,e.encode),s+=r.join(o,e.separator)):(o=i(n),o=r.filter(o,function(e){return t(e.value)}),o=r.map(o,function(t){return e.encode(t.name)+"="+e.encode(t.value)}),s+=r.join(o,e.separator)),s}return o.prototype.toString=function(){return this.templateText},o.prototype.expand=function(i){var o,a,u,c,h=[],d=!1,g=this.operator;for(o=0;o<this.varspecs.length;o+=1)if(a=this.varspecs[o],u=i[a.varname],null!==u&&void 0!==u)if(a.exploded&&(d=!0),c=r.isArray(u),"string"==typeof u||"number"==typeof u||"boolean"==typeof u)h.push(s(a,g,u));else{if(a.maxLength&&t(u))throw new Error("Prefix modifiers are not applicable to variables that have composite values. You tried to expand "+this+" with "+e(u));a.exploded?t(u)&&(g.named?h.push(p(a,g,u)):h.push(l(g,u))):(g.named||!n(u))&&h.push(f(a,g,u))}return 0===h.length?"":g.first+r.join(h,g.separator)},o}(),c=function(){function e(e,t){this.templateText=e,this.expressions=t,r.deepFreeze(this)}return e.prototype.toString=function(){return this.templateText},e.prototype.expand=function(e){var t,n="";for(t=0;t<this.expressions.length;t+=1)n+=this.expressions[t].expand(e);return n},e.parse=p,e.UriTemplateError=n,e}();e(c)}(function(e){"use strict";"undefined"!=typeof module?module.exports=e:"function"==typeof define?define([],function(){return e}):"undefined"!=typeof window?window.UriTemplate=e:global.UriTemplate=e});
