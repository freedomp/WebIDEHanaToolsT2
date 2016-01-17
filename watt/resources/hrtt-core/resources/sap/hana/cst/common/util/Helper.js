/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

(function() {

    //====================================
    // Please do not convert every thing into Helper, 
    // so please consider if your stuff could be plugin-based mechanism first
    // try to keep common helper methods as simple and little as possible
    //====================================
    if (typeof window.sap !== "object" && typeof window.sap !== "function") {
        window.sap = {};
    }

    if (typeof window.sap.hana !== "object") {
        window.sap.hana = {};
    }

    if (typeof window.sap.hana.cst !== "object") {
        window.sap.hana.cst = {};
    }

    if (typeof window.sap.hana.cst.log !== "object") {
        window.sap.hana.cst.log = {};
    }

    //====================================
    // Global helper methods
    //====================================
    sap.hana.cst.getURLParameter = function(name) {
        // return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
        return decodeURIComponent((new RegExp('[\?&]' + name + '=([^&#]*)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
    };

    sap.hana.cst.isEmptyObject = function(obj) {
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                return false;
            }
        }
        return true;
    };

    //====================================
    // show/hide indicator as a temporary solution while waiting for a watt plugin
    //====================================
    sap.hana.cst.showSpinner = function(sContainerId) {
        // sap.ui.core.BusyIndicator.show();

        // default is modal
        // if (modalFlag === undefined || modalFlag === null) {
        //     modalFlag = true;
        // }
        if (!sContainerId) {
            if ($('#waitSpinner').length === 0) {
                $('<div id="waitSpinner"><center><img id="img-spiner" src="/sap/hana/cst/common/images/spinner.gif" style="margin-top:6px;padding-top:6px"></center></div>').dialog({
                    dialogClass: 'spinnerClass',
                    height: 100,
                    width: 200,
                    modal: true,
                    resizable: false
                });
                $(".spinnerClass").css("top", "50%");
                $(".spinnerClass").css("position", "absolute");
                // $(".spinnerClass").css("z-index", "9999998"); 
                // $("div.ui-widget-overlay").css("z-index", "9999999");
                $(".spinnerClass > .ui-dialog-titlebar").remove();
                $('#waitSpinner').css("height", "60px");

                $("#img-spiner").css("z-index", "99999999"); //highest
                $("#img-spiner").click(function(e) {
                    sap.hana.cst.hideSpinner();
                });
                $("#img-spiner").attr("title", "Click here to close.");
            }
        } else {
            var $Cont = jQuery.sap.byId(sContainerId);
            var $Spinner = $('<div id="waitSpinner"><center><img src="/sap/hana/cst/common/images/spinner.gif" style="margin-top:6px;padding-top:6px"></center></div>');
            $Cont.append($Spinner);
            var jqSpinnerCont = jQuery.sap.byId("waitSpinner");
            jqSpinnerCont.css("z-index", "9999998");
            jqSpinnerCont.css("position", "absolute");
            jqSpinnerCont.css("top", "45%");
            jqSpinnerCont.css("left", "45%");
            jqSpinnerCont.css("height", "60px");
            jqSpinnerCont.css("width", "200px");
            // jqSpinnerCont.css("border-radius", "20px 20px 20px 20px");
            // jqSpinnerCont.css("-moz-border-radius", "20px 20px 20px 20px");
            // jqSpinnerCont.css("-webkit-border-radius", "20px 20px 20px 20px");
            jqSpinnerCont.css("border", "1px dotted #000000");
            jqSpinnerCont.css("background-color", "white");

            var $OverlayCont = $('<div id="waitSpinner-overlay"></div>');
            $Cont.append($OverlayCont);
            var jqOverlayCont = jQuery.sap.byId("waitSpinner-overlay");
            jqOverlayCont.css("z-index", "9999999");
            jqOverlayCont.css("position", "absolute");
            jqOverlayCont.css("top", "0px");
            jqOverlayCont.css("bottom", "0px");
            jqOverlayCont.css("right", "0px");
            jqOverlayCont.css("left", "0px");
            // jqOverlayCont.css("background-color", "#000000");
            // jqOverlayCont.css("opacity","0.6");
            jqOverlayCont.css("background-color", "gray");
            jqOverlayCont.css("opacity", "0.2");
        }

        return false;
    };

    sap.hana.cst.hideSpinner = function() {
        // sap.ui.core.BusyIndicator.hide();
        $('#waitSpinner').remove();
        $('#waitSpinner-overlay').remove();
        return false;
    };

    sap.hana.cst.showInnerSpinner = function(sContainerId) {
        if (!sContainerId) {
            sap.hana.cst.showSpinner();
            return false;
        }
        var $Cont = jQuery.sap.byId(sContainerId);
        var $Spinner = $('<div id="waitSpinner"><center><img src="/sap/hana/cst/common/images/spinner.gif" style="margin-top:6px;padding-top:6px"></center></div>');
        $Cont.append($Spinner);
        var jqSpinnerCont = jQuery.sap.byId("waitSpinner");
        jqSpinnerCont.css("z-index", "9999998");
        jqSpinnerCont.css("position", "absolute");
        jqSpinnerCont.css("top", "45%");
        jqSpinnerCont.css("left", "45%");
        jqSpinnerCont.css("height", "60px");
        jqSpinnerCont.css("width", "200px");
        // jqSpinnerCont.css("border-radius", "20px 20px 20px 20px");
        // jqSpinnerCont.css("-moz-border-radius", "20px 20px 20px 20px");
        // jqSpinnerCont.css("-webkit-border-radius", "20px 20px 20px 20px");
        jqSpinnerCont.css("border", "1px dotted #000000");
        jqSpinnerCont.css("background-color", "white");

        var $OverlayCont = $('<div id="waitSpinner-overlay"></div>');
        $Cont.append($OverlayCont);
        var jqOverlayCont = jQuery.sap.byId("waitSpinner-overlay");
        jqOverlayCont.css("z-index", "9999999");
        jqOverlayCont.css("position", "absolute");
        jqOverlayCont.css("top", "0px");
        jqOverlayCont.css("bottom", "0px");
        jqOverlayCont.css("right", "0px");
        jqOverlayCont.css("left", "0px");
        // jqOverlayCont.css("background-color", "#000000");
        // jqOverlayCont.css("opacity","0.6");
        jqOverlayCont.css("background-color", "gray");
        jqOverlayCont.css("opacity", "0.2");
        return false;
    };

    sap.hana.cst.ab2str = function(buf) {
        try {
            return String.fromCharCode.apply(null, new Uint8Array(buf));
        } catch (loError) {
            if (loError.name && loError.name === 'RangeError') {
                var longString = "";
                var byteArray = new Uint8Array(buf);
                for (var i = 0; i < byteArray.byteLength; i++) {
                    longString += String.fromCharCode(byteArray[i]);
                }
                return longString;
            }
        }
        return null;
    };

    sap.hana.cst.debug = function() {
        if (sap.watt.getEnv("debugMode")) {
            window.console.debug.call(console, arguments);
        }
    };

    sap.hana.cst.getVersion = function() {
        if (sap.watt.getEnv("version")) {
            return sap.watt.getEnv("version");
        }
        return "";
    };

    /*
     * For HTML 4, ID and NAME tokens must:
     * begin with a letter ([A-Za-z]) and
     * may be followed by any number of letters,
     * digits ([0-9]),
     * hyphens ("-"),
     * underscores ("_"),
     * colons (":"),
     * and periods (".").
     */
    sap.hana.cst.isValidHtmlId = function(sValue) {
        var regExp = new RegExp("^[a-zA-Z](\w|\:|\.|\-)*$", "gi");
        return regExp.test(sValue);
    };

    sap.hana.cst.escapeHTML = function(isHtmlString) {
        var oDummyDiv = $('<div></div>').text(isHtmlString);
        var sEscapedString = $(oDummyDiv).html();
        return sEscapedString.replace(/\&lt\;br\/&gt\;/g, '<br>').replace(/\n/g, '<br>').replace(/\&lt\;br&gt\;/g, '<br>');
    };

    sap.hana.cst.escapeXSS = function(param) {
        if (!param) {
            return param;
        }
        return param.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/\'/g, "&#x27;")
            .replace(/\//g, "&#x2F;");
    };

    sap.hana.cst.sanitizeHtmlId = function(sValue) {
        if (!sap.hana.cst.isValidHtmlId(sValue)) {
            sValue = sValue.replace(/[^\w\:\-\.]/g, "_");
            sValue = sValue.replace(/{|}/g, "_");
            return sValue;
        } else {
            return sValue;
        }
    };

    sap.hana.cst.isEditorApp = function() {
        var EDITOR_URL = "/sap/hana/cst/editor";
        return (window.location.pathname.substr(0, EDITOR_URL.length) === EDITOR_URL);
    };

    sap.hana.cst.isCatalogApp = function() {
        var CATALOG_URL = "/sap/hana/cst/catalog";
        return (window.location.pathname.substr(0, CATALOG_URL.length) === CATALOG_URL);
    };

    sap.hana.cst.createSplitbutton = function(aMenuItems, oDefaultButton) {
        var oMenuButton = new sap.ui.commons.MenuButton();
        var oMenu = new sap.ui.commons.Menu({
            items: aMenuItems
        });
        var _attachSplitButtonEvents = function(oMenuButton, oButton) {
            oButton.addStyleClass("sapHWIMenuButtonSplitMaster");
            oButton.attachBrowserEvent("mouseover", function(oEvent) {
                this.addStyleClass("sapHWISplitbutton");
                oMenuButton.addStyleClass("sapHWISplitbutton");
            });
            oButton.attachBrowserEvent("mouseout", function(oEvent) {
                this.removeStyleClass("sapHWISplitbutton");
                oMenuButton.removeStyleClass("sapHWISplitbutton");
            });
            oMenuButton.attachBrowserEvent("mouseover", function(oEvent) {
                this.addStyleClass("sapHWISplitbutton");
                oButton.addStyleClass("sapHWISplitbutton");
            });
            oMenuButton.attachBrowserEvent("mouseout", function(oEvent) {
                this.removeStyleClass("sapHWISplitbutton");
                oButton.removeStyleClass("sapHWISplitbutton");
            });
        };


        oMenuButton.addStyleClass("sapHWIMenuButtonSplit");
        oMenu.addStyleClass("sapWattContextMenu");

        oMenuButton.setMenu(oMenu);

        _attachSplitButtonEvents(oMenuButton, oDefaultButton);
        var oSegmentedButton = new sap.ui.commons.SegmentedButton();
        var removeSeleted = function() {
            var oThat = this;
            setTimeout(function() {
                oThat.removeStyleClass("sapUiSegButtonSelected");
            }, 1000);

        };
        oDefaultButton.attachPress(removeSeleted);
        oMenuButton.attachPress(removeSeleted);
        oSegmentedButton.addButton(oDefaultButton);
        oSegmentedButton.addButton(oMenuButton);
        return oSegmentedButton;
    };
}());