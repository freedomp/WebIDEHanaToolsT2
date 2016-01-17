"use strict";

define(function() {

    function fireBrowserEvent(sName, oEvent) {
        document.dispatchEvent ? document.dispatchEvent(oEvent) : document.fireEvent(sName, oEvent);
    }

    function createBrowserEvent() {
        return document.createEventObject ? document.createEventObject() : document.createEvent("Events");
    }

    function fireKeyBoardEventChar(sChar, bCtrlPressed, bAltPressed, bShiftPressed) {
        // must be converted to uppercase, y is 121 -> Y would be 89
        // if mousetrap listens to 'mod + y', you must listen for the Y aka 89
        sChar = sChar.toUpperCase();
        var sKeyCode = charToKeyCode(sChar);
        fireKeyBoardEventKeyCode(sKeyCode, bCtrlPressed, bAltPressed, bShiftPressed);
    }

    function fireKeyBoardEventKeyCode(sKeyCode, bCtrlPressed, bAltPressed, bShiftPressed) {
        // mousetrap listens to 'keydown'
        var oEvent = createBrowserEvent();
        if (oEvent.initEvent) {
            oEvent.initEvent("keydown", true, true);
        }

        oEvent.keyCode = sKeyCode;
        oEvent.which = sKeyCode;

        oEvent.ctrlKey = Boolean(bCtrlPressed);
        oEvent.altKey = Boolean(bAltPressed);
        oEvent.shiftKey = Boolean(bShiftPressed);

        fireBrowserEvent("onkeydown", oEvent);
    }

    function charToKeyCode(sChar) {
        return sChar.charCodeAt(0);
    }
    
    return {
        fireKeyBoardEventChar: fireKeyBoardEventChar,
        fireKeyBoardEventKeyCode: fireKeyBoardEventKeyCode
    };
});