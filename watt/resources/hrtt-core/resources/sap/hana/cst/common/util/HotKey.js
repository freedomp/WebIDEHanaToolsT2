/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define({

    registerHotKey: function(shortcut, callback, target) {
        //Provide a set of default options
        var opt = {
            'type': 'keydown',
            'propagate': false // do not propagate 
        };
        if (!shortcut) {
            return;
        } else {
            shortcut = shortcut.toLowerCase();
        }
        if (!callback || !(callback instanceof Function)) {
            return;
        }
        if (!target) {
            target = document;
        }
        var element = target;
        if (typeof target === 'string') {
            element = document.getElementById(target);
        }

        var checkShorcut = function(e) {
            var character, code;
            if (!e) e = window.event;
            if (e.keyCode !== undefined) code = e.keyCode;
            else if (e.which !== undefined) code = e.which;
            character = String.fromCharCode(code).toLowerCase();
            var keys = shortcut.split("+");
            var countKeypress = 0;
            var ctrlAltShift = 0;
            var ctrlAltShiftPresses = 0;

            var unshift_nums = {
                "~": "`",
                "!": "1",
                "@": "2",
                "#": "3",
                "$": "4",
                "%": "5",
                "^": "6",
                "&": "7",
                "*": "8",
                "(": "9",
                ")": "0",
                "_": "-",
                "+": "=",
                ":": ";",
                "\"": "'",
                "<": ",",
                ">": ".",
                "?": "/",
                "|": "\\"
            };
            var special_keys = {
                'esc': 27,
                'escape': 27,
                'tab': 9,
                'space': 32,
                'return': 13,
                'enter': 13,
                'backspace': 8,

                'scrolllock': 145,
                'scroll_lock': 145,
                'scroll': 145,
                'capslock': 20,
                'caps_lock': 20,
                'caps': 20,
                'numlock': 144,
                'num_lock': 144,
                'num': 144,

                'pause': 19,
                'break': 19,

                'insert': 45,
                'home': 36,
                'delete': 46,
                'end': 35,

                'pageup': 33,
                'page_up': 33,
                'pu': 33,

                'pagedown': 34,
                'page_down': 34,
                'pd': 34,

                'left': 37,
                'up': 38,
                'right': 39,
                'down': 40,

                'f1': 112,
                'f2': 113,
                'f3': 114,
                'f4': 115,
                'f5': 116,
                'f6': 117,
                'f7': 118,
                'f8': 119,
                'f9': 120,
                'f10': 121,
                'f11': 122,
                'f12': 123
            };

            var none_char_keycode = {
                "`": 192,
                "1": 49,
                "2": 50,
                "3": 51,
                "4": 52,
                "5": 53,
                "6": 54,
                "7": 55,
                "8": 56,
                "9": 57,
                "0": 48,
                "-": 189,
                "=": 187,
                ";": 186,
                "'": 222,
                ",": 188,
                ".": 190,
                "/": 191,
                "\\": 220
            };

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];

                if (key === 'ctrl' || key === 'control') {
                    ctrlAltShift += 1;
                    if (e.ctrlKey) countKeypress++;

                } else if (key === 'shift') {
                    ctrlAltShift += 2;
                    if (e.shiftKey) countKeypress++;

                } else if (key === 'alt') {
                    ctrlAltShift += 4;
                    if (e.altKey) countKeypress++;

                } else if (key.length > 1) { //If it is a special key
                    if (special_keys[key] === code) countKeypress++;

                } else { //The special keys did not match
                    if (character === key) {
                        countKeypress++;
                    } else {
                        if (unshift_nums[key]) {
                            key = unshift_nums[key];
                        }
                        if (none_char_keycode[key] !== undefined &&
                            none_char_keycode[key] === code) {
                            countKeypress++;
                        }
                    }
                }
            }

            if (e.ctrlKey) {
                ctrlAltShiftPresses += 1;
            }
            if (e.shiftKey) {
                ctrlAltShiftPresses += 2;
            }
            if (e.altKey) {
                ctrlAltShiftPresses += 4;
            }

            if (ctrlAltShiftPresses === ctrlAltShift && countKeypress === keys.length) {
                callback(e);

                if (!opt.propagate) { //Stop the event
                    //e.cancelBubble is supported by IE - this will kill the bubbling process.
                    e.cancelBubble = true;
                    e.returnValue = false;
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }
                    e.preventDefault();
                    return false;
                }
            }
        };

        if (element instanceof sap.ui.core.Control) {
            element.attachBrowserEvent(opt.type, checkShorcut, this);
        } else if (element.addEventListener) {
            element.addEventListener(opt.type, checkShorcut, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + opt.type, checkShorcut);
        } else {
            element['on' + opt.type] = checkShorcut;
        }
    }
});