define([], function(){
    var at,     // The index of the current character
        line,
        column,
        ch,     // The current character
        escapee = {
            '"':  '"',
            '\\': '\\',
            '/':  '/',
            b:    '\b',
            f:    '\f',
            n:    '\n',
            r:    '\r',
            t:    '\t'
        },
        text,
        locatorObject = {},//addition
        keyPathRoot = "10fe580b-5954-4839-a884-1a69263e7a5c", //addition . Using generated GUID so that there is small chance that the value will exists in json documents
        autoNewLine = {chars:undefined,
                        size: undefined},
        detectNewLineSymbol = function(stext) {
            var match = stext.match(/^.*?(\r\n|\r|\n)/m);
            autoNewLine.chars = match ? match[1] : "\n";
            autoNewLine.size = autoNewLine.chars.length;
        },
        error = function (m) {

            throw {
                name:    'SyntaxError',
                message: m,
                at:      at,
                line:      line,
                column:      column,
                text:    text
            };
        },

        next = function (c) {

            if (c && c !== ch) {
                error("Expected '" + c + "' instead of '" + ch + "'");
            }

            ch = text.charAt(at);
            var nextText = text.substring(at);
            var indexOfNewLine = nextText.search(autoNewLine.chars);//addition
            if (indexOfNewLine === 0) {
                line += 1;
                column = 0;
                if (autoNewLine.size === 2 ) {
                    at = at + 2;
                } else {
                    at += 1;
                }
            } else {
                column += 1;
                at += 1;
            }
            return ch;
        },

        number = function () {

            var number,
                string = '';

            if (ch === '-') {
                string = '-';
                next('-');
            }
            while (ch >= '0' && ch <= '9') {
                string += ch;
                next();
            }
            if (ch === '.') {
                string += '.';
                while (next() && ch >= '0' && ch <= '9') {
                    string += ch;
                }
            }
            if (ch === 'e' || ch === 'E') {
                string += ch;
                next();
                if (ch === '-' || ch === '+') {
                    string += ch;
                    next();
                }
                while (ch >= '0' && ch <= '9') {
                    string += ch;
                    next();
                }
            }
            number = +string;
            if (isNaN(number)) {
                error("Bad number");
            } else {
                return number;
            }
        },

        string = function () {

            var hex,
                i,
                string = '',
                uffff;

            if (ch === '"') {
                while (next()) {
                    if (ch === '"') {
                        next();
                        return string;
                    } else if (ch === '\\') {
                        next();
                        if (ch === 'u') {
                            uffff = 0;
                            for (i = 0; i < 4; i += 1) {
                                hex = parseInt(next(), 16);
                                if (!isFinite(hex)) {
                                    break;
                                }
                                uffff = uffff * 16 + hex;
                            }
                            string += String.fromCharCode(uffff);
                        } else if (typeof escapee[ch] === 'string') {
                            string += escapee[ch];
                        } else {
                            break;
                        }
                    } else {
                        string += ch;
                    }
                }
            }
            error("Bad string");
        },

        white = function () {

            while (ch && ch <= ' ') {
                next();
            }
        },

        word = function () {

            switch (ch) {
            case 't':
                next('t');
                next('r');
                next('u');
                next('e');
                return true;
            case 'f':
                next('f');
                next('a');
                next('l');
                next('s');
                next('e');
                return false;
            case 'n':
                next('n');
                next('u');
                next('l');
                next('l');
                return null;
            }
            error("Unexpected '" + ch + "'");
        },

        value,  // Place holder for the value function.

        buildKeyLocation = function (_at, _line, _col) {
            return {"at":_at , "line":_line, "column": _col};
        },
        getKeyPath = function (keyPath, newKey) {
            var formatedNewKey = newKey;
            if ((typeof formatedNewKey === 'string') && newKey.indexOf(".") > -1) {
                formatedNewKey = '"' + formatedNewKey + '"';
            }
            if (keyPath !== keyPathRoot) {
                return keyPath + "." + formatedNewKey;
            } else {
                return formatedNewKey;
            }
        },
        
        array = function (keyPath) {

            var array = [];

            if (ch === '[') {
                next('[');
                white();
                if (ch === ']') {
                    next(']');
                    return array;   // empty array
                }
                while (ch) {
                    array.push(value(getKeyPath(keyPath, (array.length)), buildKeyLocation(at, line, column)));
                    white();
                    if (ch === ']') {
                        next(']');
                        return array;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad array");
        },

        object = function (keyPath) {

            var key,
                object = {};

            if (ch === '{') {
                next('{');
                white();
                if (ch === '}') {
                    next('}');
                    return object;   // empty object
                }
                while (ch) {
                    var keyLocation = buildKeyLocation(at, line, column);
                    key = string();
                    white();
                    next(':');
                    if (Object.hasOwnProperty.call(object, key)) {
                        error('Duplicate key "' + key + '"');
                    }
                    object[key] = value(getKeyPath(keyPath, key), keyLocation);
                    white();
                    if (ch === '}') {
                        next('}');
                        return object;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad object");
        };

    value = function (keyPath, keyLocation) {

        if (keyPath !== keyPathRoot){
            locatorObject[keyPath] = {"at": keyLocation.at, "line": keyLocation.line, "column": keyLocation.column};//addition
        }
        white();
        switch (ch) {
        case '{':
            return object(keyPath);
        case '[':
            return array(keyPath);
        case '"':
            return string();
        case '-':
            return number();
        default:
            return ch >= '0' && ch <= '9' ? number() : word();
        }
    };
    

    return function (source, callback, reviver) {
        var result;

        text = source;
        detectNewLineSymbol(text);
        at = 0;
        line = 1;
        column = 0;
        ch = ' ';
        locatorObject = {};
        white();
        result = value(keyPathRoot, buildKeyLocation(at, line, column));
        white();
        if (ch) {
            error("Syntax error");
        }
        if (callback) {
            callback(source, result, locatorObject);//addition
        }
        
        return typeof reviver === 'function' ? function walk(holder, key) {
            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }({'': result}, '') : result;
    };
});