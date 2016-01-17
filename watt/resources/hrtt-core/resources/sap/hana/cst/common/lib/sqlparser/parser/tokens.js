/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*global define*/
/*eslint-disable complexity, max-statements, max-depth, no-labels, quotes, max-params*/
define(function() {
	"use strict";

	var Lexer,
		// supported multi-character operators
		prefix = "=<>!|:.",
		combined = ["!=", "<>", ">=", "<=", "=>", "||", ":=", ".."];

	function unquote(str) {
		if (str && str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
			str = str.substr(1, str.length - 2);
		}
		return str;
	}

	function makeToken(type, value, from, to, prefixLength) {
		var token = {
			type: type,
			value: value,
			fromPos: from - prefixLength,
			toPos: to - prefixLength
		};
		if (type === "name") {
			token.identifier = value.toUpperCase();
		} else if (type === "qname") {
			token.identifier = unquote(value);
		}
		return token;
	}

	function makeError(value, msg, from, to, prefixLength) {
		var tok = makeToken("(error)", value, from, to, prefixLength);
		tok.msg = msg;
		return tok;
	}

	Lexer = function(tokens, length, prefixLength) {
		this.tokens = tokens;
		this.index = 0;
		this.end = makeToken('(end)', undefined, length, length, prefixLength);
	};
	Lexer.prototype.token = function() {
		if (this.index >= this.tokens.length) {
			return this.end;
		}
		return this.tokens[this.index++];
	};

	return function(args) {
		var src = (args.prefix || "") + (args.src || ""),
			c, // current character
			c1, // lookahead 1
			from, // index of the start of the token
			i, // index of the current character (c)
			length = typeof src === "string" ? src.length : 0, // length 
			q, // quote character value
			str, // string literal value
			tokens = [], // result
			isError,
			typedStringConst,
			tok,
			prefixLength = args.prefix ? args.prefix.length : 0;

		if (length <= 0) {
			return new Lexer(tokens, 0, prefixLength);
		}

		i = 0;
		c = src.charAt(i);
		main: while (c) {
			from = i;

			// whitespace
			if (c <= ' ') {
				if (args.includeWS) {
					str = c;
					for (;;) {
						c = src.charAt(++i);
						if (!c || c > ' ') {
							break;
						}
						str += c;
					}
					tokens.push(makeToken('space', str, from, i, prefixLength));
				} else {
					c = src.charAt(++i);
				}
				continue;
			}

			c1 = src.charAt(i + 1);
			// comment
			if (c === '-' && c1 === '-') {
				i++;
				str = "";
				for (;;) {
					c = src.charAt(++i);
					if (!c || c === '\n' || c === '\r') {
						break;
					}
					str += c;
				}
				if (args.includeWS) {
					tokens.push(makeToken('comment', str, from, i, prefixLength));
				}
				c = src.charAt(i);
				continue;
			}

			// multi-line comment
			if (c === '/' && c1 === '*') {
				str = "";
				i++;
				for (;;) {
					c = src.charAt(++i);
					if (!c) {
						tokens.push(makeError(str, "unterminated_mlcomment", from, i, prefixLength));
						break main;
					}
					if (c === '*' && src.charAt(i + 1) === '/') {
						i += 2;
						break;
					}
					str += c;
				}
				if (args.includeWS) {
					tokens.push(makeToken('mlcomment', str, from, i, prefixLength));
				}
				c = src.charAt(i);
				continue;
			}

			// name
			if (((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_')) {

				// determine if typed string constant
				if (c1 === '\'' && (c === 'N' || c === 'n' || c === 'X' || c === 'x')) {
					typedStringConst = c.toUpperCase();
				} else if (src.charAt(i + 4) === '\'' &&
					((c === 'd' || c === 'D') && (c1 === 'a' || c1 === 'A') ||
						(c === 't' || c === 'T') && (c1 === 'i' || c1 === 'I'))) {
					typedStringConst = src.substr(i, 4).toUpperCase();
					if (typedStringConst !== "DATE" && typedStringConst !== "TIME") {
						typedStringConst = undefined;
					}
				} else if (src.charAt(i + 9) === '\'' && (c === 't' || c === 'T') && (c1 === 'i' || c1 === 'I')) {
					typedStringConst = src.substr(i, 9).toUpperCase();
					if (typedStringConst !== "TIMESTAMP") {
						typedStringConst = undefined;
					}
				} else {
					typedStringConst = undefined;

					str = c;
					i += 1;
					for (;;) {
						c = src.charAt(i);
						if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') ||
							c === '_' || c === '#' || c === '$') {
							str += c;
							i += 1;
						} else {
							break;
						}
					}
					tokens.push(makeToken('name', str, from, i, prefixLength));
					continue;

				}
			}

			// variable reference, :: is a system variable like ::ROWCOUNT
			if (c === ':' && ((c1 >= 'a' && c1 <= 'z') || (c1 >= 'A' && c1 <= 'Z') || c1 === '_' || c1 === ':')) {
				str = c;
				i += 1;
				for (;;) {
					c = src.charAt(i);
					if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') ||
						c === '_' || c === '#' || c === '$' || (c === ':' && str.length === 1)) {
						str += c;
						i += 1;
					} else {
						break;
					}

				}
				tokens.push(makeToken('varref', str, from, i, prefixLength));
				continue;
			}

			// hex number
			if (c === '0' && (c1 === 'x' || c1 === 'X')) {
				str = c + c1;
				i += 2;

				// more digits?
				for (;;) {
					c = src.charAt(i);

					if ((c < '0' || c > '9') && (c < 'a' || c > 'f') && (c < 'A' || c > 'F')) {
						break;
					}
					i += 1;
					str += c;
				}

				if (str.length > 2) {
					tok = makeToken('number', str, from, i, prefixLength);
					tok.number = parseInt(str, 16);
					tokens.push(tok);
				} else {
					tokens.push(makeError(str, "bad_number", from, i, prefixLength));
				}
				continue;
			}

			// number - can start with either a digit: 0.01, or: .01
			if (c >= '0' && c <= '9' ||
				c === '.' && (c1 >= '0' && c1 <= '9')
				/*||
                (c === '+' || c === '-') && (c1 === '.' || (c1 >= '0' && c1 <= '9' && src.charAt(i + 2).toLowerCase() !== 'x')) */
			) {
				// need a lookahead of 2 to distinguish +0x1 from +0.1
				if (c !== '.') {
					str = c;
					i += 1;
				} else {
					str = "";
				}

				// more digits?
				if (c !== '.') {
					for (;;) {
						c = src.charAt(i);
						if (c < '0' || c > '9') {
							break;
						}
						i += 1;
						str += c;
					}
				}

				// contains a decimal fraction part?
				// 2 special cases in FOR:
				// 1..10 will be parsed as 1 TO 10
				// 1...10 will be parsed as 1. TO 10
				// 1 ...10 will be parsed as 1 TO .10
				// 1....10 is not allowed, will be parsed as 1 TO TO 10
				if (c === '.' && (src.charAt(i + 1) !== '.' || (src.charAt(i + 1) === '.' && src.charAt(i + 2) === '.' && src.charAt(i + 3) !== '.'))) {
					i += 1;
					str += c;
					for (;;) {
						c = src.charAt(i);
						if (c < '0' || c > '9') {
							break;
						}
						i += 1;
						str += c;
					}
				}

				// exponent part?
				isError = false;
				if (c === 'e' || c === 'E') {
					i += 1;
					str += c;
					c = src.charAt(i);
					if (c === '-' || c === '+') {
						i += 1;
						str += c;
						c = src.charAt(i);
					}
					if (c < '0' || c > '9') {
						tokens.push(makeError(str, "bad_exponent", from, i, prefixLength));
						isError = true;
					} else {
						do {
							i += 1;
							str += c;
							c = src.charAt(i);
						} while (c >= '0' && c <= '9');
					}
				}

				if (!isError) {
					// make sure the number is not followed by a name (qname is allowed)
					if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_') {
						tokens.push(makeError(str, "bad_number", from, i, prefixLength));
					} else {
						tok = makeToken('number', str, from, i, prefixLength);
						tok.number = parseFloat(str);
						tokens.push(tok);
					}
				}
				continue;
			}

			// quoted name
			if (c === '"') {
				str = '';
				q = c;
				i += 1;
				for (;;) {
					c = src.charAt(i);
					if (!c) {
						tokens.push(makeError(str, "unterminated_qname", from, i, prefixLength));
						break main;
					}

					// closing quote?
					if (c === q) {
						// escape?
						if (src.charAt(i + 1) === q) {
							str += c;
							i += 1;
							c = src.charAt(i);
						} else {
							break;
						}
					}
					str += c;
					i += 1;
				}
				i += 1;
				if (str.length > 0) {
					tokens.push(makeToken('qname', '"' + str + '"', from, i, prefixLength));
				} else {
					tokens.push(makeError(str, "empty_qname", from, i, prefixLength));
				}
				c = src.charAt(i);
				continue;
			}

			// string
			if (c === '\'' || typedStringConst) {
				if (typedStringConst) {
					// unicode string
					i += typedStringConst.length;
					c = c = src.charAt(i);
					typedStringConst = undefined;
				}
				str = '';
				q = c;
				i += 1;
				for (;;) {
					c = src.charAt(i);

					if (!c) {
						tokens.push(makeError(str, "unterminated_string", from, i, prefixLength));
						break main;
					}

					// closing quote?
					if (c === q) {
						// escape?
						if (src.charAt(i + 1) === q) {
							str += c;
							i += 1;
							c = src.charAt(i);
						} else {
							break;
						}
					}
					str += c;
					i += 1;

				}
				i += 1;
				tokens.push(makeToken('string', str, from, i, prefixLength));
				c = src.charAt(i);
				continue;
			}

			// combined operator
			if (prefix.indexOf(c) >= 0) {
				str = c;
				i += 1;
				if (combined.indexOf(c + c1) >= 0) {
					str += c1;
					i += 1;
				}
				tokens.push(makeToken('operator', str, from, i, prefixLength));
				c = src.charAt(i);
				continue;
			}

			// single-character operator
			i += 1;
			tokens.push(makeToken('operator', c, from, i, prefixLength));
			c = src.charAt(i);
		}

		return new Lexer(tokens, length, prefixLength);
	};

});