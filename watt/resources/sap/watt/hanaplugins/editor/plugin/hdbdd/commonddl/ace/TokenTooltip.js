define(function () {
    "use strict";

    var oDom = ace.require("ace/lib/dom");
    var oEvent = ace.require("ace/lib/event");
    var oRange = ace.require("ace/range").Range;

    var TokenTooltip = function TokenTooltip(oEditor, sTooltipText, nTooltipPositionRow, nTooltipPositionColStart, nTooltipPositionColEnd) {

        var editor = oEditor;
        var tooltipText = sTooltipText;
        var tooltipPositionRow = nTooltipPositionRow;
        var tooltipPositionColStart = nTooltipPositionColStart;
        var tooltipPositionColEnd = nTooltipPositionColEnd;

        var maxHeight;
        var maxWidth;

        var isOpen;
        var tooltipNode;
        var tooltipToken = {};
        var tokenMarker;

        var timer;
        var lastTimestamp;

        var createTooltipNode = function createTooltipNode(sTooltipText) {

            var tooltipNode = document.documentElement.appendChild(oDom.createElement("div"));
            tooltipNode.textContent = sTooltipText;

            var tooltipStyle = tooltipNode.style;

            tooltipStyle.position = "fixed";
            tooltipStyle.display = "none";
            tooltipStyle.background = "lightyellow";
            tooltipStyle.borderRadius = "";
            tooltipStyle.border = "1px solid gray";
            tooltipStyle.padding = "1px";
            tooltipStyle.zIndex = 1000;
            tooltipStyle.fontFamily = "monospace";
            tooltipStyle.whiteSpace = "pre-line";

            return tooltipNode;
        };

        var update = function update(x, y) {

            timer = null;

            var r = editor.renderer;
            if (lastTimestamp - (r.timeStamp || 0) > 1000) {
                r.rect = null;
                r.timeStamp = lastTimestamp;

                maxHeight = innerHeight;
                maxWidth = innerWidth;
            }

            var canvasPos = r.rect || (r.rect = r.scroller.getBoundingClientRect());
            var offset = (x + r.scrollLeft - canvasPos.left - r.$padding) / r.characterWidth;
            var row = Math.floor((y + r.scrollTop - canvasPos.top) / r.lineHeight);
            var col = Math.round(offset);

            var screenPos = {row: row, column: col, side: offset - col > 0 ? 1 : -1};
            var session = editor.session;
            var docPos = session.screenToDocumentPosition(screenPos.row, screenPos.column);
            var token = session.getTokenAt(docPos.row, docPos.column);

            if (!token) {
                session.removeMarker(tokenMarker);
                tooltipNode.style.display = "none";
                isOpen = false;

                return;
            }

            tooltipToken = token;

            if (!(docPos.row === tooltipPositionRow && tooltipToken.start <= tooltipPositionColStart && tooltipToken.start + tooltipToken.value.length >= tooltipPositionColEnd)) {
                session.removeMarker(tokenMarker);
                tooltipNode.style.display = "none";
                isOpen = false;

                return;
            }

            tooltipNode.style.display = "";
            isOpen = true;

            updateTooltipPosition(x, y);

            session.removeMarker(tokenMarker);

            var tooltipRange = new oRange(docPos.row, token.start, docPos.row, token.start + token.value.length);
            tokenMarker = session.addMarker(tooltipRange, "ace_bracket", "text");
        };

        var updateTooltipPosition = function updateTooltipPosition(x, y) {

            var tooltipStyle = tooltipNode.style;
            var tooltipWidth = tooltipNode.offsetWidth;
            var tooltipHeight = tooltipNode.offsetHeight;

            if (x + 10 + tooltipWidth > maxWidth) {
                x = innerWidth - tooltipWidth - 10;
            }

            if (y > innerHeight * 0.75 || y + 20 + tooltipHeight > maxHeight) {
                y = y - tooltipHeight - 30;
            }

            tooltipStyle.left = x + 10 + "px";
            tooltipStyle.top = y + 20 + "px";
        };

        var onMouseMove = function onMouseMove(event) {

            var x = event.clientX;
            var y = event.clientY;

            if (isOpen) {
                lastTimestamp = event.timeStamp;
                updateTooltipPosition(x, y);
            }

            if (!timer) {
                timer = setTimeout(update, 100, x, y);
            }
        };

        var onMouseOut = function onMouseOut(event) {

            var relatedTarget = event.relatedTarget;
            var currentTarget = event.currentTarget;

            while (relatedTarget && (relatedTarget = relatedTarget.parentNode)) {
                if (relatedTarget == currentTarget) {
                    return;
                }
            }

            tooltipNode.style.display = "none";
            editor.session.removeMarker(tokenMarker);

            if (!timer) {
                timer = clearTimeout(timer);
            }

            isOpen = false;
        };

        this.destroy = function destroy() {

            tooltipNode.style.display = "none";
            editor.session.removeMarker(tokenMarker);

            if (!timer) {
                timer = clearTimeout(timer);
            }

            isOpen = false;

            oEvent.removeListener(editor.renderer.scroller, "mousemove", onMouseMove);
            oEvent.removeListener(editor.renderer.content, "mouseout", onMouseOut);
        };

        tooltipNode = createTooltipNode(tooltipText);

        oEvent.addListener(editor.renderer.scroller, "mousemove", onMouseMove);
        oEvent.addListener(editor.renderer.content, "mouseout", onMouseOut);
    };

    return TokenTooltip;
});


