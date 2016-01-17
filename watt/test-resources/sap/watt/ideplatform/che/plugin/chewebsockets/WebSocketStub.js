define([], function() {
	"use strict";
	
    var READYSTATE_CONNECTING = 0,
        READYSTATE_OPEN = 1,
        READYSTATE_CLOSING = 2,
        READYSTATE_CLOSED = 3;

    var WebSocketStub = function(url) {
        this.url = url;
        this.readyState = READYSTATE_CONNECTING;
        this.lastRequest = null;

        // Can't call onopen right away since it's not set yet.
        // As we don't have ant other trigger (imcomingMessage would be too late),
        // do it w/ a minimal delay.
        var socket = this;
        setTimeout(function() {
            socket.open();
        }, 10);
    };

    WebSocketStub.prototype.send = function send(message) {
        this.lastRequest = message;
    };

    WebSocketStub.prototype.open = function open() {
        if (this.readyState !== READYSTATE_OPEN && typeof(this.onopen) === "function") {
            this.readyState = READYSTATE_OPEN;
            this.onopen({});
        }
    };

    WebSocketStub.prototype.close = function close(code, reason) {
        if (typeof(this.onclose) === "function") {
            this.readyState = READYSTATE_CLOSING;
            this.onclose({code: code, reason: reason});
            this.readyState = READYSTATE_CLOSED;
        }
    };

    WebSocketStub.prototype.triggerIncomingMessage = function triggerIncomingMessage(message) {
        if (typeof(this.onmessage) === "function") {
            this.onmessage({data: message});
        }
    };

    return WebSocketStub;

});