define(function() {
    "use strict";
    return {

        _currentFocusElement: null,
        _aFocusElements: [],

        init: function() {
            this._iTabindex = -1;
        },

        configure: function(mConfig) {

        },

        setFocus: function(oService) {
            var that = this;
            return this.attachFocus(oService).then(function() {
                return that._fireFocus(oService);
            });
        },

        getFocus: function() {
            return this._currentFocusElement;
        },

        _isDialog: function(oService) {
            var that = this;
            var bIsDialog = false;
            return this._getFocusElement(oService).then(function(oFocusElem) {
                //if closed dialog is already removed from DOM we at least make the commands active again.
                if (oFocusElem.length == 0) {
                    bIsDialog = true;
                }
                that._iterateElements(oFocusElem, function(oElem) {
                    if (oElem && oElem.parentElement) {
                        if (oElem.parentElement.getAttribute("id") == "sap-ui-static") {
                            bIsDialog = true;
                        }
                    }
                });
                return bIsDialog;
            });
        },

        attachFocus: function(oService) {
            return this._getFocusElement(oService);
            // var that = this;
            // return this._getFocusElement(oService).then(function(aFocusElement) {
            //     return that._iterateElements(aFocusElement, function(oElem) {
            //         return that._attachFocus(oElem, oService);
            //     });

            //     return Q();
            // });
        },

        // _attachFocus: function(oFocusElem, oService) {
        //     var bAttachToIframe = false;
        //     var iFocusIndex = this._getElementFocusIndex(oFocusElem);
        //     if (!this._aFocusElements["index" + iFocusIndex]) {
        //         if (oFocusElem && oService) {
        //             this._iTabindex++;
        //             oFocusElem.setAttribute("tabindex", this._iTabindex);
        //             oFocusElem.setAttribute("focusindex", this._iTabindex);
        //             this._aFocusElements["index" + this._iTabindex] = oService;
        //             if (oFocusElem instanceof HTMLIFrameElement) {
        //                 if (!this._isIFrameAccesible(oFocusElem)) {
        //                     return;
        //                 }
        //                 oFocusElem = oFocusElem.contentWindow;
        //             }
        //             return oFocusElem.addEventListener("focus", jQuery.proxy(this._focusHandler, this), true);

        //         }
        //     }
        // },

        // _isIFrameAccesible: function(oIframeElement) {
        //     try {
        //         //access something which might be forbidden
        //         oIframeElement.contentWindow.addEventListener;
        //         return true;
        //     } catch (e) {
        //         return false;
        //     }
        // },

        detachFocus: function(oService) {
            var that = this;
            this._isDialog(oService).then(function(bIsDialog) {
                if (bIsDialog) {
                    that.context.event.fire$dialogClosed().done();
                }
            }).done();
            return this._getFocusElement(oService);
            // return this._getFocusElement(oService).then(function(aFocusElement) {
            //     return that._iterateElements(aFocusElement, function(oFocusElem) {
            //         if (oFocusElem) {
            //             if (oFocusElem instanceof HTMLIFrameElement) {
            //                 if (!that._isIFrameAccesible(oFocusElem)) {
            //                     return;
            //                 }
            //                 oFocusElem = oFocusElem.contentWindow;
            //             }
            //             return that._removeFocusElement(oService).then(function() {
            //                 return oFocusElem.removeEventListener("focus", jQuery.proxy(that._focusHandler, that), true);
            //             });
            //         }
            //     });
            // });
        },

        _focusHandler: function(oService) {
            var that = this;
            if (this._currentFocusElement === oService) {
                return;
            }
            this._currentFocusElement = oService;
            this.context.event.fireChanged().then(function() {
                return that._isDialog(oService);
            }).then(function(bIsDialog) {
                if (bIsDialog) {
                    return that.context.event.fire$dialogOpened();
                }
            }).done();
        },

        _fireFocus: function(oService) {
            var that = this;
            return this._getFocusElement(oService).then(function(oFocusElem) {
                if (oFocusElem) {
                    return that._iterateElements(oFocusElem, function(oElem) {
                        oElem.focus();
                        Q.delay(200).then(function() {
                            that._focusHandler(oService);
                        }).done();
                    });
                }
            });
        },

        _getElementFocusIndex: function(oFocusElem) {
            if (oFocusElem) {
                return oFocusElem.getAttribute("focusindex");
            }
        },

        _getFocusElement: function(oService) {
            var that = this;
            var oFocusElem = [];
            if (!oService) {
                return Q();
            } else if (oService.instanceOf && oService.instanceOf("sap.watt.common.service.ui.Part")) {
                return oService.getFocusElement().then(function(oElem) {
                    return that._getFocusElement(oElem);
                });
            } else {
                this._iterateElements(oService, function(oElem) {
                    var oCheckedElement = that._checkElement(oElem);
                    if (oCheckedElement) {
                        oFocusElem.push(that._checkElement(oElem));
                    }
                });
                return Q(oFocusElem);
            }
        },

        _checkElement: function(oElement) {
            var oElem;
            if (oElement.getDomRef) {
                oElem = oElement.getDomRef();
            } else if (oElement instanceof HTMLElement || oElement instanceof HTMLIFrameElement) {
                oElem = oElement;
            }
            if (oElem && oElem.id && oElem.id !== "") {
                //make sure we get the current dom reference (e.g. rerender of element)
                oElem = document.getElementById(oElem.id);
            }
            return oElem;
        },

        // _removeFocusElement: function(oService) {
        //     var that = this;
        //     return this._getFocusElement(oService).then(function(oFocusElem) {
        //         return that._iterateElements(oFocusElem, function(oElem) {
        //             var sFocusIndex = that._getElementFocusIndex(oElem);
        //             return that._aFocusElements.splice("index" + sFocusIndex, 1);
        //         });
        //     });
        // },

        _iterateElements: function(aElements, fnHandler) {
            if (Array.isArray(aElements)) {
                for (var i = 0; i < aElements.length; i++) {
                    fnHandler(aElements[i]);
                }
            } else {
                fnHandler(aElements);
            }
        }
    };
});