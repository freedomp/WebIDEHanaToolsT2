/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
jQuery.sap.require("sap.ui.core.Popup");

sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast = {};
sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast._OFFSET = "0 -64";
sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast._CSSCLASS = "calculationViewMessageToast";
sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast._mSettings = {
    duration: 6000,
    width: "25em",
    my: "right top",
    at: "right top",
    of: document.defaultView,
    offset: "0 0",
    collision: "fit fit",
    autoClose: true,
    animationTimingFunction: "ease",
    animationDuration: 1000
};

sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast._hasDefaulPosition = function(o) {
    for (var p = ["my", "at", "of", "offset"], i = 0; i < p.length; i++) {
        if (o[p[i]] !== undefined) {
            return false;
        }
    }
    return true;
};
sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast._createHTMLMarkup = function(s) {
    var m = document.createElement("div");
    m.style.width = s.width;
    m.className = sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast._CSSCLASS;
    m.appendChild(document.createTextNode(s.message));
    return m;
};

sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast._normalizeOptions = function(o) {
    if (o) {
        if (this._hasDefaulPosition(o)) {
            o.offset = this._OFFSET;
        }
        if (o.of && o.of.nodeType === 9) {
            o.of = document.defaultView;
        }
    } else {
        o = {
            offset: this._OFFSET
        };
    }
    return o;
};

sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast._setCloseAnimation = function(m, d, c, s) {
    var C = "opacity " + s.animationTimingFunction + " " + s.animationDuration + "ms",
        t = "webkitTransitionEnd." + sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast._CSSCLASS + " transitionend." + sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast._CSSCLASS;
    if (s.animationDuration > 0) {
        m[0].style.webkitTransition = C;
        m[0].style.transition = C;
        m[0].style.opacity = 0;
        m.on(t, function handleMTTransitionEnd() {
            m.off(t);
            //  c();   While closing the toaster , it is called to focus out of existing automatically
        });
    } else {
        c();
    }
};

sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show = function(m, o) {
    var s = this,
        S = jQuery.extend({}, this._mSettings, {
            message: m
        }),
        p = new sap.ui.core.Popup(),
        M;
    o = this._normalizeOptions(o);
    jQuery.extend(S, o);
    M = this._createHTMLMarkup(S);
    p.setContent(M);
    p.setPosition(S.my, S.at, S.of, S.offset, S.collision);

    if (jQuery.support.cssTransitions) {
        p.setAnimations(function fnMessageToastOpen($, d, O) {
            O();
        }, function fnMessageToastClose($, d, c) {
            s._setCloseAnimation($, d, c, S);
        });
    }
    p.setShadow(false);
    p.setAutoClose(S.autoClose);

    p.open();

    jQuery.sap.delayedCall(S.duration, p, "close");
};
